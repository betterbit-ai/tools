import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Notice, Panel, Segmented, Stat, cx } from '../../components/ui';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  ALL_CODES,
  classifyRollover,
  coveragePercent,
  detectChatter,
  formatHeldSeconds,
  isBoardCode,
  isLikelyStuck,
  keyLabel,
  MAIN_ROWS,
  modifierLabel,
  NAVIGATION_ROWS,
  SYSTEM_ROWS,
  type KeyTransition,
  type LayoutId,
} from './logic';

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, details, summary, [contenteditable], [tabindex]';
const STUCK_THRESHOLD_MS = 5000;

export default function KeyboardTester({ ui }: ToolProps<UI>) {
  const [layout, setLayout] = useState<LayoutId>('en');
  const [isMac, setIsMac] = useState(false);
  const [supportsPhysicalCodes, setSupportsPhysicalCodes] = useState(true);
  const [held, setHeld] = useState<Record<string, number>>({});
  const [tested, setTested] = useState<Set<string>>(new Set());
  const [maxSimultaneous, setMaxSimultaneous] = useState(0);
  const [lastKey, setLastKey] = useState<{ code: string; key: string } | null>(null);
  const [chattering, setChattering] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const eventsRef = useRef<KeyTransition[]>([]);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    setSupportsPhysicalCodes('KeyboardEvent' in window && 'code' in KeyboardEvent.prototype);
  }, []);

  useEffect(() => {
    if (Object.keys(held).length === 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [held]);

  const markTested = useCallback((code: string) => {
    setTested((current) => (current.has(code) ? current : new Set(current).add(code)));
  }, []);

  useEffect(() => {
    const isInteractive = (target: EventTarget | null) =>
      target instanceof HTMLElement && !!target.closest(INTERACTIVE_SELECTOR);
    const isTestArea = (target: EventTarget | null) =>
      target instanceof HTMLElement && !!target.closest('[data-keyboard-test-area]');

    const clearHeld = () => {
      eventsRef.current = [];
      setHeld({});
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!supportsPhysicalCodes) return;
      if (isInteractive(event.target) && !isTestArea(event.target)) return;
      if (!isBoardCode(event.code)) return;
      if (event.code !== 'Tab' && !event.metaKey && !event.ctrlKey && !event.altKey) event.preventDefault();
      if (event.repeat) return;

      const time = Date.now();
      setLastKey({ code: event.code, key: event.key });
      markTested(event.code);
      eventsRef.current = [...eventsRef.current.slice(-199), { code: event.code, type: 'down', t: time }];
      const detected = detectChatter(eventsRef.current);
      if (detected.length > 0) {
        setChattering((current) => [...new Set([...current, ...detected])]);
      }
      setHeld((current) => {
        if (event.code in current) return current;
        const next = { ...current, [event.code]: time };
        setMaxSimultaneous((max) => Math.max(max, Object.keys(next).length));
        return next;
      });
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!supportsPhysicalCodes) return;
      if (!isBoardCode(event.code)) return;
      eventsRef.current = [...eventsRef.current.slice(-199), { code: event.code, type: 'up', t: Date.now() }];
      setHeld((current) => {
        if (!(event.code in current)) return current;
        const next = { ...current };
        delete next[event.code];
        return next;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeld);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeld);
    };
  }, [markTested, supportsPhysicalCodes]);

  const reset = useCallback(() => {
    eventsRef.current = [];
    setTested(new Set());
    setHeld({});
    setMaxSimultaneous(0);
    setLastKey(null);
    setChattering([]);
  }, []);

  const heldCodes = Object.keys(held);
  const stuckCodes = heldCodes.filter((code) => isLikelyStuck(now - held[code], STUCK_THRESHOLD_MS));
  const rollover = classifyRollover(maxSimultaneous);
  const rolloverText =
    rollover === 'high' ? ui.rolloverHigh : rollover === 'partial' ? ui.rolloverPartial : ui.rolloverSingle;
  const coverage = coveragePercent(tested.size, ALL_CODES.length);

  const keyState = (code: string): 'stuck' | 'chatter' | 'held' | 'tested' | 'idle' => {
    if (stuckCodes.includes(code)) return 'stuck';
    if (chattering.includes(code)) return 'chatter';
    if (code in held) return 'held';
    if (tested.has(code)) return 'tested';
    return 'idle';
  };

  const keyClass = (state: ReturnType<typeof keyState>) =>
    cx(
      'flex h-9 min-w-7 flex-1 select-none items-center justify-center rounded-md border text-[11px] font-medium leading-none transition-colors sm:h-10 sm:text-xs',
      state === 'idle' && 'border-line bg-surface-2 text-muted',
      state === 'tested' && 'border-accent bg-surface-2 text-fg',
      state === 'held' && 'border-accent bg-accent text-on-accent shadow-card',
      state === 'chatter' && 'border-danger bg-danger-soft text-danger',
      state === 'stuck' && 'border-danger bg-danger text-on-accent animate-pulse',
    );

  const renderKeyLabel = (code: string) => modifierLabel(code, isMac) ?? keyLabel(layout, code);
  const renderKey = (code: string, weight = 1) => (
    <div key={code} style={{ flexGrow: weight }} class={keyClass(keyState(code))} title={code} aria-hidden="true">
      {renderKeyLabel(code)}
    </div>
  );
  const renderNumpadKey = (code: string, className?: string) => (
    <div key={code} class={cx(keyClass(keyState(code)), className)} title={code} aria-hidden="true">
      {renderKeyLabel(code)}
    </div>
  );

  return (
    <Panel>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <Segmented
          label={ui.layout}
          value={layout}
          onValue={setLayout}
          options={[
            { value: 'en', label: ui.layoutEn },
            { value: 'ko', label: ui.layoutKo },
          ]}
        />
        <Button onClick={reset}>{ui.reset}</Button>
      </div>

      {!supportsPhysicalCodes && (
        <div class="mt-4">
          <Notice tone="danger">{ui.unsupportedWarning}</Notice>
        </div>
      )}

      <p id="keyboard-test-focus-hint" class="mt-4 text-sm text-muted">
        {ui.focusHint}
      </p>
      <div
        role="group"
        aria-label={ui.testAreaLabel}
        aria-describedby="keyboard-test-focus-hint"
        aria-disabled={!supportsPhysicalCodes}
        tabIndex={supportsPhysicalCodes ? 0 : -1}
        data-keyboard-test-area
        class="mt-2 overflow-x-auto rounded-lg border border-line bg-surface p-3 focus-visible:border-accent sm:p-4"
      >
        <div class="grid min-w-[980px] grid-cols-[minmax(0,1fr)_15rem] gap-3">
          <div class="flex flex-col gap-1.5">
            {MAIN_ROWS.map((r, i) => (
              <div key={i} class="flex gap-1.5">
                {r.map((k) => renderKey(k.code, k.weight))}
              </div>
            ))}
            <div class="mt-1 grid w-28 grid-cols-3 gap-1.5 self-end">
              <div />
              <div class={cx(keyClass(keyState('ArrowUp')), 'col-start-2')} aria-hidden="true">
                {renderKeyLabel('ArrowUp')}
              </div>
              <div />
              {['ArrowLeft', 'ArrowDown', 'ArrowRight'].map((code) => (
                <div key={code} class={keyClass(keyState(code))} aria-hidden="true">
                  {renderKeyLabel(code)}
                </div>
              ))}
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <div class="grid grid-cols-3 gap-1.5">
              {SYSTEM_ROWS.flat().map((key) => renderKey(key.code, key.weight))}
            </div>
            <div class="grid grid-cols-3 gap-1.5">
              {NAVIGATION_ROWS.flat().map((key) => renderKey(key.code, key.weight))}
            </div>
            <div class="grid grid-cols-4 grid-rows-5 gap-1.5">
              {renderNumpadKey('NumLock')}
              {renderNumpadKey('NumpadDivide')}
              {renderNumpadKey('NumpadMultiply')}
              {renderNumpadKey('NumpadSubtract')}
              {renderNumpadKey('Numpad7')}
              {renderNumpadKey('Numpad8')}
              {renderNumpadKey('Numpad9')}
              {renderNumpadKey('NumpadAdd', 'row-span-2')}
              {renderNumpadKey('Numpad4')}
              {renderNumpadKey('Numpad5')}
              {renderNumpadKey('Numpad6')}
              {renderNumpadKey('Numpad1')}
              {renderNumpadKey('Numpad2')}
              {renderNumpadKey('Numpad3')}
              {renderNumpadKey('NumpadEnter', 'row-span-2')}
              {renderNumpadKey('Numpad0', 'col-span-2')}
              {renderNumpadKey('NumpadDecimal')}
            </div>
          </div>
        </div>
        <p class="sr-only">{ui.visualHidden}</p>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
        <Stat label={ui.currentlyHeld} value={heldCodes.length} emphasis />
        <Stat label={ui.maxSimultaneous} value={maxSimultaneous} />
        <Stat label={ui.coverage} value={`${coverage}% (${tested.size}/${ALL_CODES.length})`} />
        <Stat
          label={ui.lastKey}
          value={lastKey ? `${lastKey.key === ' ' ? ui.spaceKeyLabel : lastKey.key} · ${lastKey.code}` : ui.none}
        />
      </div>

      <div class="mt-3">
        <Notice tone={rollover === 'high' ? 'success' : 'info'}>{rolloverText}</Notice>
      </div>

      {chattering.length > 0 && (
        <div class="mt-3">
          <Notice tone="danger">
            {ui.chatterWarning.replace('{keys}', chattering.map((c) => keyLabel(layout, c)).join(', '))}
          </Notice>
        </div>
      )}

      {stuckCodes.length > 0 && (
        <div class="mt-3">
          <Notice tone="danger">
            {ui.stuckWarning.replace(
              '{keys}',
              stuckCodes.map((c) => `${keyLabel(layout, c)} (${formatHeldSeconds(now - held[c])})`).join(', '),
            )}
          </Notice>
        </div>
      )}

      <p class="mt-4 text-xs text-subtle">{ui.privacyHint}</p>
    </Panel>
  );
}

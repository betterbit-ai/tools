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
  isLikelyStuck,
  keyLabel,
  MAIN_ROWS,
  modifierLabel,
  type KeyTransition,
  type LayoutId,
} from './logic';

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, details, summary, [contenteditable], [tabindex]';
const STUCK_THRESHOLD_MS = 5000;

export default function KeyboardTester({ ui }: ToolProps<UI>) {
  const [layout, setLayout] = useState<LayoutId>('en');
  const [isMac, setIsMac] = useState(false);
  const [held, setHeld] = useState<Record<string, number>>({});
  const [tested, setTested] = useState<Set<string>>(new Set());
  const [maxSimultaneous, setMaxSimultaneous] = useState(0);
  const [lastKey, setLastKey] = useState<{ code: string; key: string } | null>(null);
  const [chattering, setChattering] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const eventsRef = useRef<KeyTransition[]>([]);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (isInteractive(event.target)) return;
      if (event.code !== 'Tab' && !event.metaKey && !event.ctrlKey && !event.altKey) event.preventDefault();
      if (event.repeat) return;

      setLastKey({ code: event.code, key: event.key });
      if (ALL_CODES.includes(event.code)) markTested(event.code);
      eventsRef.current = [...eventsRef.current.slice(-199), { code: event.code, type: 'down', t: Date.now() }];
      setChattering(detectChatter(eventsRef.current));
      setHeld((current) => {
        if (event.code in current) return current;
        const next = { ...current, [event.code]: Date.now() };
        setMaxSimultaneous((max) => Math.max(max, Object.keys(next).length));
        return next;
      });
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isInteractive(event.target)) return;
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
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [markTested]);

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
    rollover === 'full' ? ui.rolloverFull : rollover === 'partial' ? ui.rolloverPartial : ui.rolloverSingle;
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

      <div class="mt-5 overflow-x-auto rounded-lg border border-line bg-surface p-3 sm:p-4">
        <div class="flex min-w-[720px] flex-col gap-1.5">
          {MAIN_ROWS.map((r, i) => (
            <div key={i} class="flex gap-1.5">
              {r.map((k) => (
                <div
                  key={k.code}
                  style={{ flexGrow: k.weight }}
                  class={keyClass(keyState(k.code))}
                  title={k.code}
                  aria-hidden="true"
                >
                  {renderKeyLabel(k.code)}
                </div>
              ))}
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
        <Notice tone={rollover === 'full' ? 'success' : 'info'}>{rolloverText}</Notice>
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

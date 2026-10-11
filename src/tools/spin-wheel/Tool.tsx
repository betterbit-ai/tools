import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Stat, Textarea, Toggle, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_ENTRIES,
  parseEntries,
  pickEntry,
  removeEntryAt,
  targetRotation,
  validateEntries,
  type WheelError,
} from './logic';

const STORAGE_KEY = 'tools:spin-wheel:settings';
const SPIN_DURATION_MS = 3400;

interface SavedSettings {
  input: string;
  removeWinner: boolean;
}

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

function sectorPath(index: number, count: number): string {
  const angle = 360 / count;
  const start = -90 + index * angle;
  const end = start + angle;
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return [100 + 96 * Math.cos(radians), 100 + 96 * Math.sin(radians)] as const;
  };
  const [startX, startY] = point(start);
  const [endX, endY] = point(end);
  return `M 100 100 L ${startX} ${startY} A 96 96 0 ${angle > 180 ? 1 : 0} 1 ${endX} ${endY} Z`;
}

function labelPosition(index: number, count: number) {
  const angle = -90 + (index + 0.5) * (360 / count);
  const radians = (angle * Math.PI) / 180;
  return { x: 100 + 60 * Math.cos(radians), y: 100 + 60 * Math.sin(radians), angle };
}

function shortLabel(value: string): string {
  const characters = Array.from(value);
  return characters.length > 12 ? `${characters.slice(0, 11).join('')}…` : value;
}

export default function SpinWheel({ ui }: ToolProps<UI>) {
  const [input, setInput] = useState(ui.defaultEntries);
  const [removeWinner, setRemoveWinner] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState<WheelError | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);
  const spinTimer = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(() => parseEntries(input), [input]);
  const validationError = validateEntries(entries);
  const errorText =
    error === 'not-enough-entries'
      ? ui.notEnoughEntriesError
      : error === 'too-many-entries'
        ? ui.tooManyEntriesError
        : error === 'entry-too-long'
          ? ui.entryTooLongError
          : error === 'crypto'
            ? ui.cryptoError
            : null;

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (saved && typeof saved.input === 'string' && typeof saved.removeWinner === 'boolean') {
        setInput(saved.input);
        setRemoveWinner(saved.removeWinner);
      }
    } catch {
      /* Ignore malformed local state. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify({ input, removeWinner } satisfies SavedSettings));
  }, [input, ready, removeWinner]);

  useEffect(
    () => () => {
      if (spinTimer.current) window.clearTimeout(spinTimer.current);
    },
    [],
  );

  const spin = useCallback(() => {
    if (spinning) return;
    const currentEntries = parseEntries(input);
    const nextError = validateEntries(currentEntries);
    if (nextError) {
      setError(nextError);
      return;
    }
    try {
      const selected = pickEntry(currentEntries, cryptoSource);
      if (!selected) return;
      setError(null);
      setWinner(null);
      setSpinning(true);
      setRotation((current) => targetRotation(current, selected.index, currentEntries.length));
      spinTimer.current = window.setTimeout(() => {
        setWinner(selected.value);
        setHistory((current) => [selected.value, ...current].slice(0, 8));
        if (removeWinner) setInput(removeEntryAt(currentEntries, selected.index).join('\n'));
        setSpinning(false);
        spinTimer.current = null;
      }, SPIN_DURATION_MS);
    } catch {
      setError('crypto');
    }
  }, [input, removeWinner, spinning]);

  const fullscreen = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void panel.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.code === 'Space') {
        event.preventDefault();
        spin();
      } else if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        fullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, spin]);

  const choosePreset = (value: string) => {
    if (spinning) return;
    setInput(value);
    setWinner(null);
    setError(null);
  };

  return (
    <div
      ref={panelRef}
      class="[:fullscreen]:flex [:fullscreen]:min-h-screen [:fullscreen]:items-center [:fullscreen]:justify-center [:fullscreen]:bg-bg [:fullscreen]:p-4"
    >
      <Panel class="w-full max-w-5xl">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section>
            <Field label={ui.entriesLabel} hint={ui.entriesHint}>
              <Textarea
                value={input}
                maxLength={MAX_ENTRIES * 81}
                spellcheck={false}
                onInput={(event) => {
                  setInput(event.currentTarget.value);
                  setError(null);
                  setWinner(null);
                }}
                aria-describedby="spin-wheel-entry-count"
              />
            </Field>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span id="spin-wheel-entry-count" class="text-xs text-muted">
                {ui.entryCount.replace('{n}', String(entries.length)).replace('{max}', String(MAX_ENTRIES))}
              </span>
              <div class="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => choosePreset(ui.defaultEntries)} disabled={spinning}>
                  {ui.restoreSample}
                </Button>
                <Button size="sm" onClick={() => choosePreset('')} disabled={spinning || !input}>
                  {ui.clear}
                </Button>
              </div>
            </div>
            <div class="mt-5 border-t border-line pt-5">
              <p class="text-sm font-medium text-fg">{ui.presets}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => choosePreset(ui.yesNoEntries)} disabled={spinning}>
                  {ui.yesNo}
                </Button>
                <Button size="sm" onClick={() => choosePreset(ui.numberEntries)} disabled={spinning}>
                  {ui.numbers}
                </Button>
                <Button size="sm" onClick={() => choosePreset(ui.lunchEntries)} disabled={spinning}>
                  {ui.lunch}
                </Button>
              </div>
            </div>
            <div class="mt-5">
              <Toggle checked={removeWinner} onChecked={setRemoveWinner} label={ui.removeWinner} />
              <p class="mt-1 text-xs text-subtle">{ui.removeWinnerHint}</p>
            </div>
            <div class="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" onClick={spin} disabled={spinning || !!validationError}>
                {spinning ? ui.spinning : ui.spin}
              </Button>
              <Button size="lg" onClick={fullscreen} aria-label={ui.fullscreen}>
                {ui.fullscreen}
              </Button>
              <span class="text-xs text-muted">
                {ui.spinShortcut} <Kbd>Space</Kbd> · {ui.fullscreenShortcut} <Kbd>F</Kbd>
              </span>
            </div>
            {errorText && (
              <div class="mt-4">
                <Notice tone="danger">{errorText}</Notice>
              </div>
            )}
          </section>

          <section aria-label={ui.wheelLabel} class="rounded-lg border border-line bg-surface-2 p-3 sm:p-4">
            <svg viewBox="0 0 200 200" class="mx-auto block w-full max-w-[320px]" role="img" aria-label={ui.wheelLabel}>
              <g
                class="origin-center transition-transform duration-[3400ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {entries.map((entry, index) => {
                  const position = labelPosition(index, entries.length);
                  return (
                    <g>
                      <path
                        d={sectorPath(index, entries.length)}
                        class={index % 2 ? 'fill-accent-soft text-line-strong' : 'fill-surface text-line-strong'}
                        stroke="currentColor"
                        stroke-width="0.7"
                      />
                      {entries.length <= 16 && (
                        <text
                          x={position.x}
                          y={position.y}
                          text-anchor="middle"
                          dominant-baseline="middle"
                          transform={`rotate(${position.angle + 90} ${position.x} ${position.y})`}
                          class="fill-fg text-[7px]"
                        >
                          {shortLabel(entry)}
                        </text>
                      )}
                    </g>
                  );
                })}
                <circle cx="100" cy="100" r="13" class="fill-surface stroke-line-strong" stroke-width="1" />
              </g>
              <path d="M100 2 92 17h16Z" class="fill-danger" aria-hidden="true" />
            </svg>
            <div class="mt-3" aria-live="polite">
              <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
              <output
                class={cx(
                  'mt-2 flex min-h-16 items-center justify-center break-words rounded-md border px-3 py-3 text-center text-lg font-semibold',
                  winner ? 'border-accent bg-accent-soft text-fg' : 'border-line bg-surface text-muted',
                )}
              >
                {spinning ? ui.spinning : (winner ?? ui.waitingResult)}
              </output>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <Stat label={ui.entriesRemaining} value={entries.length} />
              <Stat label={ui.spinsThisSession} value={history.length} />
            </div>
            <p class="mt-3 text-xs leading-5 text-subtle">{ui.cryptoNote}</p>
          </section>
        </div>

        <div class="mt-6 border-t border-line pt-5">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.historyHeading}</p>
            <Button size="sm" onClick={() => setHistory([])} disabled={!history.length}>
              {ui.clearHistory}
            </Button>
          </div>
          {history.length ? (
            <ol class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {history.map((entry, index) => (
                <li class="flex min-w-0 items-center gap-3 rounded-md bg-surface-2 px-3 py-2 text-sm">
                  <span class="tabular text-subtle">{index + 1}</span>
                  <span class="min-w-0 truncate text-fg">{entry}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p class="mt-3 text-sm text-muted">{ui.noHistory}</p>
          )}
        </div>
      </Panel>
    </div>
  );
}

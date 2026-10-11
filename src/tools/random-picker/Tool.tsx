import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Stat, Textarea, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { parseEntries, pickEntry, removeEntryAt, validateEntries, type PickerError } from './logic';

const STORAGE_KEY = 'tools:random-picker:settings';
const SPIN_DURATION_MS = 800;

interface Winner {
  value: string;
  participantCount: number;
  pickedAt: number;
}

interface SavedSettings {
  input: string;
  removeWinner: boolean;
}

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

export default function RandomPicker({ locale, ui }: ToolProps<UI>) {
  const [input, setInput] = useState(ui.defaultEntries);
  const [removeWinner, setRemoveWinner] = useState(true);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [history, setHistory] = useState<Winner[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState<PickerError | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);
  const spinTimer = useRef<number | null>(null);
  const previewTimer = useRef<number | null>(null);

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
      /* Ignore malformed saved data. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify({ input, removeWinner } satisfies SavedSettings));
  }, [input, ready, removeWinner]);

  useEffect(
    () => () => {
      if (spinTimer.current) window.clearTimeout(spinTimer.current);
      if (previewTimer.current) window.clearInterval(previewTimer.current);
    },
    [],
  );

  const pick = useCallback(() => {
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
      let previewIndex = selected.index;
      setPreview(currentEntries[previewIndex] ?? null);
      previewTimer.current = window.setInterval(() => {
        previewIndex = (previewIndex + 1) % currentEntries.length;
        setPreview(currentEntries[previewIndex] ?? null);
      }, 70);
      spinTimer.current = window.setTimeout(() => {
        if (previewTimer.current) window.clearInterval(previewTimer.current);
        previewTimer.current = null;
        const nextWinner = { value: selected.value, participantCount: currentEntries.length, pickedAt: Date.now() };
        setPreview(selected.value);
        setWinner(nextWinner);
        setHistory((current) => [nextWinner, ...current].slice(0, 10));
        if (removeWinner) setInput(removeEntryAt(currentEntries, selected.index).join('\n'));
        setSpinning(false);
        spinTimer.current = null;
      }, SPIN_DURATION_MS);
    } catch {
      setError('crypto');
    }
  }, [input, removeWinner, spinning]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        pick();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pick]);

  const shareText = winner
    ? `${ui.shareWinner}: ${winner.value}\n${ui.shareParticipants}: ${winner.participantCount}\n${ui.shareTime}: ${new Intl.DateTimeFormat(
        locale,
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        },
      ).format(winner.pickedAt)}`
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <Field label={ui.entriesLabel} hint={ui.entriesHint}>
            <Textarea
              value={input}
              onInput={(event) => {
                setInput((event.currentTarget as HTMLTextAreaElement).value);
                setError(null);
              }}
              maxLength={201_000}
              spellcheck={false}
              aria-describedby="random-picker-entry-count"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span id="random-picker-entry-count" class="text-xs text-muted">
              {ui.entryCount.replace('{n}', String(entries.length)).replace('{max}', ui.maxEntries)}
            </span>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setInput(ui.defaultEntries)}>
                {ui.restoreSample}
              </Button>
              <Button size="sm" onClick={() => setInput('')} disabled={!input}>
                {ui.clear}
              </Button>
            </div>
          </div>
          <div class="mt-4">
            <Toggle checked={removeWinner} onChecked={setRemoveWinner} label={ui.removeWinner} />
            <p class="mt-1 text-xs text-subtle">{ui.removeWinnerHint}</p>
          </div>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" onClick={pick} disabled={spinning || !!validationError}>
              {spinning ? ui.picking : ui.pick}
            </Button>
            <span class="text-xs text-muted">
              {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd>
            </span>
          </div>
          {errorText && (
            <div class="mt-4">
              <Notice tone="danger">{errorText}</Notice>
            </div>
          )}
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
            <CopyButton text={shareText} label={ui.copyResult} copiedLabel={ui.copied} />
          </div>
          <output
            aria-live="polite"
            class="mt-4 flex min-h-32 items-center justify-center break-words rounded-lg border border-line bg-surface px-4 py-6 text-center text-xl font-semibold text-fg"
          >
            {spinning ? preview : (winner?.value ?? ui.waitingResult)}
          </output>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <Stat label={ui.entriesRemainingLabel} value={entries.length} />
            <Stat label={ui.drawnLabel} value={history.length} />
          </div>
          <p class="mt-3 text-xs text-subtle">{ui.cryptoNote}</p>
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-5">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-fg">{ui.historyHeading}</p>
          <Button size="sm" onClick={() => setHistory([])} disabled={!history.length}>
            {ui.clearHistory}
          </Button>
        </div>
        {history.length ? (
          <ol class="mt-3 grid gap-2 sm:grid-cols-2">
            {history.map((item, index) => (
              <li class="flex min-w-0 items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2 text-sm">
                <span class="text-subtle tabular">{index + 1}</span>
                <span class="min-w-0 flex-1 truncate text-fg">{item.value}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p class="mt-3 text-sm text-muted">{ui.noHistory}</p>
        )}
      </div>
    </Panel>
  );
}

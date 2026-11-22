import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, Notice, Panel, Segmented, Stat } from '../../components/ui';
import { safeStorage, yieldToBrowser } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { diffTextSteps, type DiffMode, type DiffRun } from './logic';

const ORIGINAL_KEY = 'tools:text-diff:original';
const MODIFIED_KEY = 'tools:text-diff:modified';
const MODE_KEY = 'tools:text-diff:mode';
/** Wait for a pause in typing before comparing, so a keystroke never pays for a full diff. */
const INPUT_DEBOUNCE_MS = 200;

const MODES: DiffMode[] = ['line', 'word', 'char'];

function drop(key: string): boolean {
  safeStorage.remove(key);
  return true;
}

function isDiffMode(value: string | null): value is DiffMode {
  return value !== null && (MODES as string[]).includes(value);
}

export default function TextDiff({ ui }: ToolProps<UI>) {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [mode, setMode] = useState<DiffMode>('word');
  const [run, setRun] = useState<DiffRun | null>(null);
  /** Fraction of the work budget spent by the comparison in flight, or null when idle. */
  const [progress, setProgress] = useState<number | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const [storageRestored, setStorageRestored] = useState(false);

  // Restore after hydration (server render has no storage).
  useEffect(() => {
    setOriginal(safeStorage.get(ORIGINAL_KEY) ?? '');
    setModified(safeStorage.get(MODIFIED_KEY) ?? '');
    const savedMode = safeStorage.get(MODE_KEY);
    if (isDiffMode(savedMode)) setMode(savedMode);
    setStorageRestored(true);
  }, []);

  useEffect(() => {
    if (!storageRestored) return;
    const id = setTimeout(() => {
      const okOriginal = original ? safeStorage.trySet(ORIGINAL_KEY, original) : drop(ORIGINAL_KEY);
      const okModified = modified ? safeStorage.trySet(MODIFIED_KEY, modified) : drop(MODIFIED_KEY);
      setStorageFailed(!okOriginal || !okModified);
    }, 300);
    return () => clearTimeout(id);
  }, [original, modified, storageRestored]);

  useEffect(() => {
    safeStorage.set(MODE_KEY, mode);
  }, [mode]);

  // Compare off the critical path: between rounds the browser paints, and an edit cancels the run.
  useEffect(() => {
    const hasInput = original !== '' || modified !== '';
    if (!hasInput) {
      setRun(null);
      setProgress(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      const steps = diffTextSteps(original, modified, mode);
      void (async () => {
        let step = steps.next();
        while (!step.done) {
          if (cancelled) return;
          setProgress(step.value);
          await yieldToBrowser();
          if (cancelled) return;
          step = steps.next();
        }
        if (cancelled) return;
        setRun(step.value);
        setProgress(null);
      })();
    }, INPUT_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [original, modified, mode]);

  const hasInput = original !== '' || modified !== '';
  const comparing = progress !== null;
  const changedMode = run !== null && run.computedIn !== mode;

  const modeOptions: { value: DiffMode; label: string }[] = [
    { value: 'line', label: ui.modeLine },
    { value: 'word', label: ui.modeWord },
    { value: 'char', label: ui.modeChar },
  ];
  const modeName = (value: DiffMode) => (value === 'line' ? ui.modeLine : value === 'word' ? ui.modeWord : ui.modeChar);
  const swap = () => {
    setOriginal(modified);
    setModified(original);
  };

  const clear = () => {
    setOriginal('');
    setModified('');
  };

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Segmented value={mode} onValue={setMode} options={modeOptions} label={ui.modeLabel} />
        <div class="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={swap} disabled={!hasInput}>
            {ui.swap}
          </Button>
          <Button size="sm" variant="ghost" onClick={clear} disabled={!hasInput}>
            {ui.clear}
          </Button>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="flex flex-col">
          <label for="td-original" class="text-sm font-medium text-fg mb-1.5">
            {ui.originalLabel}
          </label>
          <textarea
            id="td-original"
            value={original}
            onInput={(e) => setOriginal((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.originalPlaceholder}
            spellcheck={false}
            class="min-h-[180px] w-full resize-y rounded-lg border border-line bg-bg p-3 text-sm leading-6 text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>
        <div class="flex flex-col">
          <label for="td-modified" class="text-sm font-medium text-fg mb-1.5">
            {ui.modifiedLabel}
          </label>
          <textarea
            id="td-modified"
            value={modified}
            onInput={(e) => setModified((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.modifiedPlaceholder}
            spellcheck={false}
            class="min-h-[180px] w-full resize-y rounded-lg border border-line bg-bg p-3 text-sm leading-6 text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <p class="mt-2 text-xs text-subtle">{storageFailed ? ui.notSaved : ui.autosaved}</p>

      {!hasInput ? (
        <div class="mt-5">
          <Notice>{ui.emptyHint}</Notice>
        </div>
      ) : (
        <div class="mt-5">
          <div class="grid grid-cols-3 gap-2 mb-3" aria-live="polite">
            <Stat label={ui.added} value={run ? `+${run.result.added}` : '—'} emphasis />
            <Stat label={ui.removed} value={run ? `-${run.result.removed}` : '—'} emphasis />
            <Stat label={ui.similarity} value={run ? `${run.result.similarity}%` : '—'} emphasis />
          </div>

          <div class="mb-4 min-h-5 text-xs text-muted" role="status" aria-live="polite">
            {comparing && (
              <span>
                {ui.comparing}
                {progress && progress > 0.01 ? ` ${Math.round(progress * 100)}%` : ''}
              </span>
            )}
          </div>

          {run && changedMode && (
            <div class="mb-4">
              <Notice>{ui.coarserNotice.replace('{requested}', modeName(mode))}</Notice>
            </div>
          )}

          {run &&
            (run.result.identical ? (
              <Notice tone="success">{ui.identicalNotice}</Notice>
            ) : (
              <div class="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 class="text-sm font-medium text-fg mb-2">{ui.originalLabel}</h3>
                  <div class="rounded-lg border border-line bg-bg p-3 text-sm leading-6 whitespace-pre-wrap break-words max-h-[360px] overflow-auto">
                    {run.result.chunks
                      .filter((c) => c.op !== 'insert')
                      .map((c, i) =>
                        c.op === 'delete' ? (
                          <span key={i} class="bg-danger-soft text-danger line-through">
                            {c.value}
                          </span>
                        ) : (
                          <span key={i}>{c.value}</span>
                        ),
                      )}
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-fg mb-2">{ui.modifiedLabel}</h3>
                  <div class="rounded-lg border border-line bg-bg p-3 text-sm leading-6 whitespace-pre-wrap break-words max-h-[360px] overflow-auto">
                    {run.result.chunks
                      .filter((c) => c.op !== 'delete')
                      .map((c, i) =>
                        c.op === 'insert' ? (
                          <span key={i} class="bg-success-soft text-success">
                            {c.value}
                          </span>
                        ) : (
                          <span key={i}>{c.value}</span>
                        ),
                      )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </Panel>
  );
}

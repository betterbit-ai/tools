import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Notice, Panel, Segmented, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { diffText, type DiffMode } from './logic';

const ORIGINAL_KEY = 'tools:text-diff:original';
const MODIFIED_KEY = 'tools:text-diff:modified';
const MODE_KEY = 'tools:text-diff:mode';

const MODES: DiffMode[] = ['line', 'word', 'char'];

function isDiffMode(value: string | null): value is DiffMode {
  return value !== null && (MODES as string[]).includes(value);
}

export default function TextDiff({ ui }: ToolProps<UI>) {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [mode, setMode] = useState<DiffMode>('word');

  // Restore after hydration (server render has no storage).
  useEffect(() => {
    setOriginal(safeStorage.get(ORIGINAL_KEY) ?? '');
    setModified(safeStorage.get(MODIFIED_KEY) ?? '');
    const savedMode = safeStorage.get(MODE_KEY);
    if (isDiffMode(savedMode)) setMode(savedMode);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (original) safeStorage.set(ORIGINAL_KEY, original);
      else safeStorage.remove(ORIGINAL_KEY);
      if (modified) safeStorage.set(MODIFIED_KEY, modified);
      else safeStorage.remove(MODIFIED_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [original, modified]);

  useEffect(() => {
    safeStorage.set(MODE_KEY, mode);
  }, [mode]);

  const result = useMemo(() => diffText(original, modified, mode), [original, modified, mode]);
  const hasInput = original !== '' || modified !== '';

  const modeOptions: { value: DiffMode; label: string }[] = [
    { value: 'line', label: ui.modeLine },
    { value: 'word', label: ui.modeWord },
    { value: 'char', label: ui.modeChar },
  ];

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

      <p class="mt-2 text-xs text-subtle">{ui.autosaved}</p>

      {!hasInput ? (
        <div class="mt-5">
          <Notice>{ui.emptyHint}</Notice>
        </div>
      ) : (
        <div class="mt-5">
          <div class="grid grid-cols-3 gap-2 mb-5" aria-live="polite">
            <Stat label={ui.added} value={`+${result.added}`} emphasis />
            <Stat label={ui.removed} value={`-${result.removed}`} emphasis />
            <Stat label={ui.similarity} value={`${result.similarity}%`} emphasis />
          </div>

          {result.identical ? (
            <Notice tone="success">{ui.identicalNotice}</Notice>
          ) : (
            <div class="grid gap-4 lg:grid-cols-2">
              <div>
                <h3 class="text-sm font-medium text-fg mb-2">{ui.originalLabel}</h3>
                <div class="rounded-lg border border-line bg-bg p-3 text-sm leading-6 whitespace-pre-wrap break-words max-h-[360px] overflow-auto">
                  {result.chunks
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
                  {result.chunks
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
          )}
        </div>
      )}
    </Panel>
  );
}

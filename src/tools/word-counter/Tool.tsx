import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, NumberInput, Panel, Stat, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { analyze, splitDuration, topKeywords } from './logic';

const STORAGE_KEY = 'tools:word-counter:text';
const LIMIT_KEY = 'tools:word-counter:limit';

export default function WordCounter({ locale, ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState<number | ''>('');

  // Restore after hydration (server render has no storage).
  useEffect(() => {
    setText(safeStorage.get(STORAGE_KEY) ?? '');
    const savedLimit = Number(safeStorage.get(LIMIT_KEY));
    if (savedLimit > 0) setLimit(savedLimit);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (text) safeStorage.set(STORAGE_KEY, text);
      else safeStorage.remove(STORAGE_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => {
    if (limit) safeStorage.set(LIMIT_KEY, String(limit));
    else safeStorage.remove(LIMIT_KEY);
  }, [limit]);

  const stats = useMemo(() => analyze(text), [text]);
  const keywords = useMemo(() => topKeywords(text), [text]);
  const n = (v: number) => formatNumber(v, locale);
  const duration = (secs: number) => {
    const { m, s } = splitDuration(secs);
    return m > 0 ? ui.minSec.replace('{m}', n(m)).replace('{s}', String(s)) : ui.sec.replace('{s}', String(s));
  };

  const remaining = limit ? limit - stats.characters : 0;
  const pct = limit ? Math.min(100, (stats.characters / limit) * 100) : 0;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex flex-col">
          <label for="wc-input" class="sr-only">
            {ui.inputLabel}
          </label>
          <textarea
            id="wc-input"
            value={text}
            onInput={(e) => setText((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.placeholder}
            spellcheck={false}
            class="min-h-[320px] lg:min-h-[440px] flex-1 w-full resize-y rounded-lg border border-line bg-bg p-4 text-base leading-7 text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton text={text} label={ui.copy} copiedLabel={ui.copied} />
            <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.characters} value={n(stats.characters)} emphasis />
            <Stat label={ui.words} value={n(stats.words)} emphasis />
            <Stat label={ui.charactersNoSpaces} value={n(stats.charactersNoSpaces)} />
            <Stat label={ui.charactersNoLineBreaks} value={n(stats.charactersNoLineBreaks)} />
            <Stat label={ui.sentences} value={n(stats.sentences)} />
            <Stat label={ui.paragraphs} value={n(stats.paragraphs)} />
            <Stat label={ui.bytesLegacy} value={n(stats.bytesLegacy)} />
            <Stat label={ui.bytesUtf8} value={n(stats.bytesUtf8)} />
            <Stat label={ui.readingTime} value={duration(stats.readingSeconds)} />
            <Stat label={ui.speakingTime} value={duration(stats.speakingSeconds)} />
          </div>

          <div>
            <Field label={ui.limitLabel} hint={ui.limitHint}>
              <NumberInput
                value={limit}
                onValue={(v) => setLimit(v === '' ? '' : Math.max(0, v))}
                min={0}
                placeholder="500"
              />
            </Field>
            {limit !== '' && limit > 0 && (
              <div class="mt-3">
                <div class="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    class={cx('h-full transition-[width]', remaining < 0 ? 'bg-danger' : 'bg-accent')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p class={cx('mt-1.5 text-sm tabular', remaining < 0 ? 'text-danger' : 'text-muted')}>
                  {remaining < 0
                    ? ui.limitOver.replace('{n}', n(-remaining))
                    : ui.limitRemaining.replace('{n}', n(remaining))}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 class="text-sm font-medium text-fg mb-2">{ui.keywords}</h3>
            {keywords.length === 0 ? (
              <p class="text-sm text-subtle">{ui.keywordsEmpty}</p>
            ) : (
              <ul class="flex flex-wrap gap-1.5">
                {keywords.map((k) => (
                  <li class="rounded-md bg-surface-2 px-2 py-1 text-sm text-fg">
                    {k.word} <span class="text-subtle tabular">×{k.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

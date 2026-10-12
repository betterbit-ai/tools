import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Field, Kbd, Panel, Segmented, Select, Stat, Textarea, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_OPTIONS,
  removeDuplicateLines,
  type DeduplicateOptions,
  type KeepOccurrence,
  type SortOrder,
} from './logic';

const TEXT_KEY = 'tools:remove-duplicate-lines:text';
const OPTIONS_KEY = 'tools:remove-duplicate-lines:options';

export default function RemoveDuplicateLines({ locale, ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState<DeduplicateOptions>(DEFAULT_OPTIONS);
  const [restored, setRestored] = useState(false);
  const [shortcutCopied, setShortcutCopied] = useState(false);

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? '');
    const savedOptions = safeStorage.get(OPTIONS_KEY);
    if (savedOptions) setOptions(parseOptions(savedOptions));
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    const id = window.setTimeout(() => {
      if (text) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => window.clearTimeout(id);
  }, [restored, text]);

  useEffect(() => {
    if (restored) safeStorage.set(OPTIONS_KEY, JSON.stringify(options));
  }, [options, restored]);

  const result = useMemo(() => removeDuplicateLines(text, options, locale), [locale, options, text]);
  const n = (value: number) => formatNumber(value, locale);
  const updateOptions = (next: Partial<DeduplicateOptions>) => setOptions((current) => ({ ...current, ...next }));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key !== 'Enter' ||
        !(event.metaKey || event.ctrlKey) ||
        !result.text ||
        target?.matches('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      event.preventDefault();
      void navigator.clipboard
        .writeText(result.text)
        .then(() => setShortcutCopied(true))
        .catch(() => undefined);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [result.text]);

  useEffect(() => {
    if (!shortcutCopied) return;
    const id = window.setTimeout(() => setShortcutCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [shortcutCopied]);

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex min-w-0 flex-col">
          <Field label={ui.inputLabel} hint={ui.inputHint}>
            <Textarea
              value={text}
              onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
              placeholder={ui.inputPlaceholder}
              spellcheck={false}
              class="min-h-[260px] lg:min-h-[360px]"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
          <div class="mt-5 border-t border-line pt-5">
            <Field label={ui.outputLabel} hint={ui.outputHint}>
              <Textarea value={result.text} readOnly placeholder={ui.emptyOutput} class="min-h-[180px]" />
            </Field>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <div>
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.keepLabel}</p>
            <Segmented<KeepOccurrence>
              label={ui.keepLabel}
              value={options.keepOccurrence}
              onValue={(keepOccurrence) => updateOptions({ keepOccurrence })}
              options={[
                { value: 'first', label: ui.keepFirst },
                { value: 'last', label: ui.keepLast },
              ]}
            />
          </div>

          <Field label={ui.sortLabel}>
            <Select<SortOrder>
              value={options.sortOrder}
              onValue={(sortOrder) => updateOptions({ sortOrder })}
              options={[
                { value: 'original', label: ui.sortOriginal },
                { value: 'ascending', label: ui.sortAscending },
                { value: 'descending', label: ui.sortDescending },
              ]}
            />
          </Field>

          <div class="flex flex-col gap-3 border-y border-line py-4">
            <Toggle
              checked={options.caseSensitive}
              onChecked={(caseSensitive) => updateOptions({ caseSensitive })}
              label={ui.caseSensitive}
            />
            <Toggle
              checked={options.trimWhitespace}
              onChecked={(trimWhitespace) => updateOptions({ trimWhitespace })}
              label={ui.trimWhitespace}
            />
            <Toggle
              checked={options.removeEmptyLines}
              onChecked={(removeEmptyLines) => updateOptions({ removeEmptyLines })}
              label={ui.removeEmptyLines}
            />
            <Toggle
              checked={options.normalizeUnicode}
              onChecked={(normalizeUnicode) => updateOptions({ normalizeUnicode })}
              label={ui.normalizeUnicode}
            />
          </div>

          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.inputLines} value={n(result.inputLines)} />
            <Stat label={ui.uniqueLines} value={n(result.outputLines)} emphasis />
            <Stat label={ui.duplicatesRemoved} value={n(result.duplicatesRemoved)} />
            <Stat label={ui.emptyLinesRemoved} value={n(result.emptyLinesRemoved)} />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={!result.text}
              onClick={() => {
                void navigator.clipboard
                  .writeText(result.text)
                  .then(() => setShortcutCopied(true))
                  .catch(() => undefined);
              }}
            >
              {shortcutCopied ? ui.copied : ui.copy}
            </Button>
            <p class="text-xs text-subtle">
              {ui.copyShortcut} <Kbd>{ui.shortcutKey}</Kbd>
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function parseOptions(value: string): DeduplicateOptions {
  try {
    const stored: unknown = JSON.parse(value);
    if (!stored || typeof stored !== 'object') return DEFAULT_OPTIONS;
    const parsed = stored as Partial<DeduplicateOptions>;
    return {
      caseSensitive: typeof parsed.caseSensitive === 'boolean' ? parsed.caseSensitive : DEFAULT_OPTIONS.caseSensitive,
      trimWhitespace:
        typeof parsed.trimWhitespace === 'boolean' ? parsed.trimWhitespace : DEFAULT_OPTIONS.trimWhitespace,
      removeEmptyLines:
        typeof parsed.removeEmptyLines === 'boolean' ? parsed.removeEmptyLines : DEFAULT_OPTIONS.removeEmptyLines,
      normalizeUnicode:
        typeof parsed.normalizeUnicode === 'boolean' ? parsed.normalizeUnicode : DEFAULT_OPTIONS.normalizeUnicode,
      keepOccurrence: parsed.keepOccurrence === 'last' ? 'last' : 'first',
      sortOrder:
        parsed.sortOrder === 'ascending' || parsed.sortOrder === 'descending'
          ? parsed.sortOrder
          : DEFAULT_OPTIONS.sortOrder,
    };
  } catch {
    return DEFAULT_OPTIONS;
  }
}

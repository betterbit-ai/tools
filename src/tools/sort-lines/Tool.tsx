import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Panel, Segmented, Stat, Textarea, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { DEFAULT_OPTIONS, sortTextLines, type SortMode, type SortOptions } from './logic';

const TEXT_KEY = 'tools:sort-lines:text';
const OPTIONS_KEY = 'tools:sort-lines:options';

const sortModes: SortMode[] = ['alphabetical', 'reverse-alphabetical', 'reverse', 'shuffle'];

function isSortOptions(value: string): value is string {
  try {
    const parsed = JSON.parse(value) as Partial<SortOptions>;
    return (
      sortModes.includes(parsed.mode as SortMode) &&
      typeof parsed.naturalOrder === 'boolean' &&
      typeof parsed.caseSensitive === 'boolean' &&
      typeof parsed.trimWhitespace === 'boolean' &&
      typeof parsed.removeEmptyLines === 'boolean' &&
      typeof parsed.removeDuplicates === 'boolean'
    );
  } catch {
    return false;
  }
}

export default function SortLines({ locale, ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState<SortOptions>(DEFAULT_OPTIONS);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? '');
    const savedOptions = safeStorage.get(OPTIONS_KEY);
    if (savedOptions && isSortOptions(savedOptions)) setOptions(JSON.parse(savedOptions) as SortOptions);
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

  const result = useMemo(() => sortTextLines(text, options, locale), [locale, options, text]);
  const n = (value: number) => formatNumber(value, locale);
  const updateOptions = (next: Partial<SortOptions>) => setOptions((current) => ({ ...current, ...next }));

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
      void navigator.clipboard?.writeText(result.text);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [result.text]);

  const clear = () => {
    safeStorage.remove(TEXT_KEY);
    setText('');
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex min-w-0 flex-col">
          <label for="sort-lines-input" class="mb-1.5 text-sm font-medium text-fg">
            {ui.inputLabel}
          </label>
          <Textarea
            id="sort-lines-input"
            value={text}
            onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.inputPlaceholder}
            spellcheck={false}
            class="min-h-52 flex-1 bg-bg p-4 text-base lg:min-h-[360px]"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={clear} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <Field label={ui.modeLabel}>
            <Segmented
              value={options.mode}
              onValue={(mode) => updateOptions({ mode })}
              label={ui.modeLabel}
              options={[
                { value: 'alphabetical', label: ui.alphabetical },
                { value: 'reverse-alphabetical', label: ui.reverseAlphabetical },
                { value: 'reverse', label: ui.reverse },
                { value: 'shuffle', label: ui.shuffle },
              ]}
            />
          </Field>

          <div>
            <h3 class="mb-2 text-sm font-medium text-fg">{ui.optionsLabel}</h3>
            <div class="grid gap-3">
              <Toggle
                checked={options.naturalOrder}
                onChecked={(naturalOrder) => updateOptions({ naturalOrder })}
                label={ui.naturalOrder}
                disabled={options.mode === 'reverse' || options.mode === 'shuffle'}
              />
              <Toggle
                checked={options.caseSensitive}
                onChecked={(caseSensitive) => updateOptions({ caseSensitive })}
                label={ui.caseSensitive}
                disabled={options.mode === 'reverse' || options.mode === 'shuffle'}
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
                checked={options.removeDuplicates}
                onChecked={(removeDuplicates) => updateOptions({ removeDuplicates })}
                label={ui.removeDuplicates}
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.inputLines} value={n(result.inputLines)} />
            <Stat label={ui.outputLines} value={n(result.outputLines)} emphasis />
            <Stat label={ui.removedLines} value={n(result.removedLines)} />
          </div>

          <div>
            <label for="sort-lines-output" class="mb-1.5 block text-sm font-medium text-fg">
              {ui.outputLabel}
            </label>
            <Textarea
              id="sort-lines-output"
              value={result.text}
              readOnly
              placeholder={ui.outputPlaceholder}
              class="min-h-40 bg-surface-2 p-3 text-sm"
            />
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={result.text} label={ui.copy} copiedLabel={ui.copied} />
              <Button size="sm" variant="secondary" onClick={() => setText(result.text)} disabled={!result.text}>
                {ui.useResult}
              </Button>
            </div>
            <p class="mt-3 text-xs text-subtle">
              <Kbd>⌘</Kbd> <Kbd>Enter</Kbd> {ui.copyShortcut}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  Kbd,
  Panel,
  Segmented,
  Stat,
  Textarea,
  TextInput,
  Toggle,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import { PDF_CLEANUP_OPTIONS, removeLineBreaks, type CleanupOptions, type JoinMode } from './logic';
import type { UI } from './content';

const TEXT_KEY = 'tools:remove-line-breaks:text';
const OPTIONS_KEY = 'tools:remove-line-breaks:options';

const SINGLE_LINE_OPTIONS: CleanupOptions = {
  ...PDF_CLEANUP_OPTIONS,
  preserveParagraphs: false,
  preserveListItems: false,
  joinHyphenatedWords: false,
};

export default function RemoveLineBreaks({ locale, ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState<CleanupOptions>(PDF_CLEANUP_OPTIONS);
  const [shortcutCopied, setShortcutCopied] = useState(false);

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? '');
    const savedOptions = safeStorage.get(OPTIONS_KEY);
    if (savedOptions) setOptions(parseOptions(savedOptions));
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (text) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => window.clearTimeout(id);
  }, [text]);

  useEffect(() => {
    safeStorage.set(OPTIONS_KEY, JSON.stringify(options));
  }, [options]);

  const result = useMemo(() => removeLineBreaks(text, options), [text, options]);
  const n = (value: number) => formatNumber(value, locale);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key.toLowerCase() !== 'c' ||
        !event.shiftKey ||
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

  const updateOptions = (next: Partial<CleanupOptions>) => setOptions((current) => ({ ...current, ...next }));

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex min-w-0 flex-col">
          <Field label={ui.inputLabel}>
            <Textarea
              value={text}
              onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
              placeholder={ui.inputPlaceholder}
              spellcheck={false}
              class="min-h-[260px] lg:min-h-[360px]"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton text={result.text} label={ui.copy} copiedLabel={ui.copied} />
            <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
          <div class="mt-5 border-t border-line pt-5">
            <Field label={ui.outputLabel}>
              <Textarea value={result.text} readOnly placeholder={ui.emptyOutput} class="min-h-[180px]" />
            </Field>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={() => setOptions(PDF_CLEANUP_OPTIONS)}>
              {ui.pdfPreset}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOptions(SINGLE_LINE_OPTIONS)}>
              {ui.singleLinePreset}
            </Button>
          </div>

          <div>
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.modeLabel}</p>
            <Segmented<JoinMode>
              label={ui.modeLabel}
              value={options.mode}
              onValue={(mode) => updateOptions({ mode })}
              options={[
                { value: 'space', label: ui.modeSpace },
                { value: 'remove', label: ui.modeRemove },
                { value: 'custom', label: ui.modeCustom },
              ]}
            />
          </div>

          {options.mode === 'custom' && (
            <Field label={ui.customSeparatorLabel}>
              <TextInput
                value={options.customSeparator}
                onInput={(event) => updateOptions({ customSeparator: (event.currentTarget as HTMLInputElement).value })}
                placeholder={ui.customSeparatorPlaceholder}
              />
            </Field>
          )}

          <div class="flex flex-col gap-3 border-y border-line py-4">
            <Toggle
              checked={options.preserveParagraphs}
              onChecked={(preserveParagraphs) => updateOptions({ preserveParagraphs })}
              label={ui.preserveParagraphs}
            />
            <Toggle
              checked={options.preserveListItems}
              onChecked={(preserveListItems) => updateOptions({ preserveListItems })}
              label={ui.preserveListItems}
            />
            <Toggle
              checked={options.joinHyphenatedWords}
              onChecked={(joinHyphenatedWords) => updateOptions({ joinHyphenatedWords })}
              label={ui.joinHyphenatedWords}
            />
            <Toggle
              checked={options.trimLineWhitespace}
              onChecked={(trimLineWhitespace) => updateOptions({ trimLineWhitespace })}
              label={ui.trimLineWhitespace}
            />
            <Toggle
              checked={options.collapseSpaces}
              onChecked={(collapseSpaces) => updateOptions({ collapseSpaces })}
              label={ui.collapseSpaces}
            />
          </div>

          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.lineBreaksFound} value={n(result.inputLineBreaks)} />
            <Stat label={ui.lineBreaksRemoved} value={n(result.removedLineBreaks)} emphasis />
            <Stat label={ui.lineBreaksKept} value={n(result.outputLineBreaks)} />
          </div>

          <p class="text-xs text-subtle" aria-live="polite">
            {ui.copyShortcut} <Kbd>{ui.shortcutKey}</Kbd>
            {shortcutCopied ? ` · ${ui.copied}` : ''}
          </p>
        </div>
      </div>
    </Panel>
  );
}

function parseOptions(value: string): CleanupOptions {
  try {
    const valueFromStorage: unknown = JSON.parse(value);
    if (!valueFromStorage || typeof valueFromStorage !== 'object') return PDF_CLEANUP_OPTIONS;
    const parsed = valueFromStorage as Partial<CleanupOptions>;
    const mode = parsed.mode === 'remove' || parsed.mode === 'custom' ? parsed.mode : 'space';
    return {
      ...PDF_CLEANUP_OPTIONS,
      mode,
      customSeparator: typeof parsed.customSeparator === 'string' ? parsed.customSeparator : '',
      preserveParagraphs:
        typeof parsed.preserveParagraphs === 'boolean'
          ? parsed.preserveParagraphs
          : PDF_CLEANUP_OPTIONS.preserveParagraphs,
      preserveListItems:
        typeof parsed.preserveListItems === 'boolean'
          ? parsed.preserveListItems
          : PDF_CLEANUP_OPTIONS.preserveListItems,
      joinHyphenatedWords:
        typeof parsed.joinHyphenatedWords === 'boolean'
          ? parsed.joinHyphenatedWords
          : PDF_CLEANUP_OPTIONS.joinHyphenatedWords,
      trimLineWhitespace:
        typeof parsed.trimLineWhitespace === 'boolean'
          ? parsed.trimLineWhitespace
          : PDF_CLEANUP_OPTIONS.trimLineWhitespace,
      collapseSpaces:
        typeof parsed.collapseSpaces === 'boolean' ? parsed.collapseSpaces : PDF_CLEANUP_OPTIONS.collapseSpaces,
    };
  } catch {
    return PDF_CLEANUP_OPTIONS;
  }
}

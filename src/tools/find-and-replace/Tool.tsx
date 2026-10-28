import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Stat, Textarea, TextInput, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { DEFAULT_OPTIONS, findAndReplace, type ReplaceOptions } from './logic';

const TEXT_KEY = 'tools:find-and-replace:text';
const FIND_KEY = 'tools:find-and-replace:find';
const REPLACEMENT_KEY = 'tools:find-and-replace:replacement';
const OPTIONS_KEY = 'tools:find-and-replace:options';
const HISTORY_LIMIT = 10;

export default function FindAndReplace({ locale, ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replacement, setReplacement] = useState('');
  const [options, setOptions] = useState<ReplaceOptions>(DEFAULT_OPTIONS);
  const [history, setHistory] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? '');
    setFind(safeStorage.get(FIND_KEY) ?? '');
    setReplacement(safeStorage.get(REPLACEMENT_KEY) ?? '');
    const savedOptions = safeStorage.get(OPTIONS_KEY);
    if (savedOptions) setOptions(parseOptions(savedOptions));
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    const id = window.setTimeout(() => saveValue(TEXT_KEY, text), 300);
    return () => window.clearTimeout(id);
  }, [restored, text]);

  useEffect(() => {
    if (!restored) return;
    const id = window.setTimeout(() => saveValue(FIND_KEY, find), 300);
    return () => window.clearTimeout(id);
  }, [find, restored]);

  useEffect(() => {
    if (!restored) return;
    const id = window.setTimeout(() => saveValue(REPLACEMENT_KEY, replacement), 300);
    return () => window.clearTimeout(id);
  }, [replacement, restored]);

  useEffect(() => {
    if (restored) safeStorage.set(OPTIONS_KEY, JSON.stringify(options));
  }, [options, restored]);

  const result = useMemo(() => findAndReplace(text, find, replacement, options), [find, options, replacement, text]);
  const n = (value: number) => formatNumber(value, locale);
  const updateOptions = (next: Partial<ReplaceOptions>) => setOptions((current) => ({ ...current, ...next }));
  const canApply = Boolean(find && result.matchCount && !result.error);

  const clear = () => {
    setText('');
    setFind('');
    setReplacement('');
    setOptions(DEFAULT_OPTIONS);
    setHistory([]);
  };

  const applyResult = () => {
    if (!canApply) return;
    setHistory((current) => [...current, text].slice(-HISTORY_LIMIT));
    setText(result.text);
  };

  const undo = () => {
    setHistory((current) => {
      const previous = current.at(-1);
      if (previous !== undefined) setText(previous);
      return current.slice(0, -1);
    });
  };

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
            <Button size="sm" variant="ghost" onClick={clear} disabled={!text && !find && !replacement}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
          <div class="mt-5 border-t border-line pt-5">
            <Field label={ui.outputLabel} hint={ui.outputHint}>
              <Textarea value={result.text} readOnly placeholder={ui.outputPlaceholder} class="min-h-[220px]" />
            </Field>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <Field label={ui.findLabel} hint={options.regex ? ui.regexFindHint : ui.literalFindHint}>
            <TextInput value={find} onInput={(event) => setFind((event.currentTarget as HTMLInputElement).value)} />
          </Field>
          <Field label={ui.replacementLabel} hint={options.regex ? ui.regexReplacementHint : ui.literalReplacementHint}>
            <TextInput
              value={replacement}
              onInput={(event) => setReplacement((event.currentTarget as HTMLInputElement).value)}
            />
          </Field>

          <div class="flex flex-col gap-3 border-y border-line py-4">
            <Toggle checked={options.regex} onChecked={(regex) => updateOptions({ regex })} label={ui.regex} />
            <Toggle
              checked={options.caseSensitive}
              onChecked={(caseSensitive) => updateOptions({ caseSensitive })}
              label={ui.caseSensitive}
            />
            <Toggle
              checked={options.wholeWord}
              onChecked={(wholeWord) => updateOptions({ wholeWord })}
              label={ui.wholeWord}
            />
          </div>

          {result.error ? <Notice tone="danger">{ui.invalidPattern.replace('{error}', result.error)}</Notice> : null}

          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.matches} value={n(result.matchCount)} emphasis />
            <Stat label={ui.history} value={n(history.length)} />
          </div>

          <div class="flex flex-wrap gap-2">
            <Button variant="primary" onClick={applyResult} disabled={!canApply}>
              {ui.apply}
            </Button>
            <Button variant="secondary" onClick={undo} disabled={!history.length}>
              {ui.undo}
            </Button>
            <CopyButton text={result.error ? '' : result.text} label={ui.copy} copiedLabel={ui.copied} />
          </div>
          <p class="text-xs text-subtle">{ui.applyHint}</p>
        </div>
      </div>
    </Panel>
  );
}

function parseOptions(value: string): ReplaceOptions {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_OPTIONS;
    const options = parsed as Partial<ReplaceOptions>;
    return {
      regex: typeof options.regex === 'boolean' ? options.regex : DEFAULT_OPTIONS.regex,
      caseSensitive: typeof options.caseSensitive === 'boolean' ? options.caseSensitive : DEFAULT_OPTIONS.caseSensitive,
      wholeWord: typeof options.wholeWord === 'boolean' ? options.wholeWord : DEFAULT_OPTIONS.wholeWord,
    };
  } catch {
    return DEFAULT_OPTIONS;
  }
}

function saveValue(key: string, value: string): void {
  if (value) safeStorage.set(key, value);
  else safeStorage.remove(key);
}

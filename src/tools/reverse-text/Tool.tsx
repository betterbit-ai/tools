import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Segmented, Stat, Textarea } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { reverseText, textStats, type ReverseMode } from './logic';

const TEXT_KEY = 'tools:reverse-text:text';
const MODE_KEY = 'tools:reverse-text:mode';
const modes: ReverseMode[] = ['characters', 'words', 'each-word', 'lines', 'upside-down'];

function isReverseMode(value: string | null): value is ReverseMode {
  return value !== null && modes.includes(value as ReverseMode);
}

export default function ReverseText({ ui }: ToolProps<UI>) {
  const [text, setText] = useState(ui.example);
  const [mode, setMode] = useState<ReverseMode>('characters');
  const [shortcutCopied, setShortcutCopied] = useState(false);

  useEffect(() => {
    const savedText = safeStorage.get(TEXT_KEY);
    if (savedText !== null) setText(savedText);
    const savedMode = safeStorage.get(MODE_KEY);
    if (isReverseMode(savedMode)) setMode(savedMode);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (text) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => window.clearTimeout(id);
  }, [text]);

  useEffect(() => safeStorage.set(MODE_KEY, mode), [mode]);

  const result = useMemo(() => reverseText(text, mode), [mode, text]);
  const stats = useMemo(() => textStats(text), [text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key.toLowerCase() !== 'c' ||
        !event.shiftKey ||
        !(event.metaKey || event.ctrlKey) ||
        !result ||
        target?.matches('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      event.preventDefault();
      void navigator.clipboard
        .writeText(result)
        .then(() => setShortcutCopied(true))
        .catch(() => undefined);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [result]);

  useEffect(() => {
    if (!shortcutCopied) return;
    const id = window.setTimeout(() => setShortcutCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [shortcutCopied]);

  const clear = () => {
    safeStorage.remove(TEXT_KEY);
    setText('');
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex min-w-0 flex-col">
          <Field label={ui.inputLabel} hint={ui.inputHint}>
            <Textarea
              value={text}
              onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
              placeholder={ui.inputPlaceholder}
              spellcheck={false}
              class="min-h-[220px] lg:min-h-[320px]"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={clear} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>

          <div class="mt-5 border-t border-line pt-5" aria-live="polite">
            <Field label={ui.outputLabel} hint={mode === 'upside-down' ? ui.upsideDownHint : undefined}>
              <Textarea value={result} readOnly placeholder={ui.emptyOutput} class="min-h-[180px]" />
            </Field>
            <div class="mt-3 flex flex-wrap gap-2">
              <CopyButton text={result} label={ui.copy} copiedLabel={ui.copied} />
              <Button size="sm" variant="secondary" onClick={() => setText(result)} disabled={!result}>
                {ui.useResult}
              </Button>
            </div>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <Field label={ui.modeLabel} hint={ui.modeHint}>
            <Segmented<ReverseMode>
              label={ui.modeLabel}
              value={mode}
              onValue={setMode}
              options={[
                { value: 'characters', label: ui.charactersMode },
                { value: 'words', label: ui.wordsMode },
                { value: 'each-word', label: ui.eachWordMode },
                { value: 'lines', label: ui.linesMode },
                { value: 'upside-down', label: ui.upsideDownMode },
              ]}
            />
          </Field>

          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.graphemes} value={stats.graphemes} emphasis />
            <Stat label={ui.words} value={stats.words} />
            <Stat label={ui.lines} value={stats.lines} />
          </div>

          <Notice>{ui.graphemeNote}</Notice>
          <p class="text-xs text-subtle">
            {ui.copyShortcut} <Kbd>{ui.shortcutKey}</Kbd>
            {shortcutCopied ? ` · ${ui.copied}` : ''}
          </p>
        </div>
      </div>
    </Panel>
  );
}

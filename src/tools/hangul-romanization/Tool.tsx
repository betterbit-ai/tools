import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Segmented, Textarea, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { hasHangul, romanize, type RomanizationMode } from './logic';

const TEXT_KEY = 'tools:hangul-romanization:text';
const MODE_KEY = 'tools:hangul-romanization:mode';
const CAPS_KEY = 'tools:hangul-romanization:capitalize';

function isMode(value: string | null): value is RomanizationMode {
  return value === 'standard' || value === 'name';
}

export default function HangulRomanization({ ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<RomanizationMode>('standard');
  const [capitalize, setCapitalize] = useState(true);

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? '');
    const savedMode = safeStorage.get(MODE_KEY);
    if (isMode(savedMode)) setMode(savedMode);
    setCapitalize(safeStorage.get(CAPS_KEY) !== 'false');
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (text) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [text]);
  useEffect(() => safeStorage.set(MODE_KEY, mode), [mode]);
  useEffect(() => safeStorage.set(CAPS_KEY, String(capitalize)), [capitalize]);

  const result = useMemo(() => romanize(text, mode, capitalize), [text, mode, capitalize]);
  const showNoHangul = text.trim() !== '' && !hasHangul(text);
  const clear = () => {
    safeStorage.remove(TEXT_KEY);
    setText('');
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex min-w-0 flex-col">
          <Field label={ui.inputLabel} hint={mode === 'standard' ? ui.standardHint : ui.nameHint}>
            <Textarea
              id="hangul-romanization-input"
              value={text}
              onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
              placeholder={mode === 'standard' ? ui.standardPlaceholder : ui.namePlaceholder}
              spellcheck={false}
              class="min-h-52 flex-1 p-4 text-base leading-7 lg:min-h-[360px]"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setText(mode === 'standard' ? ui.standardExample : ui.nameExample)}
            >
              {ui.tryExample}
            </Button>
            <Button size="sm" variant="ghost" onClick={clear} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <Field label={ui.modeLabel}>
            <Segmented
              value={mode}
              onValue={setMode}
              label={ui.modeLabel}
              options={[
                { value: 'standard', label: ui.standardMode },
                { value: 'name', label: ui.nameMode },
              ]}
            />
          </Field>
          <Toggle checked={capitalize} onChecked={setCapitalize} label={ui.capitalize} />
          {mode === 'name' ? <Notice>{ui.passportNotice}</Notice> : null}
          {showNoHangul ? <Notice tone="danger">{ui.noHangul}</Notice> : null}
          <div>
            <label for="hangul-romanization-output" class="mb-1.5 block text-sm font-medium text-fg">
              {ui.outputLabel}
            </label>
            <Textarea
              id="hangul-romanization-output"
              value={result}
              readOnly
              aria-live="polite"
              placeholder={ui.outputPlaceholder}
              class="min-h-40 bg-surface-2 p-3 text-base leading-7"
            />
            <div class="mt-3 flex flex-wrap gap-2">
              <CopyButton text={result} label={ui.copy} copiedLabel={ui.copied} />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

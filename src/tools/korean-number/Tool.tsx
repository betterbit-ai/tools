import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { convertAmount, type AmountParseError } from './logic';

const STORAGE_KEY = 'tools:korean-number:amount';
const DEFAULT_AMOUNT = '10,000,000';
function errorMessage(code: AmountParseError, ui: UI): string {
  return code === 'empty'
    ? ui.errorEmpty
    : code === 'decimal'
      ? ui.errorDecimal
      : code === 'negative'
        ? ui.errorNegative
        : code === 'tooLarge'
          ? ui.errorTooLarge
          : ui.errorInvalid;
}

export default function KoreanNumber({ ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState(DEFAULT_AMOUNT);
  useEffect(() => {
    setInput(safeStorage.get(STORAGE_KEY) ?? DEFAULT_AMOUNT);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (input) safeStorage.set(STORAGE_KEY, input);
    else safeStorage.remove(STORAGE_KEY);
  }, [input, ready]);
  const result = useMemo(() => convertAmount(input), [input]);
  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0">
          <Field label={ui.inputLabel} hint={ui.inputHint}>
            <TextInput
              value={input}
              onInput={(event) => setInput((event.currentTarget as HTMLInputElement).value)}
              placeholder={ui.inputPlaceholder}
              inputMode="numeric"
              autocomplete="off"
              spellcheck={false}
              class="font-mono"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setInput(DEFAULT_AMOUNT)}>
              {ui.reset}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
        </div>
        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <h2 class="text-sm font-medium text-fg">{ui.resultsHeading}</h2>
          <p class="mt-1 text-xs leading-5 text-subtle">{ui.resultsHint}</p>
        </div>
      </div>
      {!result.ok ? (
        <div class="mt-5">
          <Notice tone="danger">{errorMessage(result.code, ui)}</Notice>
        </div>
      ) : (
        <div class="mt-6 border-t border-line pt-5" aria-live="polite">
          <div class="grid gap-3 sm:grid-cols-2">
            {[
              [ui.plainLabel, result.plain],
              [ui.amountLabel, result.amount],
              [ui.geumLabel, result.geum],
              [ui.ilgeumLabel, result.ilgeum],
            ].map(([label, value]) => (
              <article class="min-w-0 rounded-lg border border-line bg-surface-2 p-3">
                <div class="flex items-start justify-between gap-3">
                  <h2 class="text-sm font-medium text-fg">{label}</h2>
                  <CopyButton text={value} label={ui.copy} copiedLabel={ui.copied} />
                </div>
                <p class="mt-3 break-words text-lg font-medium leading-7 text-fg">{value}</p>
              </article>
            ))}
          </div>
          <div class="mt-4">
            <Notice>{ui.notice}</Notice>
          </div>
        </div>
      )}
    </Panel>
  );
}

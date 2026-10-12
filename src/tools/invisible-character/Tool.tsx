import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, NumberInput, Panel, Segmented, Stat, Textarea } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_COUNT,
  getInvisibleCharacter,
  inspectText,
  makeInvisibleText,
  normalizeCount,
  type InvisibleCharacterId,
} from './logic';

const SETTINGS_KEY = 'tools:invisible-character:settings';
const IDS: InvisibleCharacterId[] = ['hangul-filler', 'braille-blank', 'zero-width-space', 'word-joiner'];

function isCharacterId(value: unknown): value is InvisibleCharacterId {
  return typeof value === 'string' && IDS.includes(value as InvisibleCharacterId);
}

export default function InvisibleCharacter({ locale, ui }: ToolProps<UI>) {
  const [characterId, setCharacterId] = useState<InvisibleCharacterId>('hangul-filler');
  const [count, setCount] = useState(1);
  const [pastedText, setPastedText] = useState('');
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(SETTINGS_KEY) ?? '{}') as { characterId?: unknown; count?: unknown };
      if (isCharacterId(saved.characterId)) setCharacterId(saved.characterId);
      if (typeof saved.count === 'number') setCount(normalizeCount(saved.count));
    } catch {
      safeStorage.remove(SETTINGS_KEY);
    }
    setSettingsReady(true);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    safeStorage.set(SETTINGS_KEY, JSON.stringify({ characterId, count: normalizeCount(count) }));
  }, [characterId, count, settingsReady]);

  const selected = getInvisibleCharacter(characterId);
  const generated = useMemo(() => makeInvisibleText(characterId, count), [characterId, count]);
  const inspection = useMemo(() => inspectText(pastedText), [pastedText]);
  const n = (value: number) => formatNumber(value, locale);
  const labels: Record<InvisibleCharacterId, string> = {
    'hangul-filler': ui.hangulFiller,
    'braille-blank': ui.brailleBlank,
    'zero-width-space': ui.zeroWidthSpace,
    'word-joiner': ui.wordJoiner,
  };
  const uses: Record<InvisibleCharacterId, string> = {
    'hangul-filler': ui.hangulFillerUse,
    'braille-blank': ui.brailleBlankUse,
    'zero-width-space': ui.zeroWidthSpaceUse,
    'word-joiner': ui.wordJoinerUse,
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0 space-y-5">
          <Field label={ui.characterLabel}>
            <Segmented
              value={characterId}
              onValue={setCharacterId}
              label={ui.characterLabel}
              options={IDS.map((id) => ({ value: id, label: labels[id] }))}
            />
          </Field>

          <div class="rounded-lg border border-line bg-surface-2 p-4">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h2 class="text-sm font-medium text-fg">{labels[characterId]}</h2>
              <code class="font-mono text-sm text-accent">{selected.codePoint}</code>
            </div>
            <p class="mt-2 text-sm leading-6 text-muted">{uses[characterId]}</p>
          </div>

          <Field label={ui.quantityLabel} hint={ui.quantityHint}>
            <NumberInput
              value={count}
              min={1}
              max={MAX_COUNT}
              step={1}
              onValue={(value) => setCount(value === '' ? 1 : normalizeCount(value))}
            />
          </Field>

          <div class="rounded-lg border border-line bg-bg p-4">
            <h2 class="text-sm font-medium text-fg">{ui.preview}</h2>
            <p
              class="mt-3 overflow-hidden font-mono text-lg text-fg"
              aria-label={ui.generatedDescription.replace('{n}', n(count))}
            >
              {ui.previewStart}
              <span>{generated}</span>
              {ui.previewEnd}
            </p>
          </div>
          <CopyButton text={generated} label={ui.copy} copiedLabel={ui.copied} size="md" variant="primary" />
        </div>

        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.selectedCharacter} value={selected.codePoint} emphasis />
            <Stat label={ui.generated} value={n(normalizeCount(count))} emphasis />
          </div>
          <Notice>{ui.platformNote}</Notice>
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-5">
        <Field label={ui.testerLabel} hint={ui.testerHint}>
          <Textarea
            value={pastedText}
            onInput={(event) => setPastedText((event.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.testerPlaceholder}
            spellcheck={false}
          />
        </Field>

        {pastedText ? (
          <div class="mt-4 space-y-4" aria-live="polite">
            <div class="grid grid-cols-2 gap-2 sm:max-w-sm">
              <Stat label={ui.totalCharacters} value={n(inspection.characters)} />
              <Stat label={ui.recognizedCharacters} value={n(inspection.recognized)} />
            </div>
            <div>
              <h2 class="mb-2 text-sm font-medium text-fg">{ui.detectedCharacters}</h2>
              <ul class="grid gap-2 sm:grid-cols-2">
                {inspection.entries.map((entry) => (
                  <li class="flex items-center justify-between gap-3 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm">
                    <span class="min-w-0 text-fg">{entry.id ? labels[entry.id] : ui.otherCharacter}</span>
                    <span class="shrink-0 text-right font-mono text-xs text-muted">
                      {entry.codePoint} · {ui.count.replace('{n}', n(entry.count))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div class="mt-4">
            <Notice>{ui.noText}</Notice>
          </div>
        )}
      </div>
    </Panel>
  );
}

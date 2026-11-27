import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  ColorInput,
  CopyButton,
  FieldGroup,
  Notice,
  Panel,
  Select,
  Stat,
  TextInput,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  accessibilitySummary,
  contrastLevel,
  formatCss,
  formatHexList,
  formatJson,
  formatTailwind,
  generatePalette,
  normalizeHex,
  HARMONIES,
  type Harmony,
} from './logic';

const STORAGE_KEY = 'tools:palette-generator:state';
const DEFAULT_STATE = { base: '#3b82f6', harmony: 'analogous' as Harmony, count: 5 };
const COUNTS = [3, 4, 5, 6, 7, 8];

interface StoredState {
  base: string;
  harmony: Harmony;
  count: number;
}

function readStored(): StoredState {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<StoredState> | null;
    if (!saved) return DEFAULT_STATE;
    return {
      base: normalizeHex(saved.base ?? '') ?? DEFAULT_STATE.base,
      harmony: HARMONIES.includes(saved.harmony as Harmony) ? (saved.harmony as Harmony) : DEFAULT_STATE.harmony,
      count: COUNTS.includes(Number(saved.count)) ? Number(saved.count) : DEFAULT_STATE.count,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function PaletteGenerator({ ui }: ToolProps<UI>) {
  const [state, setState] = useState<StoredState>(DEFAULT_STATE);
  const [baseInput, setBaseInput] = useState(DEFAULT_STATE.base);

  useEffect(() => {
    const stored = readStored();
    setState(stored);
    setBaseInput(stored.base);
  }, []);

  useEffect(() => {
    safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const base = normalizeHex(baseInput);
  const palette = useMemo(
    () => (base ? generatePalette({ base, harmony: state.harmony, count: state.count }) : []),
    [base, state.harmony, state.count],
  );
  const summary = accessibilitySummary(palette);
  const harmonyLabel = (value: Harmony) =>
    ({
      analogous: ui.harmonyAnalogous,
      monochrome: ui.harmonyMonochrome,
      complementary: ui.harmonyComplementary,
      split: ui.harmonySplit,
      triadic: ui.harmonyTriadic,
      tetradic: ui.harmonyTetradic,
    })[value];

  const update = (patch: Partial<StoredState>) => setState((current) => ({ ...current, ...patch }));

  return (
    <Panel>
      <div class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <FieldGroup label={ui.baseLabel} hint={ui.baseHint}>
            <div class="flex items-center gap-2">
              <ColorInput
                value={base ?? DEFAULT_STATE.base}
                aria-label={ui.basePicker}
                onInput={(event) => {
                  const next = (event.currentTarget as HTMLInputElement).value;
                  setBaseInput(next);
                  update({ base: next });
                }}
              />
              <TextInput
                value={baseInput}
                aria-label={ui.baseHex}
                spellcheck={false}
                autocomplete="off"
                class="font-mono"
                onInput={(event) => {
                  const next = (event.currentTarget as HTMLInputElement).value;
                  setBaseInput(next);
                  const normalized = normalizeHex(next);
                  if (normalized) update({ base: normalized });
                }}
              />
            </div>
          </FieldGroup>
          <FieldGroup label={ui.harmonyLabel}>
            <Select<Harmony>
              value={state.harmony}
              ariaLabel={ui.harmonyLabel}
              onValue={(harmony) => update({ harmony })}
              options={HARMONIES.map((value) => ({ value, label: harmonyLabel(value) }))}
            />
          </FieldGroup>
          <FieldGroup label={ui.countLabel}>
            <Select<string>
              value={String(state.count)}
              ariaLabel={ui.countLabel}
              onValue={(count) => update({ count: Number(count) })}
              options={COUNTS.map((value) => ({ value: String(value), label: String(value) }))}
            />
          </FieldGroup>
        </div>

        {!base && <Notice tone="danger">{ui.invalidHex}</Notice>}

        {palette.length > 0 && (
          <>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-live="polite">
              {palette.map((color, index) => {
                const level = contrastLevel(Math.max(color.onWhite, color.onBlack));
                return (
                  <div
                    key={`${color.hex}-${index}`}
                    class="overflow-hidden rounded-lg border border-line"
                    style={{ backgroundColor: color.hex, color: color.textColor }}
                  >
                    <div class="flex h-24 items-end justify-between px-3 pb-2">
                      <span class="text-lg font-semibold tabular" aria-label={`${ui.swatchText}: ${color.hex}`}>
                        Aa
                      </span>
                      <span class="text-xs tabular opacity-80">{index === 0 ? ui.baseBadge : `${level}`}</span>
                    </div>
                    <div class="px-3 pb-3">
                      <p class="font-mono text-xs tabular">{color.hex}</p>
                      <p class="mt-1 text-[11px] opacity-80 tabular">
                        L {color.oklch.l.toFixed(2)} · {color.onWhite.toFixed(1)}:1 / {color.onBlack.toFixed(1)}:1
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label={ui.statAaOnWhite} value={`${summary.onWhite}/${summary.total}`} />
              <Stat label={ui.statAaOnBlack} value={`${summary.onBlack}/${summary.total}`} />
              <Stat label={ui.statLightnessStep} value={ui.lightnessStepValue} />
            </div>
            <p class="text-xs leading-5 text-subtle">{ui.contrastHint}</p>

            <div class="rounded-lg border border-line bg-surface-2 p-4">
              <p class="text-sm font-medium text-fg">{ui.exportHeading}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <CopyButton text={formatCss(palette)} label={ui.copyCss} copiedLabel={ui.copied} />
                <CopyButton text={formatTailwind(palette)} label={ui.copyTailwind} copiedLabel={ui.copied} />
                <CopyButton
                  text={formatJson(palette, base ?? '', state.harmony)}
                  label={ui.copyJson}
                  copiedLabel={ui.copied}
                />
                <CopyButton text={formatHexList(palette)} label={ui.copyHex} copiedLabel={ui.copied} />
              </div>
              <pre class="mt-3 overflow-x-auto rounded-md border border-line bg-bg p-3 font-mono text-xs leading-5 text-fg">
                {formatCss(palette)}
              </pre>
            </div>
          </>
        )}

        <div class="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setState(DEFAULT_STATE);
              setBaseInput(DEFAULT_STATE.base);
            }}
          >
            {ui.reset}
          </Button>
          <span class="ml-auto text-xs text-subtle">{ui.savedLocally}</span>
        </div>
      </div>
    </Panel>
  );
}

import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { contrastRatio, convertHex, convertRgb, type ColorParseResult } from './logic';

const STORAGE_KEY = 'tools:color-converter:state';

interface ColorState {
  source: 'hex' | 'rgb';
  hex: string;
  r: string;
  g: string;
  b: string;
}

const DEFAULT_STATE: ColorState = { source: 'hex', hex: '#3B82F6', r: '59', g: '130', b: '246' };

function restoreState(): ColorState {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<ColorState> | null;
    if (
      !saved ||
      (saved.source !== 'hex' && saved.source !== 'rgb') ||
      typeof saved.hex !== 'string' ||
      typeof saved.r !== 'string' ||
      typeof saved.g !== 'string' ||
      typeof saved.b !== 'string' ||
      saved.hex.length > 20 ||
      saved.r.length > 4 ||
      saved.g.length > 4 ||
      saved.b.length > 4
    ) {
      return DEFAULT_STATE;
    }
    return saved as ColorState;
  } catch {
    return DEFAULT_STATE;
  }
}

function isIntegerText(value: string): boolean {
  return /^\d+$/.test(value);
}

function rgbResult(state: ColorState): ColorParseResult {
  if (!isIntegerText(state.r) || !isIntegerText(state.g) || !isIntegerText(state.b)) {
    return { ok: false, code: 'invalidRgb' };
  }
  return convertRgb({ r: Number(state.r), g: Number(state.g), b: Number(state.b) });
}

function pass(value: number, threshold: number, ui: UI): string {
  return value >= threshold ? ui.pass : ui.fail;
}

function ContrastCard(props: { label: string; ratio: number; ui: UI }) {
  const ratio = `${props.ratio.toFixed(2)}:1`;
  return (
    <div class="rounded-md border border-line bg-surface-2 p-3">
      <p class="text-sm font-medium text-fg">{props.label}</p>
      <p class="mt-1 tabular text-2xl font-semibold tracking-tight text-fg">{ratio}</p>
      <div class="mt-3 grid gap-1 text-xs text-muted sm:grid-cols-2">
        <span>
          {props.ui.aaNormal}: {pass(props.ratio, 4.5, props.ui)}
        </span>
        <span>
          {props.ui.aaLarge}: {pass(props.ratio, 3, props.ui)}
        </span>
        <span>
          {props.ui.aaaNormal}: {pass(props.ratio, 7, props.ui)}
        </span>
        <span>
          {props.ui.aaaLarge}: {pass(props.ratio, 4.5, props.ui)}
        </span>
      </div>
    </div>
  );
}

function ResultValue(props: { label: string; value: string; ui: UI }) {
  return (
    <div class="min-w-0 rounded-md border border-line bg-surface-2 p-3">
      <p class="text-xs text-muted">{props.label}</p>
      <p class="mt-1 overflow-auto whitespace-nowrap font-mono text-sm text-fg">{props.value}</p>
      <div class="mt-3">
        <CopyButton text={props.value} label={props.ui.copy} copiedLabel={props.ui.copied} />
      </div>
    </div>
  );
}

export default function ColorConverter({ ui }: ToolProps<UI>) {
  const [state, setState] = useState<ColorState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const result = useMemo(() => (state.source === 'hex' ? convertHex(state.hex) : rgbResult(state)), [state]);
  const displayedHex = state.source === 'rgb' && result.ok ? result.conversion.hex : state.hex;
  const displayedChannel = (channel: 'r' | 'g' | 'b') =>
    state.source === 'hex' && result.ok ? String(result.conversion.color[channel]) : state[channel];
  const updateHex = (hex: string) => {
    const parsed = convertHex(hex);
    setState((current) =>
      parsed.ok
        ? {
            ...current,
            source: 'hex',
            hex,
            r: String(parsed.conversion.color.r),
            g: String(parsed.conversion.color.g),
            b: String(parsed.conversion.color.b),
          }
        : { ...current, source: 'hex', hex },
    );
  };
  const updateChannel = (channel: 'r' | 'g' | 'b', value: string) =>
    setState((current) => ({ ...current, source: 'rgb', [channel]: value }));
  const chooseColor = (hex: string) => {
    const selected = convertHex(hex);
    if (!selected.ok) return;
    const { r, g, b } = selected.conversion.color;
    setState({ source: 'hex', hex: selected.conversion.hex, r: String(r), g: String(g), b: String(b) });
  };
  const error = result.ok
    ? null
    : result.code === 'empty'
      ? ui.errorEmpty
      : result.code === 'invalidHex'
        ? ui.errorHex
        : ui.errorRgb;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="flex flex-col gap-5">
          <Field label={ui.hexLabel} hint={ui.hexHint}>
            <TextInput
              value={displayedHex}
              onInput={(event) => updateHex((event.currentTarget as HTMLInputElement).value)}
              placeholder={ui.hexPlaceholder}
              spellcheck={false}
              autocomplete="off"
              autocapitalize="characters"
              class="font-mono"
            />
          </Field>

          <Field label={ui.rgbLabel} hint={ui.channelHint}>
            <div class="grid grid-cols-3 gap-2">
              {(
                [
                  ['r', ui.redLabel],
                  ['g', ui.greenLabel],
                  ['b', ui.blueLabel],
                ] as const
              ).map(([channel, label]) => (
                <div class="min-w-0">
                  <span class="mb-1 block text-xs text-muted">{label}</span>
                  <TextInput
                    value={displayedChannel(channel)}
                    onInput={(event) => updateChannel(channel, (event.currentTarget as HTMLInputElement).value)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autocomplete="off"
                    aria-label={label}
                    class="min-w-0 font-mono tabular"
                  />
                </div>
              ))}
            </div>
          </Field>

          <div class="flex flex-wrap items-end gap-3">
            <Field label={ui.pickerLabel} class="w-24">
              <TextInput
                type="color"
                value={result.ok ? result.conversion.hex : DEFAULT_STATE.hex}
                onInput={(event) => chooseColor((event.currentTarget as HTMLInputElement).value)}
                aria-label={ui.pickerLabel}
                class="h-10 w-full cursor-pointer p-1"
              />
            </Field>
            <Button size="sm" variant="secondary" onClick={() => setState(DEFAULT_STATE)}>
              {ui.reset}
            </Button>
            <span class="mb-1 text-xs text-subtle">{ui.saved}</span>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div>
            <h3 class="text-sm font-medium text-fg">{ui.contrastTitle}</h3>
            <p class="mt-1 text-xs leading-5 text-subtle">{ui.contrastHint}</p>
          </div>
          {result.ok ? (
            <div class="grid gap-3" aria-live="polite">
              <ContrastCard
                label={ui.onWhiteLabel}
                ratio={contrastRatio(result.conversion.color, { r: 255, g: 255, b: 255 })}
                ui={ui}
              />
              <ContrastCard
                label={ui.onBlackLabel}
                ratio={contrastRatio(result.conversion.color, { r: 0, g: 0, b: 0 })}
                ui={ui}
              />
              <Stat label={ui.luminanceLabel} value={result.conversion.luminance.toFixed(4)} />
            </div>
          ) : (
            <Notice tone="danger">{error}</Notice>
          )}
        </div>
      </div>

      {result.ok ? (
        <div class="mt-6 border-t border-line pt-6" aria-live="polite">
          <h3 class="text-sm font-medium text-fg">{ui.resultsTitle}</h3>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <ResultValue label={ui.hexLabel} value={result.conversion.hex} ui={ui} />
            <ResultValue label={ui.rgbLabel} value={result.conversion.rgb} ui={ui} />
            <ResultValue label={ui.hslLabel} value={result.conversion.hsl} ui={ui} />
            <ResultValue label={ui.oklchLabel} value={result.conversion.oklch} ui={ui} />
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

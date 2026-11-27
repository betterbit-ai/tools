import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  ColorInput,
  CopyButton,
  FieldGroup,
  NumberInput,
  Panel,
  Segmented,
  TextInput,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  addStop,
  clamp,
  gradientCss,
  normalizeHex,
  removeStop,
  srgbPreview,
  INTERPOLATIONS,
  MAX_STOPS,
  MIN_STOPS,
  PRESETS,
  type GradientSettings,
  type GradientStop,
  type GradientType,
  type Interpolation,
} from './logic';

const STORAGE_KEY = 'tools:gradient-generator:settings';

const DEFAULT_SETTINGS: GradientSettings = {
  type: 'linear',
  angle: 135,
  interpolation: 'oklch',
  stops: [
    { id: '1', hex: '#ff2d87', position: 0 },
    { id: '2', hex: '#ffb800', position: 100 },
  ],
};

function readStored(): GradientSettings {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<GradientSettings> | null;
    if (!saved || !Array.isArray(saved.stops) || saved.stops.length < MIN_STOPS) return DEFAULT_SETTINGS;
    const stops = saved.stops
      .filter((stop) => typeof stop?.hex === 'string' && Number.isFinite(stop.position))
      .slice(0, MAX_STOPS)
      .map((stop, index) => ({
        id: String(index + 1),
        hex: normalizeHex(stop.hex) ?? '#000000',
        position: clamp(Number(stop.position), 0, 100),
      }));
    if (stops.length < MIN_STOPS) return DEFAULT_SETTINGS;
    return {
      type: saved.type === 'radial' || saved.type === 'conic' ? saved.type : 'linear',
      angle: Number.isFinite(saved.angle) ? Number(saved.angle) : DEFAULT_SETTINGS.angle,
      interpolation: saved.interpolation === 'srgb' ? 'srgb' : 'oklch',
      stops,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function GradientGenerator({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<GradientSettings>(DEFAULT_SETTINGS);
  const [hexDraft, setHexDraft] = useState<Record<string, string>>({});
  const [nextId, setNextId] = useState(3);

  useEffect(() => setSettings(readStored()), []);
  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(settings)), [settings]);

  const css = useMemo(() => gradientCss(settings), [settings]);
  const comparison = useMemo(() => srgbPreview(settings), [settings]);
  const update = (patch: Partial<GradientSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const updateStop = (id: string, patch: Partial<GradientStop>) =>
    setSettings((current) => ({
      ...current,
      stops: current.stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)),
    }));

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((entry) => entry.id === id);
    if (!preset) return;
    setSettings({
      type: preset.type,
      angle: preset.angle,
      interpolation: settings.interpolation,
      stops: preset.stops.map(([hex, position], index) => ({ id: String(index + 1), hex, position })),
    });
    setNextId(preset.stops.length + 1);
    setHexDraft({});
  };

  const typeLabel: Record<GradientType, string> = {
    linear: ui.typeLinear,
    radial: ui.typeRadial,
    conic: ui.typeConic,
  };

  return (
    <Panel>
      <div class="space-y-5">
        <div
          class="h-48 w-full rounded-lg border border-line sm:h-64"
          style={{ backgroundImage: css.modern.replace('background-image: ', '').replace(/;$/, '') }}
          role="img"
          aria-label={ui.previewAlt}
        />

        <div class="grid gap-4 sm:grid-cols-2">
          <FieldGroup label={ui.typeLabel}>
            <Segmented<GradientType>
              value={settings.type}
              label={ui.typeLabel}
              onValue={(type) => update({ type })}
              options={(['linear', 'radial', 'conic'] as GradientType[]).map((value) => ({
                value,
                label: typeLabel[value],
              }))}
            />
          </FieldGroup>
          <FieldGroup label={ui.angleLabel} hint={settings.type === 'radial' ? ui.angleHiddenHint : ui.angleHint}>
            <div class="flex items-center gap-2">
              <NumberInput
                value={settings.angle}
                aria-label={ui.angleLabel}
                min={0}
                max={359}
                step={1}
                disabled={settings.type === 'radial'}
                onValue={(value) => update({ angle: typeof value === 'number' ? Math.round(value) : 0 })}
              />
              <span class="text-sm text-muted">deg</span>
            </div>
          </FieldGroup>
        </div>

        <FieldGroup label={ui.interpolationLabel} hint={ui.interpolationHint}>
          <Segmented<Interpolation>
            value={settings.interpolation}
            label={ui.interpolationLabel}
            onValue={(interpolation) => update({ interpolation })}
            options={INTERPOLATIONS.map((value) => ({
              value,
              label: value === 'oklch' ? ui.interpolationOklch : ui.interpolationSrgb,
            }))}
          />
        </FieldGroup>

        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-medium text-fg">{ui.stopsHeading}</p>
            <Button
              size="sm"
              onClick={() => {
                setSettings((current) => ({ ...current, stops: addStop(current.stops, String(nextId)) }));
                setNextId((id) => id + 1);
              }}
              disabled={settings.stops.length >= MAX_STOPS}
            >
              {ui.addStop}
            </Button>
          </div>

          {settings.stops.map((stop, index) => (
            <div
              key={stop.id}
              class="grid grid-cols-[auto_minmax(0,1fr)_5.5rem_auto] items-center gap-2 rounded-lg border border-line bg-surface-2 px-2 py-2"
            >
              <ColorInput
                value={stop.hex}
                aria-label={`${ui.stopColor} ${index + 1}`}
                onInput={(event) => {
                  const hex = (event.currentTarget as HTMLInputElement).value;
                  updateStop(stop.id, { hex });
                  setHexDraft((draft) => ({ ...draft, [stop.id]: hex }));
                }}
              />
              <TextInput
                value={hexDraft[stop.id] ?? stop.hex}
                aria-label={`${ui.stopHex} ${index + 1}`}
                spellcheck={false}
                autocomplete="off"
                class="font-mono"
                onInput={(event) => {
                  const value = (event.currentTarget as HTMLInputElement).value;
                  setHexDraft((draft) => ({ ...draft, [stop.id]: value }));
                  const normalized = normalizeHex(value);
                  if (normalized) updateStop(stop.id, { hex: normalized });
                }}
              />
              <NumberInput
                value={stop.position}
                aria-label={`${ui.stopPosition} ${index + 1}`}
                min={0}
                max={100}
                step={1}
                onValue={(value) =>
                  updateStop(stop.id, { position: clamp(typeof value === 'number' ? value : 0, 0, 100) })
                }
              />
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ui.removeStop} ${index + 1}`}
                onClick={() => setSettings((current) => ({ ...current, stops: removeStop(current.stops, stop.id) }))}
                disabled={settings.stops.length <= MIN_STOPS}
              >
                ✕
              </Button>
            </div>
          ))}
          <p class="text-xs leading-5 text-subtle">{ui.stopsHint}</p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="mb-1 text-xs font-medium text-muted">{ui.comparisonSrgb}</p>
            <div
              class="h-16 rounded-md border border-line"
              style={{ backgroundImage: comparison }}
              role="img"
              aria-label={ui.comparisonSrgb}
            />
          </div>
          <div>
            <p class="mb-1 text-xs font-medium text-muted">{ui.comparisonOklch}</p>
            <div
              class="h-16 rounded-md border border-line"
              style={{ backgroundImage: css.modern.replace('background-image: ', '').replace(/;$/, '') }}
              role="img"
              aria-label={ui.comparisonOklch}
            />
          </div>
        </div>
        <p class="text-xs leading-5 text-subtle">{ui.comparisonHint}</p>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-medium text-fg">{ui.cssHeading}</p>
            <div class="flex flex-wrap gap-2">
              <CopyButton text={css.block} label={ui.copyCss} copiedLabel={ui.copied} />
              <CopyButton
                text={css.modern.replace('background-image: ', '').replace(/;$/, '')}
                label={ui.copyValue}
                copiedLabel={ui.copied}
              />
            </div>
          </div>
          <pre class="mt-3 overflow-x-auto rounded-md border border-line bg-bg p-3 font-mono text-xs leading-5 text-fg">
            {css.block}
          </pre>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-muted">{ui.presetsLabel}</span>
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              size="sm"
              variant="ghost"
              onClick={() => applyPreset(preset.id)}
              aria-label={`${ui.presetLoad}: ${preset.id}`}
            >
              {preset.id}
            </Button>
          ))}
          <span class="ml-auto text-xs text-subtle">{ui.savedLocally}</span>
        </div>
      </div>
    </Panel>
  );
}

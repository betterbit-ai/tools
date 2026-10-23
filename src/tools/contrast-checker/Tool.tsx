import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  ColorContrastPreview,
  ColorInput,
  CopyButton,
  Field,
  Notice,
  Panel,
  Stat,
  TextInput,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateContrast, passes, WCAG_THRESHOLDS } from './logic';

const STORAGE_KEY = 'tools:contrast-checker:state';
const DEFAULT_FOREGROUND = '#1F2937';
const DEFAULT_BACKGROUND = '#FFFFFF';

interface StoredState {
  foreground: string;
  background: string;
}

function restoredState(): StoredState {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<StoredState> | null;
    if (!saved || typeof saved.foreground !== 'string' || typeof saved.background !== 'string') {
      return { foreground: DEFAULT_FOREGROUND, background: DEFAULT_BACKGROUND };
    }
    return { foreground: saved.foreground.slice(0, 7), background: saved.background.slice(0, 7) };
  } catch {
    return { foreground: DEFAULT_FOREGROUND, background: DEFAULT_BACKGROUND };
  }
}

function status(value: boolean, ui: UI): string {
  return value ? ui.pass : ui.fail;
}

export default function ContrastChecker({ ui }: ToolProps<UI>) {
  const [colors, setColors] = useState<StoredState>({ foreground: DEFAULT_FOREGROUND, background: DEFAULT_BACKGROUND });
  const [ready, setReady] = useState(false);
  const result = useMemo(() => calculateContrast(colors.foreground, colors.background), [colors]);

  useEffect(() => {
    setColors(restoredState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(colors));
  }, [colors, ready]);

  const update = (key: keyof StoredState, value: string) => setColors((current) => ({ ...current, [key]: value }));
  const usePicker = (key: keyof StoredState, value: string) => update(key, value.toUpperCase());
  const reset = () => setColors({ foreground: DEFAULT_FOREGROUND, background: DEFAULT_BACKGROUND });
  const swap = () => setColors((current) => ({ foreground: current.background, background: current.foreground }));
  const ratio = result ? `${result.ratio.toFixed(2)}:1` : '—';
  const apca = result ? `${result.apca.toFixed(1)} Lc` : '—';
  const copyText = result
    ? [
        `${ui.foreground}: ${result.foregroundHex}`,
        `${ui.background}: ${result.backgroundHex}`,
        `${ui.wcagRatio}: ${ratio}`,
        `${ui.apca}: ${apca}`,
        `${ui.aaNormal} (4.5:1): ${status(passes(result.ratio, WCAG_THRESHOLDS.aaNormal), ui)}`,
        `${ui.aaLarge} (3:1): ${status(passes(result.ratio, WCAG_THRESHOLDS.aaLarge), ui)}`,
        `${ui.aaaNormal} (7:1): ${status(passes(result.ratio, WCAG_THRESHOLDS.aaaNormal), ui)}`,
        `${ui.aaaLarge} (4.5:1): ${status(passes(result.ratio, WCAG_THRESHOLDS.aaaLarge), ui)}`,
      ].join('\n')
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <Field label={ui.foreground} hint={ui.hexHint}>
              <div class="flex gap-2">
                <ColorInput
                  value={result?.foregroundHex ?? DEFAULT_FOREGROUND}
                  onInput={(event) => usePicker('foreground', (event.currentTarget as HTMLInputElement).value)}
                  aria-label={ui.foregroundPicker}
                />
                <TextInput
                  value={colors.foreground}
                  onInput={(event) => update('foreground', (event.currentTarget as HTMLInputElement).value)}
                  placeholder="#1F2937"
                  aria-label={ui.foregroundHex}
                  spellcheck={false}
                  autocomplete="off"
                  autocapitalize="characters"
                  class="font-mono"
                />
              </div>
            </Field>
            <Field label={ui.background} hint={ui.hexHint}>
              <div class="flex gap-2">
                <ColorInput
                  value={result?.backgroundHex ?? DEFAULT_BACKGROUND}
                  onInput={(event) => usePicker('background', (event.currentTarget as HTMLInputElement).value)}
                  aria-label={ui.backgroundPicker}
                />
                <TextInput
                  value={colors.background}
                  onInput={(event) => update('background', (event.currentTarget as HTMLInputElement).value)}
                  placeholder="#FFFFFF"
                  aria-label={ui.backgroundHex}
                  spellcheck={false}
                  autocomplete="off"
                  autocapitalize="characters"
                  class="font-mono"
                />
              </div>
            </Field>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button size="sm" onClick={swap} disabled={!result}>
              {ui.swap}
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>
              {ui.reset}
            </Button>
            <CopyButton text={copyText} label={ui.copyResults} copiedLabel={ui.copied} />
          </div>

          {result ? (
            <ColorContrastPreview
              foreground={result.foregroundHex}
              background={result.backgroundHex}
              title={ui.previewTitle}
              body={ui.previewBody}
              button={ui.previewButton}
              label={ui.previewLabel}
            />
          ) : (
            <Notice tone="danger">{ui.invalidColor}</Notice>
          )}
        </div>

        <aside class="space-y-4" aria-live="polite">
          <div class="grid grid-cols-2 gap-2">
            <Stat label={ui.wcagRatio} value={ratio} emphasis />
            <Stat label={ui.apca} value={apca} />
          </div>
          {result && (
            <div class="space-y-2 rounded-md border border-line p-3 text-sm">
              {(
                [
                  [ui.aaNormal, WCAG_THRESHOLDS.aaNormal],
                  [ui.aaLarge, WCAG_THRESHOLDS.aaLarge],
                  [ui.aaaNormal, WCAG_THRESHOLDS.aaaNormal],
                  [ui.aaaLarge, WCAG_THRESHOLDS.aaaLarge],
                  [ui.nonText, WCAG_THRESHOLDS.nonText],
                ] as [string, number][]
              ).map(([label, threshold]) => (
                <div class="flex items-center justify-between gap-3">
                  <span class="text-muted">
                    {label} · ≥ {threshold}:1
                  </span>
                  <span
                    class={passes(result.ratio, threshold) ? 'font-medium text-success' : 'font-medium text-danger'}
                  >
                    {status(passes(result.ratio, threshold), ui)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Notice>{ui.apcaNote}</Notice>
        </aside>
      </div>
    </Panel>
  );
}

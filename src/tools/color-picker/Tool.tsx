import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, ColorSwatch, CopyButton, Dropzone, Field, Kbd, Notice, Panel, Select } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import { imagePalette, loadImage, releaseImage, samplePixel, type LoadedImage } from './image';
import type { UI } from './content';
import {
  isImageFile,
  normalizePaletteSize,
  paletteToCss,
  toHex,
  toHsl,
  toRgb,
  type PaletteColor,
  type RgbColor,
} from './logic';

const HISTORY_KEY = 'tools:color-picker:history';

interface Pick {
  color: RgbColor;
  x: number;
  y: number;
}

function restoreHistory(): string[] {
  try {
    const parsed = JSON.parse(safeStorage.get(HISTORY_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === 'string' && /^#[0-9A-F]{6}$/u.test(value))
      .slice(0, 8);
  } catch {
    return [];
  }
}

function apply(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
}

export default function ColorPicker({ ui }: ToolProps<UI>) {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [paletteSize, setPaletteSize] = useState(5);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [pick, setPick] = useState<Pick | null>(null);
  const [history, setHistory] = useState(restoreHistory);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef<LoadedImage | null>(null);
  const previewRef = useRef<HTMLImageElement>(null);

  const saveHistory = useCallback((hex: string) => {
    setHistory((previous) => {
      const next = [hex, ...previous.filter((value) => value !== hex)].slice(0, 8);
      safeStorage.set(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const pickAt = useCallback(
    (x: number, y: number, target = imageRef.current) => {
      if (!target) return;
      const clampedX = Math.max(0, Math.min(target.width - 1, Math.round(x)));
      const clampedY = Math.max(0, Math.min(target.height - 1, Math.round(y)));
      const color = samplePixel(target, clampedX, clampedY);
      setPick({ color, x: clampedX, y: clampedY });
      saveHistory(toHex(color));
    },
    [saveHistory],
  );

  const clearImage = useCallback(() => {
    releaseImage(imageRef.current);
    imageRef.current = null;
    setImage(null);
    setPalette([]);
    setPick(null);
    setError(false);
    setBusy(false);
  }, []);

  useEffect(() => () => releaseImage(imageRef.current), []);

  const addFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (!isImageFile(file.name, file.type)) {
        setError(true);
        return;
      }
      setBusy(true);
      setError(false);
      try {
        const loaded = await loadImage(file);
        const nextPalette = imagePalette(loaded, paletteSize);
        const centerX = Math.floor((loaded.width - 1) / 2);
        const centerY = Math.floor((loaded.height - 1) / 2);
        const centerPick = { color: samplePixel(loaded, centerX, centerY), x: centerX, y: centerY };
        releaseImage(imageRef.current);
        imageRef.current = loaded;
        setImage(loaded);
        setPalette(nextPalette);
        setPick(centerPick);
        saveHistory(toHex(centerPick.color));
      } catch {
        setError(true);
      } finally {
        setBusy(false);
      }
    },
    [paletteSize, saveHistory],
  );

  const changePaletteSize = (value: string) => {
    const nextSize = normalizePaletteSize(Number(value));
    setPaletteSize(nextSize);
    if (imageRef.current) setPalette(imagePalette(imageRef.current, nextSize));
  };

  const clickPreview = (event: MouseEvent) => {
    const target = imageRef.current;
    const preview = previewRef.current;
    if (!target || !preview) return;
    const rect = preview.getBoundingClientRect();
    pickAt(
      ((event.clientX - rect.left) / rect.width) * target.width,
      ((event.clientY - rect.top) / rect.height) * target.height,
    );
  };

  const nudge = (event: KeyboardEvent) => {
    const target = imageRef.current;
    if (!target) return;
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    pickAt(
      (pick?.x ?? Math.floor(target.width / 2)) + move[0],
      (pick?.y ?? Math.floor(target.height / 2)) + move[1],
      target,
    );
  };

  const selectedHex = pick ? toHex(pick.color) : '';
  const selectedRgb = pick ? toRgb(pick.color) : '';
  const selectedHsl = pick ? toHsl(pick.color) : '';
  const position =
    image && pick
      ? {
          left: `${(pick.x / Math.max(1, image.width - 1)) * 100}%`,
          top: `${(pick.y / Math.max(1, image.height - 1)) * 100}%`,
        }
      : undefined;

  return (
    <Panel>
      {!image ? (
        <div>
          <Dropzone accept="image/*,.avif,.bmp,.svg" onFiles={addFiles} title={ui.uploadTitle} hint={ui.uploadHint} />
          <p class="mt-3 text-xs text-subtle">
            <Kbd>{ui.ctrlKey}</Kbd>/<Kbd>{ui.commandKey}</Kbd> + <Kbd>{ui.vKey}</Kbd> {ui.shortcut}
          </p>
          {busy && <Notice>{ui.loading}</Notice>}
          {error && <Notice tone="danger">{ui.unreadable}</Notice>}
        </div>
      ) : (
        <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section class="min-w-0" aria-label={ui.imageTitle}>
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm">
              <span class="min-w-0 truncate text-fg">
                {apply(ui.imageDetails, { name: image.name, width: image.width, height: image.height })}
              </span>
              <Button size="sm" variant="ghost" onClick={clearImage}>
                {ui.clear}
              </Button>
            </div>
            <div class="rounded-lg border border-line bg-surface-2 p-2">
              <Button
                variant="ghost"
                class="relative h-auto w-full p-0"
                onClick={clickPreview}
                onKeyDown={nudge}
                aria-label={ui.imageInstruction}
              >
                <img
                  ref={previewRef}
                  src={image.url}
                  alt={ui.imageTitle}
                  class="mx-auto max-h-120 max-w-full rounded-sm object-contain"
                />
                {position && (
                  <span
                    aria-hidden="true"
                    class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-line bg-surface shadow-pop"
                    style={position}
                  />
                )}
              </Button>
            </div>
            <p class="mt-3 text-xs text-subtle">{ui.imageInstruction}</p>
          </section>

          <aside class="min-w-0 space-y-5" aria-live="polite">
            {pick && (
              <section>
                <h2 class="text-sm font-medium text-fg">{ui.selectedTitle}</h2>
                <div class="mt-2 flex items-start gap-3 rounded-md bg-surface-2 p-3">
                  <ColorSwatch
                    color={selectedHex}
                    label={apply(ui.swatchLabel, { hex: selectedHex })}
                    class="size-12"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="font-mono text-sm font-medium text-fg">{selectedHex}</p>
                    <p class="mt-1 text-xs text-muted">{apply(ui.selectedPosition, { x: pick.x, y: pick.y })}</p>
                  </div>
                </div>
                <div class="mt-2 space-y-2">
                  {[
                    [ui.hex, selectedHex],
                    [ui.rgb, selectedRgb],
                    [ui.hsl, selectedHsl],
                  ].map(([label, value]) => (
                    <div class="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
                      <span class="min-w-0 truncate font-mono text-xs text-fg">
                        <span class="mr-2 font-sans text-muted">{label}</span>
                        {value}
                      </span>
                      <CopyButton text={value} label={ui.copy} copiedLabel={ui.copied} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section class="border-t border-line pt-5">
              <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 class="text-sm font-medium text-fg">{ui.paletteTitle}</h2>
                  <p class="mt-1 text-xs text-muted">{ui.paletteHint}</p>
                </div>
                <Field label={ui.paletteSize}>
                  <Select
                    value={String(paletteSize)}
                    onValue={changePaletteSize}
                    options={[3, 4, 5, 6, 7, 8].map((value) => ({ value: String(value), label: String(value) }))}
                  />
                </Field>
              </div>
              <div class="mt-3 space-y-2">
                {palette.map((color) => (
                  <div class="flex items-center gap-2 rounded-md border border-line p-2">
                    <ColorSwatch color={color.hex} label={apply(ui.swatchLabel, { hex: color.hex })} />
                    <span class="min-w-0 flex-1 font-mono text-sm text-fg">{color.hex}</span>
                    <span class="text-xs text-muted">{apply(ui.coverage, { percent: color.percent })}</span>
                    <CopyButton text={color.hex} label={ui.copy} copiedLabel={ui.copied} />
                  </div>
                ))}
              </div>
              <div class="mt-3">
                <CopyButton text={paletteToCss(palette)} label={ui.copyCss} copiedLabel={ui.copied} />
              </div>
            </section>
          </aside>
        </div>
      )}

      <section class="mt-6 border-t border-line pt-5" aria-live="polite">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-medium text-fg">{ui.historyTitle}</h2>
            <p class="mt-1 text-xs text-muted">{ui.historyHint}</p>
          </div>
          {history.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setHistory([]);
                safeStorage.remove(HISTORY_KEY);
              }}
            >
              {ui.clearHistory}
            </Button>
          )}
        </div>
        {history.length ? (
          <div class="mt-3 flex flex-wrap gap-2">
            {history.map((hex) => (
              <div class="flex items-center gap-1.5 rounded-md border border-line bg-surface-2 p-1.5">
                <ColorSwatch color={hex} label={apply(ui.swatchLabel, { hex })} />
                <span class="font-mono text-xs text-fg">{hex}</span>
                <CopyButton text={hex} label={ui.copy} copiedLabel={ui.copied} />
              </div>
            ))}
          </div>
        ) : (
          <p class="mt-3 text-sm text-muted">{ui.emptyHistory}</p>
        )}
      </section>
    </Panel>
  );
}

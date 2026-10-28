/** Pure GIF planning and labelling. Browser pixel work lives in encode.ts. */

export const MAX_FRAMES = 30;
export const WIDTH_OPTIONS = [320, 480, 640] as const;
export const DELAY_OPTIONS = [100, 250, 500, 1_000] as const;

export type FitMode = 'contain' | 'cover';

export interface GifSettings {
  width: number;
  delay: number;
  fit: FitMode;
  loop: boolean;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface GifPlan extends GifSettings {
  frames: number;
  height: number;
  pixels: number;
}

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function closest(value: number, options: readonly number[]): number {
  return options.reduce((best, option) => (Math.abs(option - value) < Math.abs(best - value) ? option : best));
}

/**
 * Makes a bounded, reproducible output plan. The first frame fixes the canvas
 * ratio, so every later frame has a stable output size rather than a jumpy GIF.
 */
export function planGif(first: ImageDimensions, frameCount: number, input: GifSettings): GifPlan {
  const sourceWidth = Math.max(1, Math.round(finite(first.width, 1)));
  const sourceHeight = Math.max(1, Math.round(finite(first.height, 1)));
  const width = closest(finite(input.width, 480), WIDTH_OPTIONS);
  const requestedDelay = finite(input.delay, 500);
  const delay = closest(requestedDelay < 0 ? 500 : requestedDelay, DELAY_OPTIONS);
  const frames = Math.min(MAX_FRAMES, Math.max(0, Math.floor(finite(frameCount, 0))));
  const height = Math.max(1, Math.round((width * sourceHeight) / sourceWidth));

  return {
    width,
    height,
    delay,
    fit: input.fit === 'cover' ? 'cover' : 'contain',
    loop: input.loop !== false,
    frames,
    pixels: width * height * frames,
  };
}

/** Placement of a source image on the fixed GIF canvas. */
export function framePlacement(
  source: ImageDimensions,
  output: Pick<GifPlan, 'width' | 'height' | 'fit'>,
): { x: number; y: number; width: number; height: number } {
  const sourceWidth = Math.max(1, finite(source.width, 1));
  const sourceHeight = Math.max(1, finite(source.height, 1));
  const scale =
    output.fit === 'cover'
      ? Math.max(output.width / sourceWidth, output.height / sourceHeight)
      : Math.min(output.width / sourceWidth, output.height / sourceHeight);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  return { x: Math.round((output.width - width) / 2), y: Math.round((output.height - height) / 2), width, height };
}

/** Preserve Unicode file names while ensuring the download is a GIF. */
export function gifFilename(name: string): string {
  const base = name.replace(/\.[^/.]+$/, '').trim() || 'animation';
  return `${base}-animation.gif`;
}

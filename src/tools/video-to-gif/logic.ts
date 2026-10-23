/** Pure planning and labelling for the video-to-GIF tool. No browser APIs here. */

export const MAX_CLIP_SECONDS = 10;
export const MAX_FRAMES = 150;
export const WIDTH_OPTIONS = [240, 320, 480] as const;
export const FPS_OPTIONS = [5, 10, 15] as const;

export interface GifSettings {
  start: number;
  end: number;
  fps: number;
  width: number;
}

export interface GifPlan extends GifSettings {
  duration: number;
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
 * Makes a bounded, reproducible GIF plan. A GIF is a stack of palette-indexed
 * frames, so limiting both clip time and frame count protects phone memory.
 */
export function planGif(sourceWidth: number, sourceHeight: number, duration: number, input: GifSettings): GifPlan {
  const sourceDuration = Math.max(0, finite(duration, 0));
  const start = Math.min(sourceDuration, Math.max(0, finite(input.start, 0)));
  const requestedEnd = Math.min(sourceDuration, Math.max(start, finite(input.end, start)));
  const end = Math.min(requestedEnd, start + MAX_CLIP_SECONDS);
  const fps = closest(finite(input.fps, 10), FPS_OPTIONS);
  const width = closest(finite(input.width, 320), WIDTH_OPTIONS);
  const safeWidth = Math.max(1, Math.round(finite(sourceWidth, 1)));
  const safeHeight = Math.max(1, Math.round(finite(sourceHeight, 1)));
  const outputHeight = Math.max(1, Math.round((width * safeHeight) / safeWidth));
  const clipDuration = Math.max(0, end - start);
  const frames = Math.min(MAX_FRAMES, Math.max(1, Math.ceil(clipDuration * fps)));

  return {
    start,
    end,
    fps,
    width,
    duration: clipDuration,
    frames,
    height: outputHeight,
    pixels: width * outputHeight * frames,
  };
}

/** A readable timestamp for the selected clip and video controls. */
export function formatTimestamp(seconds: number): string {
  const safe = Math.max(0, finite(seconds, 0));
  const minutes = Math.floor(safe / 60);
  const remainder = safe - minutes * 60;
  return `${minutes}:${remainder.toFixed(1).padStart(4, '0')}`;
}

/** Preserve user-visible Unicode names while making a safe GIF download name. */
export function gifFilename(name: string): string {
  const withoutExtension = name.replace(/\.[^/.]+$/, '').trim();
  const base = withoutExtension || 'video';
  return `${base}-gif.gif`;
}

/** Pure video-compression planning. Browser media APIs live in compress.ts. */

export const QUALITY_OPTIONS = ['high', 'balanced', 'small'] as const;
export const RESOLUTION_OPTIONS = ['source', '1080', '720', '480'] as const;

export type Quality = (typeof QUALITY_OPTIONS)[number];
export type Resolution = (typeof RESOLUTION_OPTIONS)[number];

export interface CompressionSettings {
  quality: Quality;
  resolution: Resolution;
}

export interface CompressionPlan {
  width: number;
  height: number;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
  frameRate: number;
}

const QUALITY: Record<Quality, Omit<CompressionPlan, 'width' | 'height' | 'frameRate'>> = {
  high: { videoBitsPerSecond: 2_500_000, audioBitsPerSecond: 128_000 },
  balanced: { videoBitsPerSecond: 1_200_000, audioBitsPerSecond: 96_000 },
  small: { videoBitsPerSecond: 550_000, audioBitsPerSecond: 64_000 },
};

function finitePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function even(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2);
}

/**
 * Chooses a same-aspect output size. A resolution is a cap for the short edge,
 * never an upscaling instruction; dimensions are even for common encoders.
 */
export function planCompression(
  sourceWidth: number,
  sourceHeight: number,
  settings: CompressionSettings,
): CompressionPlan {
  const width = finitePositive(sourceWidth, 2);
  const height = finitePositive(sourceHeight, 2);
  const shortEdge = Math.min(width, height);
  const requested = settings.resolution === 'source' ? shortEdge : Number(settings.resolution);
  const scale = Math.min(1, requested / shortEdge);
  const quality = QUALITY[QUALITY_OPTIONS.includes(settings.quality) ? settings.quality : 'balanced'];

  return {
    width: even(width * scale),
    height: even(height * scale),
    frameRate: 30,
    ...quality,
  };
}

/** An estimate before encoding; actual output varies with motion and the browser encoder. */
export function estimateOutputBytes(durationSeconds: number, plan: CompressionPlan): number {
  const seconds = Math.max(0, Number.isFinite(durationSeconds) ? durationSeconds : 0);
  return Math.round((seconds * (plan.videoBitsPerSecond + plan.audioBitsPerSecond)) / 8);
}

/** Keep Unicode file names while replacing the source extension with WebM. */
export function compressedFilename(name: string): string {
  const stem = name.replace(/\.[^/.]+$/, '').trim() || 'video';
  return `${stem}-compressed.webm`;
}

export function savedPercent(sourceBytes: number, outputBytes: number): number | null {
  if (!Number.isFinite(sourceBytes) || sourceBytes <= 0 || !Number.isFinite(outputBytes)) return null;
  return Math.round(((sourceBytes - outputBytes) / sourceBytes) * 100);
}

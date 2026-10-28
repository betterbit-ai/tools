/** Pure layout planning for screenshot-beautifier — no DOM, no Preact. */

export const MAX_EXPORT_SIDE = 4096;
export const MAX_PADDING = 800;

export type FrameStyle = 'none' | 'browser-light' | 'browser-dark';
export type AspectId = 'original' | 'square' | 'portrait' | 'landscape';
export type BackgroundId = 'violet' | 'sunset' | 'ocean' | 'mint' | 'warm';

export interface BeautifyOptions {
  aspect: AspectId;
  frame: FrameStyle;
  padding: number;
  radius: number;
  shadow: number;
}

export interface RenderPlan {
  width: number;
  height: number;
  image: { x: number; y: number; width: number; height: number };
  headerHeight: number;
}

const ASPECTS: Record<Exclude<AspectId, 'original'>, number> = {
  square: 1,
  portrait: 4 / 5,
  landscape: 16 / 9,
};

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function sanitizeOptions(options: BeautifyOptions): BeautifyOptions {
  return {
    aspect: ['original', 'square', 'portrait', 'landscape'].includes(options.aspect) ? options.aspect : 'original',
    frame: ['none', 'browser-light', 'browser-dark'].includes(options.frame) ? options.frame : 'none',
    padding: Math.round(clamp(options.padding, 0, MAX_PADDING)),
    radius: Math.round(clamp(options.radius, 0, 160)),
    shadow: Math.round(clamp(options.shadow, 0, 100)),
  };
}

/**
 * Make a canvas that contains the complete screenshot. The image is never
 * cropped; fixed-ratio canvases add background around it instead.
 */
export function planRender(sourceWidth: number, sourceHeight: number, rawOptions: BeautifyOptions): RenderPlan {
  const options = sanitizeOptions(rawOptions);
  const sourceW = Math.max(1, Math.round(clamp(sourceWidth, 1, 100_000)));
  const sourceH = Math.max(1, Math.round(clamp(sourceHeight, 1, 100_000)));
  const headerRatio = options.frame === 'none' ? 0 : 0.075;
  const paddedW = sourceW + options.padding * 2;
  const paddedH = sourceH * (1 + headerRatio) + options.padding * 2;
  const aspect = options.aspect === 'original' ? paddedW / paddedH : ASPECTS[options.aspect];

  let width = Math.max(paddedW, paddedH * aspect);
  let height = width / aspect;
  if (height < paddedH) {
    height = paddedH;
    width = height * aspect;
  }

  const scale = Math.min(1, MAX_EXPORT_SIDE / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));
  const scaledImageW = Math.max(1, Math.round(sourceW * scale));
  const scaledImageH = Math.max(1, Math.round(sourceH * scale));
  const headerHeight = options.frame === 'none' ? 0 : Math.max(1, Math.round(scaledImageH * headerRatio));

  return {
    width,
    height,
    image: {
      x: Math.round((width - scaledImageW) / 2),
      y: Math.round((height - (scaledImageH + headerHeight)) / 2 + headerHeight),
      width: scaledImageW,
      height: scaledImageH,
    },
    headerHeight,
  };
}

export function outputName(filename: string): string {
  const base = filename.replace(/\.[^.]*$/, '').trim() || 'screenshot';
  return `${base}-mockup.png`;
}

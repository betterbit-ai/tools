/**
 * Pure collage planning. Coordinates are fractions of the output canvas, so
 * the same plan drives a small preview and a high-resolution download.
 */

export const MAX_IMAGES = 12;
export const MAX_EXPORT_LONG_SIDE = 4096;

export type LayoutId = 'auto' | 'grid' | 'featured' | 'row' | 'column';
export type AspectId = 'square' | 'portrait' | 'landscape' | 'story';
export type FormatChoice = 'image/jpeg' | 'image/png' | 'image/webp';

export interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ASPECTS: Record<AspectId, number> = {
  square: 1,
  portrait: 4 / 5,
  landscape: 5 / 4,
  story: 9 / 16,
};

/** The suggested layout balances visual variety without hiding any photo. */
export function suggestedLayout(count: number): Exclude<LayoutId, 'auto'> {
  if (count === 2) return 'row';
  if (count === 3 || count === 5 || count === 7) return 'featured';
  return 'grid';
}

/** Return one normalised cell per photo. Invalid or empty input produces no cells. */
export function layoutCells(layout: LayoutId, imageCount: number): Cell[] {
  const count = Math.min(MAX_IMAGES, Math.max(0, Math.floor(imageCount)));
  if (!count) return [];
  const active = layout === 'auto' ? suggestedLayout(count) : layout;
  if (active === 'row') return stripCells(count, true);
  if (active === 'column') return stripCells(count, false);
  if (active === 'featured' && count >= 3) return featuredCells(count);
  return gridCells(count);
}

function stripCells(count: number, horizontal: boolean): Cell[] {
  return Array.from({ length: count }, (_, index) =>
    horizontal
      ? { x: index / count, y: 0, width: 1 / count, height: 1 }
      : { x: 0, y: index / count, width: 1, height: 1 / count },
  );
}

function gridCells(count: number): Cell[] {
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return { x: column / columns, y: row / rows, width: 1 / columns, height: 1 / rows };
  });
}

function featuredCells(count: number): Cell[] {
  const remainingCount = count - 1;
  const columns = remainingCount <= 2 ? 1 : Math.ceil(Math.sqrt(remainingCount));
  const rows = Math.ceil(remainingCount / columns);
  const remaining = Array.from({ length: remainingCount }, (_, index) => ({
    x: (index % columns) / columns,
    y: Math.floor(index / columns) / rows,
    width: 1 / columns,
    height: 1 / rows,
  }));
  return [
    { x: 0, y: 0, width: 0.6, height: 1 },
    ...remaining.map((cell) => ({
      x: 0.6 + cell.x * 0.4,
      y: cell.y,
      width: cell.width * 0.4,
      height: cell.height,
    })),
  ];
}

/** Canvas dimensions, keeping the longest side at `longSide` (capped safely). */
export function outputDimensions(aspect: AspectId, longSide: number): { width: number; height: number } {
  const longest = Math.min(MAX_EXPORT_LONG_SIDE, Math.max(1, Math.round(longSide) || 1));
  const ratio = ASPECTS[aspect];
  return ratio >= 1
    ? { width: longest, height: Math.max(1, Math.round(longest / ratio)) }
    : { width: Math.max(1, Math.round(longest * ratio)), height: longest };
}

/** Gap is constrained so tiny previews and very small canvases keep usable cells. */
export function safeGap(gap: number, width: number, height: number): number {
  return Math.min(Math.max(0, Math.round(gap) || 0), Math.floor(Math.min(width, height) / 8));
}

export function extensionFor(format: FormatChoice): 'jpg' | 'png' | 'webp' {
  return format === 'image/jpeg' ? 'jpg' : (format.split('/')[1] as 'png' | 'webp');
}

export function outputName(format: FormatChoice, width: number, height: number): string {
  return `photo-collage-${width}x${height}.${extensionFor(format)}`;
}

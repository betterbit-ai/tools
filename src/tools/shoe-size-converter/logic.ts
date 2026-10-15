/** Pure adult shoe-size conversion logic — no DOM, no Preact. */

export type ShoeSystem = 'kr' | 'jp' | 'usMen' | 'usWomen' | 'uk' | 'eu';

export const SHOE_SYSTEMS: ShoeSystem[] = ['kr', 'jp', 'usMen', 'usWomen', 'uk', 'eu'];

export interface ShoeSizeRow {
  /** Measured foot length. Korean and Japanese labels map directly to this value. */
  footMm: number;
  kr: number;
  jp: number;
  usMen: number;
  usWomen: number;
  uk: number;
  eu: number;
}

/**
 * A general adult reference chart in 5 mm / half-size steps. Brand charts can
 * use different lasts or increments, so the UI labels results as a baseline.
 */
export const ADULT_SIZE_CHART: ShoeSizeRow[] = [
  [210, 3, 4.5, 2.5, 34],
  [215, 3.5, 5, 3, 34.5],
  [220, 4, 5.5, 3.5, 35],
  [225, 4.5, 6, 4, 36],
  [230, 5, 6.5, 4.5, 36.5],
  [235, 5.5, 7, 5, 37],
  [240, 6, 7.5, 5.5, 38],
  [245, 6.5, 8, 6, 38.5],
  [250, 7, 8.5, 6.5, 39],
  [255, 7.5, 9, 7, 40],
  [260, 8, 9.5, 7.5, 40.5],
  [265, 8.5, 10, 8, 41],
  [270, 9, 10.5, 8.5, 42],
  [275, 9.5, 11, 9, 42.5],
  [280, 10, 11.5, 9.5, 43],
  [285, 10.5, 12, 10, 44],
  [290, 11, 12.5, 10.5, 44.5],
  [295, 11.5, 13, 11, 45],
  [300, 12, 13.5, 11.5, 46],
  [305, 12.5, 14, 12, 46.5],
  [310, 13, 14.5, 12.5, 47],
].map(([footMm, usMen, usWomen, uk, eu]) => ({
  footMm,
  kr: footMm,
  jp: footMm / 10,
  usMen,
  usWomen,
  uk,
  eu,
}));

export function isShoeSystem(value: unknown): value is ShoeSystem {
  return typeof value === 'string' && (SHOE_SYSTEMS as string[]).includes(value);
}

/** Parses values such as `8½`, `26.0 cm`, and `260㎜` into a numeric size. */
export function parseShoeSize(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/½/g, '.5').normalize('NFKC');
  const match = normalized.match(/^[^\d+-]*([+-]?(?:\d+(?:\.\d+)?|\.\d+))/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Finds the nearest published reference row. Values outside a system's chart
 * range return null instead of silently inventing a size.
 */
export function convertShoeSize(value: number, from: ShoeSystem): ShoeSizeRow | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const values = ADULT_SIZE_CHART.map((row) => row[from]);
  if (value < Math.min(...values) || value > Math.max(...values)) return null;
  return ADULT_SIZE_CHART.reduce((closest, row) =>
    Math.abs(row[from] - value) < Math.abs(closest[from] - value) ? row : closest,
  );
}

export function supportedRange(system: ShoeSystem): { min: number; max: number } {
  const values = ADULT_SIZE_CHART.map((row) => row[system]);
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** A stable, local plain-text summary for CopyButton. */
export function formatSizeSummary(row: ShoeSizeRow, labels: Record<ShoeSystem, string>): string {
  return SHOE_SYSTEMS.map((system) => `${labels[system]}: ${row[system]}`).join('\n');
}

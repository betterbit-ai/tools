/** Pure display-metric helpers. Browser APIs are read in Tool.tsx, never here. */

export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ResolutionStandard = 'hd' | 'fullHd' | 'qhd' | 'wqhd' | 'uhd4k' | '5k' | 'uhd8k';

export interface BreakpointRange {
  name: Breakpoint;
  min: number;
  max: number | null;
}

export interface MetricLabels {
  screen: string;
  available: string;
  layoutViewport: string;
  visualViewport: string;
  devicePixelRatio: string;
  visualViewportScale: string;
  aspectRatio: string;
  colorDepth: string;
  activeBreakpoint: string;
  cssSnippet: string;
  cssPixels: string;
  bit: string;
  unavailable: string;
}

export interface ScreenMetrics {
  screenWidth: number | null;
  screenHeight: number | null;
  availableWidth: number | null;
  availableHeight: number | null;
  layoutViewportWidth: number | null;
  layoutViewportHeight: number | null;
  visualViewportWidth: number | null;
  visualViewportHeight: number | null;
  devicePixelRatio: number | null;
  visualViewportScale: number | null;
  colorDepth: number | null;
}

const BREAKPOINTS: readonly BreakpointRange[] = [
  { name: 'base', min: 0, max: 639 },
  { name: 'sm', min: 640, max: 767 },
  { name: 'md', min: 768, max: 1023 },
  { name: 'lg', min: 1024, max: 1279 },
  { name: 'xl', min: 1280, max: 1535 },
  { name: '2xl', min: 1536, max: null },
];

/** Turns an API reading into a non-negative whole CSS-pixel value, or null when unavailable. */
export function safeDimension(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return Math.floor(value);
}

/** Keeps a positive fractional browser metric such as DPR or visualViewport.scale. */
export function safeRatio(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function dimensionLabel(width: number | null, height: number | null, unavailable: string): string {
  return width === null || height === null ? unavailable : `${width} × ${height}`;
}

function greatestCommonDivisor(a: number, b: number): number {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

/** Reduces a positive pixel dimension pair, regardless of portrait or landscape orientation. */
export function aspectRatio(width: number | null, height: number | null, unavailable: string): string {
  if (width === null || height === null || width === 0 || height === 0) return unavailable;
  const divisor = greatestCommonDivisor(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/** Names only well-known exact pixel grids; near matches deliberately stay unnamed. */
export function resolutionStandard(width: number | null, height: number | null): ResolutionStandard | null {
  if (width === null || height === null) return null;
  const landscapeWidth = Math.max(width, height);
  const landscapeHeight = Math.min(width, height);
  const key = `${landscapeWidth}×${landscapeHeight}`;
  const names: Record<string, ResolutionStandard> = {
    '1280×720': 'hd',
    '1920×1080': 'fullHd',
    '2560×1440': 'qhd',
    '3440×1440': 'wqhd',
    '3840×2160': 'uhd4k',
    '5120×2880': '5k',
    '7680×4320': 'uhd8k',
  };
  return names[key] ?? null;
}

/** Returns the active Tailwind-style viewport range using CSS pixels. */
export function breakpointFor(width: number | null): BreakpointRange | null {
  if (width === null) return null;
  return BREAKPOINTS.find((breakpoint) => breakpoint.max === null || width <= breakpoint.max) ?? null;
}

/** A copy-ready media query for the active range, including its upper bound when one exists. */
export function breakpointMediaQuery(range: BreakpointRange | null): string {
  if (!range) return '';
  const clauses = [`(min-width: ${range.min}px)`];
  if (range.max !== null) clauses.push(`(max-width: ${range.max}.98px)`);
  return `@media ${clauses.join(' and ')} {\n  /* ${range.name} */\n}`;
}

/**
 * Builds a plain-text report without asserting that browser values are a display panel's
 * native or physical dimensions. Labels come from the locale so the result is ready to share.
 */
export function displaySummary(metrics: ScreenMetrics, labels: MetricLabels): string {
  const breakpoint = breakpointFor(metrics.layoutViewportWidth);
  const ratio = aspectRatio(metrics.screenWidth, metrics.screenHeight, labels.unavailable);
  const lines = [
    `${labels.screen}: ${dimensionLabel(metrics.screenWidth, metrics.screenHeight, labels.unavailable)} ${labels.cssPixels}`,
    `${labels.available}: ${dimensionLabel(metrics.availableWidth, metrics.availableHeight, labels.unavailable)} ${labels.cssPixels}`,
    `${labels.layoutViewport}: ${dimensionLabel(metrics.layoutViewportWidth, metrics.layoutViewportHeight, labels.unavailable)} ${labels.cssPixels}`,
    `${labels.visualViewport}: ${dimensionLabel(metrics.visualViewportWidth, metrics.visualViewportHeight, labels.unavailable)} ${labels.cssPixels}`,
    `${labels.devicePixelRatio}: ${metrics.devicePixelRatio ?? labels.unavailable}`,
    `${labels.visualViewportScale}: ${metrics.visualViewportScale ?? labels.unavailable}`,
    `${labels.aspectRatio}: ${ratio}`,
    `${labels.colorDepth}: ${metrics.colorDepth === null ? labels.unavailable : `${metrics.colorDepth}-${labels.bit}`}`,
    `${labels.activeBreakpoint}: ${breakpoint?.name ?? labels.unavailable}`,
  ];
  const mediaQuery = breakpointMediaQuery(breakpoint);
  if (mediaQuery) lines.push('', `${labels.cssSnippet}:`, mediaQuery);
  return lines.join('\n');
}

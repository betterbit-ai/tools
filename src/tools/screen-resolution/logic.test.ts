import { describe, expect, it } from 'vitest';
import {
  aspectRatio,
  breakpointFor,
  breakpointMediaQuery,
  dimensionLabel,
  displaySummary,
  resolutionStandard,
  safeDimension,
  safeRatio,
  type MetricLabels,
} from './logic';

const labels: MetricLabels = {
  screen: 'Screen',
  available: 'Available',
  layoutViewport: 'Layout viewport',
  visualViewport: 'Visual viewport',
  devicePixelRatio: 'DPR',
  visualViewportScale: 'Zoom',
  aspectRatio: 'Aspect ratio',
  colorDepth: 'Color depth',
  activeBreakpoint: 'Breakpoint',
  cssSnippet: 'CSS',
  cssPixels: 'CSS px',
  bit: 'bit',
  unavailable: '—',
};

describe('screen-resolution metrics', () => {
  it('normalizes valid dimensions and refuses invalid browser readings', () => {
    expect(safeDimension(1920.9)).toBe(1920);
    expect(safeDimension(0)).toBe(0);
    expect(safeDimension(-1)).toBeNull();
    expect(safeDimension(Infinity)).toBeNull();
    expect(safeDimension('1920')).toBeNull();
  });

  it('accepts only positive finite ratios', () => {
    expect(safeRatio(1.25)).toBe(1.25);
    expect(safeRatio(0)).toBeNull();
    expect(safeRatio(-2)).toBeNull();
    expect(safeRatio(Number.NaN)).toBeNull();
  });

  it('formats dimensions and reduces portrait ratios without assuming orientation', () => {
    expect(dimensionLabel(1920, 1080, '—')).toBe('1920 × 1080');
    expect(dimensionLabel(null, 1080, '—')).toBe('—');
    expect(aspectRatio(1080, 1920, '—')).toBe('9:16');
    expect(aspectRatio(0, 1080, '—')).toBe('—');
  });

  it('names only exact common resolution grids', () => {
    expect(resolutionStandard(3840, 2160)).toBe('uhd4k');
    expect(resolutionStandard(1440, 3440)).toBe('wqhd');
    expect(resolutionStandard(1919, 1080)).toBeNull();
    expect(resolutionStandard(null, 1080)).toBeNull();
  });

  it('uses exact CSS breakpoint boundaries and a valid bounded media query', () => {
    expect(breakpointFor(639)).toMatchObject({ name: 'base', min: 0, max: 639 });
    expect(breakpointFor(640)).toMatchObject({ name: 'sm', min: 640, max: 767 });
    expect(breakpointFor(1536)).toMatchObject({ name: '2xl', min: 1536, max: null });
    expect(breakpointFor(null)).toBeNull();
    expect(breakpointMediaQuery(breakpointFor(1024))).toBe(
      '@media (min-width: 1024px) and (max-width: 1279.98px) {\n  /* lg */\n}',
    );
  });

  it('preserves Unicode labels when creating a shareable report', () => {
    const report = displaySummary(
      {
        screenWidth: 1920,
        screenHeight: 1080,
        availableWidth: 1920,
        availableHeight: 1040,
        layoutViewportWidth: 1024,
        layoutViewportHeight: 700,
        visualViewportWidth: 1024,
        visualViewportHeight: 700,
        devicePixelRatio: 1.25,
        visualViewportScale: 1,
        colorDepth: 24,
      },
      { ...labels, screen: '화면', cssSnippet: 'CSS 코드' },
    );

    expect(report).toContain('화면: 1920 × 1080 CSS px');
    expect(report).toContain('Breakpoint: lg');
    expect(report).toContain('@media (min-width: 1024px)');
  });
});

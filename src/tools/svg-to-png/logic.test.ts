import { describe, expect, it } from 'vitest';
import { FALLBACK_SIZE, MAX_OUTPUT_EDGE, isSvgMarkup, outputDimensions, pngFilename, svgDimensions } from './logic';

describe('svg-to-png SVG inspection', () => {
  it('reads numeric and physical-unit dimensions from an SVG root', () => {
    expect(svgDimensions('<svg width="240" height="160"><text>한글 😀</text></svg>')).toEqual({
      width: 240,
      height: 160,
      source: 'attributes',
    });
    expect(svgDimensions("<svg width='1in' height='25.4mm' />")).toEqual({
      width: 96,
      height: 96,
      source: 'attributes',
    });
  });

  it('uses viewBox dimensions and keeps an attribute-only aspect ratio', () => {
    expect(svgDimensions('<svg viewBox="0 0 300 150"><path /></svg>')).toEqual({
      width: 300,
      height: 150,
      source: 'viewBox',
    });
    expect(svgDimensions('<svg width="400" viewBox="0 0 3 2" />')).toEqual({
      width: 400,
      height: 267,
      source: 'attributes',
    });
  });

  it('uses a deterministic fallback for valid SVG without a usable size', () => {
    expect(svgDimensions('<svg width="100%"><title>로고</title></svg>')).toEqual({
      width: FALLBACK_SIZE,
      height: FALLBACK_SIZE,
      source: 'fallback',
    });
    expect(svgDimensions('<div>not an SVG</div>')).toBeNull();
    expect(isSvgMarkup('<svg aria-label="emoji 😀" />')).toBe(true);
    expect(isSvgMarkup('')).toBe(false);
  });
});

describe('svg-to-png output decisions', () => {
  const source = { width: 300, height: 200, source: 'attributes' as const };

  it('scales an SVG at each requested multiplier', () => {
    expect(outputDimensions(source, { mode: 'scale', scale: 3, width: '' })).toEqual({ width: 900, height: 600 });
    expect(outputDimensions(source, { mode: 'width', scale: 1, width: 1200 })).toEqual({ width: 1200, height: 800 });
  });

  it('rejects empty, zero and oversized canvas requests', () => {
    expect(outputDimensions(source, { mode: 'width', scale: 1, width: '' })).toBeNull();
    expect(outputDimensions(source, { mode: 'width', scale: 1, width: 0 })).toBeNull();
    expect(
      outputDimensions(
        { width: MAX_OUTPUT_EDGE, height: MAX_OUTPUT_EDGE, source: 'attributes' },
        { mode: 'scale', scale: 2, width: '' },
      ),
    ).toBeNull();
  });

  it('keeps Unicode filenames while making a PNG name', () => {
    expect(pngFilename('브랜드 로고 😀.SVG')).toBe('브랜드 로고 😀.png');
    expect(pngFilename('C:\\art\\icon')).toBe('icon.png');
    expect(pngFilename('')).toBe('image.png');
  });
});

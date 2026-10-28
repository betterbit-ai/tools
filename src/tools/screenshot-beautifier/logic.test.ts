import { describe, expect, it } from 'vitest';
import { MAX_EXPORT_SIDE, MAX_PADDING, outputName, planRender, sanitizeOptions } from './logic';

describe('screenshot-beautifier layout', () => {
  it('keeps an original-aspect screenshot whole with centred padding', () => {
    const plan = planRender(1200, 800, { aspect: 'original', frame: 'none', padding: 100, radius: 20, shadow: 50 });
    expect(plan).toEqual({
      width: 1400,
      height: 1000,
      image: { x: 100, y: 100, width: 1200, height: 800 },
      headerHeight: 0,
    });
  });

  it('adds a browser bar without cropping the source image', () => {
    const plan = planRender(1000, 500, {
      aspect: 'original',
      frame: 'browser-light',
      padding: 40,
      radius: 20,
      shadow: 50,
    });
    expect(plan.image.width).toBe(1000);
    expect(plan.image.height).toBe(500);
    expect(plan.headerHeight).toBe(38);
    expect(plan.image.y).toBeGreaterThan(plan.headerHeight);
  });

  it('uses the requested fixed aspect and adds background instead of cropping', () => {
    const plan = planRender(400, 1200, { aspect: 'landscape', frame: 'none', padding: 0, radius: 0, shadow: 0 });
    expect(plan.width / plan.height).toBeCloseTo(16 / 9, 2);
    expect(plan.image).toEqual({ x: 867, y: 0, width: 400, height: 1200 });
  });

  it('caps huge exports and accepts zero-valued settings', () => {
    const plan = planRender(100_000, 50_000, { aspect: 'original', frame: 'none', padding: 0, radius: 0, shadow: 0 });
    expect(Math.max(plan.width, plan.height)).toBe(MAX_EXPORT_SIDE);
    expect(plan.image.x).toBe(0);
  });

  it('clamps invalid controls at supported bounds', () => {
    expect(
      sanitizeOptions({ aspect: 'square', frame: 'browser-dark', padding: -4, radius: 999, shadow: Number.NaN }),
    ).toEqual({
      aspect: 'square',
      frame: 'browser-dark',
      padding: 0,
      radius: 160,
      shadow: 0,
    });
    expect(
      sanitizeOptions({ aspect: 'other' as 'square', frame: 'other' as 'none', padding: 9999, radius: -1, shadow: 200 })
        .padding,
    ).toBe(MAX_PADDING);
  });

  it('keeps Unicode names while producing a PNG name', () => {
    expect(outputName('제품 화면 📷.webp')).toBe('제품 화면 📷-mockup.png');
    expect(outputName('.png')).toBe('screenshot-mockup.png');
  });
});

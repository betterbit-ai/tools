import { describe, expect, it } from 'vitest';
import {
  buildIco,
  FAVICON_FILES,
  ICO_SIZES,
  icoDimensionByte,
  installSnippet,
  manifestJson,
  monogram,
  siteName,
} from './logic';

describe('favicon package details', () => {
  it('lists the browser, Apple, and Android icon sizes', () => {
    expect(ICO_SIZES).toEqual([16, 32, 48]);
    expect(FAVICON_FILES.map((file) => file.size)).toEqual([16, 32, 48, 180, 192, 512]);
  });

  it('encodes ICO dimensions including the special 256px byte', () => {
    expect(icoDimensionByte(16)).toBe(16);
    expect(icoDimensionByte(256)).toBe(0);
    expect(() => icoDimensionByte(0)).toThrow(RangeError);
    expect(() => icoDimensionByte(257)).toThrow(RangeError);
  });

  it('creates a real ICO directory around every supplied frame', () => {
    const ico = buildIco([16, 32], [new Uint8Array([1, 2]), new Uint8Array([3, 4, 5])]);
    const view = new DataView(ico.buffer);
    expect([...ico.slice(0, 6)]).toEqual([0, 0, 1, 0, 2, 0]);
    expect(view.getUint32(6 + 8, true)).toBe(2);
    expect(view.getUint32(6 + 12, true)).toBe(38);
    expect(view.getUint32(22 + 8, true)).toBe(3);
    expect(view.getUint32(22 + 12, true)).toBe(40);
    expect([...ico.slice(38)]).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps Korean and emoji code points intact in a short text favicon', () => {
    expect(monogram('  파비콘  ')).toBe('파비');
    expect(monogram('🚀✨more')).toBe('🚀✨');
    expect(monogram('')).toBe('B');
  });

  it('writes a valid, safe PWA manifest for Unicode site names', () => {
    const manifest = JSON.parse(manifestJson('  베터비트   🚀  '));
    expect(manifest.name).toBe('베터비트 🚀');
    expect(manifest.icons).toEqual([
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ]);
    expect(siteName(' '.repeat(100))).toBe('My website');
  });

  it('includes the current standard installation links', () => {
    const snippet = installSnippet();
    expect(snippet).toContain('href="/favicon.ico" sizes="any"');
    expect(snippet).toContain('sizes="180x180"');
    expect(snippet).toContain('href="/site.webmanifest"');
  });
});

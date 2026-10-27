import { describe, expect, it } from 'vitest';
import {
  MAX_IMAGE_BYTES,
  base64IncreasePercent,
  base64Length,
  cssClassName,
  defaultAltText,
  imageMimeType,
  imageOutput,
} from './logic';

describe('image-to-base64 logic', () => {
  it('uses an image MIME type or a known filename extension', () => {
    expect(imageMimeType('image/jpeg', 'logo.png')).toBe('image/jpeg');
    expect(imageMimeType('', 'logo.SVG')).toBe('image/svg+xml');
    expect(imageMimeType('application/octet-stream', 'photo.heic')).toBe('image/heic');
    expect(imageMimeType('', 'document.pdf')).toBeNull();
  });

  it('creates readable default alt text without losing Unicode', () => {
    expect(defaultAltText('product_logo-2026.png')).toBe('product logo 2026');
    expect(defaultAltText('한글 로고 🖼️.webp')).toBe('한글 로고 🖼️');
    expect(defaultAltText('.png')).toBe('Image');
  });

  it('calculates Base64 lengths at byte boundaries and handles empty input', () => {
    expect(base64Length(0)).toBe(0);
    expect(base64Length(1)).toBe(4);
    expect(base64Length(2)).toBe(4);
    expect(base64Length(3)).toBe(4);
    expect(base64Length(4)).toBe(8);
    expect(base64Length(MAX_IMAGE_BYTES)).toBe(34_952_536);
    expect(base64IncreasePercent(3)).toBeCloseTo(33.333, 2);
    expect(base64IncreasePercent(0)).toBe(0);
  });

  it('creates safe HTML and CSS snippets from customised labels', () => {
    expect(
      imageOutput({
        format: 'html',
        mimeType: 'image/png',
        base64: 'aGVsbG8=',
        alt: 'A "quoted" <logo> & more',
        cssClass: 'unused',
      }),
    ).toBe('<img src="data:image/png;base64,aGVsbG8=" alt="A &quot;quoted&quot; &lt;logo&gt; &amp; more">');
    expect(cssClassName('  Hero_이미지 2! ')).toBe('hero-2');
    expect(cssClassName('2026 logo')).toBe('image-2026-logo');
    expect(cssClassName('🖼️')).toBe('image');
    expect(
      imageOutput({
        format: 'css',
        mimeType: 'image/svg+xml',
        base64: 'PHN2Zy8+',
        alt: '',
        cssClass: 'Hero image',
      }),
    ).toBe('.hero-image {\n  background-image: url("data:image/svg+xml;base64,PHN2Zy8+");\n}');
  });
});

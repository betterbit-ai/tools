import { describe, expect, it } from 'vitest';
import {
  MAX_IMAGE_PIXELS,
  MAX_IMAGE_SIDE,
  classifyScan,
  parseWifiPayload,
  safeHttpUrl,
  validateImageDimensions,
} from './logic';

describe('qr-code-scanner', () => {
  it('parses a standard Wi-Fi payload, including escaped Korean and punctuation', () => {
    expect(parseWifiPayload('WIFI:T:WPA;S:카페\\; 1;P:p\\:ass\\\\word;H:true;;')).toEqual({
      ssid: '카페; 1',
      password: 'p:ass\\word',
      security: 'WPA',
      hidden: true,
    });
  });

  it('does not treat incomplete or non-Wi-Fi values as Wi-Fi payloads', () => {
    expect(parseWifiPayload('WIFI:T:WPA;P:secret;;')).toBeNull();
    expect(parseWifiPayload('wifi:T:WPA;S:Cafe;;')).toBeNull();
    expect(classifyScan('한글 😀')).toEqual({ raw: '한글 😀', kind: 'text' });
  });

  it('offers an open action only for valid HTTP(S) URLs', () => {
    expect(safeHttpUrl('https://example.com/한글?q=😀')).toBe('https://example.com/%ED%95%9C%EA%B8%80?q=%F0%9F%98%80');
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('example.com')).toBeNull();
    expect(classifyScan('https://betterbit.org/qr')).toMatchObject({ kind: 'url', url: 'https://betterbit.org/qr' });
  });

  it('keeps decoded-image canvas allocations within documented limits', () => {
    expect(validateImageDimensions(MAX_IMAGE_SIDE, 1)).toBeNull();
    expect(validateImageDimensions(MAX_IMAGE_SIDE + 1, 1)).toBe('image-too-large');
    expect(validateImageDimensions(8000, 4000)).toBeNull();
    expect(validateImageDimensions(8000, 4001)).toBe('image-too-large');
    expect(validateImageDimensions(0, 400)).toBe('image-too-large');
    expect(validateImageDimensions(Number.NaN, 400)).toBe('image-too-large');
    expect(MAX_IMAGE_PIXELS).toBe(32_000_000);
  });
});

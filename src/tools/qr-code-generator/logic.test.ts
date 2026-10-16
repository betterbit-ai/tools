import { describe, expect, it } from 'vitest';
import {
  MAX_BYTES,
  buildPayload,
  escapeWifi,
  hasReadableQrColors,
  isHexColor,
  normalizeUrl,
  utf8ByteLength,
  utf8Bytes,
  validateLogo,
  validateSettings,
} from './logic';

describe('qr-code-generator', () => {
  const defaults = {
    type: 'url' as const,
    value: 'betterbit.org',
    wifiSsid: '',
    wifiPassword: '',
    wifiSecurity: 'WPA' as const,
    wifiHidden: false,
    errorCorrection: 'M' as const,
    foreground: '#000000',
    background: '#ffffff',
  };

  it('normalizes a hostname but preserves explicit schemes and blank input', () => {
    expect(normalizeUrl(' betterbit.org/tools ')).toBe('https://betterbit.org/tools');
    expect(normalizeUrl('mailto:hello@example.com')).toBe('mailto:hello@example.com');
    expect(normalizeUrl('')).toBe('');
  });

  it('builds escaped Wi-Fi payloads, including an open hidden network', () => {
    expect(escapeWifi('Cafe; A: "')).toBe('Cafe\\; A\\: \\"');
    expect(escapeWifi('\\')).toBe('\\\\');
    expect(
      buildPayload({ ...defaults, type: 'wifi', wifiSsid: 'Cafe; A', wifiPassword: 'p:ass', wifiHidden: true }),
    ).toBe('WIFI:T:WPA;S:Cafe\\; A;P:p\\:ass;H:true;;');
    expect(buildPayload({ ...defaults, type: 'wifi', wifiSsid: 'Guest', wifiSecurity: 'nopass' })).toBe(
      'WIFI:T:nopass;S:Guest;;',
    );
  });

  it('counts UTF-8 content correctly for Korean, CJK, emoji, and lone surrogates', () => {
    expect(utf8ByteLength('한글')).toBe(6);
    expect(utf8ByteLength('漢字')).toBe(6);
    expect(utf8ByteLength('😀')).toBe(4);
    expect(utf8ByteLength('\ud800')).toBe(3);
    expect(utf8Bytes('한😀\udc00')).toEqual([0xed, 0x95, 0x9c, 0xf0, 0x9f, 0x98, 0x80, 0xef, 0xbf, 0xbd]);
  });

  it('rejects empty input, missing Wi-Fi names, and payloads beyond the chosen QR capacity', () => {
    expect(validateSettings({ ...defaults, value: '' })).toBe('empty');
    expect(validateSettings({ ...defaults, type: 'wifi' })).toBe('missing-wifi-name');
    expect(validateSettings({ ...defaults, type: 'text', value: 'a'.repeat(MAX_BYTES.M + 1) })).toBe('too-long');
    expect(validateSettings({ ...defaults, type: 'text', value: 'a'.repeat(MAX_BYTES.M) })).toBeNull();
  });

  it('only accepts six-digit opaque hex colors', () => {
    expect(isHexColor('#0A7cF1')).toBe(true);
    expect(isHexColor('#fff')).toBe(false);
    expect(isHexColor('black')).toBe(false);
  });

  it('requires high-contrast, dark-on-light QR colors', () => {
    expect(hasReadableQrColors('#102a43', '#f7fafc')).toBe(true);
    expect(hasReadableQrColors('#ffffff', '#ffffff')).toBe(false);
    expect(hasReadableQrColors('#ffffff', '#000000')).toBe(false);
    expect(validateSettings({ ...defaults, foreground: '#777777', background: '#ffffff' })).toBe('low-contrast');
  });

  it('rejects unsupported and oversized logo files before reading them', () => {
    expect(validateLogo({ type: 'image/gif', size: 100 })).toBe('invalid-type');
    expect(validateLogo({ type: 'image/png', size: 5 * 1024 * 1024 + 1 })).toBe('too-large');
    expect(validateLogo({ type: 'image/svg+xml', size: 5 * 1024 * 1024 })).toBeNull();
  });
});

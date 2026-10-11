import { describe, expect, it } from 'vitest';
import {
  MAX_BYTES,
  buildPayload,
  escapeWifi,
  isHexColor,
  normalizeUrl,
  utf8ByteLength,
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
});

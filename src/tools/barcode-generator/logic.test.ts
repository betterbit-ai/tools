import { describe, expect, it } from 'vitest';
import {
  calculateEan13CheckDigit,
  encodeBarcode,
  normalizeEan13,
  renderBarcodeSvg,
  validateBarcode,
  type BarcodeSettings,
} from './logic';

const settings: BarcodeSettings = {
  format: 'CODE128',
  value: 'ITEM-2026-001',
  moduleWidth: 2,
  height: 80,
  displayValue: true,
};

describe('barcode-generator', () => {
  it('encodes a Code 128-B value with the required start, checksum, and stop patterns', () => {
    const barcode = encodeBarcode(settings);
    expect(barcode?.modules.startsWith('11010010000')).toBe(true); // Start B (104)
    expect(barcode?.modules.endsWith('1100011101011')).toBe(true); // Stop (106)
    expect(barcode?.encodedValue).toBe('ITEM-2026-001');
  });

  it('only accepts printable ASCII Code 128-B input and caps it at 80 characters', () => {
    expect(validateBarcode({ format: 'CODE128', value: ' A-Z_09! ' })).toBeNull();
    expect(validateBarcode({ format: 'CODE128', value: '' })).toBe('empty');
    expect(validateBarcode({ format: 'CODE128', value: '한글' })).toBe('unsupported-character');
    expect(validateBarcode({ format: 'CODE128', value: '😀' })).toBe('unsupported-character');
    expect(validateBarcode({ format: 'CODE128', value: 'A'.repeat(81) })).toBe('too-long');
  });

  it('calculates, normalizes, and verifies EAN-13 check digits', () => {
    expect(calculateEan13CheckDigit('590123412345')).toBe(7);
    expect(normalizeEan13('590-1234 12345')).toBe('590123412345');
    expect(encodeBarcode({ format: 'EAN13', value: '590123412345' })?.encodedValue).toBe('5901234123457');
    expect(validateBarcode({ format: 'EAN13', value: '5901234123457' })).toBeNull();
    expect(validateBarcode({ format: 'EAN13', value: '5901234123458' })).toBe('invalid-check-digit');
    expect(validateBarcode({ format: 'EAN13', value: '59012341234' })).toBe('invalid-ean-length');
    expect(validateBarcode({ format: 'EAN13', value: '59012341234한' })).toBe('invalid-ean-length');
  });

  it('renders a self-contained SVG with quiet zones and safely escaped display text', () => {
    const barcode = renderBarcodeSvg({ ...settings, value: 'A&B', moduleWidth: 1, height: 40 });
    expect(barcode?.svg).toContain('fill="white"');
    expect(barcode?.svg).toContain('A&amp;B');
    expect(barcode?.width).toBe((barcode!.moduleCount + 20) * 1);
    expect(renderBarcodeSvg({ ...settings, value: '한글' })).toBeNull();
  });
});

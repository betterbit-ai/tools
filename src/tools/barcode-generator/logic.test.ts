import { describe, expect, it } from 'vitest';
import {
  calculateEan13CheckDigit,
  encodeBarcode,
  normalizeEan13,
  quietZones,
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

  it('matches published Code 128 symbols for single and double character values', () => {
    // ISO/IEC 15417 examples computed from the standard's table: Start B (104), data,
    // checksum = (104 + sum(value x position)) mod 103, Stop.
    expect(encodeBarcode({ format: 'CODE128', value: 'A' })?.modules).toBe(
      '11010010000' + '10100011000' + '10001011000' + '1100011101011',
    );
    expect(encodeBarcode({ format: 'CODE128', value: 'AB' })?.modules).toBe(
      '11010010000' + '10100011000' + '10001011000' + '11110101110' + '1100011101011',
    );
  });

  it('matches an independent encoder (bwip-js) module for module on EAN-13', () => {
    // Produced with bwip-js 4.x: bwipjs.raw({ bcid: 'ean13', text }).sbs expanded to modules.
    expect(encodeBarcode({ format: 'EAN13', value: '5901234123457' })?.modules).toBe(
      '10100010110100111011001100100110111101001110101010110011011011001000010101110010011101000100101',
    );
    expect(encodeBarcode({ format: 'EAN13', value: '4006381333931' })?.modules).toBe(
      '10100011010100111010111101111010001001011001101010100001010000101000010111010010000101100110101',
    );
  });

  it('leaves the quiet zone each symbology requires', () => {
    // GS1 General Specifications: EAN-13 needs 11 modules left, 7 right.
    // ISO/IEC 15417: Code 128 needs at least 10X on both sides.
    expect(quietZones('EAN13')).toEqual({ left: 11, right: 7 });
    expect(quietZones('CODE128')).toEqual({ left: 10, right: 10 });

    const ean = renderBarcodeSvg({ ...settings, format: 'EAN13', value: '5901234123457', moduleWidth: 2, height: 80 });
    expect(ean?.moduleCount).toBe(95);
    expect(ean?.width).toBe((95 + 11 + 7) * 2);
    // The first bar starts after the 11-module left quiet zone.
    expect(ean?.svg).toContain('<rect x="22"');
  });
});

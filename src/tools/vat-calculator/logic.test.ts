import { describe, expect, it } from 'vitest';
import { calculateVat, displayVat, MAX_AMOUNT, MAX_RATE, parseVatNumber, readVatNumber } from './logic';

describe('calculateVat', () => {
  it('adds VAT to a tax-exclusive amount', () => {
    expect(calculateVat({ amount: 100_000, rate: 10, mode: 'add' })).toEqual({
      net: 100_000,
      tax: 10_000,
      gross: 110_000,
    });
  });

  it('extracts VAT by dividing an inclusive amount rather than subtracting the rate', () => {
    expect(calculateVat({ amount: 110_000, rate: 10, mode: 'remove' })).toEqual({
      net: 100_000,
      tax: 10_000,
      gross: 110_000,
    });
    expect(calculateVat({ amount: 120, rate: 20, mode: 'remove' })).toEqual({ net: 100, tax: 20, gross: 120 });
  });

  it('supports zero rates and decimal rates without floating-point noise', () => {
    expect(calculateVat({ amount: 99.99, rate: 0, mode: 'add' })).toEqual({ net: 99.99, tax: 0, gross: 99.99 });
    expect(calculateVat({ amount: 100, rate: 8.25, mode: 'add' })).toEqual({
      net: 100,
      tax: 8.25,
      gross: 108.25,
    });
  });

  it('accepts grouped and full-width Unicode numbers', () => {
    expect(calculateVat({ amount: '１,１００', rate: '１０', mode: 'remove' })).toEqual({
      net: 1_000,
      tax: 100,
      gross: 1_100,
    });
  });

  it('rejects missing, non-numeric, negative, and out-of-range input', () => {
    expect(calculateVat({ amount: '', rate: 10, mode: 'add' })).toBeNull();
    expect(calculateVat({ amount: '부가세 💸', rate: 10, mode: 'add' })).toBeNull();
    expect(calculateVat({ amount: -1, rate: 10, mode: 'add' })).toBeNull();
    expect(calculateVat({ amount: 1, rate: -0.1, mode: 'add' })).toBeNull();
    expect(calculateVat({ amount: MAX_AMOUNT + 1, rate: 10, mode: 'add' })).toBeNull();
    expect(calculateVat({ amount: 1, rate: MAX_RATE + 0.01, mode: 'add' })).toBeNull();
    expect(calculateVat({ amount: Infinity, rate: 10, mode: 'add' })).toBeNull();
    expect(calculateVat({ amount: 1, rate: 10, mode: 'other' as never })).toBeNull();
  });
});

describe('parseVatNumber', () => {
  it('parses ordinary and normalized pasted values', () => {
    expect(parseVatNumber('1,234,567.89')).toBe(1_234_567.89);
    expect(parseVatNumber(' １２,３４５．６ ')).toBe(12_345.6);
  });

  it('rejects blank text and non-finite values', () => {
    expect(parseVatNumber('')).toBeNull();
    expect(parseVatNumber('₩10,000')).toBeNull();
    expect(parseVatNumber(NaN)).toBeNull();
  });
});

describe('readVatNumber', () => {
  it('accepts what people type into an amount or rate field', () => {
    expect(readVatNumber('120000')).toEqual({ status: 'valid', value: 120_000 });
    expect(readVatNumber('120,000.50')).toEqual({ status: 'valid', value: 120_000.5 });
    expect(readVatNumber('7.5')).toEqual({ status: 'valid', value: 7.5 });
    expect(readVatNumber('7,5')).toEqual({ status: 'valid', value: 7.5 });
    expect(readVatNumber('１，１００')).toEqual({ status: 'valid', value: 1_100 });
    expect(readVatNumber('10.')).toEqual({ status: 'valid', value: 10 });
  });

  it('distinguishes an empty field from text that is not a number', () => {
    expect(readVatNumber('')).toEqual({ status: 'empty' });
    expect(readVatNumber('  ')).toEqual({ status: 'empty' });
    expect(readVatNumber('10%')).toEqual({ status: 'invalid' });
    expect(readVatNumber('₩10,000')).toEqual({ status: 'invalid' });
    expect(readVatNumber('1.2.3')).toEqual({ status: 'invalid' });
  });
});

describe('displayVat', () => {
  it('keeps the printed net + VAT equal to the printed gross', () => {
    const cases: [number, number][] = [
      [1.015, 10],
      [0.05, 10],
      [33.33, 10],
      [2.5, 7.5],
      [99.995, 20],
      [1_000_000.555, 19],
    ];
    for (const [amount, rate] of cases) {
      for (const mode of ['add', 'remove'] as const) {
        const exact = calculateVat({ amount, rate, mode });
        expect(exact).not.toBeNull();
        const shown = displayVat(exact!);
        // What a reader checks: the figures printed to two decimals add up.
        expect(Number((shown.net + shown.tax).toFixed(2))).toBe(Number(shown.gross.toFixed(2)));
      }
    }
  });

  it('does not change a breakdown that already lands on whole cents', () => {
    expect(displayVat(calculateVat({ amount: 120, rate: 20, mode: 'remove' })!)).toEqual({
      net: 100,
      tax: 20,
      gross: 120,
    });
  });
});

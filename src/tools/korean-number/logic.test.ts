import { describe, expect, it } from 'vitest';
import { MAX_AMOUNT, convertAmount, formatAmount, parseAmount, toKoreanNumber } from './logic';

describe('parseAmount', () => {
  it('accepts grouped, won-marked, and full-width Korean keyboard input', () => {
    expect(parseAmount('₩ 12,345원')).toEqual({ ok: true, value: 12_345n });
    expect(parseAmount('１２，３４５ 원')).toEqual({ ok: true, value: 12_345n });
  });

  it('rejects absent, fractional, negative, and non-numeric Unicode input', () => {
    expect(parseAmount('')).toEqual({ ok: false, code: 'empty' });
    expect(parseAmount('12.5')).toEqual({ ok: false, code: 'decimal' });
    expect(parseAmount('-10')).toEqual({ ok: false, code: 'negative' });
    expect(parseAmount('일만 😀')).toEqual({ ok: false, code: 'invalid' });
    expect(parseAmount((MAX_AMOUNT + 1n).toString())).toEqual({ ok: false, code: 'tooLarge' });
  });
});

describe('toKoreanNumber', () => {
  it('uses four-digit Korean grouping and omits everyday leading ones', () => {
    expect(toKoreanNumber(0n)).toBe('영');
    expect(toKoreanNumber(10_000n)).toBe('만');
    expect(toKoreanNumber(100_000_000n)).toBe('일억');
    expect(toKoreanNumber(123_456_789n)).toBe('일억이천삼백사십오만육천칠백팔십구');
  });

  it('retains each leading 일 in formal document notation', () => {
    expect(toKoreanNumber(10_000_000n, true)).toBe('일천만');
    expect(toKoreanNumber(1_111_111n, true)).toBe('일백일십일만일천일백일십일');
  });

  it('supports the documented upper boundary without Number precision loss', () => {
    expect(toKoreanNumber(MAX_AMOUNT, true)).toContain('구천구백구십구극');
    expect(formatAmount(MAX_AMOUNT)).toContain(',');
  });
});

describe('convertAmount', () => {
  it('returns plain, amount, 금, and 일금 copy forms', () => {
    expect(convertAmount('1,250,000')).toMatchObject({
      plain: '백이십오만',
      amount: '일백이십오만원',
      geum: '금 일백이십오만원정',
      ilgeum: '일금 일백이십오만원정',
    });
  });
});

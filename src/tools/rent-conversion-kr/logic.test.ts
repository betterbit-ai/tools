import { describe, expect, it } from 'vitest';
import {
  calculateRentConversion,
  KOREA_RENT_RULES_2026,
  LEGAL_CONVERSION_CAP_PERCENT,
  parseRatePercent,
  parseTenThousandWon,
} from './logic';

const baseInput = {
  direction: 'jeonseToMonthly' as const,
  contractContext: 'existing' as const,
  jeonseDepositTenThousands: '30,000',
  monthlyDepositTenThousands: '10,000',
  monthlyRentTenThousands: '100',
  requestedRatePercent: '6',
};

describe('2026 Korean rent-conversion rules', () => {
  it('derives the current statutory cap from the official figures kept in one place', () => {
    expect(KOREA_RENT_RULES_2026.bokBaseRatePercent).toBe(3);
    expect(KOREA_RENT_RULES_2026.decreeAdditionPercentPoints).toBe(2);
    expect(KOREA_RENT_RULES_2026.absoluteCapPercent).toBe(10);
    expect(KOREA_RENT_RULES_2026.bokBaseRateEffectiveDate).toBe('2026-08-27');
    expect(LEGAL_CONVERSION_CAP_PERCENT).toBe(5);
  });

  it('accepts grouped and full-width pasted amounts', () => {
    expect(parseTenThousandWon('３０，０００')).toBe(300_000_000);
    expect(parseTenThousandWon(' 10_000 ')).toBe(100_000_000);
    expect(parseRatePercent('５．２５')).toBe(5.25);
  });

  it('rejects empty, negative, unsafe, Korean-text, and emoji input', () => {
    expect(parseTenThousandWon('')).toBeNull();
    expect(parseTenThousandWon('-1')).toBeNull();
    expect(parseTenThousandWon('삼억원')).toBeNull();
    expect(parseTenThousandWon('30000🏠')).toBeNull();
    expect(parseTenThousandWon(String(Number.MAX_SAFE_INTEGER))).toBeNull();
    expect(parseRatePercent('100.01')).toBeNull();
  });
});

describe('jeonse to monthly rent', () => {
  it('automatically caps an existing-contract conversion at 5%', () => {
    const result = calculateRentConversion(baseInput);
    expect(result).toMatchObject({
      direction: 'jeonseToMonthly',
      jeonseDepositWon: 300_000_000,
      monthlyDepositWon: 100_000_000,
      convertedDepositWon: 200_000_000,
      requestedRatePercent: 6,
      appliedRatePercent: 5,
      legalCapApplies: true,
      wasCapped: true,
      annualRentWon: 10_000_000,
      monthlyRentWon: 833_333,
    });
  });

  it('keeps a lower agreed rate and floors the result to a whole won', () => {
    const result = calculateRentConversion({ ...baseInput, requestedRatePercent: 4 });
    expect(result).toMatchObject({ appliedRatePercent: 4, wasCapped: false, monthlyRentWon: 666_666 });
  });

  it('does not impose the statutory cap on a newly negotiated contract', () => {
    const result = calculateRentConversion({ ...baseInput, contractContext: 'new' });
    expect(result).toMatchObject({
      appliedRatePercent: 6,
      legalCapApplies: false,
      wasCapped: false,
      monthlyRentWon: 1_000_000,
    });
  });

  it('reverse-calculates an offered rent and its excess over the legal maximum', () => {
    const result = calculateRentConversion({ ...baseInput, offeredMonthlyRentTenThousands: '100' });
    expect(result?.direction).toBe('jeonseToMonthly');
    if (!result || result.direction !== 'jeonseToMonthly') throw new Error('expected forward result');
    expect(result.offer).toMatchObject({
      offeredMonthlyRentWon: 1_000_000,
      impliedRatePercent: 6,
      legalMaximumMonthlyRentWon: 833_333,
      excessMonthlyRentWon: 166_667,
      exceedsLegalCap: true,
    });
  });

  it('supports a 0% conversion but rejects a zero converted deposit', () => {
    expect(calculateRentConversion({ ...baseInput, requestedRatePercent: 0 })).toMatchObject({ monthlyRentWon: 0 });
    expect(
      calculateRentConversion({ ...baseInput, monthlyDepositTenThousands: baseInput.jeonseDepositTenThousands }),
    ).toBeNull();
    expect(calculateRentConversion({ ...baseInput, jeonseDepositTenThousands: 0 })).toBeNull();
  });
});

describe('monthly rent to jeonse', () => {
  it('converts monthly rent to an equivalent jeonse deposit without applying the one-way cap', () => {
    const result = calculateRentConversion({
      ...baseInput,
      direction: 'monthlyToJeonse',
      requestedRatePercent: 5,
    });
    expect(result).toEqual({
      direction: 'monthlyToJeonse',
      monthlyDepositWon: 100_000_000,
      monthlyRentWon: 1_000_000,
      additionalDepositWon: 240_000_000,
      equivalentJeonseDepositWon: 340_000_000,
      requestedRatePercent: 5,
      appliedRatePercent: 5,
      legalCapPercent: 5,
      legalCapApplies: false,
      wasCapped: false,
    });
  });

  it('allows zero monthly rent but rejects a zero rate and unsafe results', () => {
    expect(
      calculateRentConversion({
        ...baseInput,
        direction: 'monthlyToJeonse',
        requestedRatePercent: 5,
        monthlyRentTenThousands: 0,
      }),
    ).toMatchObject({ equivalentJeonseDepositWon: 100_000_000 });
    expect(calculateRentConversion({ ...baseInput, direction: 'monthlyToJeonse', requestedRatePercent: 0 })).toBeNull();
    expect(
      calculateRentConversion({
        ...baseInput,
        direction: 'monthlyToJeonse',
        requestedRatePercent: 0.000_001,
        monthlyRentTenThousands: '900000000000',
      }),
    ).toBeNull();
  });
});

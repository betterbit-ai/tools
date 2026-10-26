/**
 * Pure logic for rent-conversion-kr. Amount inputs use 만원 (KRW 10,000),
 * matching Korean rental listings; every calculated amount is returned in won.
 */

export const KOREA_RENT_RULES_2026 = Object.freeze({
  currentActEffectiveDate: '2026-01-02',
  bokBaseRatePercent: 3,
  bokBaseRateEffectiveDate: '2026-08-27',
  decreeAdditionPercentPoints: 2,
  decreeAdditionEffectiveDate: '2020-09-29',
  absoluteCapPercent: 10,
  currentDecreeEffectiveDate: '2026-07-01',
  verifiedDate: '2026-10-27',
});

export const LEGAL_CONVERSION_CAP_PERCENT = Math.min(
  KOREA_RENT_RULES_2026.absoluteCapPercent,
  KOREA_RENT_RULES_2026.bokBaseRatePercent + KOREA_RENT_RULES_2026.decreeAdditionPercentPoints,
);

export const MAX_RATE_PERCENT = 100;

export type RentDirection = 'jeonseToMonthly' | 'monthlyToJeonse';
export type ContractContext = 'existing' | 'new';
export type NumericInput = number | string;

export interface RentConversionInput {
  direction: RentDirection;
  contractContext: ContractContext;
  jeonseDepositTenThousands: NumericInput;
  monthlyDepositTenThousands: NumericInput;
  monthlyRentTenThousands: NumericInput;
  requestedRatePercent: NumericInput;
  offeredMonthlyRentTenThousands?: NumericInput | '';
}

interface ConversionBasis {
  requestedRatePercent: number;
  appliedRatePercent: number;
  legalCapPercent: number;
  legalCapApplies: boolean;
  wasCapped: boolean;
}

export interface OfferAnalysis {
  offeredMonthlyRentWon: number;
  impliedRatePercent: number;
  legalMaximumMonthlyRentWon: number;
  excessMonthlyRentWon: number;
  exceedsLegalCap: boolean;
}

export interface JeonseToMonthlyResult extends ConversionBasis {
  direction: 'jeonseToMonthly';
  jeonseDepositWon: number;
  monthlyDepositWon: number;
  convertedDepositWon: number;
  annualRentWon: number;
  monthlyRentWon: number;
  offer?: OfferAnalysis;
}

export interface MonthlyToJeonseResult extends ConversionBasis {
  direction: 'monthlyToJeonse';
  monthlyDepositWon: number;
  monthlyRentWon: number;
  additionalDepositWon: number;
  equivalentJeonseDepositWon: number;
}

export type RentConversionResult = JeonseToMonthlyResult | MonthlyToJeonseResult;

/** Accepts grouped and full-width numeric input, then converts 만원 to whole won. */
export function parseTenThousandWon(value: NumericInput): number | null {
  const parsed = parseNumber(value);
  if (parsed === null || parsed < 0) return null;
  const won = Math.round(parsed * 10_000);
  return Number.isSafeInteger(won) ? won : null;
}

/** Accepts grouped and full-width percentage input. */
export function parseRatePercent(value: NumericInput): number | null {
  const parsed = parseNumber(value);
  if (parsed === null || parsed < 0 || parsed > MAX_RATE_PERCENT) return null;
  return parsed;
}

/**
 * Converts a Korean residential lease in either direction.
 *
 * The statutory ceiling is applied only to deposit → rent for an existing or
 * renewed lease. Reverse conversion and newly negotiated contracts retain the
 * user's comparison rate because Article 7-2 does not set their contract price.
 */
export function calculateRentConversion(input: RentConversionInput): RentConversionResult | null {
  const monthlyDepositWon = parseTenThousandWon(input.monthlyDepositTenThousands);
  const requestedRatePercent = parseRatePercent(input.requestedRatePercent);
  if (monthlyDepositWon === null || requestedRatePercent === null) return null;

  if (input.direction === 'jeonseToMonthly') {
    const jeonseDepositWon = parseTenThousandWon(input.jeonseDepositTenThousands);
    if (jeonseDepositWon === null || jeonseDepositWon <= 0 || monthlyDepositWon >= jeonseDepositWon) return null;

    const legalCapApplies = input.contractContext === 'existing';
    const appliedRatePercent = legalCapApplies
      ? Math.min(requestedRatePercent, LEGAL_CONVERSION_CAP_PERCENT)
      : requestedRatePercent;
    const convertedDepositWon = jeonseDepositWon - monthlyDepositWon;
    const annualRentWon = floorWholeWon((convertedDepositWon * appliedRatePercent) / 100);
    const monthlyRentWon = floorWholeWon(annualRentWon / 12);
    if (![annualRentWon, monthlyRentWon].every(Number.isSafeInteger)) return null;

    const result: JeonseToMonthlyResult = {
      direction: 'jeonseToMonthly',
      jeonseDepositWon,
      monthlyDepositWon,
      convertedDepositWon,
      annualRentWon,
      monthlyRentWon,
      requestedRatePercent,
      appliedRatePercent,
      legalCapPercent: LEGAL_CONVERSION_CAP_PERCENT,
      legalCapApplies,
      wasCapped: legalCapApplies && requestedRatePercent > LEGAL_CONVERSION_CAP_PERCENT,
    };

    const offeredMonthlyRentWon = parseOptionalTenThousandWon(input.offeredMonthlyRentTenThousands);
    if (offeredMonthlyRentWon !== undefined) {
      if (offeredMonthlyRentWon === null) return null;
      const legalMaximumMonthlyRentWon = floorWholeWon((convertedDepositWon * LEGAL_CONVERSION_CAP_PERCENT) / 100 / 12);
      const impliedRatePercent = (offeredMonthlyRentWon * 12 * 100) / convertedDepositWon;
      if (!Number.isFinite(impliedRatePercent)) return null;
      result.offer = {
        offeredMonthlyRentWon,
        impliedRatePercent,
        legalMaximumMonthlyRentWon,
        excessMonthlyRentWon: Math.max(0, offeredMonthlyRentWon - legalMaximumMonthlyRentWon),
        exceedsLegalCap: offeredMonthlyRentWon > legalMaximumMonthlyRentWon,
      };
    }

    return result;
  }

  const monthlyRentWon = parseTenThousandWon(input.monthlyRentTenThousands);
  if (monthlyRentWon === null || requestedRatePercent <= 0) return null;
  const additionalDepositWon = Math.round((monthlyRentWon * 12 * 100) / requestedRatePercent);
  const equivalentJeonseDepositWon = monthlyDepositWon + additionalDepositWon;
  if (![additionalDepositWon, equivalentJeonseDepositWon].every(Number.isSafeInteger)) return null;

  return {
    direction: 'monthlyToJeonse',
    monthlyDepositWon,
    monthlyRentWon,
    additionalDepositWon,
    equivalentJeonseDepositWon,
    requestedRatePercent,
    appliedRatePercent: requestedRatePercent,
    legalCapPercent: LEGAL_CONVERSION_CAP_PERCENT,
    legalCapApplies: false,
    wasCapped: false,
  };
}

function parseNumber(value: NumericInput): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = value
    .normalize('NFKC')
    .trim()
    .replace(/[,_\s]/g, '');
  if (!normalized || !/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalTenThousandWon(value: NumericInput | '' | undefined): number | null | undefined {
  if (value === undefined || (typeof value === 'string' && value.trim() === '')) return undefined;
  return parseTenThousandWon(value);
}

function floorWholeWon(value: number): number {
  return Math.floor(value + Number.EPSILON);
}

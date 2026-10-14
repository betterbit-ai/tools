/** Pure Korean amount conversion. This module deliberately has no DOM or Preact dependencies. */

const DIGITS = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'] as const;
const PLACE_UNITS = ['', '십', '백', '천'] as const;
const LARGE_UNITS = ['', '만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극'] as const;

/** The largest amount with a named four-digit Korean unit supported by this tool. */
export const MAX_AMOUNT = 10n ** BigInt(LARGE_UNITS.length * 4) - 1n;

export type AmountParseError = 'empty' | 'invalid' | 'decimal' | 'negative' | 'tooLarge';

export type AmountParseResult = { ok: true; value: bigint } | { ok: false; code: AmountParseError };

export interface KoreanAmount {
  ok: true;
  value: bigint;
  /** Everyday Sino-Korean form, e.g. 천이백삼십사만오천육백칠십팔. */
  plain: string;
  /** Document form retaining every leading 일, e.g. 일천이백삼십사만오천육백칠십팔원. */
  amount: string;
  /** Formal contract amount beginning with 금. */
  geum: string;
  /** Formal contract amount beginning with 일금. */
  ilgeum: string;
}

/**
 * Accepts an integer pasted from a Korean spreadsheet or form. Full-width
 * digits, commas, spaces, ₩, and a trailing 원 normalize safely; fractions,
 * negatives, emoji, and Hangul words are rejected rather than guessed.
 */
export function parseAmount(input: string): AmountParseResult {
  const normalized = input.normalize('NFKC').trim();
  if (!normalized) return { ok: false, code: 'empty' };
  if (normalized.includes('.') || normalized.includes('·')) return { ok: false, code: 'decimal' };
  if (normalized.startsWith('-')) return { ok: false, code: 'negative' };

  const digits = normalized.replace(/[\s,₩원]/g, '');
  if (!digits || !/^\d+$/.test(digits)) return { ok: false, code: 'invalid' };

  const value = BigInt(digits);
  if (value > MAX_AMOUNT) return { ok: false, code: 'tooLarge' };
  return { ok: true, value };
}

/** Formats an integer with standard decimal groups without precision loss. */
export function formatAmount(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Converts a non-negative Korean won amount into all document-ready forms. */
export function convertAmount(input: string): KoreanAmount | { ok: false; code: AmountParseError } {
  const parsed = parseAmount(input);
  if (!parsed.ok) return parsed;

  const plain = toKoreanNumber(parsed.value, false);
  const amount = `${toKoreanNumber(parsed.value, true)}원`;
  return {
    ok: true,
    value: parsed.value,
    plain,
    amount,
    geum: `금 ${amount}정`,
    ilgeum: `일금 ${amount}정`,
  };
}

/**
 * Writes a Sino-Korean cardinal in four-digit groups. Formal document form
 * keeps 일 before 십·백·천 and high units; everyday form omits it where natural.
 */
export function toKoreanNumber(value: bigint, formal = false): string {
  if (value < 0n || value > MAX_AMOUNT) throw new RangeError('Amount is outside the supported range.');
  if (value === 0n) return '영';

  const groups: number[] = [];
  let rest = value;
  while (rest > 0n) {
    groups.push(Number(rest % 10_000n));
    rest /= 10_000n;
  }

  return groups
    .map((group, index) => {
      if (group === 0) return '';
      // 만 is conventionally written without 일 in everyday Korean (만, not 일만).
      const numeral = !formal && index === 1 && group === 1 ? '' : toKoreanGroup(group, formal);
      return `${numeral}${LARGE_UNITS[index]}`;
    })
    .reverse()
    .join('');
}

function toKoreanGroup(group: number, formal: boolean): string {
  let result = '';
  for (let place = 3; place >= 0; place -= 1) {
    const divisor = 10 ** place;
    const digit = Math.floor(group / divisor) % 10;
    if (!digit) continue;
    const showOne = formal || digit !== 1 || place === 0;
    result += `${showOne ? DIGITS[digit] : ''}${PLACE_UNITS[place]}`;
  }
  return result;
}

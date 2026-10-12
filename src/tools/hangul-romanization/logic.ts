/**
 * Hangul → Revised Romanization helpers. These are deliberately browser-free so
 * the rule table and sound-change handling can be tested independently of the UI.
 */

export type RomanizationMode = 'standard' | 'name';

const INITIALS = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];
const VOWELS = [
  'a',
  'ae',
  'ya',
  'yae',
  'eo',
  'e',
  'yeo',
  'ye',
  'o',
  'wa',
  'wae',
  'oe',
  'yo',
  'u',
  'wo',
  'we',
  'wi',
  'yu',
  'eu',
  'ui',
  'i',
];
const FINALS = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

const INITIAL_RR: Record<string, string> = {
  ㄱ: 'g',
  ㄲ: 'kk',
  ㄴ: 'n',
  ㄷ: 'd',
  ㄸ: 'tt',
  ㄹ: 'r',
  'ㄹ-l': 'l',
  ㅁ: 'm',
  ㅂ: 'b',
  ㅃ: 'pp',
  ㅅ: 's',
  ㅆ: 'ss',
  ㅇ: '',
  ㅈ: 'j',
  ㅉ: 'jj',
  ㅊ: 'ch',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 'h',
};
const FINAL_RR: Record<string, string> = {
  '': '',
  ㄱ: 'k',
  ㄲ: 'k',
  ㄳ: 'k',
  ㄴ: 'n',
  ㄵ: 'n',
  ㄶ: 'n',
  ㄷ: 't',
  ㄹ: 'l',
  ㄺ: 'k',
  ㄻ: 'm',
  ㄼ: 'p',
  ㄽ: 'l',
  ㄾ: 'l',
  ㄿ: 'p',
  ㅀ: 'l',
  ㅁ: 'm',
  ㅂ: 'p',
  ㅄ: 'p',
  ㅅ: 't',
  ㅆ: 't',
  ㅇ: 'ng',
  ㅈ: 't',
  ㅊ: 't',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 't',
};
const CLUSTERS: Record<string, string[]> = {
  ㄳ: ['ㄱ', 'ㅅ'],
  ㄵ: ['ㄴ', 'ㅈ'],
  ㄶ: ['ㄴ', 'ㅎ'],
  ㄺ: ['ㄹ', 'ㄱ'],
  ㄻ: ['ㄹ', 'ㅁ'],
  ㄼ: ['ㄹ', 'ㅂ'],
  ㄽ: ['ㄹ', 'ㅅ'],
  ㄾ: ['ㄹ', 'ㅌ'],
  ㄿ: ['ㄹ', 'ㅍ'],
  ㅀ: ['ㄹ', 'ㅎ'],
  ㅄ: ['ㅂ', 'ㅅ'],
};
const PASSPORT_SURNAMES: Record<string, string> = {
  김: 'Kim',
  이: 'Lee',
  박: 'Park',
  최: 'Choi',
  정: 'Jeong',
  강: 'Kang',
  조: 'Cho',
  윤: 'Yoon',
  장: 'Jang',
  임: 'Lim',
  한: 'Han',
  오: 'Oh',
  서: 'Seo',
  신: 'Shin',
  권: 'Kwon',
  황: 'Hwang',
  안: 'Ahn',
  송: 'Song',
  전: 'Jeon',
  홍: 'Hong',
  유: 'Yoo',
  고: 'Ko',
  문: 'Moon',
  양: 'Yang',
  손: 'Son',
  배: 'Bae',
  백: 'Baek',
  허: 'Heo',
  노: 'Roh',
};

interface Syllable {
  initial: string;
  vowel: string;
  final: string;
}

function decompose(char: string): Syllable | null {
  const offset = char.codePointAt(0)! - 0xac00;
  if (offset < 0 || offset >= 11_172) return null;
  return {
    initial: INITIALS[Math.floor(offset / 588)],
    vowel: VOWELS[Math.floor((offset % 588) / 28)],
    final: FINALS[offset % 28],
  };
}

function initialForLiaison(final: string, vowel: string): string {
  if (final === 'ㅎ') return '';
  if (final === 'ㄷ' && vowel === 'i') return 'ㅈ';
  if (final === 'ㅌ' && vowel === 'i') return 'ㅊ';
  return final;
}

/** Applies the high-impact inter-syllable pronunciation rules used by RR. */
function applySoundChanges(syllables: Syllable[]): void {
  for (let index = 0; index < syllables.length - 1; index++) {
    const current = syllables[index];
    const next = syllables[index + 1];
    if (!current.final) continue;
    if (next.initial === 'ㅇ') {
      const parts = CLUSTERS[current.final] ?? [current.final];
      current.final = parts.length === 2 ? parts[0] : '';
      next.initial = initialForLiaison(parts.at(-1)!, next.vowel);
      continue;
    }
    // 종로 → Jongno, 신라 → Silla, 독립문 → Dongnimmun.
    if (next.initial === 'ㄹ') {
      if (['ㄱ', 'ㄲ', 'ㅋ', 'ㄳ', 'ㄺ'].includes(current.final)) current.final = 'ㅇ';
      else if (['ㄴ', 'ㄵ', 'ㄶ', 'ㄹ', 'ㄽ', 'ㄾ', 'ㅀ'].includes(current.final)) {
        current.final = 'ㄹ';
        next.initial = 'ㄹ-l';
        continue;
      } else if (['ㅇ', 'ㅁ', 'ㄻ'].includes(current.final)) current.final = current.final === 'ㅇ' ? 'ㅇ' : 'ㅁ';
      else if (['ㅂ', 'ㅍ', 'ㄼ', 'ㄿ', 'ㅄ'].includes(current.final)) current.final = 'ㅁ';
      else current.final = 'ㄴ';
      next.initial = 'ㄴ';
      continue;
    }
    if (next.initial === 'ㄴ' || next.initial === 'ㅁ') {
      if (['ㄱ', 'ㄲ', 'ㅋ', 'ㄳ', 'ㄺ'].includes(current.final)) current.final = 'ㅇ';
      else if (['ㄷ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ', 'ㄵ', 'ㄶ', 'ㄽ', 'ㄾ'].includes(current.final))
        current.final = 'ㄴ';
      else if (['ㅂ', 'ㅍ', 'ㄼ', 'ㄿ', 'ㅄ'].includes(current.final)) current.final = 'ㅁ';
      else if (current.final === 'ㄹ' && next.initial === 'ㄴ') next.initial = 'ㄹ-l';
    }
  }
}

function romanizeWord(word: string, mode: RomanizationMode): string {
  const syllables = [...word].map(decompose).filter((syllable): syllable is Syllable => syllable !== null);
  if (mode === 'standard') applySoundChanges(syllables);
  return syllables.map(({ initial, vowel, final }) => `${INITIAL_RR[initial]}${vowel}${FINAL_RR[final]}`).join('');
}

function titleCase(value: string): string {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

/** Converts precomposed or decomposed Hangul while retaining mixed text exactly. */
export function romanize(input: string, mode: RomanizationMode = 'standard', capitalize = true): string {
  const normalized = input.normalize('NFC');
  return normalized.replace(/[\uac00-\ud7a3]+/gu, (word, offset: number) => {
    if (mode === 'name') {
      const letters = [...word];
      if (letters.length < 2) return romanizeWord(word, mode);
      const surname = PASSPORT_SURNAMES[letters[0]] ?? titleCase(romanizeWord(letters[0], mode));
      const givenName = romanizeWord(letters.slice(1).join(''), mode);
      return capitalize ? `${surname} ${titleCase(givenName)}` : `${surname.toLowerCase()} ${givenName}`;
    }
    const result = romanizeWord(word, mode);
    return capitalize && (offset === 0 || /\s$/u.test(normalized.slice(0, offset))) ? titleCase(result) : result;
  });
}

/** Returns whether text has at least one modern Hangul syllable. */
export function hasHangul(input: string): boolean {
  return [...input.normalize('NFC')].some((char) => {
    const point = char.codePointAt(0) ?? 0;
    return point >= 0xac00 && point <= 0xd7a3;
  });
}

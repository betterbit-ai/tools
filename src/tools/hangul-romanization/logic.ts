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
/** The ㅎ that moves onto a following vowel is silent, so the next syllable keeps ㅇ (no initial). */
const H_FINALS: Record<string, string> = { ㅎ: '', ㄶ: 'ㄴ', ㅀ: 'ㄹ' };
/** ㅎ before ㄱ/ㄷ/ㅈ/ㅅ merges with it: 좋다 [조타], 않소 [안쏘]. */
const ASPIRATED_INITIALS: Record<string, string> = { ㄱ: 'ㅋ', ㄷ: 'ㅌ', ㅈ: 'ㅊ', ㅅ: 'ㅆ' };

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
  하: 'Ha',
  곽: 'Kwak',
  성: 'Sung',
  차: 'Cha',
  주: 'Joo',
  우: 'Woo',
  구: 'Koo',
  민: 'Min',
  진: 'Jin',
  지: 'Ji',
  엄: 'Eom',
  채: 'Chae',
  원: 'Won',
  천: 'Chun',
  방: 'Bang',
  공: 'Kong',
  현: 'Hyun',
  함: 'Ham',
  변: 'Byun',
  염: 'Yeom',
  여: 'Yeo',
  추: 'Chu',
  도: 'Do',
  소: 'So',
  석: 'Seok',
  선: 'Sun',
  설: 'Seol',
  마: 'Ma',
  길: 'Gil',
  연: 'Yeon',
  위: 'Wi',
  표: 'Pyo',
  명: 'Myung',
  기: 'Ki',
  반: 'Ban',
  라: 'Ra',
  왕: 'Wang',
  금: 'Keum',
  옥: 'Ok',
  육: 'Yook',
  인: 'In',
  맹: 'Maeng',
  제: 'Je',
  모: 'Mo',
  탁: 'Tak',
  국: 'Kook',
  어: 'Eo',
  은: 'Eun',
  편: 'Pyun',
};

/** Two-syllable family names are written as one word, not as two one-syllable names. */
const COMPOUND_SURNAMES: Record<string, string> = {
  남궁: 'Namgung',
  황보: 'Hwangbo',
  제갈: 'Jegal',
  선우: 'Seonu',
  독고: 'Dokgo',
  사공: 'Sagong',
  서문: 'Seomun',
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
  if (final === 'ㅎ') return 'ㅇ';
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
      const moved = parts.at(-1)!;
      if (moved === 'ㅎ') {
        // The ㅎ is silent: 않아 keeps its ㄴ (ana), 싫어 lets the ㄹ start the next syllable (sireo).
        const kept = parts.length === 2 ? parts[0] : '';
        current.final = kept === 'ㄹ' ? '' : kept;
        next.initial = kept === 'ㄹ' ? 'ㄹ' : 'ㅇ';
      } else {
        current.final = parts.length === 2 ? parts[0] : '';
        next.initial = initialForLiaison(moved, next.vowel);
      }
      continue;
    }
    // 좋다 → jota, 많다 → manta, 싫소 → silsso: the ㅎ merges into the next consonant.
    if (current.final in H_FINALS && ASPIRATED_INITIALS[next.initial]) {
      current.final = H_FINALS[current.final];
      next.initial = ASPIRATED_INITIALS[next.initial];
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
  return syllables
    .map(({ initial, vowel, final }) => `${INITIAL_RR[initial] ?? ''}${vowel}${FINAL_RR[final] ?? ''}`)
    .join('');
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
      // A family name typed on its own is still that family name: 이 → Lee, not "I".
      if (letters.length === 1) {
        const surname = PASSPORT_SURNAMES[letters[0]] ?? titleCase(romanizeWord(word, mode));
        return capitalize ? surname : surname.toLowerCase();
      }
      const compound = letters.length > 2 ? COMPOUND_SURNAMES[letters.slice(0, 2).join('')] : undefined;
      const surname = compound ?? PASSPORT_SURNAMES[letters[0]] ?? titleCase(romanizeWord(letters[0], mode));
      const givenName = romanizeWord(letters.slice(compound ? 2 : 1).join(''), mode);
      if (!givenName) return capitalize ? surname : surname.toLowerCase();
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

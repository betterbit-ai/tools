/**
 * Pure logic for typing-test — no DOM, no Preact. Everything testable lives here.
 *
 * Scoring follows the Korean typing-software convention: 분당 타수 (keystrokes per
 * minute) counts each 자소 (jamo) a 2-벌식 keyboard would require, not just the
 * number of syllables — this is the unit Hancom's typing-test software switched
 * to (see its stroke-count notice: https://support.hancomtaja.com/27112623-a842-4138-97f6-c0c6be83c5f6).
 * Per-component counts follow the common convention used by Korean typing-practice tools:
 *   - 초성 = 1 stroke, 쌍자음 초성/종성 (ㄲㄸㅃㅆㅉ) = 1 stroke (current convention)
 *   - 중성: a simple vowel = 1 stroke, a compound vowel (ㅘㅙㅚㅝㅞㅟㅢ) = 2 strokes
 *     (it is typed as two separate keys, e.g. "왜" = ㅇ+ㅗ+ㅐ = 3 strokes)
 *   - 종성 (받침): none = 0, a simple final = 1 stroke, a compound final
 *     (겹받침 ㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄ) = 2 strokes
 * English speed uses the standard WPM definition: one "word" = 5 characters.
 */

export type TypingLanguage = 'en' | 'ko';
export type TypingStatus = 'idle' | 'running' | 'done';
export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'extra';

export interface CharResult {
  expected: string;
  status: CharStatus;
}

export interface TypingScore {
  elapsedMs: number;
  typedChars: number;
  correctChars: number;
  incorrectChars: number;
  speed: number; // WPM for 'en', 분당 타수 for 'ko'
  accuracy: number; // 0–100, one decimal
}

const EN_WORDS = [
  'the',
  'of',
  'and',
  'a',
  'to',
  'in',
  'is',
  'you',
  'that',
  'it',
  'he',
  'was',
  'for',
  'on',
  'are',
  'as',
  'with',
  'his',
  'they',
  'at',
  'be',
  'this',
  'have',
  'from',
  'or',
  'one',
  'had',
  'by',
  'word',
  'but',
  'not',
  'what',
  'all',
  'were',
  'we',
  'when',
  'your',
  'can',
  'said',
  'there',
  'use',
  'an',
  'each',
  'which',
  'she',
  'do',
  'how',
  'their',
  'if',
  'will',
  'up',
  'other',
  'about',
  'out',
  'many',
  'then',
  'them',
  'these',
  'so',
  'some',
  'her',
  'would',
  'make',
  'like',
  'him',
  'into',
  'time',
  'has',
  'look',
  'two',
  'more',
  'write',
  'go',
  'see',
  'number',
  'no',
  'way',
  'could',
  'people',
  'my',
  'than',
  'first',
  'water',
  'been',
  'call',
  'who',
  'its',
  'now',
  'find',
  'long',
  'down',
  'day',
  'did',
  'get',
  'come',
  'made',
  'may',
  'part',
  'over',
  'new',
  'sound',
  'take',
  'only',
  'little',
  'work',
  'know',
  'place',
  'year',
  'live',
  'back',
  'give',
  'most',
  'very',
  'after',
  'thing',
  'our',
  'just',
  'name',
  'good',
  'sentence',
  'man',
  'think',
  'great',
  'help',
  'low',
  'line',
  'differ',
  'turn',
  'cause',
  'much',
  'mean',
  'before',
  'move',
  'right',
  'boy',
  'old',
  'too',
  'same',
  'tell',
  'does',
  'set',
  'three',
  'want',
  'air',
  'well',
  'also',
  'play',
  'small',
  'end',
  'put',
  'home',
  'read',
  'hand',
  'port',
  'large',
  'spell',
  'add',
  'even',
  'land',
  'here',
  'must',
  'big',
  'high',
  'such',
  'follow',
  'act',
  'why',
  'ask',
  'men',
  'change',
  'went',
  'light',
  'kind',
  'need',
  'house',
  'picture',
  'try',
  'us',
  'again',
  'animal',
  'point',
  'mother',
  'world',
  'near',
  'build',
  'self',
  'earth',
  'father',
  'any',
  'new',
];

const KO_WORDS = [
  '사랑',
  '행복',
  '친구',
  '학교',
  '바람',
  '하늘',
  '바다',
  '고양이',
  '강아지',
  '커피',
  '음악',
  '여행',
  '가족',
  '사람',
  '시간',
  '오늘',
  '내일',
  '어제',
  '봄날',
  '여름',
  '가을',
  '겨울',
  '과일',
  '채소',
  '병원',
  '은행',
  '도서관',
  '공원',
  '영화',
  '요리',
  '청소',
  '운동',
  '독서',
  '희망',
  '용기',
  '감사',
  '사진',
  '편지',
  '전화',
  '컴퓨터',
  '자동차',
  '비행기',
  '기차',
  '지하철',
  '버스',
  '도시',
  '시골',
  '하얀색',
  '빨간색',
  '파란색',
  '즐거운',
  '건강',
  '행운',
  '성공',
  '실패',
  '연습',
  '노력',
  '시작',
  '마지막',
  '아침',
  '점심',
  '저녁',
  '주말',
  '평일',
  '휴가',
  '방학',
  '시험',
  '숙제',
  '회의',
  '약속',
  '선물',
  '생일',
  '축하',
  '환영',
  '위로',
  '응원',
  '신뢰',
  '우정',
  '믿음',
  '왜냐하면',
  '괜찮아요',
  '궁금해요',
  '웃음',
  '눈물',
  '꽃밭',
  '나무',
  '구름',
  '달빛',
  '별빛',
  '아버지',
  '어머니',
  '동생',
  '선생님',
  '학생',
  '회사원',
  '요즘',
  '옛날',
  '미래',
  '추억',
];

export function sampleWordCount(durationSeconds: number): number {
  // Generous for even very fast typists (~220 wpm), so a running test rarely
  // runs out of words before the timer does.
  return Math.ceil((durationSeconds / 60) * 220) + 20;
}

export function buildSample(language: TypingLanguage, wordCount: number, rng: () => number = Math.random): string {
  const pool = language === 'en' ? EN_WORDS : KO_WORDS;
  const words: string[] = [];
  for (let i = 0; i < Math.max(0, wordCount); i++) {
    words.push(pool[Math.floor(rng() * pool.length)]);
  }
  return words.join(' ');
}

/** Compares typed input against the target text, position by position. */
export function diff(target: string, typed: string): CharResult[] {
  const targetChars = Array.from(target);
  const typedChars = Array.from(typed);
  const len = Math.max(targetChars.length, typedChars.length);
  const result: CharResult[] = [];
  for (let i = 0; i < len; i++) {
    const expected = targetChars[i];
    const t = typedChars[i];
    if (expected === undefined) {
      result.push({ expected: '', status: 'extra' });
    } else if (t === undefined) {
      result.push({ expected, status: 'pending' });
    } else {
      result.push({ expected, status: t === expected ? 'correct' : 'incorrect' });
    }
  }
  return result;
}

const JUNG_LIST = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];
const JONG_LIST = [
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
const COMPOUND_JUNG = new Set(['ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ']);
const COMPOUND_JONG = new Set(['ㄳ', 'ㄵ', 'ㄶ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅄ']);
const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;

/** Keystrokes a 2-벌식 keyboard needs for one character (1 for anything non-Hangul). */
export function strokesForChar(ch: string): number {
  const code = ch.codePointAt(0) ?? 0;
  if (code < HANGUL_BASE || code > HANGUL_LAST) return 1;
  const offset = code - HANGUL_BASE;
  const jungIndex = Math.floor(offset / 28) % 21;
  const jongIndex = offset % 28;
  let strokes = 1; // 초성
  strokes += COMPOUND_JUNG.has(JUNG_LIST[jungIndex]) ? 2 : 1;
  if (jongIndex > 0) strokes += COMPOUND_JONG.has(JONG_LIST[jongIndex]) ? 2 : 1;
  return strokes;
}

export function countStrokes(text: string): number {
  return Array.from(text).reduce((sum, ch) => sum + strokesForChar(ch), 0);
}

export function strokesPerMinute(strokes: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return Math.round(strokes / (elapsedMs / 60_000));
}

export function wordsPerMinute(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return Math.round(correctChars / 5 / (elapsedMs / 60_000));
}

export function accuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 1000) / 10;
}

export function score(language: TypingLanguage, target: string, typed: string, elapsedMs: number): TypingScore {
  const results = diff(target, typed);
  const correctText = results
    .filter((r) => r.status === 'correct')
    .map((r) => r.expected)
    .join('');
  const correctChars = correctText.length;
  const incorrectChars = results.filter((r) => r.status === 'incorrect').length;
  const typedChars = Array.from(typed).length;
  const speed =
    language === 'en'
      ? wordsPerMinute(correctChars, elapsedMs)
      : strokesPerMinute(countStrokes(correctText), elapsedMs);
  return {
    elapsedMs,
    typedChars,
    correctChars,
    incorrectChars,
    speed,
    accuracy: accuracy(correctChars, correctChars + incorrectChars),
  };
}

export type EnTier = 'beginner' | 'average' | 'good' | 'fast';
export type KoTier = 'beginner' | 'average' | 'fast' | 'expert' | 'master';

/** English WPM benchmarks: ~40 everyday, 60+ strong, 80+ fast typists. */
export function englishTier(wpm: number): EnTier {
  if (wpm < 40) return 'beginner';
  if (wpm < 60) return 'average';
  if (wpm < 80) return 'good';
  return 'fast';
}

/** Korean 분당타수 benchmarks: ~200–300 general adult, 350–450 clerical/certification, 600+ professional. */
export function koreanTier(cpm: number): KoTier {
  if (cpm < 200) return 'beginner';
  if (cpm < 350) return 'average';
  if (cpm < 500) return 'fast';
  if (cpm < 650) return 'expert';
  return 'master';
}

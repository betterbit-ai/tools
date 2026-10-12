/** Pure placeholder-text generation. No DOM or browser state. */

export const MAX_COUNT = 100;
export type IpsumLanguage = 'latin' | 'korean';
export type IpsumUnit = 'paragraphs' | 'sentences' | 'words' | 'characters';
export type OutputFormat = 'plain' | 'html';

export interface IpsumOptions {
  language: IpsumLanguage;
  unit: IpsumUnit;
  count: number;
  startWithClassic: boolean;
  format: OutputFormat;
}

export interface IpsumResult {
  plainText: string;
  text: string;
  words: number;
  characters: number;
  paragraphs: number;
}

const LATIN_WORDS =
  `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum praesent sapien fermentum vivamus hendrerit integer molestie posuere facilisis vehicula pulvinar suscipit gravida`.split(
    ' ',
  );

const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

/** Individual sentences deliberately make sense; their randomized order does not imply a narrative. */
const KOREAN_SENTENCES = [
  '아침 햇살이 창가를 비추자 조용한 거리에 사람들의 발걸음이 이어졌습니다.',
  '새로운 소식을 기다리던 사람들은 따뜻한 차를 마시며 이야기를 나누었습니다.',
  '작은 공원에서는 바람에 흔들리는 나뭇잎 소리가 부드럽게 들렸습니다.',
  '도서관 창문 너머로 구름이 천천히 지나가고 있었습니다.',
  '회의가 끝난 뒤에는 필요한 내용을 차분히 정리해 두었습니다.',
  '낮은 언덕을 따라 걸으며 계절이 바뀌는 모습을 바라보았습니다.',
  '익숙한 골목에는 오래된 가게와 새로운 간판이 함께 놓여 있었습니다.',
  '간단한 계획을 세운 뒤 필요한 자료를 하나씩 확인했습니다.',
  '주말 오후에는 가까운 곳에서 여유로운 시간을 보내고 싶었습니다.',
  '창문을 열자 선선한 바람과 함께 가벼운 빗소리가 들어왔습니다.',
  '모두가 편안하게 의견을 나눌 수 있도록 자리를 넓게 마련했습니다.',
  '오늘의 작은 변화가 내일의 더 좋은 선택으로 이어질 수 있습니다.',
];

function normalizedCount(count: number): number {
  if (!Number.isFinite(count)) return 1;
  return Math.min(MAX_COUNT, Math.max(1, Math.floor(count)));
}

/** Small deterministic generator so generation remains testable with a supplied seed. */
function random(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function pick<T>(items: T[], next: () => number): T {
  return items[Math.floor(next() * items.length)]!;
}

function sentenceFromWords(next: () => number): string {
  const size = 8 + Math.floor(next() * 9);
  const words = Array.from({ length: size }, () => pick(LATIN_WORDS, next));
  words[0] = `${words[0]![0]!.toUpperCase()}${words[0]!.slice(1)}`;
  return `${words.join(' ')}${next() > 0.18 ? '.' : ','}`;
}

function latinSentences(count: number, next: () => number, classic: boolean): string[] {
  const sentences = Array.from({ length: count }, () => sentenceFromWords(next));
  if (classic) sentences[0] = CLASSIC_OPENING;
  return sentences;
}

function koreanSentences(count: number, next: () => number): string[] {
  return Array.from({ length: count }, () => pick(KOREAN_SENTENCES, next));
}

function sentencesFor(language: IpsumLanguage, count: number, next: () => number, classic: boolean): string[] {
  return language === 'latin' ? latinSentences(count, next, classic) : koreanSentences(count, next);
}

function wordsFor(language: IpsumLanguage, count: number, next: () => number, classic: boolean): string {
  if (language === 'latin') {
    const words = Array.from({ length: count }, () => pick(LATIN_WORDS, next));
    if (classic) {
      const opening = CLASSIC_OPENING.replace(/[,.]/g, '').split(' ');
      for (let i = 0; i < Math.min(count, opening.length); i++) words[i] = opening[i]!;
    }
    return words.join(' ');
  }

  const pool = KOREAN_SENTENCES.join(' ').replace(/[.]/g, '').split(/\s+/u);
  return Array.from({ length: count }, () => pick(pool, next)).join(' ');
}

function takeCharacters(source: string, count: number): string {
  let text = source;
  while (Array.from(text).length < count) text += ` ${source}`;
  return Array.from(text).slice(0, count).join('');
}

function paragraphText(language: IpsumLanguage, count: number, next: () => number, classic: boolean): string {
  return Array.from({ length: count }, (_, index) => {
    const sentenceCount = 3 + Math.floor(next() * 3);
    return sentencesFor(language, sentenceCount, next, classic && index === 0).join(' ');
  }).join('\n\n');
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/u).length : 0;
}

export function generateIpsum(options: IpsumOptions, seed = 1): IpsumResult {
  const count = normalizedCount(options.count);
  const next = random(seed);
  let plainText: string;

  if (options.unit === 'paragraphs') {
    plainText = paragraphText(options.language, count, next, options.startWithClassic);
  } else if (options.unit === 'sentences') {
    plainText = sentencesFor(options.language, count, next, options.startWithClassic).join(' ');
  } else if (options.unit === 'words') {
    plainText = wordsFor(options.language, count, next, options.startWithClassic);
  } else {
    const source = paragraphText(options.language, 2, next, options.startWithClassic);
    plainText = takeCharacters(source, count);
  }

  const paragraphs = plainText.split(/\n\n/u).filter(Boolean).length;
  const text =
    options.format === 'html'
      ? plainText
          .split(/\n\n/u)
          .map((p) => `<p>${p}</p>`)
          .join('\n')
      : plainText;
  return { plainText, text, words: countWords(plainText), characters: Array.from(plainText).length, paragraphs };
}

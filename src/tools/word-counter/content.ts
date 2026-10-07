import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Your text',
  placeholder: 'Type or paste your text here…',
  characters: 'Characters',
  charactersNoSpaces: 'Characters (no spaces)',
  charactersNoLineBreaks: 'Characters (no line breaks)',
  words: 'Words',
  sentences: 'Sentences',
  paragraphs: 'Paragraphs',
  bytesUtf8: 'Bytes (UTF-8)',
  bytesLegacy: 'Bytes (2-byte, KS)',
  readingTime: 'Reading time',
  speakingTime: 'Speaking time',
  minSec: '{m}m {s}s',
  sec: '{s}s',
  limitLabel: 'Character limit',
  limitHint: 'Track a limit (e.g. 280 for X, 500 for an essay). Counts characters with spaces.',
  limitRemaining: '{n} left',
  limitOver: '{n} over',
  keywords: 'Top keywords',
  keywordsEmpty: 'Repeated words will appear here.',
  clear: 'Clear',
  copy: 'Copy text',
  copied: 'Copied',
  autosaved: 'Saved in this browser only',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Word Counter — Count Words, Characters & Reading Time',
    description:
      'Free word counter that counts words, characters, sentences and reading time as you type. Accurate for Chinese, Japanese and Korean. No ads, nothing uploaded.',
    h1: 'Word Counter',
    tagline: 'Live word, character and sentence counts — accurate in every language, with no ads.',
    name: 'Word Counter',
    keywords: ['character counter', 'letter count', 'count words', 'reading time', 'text length'],
    howTo: [
      'Type or paste your text into the box.',
      'Read live counts for words, characters, sentences and paragraphs on the right.',
      'Optionally set a character limit to see how much room you have left.',
      'Your text is saved in this browser automatically, so a refresh won’t lose it.',
    ],
    sections: [
      {
        heading: 'How words are counted',
        body: 'Most word counters split text on spaces, which breaks for languages that don’t use them: a Japanese or Chinese sentence would count as a single “word”. This counter uses the browser’s built-in Unicode word segmentation (Intl.Segmenter), so 私は学生です is counted as several words, and emoji with skin tones count as one character instead of two or four.\n\nNumbers count as words. Punctuation and whitespace do not.',
      },
      {
        heading: 'Reading and speaking time',
        body: 'Reading time assumes 238 words per minute, the average silent reading speed for adult non-fiction found in a 2019 meta-analysis of 190 studies (Brysbaert). Speaking time assumes 150 words per minute, a typical presentation pace. Chinese and Japanese characters are timed per character (300 and 200 characters per minute) because word counts are not comparable across those scripts.',
      },
      {
        heading: 'Character limits you might be writing for',
        body: 'X (Twitter) posts: 280 characters. Meta descriptions: about 155 characters before Google truncates them. SMS: 160 GSM characters, or 70 if the message contains any non-Latin character. Instagram captions: 2,200 characters. LinkedIn posts: 3,000 characters.',
      },
    ],
    faq: [
      {
        q: 'Does this word counter save or upload my text?',
        a: 'No. Counting happens entirely in your browser. The text is kept only in your browser’s local storage so it survives a refresh; click Clear to remove it.',
      },
      {
        q: 'Are spaces counted as characters?',
        a: 'Both numbers are shown: “Characters” includes spaces and line breaks, “Characters (no spaces)” excludes all whitespace, and “Characters (no line breaks)” excludes only line breaks.',
      },
      {
        q: 'Why is my word count different from Microsoft Word or Google Docs?',
        a: 'Tools disagree on hyphenated words, numbers with punctuation and text without spaces. This counter follows the Unicode word-boundary rules, which treat “well-known” as two words and segment Chinese and Japanese into real words. Differences are usually under 1–2%.',
      },
      {
        q: 'What is the “2-byte” count for?',
        a: 'Some forms, especially Korean job applications and older systems, measure length in bytes where Latin letters count 1 and other characters count 2. Line breaks are counted as 2 bytes (CR+LF). If a form is strict, test a sample on the form itself.',
      },
      {
        q: 'How many words is a 5-minute speech?',
        a: 'At a typical pace of 150 words per minute, about 750 words. Slow, deliberate speakers manage around 120 words per minute (600 words); fast speakers around 170 (850 words).',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '글자수 세기 — 공백 포함·제외, 바이트, 단어수 계산',
    description:
      '자기소개서·리포트용 글자수 세기. 공백 포함/제외 글자수, 바이트(2byte·UTF-8), 단어수, 읽는 시간을 입력 즉시 계산합니다. 광고 없음, 서버 전송 없음.',
    h1: '글자수 세기',
    tagline: '공백 포함·제외, 바이트, 단어수를 입력하는 즉시 계산합니다. 광고 없이.',
    name: '글자수 세기',
    keywords: ['글자수 계산', '자소서 글자수', '바이트 계산', '단어수 세기', '문자수', 'word counter'],
    howTo: [
      '입력창에 글을 쓰거나 붙여넣습니다.',
      '오른쪽에서 공백 포함·제외 글자수, 바이트, 단어수를 바로 확인합니다.',
      '자기소개서 제한이 있다면 글자수 제한을 입력해 남은 글자수를 확인합니다.',
      '입력한 글은 이 브라우저에만 자동 저장되어 새로고침해도 사라지지 않습니다.',
    ],
    sections: [
      {
        heading: '자기소개서 글자수, 어떤 기준으로 세야 할까?',
        body: '대부분의 채용 사이트는 공백(띄어쓰기)을 포함한 글자수를 기준으로 합니다. 다만 회사마다 줄바꿈을 세는 방식이 다르고, 일부는 여전히 바이트 단위로 제한합니다. 그래서 이 도구는 공백 포함, 공백 제외, 줄바꿈 제외 글자수를 모두 보여줍니다.\n\n제출 직전에는 지원하는 회사의 입력창에 직접 붙여넣어 최종 확인하는 것이 가장 안전합니다.',
      },
      {
        heading: '바이트 계산 방식',
        body: '“바이트(2byte)”는 영문·숫자·기호를 1바이트, 한글을 포함한 그 외 문자를 2바이트로 계산하는 방식입니다. 오래된 시스템과 일부 채용 양식에서 사용합니다. 줄바꿈은 Windows 방식(CR+LF)에 맞춰 2바이트로 계산합니다.\n\n“바이트(UTF-8)”는 웹과 데이터베이스에서 실제로 저장되는 크기로, 한글 한 글자가 3바이트입니다.',
      },
      {
        heading: '단어수와 읽는 시간',
        body: '단어수는 띄어쓰기 단위(어절)로 셉니다. 일본어·중국어처럼 띄어쓰기가 없는 언어도 유니코드 단어 분리 규칙(Intl.Segmenter)으로 정확하게 셉니다.\n\n읽는 시간은 분당 238단어(성인 평균 묵독 속도, Brysbaert 2019), 말하는 시간은 분당 150단어(일반적인 발표 속도)를 기준으로 계산합니다.',
      },
    ],
    faq: [
      {
        q: '입력한 글이 서버에 저장되나요?',
        a: '아니요. 모든 계산은 브라우저 안에서 이루어지며 글은 어디에도 전송되지 않습니다. 새로고침 대비용으로 이 브라우저의 로컬 저장소에만 보관되며, “지우기”를 누르면 삭제됩니다.',
      },
      {
        q: '자소서 1000자는 공백 포함인가요?',
        a: '대부분의 기업과 채용 플랫폼은 공백 포함 기준입니다. 공고에 “공백 제외”라고 명시된 경우에만 공백 제외 글자수를 보면 됩니다.',
      },
      {
        q: '줄바꿈(엔터)도 글자수에 포함되나요?',
        a: '사이트마다 다릅니다. 이 도구의 “글자수(공백 포함)”는 줄바꿈을 1자로 세고, “글자수(줄바꿈 제외)”는 줄바꿈을 빼고 셉니다. 두 숫자를 함께 확인하세요.',
      },
      {
        q: '한글은 몇 바이트인가요?',
        a: '계산 방식에 따라 다릅니다. EUC-KR 등 2바이트 방식에서는 2바이트, 웹 표준인 UTF-8에서는 3바이트입니다. 이 도구는 두 값을 모두 보여줍니다.',
      },
      {
        q: 'A4 한 장은 몇 글자인가요?',
        a: '글꼴 10~11pt, 줄간격 160% 기준으로 공백 포함 약 1,500~1,800자입니다. 여백과 글꼴에 따라 크게 달라집니다.',
      },
    ],
    ui: {
      inputLabel: '입력할 글',
      placeholder: '여기에 글을 입력하거나 붙여넣으세요…',
      characters: '글자수 (공백 포함)',
      charactersNoSpaces: '글자수 (공백 제외)',
      charactersNoLineBreaks: '글자수 (줄바꿈 제외)',
      words: '단어수',
      sentences: '문장',
      paragraphs: '문단',
      bytesUtf8: '바이트 (UTF-8)',
      bytesLegacy: '바이트 (2byte)',
      readingTime: '읽는 시간',
      speakingTime: '말하는 시간',
      minSec: '{m}분 {s}초',
      sec: '{s}초',
      limitLabel: '글자수 제한',
      limitHint: '자소서 제한 글자수를 입력하세요 (공백 포함 기준).',
      limitRemaining: '{n}자 남음',
      limitOver: '{n}자 초과',
      keywords: '자주 쓴 단어',
      keywordsEmpty: '반복해서 쓴 단어가 여기에 표시됩니다.',
      clear: '지우기',
      copy: '텍스트 복사',
      copied: '복사됨',
      autosaved: '이 브라우저에만 저장됨',
    },
  },
};

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
  limitHint: 'Set the destination limit, then choose exactly how it measures text.',
  limitMetricLabel: 'Counting rule',
  metricCharacters: 'Characters (with spaces)',
  metricCharactersNoSpaces: 'Characters (no spaces)',
  metricBytesLegacy: 'Korean SMS bytes',
  metricBytesUtf8: 'UTF-8 bytes',
  metricXWeighted: 'X weighted count',
  limitUsed: '{n} of {limit} used',
  limitRemaining: '{n} remaining',
  limitOver: '{n} over the limit',
  ruleDefault: 'The selected rule determines which live total is compared with the limit.',
  ruleSelfIntroduction:
    'Application forms set their own rule. Include spaces unless the field explicitly says to exclude them.',
  ruleKoreanSms:
    'KT defines LMS as over 80 through 2,000 bytes. NAVER Cloud uses EUC-KR but allows 90-byte SMS, so check your sender.',
  ruleKoreanLms: 'KT and NAVER Cloud publish a 2,000-byte LMS body limit. EUC-KR may reject unsupported emoji.',
  ruleInstagramCaption:
    'Meta’s IG User Media reference sets 2,200 characters, including caption hashtags and mentions.',
  ruleXPost: 'X twitter-text v3: most Latin = 1, Hangul/CJK/emoji = 2, and each web URL = 23.',
  ruleYoutubeTitle: 'Google’s YouTube Data API sets a 100-character title maximum; < and > are not allowed.',
  ruleYoutubeDescription: 'Google’s YouTube Data API sets a 5,000-byte description maximum; < and > are not allowed.',
  ruleNaverBlogTitle: 'NAVER Blog Help says a post title accepts up to 100 characters.',
  ruleGlobalSms: 'AWS: one SMS fits 160 GSM-7 characters, but only 70 characters when UCS-2 is required.',
  sourcesLabel: 'Official source:',
  keywords: 'Top keywords',
  keywordsEmpty: 'Repeated words will appear here.',
  clear: 'Clear',
  copy: 'Copy text',
  copied: 'Copied',
  autosaved: 'Saved in this browser only',
  analyzing: 'Counting…',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Word Counter — Count Words, Characters & Reading Time',
    description:
      'Free word counter that counts words, characters, sentences and reading time as you type. Accurate for Chinese, Japanese and Korean. Nothing uploaded.',
    h1: 'Word Counter',
    tagline: 'Live word, character and sentence counts — accurate in every language.',
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
        body: 'Character limits are not interchangeable: a form may include spaces, line breaks, UTF-8 bytes or a platform-specific weighted count. Choose the same rule the destination publishes. The official sources used by the presets are Meta’s IG User Media reference (2,200-character captions), X’s twitter-text v3 configuration (280 weighted characters), Google’s YouTube Data API Videos resource (100-character titles and 5,000-byte descriptions), and NAVER Blog Help (100-character titles).\n\nFor global SMS, AWS End User Messaging documents 160 GSM-7 characters or 70 UCS-2 characters in one segment; multipart capacity drops to 153 or 67. Carrier and sender rules can differ.',
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
        a: 'Tools disagree on hyphenated words, numbers with punctuation and text without spaces. This counter follows the browser’s Unicode word-boundary rules, which treat “well-known” as two words and segment Chinese and Japanese into real words.',
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
      '자기소개서·리포트용 글자수 세기. 공백 포함/제외 글자수, 바이트(2byte·UTF-8), 단어수, 읽는 시간을 입력 즉시 계산합니다. 서버 전송 없음.',
    h1: '글자수 세기',
    tagline: '공백 포함·제외, 바이트, 단어수를 입력하는 즉시 계산합니다.',
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
        body: '“국내 문자 바이트”는 영문·숫자 같은 ASCII를 1바이트, 한글을 2바이트, 줄바꿈을 CR+LF 2바이트로 계산합니다. NAVER Cloud SENS 공식 API는 문자 내용이 EUC-KR 기준으로 인코딩되며 지원하지 않는 이모지가 있으면 발송에 실패한다고 안내합니다. 실제 허용량은 KT 일부 서비스 80바이트, NAVER Cloud와 U+ 메시지허브 90바이트처럼 발송사마다 다릅니다.\n\n“UTF-8 바이트”는 웹에서 쓰는 실제 인코딩 크기이며 한글 한 글자는 3바이트입니다. Google YouTube Data API의 영상 설명 한도도 글자 수가 아니라 UTF-8 5,000바이트입니다.',
      },
      {
        heading: '단어수와 읽는 시간',
        body: '단어수는 브라우저의 유니코드 단어 분리 규칙(Intl.Segmenter)으로 셉니다. 따라서 띄어쓰기뿐 아니라 일본어·중국어처럼 띄어쓰기가 없는 언어도 분리해 셉니다.\n\n읽는 시간은 분당 238단어(성인 평균 묵독 속도, Brysbaert 2019), 말하는 시간은 분당 150단어(일반적인 발표 속도)를 기준으로 계산합니다. 중국어·일본어는 단어수 대신 글자 수를 기준으로 추정합니다.',
      },
      {
        heading: '플랫폼 제한의 공식 근거',
        body: '프리셋은 2026년 10월에 각 서비스의 공식 문서를 확인했습니다. 인스타그램은 Meta IG User Media API의 캡션 2,200자, X는 공식 twitter-text v3의 280점과 글자별 가중치, 유튜브는 Google YouTube Data API Videos의 제목 100자·설명 5,000바이트를 적용합니다. 네이버 블로그 제목 100자는 고객센터의 “제목과 제목 배경 사진 안내”를 따릅니다.\n\n글로벌 SMS 160자는 AWS End User Messaging의 GSM-7 한 세그먼트 기준입니다. 한글·이모지 때문에 UCS-2가 필요하면 70자로 줄며, 여러 세그먼트일 때는 GSM-7 153자·UCS-2 67자씩입니다.',
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
        a: 'A4 한 장의 글자 수에는 정해진 값이 없습니다. 글꼴, 글자 크기, 여백, 줄간격과 문단 간격에 따라 달라지므로, 제출 양식의 글자 수 제한을 직접 확인해야 합니다.',
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
      limitHint: '제출할 곳의 제한값을 입력하고 같은 계산 기준을 선택하세요.',
      limitMetricLabel: '계산 기준',
      metricCharacters: '글자수 (공백 포함)',
      metricCharactersNoSpaces: '글자수 (공백 제외)',
      metricBytesLegacy: '국내 문자 바이트',
      metricBytesUtf8: 'UTF-8 바이트',
      metricXWeighted: 'X 가중치',
      limitUsed: '{limit} 중 {n} 사용',
      limitRemaining: '{n} 남음',
      limitOver: '{n} 초과',
      ruleDefault: '선택한 계산 기준의 실시간 수치를 제한값과 비교합니다.',
      ruleSelfIntroduction:
        '자소서 입력란의 안내가 우선입니다. “공백 제외”라고 명시된 경우에만 공백 제외 기준을 선택하세요.',
      ruleKoreanSms:
        'KT는 80바이트 초과부터 2,000바이트까지를 LMS로 안내합니다. NAVER Cloud는 EUC-KR·SMS 90바이트이므로 발송 서비스도 확인하세요.',
      ruleKoreanLms:
        'KT와 NAVER Cloud의 LMS 본문 한도는 2,000바이트입니다. EUC-KR 미지원 이모지는 발송에 실패할 수 있습니다.',
      ruleInstagramCaption: 'Meta IG User Media 공식 문서의 캡션 한도는 2,200자이며 해시태그와 멘션 글자도 포함됩니다.',
      ruleXPost: 'X twitter-text v3 기준: 대부분의 영문 1점, 한글·CJK·이모지 2점, 웹 주소 23점.',
      ruleYoutubeTitle: 'Google YouTube Data API 기준 제목은 최대 100자이며 <와 >는 사용할 수 없습니다.',
      ruleYoutubeDescription: 'Google YouTube Data API 기준 설명은 최대 5,000바이트이며 <와 >는 사용할 수 없습니다.',
      ruleNaverBlogTitle: '네이버 블로그 고객센터 기준 게시글 제목은 최대 100자입니다.',
      ruleGlobalSms: 'AWS 공식 문서 기준 한 건은 GSM-7 160자, UCS-2가 필요하면 70자입니다.',
      sourcesLabel: '공식 출처:',
      keywords: '자주 쓴 단어',
      keywordsEmpty: '반복해서 쓴 단어가 여기에 표시됩니다.',
      clear: '지우기',
      copy: '텍스트 복사',
      copied: '복사됨',
      autosaved: '이 브라우저에만 저장됨',
      analyzing: '계산 중…',
    },
  },
};

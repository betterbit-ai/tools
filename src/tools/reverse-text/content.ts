import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  example: 'Hello, world! 👋🏽',
  inputLabel: 'Text to reverse',
  inputHint: 'Results update as you type. Your draft stays in this browser only.',
  inputPlaceholder: 'Type or paste text here…',
  outputLabel: 'Reversed text',
  emptyOutput: 'Your reversed text will appear here.',
  modeLabel: 'Reverse by',
  modeHint: 'Choose the order or visual effect you need.',
  charactersMode: 'Characters',
  wordsMode: 'Word order',
  eachWordMode: 'Each word',
  linesMode: 'Line order',
  upsideDownMode: 'Upside down',
  upsideDownHint: 'This is an approximate Unicode effect; non-Latin characters stay unchanged.',
  graphemes: 'Visible characters',
  words: 'Terms',
  lines: 'Lines',
  graphemeNote: 'Emoji, flags, and combined accents are reversed as whole visible characters.',
  copy: 'Copy',
  copied: 'Copied',
  useResult: 'Use result',
  clear: 'Clear',
  autosaved: 'Saved in this browser only',
  copyShortcut: 'Copy result:',
  shortcutKey: '⌘/Ctrl Shift C',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Reverse Text — Words, Lines & Upside Down',
    description:
      'Reverse text, word order, each word, or lines as you type. Keep emoji and accents intact, make upside-down text, then copy the result.',
    h1: 'Reverse Text',
    tagline: 'Reverse text live by character, word, or line without splitting joined emoji, flags, or accents.',
    name: 'Reverse Text',
    keywords: [
      'backwards text generator',
      'text reverser',
      'reverse words',
      'reverse lines',
      'upside down text',
      'write backwards',
    ],
    howTo: [
      'Type or paste text into “Text to reverse.”',
      'Choose Characters, Word order, Each word, Line order, or Upside down.',
      'Review the live result in “Reversed text.”',
      'Select Copy, or choose Use result to reverse the output again.',
    ],
    sections: [
      {
        heading: 'Choose the kind of reversal you mean',
        body: '“Reverse text” can mean different operations. Characters turns “Hello world” into “dlrow olleH”. Word order keeps each term readable but changes “one two three” to “three two one”. Each word changes the spelling inside every term while retaining the term order. Line order puts the last line first, which is useful for a pasted list or log.\n\nEach operation preserves the original whitespace instead of trimming or collapsing it. Use Characters for a backwards message, Word order for a sentence or list, Each word for a word puzzle, and Line order when the entries themselves must stay unchanged.',
      },
      {
        heading: 'Why emoji and accents need grapheme-safe reversal',
        body: 'A visible character is not always one stored code point. A flag is composed from two regional-indicator characters, a family emoji can be joined with invisible connectors, and an accented letter can be a base letter followed by a combining mark. Reversing a JavaScript string by storage unit can split these pieces apart.\n\nThis tool reverses grapheme clusters: the units a reader sees as one character. A flag, skin-tone emoji, joined emoji, and combining accent therefore move as one unit. The visible-character counter uses the same rule, so its count matches what the character reversal handles.',
      },
      {
        heading: 'Upside-down text is a visual approximation',
        body: 'Upside-down text is not a font or a true rotation. It substitutes selected Latin letters, digits, and punctuation with Unicode characters that look rotated, then reverses their order. Korean, CJK characters, emoji, and many symbols have no equivalent, so this tool leaves them unchanged.\n\nThe output is ordinary copyable text, but its appearance depends on the font used by the app where you paste it. Check a short result in the destination app before posting, and avoid it for essential information because visual substitutions can be hard to search or read with assistive technology.',
      },
    ],
    faq: [
      {
        q: 'How do I reverse text backwards?',
        a: 'Paste or type the text, choose Characters, and copy the live result. Characters reverses the complete sequence, so “Hello” becomes “olleH” and punctuation moves with the text.',
      },
      {
        q: 'What is the difference between reverse words and reverse each word?',
        a: 'Word order changes the order of whole terms, so “one two” becomes “two one.” Each word keeps the term order but reverses each spelling, so the same input becomes “eno owt.”',
      },
      {
        q: 'Does reversing text break emoji or flags?',
        a: 'No. Character reversal treats joined emoji, skin-tone modifiers, flags, and combining accents as single grapheme clusters, so their pieces are not split or reordered internally.',
      },
      {
        q: 'Can I reverse a list without changing each line?',
        a: 'Yes. Choose Line order to put the last line first while preserving the text inside each line. A final line ending is also retained.',
      },
      {
        q: 'Does upside-down text work for Korean?',
        a: 'Korean text can be included, but it remains unchanged because Unicode does not provide upside-down counterparts for Hangul syllables. The visual substitutions in this tool are limited mainly to Latin letters, digits, and selected punctuation.',
      },
      {
        q: 'Is my text uploaded or saved online?',
        a: 'No. The transformations run in the current browser. The latest input and selected mode are saved only in that browser so a refresh can restore the draft; Clear removes the saved input.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '텍스트 뒤집기 — 글자·단어·줄 순서 반전',
    description:
      '텍스트를 글자·단어·줄 순서로 즉시 뒤집고 거꾸로 글자도 만드세요. 이모지와 결합 문자는 유지하며 결과를 바로 복사합니다.',
    h1: '텍스트 뒤집기',
    tagline: '글자·단어·줄 순서를 입력 즉시 뒤집고, 이모지·국기·결합 악센트도 깨지지 않게 처리합니다.',
    name: '텍스트 뒤집기',
    keywords: ['글자 뒤집기', '거꾸로 글자', '텍스트 반전', '문자열 역순', '단어 순서 바꾸기', '상하 반전 글자'],
    howTo: [
      '“뒤집을 텍스트” 칸에 글을 입력하거나 붙여넣습니다.',
      '글자, 단어 순서, 단어별 글자, 줄 순서, 상하 반전 중 방식을 고릅니다.',
      '“뒤집은 텍스트”에 즉시 나타난 결과를 확인합니다.',
      '“복사”를 누르거나 “결과를 입력으로”를 눌러 한 번 더 변환합니다.',
    ],
    sections: [
      {
        heading: '원하는 뒤집기 방식 고르기',
        body: '텍스트를 뒤집는다는 말은 여러 작업을 뜻할 수 있습니다. 글자는 “안녕하세요”를 “요세하녕안”처럼 전체 역순으로 바꿉니다. 단어 순서는 낱말을 그대로 둔 채 “하나 둘 셋”을 “셋 둘 하나”로 바꿉니다. 단어별 글자는 단어 순서를 유지하면서 각 단어 안의 글자만 뒤집고, 줄 순서는 목록이나 로그의 마지막 줄을 맨 위로 보냅니다.\n\n모든 방식은 공백을 없애거나 한 칸으로 합치지 않습니다. 거꾸로 읽는 문구에는 글자, 문장 속 낱말 위치 교체에는 단어 순서, 낱말 퀴즈에는 단어별 글자, 목록 순서 변경에는 줄 순서가 알맞습니다.',
      },
      {
        heading: '이모지와 결합 문자가 깨지지 않는 이유',
        body: '눈에 보이는 글자 하나가 항상 저장되는 문자 하나와 같지는 않습니다. 국기 이모지는 두 개의 지역 표시 문자로 이루어지고, 가족 이모지는 보이지 않는 연결 문자로 이어질 수 있으며, 악센트 글자는 기본 알파벳과 결합 기호가 함께 있어야 합니다. 저장 단위대로 거꾸로 뒤집으면 이런 조각이 흩어질 수 있습니다.\n\n이 도구는 사람이 한 글자로 보는 단위인 그래핌 클러스터로 나누어 순서를 바꿉니다. 따라서 피부색이 있는 이모지, 국기, 연결 이모지, 결합 악센트는 내부가 분리되지 않고 통째로 이동합니다. “보이는 글자” 수도 같은 기준으로 셉니다.',
      },
      {
        heading: '상하 반전 글자는 모양을 흉내 낸 결과입니다',
        body: '상하 반전 글자는 글꼴을 돌리는 기능이 아닙니다. 일부 영문·숫자·문장부호를 뒤집어 보이는 유니코드 문자로 바꾼 뒤 순서를 반대로 놓는 방식입니다. 한글, 한자, 이모지처럼 대응 문자가 없는 글자는 그대로 남습니다.\n\n결과는 복사해서 붙여넣을 수 있는 일반 텍스트이지만, 붙여넣는 앱의 글꼴에 따라 모양이 달라질 수 있습니다. 게시하기 전에 짧은 문구를 실제 사용할 앱에 붙여넣어 확인하고, 검색이나 접근성이 중요한 정보에는 일반 텍스트를 사용합니다.',
      },
    ],
    faq: [
      {
        q: '글자를 거꾸로 뒤집으려면 어떻게 하나요?',
        a: '텍스트를 입력하거나 붙여넣은 뒤 “글자”를 고르면 즉시 전체 역순 결과가 나옵니다. “안녕!”은 “!녕안”이 되며 공백과 문장부호도 함께 위치가 바뀝니다.',
      },
      {
        q: '단어 순서와 단어별 글자는 무엇이 다른가요?',
        a: '단어 순서는 “하나 둘”을 “둘 하나”처럼 낱말 단위로 순서를 바꿉니다. 단어별 글자는 낱말 위치는 유지하고 “하나 둘”을 “나하 둘”처럼 각 낱말 안의 글자만 뒤집습니다.',
      },
      {
        q: '이모지나 국기를 넣어도 깨지지 않나요?',
        a: '글자 뒤집기는 연결 이모지, 피부색 이모지, 국기, 결합 악센트를 보이는 글자 단위로 처리하므로 내부 조각의 순서를 바꾸지 않습니다.',
      },
      {
        q: '목록의 줄 순서만 바꿀 수 있나요?',
        a: '“줄 순서”를 고르면 각 줄의 내용은 유지하고 마지막 줄부터 위로 올립니다. 입력 마지막의 줄바꿈도 유지합니다.',
      },
      {
        q: '한글도 상하 반전 글자로 바뀌나요?',
        a: '한글은 상하 반전 모양에 대응하는 유니코드 문자가 없어서 그대로 남습니다. 이 기능은 주로 영문·숫자·일부 문장부호를 비슷한 모양의 문자로 바꾸는 방식입니다.',
      },
      {
        q: '입력한 텍스트가 서버에 전송되나요?',
        a: '아니요. 텍스트 변환은 현재 브라우저에서 처리합니다. 새로고침 후 작업을 이어갈 수 있도록 최근 입력과 방식만 이 브라우저에 저장하며, “초기화”를 누르면 저장한 입력도 지웁니다.',
      },
    ],
    ui: {
      example: '안녕하세요, 세계! 👋🏽',
      inputLabel: '뒤집을 텍스트',
      inputHint: '입력 즉시 결과가 바뀝니다. 작성한 내용은 이 브라우저에만 저장합니다.',
      inputPlaceholder: '텍스트를 입력하거나 붙여넣으세요…',
      outputLabel: '뒤집은 텍스트',
      emptyOutput: '뒤집은 텍스트가 여기에 표시됩니다.',
      modeLabel: '뒤집기 방식',
      modeHint: '순서를 바꾸거나 시각 효과를 고릅니다.',
      charactersMode: '글자',
      wordsMode: '단어 순서',
      eachWordMode: '단어별 글자',
      linesMode: '줄 순서',
      upsideDownMode: '상하 반전',
      upsideDownHint: '유니코드로 모양을 흉내 낸 결과입니다. 영문 외 문자는 그대로 남습니다.',
      graphemes: '보이는 글자',
      words: '낱말',
      lines: '줄',
      graphemeNote: '이모지, 국기, 결합 악센트는 보이는 글자 단위로 함께 뒤집습니다.',
      copy: '복사',
      copied: '복사됨',
      useResult: '결과를 입력으로',
      clear: '초기화',
      autosaved: '이 브라우저에만 저장됨',
      copyShortcut: '결과 복사:',
      shortcutKey: '⌘/Ctrl Shift C',
    },
  },
};

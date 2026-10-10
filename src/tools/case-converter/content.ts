import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Text to convert',
  inputPlaceholder: 'Type or paste text here…',
  outputLabel: 'Converted text',
  outputPlaceholder: 'Your converted text appears here.',
  writingLabel: 'Writing case',
  developerLabel: 'Developer case',
  developerHint: 'Each line becomes a separate identifier.',
  titleStyleLabel: 'Title Case style',
  titleStyleHint: 'AP capitalizes long prepositions; Chicago leaves them lowercase.',
  upper: 'UPPER',
  lower: 'lower',
  sentence: 'Sentence',
  title: 'Title',
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  kebab: 'kebab-case',
  constant: 'CONSTANT',
  apStyle: 'AP',
  chicagoStyle: 'Chicago',
  clear: 'Clear',
  copy: 'Copy result',
  copied: 'Copied',
  useResult: 'Use as input',
  autosaved: 'Saved in this browser only',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Case Converter — AP, Chicago & Developer Case',
    description:
      'Convert text instantly to uppercase, lowercase, sentence, AP or Chicago Title Case, camelCase and more. Your text stays in this browser and the result is ready to copy.',
    h1: 'Case Converter',
    tagline: 'Convert writing and code identifiers live, with an explicit choice of AP or Chicago Title Case.',
    name: 'Case Converter',
    keywords: [
      'uppercase to lowercase',
      'title case converter',
      'camel case converter',
      'snake case converter',
      'text formatter',
    ],
    howTo: [
      'Paste or type text in the “Text to convert” box.',
      'Choose a writing case or a developer case; the result updates immediately.',
      'For a heading, choose Title and then select AP or Chicago.',
      'Copy the converted text, or use it as the input for another conversion.',
    ],
    sections: [
      {
        heading: 'AP and Chicago Title Case are not the same',
        body: 'Both styles capitalize the first and last word of a title and leave articles and coordinating conjunctions lowercase in the middle. The practical difference appears with longer prepositions. AP title style capitalizes words of four letters or more, so “Learning About Words With Style” has capital A and W. Chicago headline style keeps prepositions lowercase regardless of length, producing “Learning about Words with Style.” Choose the style required by your publication instead of treating every word-initial capital as Title Case.\n\nNo automatic converter can determine every proper noun, brand spelling or context-sensitive part of speech. Check formal titles before publishing, especially names such as iPhone, eBay and product acronyms.',
      },
      {
        heading: 'Writing case versus developer case',
        body: 'Uppercase, lowercase, Sentence and Title Case preserve punctuation, spaces and line breaks. Use them for prose, labels and headings. Developer formats first split punctuation, spaces and existing case changes into words, then join those words. For example, “XMLHttpRequest user ID” becomes xml_http_request_user_id in snake_case and xmlHttpRequestUserId in camelCase.\n\nThe converter treats each input line as its own identifier. That makes it useful for a pasted spreadsheet column: “Order Date” and “Customer ID” become orderDate and customerId without merging the rows. Digits remain part of an identifier, so “field 12” becomes field_12.',
      },
      {
        heading: 'Unicode and privacy',
        body: 'Case mapping follows the Unicode rules built into your browser. Accented Latin letters are converted, and the German ß becomes SS in uppercase. Scripts without uppercase and lowercase distinctions, including Korean, Chinese and Japanese, pass through unchanged. Emoji and punctuation are retained in writing formats.\n\nConversion happens in the page, not on a server. Your last input and selected format are saved only in this browser so a refresh does not lose your work. Use Clear to remove the saved text from this browser.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between AP and Chicago Title Case?',
        a: 'AP Title Case capitalizes prepositions with four or more letters, while Chicago Title Case keeps prepositions lowercase unless they are the first or last word. For example, AP writes “A Guide About Writing” and Chicago writes “A Guide about Writing.”',
      },
      {
        q: 'What is the difference between camelCase and PascalCase?',
        a: 'camelCase starts with a lowercase word, as in userName, while PascalCase capitalizes the first word too, as in UserName. Both remove separators and capitalize each later word.',
      },
      {
        q: 'Does the case converter upload my text?',
        a: 'No. Conversion runs in your browser and text is not sent to a server. The page stores your latest input only in this browser’s local storage until you clear it.',
      },
      {
        q: 'Can I convert several names at once?',
        a: 'Yes. Paste one value per line. Developer formats preserve every line break, so a list of 20 column names returns a list of 20 separately converted identifiers.',
      },
      {
        q: 'Will it preserve names and brand capitalization?',
        a: 'Not reliably. Lowercase, Sentence Case and Title Case normalize letter casing, so a brand such as iPhone may become Iphone. Review proper nouns, trademarks and acronyms before using converted text publicly.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '대소문자 변환 — 제목 표기·camelCase·snake_case',
    description:
      '영문 텍스트를 대문자·소문자·문장 첫 글자·AP/Chicago 제목 표기와 camelCase, snake_case로 즉시 변환합니다. 입력한 글은 브라우저 밖으로 전송되지 않습니다.',
    h1: '대소문자 변환',
    tagline: '제목 표기 규칙과 개발용 표기법을 선택하면 결과가 바로 바뀝니다.',
    name: '대소문자 변환',
    keywords: ['영문 대소문자 변환', '대문자 소문자 변환', '제목 표기', '카멜케이스 변환', '스네이크케이스 변환'],
    howTo: [
      '입력창에 변환할 영문 텍스트를 붙여넣거나 입력합니다.',
      '글쓰기용 또는 개발용 표기법을 선택하면 결과가 즉시 표시됩니다.',
      '제목 표기를 고른 경우 AP 또는 Chicago 규칙을 선택합니다.',
      '결과를 복사하거나 “입력으로 사용”을 눌러 다시 변환합니다.',
    ],
    sections: [
      {
        heading: 'AP와 Chicago 제목 표기의 차이',
        body: '두 규칙 모두 제목의 첫 단어와 마지막 단어는 대문자로 쓰고, 중간의 관사와 등위접속사는 보통 소문자로 씁니다. 차이는 4글자 이상 전치사에 있습니다. AP 표기에서는 “Learning About Words With Style”처럼 About과 With를 대문자로 씁니다. Chicago 표기에서는 전치사는 길이와 관계없이 소문자로 두어 “Learning about Words with Style”이 됩니다. 제출처나 매체가 정한 규칙이 있다면 그 규칙을 선택해야 합니다.\n\n자동 변환기는 고유명사와 브랜드 표기를 완전히 판단하지 못합니다. iPhone, eBay, NASA처럼 의도된 표기가 있는 단어와 공식 문서 제목은 변환 뒤에 한 번 확인하는 것이 안전합니다.',
      },
      {
        heading: '글쓰기용 표기와 개발용 표기',
        body: '대문자, 소문자, 문장 첫 글자, 제목 표기는 문장부호·띄어쓰기·줄바꿈을 그대로 유지합니다. 메일 본문, 제목, 안내 문구처럼 읽는 글에 알맞습니다. 개발용 표기법은 띄어쓰기, 문장부호, 기존 대소문자 변화에서 단어를 나눈 뒤 다시 붙입니다. 예를 들어 “XMLHttpRequest user ID”는 snake_case에서 xml_http_request_user_id가 되고 camelCase에서는 xmlHttpRequestUserId가 됩니다.\n\n여러 줄을 넣으면 각 줄을 별도 이름으로 바꿉니다. 스프레드시트의 “Order Date”, “Customer ID” 두 줄을 붙여넣으면 orderDate, customerId로 따로 변환됩니다. 숫자는 이름의 일부로 유지되므로 “field 12”는 field_12가 됩니다.',
      },
      {
        heading: '유니코드 문자와 입력한 글의 보관',
        body: '대소문자가 있는 문자는 브라우저의 유니코드 규칙으로 변환합니다. 악센트가 있는 라틴 문자도 처리되며 독일어 ß는 대문자로 바꾸면 SS가 됩니다. 한글·중국어·일본어처럼 대소문자 구분이 없는 문자는 바뀌지 않고, 글쓰기용 표기에서는 이모지와 문장부호도 유지됩니다.\n\n변환은 서버가 아니라 현재 브라우저에서 이루어집니다. 새로고침해도 이어서 쓸 수 있도록 최근 입력과 선택한 방식만 이 브라우저 저장소에 보관합니다. “지우기”를 누르면 저장된 입력도 함께 삭제됩니다.',
      },
    ],
    faq: [
      {
        q: 'AP 제목 표기와 Chicago 제목 표기는 어떻게 다른가요?',
        a: 'AP 제목 표기는 4글자 이상 전치사를 대문자로 쓰지만 Chicago 제목 표기는 첫 단어와 마지막 단어가 아닌 전치사를 소문자로 씁니다. 예를 들어 AP는 “A Guide About Writing”, Chicago는 “A Guide about Writing”으로 표기합니다.',
      },
      {
        q: 'camelCase와 PascalCase의 차이는 무엇인가요?',
        a: 'camelCase는 첫 단어를 소문자로 시작해 userName처럼 쓰고, PascalCase는 첫 단어도 대문자로 시작해 UserName처럼 씁니다. 두 방식 모두 구분 기호를 없애고 뒤따르는 단어의 첫 글자를 대문자로 만듭니다.',
      },
      {
        q: '입력한 텍스트가 서버에 전송되나요?',
        a: '아니요. 모든 변환은 브라우저 안에서 이루어지고 입력한 텍스트는 서버로 전송되지 않습니다. 새로고침 대비용으로 이 브라우저의 로컬 저장소에만 보관되며 지우기를 누르면 삭제됩니다.',
      },
      {
        q: '여러 변수명이나 열 이름을 한 번에 바꿀 수 있나요?',
        a: '네. 한 줄에 하나씩 붙여넣으면 줄바꿈을 유지한 채 각 줄을 별도 이름으로 변환합니다. 예를 들어 20개 열 이름을 넣으면 결과도 20줄로 반환됩니다.',
      },
      {
        q: '브랜드명과 약어도 원래 표기로 유지되나요?',
        a: '항상 유지되지는 않습니다. 소문자·문장 첫 글자·제목 표기는 대소문자를 정규화하므로 iPhone이 Iphone으로 바뀔 수 있습니다. 상표, 고유명사, 약어가 포함된 공개용 문장은 결과를 검토하세요.',
      },
    ],
    ui: {
      inputLabel: '변환할 텍스트',
      inputPlaceholder: '여기에 텍스트를 입력하거나 붙여넣으세요…',
      outputLabel: '변환 결과',
      outputPlaceholder: '변환한 텍스트가 여기에 표시됩니다.',
      writingLabel: '글쓰기용 표기',
      developerLabel: '개발용 표기',
      developerHint: '줄마다 별도의 식별자로 변환합니다.',
      titleStyleLabel: '제목 표기 규칙',
      titleStyleHint: 'AP는 긴 전치사를 대문자로, Chicago는 소문자로 씁니다.',
      upper: '대문자',
      lower: '소문자',
      sentence: '문장 첫 글자',
      title: '제목 표기',
      camel: 'camelCase',
      pascal: 'PascalCase',
      snake: 'snake_case',
      kebab: 'kebab-case',
      constant: 'CONSTANT',
      apStyle: 'AP',
      chicagoStyle: 'Chicago',
      clear: '지우기',
      copy: '결과 복사',
      copied: '복사됨',
      useResult: '입력으로 사용',
      autosaved: '이 브라우저에만 저장됨',
    },
  },
};

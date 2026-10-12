import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  searchLabel: 'Find a special character',
  searchPlaceholder: 'Search star, 화살표, or U+2192…',
  searchHint: 'Search by symbol, English or Korean name, or Unicode code point.',
  groupLabel: 'Korean keyboard group',
  all: 'All characters',
  popular: 'Popular',
  giyok: 'ㄱ — punctuation',
  nieun: 'ㄴ — brackets and quotes',
  digeut: 'ㄷ — maths',
  rieul: 'ㄹ — units and currency',
  mieum: 'ㅁ — shapes and arrows',
  bieup: 'ㅂ — lines',
  siot: 'ㅅ — circled numbers and Hangul',
  ieung: 'ㅇ — circled letters',
  jieut: 'ㅈ — Roman numerals',
  chieut: 'ㅊ — fractions and indices',
  hieut: 'ㅎ — Greek letters',
  recent: 'Recent copies',
  results: 'Characters',
  resultCount: '{n} characters',
  noResults: 'No characters match this search.',
  copyHint: 'Select a character to copy it. Recent copies stay only in this browser.',
  copyCharacter: 'Copy {character}, {code}',
  copied: '{character} copied',
  copyFailed: 'Your browser did not allow copying. Select the character and copy it manually.',
  codePoint: 'Unicode code point',
  shortcutStart: 'Press',
  shortcutEnd: 'to focus search.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Special Characters — Copy Symbols & Unicode',
    description:
      'Find and copy special characters, symbols and Unicode code points in one click. Browse Korean keyboard groups such as ㅁ + Hanja, with local recent copies.',
    h1: 'Special Characters',
    tagline: 'Find a symbol by name, code point or Korean keyboard group, then copy it in one click.',
    name: 'Special Characters',
    keywords: [
      'special character copy paste',
      'symbol copy paste',
      'Unicode character map',
      'character map',
      'Korean Hanja key symbols',
    ],
    howTo: [
      'Search for a character by its symbol, English or Korean name, or a code such as U+2192.',
      'Choose a Korean keyboard group to browse the symbols commonly associated with that consonant + Hanja key.',
      'Select a character to copy it to the clipboard.',
      'Paste it into your document, spreadsheet, message or form. Your recent copies remain only in this browser.',
    ],
    sections: [
      {
        heading: 'Find Korean keyboard special characters',
        body: 'On Korean Windows keyboard layouts, entering a consonant and pressing the Hanja key can open a special-character list. A commonly used shortcut is ㅁ + Hanja for shapes and arrows; ㄷ is associated with maths symbols, ㄹ with units and currency, and ㅎ with Greek letters. This map keeps those familiar groups together, then adds text and U+ code-point search when remembering a consonant is not practical.\n\nThe exact list and key behavior can differ by input method, Windows version and application. Copying the Unicode character itself is a practical fallback when the Hanja key is unavailable, such as on a compact keyboard or phone.',
      },
      {
        heading: 'A symbol is Unicode text, not an image',
        body: 'Every tile copies text such as → (U+2192) or ㎡ (U+33A1), so it can be pasted into ordinary text fields. The U+ value is the Unicode code point: U+2192 is hexadecimal 2192, or decimal 8594. Searching either “U+2192” or “2192” finds that arrow here.\n\nA character may still look different after pasting because its appearance comes from the destination font and operating system. If a pasted character becomes a square box, the text was copied but the chosen font does not include a glyph for it. Use a font with broader Unicode coverage or choose a more widely supported symbol.',
      },
    ],
    faq: [
      {
        q: 'How do I copy a special character?',
        a: 'Select a tile to copy its Unicode character to the clipboard, then paste it with Ctrl+V on Windows and Linux or Command+V on macOS. On a phone, tap the tile and then long-press the destination field to paste.',
      },
      {
        q: 'What does ㅁ + Hanja do?',
        a: 'On many Korean Windows input setups, typing ㅁ and pressing the Hanja key opens a list containing shapes, arrows and related symbols. The exact list can vary by input method and application, so this page provides the same category as copyable Unicode text.',
      },
      {
        q: 'What is a Unicode code point such as U+2192?',
        a: 'A Unicode code point is a hexadecimal identifier for one character. U+2192 identifies the right arrow →, and U+2605 identifies the black star ★. It describes the character, while a font determines how that character looks.',
      },
      {
        q: 'Why does a copied symbol appear as a square?',
        a: 'A square box usually means the destination font has no glyph for that Unicode character. The copied text is still present; switch to a font with wider Unicode coverage or use a simpler symbol supported by the destination app.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '특수문자표 — ㅁ+한자 기호·유니코드 복사',
    description:
      '특수문자와 기호를 이름·유니코드 코드로 찾아 한 번에 복사합니다. ㅁ+한자 등 한글 자음별 키보드 분류와 최근 복사를 브라우저에서 제공합니다.',
    h1: '특수문자표',
    tagline: 'ㅁ+한자 같은 자음별 분류, 이름·코드 검색으로 특수문자를 바로 찾아 복사합니다.',
    name: '특수문자표',
    keywords: ['특수문자', '특수문자표', '특수문자 복사', 'ㅁ 한자 특수문자', '기호 모음', '유니코드', '특수기호'],
    howTo: [
      '기호, 한글·영문 이름 또는 U+2192 같은 유니코드 코드로 찾습니다.',
      '한글 키보드 자음별 목록을 골라 ㅁ+한자 등 익숙한 분류로 살펴봅니다.',
      '필요한 문자를 누르면 클립보드에 바로 복사됩니다.',
      '문서·엑셀·메신저·입력창에 붙여넣습니다. 최근 복사 목록은 이 브라우저에만 남습니다.',
    ],
    sections: [
      {
        heading: 'ㅁ+한자로 특수문자를 찾는 법',
        body: '윈도우 한글 입력에서는 자음을 입력한 뒤 한자 키를 누르면 특수문자 목록을 열 수 있습니다. 대표적으로 ㅁ+한자는 도형과 화살표, ㄷ+한자는 수학 기호, ㄹ+한자는 단위·화폐, ㅎ+한자는 그리스 문자 목록에 연결됩니다. 이 특수문자표는 자음별 묶음을 그대로 골라 볼 수 있게 만들고, 자음이 기억나지 않을 때는 이름과 코드로도 찾을 수 있게 했습니다.\n\n한자 키의 동작과 목록은 사용하는 입력기, 윈도우 버전, 프로그램에 따라 달라질 수 있습니다. 한자 키가 없는 노트북이나 휴대폰에서는 여기에서 유니코드 문자를 복사해 붙여넣으면 됩니다.',
      },
      {
        heading: '유니코드 코드와 글꼴 표시',
        body: '각 기호의 U+ 값은 유니코드 코드 포인트입니다. 예를 들어 →는 U+2192, ★는 U+2605, ㎡는 U+33A1입니다. U+2192 또는 2192를 검색창에 넣어도 오른쪽 화살표를 찾을 수 있습니다.\n\n복사한 문자는 이미지가 아닌 텍스트입니다. 다만 글자 모양은 붙여넣는 곳의 글꼴과 운영체제가 그립니다. 문자가 네모(□)로 보이면 복사는 되었지만 해당 글꼴에 글리프가 없는 경우가 많으므로, 유니코드 지원 범위가 넓은 글꼴로 바꾸거나 더 일반적인 기호를 사용합니다.',
      },
    ],
    faq: [
      {
        q: '특수문자는 어떻게 복사하나요?',
        a: '필요한 기호를 누르면 유니코드 문자가 클립보드에 복사됩니다. 윈도우·리눅스에서는 Ctrl+V, macOS에서는 Command+V로 붙여넣고, 휴대폰에서는 대상 입력창을 길게 눌러 붙여넣습니다.',
      },
      {
        q: 'ㅁ+한자는 무엇인가요?',
        a: '많은 윈도우 한글 입력 환경에서 ㅁ을 입력하고 한자 키를 누르면 도형·화살표 등 특수문자 목록이 열립니다. 입력기와 프로그램에 따라 목록이 달라질 수 있으므로, 이 페이지에서는 같은 분류의 문자를 복사할 수 있게 제공합니다.',
      },
      {
        q: 'U+2192 같은 유니코드 코드는 무엇인가요?',
        a: '유니코드 코드는 문자 하나를 가리키는 16진수 식별자입니다. U+2192는 오른쪽 화살표 →, U+2605는 검은 별 ★를 뜻합니다. 코드는 문자를 식별하고 실제 모양은 사용하는 글꼴이 결정합니다.',
      },
      {
        q: '복사한 특수문자가 네모로 보이는 이유는 무엇인가요?',
        a: '네모 모양은 대개 붙여넣은 곳의 글꼴이 그 유니코드 문자 모양을 지원하지 않는다는 뜻입니다. 문자는 복사된 상태이므로 유니코드 지원 범위가 넓은 글꼴로 바꾸거나 더 일반적인 기호를 사용하면 됩니다.',
      },
    ],
    ui: {
      searchLabel: '특수문자 찾기',
      searchPlaceholder: '별, 화살표, U+2192로 검색…',
      searchHint: '기호, 한글·영문 이름 또는 유니코드 코드로 찾습니다.',
      groupLabel: '한글 키보드 자음 분류',
      all: '전체 문자',
      popular: '자주 쓰는 기호',
      giyok: 'ㄱ — 문장부호',
      nieun: 'ㄴ — 괄호·따옴표',
      digeut: 'ㄷ — 수학 기호',
      rieul: 'ㄹ — 단위·화폐',
      mieum: 'ㅁ — 도형·화살표',
      bieup: 'ㅂ — 선',
      siot: 'ㅅ — 동그라미 숫자·한글',
      ieung: 'ㅇ — 동그라미 알파벳',
      jieut: 'ㅈ — 로마 숫자',
      chieut: 'ㅊ — 분수·첨자',
      hieut: 'ㅎ — 그리스 문자',
      recent: '최근 복사',
      results: '특수문자',
      resultCount: '{n}개',
      noResults: '검색 결과가 없습니다.',
      copyHint: '문자를 누르면 복사됩니다. 최근 복사 목록은 이 브라우저에만 저장됩니다.',
      copyCharacter: '{character} 문자 복사, {code}',
      copied: '{character} 복사됨',
      copyFailed: '브라우저에서 복사를 허용하지 않았습니다. 문자를 선택한 뒤 직접 복사하세요.',
      codePoint: '유니코드 코드',
      shortcutStart: '검색창은',
      shortcutEnd: ' 키를 누르면 검색창으로 이동합니다.',
    },
  },
};

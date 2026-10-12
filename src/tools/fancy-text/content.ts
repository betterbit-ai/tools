import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Text to style',
  inputPlaceholder: 'Type or paste an Instagram bio, display name, or caption…',
  example: 'Your name',
  characters: 'Characters',
  styleGroup: 'Style type',
  allStyles: 'All',
  cleanStyles: 'Text styles',
  decorateStyles: 'Decorations',
  resultLabel: 'Styles that change your text',
  changedCount: '{n} results',
  compatibilityNote:
    'These are Unicode characters, not installed fonts. Use short decorative text and check it in the app where you plan to paste it.',
  noResults: 'No styles in this group change the current text. Try Decorations for Korean, CJK, or emoji.',
  copy: 'Copy',
  copied: 'Copied',
  clear: 'Clear',
  autosaved: 'Saved in this browser only',
  bold: 'Bold',
  italic: 'Italic',
  boldItalic: 'Bold italic',
  script: 'Script',
  boldScript: 'Bold script',
  fraktur: 'Fraktur',
  doubleStruck: 'Double-struck',
  sans: 'Sans serif',
  sansBold: 'Sans serif bold',
  sansItalic: 'Sans serif italic',
  monospace: 'Monospace',
  circled: 'Circled',
  smallCaps: 'Small caps',
  fullwidth: 'Fullwidth',
  spaced: 'Spaced',
  sparkles: 'Sparkles',
  brackets: 'Brackets',
  strikethrough: 'Strikethrough',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Fancy Text Generator — Unicode Styles to Copy',
    description:
      'Create copy-ready Unicode fancy text for Instagram bios, display names and captions. See only styles that change your text, with no ads or upload.',
    h1: 'Fancy Text Generator',
    tagline:
      'Make copy-ready Unicode text for social bios and captions, with styles that genuinely change what you typed.',
    name: 'Fancy Text Generator',
    keywords: [
      'Instagram font generator',
      'cool text generator',
      'Unicode text converter',
      'copy paste fonts',
      'stylish text',
    ],
    howTo: [
      'Type or paste a name, bio, or caption into “Text to style.”',
      'Choose All, Text styles, or Decorations to narrow the results.',
      'Copy one result and paste it into the profile or text field where you want to use it.',
      'Check the pasted result in that app before publishing, especially on an older device.',
    ],
    sections: [
      {
        heading: 'Fancy text is Unicode, not a font file',
        body: 'A fancy-text generator does not install a font or apply formatting such as bold in a document editor. It substitutes ordinary Latin letters and digits with separate Unicode characters that look bold, handwritten, circled, or monospaced. For example, “A” and “𝐀” are different characters, so the look travels when you copy and paste it into a social profile or message.\n\nThat also explains the limits. Most alphabet styles only have Latin letter and digit equivalents, so Korean, Chinese, Japanese, emoji, and punctuation usually remain unchanged. This tool hides those unchanged results and keeps decorations such as brackets, spacing, and strikethrough available for any script.',
      },
      {
        heading: 'Use decorative Unicode selectively',
        body: 'Unicode substitutions can display as a missing-character box on an app or device whose font does not support them. The straightforward Bold, Italic, Sans serif, and Monospace styles tend to be safer than ornate alternatives, but testing the exact place where you will paste is the only reliable compatibility check.\n\nStyled characters are also not ideal for important, searchable, or long text. Search, screen readers, and automatic moderation can treat look-alike Unicode characters differently from plain letters. Keep a business name, link, instruction, and other essential information in normal text; reserve fancy text for a short accent, display name, or bio line.',
      },
      {
        heading: 'A quick way to style an Instagram bio',
        body: 'Write the important words in plain text first, then try one short element such as a name, role, or callout in a Unicode style. Copy a result, open Instagram’s profile editor, and paste it into the Name or Bio field. If the field rejects it or it renders as a box, choose a simpler result or return to plain text.\n\nThis page processes the input in the current browser. The latest input is stored only in this browser so that a refresh does not interrupt your work; choose Clear to remove it.',
      },
    ],
    faq: [
      {
        q: 'Is fancy text a real font?',
        a: 'No. Fancy text is ordinary copyable text made from different Unicode characters that resemble bold, cursive, circled, or other styles; it does not install or embed a font file.',
      },
      {
        q: 'Why do Korean or emoji stay the same in some styles?',
        a: 'Most Unicode styled alphabets provide look-alike characters only for Latin letters and some digits. Korean, CJK characters, emoji, and punctuation therefore remain unchanged; choose a decoration such as Brackets or Strikethrough when styling those scripts.',
      },
      {
        q: 'Will this fancy text work in an Instagram bio?',
        a: 'Copyable Unicode text can often be pasted into an Instagram Name or Bio field, but acceptance and rendering vary by app, field, device, and font. Paste a short result into the exact field and check it before saving.',
      },
      {
        q: 'Why does fancy text sometimes show as a box?',
        a: 'A box appears when the device or app font does not contain the particular Unicode character. A simpler style such as Bold, Italic, Sans serif, or plain text is a safer fallback.',
      },
      {
        q: 'Is my text uploaded?',
        a: 'No. The conversion happens in the current browser and this tool does not upload the text. Its optional saved input stays only in this browser until you clear it or remove site data.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '인스타 폰트 변환기 — 유니코드 특수 글씨체',
    description:
      '인스타 소개글·닉네임에 쓸 유니코드 특수 글씨체를 바로 만들고 복사하세요. 실제로 바뀌는 결과만 보여 주며 광고나 서버 전송이 없습니다.',
    h1: '인스타 폰트 변환기',
    tagline: '인스타 소개글과 닉네임용 유니코드 특수 글씨체를 만들고, 실제로 바뀐 결과만 바로 복사합니다.',
    name: '인스타 폰트 변환기',
    keywords: ['특수 글씨체', '인스타 글씨체', '영어 폰트 변환', '예쁜 글씨체', '유니코드 폰트', 'SNS 닉네임'],
    howTo: [
      '“꾸밀 텍스트” 칸에 소개글, 닉네임, 문구를 입력하거나 붙여넣습니다.',
      '전체, 영문 글씨체, 꾸미기 중에서 원하는 결과만 골라 봅니다.',
      '마음에 드는 결과의 “복사”를 누릅니다.',
      '인스타그램 프로필 이름·소개글 등 사용할 입력칸에 붙여넣고 표시를 확인합니다.',
    ],
    sections: [
      {
        heading: '인스타 글씨체는 폰트가 아니라 유니코드 문자입니다',
        body: '이 도구가 만드는 𝐁𝐨𝐥𝐝, 𝓢𝓬𝓻𝓲𝓹𝓽 같은 글씨체는 폰트 파일을 설치하거나 글자 모양을 서식으로 바꾸는 기능이 아닙니다. 원래 영문·숫자를 모양이 비슷한 별도의 유니코드 문자로 바꾼 결과입니다. 그래서 복사한 뒤 인스타그램, 카카오톡, 디스코드처럼 글꼴을 직접 고를 수 없는 곳에도 붙여넣을 수 있습니다.\n\n반대로 유니코드에 영문 볼드·필기체처럼 대응하는 한글 글자는 없습니다. 한글, 한자, 일본어, 이모지는 대부분 영문 글씨체에서 그대로 남습니다. 이 도구는 바뀌지 않는 결과를 목록에서 숨기고, 모든 문자에 쓸 수 있는 괄호·간격·취소선 같은 꾸미기도 함께 제공합니다.',
      },
      {
        heading: '붙여넣기 전 꼭 확인할 점',
        body: '특수 글씨체는 기기와 앱이 해당 유니코드 문자를 그릴 수 있어야 보입니다. 상대방의 앱이나 오래된 기기에서는 네모(□)나 다른 모양으로 보일 수 있습니다. 볼드, 이탤릭, 산세리프, 고정폭처럼 단순한 스타일이 화려한 기호보다 무난하지만, 실제로 붙여넣을 앱에서 확인하는 방법이 가장 확실합니다.\n\n검색과 접근성이 중요한 이름·제목·안내문에는 일반 텍스트를 함께 쓰는 것이 좋습니다. 특수 글씨체는 일반 알파벳과 다른 문자이므로 검색어와 정확히 맞지 않을 수 있고, 화면 읽기 프로그램이 읽기 어려울 수 있습니다. 짧은 닉네임, 프로필의 한 줄 강조, 캡션의 포인트에 쓰는 것이 알맞습니다.',
      },
      {
        heading: '인스타 소개글에 적용하는 방법',
        body: '먼저 소개글에서 꼭 전달해야 할 정보는 일반 텍스트로 작성합니다. 그다음 이름, 직업, 짧은 문구처럼 강조할 부분만 특수 글씨체로 바꿉니다. 결과를 복사한 뒤 인스타그램의 프로필 편집 화면에서 이름 또는 소개란에 붙여넣고, 저장 전에 줄바꿈과 글자 표시를 확인합니다. 입력칸이 거부하거나 글자가 네모로 보이면 더 단순한 스타일 또는 일반 텍스트로 바꾸면 됩니다.\n\n변환은 현재 브라우저 안에서만 이루어집니다. 새로고침해도 이어서 사용할 수 있도록 최근 입력은 이 브라우저 저장소에만 보관하며, “지우기”를 누르면 삭제됩니다.',
      },
    ],
    faq: [
      {
        q: '인스타 글씨체는 실제 폰트인가요?',
        a: '아니요. 인스타 글씨체 변환 결과는 폰트 파일이 아니라 볼드·필기체·동그라미 모양처럼 보이는 별도의 유니코드 문자를 복사한 텍스트입니다.',
      },
      {
        q: '한글도 볼드나 필기체로 바뀌나요?',
        a: '한글에는 영문 수학 볼드·필기체처럼 대응하는 유니코드 글자 블록이 없어 대부분의 영문 글씨체에서는 모양이 바뀌지 않습니다. 괄호, 간격, 취소선 같은 꾸미기 결과는 한글에도 사용할 수 있습니다.',
      },
      {
        q: '인스타 소개글에 특수 글씨체를 붙여넣어도 되나요?',
        a: '유니코드 텍스트는 인스타그램의 이름과 소개글에 붙여넣을 수 있는 경우가 많지만, 입력칸·앱 버전·기기에 따라 허용과 표시가 달라질 수 있습니다. 저장 전 실제 프로필 편집 화면에서 짧은 문구를 확인해야 합니다.',
      },
      {
        q: '붙여넣은 글자가 네모로 보이는 이유는 무엇인가요?',
        a: '사용 중인 앱이나 기기의 글꼴이 해당 유니코드 문자를 지원하지 않으면 네모(□)로 보일 수 있습니다. 볼드, 이탤릭, 산세리프 같은 단순한 스타일이나 일반 텍스트로 바꾸면 해결될 수 있습니다.',
      },
      {
        q: '입력한 문구가 서버에 저장되나요?',
        a: '아니요. 변환은 브라우저에서 이루어지고 입력한 문구는 서버에 전송되지 않습니다. 새로고침 대비용 입력값만 현재 브라우저 저장소에 보관되며 “지우기”를 누르면 삭제됩니다.',
      },
    ],
    ui: {
      inputLabel: '꾸밀 텍스트',
      inputPlaceholder: '인스타 소개글, 닉네임, 캡션을 입력하거나 붙여넣으세요…',
      example: '나만의 소개글',
      characters: '글자',
      styleGroup: '스타일 종류',
      allStyles: '전체',
      cleanStyles: '영문 글씨체',
      decorateStyles: '꾸미기',
      resultLabel: '입력한 텍스트가 바뀐 결과',
      changedCount: '{n}개 결과',
      compatibilityNote:
        '이 결과는 설치하는 폰트가 아니라 유니코드 문자입니다. 짧은 꾸밈용으로 쓰고, 붙여넣을 앱에서 표시를 꼭 확인하세요.',
      noResults: '현재 텍스트를 바꾸는 이 종류의 스타일이 없습니다. 한글·한자·이모지에는 “꾸미기”를 선택해 보세요.',
      copy: '복사',
      copied: '복사됨',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      bold: '볼드',
      italic: '이탤릭',
      boldItalic: '볼드 이탤릭',
      script: '필기체',
      boldScript: '굵은 필기체',
      fraktur: '고딕체',
      doubleStruck: '이중선',
      sans: '산세리프',
      sansBold: '굵은 산세리프',
      sansItalic: '기울임 산세리프',
      monospace: '고정폭',
      circled: '동그라미',
      smallCaps: '작은 대문자',
      fullwidth: '전각',
      spaced: '글자 간격',
      sparkles: '반짝임',
      brackets: '괄호',
      strikethrough: '취소선',
    },
  },
};

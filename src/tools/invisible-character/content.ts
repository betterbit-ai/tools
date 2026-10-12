import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  characterLabel: 'Choose a character',
  quantityLabel: 'How many characters?',
  quantityHint: 'Choose 1–10,000. Your selection is saved in this browser only.',
  hangulFiller: 'Hangul Filler',
  brailleBlank: 'Braille Blank',
  zeroWidthSpace: 'Zero Width Space',
  wordJoiner: 'Word Joiner',
  hangulFillerUse: 'For a blank-looking name or a wide empty-looking cell. A platform may still reject it.',
  brailleBlankUse:
    'For a blank-looking character with the width of a braille cell. Try it when another choice is filtered.',
  zeroWidthSpaceUse: 'For an invisible optional line-break point inside text, not for a blank name.',
  wordJoinerUse: 'For keeping adjacent text on one line without adding width, not for a blank name.',
  selectedCharacter: 'Selected character',
  generated: 'Characters ready',
  copy: 'Copy character',
  copied: 'Copied',
  preview: 'Preview',
  previewStart: '[',
  previewEnd: ']',
  platformNote:
    'Apps can remove, normalize or reject these characters. Test in the destination field and follow that platform’s rules.',
  testerLabel: 'Inspect pasted text',
  testerHint: 'Paste text here to see each Unicode code point. This text stays on this page and is not saved.',
  testerPlaceholder: 'Paste text to inspect…',
  totalCharacters: 'Characters pasted',
  recognizedCharacters: 'Recognized invisible',
  detectedCharacters: 'Detected code points',
  noText: 'Paste text to inspect the characters it contains.',
  otherCharacter: 'Other character',
  count: '{n} occurrence(s)',
  generatedDescription: '{n} selected character(s) ready to copy.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Invisible Character — Copy Unicode Blank Text',
    description:
      'Copy an invisible Unicode character in one click, choose it by purpose, and inspect pasted code points locally. No ads, sign-up or uploads.',
    h1: 'Invisible Character',
    tagline: 'Copy the right invisible Unicode character, then check exactly what a platform kept.',
    name: 'Invisible Character',
    keywords: ['blank character copy paste', 'invisible text', 'empty character', 'zero width space', 'blank username'],
    howTo: [
      'Choose a character based on its purpose: blank-looking text, a possible line break, or a no-break joiner.',
      'Set how many copies you need; the preview remains visibly bracketed so you can confirm the selection.',
      'Select “Copy character” and paste it into the destination field.',
      'If the destination changes or rejects it, paste the result into the inspector to see the exact U+ code points that remain.',
    ],
    sections: [
      {
        heading: 'These characters do different jobs',
        body: 'U+200B ZERO WIDTH SPACE normally has no width and creates an additional line-break opportunity. It is intended for scripts that do not use visible word spaces, so it is useful in text layout rather than as a blank name. U+2060 WORD JOINER does the opposite: it has no width and keeps its neighboring text from breaking onto separate lines. Both behaviors are defined by Unicode’s line-breaking rules.\n\nU+3164 HANGUL FILLER and U+2800 BRAILLE PATTERN BLANK are real code points that can appear blank in common fonts, but applications decide whether to preserve them. A service may trim, normalize, display or reject any of these values, so no character is a universal “blank username” solution.',
      },
      {
        heading: 'Why this tool does not offer U+FEFF',
        body: 'Older copy-and-paste lists often include U+FEFF ZERO WIDTH NO-BREAK SPACE. Unicode uses U+FEFF primarily as a byte order mark and recommends U+2060 WORD JOINER for new text that needs no-break behavior. This tool therefore offers U+2060 instead and makes the code point visible before you copy it.\n\nThe inspector counts Unicode code points, not UTF-16 code units. That means an emoji such as 😀 is reported as one U+1F600 character, rather than two surrogate halves, alongside any invisible characters you pasted.',
      },
    ],
    faq: [
      {
        q: 'Which invisible character should I copy for a blank-looking name?',
        a: 'Try U+3164 HANGUL FILLER or U+2800 BRAILLE PATTERN BLANK for a blank-looking name, but acceptance depends on that platform’s validation and rules. U+200B and U+2060 are formatting controls, so they are better suited to line-break behavior than names.',
      },
      {
        q: 'What is the difference between U+200B and U+2060?',
        a: 'U+200B ZERO WIDTH SPACE is normally widthless and marks an optional line-break opportunity, while U+2060 WORD JOINER is normally widthless and prevents a line break between adjacent characters.',
      },
      {
        q: 'Does this tool upload the text I paste?',
        a: 'No. Generation and inspection run in the browser, and pasted inspection text is not saved or sent to a server. Only the selected character and quantity are saved in this browser to restore the tool settings.',
      },
      {
        q: 'Why did a platform remove my invisible character?',
        a: 'Platforms may trim whitespace, normalize Unicode, reject formatting controls or apply their own name rules. A character that appears blank in one input can be removed, displayed as a box or rejected in another.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '투명 문자 — 공백 문자 복사·유니코드 확인',
    description:
      '용도에 맞는 투명 문자·공백 문자를 한 번에 복사하고, 붙여넣은 텍스트의 유니코드 값을 브라우저에서 확인합니다. 광고·가입·업로드가 없습니다.',
    h1: '공백 문자',
    tagline: '투명 문자를 용도별로 골라 복사하고, 남아 있는 유니코드 값을 직접 확인합니다.',
    name: '공백 문자',
    keywords: ['투명 문자', '공백 문자 복사', '빈 문자', '보이지 않는 문자', '제로폭 공백', '투명글씨'],
    howTo: [
      '빈 이름, 줄바꿈 가능 지점, 줄바꿈 방지 중 목적에 맞는 문자를 고릅니다.',
      '필요한 문자 수를 정합니다. 대괄호 안 미리보기에서 선택한 문자를 확인합니다.',
      '“문자 복사”를 누른 뒤 사용할 입력창에 붙여넣습니다.',
      '문자가 바뀌거나 거부되면 아래 검사창에 결과를 붙여넣어 남은 U+ 코드 값을 확인합니다.',
    ],
    sections: [
      {
        heading: '투명 문자는 같은 기능이 아닙니다',
        body: 'U+200B 제로 폭 공백은 보통 너비 없이 추가 줄바꿈 가능 지점을 만듭니다. 눈에 보이는 띄어쓰기를 쓰지 않는 문자 체계의 줄바꿈을 위해 정의된 문자이므로, 빈 닉네임보다 텍스트 배치에 알맞습니다. U+2060 워드 조이너는 반대로 너비 없이 양옆 텍스트가 다른 줄로 나뉘는 것을 막습니다. 두 기능은 유니코드 줄바꿈 규칙에 정의되어 있습니다.\n\nU+3164 한글 채움 문자와 U+2800 점자 공백은 일반 글꼴에서 비어 보일 수 있는 실제 문자입니다. 그러나 보존 여부는 서비스가 정합니다. 어떤 입력창이든 문자를 지우거나, 바꾸거나, 표시하거나, 거부할 수 있으므로 모든 곳에서 통하는 “빈 닉네임” 문자는 없습니다.',
      },
      {
        heading: 'U+FEFF 대신 U+2060을 쓰는 이유',
        body: '오래된 공백 문자 목록에는 U+FEFF 제로 폭 줄바꿈 없음 공백이 들어 있기도 합니다. 유니코드는 U+FEFF를 주로 바이트 순서 표시(BOM)로 사용하며, 새 텍스트에서 줄바꿈을 막을 때는 U+2060 워드 조이너 사용을 권장합니다. 이 도구는 그래서 U+2060을 제공하고 복사 전에 코드 값을 분명히 보여 줍니다.\n\n검사기는 UTF-16 코드 단위가 아니라 유니코드 코드 포인트를 셉니다. 따라서 😀는 서로게이트 둘이 아니라 U+1F600 한 글자로 표시되고, 함께 붙여넣은 투명 문자도 각각 확인할 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '빈 닉네임에는 어떤 투명 문자를 복사해야 하나요?',
        a: '빈 닉네임처럼 보이게 하려면 U+3164 한글 채움 문자나 U+2800 점자 공백을 먼저 시도할 수 있지만, 허용 여부는 각 서비스의 입력 규칙과 운영 정책에 따라 달라집니다. U+200B와 U+2060은 줄바꿈 제어에 더 알맞습니다.',
      },
      {
        q: 'U+200B와 U+2060은 무엇이 다른가요?',
        a: 'U+200B 제로 폭 공백은 보통 너비 없이 줄바꿈 가능한 지점을 만들고, U+2060 워드 조이너는 보통 너비 없이 양옆 문자 사이의 줄바꿈을 막습니다.',
      },
      {
        q: '검사창에 붙여넣은 텍스트가 서버에 저장되나요?',
        a: '아니요. 생성과 검사는 모두 브라우저 안에서 처리하며 검사창에 붙여넣은 텍스트는 저장하거나 서버로 전송하지 않습니다. 선택한 문자 종류와 수량만 이 브라우저에 설정값으로 저장합니다.',
      },
      {
        q: '서비스가 투명 문자를 지운 이유는 무엇인가요?',
        a: '서비스는 공백을 제거하거나 유니코드를 정규화하고, 서식 제어 문자를 거부하거나 닉네임 규칙을 적용할 수 있습니다. 한 입력창에서는 비어 보이던 문자가 다른 곳에서는 삭제·표시·거부될 수 있습니다.',
      },
    ],
    ui: {
      characterLabel: '문자 종류',
      quantityLabel: '문자 수',
      quantityHint: '1~10,000개를 고를 수 있습니다. 선택값은 이 브라우저에만 저장됩니다.',
      hangulFiller: '한글 채움',
      brailleBlank: '점자 공백',
      zeroWidthSpace: '제로 폭 공백',
      wordJoiner: '워드 조이너',
      hangulFillerUse: '빈 닉네임이나 넓게 비어 보이는 칸에 시도할 수 있습니다. 서비스에서 거부할 수 있습니다.',
      brailleBlankUse: '점자 칸 너비로 비어 보이는 문자입니다. 다른 문자가 걸러질 때 대안으로 시도할 수 있습니다.',
      zeroWidthSpaceUse: '텍스트 안에 보이지 않는 줄바꿈 가능 지점을 넣을 때 쓰며, 빈 닉네임용이 아닙니다.',
      wordJoinerUse: '너비를 더하지 않고 양옆 텍스트를 같은 줄에 두는 문자이며, 빈 닉네임용이 아닙니다.',
      selectedCharacter: '선택한 문자',
      generated: '준비된 문자',
      copy: '문자 복사',
      copied: '복사됨',
      preview: '미리보기',
      previewStart: '[',
      previewEnd: ']',
      platformNote:
        '앱은 이 문자를 지우거나 바꾸거나 거부할 수 있습니다. 사용할 입력창에서 직접 확인하고 해당 서비스의 규칙을 따르세요.',
      testerLabel: '붙여넣은 텍스트 검사',
      testerHint: '여기에 붙여넣으면 문자별 유니코드 코드 값을 보여 줍니다. 이 텍스트는 저장하지 않습니다.',
      testerPlaceholder: '검사할 텍스트를 붙여넣으세요…',
      totalCharacters: '붙여넣은 글자',
      recognizedCharacters: '찾은 투명 문자',
      detectedCharacters: '찾은 코드 포인트',
      noText: '텍스트를 붙여넣으면 포함된 문자를 검사합니다.',
      otherCharacter: '다른 문자',
      count: '{n}회',
      generatedDescription: '선택한 문자 {n}개를 복사할 수 있습니다.',
    },
  },
};

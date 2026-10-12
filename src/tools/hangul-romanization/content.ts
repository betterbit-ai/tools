import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Korean text',
  standardHint: 'For words, place names and ordinary Korean text. Results follow pronunciation across syllables.',
  nameHint: 'Enter one Korean full name per word: family name first, then the given name.',
  standardPlaceholder: 'Type or paste Korean text here…',
  namePlaceholder: 'For example: 김민수',
  standardExample: '서울 종로와 경복궁',
  nameExample: '김민수',
  tryExample: 'Try an example',
  clear: 'Clear',
  autosaved: 'Saved in this browser only',
  modeLabel: 'Conversion type',
  standardMode: 'Official RR',
  nameMode: 'Passport name',
  capitalize: 'Capitalize each result',
  passportNotice:
    'This is a name-format suggestion. Match the spelling already printed in your passport or confirm it with the passport authority.',
  noHangul: 'Enter at least one modern Hangul syllable to convert it.',
  outputLabel: 'Romanized result',
  outputPlaceholder: 'Your romanized text appears here.',
  copy: 'Copy result',
  copied: 'Copied',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Korean Romanization — Revised RR & Passport Names',
    description:
      'Convert Hangul to Revised Romanization or a passport-friendly Korean name format as you type. Runs locally in your browser, saves on this device, and is ready to copy.',
    h1: 'Korean Romanization Converter',
    tagline:
      'Turn Hangul into Revised Romanization live, then switch to a separate Korean-name format when you need it.',
    name: 'Korean Romanization',
    keywords: [
      'hangul romanization',
      'korean romanization',
      'hangul to english letters',
      'korean name in english',
      'revised romanization',
    ],
    howTo: [
      'Paste or type Hangul into the Korean text box.',
      'Keep “Official RR” selected for places, ordinary words and sentences.',
      'Choose “Passport name” for a full Korean name written family name first.',
      'Review the live result and copy it when it is ready.',
      'For a passport or legal record, compare the result with the spelling already issued by the authority.',
    ],
    sections: [
      {
        heading: 'What Revised Romanization writes',
        body: 'Revised Romanization (RR) is South Korea’s official Romanization system. It was introduced in 2000 and is the system used for many road signs, maps and public names. It uses ordinary Latin letters rather than the breves and apostrophes found in McCune–Reischauer: 서울 is Seoul, 부산 is Busan and 경복궁 is Gyeongbokgung. The current Korean notice is Ministry of Culture, Sports and Tourism Notice No. 2024-27.\n\nRR follows Korean pronunciation at a syllable boundary, not a simple one-character substitution. This is why 종로 becomes Jongno and 신라 becomes Silla. The converter handles common liaison, nasalisation, ㄴ/ㄹ lateralisation and ㄷ/ㅌ + 이 palatalisation, so 한국어 becomes Hangugeo and 같이 becomes gachi. A spelling alone cannot resolve every compound-word or dictionary-pronunciation exception, so check official names against their published form.',
      },
      {
        heading: 'Korean names and passport spelling',
        body: 'A personal name is not the same task as a place-name conversion. In Korean name conventions, the family name comes first and the given name is normally written as one unit or with an optional hyphen between its syllables. Existing passports, certificates, school records and airline tickets should keep their established Roman spelling. For example, Kim, Lee and Park are widespread customary spellings even where a direct RR result differs.\n\nThe Passport name option keeps the family-name-first structure and uses common spellings for frequent surnames such as 김 → Kim, 이 → Lee and 박 → Park. It does not claim to issue or override a passport name. Before applying for or changing a legal document, use the exact Roman spelling required by the issuing authority; an automatic converter cannot decide whether an existing family spelling must be retained.',
      },
      {
        heading: 'Private, local text conversion',
        body: 'This converter performs its rule lookup in the page. Korean text is not sent to a translation or address service, so it is suitable for draft names, notes and lists that should stay on your device. The latest input, selected mode and capitalization setting are saved only in this browser to protect against an accidental refresh. Choose Clear to remove the saved input from this browser.\n\nNon-Korean characters are left where they are. That means a mixed note such as 안녕, world! 😀 remains readable after conversion, while its Hangul becomes Annyeong. Modern Hangul entered in decomposed Unicode form is normalised before conversion, which avoids a different result when text was copied from a source that stores Korean jamo separately.',
      },
    ],
    faq: [
      {
        q: 'What is the official Korean Romanization system?',
        a: 'Revised Romanization (RR) is the official South Korean Romanization system. It has been used since 2000 and writes Korean with ordinary Latin letters, so 서울 is Seoul and 부산 is Busan.',
      },
      {
        q: 'Can I use this result in a Korean passport?',
        a: 'Use the Passport name result only as a drafting aid. A Korean passport’s issued Roman spelling and the passport authority’s rules take priority, and an existing passport spelling should be copied exactly for legal or travel records.',
      },
      {
        q: 'Why does 종로 become Jongno instead of Jongro?',
        a: 'RR follows pronunciation across syllables. In 종로, the final ㅇ is followed by ㄹ, which is pronounced with an n sound in this position, producing Jongno rather than a letter-by-letter Jongro.',
      },
      {
        q: 'Does this converter translate Korean into English?',
        a: 'No. Romanization changes Hangul into Latin letters that represent Korean pronunciation; it does not translate meaning. For example, 감사합니다 becomes gamsahamnida, not “thank you.”',
      },
      {
        q: 'Is the text I enter uploaded?',
        a: 'No. Conversion runs in the browser. The optional saved input remains in this browser’s local storage only and can be removed with Clear.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '한글 영문 변환 — 로마자 표기법·여권 이름 표기',
    description:
      '한글을 국어의 로마자 표기법 또는 여권용 이름 형식으로 입력 즉시 변환합니다. 텍스트는 서버로 전송하지 않고 이 브라우저에서만 저장·복사합니다.',
    h1: '한글 로마자 변환',
    tagline: '일반 한글은 국어의 로마자 표기법으로, 인명은 별도 여권 이름 형식으로 바로 확인합니다.',
    name: '한글 로마자 변환',
    keywords: ['한글 영문 변환', '한글 로마자 변환', '한글 영어 변환', '여권 영문 이름', '국어의 로마자 표기법'],
    howTo: [
      '입력창에 한글 단어, 지명 또는 문장을 입력하거나 붙여넣습니다.',
      '지명·일반어·문장에는 “국어 로마자”를 선택합니다.',
      '성+이름 순서의 한글 이름에는 “여권 이름”을 선택합니다.',
      '입력 즉시 바뀌는 결과를 확인하고 복사합니다.',
      '여권·항공권·계약서에는 이미 발급된 영문 표기와 기관의 안내를 최종 확인합니다.',
    ],
    sections: [
      {
        heading: '국어의 로마자 표기법은 발음을 반영합니다',
        body: '국어의 로마자 표기법은 우리말을 로마자로 적는 대한민국의 공식 기준입니다. 2000년에 시행되었고, 현재 고시는 문화체육관광부 고시 제2024-27호입니다. 서울은 Seoul, 부산은 Busan, 경복궁은 Gyeongbokgung처럼 특수기호 없이 영문자로 적습니다. 국립국어원은 로마자 표기 용례를 공개하고 있어 지명이나 공공 표기는 해당 용례를 함께 확인할 수 있습니다.\n\n이 표기법은 글자 하나씩을 바꾸는 방식이 아니라 음절 경계에서 나는 소리를 반영합니다. 그래서 종로는 Jongro가 아니라 Jongno, 신라는 Silra가 아니라 Silla가 됩니다. 이 도구는 연음, 비음화, ㄴ·ㄹ 유음화, ㄷ·ㅌ 뒤 ‘이’의 구개음화를 처리해 한국어는 Hangugeo, 같이는 gachi로 변환합니다. 합성어 경계나 사전에만 있는 발음은 한글 표기만으로 확정할 수 없으므로 공식 지명·상호는 공개 표기를 우선하세요.',
      },
      {
        heading: '여권 영문 이름은 일반 로마자 변환과 다릅니다',
        body: '인명은 성을 먼저 쓰고 이름은 붙여 쓰거나 음절 사이에 붙임표를 쓸 수 있습니다. 여권, 졸업증명서, 비자, 항공권에 이미 적힌 영문 이름은 반드시 같은 철자를 유지해야 합니다. 김·이·박처럼 실제로 널리 쓰는 성 표기는 각각 Kim·Lee·Park이며, 단순한 일반어 변환 결과와 다를 수 있습니다.\n\n“여권 이름”은 한글 성명 한 개를 성+이름 구조로 나누고 자주 쓰는 성 표기를 반영하는 참고용 형식입니다. 예를 들어 김민수는 Kim Minsu로 표시합니다. 이 결과가 여권 발급이나 변경을 승인하는 것은 아닙니다. 로마자 성명은 발급 기관의 규정과 기존 여권 표기가 우선하므로, 새 여권 또는 법적 서류를 제출하기 전에는 외교부·여권 창구의 안내를 확인해야 합니다.',
      },
      {
        heading: '입력한 한글은 기기 밖으로 전송되지 않습니다',
        body: '변환 규칙은 이 페이지의 브라우저에서 실행합니다. 번역 API나 영문 주소 API로 텍스트를 보내지 않으므로, 메모·이름 목록·초안처럼 외부 전송을 피하고 싶은 한글도 변환할 수 있습니다. 새로고침으로 입력을 잃지 않도록 마지막 입력값, 변환 방식, 대문자 설정은 현재 브라우저의 로컬 저장소에만 보관합니다. “지우기”를 누르면 저장된 입력도 함께 제거합니다.\n\n영문, 숫자, 기호, 이모지는 원래 위치에 남습니다. 예를 들어 안녕, world! 😀는 Annyeong, world! 😀처럼 표시됩니다. macOS 등에서 자모가 분리된 형태로 붙여넣은 한글은 먼저 표준 한글 음절로 정규화하므로, 같은 글자가 입력 방식에 따라 다르게 변환되는 일을 줄였습니다.',
      },
    ],
    faq: [
      {
        q: '한글 영문 변환과 번역은 무엇이 다른가요?',
        a: '한글 영문 변환은 한국어 발음을 영문자로 적는 로마자 표기이며 뜻을 영어로 바꾸는 번역이 아닙니다. 감사합니다는 gamsahamnida로 표기되고 “thank you”로 번역되지는 않습니다.',
      },
      {
        q: '여권 영문 이름으로 그대로 써도 되나요?',
        a: '여권 이름 결과는 참고용입니다. 여권·비자·항공권에는 이미 발급된 여권의 영문 철자를 그대로 쓰고, 신규 발급이나 변경은 발급 기관의 로마자 성명 안내를 확인해야 합니다.',
      },
      {
        q: '종로가 Jongro가 아니라 Jongno인 이유는 무엇인가요?',
        a: '국어의 로마자 표기법은 음절 사이의 실제 발음을 반영합니다. 종로에서는 받침 ㅇ 뒤의 ㄹ이 이 위치에서 ㄴ 소리로 나므로 Jongno로 적습니다.',
      },
      {
        q: '입력한 이름이나 문장이 서버에 저장되나요?',
        a: '아니요. 변환은 브라우저에서 실행되고 입력한 한글은 서버로 전송되지 않습니다. 새로고침 대비용 저장도 현재 브라우저의 로컬 저장소에만 이루어지며 지우기로 제거할 수 있습니다.',
      },
      {
        q: '외국인 이름이나 브랜드명도 로마자로 바꿀 수 있나요?',
        a: '한글로 적힌 외래어도 발음에 따라 로마자로 바뀌지만, 원래 영어 철자나 공식 브랜드 표기가 복원되지는 않습니다. 공식 영문명이 있는 사람·회사·상품은 그 표기를 직접 사용하세요.',
      },
    ],
    ui: {
      inputLabel: '변환할 한글',
      standardHint: '단어·지명·일반 문장용입니다. 음절 사이의 발음을 반영해 변환합니다.',
      nameHint: '한글 성명 한 개를 성+이름 순서로 입력합니다.',
      standardPlaceholder: '여기에 한글을 입력하거나 붙여넣으세요…',
      namePlaceholder: '예: 김민수',
      standardExample: '서울 종로와 경복궁',
      nameExample: '김민수',
      tryExample: '예시 입력',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      modeLabel: '변환 방식',
      standardMode: '국어 로마자',
      nameMode: '여권 이름',
      capitalize: '결과 첫 글자 대문자',
      passportNotice:
        '이 결과는 이름 형식 제안입니다. 여권에 이미 적힌 철자를 우선하고, 발급 기관의 안내를 확인하세요.',
      noHangul: '현대 한글 음절을 하나 이상 입력해야 변환할 수 있습니다.',
      outputLabel: '로마자 변환 결과',
      outputPlaceholder: '변환 결과가 여기에 표시됩니다.',
      copy: '결과 복사',
      copied: '복사됨',
    },
  },
};

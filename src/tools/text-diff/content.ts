import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  modeLabel: 'Comparison mode',
  modeLine: 'Line',
  modeWord: 'Word',
  modeChar: 'Character',
  originalLabel: 'Original text',
  originalPlaceholder: 'Paste or type the original text…',
  modifiedLabel: 'Changed text',
  modifiedPlaceholder: 'Paste or type the changed text…',
  swap: 'Swap',
  clear: 'Clear',
  autosaved: 'Saved in this browser only',
  added: 'Added',
  removed: 'Removed',
  similarity: 'Similarity',
  identicalNotice: 'These texts are identical.',
  emptyHint: 'Enter text in both boxes to see what changed.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Text Compare — Word & Character Diff Checker',
    description:
      'Compare two texts and see every word and character difference, instantly highlighted. Nothing is uploaded, and word- and character-level diff are both free and unlimited.',
    h1: 'Text Compare',
    tagline: 'Word- and character-level diff, accurate for Korean and CJK text — all in your browser, no limits.',
    name: 'Text Compare',
    keywords: ['diff checker', 'compare two texts', 'word diff', 'character diff', 'find text differences'],
    howTo: [
      'Paste or type the original text on the left.',
      'Paste the edited version on the right.',
      'Choose Line, Word or Character comparison mode.',
      'Added text is highlighted in green, removed text in red.',
      'Click Swap to compare the two texts in the other direction.',
    ],
    sections: [
      {
        heading: 'Which comparison mode should I use?',
        body: "Line mode is best for code, logs or long documents, since it shows which whole lines were added, moved or removed. Word mode is best for prose: it highlights only the words that actually changed, so editing a single word doesn't make the whole sentence look different. Character mode is the most precise — useful for comparing IDs, URLs or phone numbers, where a single changed character matters.",
      },
      {
        heading: 'Why this diff stays accurate for Korean and CJK text',
        body: "Many browser-based diff tools split text by raw UTF-16 code units, which can cut emoji and combining characters in half. This tool segments text into user-perceived characters (Unicode grapheme clusters) instead, so a Hangul syllable or a multi-codepoint emoji is always treated as one unit. Text is also normalized to NFC before comparing, so Korean text whose jamo were decomposed into separate combining characters (NFD) — a known side effect of passing through macOS's filesystem — compares as identical to the same text typed normally, instead of showing a false difference on every character.",
      },
      {
        heading: 'What "added", "removed" and "similarity" mean',
        body: '"Added" and "removed" count the tokens (lines, words or characters, depending on the mode) that differ between the two texts. "Similarity" is the share of tokens the two texts have in common, calculated as twice the number of matching tokens divided by the combined length of both texts — 100% means the texts are identical, 0% means they share nothing at all.',
      },
    ],
    faq: [
      {
        q: 'Does this tool upload my text anywhere?',
        a: "No. Every comparison runs in your browser using JavaScript; the two texts are never sent to a server, logged, or stored anywhere outside your device's local storage.",
      },
      {
        q: "What's the difference between line, word and character mode?",
        a: 'Line mode compares whole lines, word mode compares individual words plus the spaces and punctuation between them, and character mode compares every user-perceived character one by one, including emoji and accented letters.',
      },
      {
        q: 'Why do two identical-looking Korean texts sometimes show as different?',
        a: "Some systems store Hangul with its jamo (letters) decomposed into separate Unicode characters instead of combined into whole syllables — a common side effect of text that passed through macOS's filesystem. This tool normalizes both texts before comparing, so visually identical Korean text always compares as identical.",
      },
      {
        q: 'Can I compare two whole documents, or just short text?',
        a: 'Either works. Paste anything from a single sentence to a multi-page document; the comparison updates as you type for typical document lengths, though very large files take a moment longer on slower devices.',
      },
      {
        q: 'Is there a limit to how much I can compare?',
        a: "No. There's no sign-up, no daily limit, and no feature paywalled behind a paid plan — word- and character-level comparison are both free and unlimited.",
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '텍스트 비교 — 단어·글자 단위 Diff 검사기',
    description:
      '두 텍스트를 비교해 추가·삭제된 단어와 글자를 실시간으로 표시합니다. 서버 전송 없이 브라우저에서만 처리하며, 단어·글자 단위 비교 모두 가입이나 횟수 제한 없이 무료입니다.',
    h1: '텍스트 비교',
    tagline: '줄·단어·글자 단위로 비교하고, 한글 자모가 분리된 경우에도 정확하게 비교합니다.',
    name: '텍스트 비교',
    keywords: ['diff 검사기', '두 텍스트 비교', '단어 비교', '글자 비교', '문서 비교 사이트'],
    howTo: [
      '왼쪽에 원본 텍스트를 입력하거나 붙여넣습니다.',
      '오른쪽에 수정된 텍스트를 입력하거나 붙여넣습니다.',
      '줄/단어/글자 비교 모드를 선택합니다.',
      '추가된 내용은 초록색, 삭제된 내용은 빨간색으로 표시됩니다.',
      '바꾸기 버튼을 누르면 두 텍스트의 위치가 서로 바뀝니다.',
    ],
    sections: [
      {
        heading: '어떤 비교 모드를 써야 할까?',
        body: '줄 단위는 코드, 로그, 긴 문서를 비교할 때 적합합니다. 어떤 줄이 추가·삭제·이동됐는지 한눈에 보여줍니다. 단어 단위는 글을 비교할 때 적합합니다. 실제로 바뀐 단어만 강조해서, 한 단어만 고쳐도 문장 전체가 달라진 것처럼 보이지 않습니다. 글자 단위는 가장 정밀합니다. 아이디, URL, 전화번호처럼 글자 하나의 변경이 중요한 짧은 문자열을 비교할 때 유용합니다.',
      },
      {
        heading: '한글과 CJK 텍스트에서도 정확한 이유',
        body: '많은 브라우저 기반 비교 도구는 UTF-16 코드 단위로 텍스트를 나누는데, 이 방식은 이모지나 결합 문자를 중간에서 잘라버릴 수 있습니다. 이 도구는 사람이 인지하는 글자 단위(유니코드 그래핌 클러스터)로 나누기 때문에 한글 음절이나 여러 코드로 이루어진 이모지도 항상 하나로 처리됩니다. 또한 비교 전에 텍스트를 NFC로 정규화하므로, macOS 파일 시스템을 거치며 자모가 분리된(NFD) 한글 텍스트도 일반적으로 입력한 한글과 동일하게 비교됩니다.',
      },
      {
        heading: '추가·삭제·일치율은 어떻게 계산하나요?',
        body: '"추가"와 "삭제"는 두 텍스트 사이에서 다른 토큰(모드에 따라 줄, 단어, 글자)의 개수를 셉니다. "일치율"은 두 텍스트가 공유하는 토큰의 비율로, 일치하는 토큰 수의 두 배를 두 텍스트의 전체 길이로 나눠 계산합니다. 100%면 완전히 같고, 0%면 공통된 부분이 전혀 없다는 뜻입니다.',
      },
    ],
    faq: [
      {
        q: '이 도구가 입력한 텍스트를 서버로 전송하나요?',
        a: '아니요. 모든 비교는 브라우저 안에서 자바스크립트로 처리되며, 두 텍스트는 서버로 전송되거나 기록·저장되지 않습니다.',
      },
      {
        q: '줄·단어·글자 비교는 각각 어떻게 다른가요?',
        a: '줄 비교는 줄 전체를, 단어 비교는 띄어쓰기와 문장부호를 포함한 단어 단위를, 글자 비교는 이모지를 포함해 사람이 인지하는 글자 하나하나를 비교합니다.',
      },
      {
        q: '한글이 똑같아 보이는데 왜 다르다고 나오나요?',
        a: '일부 시스템은 한글 음절을 자모로 분리해서 저장합니다. macOS 파일 시스템을 거친 텍스트에서 흔히 나타납니다. 이 도구는 비교 전에 두 텍스트를 정규화하므로, 겉보기에 같은 한글은 항상 같다고 판단합니다.',
      },
      {
        q: '긴 문서도 비교할 수 있나요?',
        a: '네. 문장 하나부터 여러 페이지 분량의 문서까지 비교할 수 있습니다. 일반적인 문서 길이라면 입력하는 즉시 결과가 갱신되며, 매우 큰 파일은 느린 기기에서 시간이 조금 더 걸릴 수 있습니다.',
      },
      {
        q: '사용 횟수나 글자수 제한이 있나요?',
        a: '없습니다. 가입이 필요 없고 일일 사용 횟수 제한도 없으며, 단어·글자 단위 비교 모두 무료로 무제한 사용할 수 있습니다.',
      },
    ],
    ui: {
      modeLabel: '비교 모드',
      modeLine: '줄',
      modeWord: '단어',
      modeChar: '글자',
      originalLabel: '원본 텍스트',
      originalPlaceholder: '원본 텍스트를 입력하거나 붙여넣으세요…',
      modifiedLabel: '수정된 텍스트',
      modifiedPlaceholder: '수정된 텍스트를 입력하거나 붙여넣으세요…',
      swap: '바꾸기',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      added: '추가',
      removed: '삭제',
      similarity: '일치율',
      identicalNotice: '두 텍스트가 완전히 같습니다.',
      emptyHint: '두 칸에 텍스트를 입력하면 차이를 보여드립니다.',
    },
  },
};

import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  outputLabel: 'Generated text',
  regenerate: 'Generate another',
  copy: 'Copy text',
  copied: 'Copied',
  localOnly: 'Generated in this browser',
  languageLabel: 'Text style',
  latin: 'Latin',
  korean: 'Korean',
  unitLabel: 'Generate by',
  paragraphs: 'Paragraphs',
  sentences: 'Sentences',
  words: 'Words',
  characters: 'Characters',
  amountLabel: 'Amount',
  amountHint: 'Use 1–100. The result updates immediately.',
  amountPlaceholder: '3',
  classicOpening: 'Start with the classic opening',
  koreanHint: 'Korean mode uses natural Korean sentences with no connected story.',
  formatLabel: 'Copy format',
  plain: 'Plain text',
  html: 'HTML <p>',
  resultWords: 'Words',
  resultCharacters: 'Characters',
  resultParagraphs: 'Paragraphs',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Lorem Ipsum Generator — Korean Dummy Text & HTML',
    description:
      'Generate classic Latin or natural Korean dummy text by paragraph, sentence, word, or exact character count. See the result live, then copy plain text or HTML with no ads.',
    h1: 'Lorem Ipsum Generator',
    tagline: 'Create copy-ready Latin or Korean placeholder text live, with no ads around the result.',
    name: 'Lorem Ipsum Generator',
    keywords: ['dummy text generator', 'placeholder text', 'Korean lorem', 'lipsum generator', 'HTML filler text'],
    howTo: [
      'Choose Latin or Korean text style.',
      'Choose paragraphs, sentences, words, or characters and enter an amount from 1 to 100.',
      'For Latin text, choose whether to begin with the familiar opening.',
      'Select plain text or HTML paragraph tags, then copy the live result.',
      'Choose “Generate another” when you need a different arrangement at the same length.',
    ],
    sections: [
      {
        heading: 'Use the text style that matches the layout',
        body: 'Classic Lorem Ipsum is scrambled, pseudo-Latin placeholder copy. Its familiar word lengths and punctuation help a page look occupied without asking reviewers to read a real draft. Korean screens need a different check: Hangul has different glyph widths, spacing and line-break behavior from Latin text. Korean mode therefore draws from complete Korean sentences rather than transliterating Latin words. Each sentence is natural on its own, but the randomized order does not form a story, keeping attention on the layout.\n\nUse Latin text for an international or English-first mockup. Switch to Korean before checking a Korean card, form, mobile screen or document template. The same controls support both modes, so the amount and copy format do not need to be set again.',
      },
      {
        heading: 'Choose an amount without estimating',
        body: 'Paragraph mode creates 3 to 5 sentences per paragraph, useful for article and landing-page mockups. Sentence mode is useful for lists, notifications and cards. Word mode produces exactly the requested number of space-separated words, which is useful for testing labels or short descriptions. Character mode returns exactly the requested number of Unicode characters from the generated text, including spaces and punctuation.\n\nThe limit is 100 in every mode so the browser stays responsive and the preview remains easy to copy. The counters show the generated plain text, even when HTML format is selected; <p> tags are formatting added for pasting into markup, not part of the requested placeholder length.',
      },
      {
        heading: 'Why the familiar opening is optional',
        body: 'The recognizable opening comes from a distorted passage associated with Cicero’s De finibus bonorum et malorum, written in 45 BC. It is useful when a design needs the conventional look people expect from placeholder copy. Turn it off when that repeated first line would be distracting in a set of cards or screenshots.\n\nHTML format wraps each paragraph in its own <p> element. This saves the manual step of adding paragraph tags after copying a multi-paragraph result. It does not add arbitrary classes or inline styling, so the pasted text inherits the styles of the destination page.',
      },
    ],
    faq: [
      {
        q: 'Can this generator make Korean dummy text?',
        a: 'Yes. Korean mode creates placeholder text from natural Korean sentences, then randomizes their order so it does not read as a connected article. It is intended for checking Hangul line wrapping, spacing and typography in Korean layouts.',
      },
      {
        q: 'Does character mode return an exact length?',
        a: 'Yes. Character mode returns exactly the requested 1–100 Unicode characters in the generated plain text, including spaces and punctuation. HTML paragraph tags are added only after that count when HTML format is selected.',
      },
      {
        q: 'Is Lorem Ipsum real Latin?',
        a: 'Lorem Ipsum is based on altered and rearranged Latin from Cicero’s 45 BC work De finibus bonorum et malorum, but the common placeholder version is not coherent Latin prose. It is meant to show text shape rather than communicate a message.',
      },
      {
        q: 'Does this tool upload or save generated text?',
        a: 'No. Generation happens in the browser and no text is uploaded. Your selected style, amount and format are saved only in this browser so the same setup is available after a refresh.',
      },
      {
        q: 'How do I get HTML placeholder paragraphs?',
        a: 'Choose HTML <p> under Copy format and copy the result. Every generated paragraph is wrapped in one p element, with a line break between elements, ready to paste into an HTML document or CMS source field.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '더미 텍스트 생성기 — 한글·로렘 입숨·HTML',
    description:
      '한글 더미 텍스트와 로렘 입숨을 문단·문장·단어·글자 수로 즉시 생성합니다. 결과를 바로 확인하고 일반 텍스트 또는 HTML로 복사하며 광고가 없습니다.',
    h1: '더미 텍스트 생성기',
    tagline: '한글 시안에는 자연스러운 한글 문장, 영문 시안에는 로렘 입숨을 바로 채웁니다.',
    name: '더미 텍스트',
    keywords: ['한글 더미 텍스트', '로렘 입숨 생성기', '더미 문장', '플레이스홀더 텍스트', 'lorem generator'],
    howTo: [
      '한글 또는 라틴 텍스트 스타일을 선택합니다.',
      '문단, 문장, 단어, 글자 수 중 기준을 고르고 1~100 사이의 수를 입력합니다.',
      '라틴 텍스트는 익숙한 첫 문장으로 시작할지 선택합니다.',
      '일반 텍스트 또는 HTML 문단 태그 형식을 고른 뒤 표시된 결과를 복사합니다.',
      '같은 분량의 다른 문장이 필요하면 “다른 내용 생성”을 누릅니다.',
    ],
    sections: [
      {
        heading: '한글 시안에는 한글 더미 텍스트를 씁니다',
        body: '로렘 입숨은 라틴어처럼 보이는 자리 채움 글이라 영문 인쇄물과 웹 시안에서 오래 쓰입니다. 하지만 한글은 글자 모양, 띄어쓰기, 줄바꿈 폭이 라틴 문자와 다릅니다. 한글 콘텐츠가 들어갈 화면에 라틴 텍스트만 넣으면 제목이 몇 줄이 되는지, 본문 여백이 어떤지, 카드 높이가 맞는지 실제와 다르게 보일 수 있습니다.\n\n한글 모드는 완결된 한국어 문장을 골라 순서를 섞습니다. 문장 하나는 자연스럽게 읽히지만 문단 전체의 이야기는 이어지지 않으므로, 읽을거리 대신 글자 폭과 리듬을 점검하는 데 알맞습니다. 한국어 앱·웹·문서 시안에는 한글 모드를, 영문 중심 시안에는 라틴 모드를 선택합니다.',
      },
      {
        heading: '필요한 분량을 바로 맞춥니다',
        body: '문단 기준은 긴 본문이나 상세 페이지를 채울 때 편리하며, 문단마다 3~5개의 문장이 들어갑니다. 문장 기준은 카드 설명, 알림, 목록을 시험할 때 적합합니다. 단어 기준은 짧은 라벨과 설명의 길이를 맞출 때 쓰며 요청한 수만큼 공백으로 나뉜 단어를 만듭니다. 글자 수 기준은 공백과 문장부호를 포함한 유니코드 글자를 정확히 요청한 수만큼 돌려줍니다.\n\n모든 기준은 1~100까지 지원합니다. 이 범위 안에서는 설정을 바꾸는 즉시 결과가 표시되어 생성 버튼을 먼저 누를 필요가 없습니다. HTML 형식을 골라도 통계는 태그를 붙이기 전의 본문을 기준으로 표시하므로, 실제로 채울 글의 분량을 확인할 수 있습니다.',
      },
      {
        heading: '로렘 입숨의 첫 문장과 HTML 형식',
        body: '라틴 모드의 익숙한 첫 문장은 “Lorem ipsum dolor sit amet”로 시작합니다. 이 문구는 기원전 45년에 쓰인 키케로의 『De finibus bonorum et malorum』과 관련된 라틴어 구절이 여러 차례 변형된 것입니다. 전통적인 시안처럼 보이게 하려면 켜 두고, 카드마다 같은 문구가 반복되는 것이 거슬리면 끕니다.\n\nHTML 형식을 선택하면 문단마다 <p> 태그를 하나씩 붙여 복사합니다. 여러 문단을 마크업에 넣을 때 태그를 따로 입력할 필요가 없고, 클래스나 인라인 스타일은 붙이지 않으므로 붙여 넣는 페이지의 기존 글꼴과 여백 규칙을 그대로 따릅니다.',
      },
    ],
    faq: [
      {
        q: '한글 더미 텍스트는 실제 문장인가요?',
        a: '한글 모드는 각각 자연스러운 한국어 문장으로 만들지만, 문장을 무작위로 이어 붙이므로 문단 전체의 주제나 이야기는 연결되지 않습니다. 한글 글꼴, 줄바꿈, 카드 높이를 점검하는 자리 채움용으로 사용합니다.',
      },
      {
        q: '글자 수를 정확히 맞출 수 있나요?',
        a: '가능합니다. 글자 수 기준은 공백과 문장부호를 포함한 유니코드 글자를 1~100자 범위에서 요청한 수만큼 생성합니다. HTML 형식의 p 태그는 본문 글자 수를 맞춘 뒤에만 추가됩니다.',
      },
      {
        q: '로렘 입숨은 실제 라틴어인가요?',
        a: '로렘 입숨은 키케로의 기원전 45년 라틴어 저작과 관련된 구절을 바꾸고 섞어 만든 자리 채움 글입니다. 일반적으로 쓰는 형태는 뜻이 이어지는 라틴어 문장이 아니므로 내용보다 레이아웃을 확인하는 데 사용합니다.',
      },
      {
        q: '생성한 더미 텍스트가 서버에 전송되나요?',
        a: '아니요. 텍스트 생성은 현재 브라우저에서 끝나며 서버에 전송하지 않습니다. 선택한 스타일, 분량, 복사 형식만 이 브라우저에 저장되어 새로고침 뒤에도 같은 설정을 이어서 사용할 수 있습니다.',
      },
      {
        q: 'HTML 문단 태그로 복사하려면 어떻게 하나요?',
        a: '복사 형식에서 “HTML <p>”를 고르고 결과를 복사합니다. 생성된 문단마다 p 태그가 하나씩 붙고 문단 사이에는 줄바꿈이 들어가므로 HTML 문서나 CMS의 소스 입력란에 바로 붙여 넣을 수 있습니다.',
      },
    ],
    ui: {
      outputLabel: '생성된 텍스트',
      regenerate: '다른 내용 생성',
      copy: '텍스트 복사',
      copied: '복사됨',
      localOnly: '이 브라우저에서 생성',
      languageLabel: '텍스트 스타일',
      latin: '라틴',
      korean: '한글',
      unitLabel: '생성 기준',
      paragraphs: '문단',
      sentences: '문장',
      words: '단어',
      characters: '글자 수',
      amountLabel: '생성 수',
      amountHint: '1~100까지 입력할 수 있으며 결과가 바로 바뀝니다.',
      amountPlaceholder: '3',
      classicOpening: '익숙한 첫 문장으로 시작',
      koreanHint: '한글 모드는 자연스러운 문장을 섞어 이야기 흐름 없이 만듭니다.',
      formatLabel: '복사 형식',
      plain: '일반 텍스트',
      html: 'HTML <p>',
      resultWords: '단어',
      resultCharacters: '글자 수',
      resultParagraphs: '문단',
    },
  },
};

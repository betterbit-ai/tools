import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Amount in KRW',
  inputHint: 'Paste digits, commas, ₩, or 원. Whole won only.',
  inputPlaceholder: 'e.g. 10,000,000',
  reset: 'Reset example',
  clear: 'Clear',
  autosaved: 'Saved only in this browser',
  resultsHeading: 'Copy a Korean amount format',
  resultsHint: 'Check the wording against the digits before signing a document.',
  plainLabel: 'Everyday Korean number',
  amountLabel: 'Full amount in Korean',
  geumLabel: 'Document form (금)',
  ilgeumLabel: 'Document form (일금)',
  copy: 'Copy',
  copied: 'Copied',
  errorEmpty: 'Enter an amount in whole won.',
  errorDecimal: 'Enter whole won only; decimals are not converted.',
  errorNegative: 'Enter zero or a positive amount.',
  errorInvalid: 'Use digits only. Commas, spaces, ₩, and 원 are accepted.',
  errorTooLarge: 'This amount is larger than the supported unit range.',
  notice:
    'This is a writing aid, not legal advice. Compare the copied Hangul with the numeric amount before finalizing a document.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Korean Number Converter — Contract-Ready Won Words',
    description:
      'Convert a KRW amount into Korean words and copy plain, 금, or 일금 … 원정 contract wording instantly. Full-width digits and pasted commas work locally in your browser.',
    h1: 'Korean Number Converter',
    tagline:
      'Turn a won amount into plain Korean and document-ready 금 or 일금 … 원정 wording, then copy the exact form you need.',
    name: 'Korean Number Converter',
    keywords: ['Korean number converter', 'Korean won in words', 'amount in Korean', '일금 원정', '금액 한글 변환'],
    howTo: [
      'Enter or paste a non-negative whole-won amount; commas, ₩, 원, and full-width digits are accepted.',
      'Review the everyday Korean reading and full amount spelling.',
      'Choose 금 or 일금 … 원정 when a document asks for a formal amount line.',
      'Copy the selected result and compare it with the digits once more before signing.',
    ],
    sections: [
      {
        heading: 'Korean large numbers group four digits at a time',
        body: 'Korean Sino-number amounts use four-digit steps, not the English three-digit word sequence. 만 is 10,000, 억 is 100,000,000, and 조 is 1,000,000,000,000. For example, 12,345,678 is read as 천이백삼십사만오천육백칠십팔: first split the digits as 1234 | 5678, then attach 만 to the left group. This converter keeps the digits exact with BigInt rather than JavaScript floating-point numbers, including values beyond the safe integer limit.',
      },
      {
        heading: 'Why document amounts may use 금 or 일금 … 원정',
        body: 'Korean contracts, quotes, receipts, and promissory documents often show a numeric amount together with a Hangul amount. A formal line commonly begins with 금 or 일금 and ends with 원정, such as 일금 일천이백오십만원정. In this tool, document forms retain 일 before 십, 백, 천, and 만 so the wording is explicit. Actual house styles differ, so use the form your organization requests and check both versions before final approval.',
      },
    ],
    faq: [
      {
        q: 'How do I write 10,000,000 won in Korean?',
        a: 'The everyday Korean number is 천만, while this tool’s explicit document amount is 일천만원. Its full formal result is 일금 일천만원정, with 금 or 일금 at the start and 원정 at the end.',
      },
      {
        q: 'Why does Korean use 만 instead of a thousand or million word?',
        a: 'Korean amount words add major units every 4 digits: 만 is 10,000, 억 is 100,000,000, and 조 is 1,000,000,000,000. That makes 1,000,000 백만, literally one hundred ten-thousands.',
      },
      {
        q: 'Can I paste a won sign, commas, or full-width digits?',
        a: 'Yes. The converter accepts ordinary digits, full-width digits such as １２３, commas, spaces, ₩, and a trailing 원. It accepts only non-negative whole-won amounts and rejects fractions rather than silently rounding them.',
      },
      {
        q: 'Does this Korean amount converter provide legal advice?',
        a: 'No. It creates copyable Korean amount text only. Compare every copied Hangul amount with the numeric amount and follow the form, spacing, and review process required by the specific contract or organization.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '숫자 한글 변환 — 일금·금액 한글 표기',
    description:
      '숫자 금액을 한글과 계약서용 일금 ○○원정·금 ○○원정으로 바로 변환해 복사합니다. 쉼표, 원, ₩, 전각 숫자를 입력해도 브라우저에서만 처리합니다.',
    h1: '숫자 한글 변환',
    tagline: '금액을 한글 수사와 계약서용 일금·금 ○○원정으로 즉시 바꾸고, 필요한 표기만 바로 복사합니다.',
    name: '숫자 한글 변환',
    keywords: ['금액 한글 변환', '한글 금액 표기', '일금 원정', '계약서 금액 한글', '숫자 한글로'],
    howTo: [
      '금액 칸에 0 이상 원 단위 정수를 입력하거나 붙여넣습니다. 쉼표, ₩, 원, 전각 숫자도 입력할 수 있습니다.',
      '일상 한글 수사와 원을 붙인 한글 금액을 확인합니다.',
      '계약서·견적서 등에 필요한 “금” 또는 “일금” 표기를 고릅니다.',
      '복사한 뒤 숫자 금액과 한글 금액이 같은지 다시 확인합니다.',
    ],
    sections: [
      {
        heading: '한글 금액은 네 자리마다 만·억·조 단위로 읽습니다',
        body: '한글 금액은 영어처럼 3자리마다 단어가 바뀌지 않고 4자리마다 큰 단위가 붙습니다. 만은 10,000, 억은 100,000,000, 조는 1,000,000,000,000입니다. 예를 들어 12,345,678은 1234 | 5678로 나눠 천이백삼십사만오천육백칠십팔로 읽습니다. 이 도구는 자바스크립트의 안전한 정수 범위를 넘는 큰 금액도 BigInt로 처리해 숫자 자리수를 잃지 않습니다.',
      },
      {
        heading: '일금·금 ○○원정 표기는 문서 양식에 맞춰 확인합니다',
        body: '계약서, 견적서, 영수증처럼 금액을 명확히 적어야 하는 문서에는 숫자와 한글 금액을 함께 쓰기도 합니다. 이 도구는 “금 일백이십만원정”과 “일금 일백이십만원정” 두 가지 복사용 표기를 제공합니다. 문서 표기에서는 일십·일백·일천·일만처럼 앞의 “일”을 남겨 더 명확하게 표시합니다. 다만 띄어쓰기와 금·일금 사용 방식은 기관·거래처 양식이 우선이므로, 서명 전에는 숫자 금액과 결과를 반드시 대조해야 합니다.',
      },
    ],
    faq: [
      {
        q: '1,000만원은 한글로 어떻게 쓰나요?',
        a: '일상적인 한글 수사는 천만이고, 이 도구의 문서용 금액 표기는 일천만원입니다. “일금 일천만원정”은 앞에 일금을, 뒤에 원정을 붙인 복사용 예시입니다.',
      },
      {
        q: '한글 금액에서 만·억·조는 얼마인가요?',
        a: '만은 10,000원, 억은 100,000,000원, 조는 1,000,000,000,000원 단위입니다. 따라서 100만원은 백만, 1억원은 일억으로 씁니다.',
      },
      {
        q: '쉼표나 원 기호가 있는 금액도 변환되나요?',
        a: '네. 1,234,567원, ₩1,234,567, １２３４５６７처럼 쉼표, 공백, ₩, 원, 전각 숫자가 섞인 입력을 변환합니다. 소수점·음수는 임의로 반올림하지 않기 위해 변환하지 않습니다.',
      },
      {
        q: '일금 ○○원정 표기를 그대로 계약서에 써도 되나요?',
        a: '이 도구는 한글 금액 작성 보조 도구이며 법률 자문이나 문서 효력을 보장하지 않습니다. 계약서에는 숫자 금액과 한글 금액이 일치하는지 확인하고, 거래처나 기관이 정한 양식을 우선해야 합니다.',
      },
    ],
    ui: {
      inputLabel: '금액 (원)',
      inputHint: '쉼표, ₩, 원, 전각 숫자를 입력할 수 있습니다. 원 단위 정수만 변환합니다.',
      inputPlaceholder: '예: 10,000,000',
      reset: '예시로 초기화',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      resultsHeading: '한글 금액 표기 복사',
      resultsHint: '문서에 넣기 전 숫자 금액과 한글 표기를 한 번 더 대조합니다.',
      plainLabel: '일상 한글 수사',
      amountLabel: '원을 붙인 한글 금액',
      geumLabel: '문서 표기 (금)',
      ilgeumLabel: '문서 표기 (일금)',
      copy: '복사',
      copied: '복사됨',
      errorEmpty: '원 단위 금액을 입력합니다.',
      errorDecimal: '소수점 이하 없이 원 단위 정수만 입력합니다.',
      errorNegative: '0 이상 금액을 입력합니다.',
      errorInvalid: '숫자만 입력합니다. 쉼표, 공백, ₩, 원은 함께 입력할 수 있습니다.',
      errorTooLarge: '지원하는 한글 큰 단위 범위를 넘는 금액입니다.',
      notice:
        '이 도구는 표기 작성 보조용이며 법률 자문이 아닙니다. 문서를 확정하기 전에 복사한 한글 금액과 숫자 금액을 반드시 대조합니다.',
    },
  },
};

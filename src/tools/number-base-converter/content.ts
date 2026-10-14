import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Number to convert',
  inputHint: 'Whole numbers only. Spaces and underscores are allowed; 0b, 0o and 0x prefixes match bases 2, 8 and 16.',
  fromBaseLabel: 'Input base',
  targetBaseLabel: 'Extra result base',
  baseLabel: 'Base',
  liveTitle: 'Updates as you type',
  liveHint: 'The standard four bases and your extra base appear together.',
  reset: 'Reset example',
  autosaved: 'Saved in this browser',
  resultsTitle: 'All representations',
  resultsHint: 'Spaces make groups easier to scan; Copy uses the unspaced value.',
  binaryLabel: 'Binary (base 2)',
  octalLabel: 'Octal (base 8)',
  decimalLabel: 'Decimal (base 10)',
  hexadecimalLabel: 'Hexadecimal (base 16)',
  customResultLabel: 'Base',
  copy: 'Copy',
  copied: 'Copied',
  errorEmpty: 'Enter a whole number to convert.',
  errorMissingDigits: 'Enter at least one digit after the sign or prefix.',
  errorTooLong: 'Use 10,000 digits or fewer.',
  errorInvalidCharacter: '“{character}” is not an ASCII digit or letter. Use 0–9 and A–Z only.',
  errorInvalidDigit: '“{character}” is not available in the selected input base.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Binary to Decimal Converter — Bases 2–36, Live Results',
    description:
      'Convert binary, octal, decimal, hexadecimal, or any whole-number base from 2 to 36. Exact BigInt results appear live in binary, octal, decimal and hex together.',
    h1: 'Number Base Converter',
    tagline:
      'Convert any whole number from base 2 to 36, with binary, octal, decimal and hexadecimal visible together.',
    name: 'Number Base Converter',
    keywords: [
      'binary to decimal',
      'decimal to binary',
      'number base converter',
      'base converter',
      'hex to decimal',
      'hexadecimal converter',
      'octal to decimal',
      'base 36 converter',
    ],
    howTo: [
      'Enter a whole number, then choose the base it is currently written in.',
      'Read the live binary, octal, decimal and hexadecimal representations together.',
      'Choose any base from 2 through 36 for one additional representation.',
      'Copy any ungrouped result for code, a worksheet or a spreadsheet.',
    ],
    sections: [
      {
        heading: 'What a base means',
        body: 'A positional number system uses powers of its base. Decimal uses digits 0–9 and powers of 10; binary uses 0 and 1 with powers of 2. For example, 101101₂ is 1×2⁵ + 0×2⁴ + 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 45₁₀. Hexadecimal uses 0–9 and A–F, so FF₁₆ is 15×16 + 15 = 255₁₀.',
      },
      {
        heading: 'Exact integers, not floating-point approximations',
        body: 'This converter handles whole numbers with JavaScript BigInt rather than a JavaScript Number. A Number cannot represent every integer above 2⁵³−1 (9,007,199,254,740,991) exactly; BigInt keeps every digit exact. To keep the browser responsive, one entry is limited to 10,000 digits. Results use uppercase A–Z for digit values 10–35, which is the conventional notation for bases through 36.',
      },
      {
        heading: 'Input rules',
        body: 'Spaces and underscores are accepted as visual separators, so 1111 1111 and 1111_1111 are both valid binary input. A leading minus sign is supported. Standard prefixes also work when they match the selected base: 0b for binary, 0o for octal and 0x for hexadecimal. The converter deliberately rejects non-ASCII lookalike digits and invalid characters instead of removing them, because silently changing a pasted value can hide an error.',
      },
    ],
    faq: [
      {
        q: 'How do I convert binary to decimal?',
        a: 'Multiply each binary digit by its matching power of 2 and add the results. For example, 101101₂ = 1×2⁵ + 1×2³ + 1×2² + 1×2⁰ = 45₁₀; this converter performs that expansion exactly for up to 10,000 input digits.',
      },
      {
        q: 'What is 11111111 in decimal?',
        a: '11111111₂ equals 255₁₀. Its eight set bits add 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1, and it is the largest unsigned value that fits in 8 bits.',
      },
      {
        q: 'Can I convert hexadecimal to binary?',
        a: 'Yes. Choose base 16 as the input base and enter the hexadecimal value. Each hexadecimal digit corresponds to exactly 4 binary digits, so FF₁₆ becomes 11111111₂.',
      },
      {
        q: 'What bases does this converter support?',
        a: 'This converter accepts whole-number bases from 2 through 36. Bases above 10 use A through Z for digit values 10 through 35, and it always shows bases 2, 8, 10 and 16 alongside your selected extra base.',
      },
      {
        q: 'Why is a very large number different in another calculator?',
        a: 'Some calculators use floating-point numbers, which cannot represent every integer above 9,007,199,254,740,991 exactly. This converter uses BigInt for whole-number input, so values up to 10,000 digits are converted without that rounding limit.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '진법 변환기 — 2진수·10진수·16진수, 2~36진법',
    description:
      '2진수, 8진수, 10진수, 16진수와 2~36진법 정수를 입력 즉시 변환합니다. BigInt로 큰 수도 정확하게 계산하고 네 가지 표기를 한 화면에 보여줍니다.',
    h1: '진법 변환기',
    tagline: '2~36진법 정수를 변환하고 2진수·8진수·10진수·16진수를 한 화면에서 바로 확인하세요.',
    name: '진법 변환기',
    keywords: [
      '진법 변환',
      '2진수 10진수 변환',
      '10진수 2진수 변환',
      '16진수 변환',
      '16진수 10진수 변환',
      '2진수 변환기',
      'n진법 변환',
    ],
    howTo: [
      '변환할 정수를 입력하고 현재 표기된 진법을 선택하세요.',
      '2진수, 8진수, 10진수, 16진수 결과를 입력 즉시 함께 확인하세요.',
      '2진법부터 36진법 중 하나를 골라 추가 결과도 확인하세요.',
      '필요한 결과를 공백 없는 값으로 복사해 코드, 과제 또는 문서에 붙여 넣으세요.',
    ],
    sections: [
      {
        heading: '진법과 자릿값',
        body: '진법은 각 자리에 밑수의 거듭제곱을 곱해 값을 만드는 위치 기수법입니다. 10진법은 0~9와 10의 거듭제곱을, 2진법은 0과 1, 2의 거듭제곱을 씁니다. 예를 들어 101101₂은 1×2⁵ + 0×2⁴ + 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 45₁₀입니다. 16진수 FF₁₆은 15×16 + 15이므로 255₁₀입니다.',
      },
      {
        heading: '큰 정수도 정확하게 변환',
        body: '이 도구는 자바스크립트 Number 대신 BigInt로 정수를 계산합니다. Number는 2⁵³−1(9,007,199,254,740,991)을 넘으면 모든 정수를 정확히 나타낼 수 없지만, BigInt는 입력 자릿수를 그대로 보존합니다. 브라우저 응답성을 위해 한 번에 10,000자리까지만 입력할 수 있습니다. 11진법 이상에서는 10~35를 A~Z 대문자로 표기합니다.',
      },
      {
        heading: '입력 규칙',
        body: '읽기 쉽게 넣은 공백과 밑줄은 무시하므로 1111 1111과 1111_1111은 모두 같은 2진수입니다. 앞의 마이너스 기호도 사용할 수 있습니다. 선택한 진법과 맞으면 2진수 0b, 8진수 0o, 16진수 0x 접두사도 인식합니다. 붙여 넣은 값이 조용히 달라지지 않도록 전각 숫자나 한글, 허용되지 않는 문자는 자동으로 지우지 않고 오류로 알려줍니다.',
      },
    ],
    faq: [
      {
        q: '2진수를 10진수로 어떻게 바꾸나요?',
        a: '각 2진수 자리에 해당하는 2의 거듭제곱을 곱해 더합니다. 예를 들어 101101₂은 1×2⁵ + 1×2³ + 1×2² + 1×2⁰ = 45₁₀이며, 이 도구는 최대 10,000자리까지 정확히 계산합니다.',
      },
      {
        q: '2진수 11111111은 10진수로 얼마인가요?',
        a: '11111111₂은 255₁₀입니다. 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1을 더한 값이며, 부호 없는 8비트가 표현할 수 있는 최댓값입니다.',
      },
      {
        q: '16진수를 2진수로 바꿀 수 있나요?',
        a: '네. 입력 진법에서 16진법을 선택하면 됩니다. 16진수 한 자리는 정확히 2진수 4자리에 대응하므로 FF₁₆은 11111111₂입니다.',
      },
      {
        q: '몇 진법까지 지원하나요?',
        a: '이 도구는 2진법부터 36진법까지의 정수를 지원합니다. 11진법 이상은 10~35를 A~Z로 표기하며, 선택한 추가 진법과 함께 2진수·8진수·10진수·16진수를 항상 보여줍니다.',
      },
      {
        q: '다른 계산기와 큰 수 결과가 다른 이유는 무엇인가요?',
        a: '일부 계산기는 9,007,199,254,740,991보다 큰 정수를 모두 정확히 표현할 수 없는 부동소수점 값을 사용합니다. 이 도구는 정수 입력에 BigInt를 사용하므로 최대 10,000자리까지 반올림 없이 변환합니다.',
      },
    ],
    ui: {
      inputLabel: '변환할 수',
      inputHint:
        '정수만 입력할 수 있습니다. 공백과 밑줄을 쓸 수 있고, 2·8·16진법에서는 각각 0b·0o·0x 접두사도 인식합니다.',
      fromBaseLabel: '입력 진법',
      targetBaseLabel: '추가 결과 진법',
      baseLabel: '진법',
      liveTitle: '입력 즉시 변환',
      liveHint: '기본 네 진법과 선택한 추가 진법을 한 번에 보여줍니다.',
      reset: '예시로 초기화',
      autosaved: '이 브라우저에 자동 저장됨',
      resultsTitle: '모든 표기',
      resultsHint: '공백은 읽기 편하도록 넣습니다. 복사하면 공백 없는 값이 복사됩니다.',
      binaryLabel: '2진수 (base 2)',
      octalLabel: '8진수 (base 8)',
      decimalLabel: '10진수 (base 10)',
      hexadecimalLabel: '16진수 (base 16)',
      customResultLabel: '진법',
      copy: '복사',
      copied: '복사됨',
      errorEmpty: '변환할 정수를 입력하세요.',
      errorMissingDigits: '부호나 접두사 뒤에 숫자를 하나 이상 입력하세요.',
      errorTooLong: '10,000자리 이하로 입력하세요.',
      errorInvalidCharacter: '“{character}”은(는) ASCII 숫자나 영문자가 아닙니다. 0~9와 A~Z만 사용하세요.',
      errorInvalidDigit: '“{character}”은(는) 선택한 입력 진법에서 쓸 수 없는 숫자입니다.',
    },
  },
};

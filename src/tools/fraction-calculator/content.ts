import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Exact fraction arithmetic updates as you type — no calculate button, no ads.',
  autosaved: 'Saved in this browser',
  firstLabel: 'First number',
  secondLabel: 'Second number',
  inputHint: 'Use 3/4, 1 2/3, -5, or 0.125',
  operationLabel: 'Operation',
  add: 'Add',
  subtract: 'Subtract',
  multiply: 'Multiply',
  divide: 'Divide',
  resultHeading: 'Answer',
  simplifiedLabel: 'Simplified fraction',
  mixedLabel: 'Mixed number',
  decimalLabel: 'Decimal',
  decimalHint: '… means the decimal continues',
  workHeading: 'Working',
  commonDenominator: 'Use the least common denominator {denominator}: {first} {operator} {second}',
  combine: '{first} {operator} {second} = {raw}',
  multiplyStep: 'Multiply across: {first} × {second} = {raw}',
  divideStep: 'Turn division into multiplication by the reciprocal: {first} ÷ {second} = {first} × {reciprocal}',
  simplifyStep: 'Reduce {raw} by the greatest common divisor to get {result}',
  alreadySimplified: '{result} is already in simplest form',
  inputEmpty: 'Enter a number in each field.',
  inputInvalid: 'Use an integer, finite decimal, fraction, or mixed number.',
  inputZeroDenominator: 'A fraction cannot have 0 as its denominator.',
  inputTooLarge: 'Enter no more than 1,000 digits.',
  divideByZero: 'Division by zero has no mathematical result. Change the second number.',
  copy: 'Copy answer',
  copied: 'Copied',
  privacyNotice:
    'Calculated exactly in your browser. Your inputs are saved only on this device and are never sent to a server.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Fraction Calculator — Exact Answers with Working',
    description:
      'Add, subtract, multiply, and divide fractions, mixed numbers, and decimals exactly. See the simplified answer and clear working instantly — no ads.',
    h1: 'Fraction Calculator',
    tagline:
      'Type fractions naturally and see an exact answer, mixed number, decimal, and the working immediately — no button, no ads.',
    name: 'Fraction Calculator',
    keywords: [
      'fraction calculator',
      'add fractions',
      'subtract fractions',
      'multiply fractions',
      'divide fractions',
      'mixed number calculator',
      'fraction calculator with steps',
    ],
    howTo: [
      'Type the first value as a fraction such as 3/4, a mixed number such as 1 2/3, an integer, or a finite decimal.',
      'Choose add, subtract, multiply, or divide.',
      'Type the second value in the same format.',
      'Read the simplified fraction, mixed-number form, decimal form, and operation-specific working as they update.',
      'Use Copy answer to paste the exact result and working into your notes.',
    ],
    sections: [
      {
        heading: 'Why addition and subtraction need a common denominator',
        body: 'Fractions can be added or subtracted only after their parts have the same size. This calculator uses the least common denominator (LCD), the least common multiple of the two denominators, rather than simply multiplying them. For 1/6 + 1/4, the LCD is 12: 1/6 becomes 2/12 and 1/4 becomes 3/12, so the answer is 5/12. Using 24 would still work, but it creates 4/24 + 6/24 and requires an extra reduction step.',
      },
      {
        heading: 'Multiplication, division, and exact results',
        body: 'To multiply fractions, multiply numerators together and denominators together, then reduce the result. To divide by a fraction, multiply by its reciprocal: 5/6 ÷ 2/3 becomes 5/6 × 3/2 = 15/12 = 5/4. The calculation stays as whole-number numerator and denominator arithmetic throughout, so values such as 1/3 are never rounded to an inexact decimal before calculating. Dividing by 0 has no mathematical result, including dividing by a fraction whose numerator is 0.',
      },
      {
        heading: 'Fractions, mixed numbers, and decimals',
        body: 'An improper fraction and a mixed number express the same value: 13/6 is 2 1/6 because 13 ÷ 6 leaves a remainder of 1. A terminating decimal can be converted exactly: 0.125 = 125/1000 = 1/8. Some fractions do not terminate as decimals; 1/3 is 0.333… because the remainder repeats. This tool shows up to 12 decimal digits and adds an ellipsis when more digits continue, while the displayed fraction remains exact.',
      },
    ],
    faq: [
      {
        q: 'How do I enter a mixed number?',
        a: 'Enter a mixed number with a space between the whole number and fraction, such as 2 3/4. A leading minus sign applies to the entire mixed number, so -2 3/4 means negative 11/4, not negative 5/4.',
      },
      {
        q: 'How do you add fractions with different denominators?',
        a: 'Find a common denominator, rewrite both fractions with that denominator, and then add the numerators. For example, 1/2 + 1/3 becomes 3/6 + 2/6 = 5/6. This calculator uses the least common denominator and shows the rewritten fractions in the working.',
      },
      {
        q: 'Why does dividing by a fraction mean multiplying by its reciprocal?',
        a: 'Dividing by a fraction asks how many of that fraction fit into a value, which is equivalent to multiplying by the fraction turned upside down. For example, 5/6 ÷ 2/3 = 5/6 × 3/2 = 5/4.',
      },
      {
        q: 'Can this calculator use decimals?',
        a: 'Yes. Finite decimals such as 0.125 are converted exactly to fractions before calculation, so 0.125 is treated as 1/8 rather than as a rounded approximation. Repeating-decimal notation such as 0.(3) is not an input format.',
      },
      {
        q: 'Are my fraction calculations sent to a server?',
        a: 'No. Every calculation is performed locally in your browser using exact integer arithmetic. Inputs are saved only in this browser so they remain after refresh, and they are never sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '분수 계산기 — 풀이 과정과 기약분수 바로 보기',
    description:
      '분수·대분수·유한소수의 덧셈, 뺄셈, 곱셈, 나눗셈을 정확하게 계산합니다. 기약분수와 풀이 과정을 입력 즉시 확인하며 광고가 없습니다.',
    h1: '분수 계산기',
    tagline:
      '분수와 대분수를 자연스럽게 입력하면 기약분수, 대분수, 소수, 풀이 과정을 바로 보여줍니다 — 버튼과 광고가 없습니다.',
    name: '분수 계산기',
    keywords: [
      '분수 계산기',
      '분수 더하기',
      '분수 빼기',
      '분수 곱하기',
      '분수 나누기',
      '대분수 계산기',
      '분수 계산 풀이 과정',
    ],
    howTo: [
      '첫 번째 수에 3/4 같은 분수, 1 2/3 같은 대분수, 정수 또는 유한소수를 입력합니다.',
      '더하기, 빼기, 곱하기, 나누기 중 하나를 고릅니다.',
      '두 번째 수도 같은 형식으로 입력합니다.',
      '입력 즉시 갱신되는 기약분수, 대분수, 소수와 연산별 풀이 과정을 확인합니다.',
      '답 복사를 누르면 정확한 결과와 풀이를 노트나 과제에 붙여 넣을 수 있습니다.',
    ],
    sections: [
      {
        heading: '분수 덧셈·뺄셈은 최소공배수로 통분합니다',
        body: '분수는 조각의 크기인 분모가 같아야 더하거나 뺄 수 있습니다. 이 계산기는 두 분모의 최소공배수, 즉 최소공통분모를 사용합니다. 예를 들어 1/6 + 1/4에서 최소공배수는 12이므로 1/6은 2/12, 1/4는 3/12가 되어 답은 5/12입니다. 분모를 무조건 곱해 24로 통분해도 답은 같지만 4/24 + 6/24처럼 한 번 더 약분해야 합니다.',
      },
      {
        heading: '곱셈·나눗셈은 끝까지 분수로 계산합니다',
        body: '분수 곱셈은 분자끼리와 분모끼리 각각 곱한 뒤 약분합니다. 나눗셈은 두 번째 분수를 뒤집어 곱셈으로 바꿉니다. 5/6 ÷ 2/3은 5/6 × 3/2 = 15/12 = 5/4입니다. 이 계산기는 중간에 소수로 반올림하지 않고 정수 분자와 분모로 끝까지 계산하므로 1/3 같은 값도 오차 없이 처리합니다. 0으로 나누기와 분자가 0인 분수로 나누기는 정의되지 않습니다.',
      },
      {
        heading: '가분수·대분수·소수는 같은 값을 다른 방식으로 나타냅니다',
        body: '13/6은 13을 6으로 나눈 몫이 2이고 나머지가 1이므로 대분수 2 1/6과 같은 값입니다. 유한소수는 분수로 정확히 바꿀 수 있어 0.125는 125/1000, 즉 1/8입니다. 반면 1/3은 0.333…처럼 끝없이 반복됩니다. 이 도구는 소수를 최대 12자리까지 보여 주고 더 이어지면 …로 표시하지만, 기약분수 결과는 항상 정확한 값으로 남습니다.',
      },
    ],
    faq: [
      {
        q: '대분수는 어떻게 입력하나요?',
        a: '대분수는 자연수와 분수 사이를 한 칸 띄워 2 3/4처럼 입력합니다. 맨 앞의 음수 기호는 대분수 전체에 적용되므로 -2 3/4는 -11/4를 뜻합니다.',
      },
      {
        q: '분모가 다른 분수는 어떻게 더하나요?',
        a: '두 분모의 공통분모를 구해 두 분수를 같은 분모로 바꾼 뒤 분자끼리 더합니다. 예를 들어 1/2 + 1/3은 3/6 + 2/6 = 5/6이며, 이 계산기는 최소공배수로 통분한 식을 풀이에 보여줍니다.',
      },
      {
        q: '분수 나눗셈에서 왜 역수를 곱하나요?',
        a: '분수로 나누기는 그 분수가 몇 번 들어가는지 구하는 일이므로 두 번째 분수를 뒤집어 곱하는 것과 같습니다. 예를 들어 5/6 ÷ 2/3은 5/6 × 3/2 = 5/4입니다.',
      },
      {
        q: '소수도 분수 계산기에 입력할 수 있나요?',
        a: '네. 0.125 같은 유한소수는 계산 전에 1/8로 정확하게 바뀌므로 반올림 오차가 생기지 않습니다. 0.(3)처럼 순환마디를 표시하는 입력은 지원하지 않습니다.',
      },
      {
        q: '입력한 분수는 서버로 전송되나요?',
        a: '아니요. 모든 계산은 브라우저 안에서 정확한 정수 연산으로 처리됩니다. 입력값은 새로고침 뒤에도 남도록 이 브라우저에만 저장되며 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '정확한 분수 계산이 입력하는 즉시 갱신됩니다 — 계산 버튼도, 광고도 없습니다.',
      autosaved: '이 브라우저에 저장됨',
      firstLabel: '첫 번째 수',
      secondLabel: '두 번째 수',
      inputHint: '3/4, 1 2/3, -5, 0.125처럼 입력',
      operationLabel: '연산',
      add: '더하기',
      subtract: '빼기',
      multiply: '곱하기',
      divide: '나누기',
      resultHeading: '답',
      simplifiedLabel: '기약분수',
      mixedLabel: '대분수',
      decimalLabel: '소수',
      decimalHint: '…는 소수가 계속됨을 뜻합니다',
      workHeading: '풀이 과정',
      commonDenominator: '최소공배수 {denominator}로 통분: {first} {operator} {second}',
      combine: '{first} {operator} {second} = {raw}',
      multiplyStep: '분자끼리·분모끼리 곱하기: {first} × {second} = {raw}',
      divideStep: '나눗셈을 역수의 곱으로 바꾸기: {first} ÷ {second} = {first} × {reciprocal}',
      simplifyStep: '{raw}을(를) 최대공약수로 약분하면 {result}',
      alreadySimplified: '{result}은(는) 이미 기약분수입니다',
      inputEmpty: '두 칸에 모두 수를 입력하세요.',
      inputInvalid: '정수, 유한소수, 분수 또는 대분수 형식으로 입력하세요.',
      inputZeroDenominator: '분모에는 0을 입력할 수 없습니다.',
      inputTooLarge: '숫자는 1,000자리 이하로 입력하세요.',
      divideByZero: '0으로 나누기는 정의되지 않습니다. 두 번째 수를 바꾸세요.',
      copy: '답 복사',
      copied: '복사됨',
      privacyNotice: '브라우저 안에서 정확하게 계산합니다. 입력값은 이 기기에만 저장되며 서버로 전송되지 않습니다.',
    },
  },
};

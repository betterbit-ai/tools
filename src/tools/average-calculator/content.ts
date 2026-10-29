import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  defaultValues: '72, 85, 90, 76, 88, 90',
  inputLabel: 'Numbers to analyze',
  inputHint: 'Paste a spreadsheet column, or separate values with commas, spaces, semicolons, or line breaks.',
  inputPlaceholder: '72, 85, 90, 76, 88',
  example: 'Use example',
  clear: 'Clear',
  autosaved: 'Saved in this browser',
  invalidValues: '{n} item(s) could not be read and were not included. Check decimals and separators.',
  deviationLabel: 'Standard deviation',
  deviationHint: 'Choose whether these values are a sample or the whole population.',
  sample: 'Sample (n − 1)',
  population: 'Population (n)',
  resultsHeading: 'Results',
  copy: 'Copy results',
  copied: 'Copied',
  emptyInput: 'Enter at least one finite number to see the statistics.',
  mean: 'Mean',
  median: 'Median',
  mode: 'Mode',
  noMode: 'No mode',
  standardDeviation: 'Std. deviation',
  count: 'Count',
  sum: 'Sum',
  min: 'Minimum',
  max: 'Maximum',
  range: 'Range',
  variance: 'Variance',
  sampleFormula: 'Mean = sum ÷ n · sample variance = Σ(x − mean)² ÷ (n − 1)',
  populationFormula: 'Mean = sum ÷ n · population variance = Σ(x − mean)² ÷ n',
  copySummary:
    'Mean: {mean}\nMedian: {median}\nMode: {mode}\nStandard deviation: {standardDeviation}\nCount: {count}\nSum: {sum}',
  privacyNotice: 'Your numbers are calculated in this browser and are never sent to a server.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Average Calculator — Mean, Median, Mode & SD',
    description:
      'Paste numbers to calculate the mean, median, mode, range, and sample or population standard deviation together. Results update instantly in your browser.',
    h1: 'Average Calculator',
    tagline:
      'Paste a list once to see its average, middle, most common value, and spread — with the sample or population choice visible.',
    name: 'Average Calculator',
    keywords: [
      'average calculator',
      'mean calculator',
      'median calculator',
      'mode calculator',
      'standard deviation calculator',
      'sample standard deviation calculator',
      'population standard deviation calculator',
    ],
    howTo: [
      'Paste or type numbers in the input box, separating values with commas, spaces, semicolons, or line breaks.',
      'Choose Sample (n − 1) for observations drawn from a larger group, or Population (n) for the entire group.',
      'Read the mean, median, mode, standard deviation, and the supporting summary statistics as they update.',
      'Use Copy results to put the main figures into a report or spreadsheet.',
    ],
    sections: [
      {
        heading: 'Mean, median, and mode answer different questions',
        body: 'The arithmetic mean is the sum of all values divided by their count: mean = Σx ÷ n. It is useful when every observation has equal weight, but a single extreme value can pull it away from what is typical. The median is the middle value after sorting; for an even count, it is the average of the two middle values. The mode is the value or values occurring most often. For 1, 2, 2, 9, the mean is 3.5 while both the median and mode are 2. Looking at all three prevents an unusually high or low observation from being hidden behind one average.',
      },
      {
        heading: 'Choose sample or population standard deviation deliberately',
        body: 'Standard deviation measures typical distance from the mean. Use population standard deviation when the list is every member of the group you care about; its variance divides by n. Use sample standard deviation when the list is a sample intended to represent a larger population; its variance divides by n − 1. That n − 1 adjustment, often called Bessel’s correction, makes the sample estimate less systematically small. A one-value sample has no sample standard deviation because n − 1 is zero, while its population standard deviation is 0.',
      },
      {
        heading: 'Pasting data and reading the other results',
        body: 'This calculator accepts decimal numbers, negative values, and scientific notation such as 1e3. A column copied from a spreadsheet can be pasted directly because line breaks and tabs are separators. The range is maximum minus minimum, and variance is the square of standard deviation, so variance is expressed in squared units. Zero is a valid value and is included in the count. Text, emoji, Infinity, and malformed numbers are identified and left out rather than silently being treated as zero; check the notice before using the result.',
      },
    ],
    faq: [
      {
        q: 'How do you calculate an average?',
        a: 'An arithmetic average, also called the mean, is calculated by adding every value and dividing by the number of values: mean = Σx ÷ n. For 72, 85, and 90, the sum is 247 and the average is 247 ÷ 3 = 82.3333.',
      },
      {
        q: 'What is the difference between sample and population standard deviation?',
        a: 'Population standard deviation divides the squared distances from the mean by n because it describes the full group. Sample standard deviation divides by n − 1 because it estimates a larger group from a sample, so it is usually slightly larger for the same list.',
      },
      {
        q: 'Can a list have more than one mode?',
        a: 'Yes. A list can have multiple modes when several values tie for the highest frequency. For 1, 2, 2, 3, 3, 9, both 2 and 3 are modes; if every value occurs once, there is no mode.',
      },
      {
        q: 'Does this average calculator include zero?',
        a: 'Yes. Zero is a numeric observation, so it is included in the count, sum, mean, median, and standard deviation. Empty separators are ignored, but a typed 0 is never treated as an empty value.',
      },
      {
        q: 'Are my numbers uploaded anywhere?',
        a: 'No. The parsing and calculation run in JavaScript in your browser. The input is saved only in this browser so it can remain after a refresh; it is not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '평균 계산기 — 중앙값·최빈값·표준편차',
    description:
      '숫자 목록을 붙여넣어 평균, 중앙값, 최빈값, 범위와 표본·모집단 표준편차를 한 번에 계산합니다. 결과는 브라우저에서 바로 바뀝니다.',
    h1: '평균 계산기',
    tagline:
      '숫자 목록을 한 번 넣으면 평균과 가운데 값, 가장 많은 값, 흩어진 정도를 표본·모집단 기준까지 함께 확인합니다.',
    name: '평균 계산기',
    keywords: [
      '평균 계산기',
      '산술평균 계산기',
      '중앙값 계산기',
      '최빈값 계산기',
      '표준편차 계산기',
      '표본 표준편차',
      '모집단 표준편차',
    ],
    howTo: [
      '숫자 입력란에 값을 붙여넣거나 입력하고 쉼표, 공백, 세미콜론, 줄바꿈으로 구분합니다.',
      '더 큰 집단에서 뽑은 자료라면 표본(n − 1)을, 조사 대상 전체라면 모집단(n)을 선택합니다.',
      '평균, 중앙값, 최빈값, 표준편차와 보조 통계값이 즉시 바뀌는 것을 확인합니다.',
      '결과 복사를 눌러 주요 수치를 보고서나 스프레드시트에 붙여넣습니다.',
    ],
    sections: [
      {
        heading: '평균·중앙값·최빈값은 서로 다른 정보를 보여 줍니다',
        body: '산술평균은 모든 값을 더한 뒤 개수로 나눈 값으로, 식은 평균 = Σx ÷ n입니다. 모든 항목의 비중이 같을 때 유용하지만 유난히 큰 값이나 작은 값 하나가 평균을 끌어당길 수 있습니다. 중앙값은 값을 정렬했을 때 가운데 값이며, 개수가 짝수면 가운데 두 값의 평균입니다. 최빈값은 가장 자주 나온 값입니다. 예를 들어 1, 2, 2, 9의 평균은 3.5이지만 중앙값과 최빈값은 모두 2입니다. 세 값을 함께 보면 극단값에 가려진 분포를 더 쉽게 읽을 수 있습니다.',
      },
      {
        heading: '표본 표준편차와 모집단 표준편차의 차이',
        body: '표준편차는 각 값이 평균에서 보통 얼마나 떨어져 있는지를 나타냅니다. 관심 있는 집단 전체를 입력했다면 모집단 표준편차를 사용하며 분산은 n으로 나눕니다. 더 큰 집단을 대표하도록 일부만 조사했다면 표본 표준편차를 사용하며 n − 1로 나눕니다. 이 보정은 표본으로 모집단의 퍼짐을 추정할 때 값이 체계적으로 작아지는 것을 줄입니다. 값이 하나뿐이면 표본 표준편차는 n − 1이 0이므로 정의되지 않지만, 모집단 표준편차는 0입니다.',
      },
      {
        heading: '붙여넣기 입력과 결과 해석',
        body: '소수, 음수, 1e3 같은 지수 표기를 입력할 수 있고 스프레드시트 열을 그대로 붙여넣어도 됩니다. 줄바꿈과 탭도 값 구분자로 처리합니다. 범위는 최댓값 − 최솟값이며, 분산은 표준편차의 제곱이라 단위도 제곱 단위가 됩니다. 0은 빈칸이 아니라 유효한 값으로 개수와 모든 통계에 포함됩니다. 한글, 이모지, Infinity, 잘못된 소수 표기는 0으로 바꾸지 않고 제외한 뒤 알림으로 개수를 보여 주므로, 결과를 쓰기 전에 입력 오류를 확인할 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '평균은 어떻게 계산하나요?',
        a: '산술평균은 모든 값을 더한 뒤 값의 개수로 나눠 계산합니다. 식은 평균 = Σx ÷ n입니다. 예를 들어 72, 85, 90의 합계는 247이고 평균은 247 ÷ 3 = 82.3333입니다.',
      },
      {
        q: '표본 표준편차와 모집단 표준편차는 무엇이 다른가요?',
        a: '모집단 표준편차는 조사 대상 전체의 제곱편차 합을 n으로 나누고, 표본 표준편차는 더 큰 집단을 추정하기 위해 n − 1로 나눕니다. 따라서 같은 데이터에서는 표본 표준편차가 보통 조금 더 큽니다.',
      },
      {
        q: '최빈값이 여러 개일 수 있나요?',
        a: '가장 많이 나온 횟수가 같은 값이 둘 이상이면 최빈값도 여러 개입니다. 1, 2, 2, 3, 3, 9에서는 2와 3이 모두 최빈값이고, 모든 값이 한 번씩만 나오면 최빈값은 없습니다.',
      },
      {
        q: '0도 평균 계산에 포함되나요?',
        a: '0은 유효한 숫자이므로 개수, 합계, 평균, 중앙값, 표준편차 계산에 모두 포함됩니다. 빈 구분자는 무시하지만 입력한 0을 빈값으로 취급하지 않습니다.',
      },
      {
        q: '입력한 숫자가 서버로 전송되나요?',
        a: '아니요. 숫자 분석과 계산은 브라우저의 JavaScript에서 실행합니다. 입력값은 새로고침 뒤에도 유지되도록 이 브라우저에만 저장하며 서버로 보내지 않습니다.',
      },
    ],
    ui: {
      defaultValues: '72, 85, 90, 76, 88, 90',
      inputLabel: '분석할 숫자',
      inputHint: '스프레드시트 열을 붙여넣거나 쉼표, 공백, 세미콜론, 줄바꿈으로 값을 구분합니다.',
      inputPlaceholder: '72, 85, 90, 76, 88',
      example: '예시 사용',
      clear: '지우기',
      autosaved: '이 브라우저에 저장됨',
      invalidValues: '읽을 수 없는 항목이 {n}개 있어 계산에서 제외했습니다. 소수점과 구분자를 확인하세요.',
      deviationLabel: '표준편차 기준',
      deviationHint: '입력한 값이 표본인지, 조사 대상 전체인지 선택합니다.',
      sample: '표본 (n − 1)',
      population: '모집단 (n)',
      resultsHeading: '계산 결과',
      copy: '결과 복사',
      copied: '복사됨',
      emptyInput: '통계를 보려면 유한한 숫자를 하나 이상 입력하세요.',
      mean: '평균',
      median: '중앙값',
      mode: '최빈값',
      noMode: '최빈값 없음',
      standardDeviation: '표준편차',
      count: '개수',
      sum: '합계',
      min: '최솟값',
      max: '최댓값',
      range: '범위',
      variance: '분산',
      sampleFormula: '평균 = 합계 ÷ n · 표본 분산 = Σ(x − 평균)² ÷ (n − 1)',
      populationFormula: '평균 = 합계 ÷ n · 모집단 분산 = Σ(x − 평균)² ÷ n',
      copySummary:
        '평균: {mean}\n중앙값: {median}\n최빈값: {mode}\n표준편차: {standardDeviation}\n개수: {count}\n합계: {sum}',
      privacyNotice: '입력한 숫자는 이 브라우저에서 계산하며 서버로 전송하지 않습니다.',
    },
  },
};

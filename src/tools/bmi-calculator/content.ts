import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  unitsLabel: 'Units',
  metric: 'Metric',
  imperial: 'US customary',
  autosaved: 'Measurements are saved in this browser',
  heightCmLabel: 'Height (cm)',
  heightCmHint: 'For example, 170',
  weightKgLabel: 'Weight (kg)',
  weightKgHint: 'For example, 65',
  heightFeetLabel: 'Height (ft)',
  heightInchesLabel: 'Height (in)',
  weightPoundsLabel: 'Weight (lb)',
  adultNotice: 'For adults. BMI categories for children and teens use age- and sex-specific growth charts.',
  invalidMeasurements: 'Enter a height and weight greater than 0 to calculate BMI.',
  bmiLabel: 'BMI (kg/m²)',
  whoLabel: 'WHO adult category',
  koreanLabel: 'Korean adult category',
  whoWeightLabel: 'WHO healthy-weight range',
  koreanWeightLabel: 'Korean healthy-weight range',
  weightRange: '{min}–{max} kg',
  formula: 'BMI = {weight} kg ÷ ({height} m × {height} m) = {bmi}',
  screeningNotice:
    'BMI is a screening measure, not a diagnosis. Pregnancy, high muscle mass, and body composition can make it less representative.',
  underweight: 'Underweight',
  healthy: 'Healthy weight',
  preObesity: 'Pre-obesity',
  overweight: 'Overweight',
  obesity1: 'Obesity class 1',
  obesity2: 'Obesity class 2',
  obesity3: 'Obesity class 3',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'BMI Calculator — WHO & Korean Adult Ranges',
    description:
      'Calculate your BMI instantly with metric or US units. Compare WHO and Korean adult categories and healthy-weight ranges side by side, with no ads.',
    h1: 'BMI Calculator',
    tagline: 'Enter height and weight to compare WHO and Korean adult BMI ranges at once.',
    name: 'BMI Calculator',
    keywords: ['body mass index calculator', 'BMI chart', 'healthy weight range', 'BMI kg m2', 'Korean BMI standard'],
    howTo: [
      'Choose Metric or US customary units.',
      'Enter your height and weight.',
      'Read your BMI and the WHO and Korean adult categories.',
      'Compare the two healthy-weight ranges for your height.',
    ],
    sections: [
      {
        heading: 'How BMI is calculated',
        body: 'BMI is weight in kilograms divided by height in metres squared: kg/m². For example, 65 kg at 1.70 m is 65 ÷ (1.70 × 1.70) = 22.5. In US customary units, the equivalent shortcut is 703 × weight in pounds ÷ height in inches squared. This calculator converts US measurements before applying the same metric formula and rounds the displayed BMI to one decimal place.',
      },
      {
        heading: 'Why the two adult ranges differ',
        body: 'The international adult categories used by the CDC place healthy weight at BMI 18.5 to below 25, overweight at 25 to below 30, and obesity at 30 or higher. The Korean Society for the Study of Obesity 2022 guideline uses 18.5 to below 23 as normal, 23 to below 25 as pre-obesity, then obesity classes starting at 25, 30, and 35. Showing both makes the different interpretation explicit instead of silently choosing one standard.',
      },
      {
        heading: 'Use BMI as one screening signal',
        body: 'BMI estimates weight relative to height; it does not directly measure body fat or distinguish fat from muscle. CDC notes that a clinician considers BMI alongside medical history, health behaviours, examination, and laboratory findings. Adult BMI cutoffs are not used for children and teens, whose results are interpreted with age- and sex-specific percentiles. Pregnancy and unusually high muscle mass can also make a BMI result less representative of body composition.',
      },
    ],
    faq: [
      {
        q: 'How do I calculate BMI?',
        a: 'BMI is calculated as weight in kilograms divided by height in metres squared. A person who weighs 65 kg and is 1.70 m tall has a BMI of 22.5 because 65 ÷ 1.70² equals about 22.5.',
      },
      {
        q: 'What is a healthy BMI range for adults?',
        a: 'The WHO-style international adult range is BMI 18.5 to below 25. The Korean Society for the Study of Obesity defines the normal adult range as BMI 18.5 to below 23, so the healthy-weight range calculated from the same height is narrower.',
      },
      {
        q: 'Why does the Korean BMI category differ from the WHO category?',
        a: 'The Korean Society for the Study of Obesity classifies BMI 23.0 to 24.9 as pre-obesity and BMI 25.0 or higher as obesity, while the international adult categories call BMI 23.0 to 24.9 healthy weight and start overweight at 25.0.',
      },
      {
        q: 'Can BMI diagnose obesity or health problems?',
        a: 'No. BMI is a screening measure rather than a diagnosis because it cannot measure body fat directly or distinguish fat from muscle. A health professional can interpret it with other health information when that is needed.',
      },
      {
        q: 'Is this BMI calculator suitable for children?',
        a: 'No. Adult BMI categories are not suitable for children and teenagers. CDC uses age- and sex-specific BMI-for-age percentiles for people aged 2 through 19 instead of the adult cutoffs shown here.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'BMI 계산기 — WHO·대한비만학회 기준 비교',
    description:
      '키와 몸무게로 BMI를 바로 계산하고 WHO 국제 기준과 대한비만학회 성인 기준, 적정 체중 범위를 나란히 확인합니다. 광고 없이 브라우저에서 처리합니다.',
    h1: 'BMI 계산기',
    tagline: 'BMI와 WHO·대한비만학회 성인 판정, 키에 맞는 적정 체중 범위를 한 번에 확인합니다.',
    name: 'BMI 계산기',
    keywords: ['체질량지수 계산기', '비만도 계산', '적정 체중', 'BMI 정상 범위', '대한비만학회 BMI'],
    howTo: [
      '미터법 또는 미국 단위를 선택합니다.',
      '키와 몸무게를 입력합니다.',
      'BMI와 WHO·대한비만학회 성인 판정을 확인합니다.',
      '두 기준의 적정 체중 범위를 비교합니다.',
    ],
    sections: [
      {
        heading: 'BMI 계산 공식',
        body: 'BMI(체질량지수)는 몸무게(kg)를 키(m)의 제곱으로 나눈 값입니다. 예를 들어 키 170cm, 몸무게 65kg이면 65 ÷ (1.70 × 1.70) = 약 22.5입니다. 이 계산기는 결과를 소수점 첫째 자리까지 표시합니다. 미국 단위를 선택하면 피트·인치와 파운드를 먼저 cm·kg으로 바꾼 뒤 같은 공식을 적용하므로, 어느 단위를 입력해도 계산 기준은 같습니다.',
      },
      {
        heading: 'WHO 기준과 대한비만학회 기준',
        body: '국제 성인 기준에서는 BMI 18.5 이상 25 미만을 정상 체중, 25 이상 30 미만을 과체중, 30 이상을 비만으로 봅니다. 대한비만학회 「비만 진료지침 2022」은 한국 성인에서 18.5 이상 23 미만을 정상, 23 이상 25 미만을 비만 전단계, 25 이상·30 이상·35 이상을 각각 1·2·3단계 비만으로 구분합니다. 같은 BMI도 기준에 따라 해석이 달라질 수 있어 두 결과를 함께 보여줍니다.',
      },
      {
        heading: 'BMI는 선별 지표입니다',
        body: 'BMI는 키와 몸무게의 비율을 보는 선별 지표로, 체지방량이나 근육량을 직접 재지 못합니다. 근육량이 많은 사람은 체지방이 많지 않아도 높게 나올 수 있고, 임신 중인 경우에도 성인 BMI만으로 판단하기 어렵습니다. 소아·청소년은 성인 구간이 아니라 나이와 성별에 따른 성장도표 백분위를 사용합니다. 건강 상태가 걱정되면 BMI 하나가 아니라 허리둘레와 의료진의 평가를 함께 참고하는 편이 안전합니다.',
      },
    ],
    faq: [
      {
        q: 'BMI는 어떻게 계산하나요?',
        a: 'BMI는 몸무게(kg)를 키(m)의 제곱으로 나눠 계산합니다. 키 170cm, 몸무게 65kg의 BMI는 65 ÷ 1.70² = 약 22.5이며, 이 계산기는 소수점 첫째 자리까지 바로 표시합니다.',
      },
      {
        q: '대한비만학회 기준 정상 BMI는 얼마인가요?',
        a: '대한비만학회 비만 진료지침 2022에서 한국 성인의 정상 BMI는 18.5 이상 23 미만입니다. BMI 23 이상 25 미만은 비만 전단계이며, 25 이상부터 1단계 비만으로 분류합니다.',
      },
      {
        q: 'WHO 기준과 한국 BMI 기준은 왜 다른가요?',
        a: '국제 성인 기준은 BMI 25 이상을 과체중, 30 이상을 비만으로 구분하지만 대한비만학회 기준은 BMI 23 이상을 비만 전단계, 25 이상을 비만으로 구분합니다. 따라서 BMI 23.0~24.9는 국제 기준에서 정상 체중이지만 한국 기준에서는 비만 전단계입니다.',
      },
      {
        q: 'BMI만으로 비만을 진단할 수 있나요?',
        a: '아닙니다. BMI는 체지방과 근육량을 구분하지 못하는 선별 지표이므로 개인의 건강 상태를 진단하지 않습니다. 근육량이 많거나 임신 중인 경우에는 특히 실제 체성분과 다르게 나올 수 있습니다.',
      },
      {
        q: '어린이도 이 BMI 계산기를 사용해도 되나요?',
        a: '성인 판정 구간은 어린이와 청소년에게 적용하지 않습니다. 만 2~19세는 나이와 성별에 따른 BMI 백분위 성장도표로 평가해야 하므로, 이 계산기의 성인 WHO·대한비만학회 결과로 판단하면 안 됩니다.',
      },
    ],
    ui: {
      unitsLabel: '단위',
      metric: '미터법',
      imperial: '미국 단위',
      autosaved: '입력값은 이 브라우저에 저장됩니다',
      heightCmLabel: '키(cm)',
      heightCmHint: '예: 170',
      weightKgLabel: '몸무게(kg)',
      weightKgHint: '예: 65',
      heightFeetLabel: '키(ft)',
      heightInchesLabel: '키(in)',
      weightPoundsLabel: '몸무게(lb)',
      adultNotice: '성인용 계산기입니다. 소아·청소년은 나이·성별 성장도표를 사용해야 합니다.',
      invalidMeasurements: '0보다 큰 키와 몸무게를 입력하면 BMI를 계산합니다.',
      bmiLabel: 'BMI(kg/m²)',
      whoLabel: 'WHO 성인 판정',
      koreanLabel: '대한비만학회 성인 판정',
      whoWeightLabel: 'WHO 적정 체중 범위',
      koreanWeightLabel: '대한비만학회 적정 체중 범위',
      weightRange: '{min}–{max} kg',
      formula: 'BMI = {weight} kg ÷ ({height} m × {height} m) = {bmi}',
      screeningNotice:
        'BMI는 진단이 아닌 선별 지표입니다. 임신, 높은 근육량, 체성분에 따라 실제 상태를 충분히 반영하지 못할 수 있습니다.',
      underweight: '저체중',
      healthy: '정상',
      preObesity: '비만 전단계',
      overweight: '과체중',
      obesity1: '1단계 비만',
      obesity2: '2단계 비만',
      obesity3: '3단계 비만',
    },
  },
};

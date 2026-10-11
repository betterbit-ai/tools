import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'bmi-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'features', 'no-ads'],
  competitors: [
    {
      name: 'CDC — Adult BMI Calculator',
      url: 'https://www.cdc.gov/bmi/adult-calculator/',
      weakness:
        'The calculator requires a separate “Calculate” click after entry and reports only its US adult category table (healthy weight 18.5–24.9, overweight 25.0–29.9, obesity at 30.0+); it does not show the Korean Society for the Study of Obesity interpretation or its different healthy-weight range beside the same result. Betterbit updates both classifications as measurements change. (Strength: it is an authoritative public-health source and links directly to the CDC child and teen calculator.)',
    },
    {
      name: 'NHLBI — Calculate Your BMI',
      url: 'https://www.nhlbi.nih.gov/calculate-your-bmi',
      weakness:
        'Its Metric and Standard tabs require a “Calculate Your BMI” action, and its output scale only presents the four US categories below 18.5, 18.5–24.9, 25.0–29.9, and 30.0+. Betterbit requires no calculation button and makes the Korean adult thresholds visible alongside the international ones. (Strength: it links to NHLBI guidance about healthy weight and heart health.)',
    },
    {
      name: 'Calculator.net — BMI Calculator',
      url: 'https://www.calculator.net/bmi-calculator.html',
      weakness:
        'The page asks for age and gender before using a Calculate control and presents a long general-purpose calculator page, while its result uses one WHO-style table rather than comparing Korean adult thresholds in the result. Betterbit keeps the two measurements and five directly relevant results on one ad-free screen. (Strength: it also provides BMI Prime, Ponderal Index, and child/teen reference tables.)',
    },
    {
      name: '데일리툴즈 — BMI 계산기',
      url: 'https://dailytools.kr/calc/bmi',
      weakness:
        'Its result focuses on the Korean Society for the Study of Obesity judgment and the 18.5–22.9 healthy-weight range from cm/kg inputs, but it does not display the WHO international category and its 18.5–24.9 range next to that same result. Betterbit makes the difference explicit in live side-by-side results. (장점: 키별 정상 체중 참고표와 성인 적용 한계를 자세히 안내한다.)',
    },
    {
      name: '옥천군 보건소 — 비만도계산',
      url: 'https://www.oc.go.kr/health/contents.do?key=1487',
      weakness:
        'The form has cm/kg fields followed by a “측정하기” button, and the result explains only one Korean category scale; it does not calculate a healthy-weight range or compare that scale with WHO thresholds. Betterbit recalculates as values change and shows both ranges. (장점: 지방자치단체 보건소가 제공하는 간단한 한국어 안내다.)',
    },
    {
      name: '계산도감 — 비만도 계산기',
      url: 'https://calcstandard.com/bmi/',
      weakness:
        'Its published guide includes a Korean-versus-WHO reference table, but the calculator description centres on a Korean adult result and a Korean 18.5–23 range rather than presenting two named category results and two height-specific healthy-weight ranges together. Betterbit makes that comparison part of the immediate result. (장점: 키 170cm 등 구체적인 기준표 예시를 설명 콘텐츠에 제공한다.)',
    },
  ],
  related: [
    'percentage-calculator',
    'age-calculator',
    'loan-calculator',
    'length-converter',
    'weight-converter',
    'temperature-converter',
    'random-number',
  ],
};

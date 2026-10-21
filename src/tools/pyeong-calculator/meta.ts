import type { ToolMeta, ToolVariant } from '../types';
import { PYEONG_PER_SQUARE_METER, SQUARE_METERS_PER_PYEONG } from './logic';

/**
 * Landing pages for the areas Koreans search ("84㎡ 몇 평", "30평 몇 제곱미터"). Snippets carry
 * the exact conversion. The marketed pyeong type assumes supply area ≈ 1.33 × exclusive area,
 * which is typical but varies by complex — the copy says so.
 */
const APARTMENT_SQM = [59, 74, 84, 101, 114];
const SEARCHED_PYEONG = [10, 15, 20, 24, 25, 30, 32, 33, 34, 40];
const SUPPLY_RATIO = 1.33;
const r2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, '');

const sqmVariants: ToolVariant[] = APARTMENT_SQM.map((sqm) => {
  const pyeong = r2(sqm * PYEONG_PER_SQUARE_METER);
  const type = Math.round(sqm * SUPPLY_RATIO * PYEONG_PER_SQUARE_METER);
  return {
    slug: `${sqm}-square-meters`,
    preset: { value: sqm, unit: 'squareMeters' },
    content: {
      en: {
        title: `${sqm}㎡ in Pyeong — ${pyeong} Pyeong (Korean Apartment Size)`,
        description: `${sqm} square metres is ${pyeong} pyeong. A Korean apartment with ${sqm}㎡ of exclusive area is usually marketed as about a ${type}-pyeong type, based on supply area.`,
        h1: `${sqm}㎡ to Pyeong`,
        intro: `${sqm}㎡ × 121 ÷ 400 = ${pyeong} pyeong. Korean listings often quote a larger “pyeong type” that counts shared supply area too: for a typical complex where supply area is about 1.33× the exclusive area, ${sqm}㎡ exclusive is roughly a ${type}-pyeong type. Check the complex's own supply area to be sure.`,
      },
      ko: {
        title: `${sqm}㎡ 몇 평? — 전용 ${pyeong}평, 보통 ${type}평형`,
        description: `${sqm}제곱미터는 ${pyeong}평입니다. 전용면적 ${sqm}㎡ 아파트는 공급면적 기준으로 보통 약 ${type}평형이라고 부릅니다. 단지별 공급면적으로 정확히 비교해 보세요.`,
        h1: `${sqm}㎡ 몇 평`,
        intro: `${sqm}㎡ × 121 ÷ 400 = ${pyeong}평입니다. 아파트 분양 평형은 공용 공간까지 더한 공급면적으로 부르기 때문에 더 큽니다. 공급면적이 전용의 약 1.33배인 일반적인 단지라면 전용 ${sqm}㎡는 약 ${type}평형이고, 정확한 값은 단지의 공급면적을 넣어 확인하세요.`,
      },
    },
  };
});

const pyeongVariants: ToolVariant[] = SEARCHED_PYEONG.map((py) => {
  const sqm = r2(py * SQUARE_METERS_PER_PYEONG);
  return {
    slug: `${py}-pyeong`,
    preset: { value: py, unit: 'pyeong' },
    content: {
      en: {
        title: `${py} Pyeong in Square Metres — ${sqm}㎡`,
        description: `${py} pyeong is ${sqm} square metres (1 pyeong = 400/121 ≈ 3.3058㎡). Convert any Korean floor area between pyeong and ㎡, exclusive or supply.`,
        h1: `${py} Pyeong to ㎡`,
        intro: `${py} pyeong × 400 ÷ 121 = ${sqm}㎡. Make sure both figures use the same basis: a listing's pyeong type is usually supply area, while ㎡ on the register is often exclusive area.`,
      },
      ko: {
        title: `${py}평 몇 제곱미터? — ${sqm}㎡`,
        description: `${py}평은 ${sqm}㎡입니다(1평 = 400/121 ≈ 3.3058㎡). 전용·공급면적을 구분해 평과 ㎡를 바로 바꿔 보세요.`,
        h1: `${py}평 몇 ㎡`,
        intro: `${py}평 × 400 ÷ 121 = ${sqm}㎡입니다. 분양 평형은 보통 공급면적, 등기부·건축물대장의 ㎡는 전용면적인 경우가 많으니 같은 기준끼리 비교하세요.`,
      },
    },
  };
});

export const meta: ToolMeta = {
  slug: 'pyeong-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-14',
  updated: '2026-10-21',
  edges: ['usability'],
  competitors: [
    {
      name: 'gemini2k Tools — Pyeong ↔ ㎡ Calculator',
      url: 'https://gemini2k.co.kr/en/pyeong.html',
      weakness:
        'It has two direct-conversion inputs and useful common-size buttons, but its only treatment of exclusive versus supply area is a sentence below the calculator; visitors cannot enter the two figures from a listing and see their pyeong values together. Betterbit makes both figures editable in a side-by-side comparison, including the resulting exclusive-area ratio. (Strength: it also shows hectare conversion and both exact and commonly rounded pyeong values.)',
    },
    {
      name: 'pyeong.fyi — Square Meters to Pyeong Converter',
      url: 'https://pyeong.fyi/en/',
      weakness:
        'Its supply-area card asks for private area and an efficiency ratio, then asks visitors to choose apartment, small apartment, or officetel; that is useful for an estimate but is not a direct comparison of the two measurements printed on a listing. Betterbit keeps separate editable exclusive and supply fields so it never infers one area from a building-type assumption. (Strength: it also calculates price per pyeong and supports sharing a size candidate.)',
    },
    {
      name: 'Calcul Korea — Pyeong Converter',
      url: 'https://www.calculkorea.com/en/pyeong-converter',
      weakness:
        'Its converter can add rectangular rooms, but it treats the primary conversion as one pyeong field and one square-metre field; it does not provide a place to compare an apartment listing’s exclusive and supply measurements together. Betterbit gives direct, live conversion plus a separate two-field comparison with the common-area difference. (Strength: it can total multiple named room rectangles.)',
    },
    {
      name: 'EVERYCALC — 평수 변환 계산기',
      url: 'https://www.everycalc.pe.kr/pyeong',
      weakness:
        'Its page explains that exclusive and supply area must be compared separately, but the interactive calculation is initially hidden behind a “로딩 중...” state and the page includes banner advertising. Betterbit makes the exclusive/supply comparison an immediately visible, editable part of the calculator. (장점: 전용·공급·계약면적의 차이를 긴 안내문과 환산표로 자세히 설명한다.)',
    },
    {
      name: 'alwayscorp — 평수 계산기',
      url: 'https://alwayscorp.co.kr/tools/pyeong',
      weakness:
        'It offers live one-way conversion, presets, and a share action, but its calculator does not let a visitor type the exclusive and supply figures from the same listing side by side; the distinction appears in explanatory text instead. Betterbit pairs its live conversion with two editable listing fields, a pyeong result for each, and the exclusive-area ratio. (장점: 10평부터 100평까지의 긴 환산표와 결과 공유 기능을 제공한다.)',
    },
    {
      name: 'K Juso — Pyeong ↔ m² Converter',
      url: 'https://kjuso.com/en/tools/area-converter',
      weakness:
        'Its “Popular Sizes” places labels such as “24 평(59㎡)” and “32 평(84㎡)” next to a direct converter, even though 59㎡ and 84㎡ convert directly to about 17.85평 and 25.41평; readers must find the later explanation to learn those labels use another area basis. Betterbit names the basis next to the result and exposes both entered figures together. (Strength: its guide clearly explains exclusive, supply, and contract area below the calculator.)',
    },
  ],
  related: ['length-converter', 'scientific-calculator', 'loan-calculator', 'area-converter'],
  variants: [...sqmVariants, ...pyeongVariants],
};

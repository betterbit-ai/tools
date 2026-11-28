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
        sections: [
          {
            heading: `${sqm}㎡ is ${pyeong} pyeong — the marketed type needs the efficiency ratio`,
            body: `The exact factor is 400/121 ㎡ per pyeong, so ${sqm}㎡ is ${sqm} × 121 ÷ 400 = ${pyeong} pyeong. A Korean sale listing does not stop there: the “${type}-pyeong type” counts the shared supply area, and the exclusive-area ratio (전용률) that decides it differs by complex, flat type and building age. At a 70% ratio the same ${sqm}㎡ becomes ${r2(sqm / 0.7)}㎡ of supply area, at 80% it becomes ${r2(sqm / 0.8)}㎡, so the quoted type moves with the complex rather than with the measurement.

The register and the 건축물대장 both list ㎡, and both normally give exclusive area, which is why a contract can look smaller than the advert. Compare like with like: take the supply area printed for that specific complex, convert it with the same 400/121 factor, and only then compare it with the pyeong in an advert.`,
            table: {
              caption: `Supply area and marketed pyeong type for ${sqm}㎡ of exclusive area`,
              head: ['Exclusive ratio', 'Supply area (㎡)', 'Supply area (pyeong)', 'Marketed type (pyeong)'],
              rows: ['0.70', '0.75', '0.80'].map((ratio) => {
                const supply = sqm / Number(ratio);
                return [
                  `${Math.round(Number(ratio) * 100)}%`,
                  r2(supply),
                  r2(supply * PYEONG_PER_SQUARE_METER),
                  String(Math.round(supply * PYEONG_PER_SQUARE_METER)),
                ];
              }),
            },
          },
        ],
        faq: [
          {
            q: `How many pyeong is ${sqm} square metres?`,
            a: `${sqm}㎡ is ${pyeong} pyeong exactly, because 1 pyeong is 400/121 ㎡. Multiply by 121 and divide by 400: ${sqm} × 121 ÷ 400 = ${pyeong}. A calculator that uses a rounded 3.3 gives ${r2(sqm / 3.3)} pyeong instead, slightly low.`,
          },
          {
            q: `Why is a ${sqm}㎡ flat advertised as a ${type}-pyeong type?`,
            a: `Because the type counts supply area, which adds stairwells, corridors and other shared space to the exclusive area. At the common ${type}-pyeong label the ratio works out at about ${Math.round((sqm / (Number(type) * SQUARE_METERS_PER_PYEONG)) * 100)}%, and each complex prints its own ratio on the sale notice.`,
          },
          {
            q: `Is the ㎡ on the register the same as the pyeong in the advert?`,
            a: `Usually not. The register and 건축물대장 give exclusive area in ㎡, while the advert's pyeong is supply or contract area. Convert the register figure with 400/121 and compare it with the same basis, or enter both figures in the comparison below.`,
          },
        ],
      },
      ko: {
        title: `${sqm}㎡ 몇 평? — 전용 ${pyeong}평, 보통 ${type}평형`,
        description: `${sqm}제곱미터는 ${pyeong}평입니다. 전용면적 ${sqm}㎡ 아파트는 공급면적 기준으로 보통 약 ${type}평형이라고 부릅니다. 단지별 공급면적으로 정확히 비교해 보세요.`,
        h1: `${sqm}㎡ 몇 평`,
        intro: `${sqm}㎡ × 121 ÷ 400 = ${pyeong}평입니다. 아파트 분양 평형은 공용 공간까지 더한 공급면적으로 부르기 때문에 더 큽니다. 공급면적이 전용의 약 1.33배인 일반적인 단지라면 전용 ${sqm}㎡는 약 ${type}평형이고, 정확한 값은 단지의 공급면적을 넣어 확인하세요.`,
        sections: [
          {
            heading: `${sqm}㎡는 ${pyeong}평, 분양 평형은 전용률에 따라 달라집니다`,
            body: `1평은 정확히 400/121㎡이므로 ${sqm}㎡는 ${sqm} × 121 ÷ 400 = ${pyeong}평입니다. 그런데 분양 공고의 평형은 계단·복도 같은 주거공용면적을 더한 공급면적을 기준으로 부르기 때문에, 같은 ${sqm}㎡라도 단지와 타입, 건축 연식에 따라 다른 평형으로 표시됩니다. 전용률이 70%인 단지는 공급면적이 ${r2(sqm / 0.7)}㎡, 80%인 단지는 ${r2(sqm / 0.8)}㎡가 되어 부르는 평형이 달라집니다.

등기부등본과 건축물대장에는 ㎡로 적히고, 보통 전용면적이 표시됩니다. 그래서 계약서의 숫자가 광고보다 작아 보일 수 있습니다. 같은 기준끼리 비교하려면 해당 단지의 공급면적을 확인해 같은 400/121 기준으로 환산한 뒤 광고의 평수와 비교해야 합니다.`,
            table: {
              caption: `전용 ${sqm}㎡의 전용률별 공급면적과 분양 평형`,
              head: ['전용률', '공급면적 (㎡)', '공급면적 (평)', '부르는 평형'],
              rows: ['0.70', '0.75', '0.80'].map((ratio) => {
                const supply = sqm / Number(ratio);
                return [
                  `${Math.round(Number(ratio) * 100)}%`,
                  r2(supply),
                  r2(supply * PYEONG_PER_SQUARE_METER),
                  `${Math.round(supply * PYEONG_PER_SQUARE_METER)}평`,
                ];
              }),
            },
          },
        ],
        faq: [
          {
            q: `${sqm}㎡는 몇 평인가요?`,
            a: `${sqm}㎡는 정확히 ${pyeong}평입니다. 1평이 400/121㎡이므로 ${sqm} × 121 ÷ 400 = ${pyeong}입니다. 3.3으로 나누는 계산기는 ${r2(sqm / 3.3)}평으로 조금 작게 나옵니다.`,
          },
          {
            q: `${sqm}㎡ 아파트는 왜 ${type}평형으로 광고하나요?`,
            a: `분양 평형이 전용면적이 아니라 계단·복도 등 주거공용면적을 더한 공급면적을 기준으로 붙기 때문입니다. ${type}평형이라는 표기는 전용률 약 ${Math.round((sqm / (Number(type) * SQUARE_METERS_PER_PYEONG)) * 100)}%를 뜻하며, 단지마다 공급면적을 따로 고지합니다.`,
          },
          {
            q: `등기부의 ㎡와 광고의 평수는 같은 면적인가요?`,
            a: `보통 다릅니다. 등기부등본과 건축물대장은 전용면적을 ㎡로 적고, 광고의 평수는 공급면적이나 계약면적을 기준으로 부르는 경우가 많습니다. 등기부의 ㎡를 400/121로 환산해 같은 기준끼리 비교하거나, 아래 비교 계산기에 두 값을 함께 넣어 확인하세요.`,
          },
        ],
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
        sections: [
          {
            heading: `${py} pyeong in ㎡, and how the neighbours compare`,
            body: `${py} pyeong is ${py} × 400 ÷ 121 = ${sqm}㎡ exactly, because one pyeong is 400/121 ㎡ (about 3.3058㎡). Buyers rarely look at a single size in isolation, so the table below converts the pyeong values either side of ${py} with the same factor — useful when two listings are one or two pyeong apart and the advertised types do not settle which is bigger.

The basis still matters more than the arithmetic. A “${py}-pyeong” advert counts supply area, while ㎡ on the register is normally exclusive area. If the complex publishes an exclusive-area ratio of 75%, ${py} pyeong of supply area corresponds to about ${r2(py * SQUARE_METERS_PER_PYEONG * 0.75)}㎡ of exclusive area — noticeably less than ${sqm}㎡.`,
            table: {
              caption: `Pyeong around ${py}, converted at 400/121 ㎡ per pyeong`,
              head: ['Pyeong', 'Square metres (㎡)'],
              rows: [py - 2, py - 1, py, py + 1, py + 2]
                .filter((p) => p > 0)
                .map((p) => [String(p), r2(p * SQUARE_METERS_PER_PYEONG)]),
            },
          },
        ],
        faq: [
          {
            q: `How many square metres is ${py} pyeong?`,
            a: `${py} pyeong is ${sqm}㎡: ${py} × 400 ÷ 121 = ${sqm}. A quick mental check is to multiply pyeong by 3.3, which gives ${r2(py * 3.3)}㎡ and is slightly larger than the exact answer.`,
          },
          {
            q: `What exclusive area does a ${py}-pyeong flat have?`,
            a: `At a 75% exclusive-area ratio, ${py} pyeong of supply area leaves about ${r2(py * SQUARE_METERS_PER_PYEONG * 0.75)}㎡ of exclusive area. The ratio varies by complex and building age, so read it from the sale notice rather than assuming the average.`,
          },
          {
            q: `Is ${py} pyeong a large flat in Korea?`,
            a: `Exclusive areas of about 59㎡ (17.9 pyeong) and 84㎡ (25.4 pyeong) are the most common apartment sizes in Korea, so a ${py}-pyeong figure is best read against those two anchors and against the basis (exclusive or supply) it was quoted on.`,
          },
        ],
      },
      ko: {
        title: `${py}평 몇 제곱미터? — ${sqm}㎡`,
        description: `${py}평은 ${sqm}㎡입니다(1평 = 400/121 ≈ 3.3058㎡). 전용·공급면적을 구분해 평과 ㎡를 바로 바꿔 보세요.`,
        h1: `${py}평 몇 ㎡`,
        intro: `${py}평 × 400 ÷ 121 = ${sqm}㎡입니다. 분양 평형은 보통 공급면적, 등기부·건축물대장의 ㎡는 전용면적인 경우가 많으니 같은 기준끼리 비교하세요.`,
        sections: [
          {
            heading: `${py}평은 ${sqm}㎡, 옆 평수와 나란히 비교하기`,
            body: `${py}평은 ${py} × 400 ÷ 121 = ${sqm}㎡입니다. 1평이 400/121㎡(약 3.3058㎡)이기 때문입니다. 매물을 고를 때는 한 평수만 보기보다 한두 평 차이 나는 매물을 함께 비교하게 되므로, 아래 표에 ${py}평 앞뒤 평수를 같은 기준으로 환산했습니다.

평수보다 중요한 것은 기준입니다. 광고의 "${py}평"은 공급면적이고, 등기부의 ㎡는 보통 전용면적입니다. 단지의 전용률이 75%라면 공급면적 ${py}평의 전용면적은 약 ${r2(py * SQUARE_METERS_PER_PYEONG * 0.75)}㎡로, ${sqm}㎡보다 눈에 띄게 작아집니다.`,
            table: {
              caption: `${py}평 주변 평수의 ㎡ 환산(1평 = 400/121㎡)`,
              head: ['평', '제곱미터 (㎡)'],
              rows: [py - 2, py - 1, py, py + 1, py + 2]
                .filter((p) => p > 0)
                .map((p) => [String(p), r2(p * SQUARE_METERS_PER_PYEONG)]),
            },
          },
        ],
        faq: [
          {
            q: `${py}평은 몇 ㎡인가요?`,
            a: `${py}평은 ${sqm}㎡입니다. ${py} × 400 ÷ 121 = ${sqm}이고, 암산으로는 3.3을 곱해 ${r2(py * 3.3)}㎡로 어림하면 실제 값보다 조금 큽니다.`,
          },
          {
            q: `${py}평 아파트의 전용면적은 몇 ㎡인가요?`,
            a: `전용률 75%를 가정하면 공급면적 ${py}평의 전용면적은 약 ${r2(py * SQUARE_METERS_PER_PYEONG * 0.75)}㎡입니다. 전용률은 단지와 건축 연식에 따라 다르므로 평균값을 가정하지 말고 분양 공고의 공급면적을 확인하세요.`,
          },
          {
            q: `${py}평은 한국에서 큰 평수인가요?`,
            a: `한국 아파트에서 전용 59㎡(약 17.9평)와 84㎡(약 25.4평)가 가장 흔한 규모입니다. ${py}평은 이 두 기준과 비교해 보고, 전용면적인지 공급면적인지도 함께 확인해야 정확합니다.`,
          },
        ],
      },
    },
  };
});

export const meta: ToolMeta = {
  slug: 'pyeong-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-14',
  updated: '2026-11-28',
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

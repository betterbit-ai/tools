/**
 * BMI calculator: WHO and Korean categories recomputed independently from the height and weight
 * the page shows.
 *
 * Covers the defects this audit fixed:
 *  - a decimal point never survived a keystroke in the shared number input: typing 170.5 left
 *    “5170” and the page called the adult range invalid;
 *  - in US customary the healthy-weight ranges stayed in kilograms, which the visitor had not
 *    entered.
 */

const POUNDS_PER_KG = 2.2046226218;
/** The page prints at most one decimal, so 72.0 reads “72”. */
const num1 = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
const round = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * factor) / factor;
};

const bmiOf = (heightCm, weightKg) => weightKg / (heightCm / 100) ** 2;
const rangeOf = (heightCm, low, high) => {
  const m2 = (heightCm / 100) ** 2;
  return [round(low * m2, 1), round(high * m2, 1)];
};

const read = (page) =>
  page.evaluate(() => {
    const main = document.querySelector('main');
    const tiles = [...main.querySelectorAll('div[class*="bg-surface-2"]')]
      .filter((el) => el.children.length === 2 && el.children[0].className.includes('tabular'))
      .map((el) => [el.children[1].textContent.trim(), el.children[0].textContent.trim()]);
    return {
      tiles: Object.fromEntries(tiles),
      inputs: [...main.querySelectorAll('input')].map((i) => i.value),
      alert: [...main.querySelectorAll('[role=alert]')].map((el) => el.textContent.trim()),
      formula: main.querySelector('p.font-mono')?.textContent?.trim() ?? '',
      ranges: Object.fromEntries(
        Object.entries(Object.fromEntries(tiles)).filter(([label]) =>
          /healthy-weight range|적정 체중 범위/.test(label),
        ),
      ),
    };
  });

export default async function (t) {
  const page = t.page;
  await t.open('/bmi-calculator');
  await page.waitForTimeout(600);

  const numbers = page.locator('main input[inputmode=decimal]');
  const set = async (index, value) => {
    const field = numbers.nth(index);
    await field.click();
    await field.press('Control+a');
    if (value === '') await field.press('Backspace');
    else await field.type(String(value), { delay: 40 });
    await page.waitForTimeout(250);
  };

  // ── 1. 170 cm and 65 kg: BMI 22.5, healthy on both standards, with both weight ranges.
  let view = await read(page);
  t.assert(view.inputs[0] === '170' && view.inputs[1] === '65', `the defaults read ${view.inputs}`);
  t.assert(view.tiles['BMI (kg/m²)'] === num1(round(bmiOf(170, 65), 1)), `BMI reads ${view.tiles['BMI (kg/m²)']}`);
  t.assert(view.tiles['WHO adult category'] === 'Healthy weight', `WHO reads ${view.tiles['WHO adult category']}`);
  t.assert(
    view.tiles['Korean adult category'] === 'Healthy weight',
    `Korean reads ${view.tiles['Korean adult category']}`,
  );

  const [whoMin, whoMax] = rangeOf(170, 18.5, 24.9);
  const [koreanMin, koreanMax] = rangeOf(170, 18.5, 22.9);
  t.assert(
    view.tiles['WHO healthy-weight range'] === `${num1(whoMin)}–${num1(whoMax)} kg`,
    `the WHO range reads ${view.tiles['WHO healthy-weight range']}`,
  );
  t.assert(
    view.tiles['Korean healthy-weight range'] === `${num1(koreanMin)}–${num1(koreanMax)} kg`,
    `the Korean range reads ${view.tiles['Korean healthy-weight range']}`,
  );
  t.assert(view.formula === 'BMI = 65 kg ÷ (1.7 m × 1.7 m) = 22.5', `the formula reads ${view.formula}`);

  // ── 2. Every category boundary at 170 cm, checked against the raw BMI.
  const category = (weight) => {
    const bmi = bmiOf(170, weight);
    const who =
      bmi < 18.5
        ? 'Underweight'
        : bmi < 25
          ? 'Healthy weight'
          : bmi < 30
            ? 'Overweight'
            : bmi < 35
              ? 'Obesity class 1'
              : bmi < 40
                ? 'Obesity class 2'
                : 'Obesity class 3';
    const korean =
      bmi < 18.5
        ? 'Underweight'
        : bmi < 23
          ? 'Healthy weight'
          : bmi < 25
            ? 'Pre-obesity'
            : bmi < 30
              ? 'Obesity class 1'
              : bmi < 35
                ? 'Obesity class 2'
                : 'Obesity class 3';
    return { who, korean };
  };
  for (const weight of [53.4, 54, 64.5, 66.3, 72, 75, 87, 100, 130]) {
    await set(0, '170');
    await set(1, String(weight));
    const seen = await read(page);
    const want = category(weight);
    t.assert(
      seen.tiles['BMI (kg/m²)'] === num1(round(bmiOf(170, weight), 1)),
      `${weight} kg reads ${seen.tiles['BMI (kg/m²)']}`,
    );
    t.assert(
      seen.tiles['WHO adult category'] === want.who,
      `${weight} kg is ${seen.tiles['WHO adult category']} for WHO, expected ${want.who}`,
    );
    t.assert(
      seen.tiles['Korean adult category'] === want.korean,
      `${weight} kg is ${seen.tiles['Korean adult category']} for Korea, expected ${want.korean}`,
    );
  }

  // ── 3. A decimal height survives typing (it used to arrive as 5170).
  await set(0, '170.5');
  await set(1, '65');
  view = await read(page);
  t.assert(view.inputs[0] === '170.5', `the height field reads ${JSON.stringify(view.inputs[0])}`);
  t.assert(
    view.tiles['BMI (kg/m²)'] === num1(round(bmiOf(170.5, 65), 1)),
    `decimal height BMI: ${view.tiles['BMI (kg/m²)']}`,
  );
  t.assert(view.alert.length === 0, `a decimal height is refused: ${view.alert[0]}`);
  const [decimalMin, decimalMax] = rangeOf(170.5, 18.5, 24.9);
  t.assert(
    view.tiles['WHO healthy-weight range'] === `${num1(decimalMin)}–${num1(decimalMax)} kg`,
    `the range at 170.5 cm reads ${view.tiles['WHO healthy-weight range']}`,
  );

  // ── 4. The adult measurement range is enforced at both ends.
  for (const [height, weight, ok] of [
    ['90', '70', false],
    ['91.5', '70', true],
    ['274', '70', true],
    ['275', '70', false],
    ['170', '24', false],
    ['170', '25', true],
    ['170', '453', true],
    ['170', '454', false],
    ['', '70', false],
  ]) {
    await set(0, height);
    await set(1, weight);
    const seen = await read(page);
    t.assert(
      ok ? seen.alert.length === 0 : seen.alert.length > 0,
      `${height} cm / ${weight} kg is ${ok ? 'refused' : 'accepted'} (${seen.alert[0] ?? 'no message'})`,
    );
  }

  // ── 5. US customary: 5 ft 11 in and 160 lb, with the ranges in pounds (they stayed kg before).
  await set(0, '170');
  await set(1, '65');
  await page.getByRole('radio', { name: 'US customary', exact: true }).click();
  await page.waitForTimeout(400);
  view = await read(page);
  t.assert(view.inputs.length === 3, `US customary shows ${view.inputs.length} fields`);
  t.assert(
    view.inputs[0] === '5' && view.inputs[1] === '6.9',
    `170 cm shows as ${view.inputs[0]} ft ${view.inputs[1]} in`,
  );

  await set(0, '5');
  await set(1, '11');
  await set(2, '160');
  view = await read(page);
  const heightCm = round((5 * 12 + 11) * 2.54, 4);
  const weightKg = round(160 * 0.45359237, 4);
  t.assert(view.inputs.join('/') === '5/11/160', `US customary fields read ${view.inputs.join('/')}`);
  t.assert(
    view.tiles['BMI (kg/m²)'] === num1(round(bmiOf(heightCm, weightKg), 1)),
    `US BMI: ${view.tiles['BMI (kg/m²)']}`,
  );
  t.assert(view.tiles['WHO adult category'] === 'Healthy weight', `US WHO: ${view.tiles['WHO adult category']}`);
  const [usWhoMin, usWhoMax] = rangeOf(heightCm, 18.5, 24.9);
  t.assert(
    view.tiles['WHO healthy-weight range'] ===
      `${num1(round(usWhoMin * POUNDS_PER_KG, 1))}–${num1(round(usWhoMax * POUNDS_PER_KG, 1))} lb`,
    `the US range reads ${view.tiles['WHO healthy-weight range']}`,
  );
  const [usKMin, usKMax] = rangeOf(heightCm, 18.5, 22.9);
  t.assert(
    view.tiles['Korean healthy-weight range'] ===
      `${num1(round(usKMin * POUNDS_PER_KG, 1))}–${num1(round(usKMax * POUNDS_PER_KG, 1))} lb`,
    `the US Korean range reads ${view.tiles['Korean healthy-weight range']}`,
  );
  t.assert(!/ kg$/.test(view.tiles['WHO healthy-weight range']), 'a range is still shown in kilograms in the US view');

  // ── 6. Back to metric restores the same body and the metric ranges.
  await page.getByRole('radio', { name: 'Metric', exact: true }).click();
  await page.waitForTimeout(400);
  view = await read(page);
  t.assert(Number(view.inputs[0]) === heightCm, `the metric height came back as ${view.inputs[0]}`);
  t.assert(Math.abs(Number(view.inputs[1]) - weightKg) < 0.01, `the metric weight came back as ${view.inputs[1]}`);
  t.assert(/ kg$/.test(view.tiles['WHO healthy-weight range']), 'the metric range is not in kilograms');
  t.assert(
    (await page.getByRole('radio', { name: 'Metric', exact: true }).count()) === 1,
    'no radio is named “Metric”',
  );

  // ── 7. The measurements survive a reload.
  const before = await read(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(700);
  const after = await read(page);
  t.assert(after.inputs.join('/') === before.inputs.join('/'), `a reload changed the measurements (${after.inputs})`);
  t.assert(after.tiles['BMI (kg/m²)'] === before.tiles['BMI (kg/m²)'], 'a reload changed the BMI');

  // ── 8. The Korean page answers the same way, in kilograms, from its own default measurements.
  await page.evaluate(() => localStorage.removeItem('tools:bmi-calculator:state'));
  await t.open('/ko/bmi-calculator');
  await page.waitForTimeout(600);
  const korean = await read(page);
  t.assert(korean.tiles['BMI(kg/m²)'] === '22.5', `the Korean BMI reads ${JSON.stringify(korean.tiles['BMI(kg/m²)'])}`);
  t.assert(korean.tiles['WHO 성인 판정'] === '정상', `the Korean WHO category reads ${korean.tiles['WHO 성인 판정']}`);
  t.assert(
    korean.tiles['대한비만학회 성인 판정'] === '정상',
    `the Korean Korean-standard category reads ${korean.tiles['대한비만학회 성인 판정']}`,
  );

  // ── 9. 375 px, dark: the two columns stack instead of scrolling sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

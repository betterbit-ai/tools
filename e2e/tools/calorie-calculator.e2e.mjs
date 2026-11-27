/**
 * Calorie calculator: the Mifflin–St Jeor numbers recomputed independently, in both unit systems.
 *
 * Covers the defects this audit fixed:
 *  - a decimal point never survived a keystroke in the shared number input: typing 175.5 left
 *    “5175” in the height field and the page answered “enter a supported range”;
 *  - the first option of the sex group had the label and its hint as its accessible name instead of
 *    “Male”.
 */

const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, veryActive: 1.725, extraActive: 1.9 };
const GOAL = { lose: 0.85, maintain: 1, gain: 1.1 };

const round = (value) => Math.round(value + Number.EPSILON * Math.sign(value || 1));
const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * factor) / factor;
};

/** The same arithmetic the page documents, written here so the page is checked against numbers. */
const expected = (sex, age, heightCm, weightKg, activity = 'moderate', goal = 'maintain') => {
  const bmrRaw = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  const maintenance = round(bmrRaw * ACTIVITY[activity]);
  return {
    bmr: round(bmrRaw),
    maintenance,
    target: round(maintenance * GOAL[goal]),
    activityCalories: round(bmrRaw * ACTIVITY[activity] - bmrRaw),
  };
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
      selects: [...main.querySelectorAll('select')].map((s) => s.value),
      radios: [...main.querySelectorAll('[role=radio]')].map(
        (r) => `${r.textContent.trim()}=${r.getAttribute('aria-checked')}`,
      ),
      alert: [...main.querySelectorAll('[role=alert]')].map((el) => el.textContent.trim()),
      formulas: [...main.querySelectorAll('p.font-mono')].map((el) => el.textContent.trim()),
    };
  });

const kcal = (t, view, label, value) => {
  const shown = view.tiles[label];
  t.assert(shown !== undefined, `the page has no ${JSON.stringify(label)} tile (${JSON.stringify(view.tiles)})`);
  t.assert(shown === `${value.toLocaleString('en-US')} kcal/day`, `${label} reads ${shown}, expected ${value}`);
};

export default async function (t) {
  const page = t.page;
  await t.open('/calorie-calculator');
  await page.waitForTimeout(600);

  const numbers = page.locator('main input[inputmode=decimal]');
  const set = async (index, value) => {
    const field = numbers.nth(index);
    await field.click();
    await field.press('Control+a');
    if (value === '') await field.press('Backspace');
    else await field.type(String(value), { delay: 40 });
    await page.waitForTimeout(300);
  };

  // ── 1. The default profile: 30-year-old man, 175 cm, 70 kg, moderately active, maintaining.
  let view = await read(page);
  let want = expected('male', 30, 175, 70);
  kcal(t, view, 'Basal metabolic rate (BMR)', want.bmr);
  kcal(t, view, 'Maintenance (TDEE)', want.maintenance);
  kcal(t, view, 'Maintain weight (100%) target', want.target);
  kcal(t, view, 'Activity + digestion estimate', want.activityCalories);
  t.assert(
    /10 × 70 \+ 6\.25 × 175 − 5 × 30 \+ 5 = 1,649 kcal\/day/.test(view.formulas[0]),
    `formula: ${view.formulas[0]}`,
  );
  t.assert(
    /TDEE = BMR × 1\.55; target = TDEE × 1 = 2,556 kcal\/day/.test(view.formulas[1]),
    `formula: ${view.formulas[1]}`,
  );

  // ── 2. A decimal height survives typing (it used to arrive as 5175).
  await set(1, '175.5');
  view = await read(page);
  t.assert(view.inputs[1] === '175.5', `the height field reads ${JSON.stringify(view.inputs[1])}`);
  want = expected('male', 30, 175.5, 70);
  kcal(t, view, 'Basal metabolic rate (BMR)', want.bmr);

  // ── 3. A decimal weight survives typing too.
  await set(2, '70.5');
  view = await read(page);
  t.assert(view.inputs[2] === '70.5', `the weight field reads ${JSON.stringify(view.inputs[2])}`);
  want = expected('male', 30, 175.5, 70.5);
  kcal(t, view, 'Basal metabolic rate (BMR)', want.bmr);
  t.assert(view.alert.length === 0, `a decimal measurement is refused: ${view.alert[0]}`);

  // ── 4. A whole number typed over it still lands.
  await set(1, '175');
  await set(2, '70');
  await set(0, '35');
  view = await read(page);
  want = expected('male', 35, 175, 70);
  kcal(t, view, 'Basal metabolic rate (BMR)', want.bmr);

  // ── 5. The female constant is subtracted, not added.
  await page.getByRole('radio', { name: 'Female', exact: true }).click();
  await page.waitForTimeout(300);
  view = await read(page);
  want = expected('female', 35, 175, 70);
  kcal(t, view, 'Basal metabolic rate (BMR)', want.bmr);
  t.assert(view.formulas[0].includes('− 161 ='), `the female formula reads ${view.formulas[0]}`);
  await page.getByRole('radio', { name: 'Male', exact: true }).click();
  await page.waitForTimeout(250);

  // ── 6. Every activity level and every goal changes the target it claims to.
  for (const level of Object.keys(ACTIVITY)) {
    await page.locator('main select').nth(0).selectOption(level);
    await page.waitForTimeout(250);
    view = await read(page);
    want = expected('male', 35, 175, 70, level);
    kcal(t, view, 'Maintenance (TDEE)', want.maintenance);
    kcal(t, view, 'Activity + digestion estimate', want.activityCalories);
  }
  await page.locator('main select').nth(0).selectOption('moderate');
  for (const goal of Object.keys(GOAL)) {
    await page.locator('main select').nth(1).selectOption(goal);
    await page.waitForTimeout(250);
    view = await read(page);
    want = expected('male', 35, 175, 70, 'moderate', goal);
    kcal(
      t,
      view,
      `${{ lose: 'Lose weight (85% of maintenance)', maintain: 'Maintain weight (100%)', gain: 'Gain weight (110% of maintenance)' }[goal]} target`,
      want.target,
    );
  }
  await page.locator('main select').nth(1).selectOption('maintain');

  // ── 7. The adult range is enforced at both ends, and an empty field asks rather than guesses.
  const limits = [
    [0, '17', false],
    [0, '18', true],
    [0, '120', true],
    [0, '121', false],
    [1, '79', false],
    [1, '80', true],
    [1, '250', true],
    [1, '251', false],
    [2, '24', false],
    [2, '25', true],
    [2, '400', true],
    [2, '401', false],
  ];
  await set(0, '35');
  await set(1, '175');
  await set(2, '70');
  for (const [index, value, ok] of limits) {
    const keep = [
      await numbers.nth(0).inputValue(),
      await numbers.nth(1).inputValue(),
      await numbers.nth(2).inputValue(),
    ];
    await set(index, value);
    const seen = await read(page);
    t.assert(
      ok ? seen.alert.length === 0 : seen.alert.length > 0,
      `field ${index} = ${value} is ${ok ? 'refused' : 'accepted'} (${seen.alert[0] ?? 'no message'})`,
    );
    // Put the other two measurements back so the next limit is the only thing out of range.
    for (const [restore, position] of [
      ['35', 0],
      ['175', 1],
      ['70', 2],
    ]) {
      if (position !== index && keep[position] !== restore) await set(position, restore);
    }
  }
  await set(0, '');
  t.assert((await read(page)).alert.length > 0, 'an empty age was calculated instead of asking');
  await set(0, '35');

  // ── 8. US customary: the same person measured in feet, inches and pounds.
  await page.getByRole('radio', { name: 'US customary', exact: true }).click();
  await page.waitForTimeout(400);
  view = await read(page);
  t.assert(view.inputs.length === 4, `US customary shows ${view.inputs.length} number fields`);
  t.assert(view.inputs[1] === '5', `175 cm is shown as ${view.inputs[1]} ft`);
  t.assert(view.inputs[2] === '8.9', `175 cm is shown as ${view.inputs[2]} in`);

  await set(1, '5');
  await set(2, '11');
  await set(3, '160');
  view = await read(page);
  const inches = 5 * 12 + 11;
  const heightCm = roundTo(inches * 2.54, 4);
  const weightKg = roundTo(160 * 0.45359237, 4);
  want = expected('male', 35, heightCm, weightKg);
  kcal(t, view, 'Basal metabolic rate (BMR)', want.bmr);
  t.assert(view.inputs.slice(1).join('/') === '5/11/160', `US customary fields read ${view.inputs.slice(1).join('/')}`);

  // ── 9. Back to metric keeps the same body.
  await page.getByRole('radio', { name: 'Metric', exact: true }).click();
  await page.waitForTimeout(400);
  view = await read(page);
  t.assert(Number(view.inputs[1]) === heightCm, `the metric height came back as ${view.inputs[1]}`);
  t.assert(Math.abs(Number(view.inputs[2]) - weightKg) < 0.01, `the metric weight came back as ${view.inputs[2]}`);
  kcal(t, view, 'Basal metabolic rate (BMR)', want.bmr);

  // ── 10. Each segmented option is announced by its own label.
  t.assert(
    (await page.getByRole('radio', { name: 'Metric', exact: true }).count()) === 1,
    'no radio is named “Metric”',
  );
  t.assert((await page.getByRole('radio', { name: 'Male', exact: true }).count()) === 1, 'no radio is named “Male”');
  t.assert(
    (await page.getByRole('radio', { name: 'Female', exact: true }).count()) === 1,
    'no radio is named “Female”',
  );

  // ── 11. The profile survives a reload.
  const before = await read(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(700);
  const after = await read(page);
  t.assert(after.inputs.join('/') === before.inputs.join('/'), `a reload changed the measurements (${after.inputs})`);
  t.assert(
    after.tiles['Basal metabolic rate (BMR)'] === before.tiles['Basal metabolic rate (BMR)'],
    'a reload changed the result',
  );

  // ── 12. The Korean page calculates the same numbers, starting from its own default profile.
  await page.evaluate(() => localStorage.removeItem('tools:calorie-calculator:state'));
  await t.open('/ko/calorie-calculator');
  await page.waitForTimeout(600);
  const korean = await read(page);
  const koreanWant = expected('male', 30, 175, 70);
  t.assert(
    korean.tiles['기초대사량(BMR)'] === `${koreanWant.bmr.toLocaleString('en-US')} kcal/일`,
    `the Korean BMR reads ${JSON.stringify(korean.tiles)}`,
  );
  t.assert(
    (await page.getByRole('radio', { name: '여성', exact: true }).count()) === 1,
    'the Korean page has no 여성 option',
  );
  await page.getByRole('radio', { name: '여성', exact: true }).click();
  await page.waitForTimeout(300);
  const koreanFemale = await read(page);
  t.assert(
    koreanFemale.tiles['기초대사량(BMR)'] === `${expected('female', 30, 175, 70).bmr.toLocaleString('en-US')} kcal/일`,
    'the Korean female result is wrong',
  );

  // ── 13. 375 px, dark: fields stack instead of scrolling sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

/** The live converter accepts realistic values and every control updates a visible, accurate result. */

const METERS_PER_UNIT = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const parseDisplayedNumber = (text) => Number(text.replaceAll(',', '').replace('×', 'e').replace(/\s+/g, ''));

async function displayedResult(page, labelPattern) {
  const label = page.getByText(labelPattern).first();
  return parseDisplayedNumber(await label.locator('..').locator('div').first().innerText());
}

function assertClose(t, actual, expected, message, relativeTolerance = 5e-5) {
  const tolerance = Math.max(1e-10, Math.abs(expected) * relativeTolerance);
  t.assert(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, got ${actual}`);
}

export default async function (t) {
  await t.open('/length-converter');

  const value = t.page.getByRole('textbox', { name: /^Value/ });
  const from = t.page.getByRole('combobox', { name: /^From/ });
  const to = t.page.getByRole('combobox', { name: /^To/ });

  // A realistic pasted, grouped value works and every destination-unit option recalculates it.
  await value.fill('1,234.5');
  const grouped = 1234.5;
  for (const unit of Object.keys(METERS_PER_UNIT)) {
    await to.selectOption(unit);
    const actual = await displayedResult(t.page, /^Result \(/);
    const expected = (grouped * METERS_PER_UNIT.cm) / METERS_PER_UNIT[unit];
    assertClose(t, actual, expected, `cm to ${unit}`);
  }

  // The source selector and swap button both change the conversion, preserving full precision.
  await from.selectOption('mi');
  await to.selectOption('km');
  await value.fill('1');
  assertClose(t, await displayedResult(t.page, /^Result \(/), 1.609344, 'mile to kilometer');
  await value.focus();
  await t.page.keyboard.press('Tab');
  await t.page.keyboard.press('Tab');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Swap units',
    'keyboard focus did not reach the swap control',
  );
  await t.page.keyboard.press('Enter');
  t.assert((await from.inputValue()) === 'km' && (await to.inputValue()) === 'mi', 'swap did not flip both units');
  assertClose(t, await displayedResult(t.page, /^Result \(/), 1, 'swapped value should preserve the same length');

  // Edge values stay honest: negatives and zero convert, malformed and overflowing values explain the failure.
  await value.fill('-2.54');
  await from.selectOption('cm');
  await to.selectOption('in');
  assertClose(t, await displayedResult(t.page, /^Result \(/), -1, 'negative centimeters to inches');
  await value.fill('0');
  t.assert((await displayedResult(t.page, /^Result \(/)) === 0, 'zero should display as zero');
  await value.fill('12cm');
  await t.waitForText('Enter a valid number, for example 1,234.5.');
  await value.fill('1e308');
  await from.selectOption('km');
  await to.selectOption('mm');
  await t.waitForText('This result is too large to display. Use a smaller value.');

  // All three coupled height controls are editable in both directions.
  const feet = t.page.getByRole('spinbutton', { name: 'Feet', exact: true });
  const inches = t.page.getByRole('spinbutton', { name: 'Inches', exact: true });
  const centimeters = t.page.getByRole('spinbutton', { name: 'Centimeters', exact: true });
  t.assert((await centimeters.inputValue()) === '170', 'first-time height default should be 170 cm');
  await feet.fill('5');
  await inches.fill('7');
  assertClose(t, Number(await centimeters.inputValue()), (5 * 12 + 7) * 2.54, 'feet and inches to centimeters', 1e-3);
  await centimeters.fill('182.88');
  t.assert((await feet.inputValue()) === '6', 'centimeters did not update feet');
  t.assert((await inches.inputValue()) === '0', 'centimeters did not update inches');

  // Main-page work survives a reload.
  await value.fill('42.25');
  await from.selectOption('yd');
  await to.selectOption('m');
  const savedState = await t.page.evaluate(() => JSON.parse(localStorage.getItem('tools:length-converter:state')));
  t.assert(
    savedState.value === '42.25' && savedState.from === 'yd' && savedState.to === 'm',
    `latest state was not saved immediately: ${JSON.stringify(savedState)}`,
  );
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.waitForFunction(() => document.querySelector('input[type="text"]')?.value === '42.25');
  t.assert(
    (await t.page.getByRole('textbox', { name: /^Value/ }).inputValue()) === '42.25',
    'value was not restored after reload',
  );
  t.assert(
    (await t.page.getByRole('combobox', { name: /^From/ }).inputValue()) === 'yd',
    'source unit was not restored after reload',
  );
  t.assert(
    (await t.page.getByRole('combobox', { name: /^To/ }).inputValue()) === 'm',
    'destination unit was not restored after reload',
  );

  // Korean UI accepts the same comma-grouped number format and shows a localized result.
  await t.open('/ko/length-converter');
  await t.page.getByRole('textbox', { name: /^값/ }).fill('1,000');
  await t.page.getByRole('combobox', { name: /^변환할 단위/ }).selectOption('m');
  await t.page.getByRole('combobox', { name: /^결과 단위/ }).selectOption('cm');
  t.assert((await displayedResult(t.page, /^결과 \(/)) === 100000, '한국어 1,000m 변환 결과가 100,000cm가 아님');
  const koreanCopy = await t.page.locator('main').textContent();
  t.assert(koreanCopy.includes('1마일=1.609344km'), '한국어 정확도 안내의 마일 단위가 틀림');
  t.assert(!koreanCopy.includes('1마일=1609.344km'), '한국어 정확도 안내에 잘못된 마일 단위가 남아 있음');

  // The complete panel fits a 375 px viewport and remains functional in dark mode.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(
    (await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );
}

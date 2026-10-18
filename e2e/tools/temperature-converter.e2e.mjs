/** The converter accepts everyday temperature input and keeps exact conversion and recipe-table values distinct. */

const parseDisplayedNumber = (text) =>
  Number(text.replaceAll(',', '').replaceAll(' ', '').replace('×', 'e').replace(/\s+/g, ''));

function convert(value, from, to) {
  const celsius = from === 'c' ? value : from === 'f' ? ((value - 32) * 5) / 9 : value - 273.15;
  return to === 'c' ? celsius : to === 'f' ? (celsius * 9) / 5 + 32 : celsius + 273.15;
}

async function displayedResult(page) {
  const liveResult = page.locator('main [aria-live="polite"]').first();
  return parseDisplayedNumber(await liveResult.locator('.tabular').first().innerText());
}

function assertClose(t, actual, expected, message, relativeTolerance = 5e-5) {
  const tolerance = Math.max(1e-9, Math.abs(expected) * relativeTolerance);
  t.assert(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, displayed ${actual}`);
}

async function clearAndReload(t, storageKey = 'tools:temperature-converter:state') {
  await t.page.evaluate((key) => localStorage.removeItem(key), storageKey);
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
}

export default async function (t) {
  await t.open('/temperature-converter');
  await clearAndReload(t);

  const value = t.page.getByRole('textbox', { name: /^Value/ });
  const from = t.page.getByRole('combobox', { name: 'From', exact: true });
  const to = t.page.getByRole('combobox', { name: 'To', exact: true });

  // A realistic body temperature converts to every destination using formulas independent of app code.
  await value.fill('37');
  await from.selectOption('c');
  for (const unit of ['c', 'f', 'k']) {
    await to.selectOption(unit);
    assertClose(t, await displayedResult(t.page), convert(37, 'c', unit), `37 Celsius to ${unit}`);
  }

  // Changing the source and using the keyboard-accessible swap control both preserve the represented temperature.
  await from.selectOption('f');
  await to.selectOption('c');
  await value.fill('98.6');
  assertClose(t, await displayedResult(t.page), 37, '98.6 Fahrenheit to Celsius');
  await value.focus();
  await t.page.keyboard.press('Tab');
  await t.page.keyboard.press('Tab');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Swap units',
    'keyboard focus did not reach the swap control',
  );
  await t.page.keyboard.press('Enter');
  t.assert((await from.inputValue()) === 'c' && (await to.inputValue()) === 'f', 'swap did not reverse both units');
  assertClose(t, await displayedResult(t.page), 98.6, 'swapped temperature');

  // The oven table must use recipe-standard pairs, not silently turn 180°C into the mathematical 356°F.
  await from.selectOption('c');
  await to.selectOption('f');
  const gasMark4 = t.page.locator('table tbody tr').nth(3).locator('td');
  t.assert(parseDisplayedNumber(await gasMark4.nth(0).innerText()) === 4, 'gas mark 4 row is missing');
  t.assert(parseDisplayedNumber(await gasMark4.nth(1).innerText()) === 180, 'gas mark 4 Celsius value is wrong');
  t.assert(parseDisplayedNumber(await gasMark4.nth(2).innerText()) === 350, 'gas mark 4 Fahrenheit value is wrong');
  await from.selectOption('f');
  await to.selectOption('c');
  t.assert(
    parseDisplayedNumber(await gasMark4.nth(1).innerText()) === 350,
    'reversed table lost the standard Fahrenheit value',
  );
  t.assert(
    parseDisplayedNumber(await gasMark4.nth(2).innerText()) === 180,
    'reversed table lost the standard Celsius value',
  );

  // Physical edge values remain convertible, while impossible, malformed, and overflowing input is explained visibly.
  await from.selectOption('k');
  await to.selectOption('c');
  await value.fill('0');
  assertClose(t, await displayedResult(t.page), -273.15, 'absolute zero');
  t.assert((await t.page.getByRole('alert').count()) === 0, 'absolute zero itself was marked impossible');
  await value.fill('-0.01');
  await t.waitForText('colder than absolute zero');
  assertClose(t, await displayedResult(t.page), -273.16, 'below-absolute-zero mathematical conversion');
  for (const [input, message] of [
    ['12 K', 'unit-suffixed input'],
    ['1e309', 'overflowing input'],
  ]) {
    await value.fill(input);
    t.assert(await t.page.getByRole('alert').isVisible(), `${message} failed without a visible explanation`);
    t.assert(Number.isNaN(await displayedResult(t.page)), `${message} was silently presented as a conversion`);
  }
  await from.selectOption('c');
  await to.selectOption('f');
  await value.fill('1e308');
  await t.waitForText('This result is too large to display. Use a smaller value.');
  t.assert(Number.isNaN(await displayedResult(t.page)), 'overflowing conversion was presented as a successful result');
  await to.selectOption('c');
  await value.fill('1e-7');
  assertClose(t, await displayedResult(t.page), 1e-7, 'small nonzero value', 1e-9);
  t.assert(
    /E-7/i.test(await t.page.locator('main [aria-live="polite"] .tabular').first().innerText()),
    'small nonzero value was not kept visible with scientific notation',
  );
  await value.fill('');
  t.assert(Number.isNaN(await displayedResult(t.page)), 'empty input was silently converted as zero');

  // Main-page choices and the exact typed representation survive reload.
  await value.fill('1,234.5');
  await from.selectOption('c');
  await to.selectOption('k');
  assertClose(t, await displayedResult(t.page), convert(1234.5, 'c', 'k'), 'grouped Celsius input');
  await t.page.waitForFunction(() => {
    const saved = JSON.parse(localStorage.getItem('tools:temperature-converter:state'));
    return saved?.value === '1,234.5' && saved?.from === 'c' && saved?.to === 'k';
  });
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.waitForFunction(() => document.querySelector('input')?.value === '1,234.5');
  t.assert(
    (await t.page.getByRole('textbox', { name: /^Value/ }).inputValue()) === '1,234.5',
    'value was not restored',
  );
  t.assert(
    (await t.page.getByRole('combobox', { name: 'From', exact: true }).inputValue()) === 'c',
    'source was not restored',
  );
  t.assert(
    (await t.page.getByRole('combobox', { name: 'To', exact: true }).inputValue()) === 'k',
    'destination was not restored',
  );

  // Variant pages start in their promised direction and value instead of leaking the main-page saved state.
  await t.open('/temperature-converter/fahrenheit-to-celsius');
  t.assert(
    (await t.page.getByRole('textbox', { name: /^Value/ }).inputValue()) === '98.6',
    'variant value preset was not applied',
  );
  t.assert(
    (await t.page.getByRole('combobox', { name: 'From', exact: true }).inputValue()) === 'f' &&
      (await t.page.getByRole('combobox', { name: 'To', exact: true }).inputValue()) === 'c',
    'variant unit presets were not applied',
  );
  assertClose(t, await displayedResult(t.page), 37, 'variant result');

  // Korean users can paste comma-grouped full-width input and receive the localized result.
  await t.open('/ko/temperature-converter');
  await clearAndReload(t);
  const koreanValue = t.page.getByRole('textbox', { name: /^값/ });
  await koreanValue.fill('１，０００．５');
  await t.page.getByRole('combobox', { name: '변환할 단위', exact: true }).selectOption('c');
  await t.page.getByRole('combobox', { name: '결과 단위', exact: true }).selectOption('f');
  assertClose(t, await displayedResult(t.page), convert(1000.5, 'c', 'f'), '한국어 전각 숫자 변환');

  // The complete tool remains usable on a phone-sized viewport and in dark mode.
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

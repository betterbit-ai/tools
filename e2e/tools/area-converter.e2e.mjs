/** The built area converter accepts realistic property values, every control recomputes, and invalid input is explicit. */

const SQUARE_METRES_PER_UNIT = {
  squareMeter: 1,
  squareFoot: 0.09290304,
  squareYard: 0.83612736,
  acre: 4046.8564224,
  hectare: 10_000,
  pyeong: 400 / 121,
};
const UNITS = Object.keys(SQUARE_METRES_PER_UNIT);

function convert(value, from, to) {
  return (value * SQUARE_METRES_PER_UNIT[from]) / SQUARE_METRES_PER_UNIT[to];
}

function parseDisplayedNumber(text) {
  return Number(text.replaceAll(',', '').replaceAll(' ', '').trim());
}

async function displayedResult(page, labelPattern) {
  const label = page.getByText(labelPattern).first();
  return parseDisplayedNumber(await label.locator('..').locator('div').first().innerText());
}

function assertClose(t, actual, expected, message, relativeTolerance = 5e-5) {
  const tolerance = Math.max(1e-10, Math.abs(expected) * relativeTolerance);
  t.assert(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, displayed ${actual}`);
}

export default async function (t) {
  await t.open('/area-converter');
  await t.page.evaluate(() => localStorage.removeItem('tools:area-converter:state'));
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });

  const value = t.page.getByRole('textbox', { name: 'Area', exact: true });
  const from = t.page.getByRole('combobox', { name: 'From', exact: true });
  const to = t.page.getByRole('combobox', { name: 'To', exact: true });

  // Typical property input and every unit choice use independently calculated factors.
  await value.fill('1,000');
  for (const source of UNITS) {
    await from.selectOption(source);
    for (const destination of UNITS) {
      await to.selectOption(destination);
      assertClose(
        t,
        await displayedResult(t.page, /^Result in /),
        convert(1000, source, destination),
        `${source} to ${destination}`,
      );
    }
  }

  // The reference table follows both source and destination fields.
  await from.selectOption('squareFoot');
  await to.selectOption('squareMeter');
  const table = t.page.locator('table');
  t.assert(
    (await table.locator('th').allInnerTexts()).join('|').includes('Square feet (ft²)|Square metres (m²)'),
    'quick-reference headings did not follow the selected units',
  );
  assertClose(
    t,
    parseDisplayedNumber(await table.locator('tbody tr').first().locator('td').nth(1).innerText()),
    convert(1, 'squareFoot', 'squareMeter'),
    'quick-reference value',
  );

  // Swap reverses both fields and retains the displayed conversion as the next input.
  await value.fill('84');
  await from.selectOption('squareMeter');
  await to.selectOption('pyeong');
  const pyeong = convert(84, 'squareMeter', 'pyeong');
  assertClose(t, await displayedResult(t.page, /^Result in /), pyeong, '84 m² to pyeong');
  await t.page.getByRole('button', { name: 'Swap units', exact: true }).click();
  t.assert(
    (await from.inputValue()) === 'pyeong' && (await to.inputValue()) === 'squareMeter',
    'swap did not reverse both units',
  );
  assertClose(t, await displayedResult(t.page, /^Result in /), 84, 'swapped pyeong result', 5e-5);

  // Bad values never masquerade as zero and their explanation is visible to users.
  for (const [input, message] of [
    ['twelve', 'malformed area'],
    ['-1', 'negative area'],
    ['1000000000001', 'over-limit area'],
  ]) {
    await value.fill(input);
    t.assert(await t.page.getByRole('alert').isVisible(), `${message} failed without a visible explanation`);
    t.assert(
      Number.isNaN(await displayedResult(t.page, /^Result in /)),
      `${message} was silently presented as a conversion`,
    );
    t.assert(
      await t.page.getByRole('button', { name: 'Swap units', exact: true }).isDisabled(),
      `${message} left swap enabled`,
    );
  }

  // Copy includes each supported unit and saved state returns after a reload.
  await value.fill('1000');
  await from.selectOption('squareFoot');
  await to.selectOption('squareMeter');
  await t.page.getByRole('button', { name: 'Copy all results', exact: true }).click();
  await t.waitForText('Copied');
  const copied = await t.page.evaluate(() => navigator.clipboard.readText());
  for (const unit of [
    'Square metres (m²)',
    'Square feet (ft²)',
    'Square yards (yd²)',
    'Acres (ac)',
    'Hectares (ha)',
    'Pyeong (평)',
  ]) {
    t.assert(copied.includes(`${unit}:`), `copied results omitted ${unit}`);
  }
  await value.fill('42.25');
  await from.selectOption('squareYard');
  await to.selectOption('squareMeter');
  await t.page.waitForFunction(() => {
    const saved = JSON.parse(localStorage.getItem('tools:area-converter:state'));
    return saved?.value === '42.25' && saved?.from === 'squareYard' && saved?.to === 'squareMeter';
  });
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.waitForFunction(() => document.querySelector('input[type="text"]')?.value === '42.25');
  t.assert((await value.inputValue()) === '42.25', 'area value was not restored');
  t.assert(
    (await from.inputValue()) === 'squareYard' && (await to.inputValue()) === 'squareMeter',
    'area units were not restored',
  );

  // Korean visitors can paste full-width grouped numbers and still get the exact conversion.
  await t.open('/ko/area-converter');
  const koreanValue = t.page.getByRole('textbox', { name: '넓이', exact: true });
  const koreanFrom = t.page.getByRole('combobox', { name: '변환할 단위', exact: true });
  const koreanTo = t.page.getByRole('combobox', { name: '결과 단위', exact: true });
  await koreanValue.fill('１，０００．５');
  await koreanFrom.selectOption('squareMeter');
  await koreanTo.selectOption('pyeong');
  assertClose(
    t,
    await displayedResult(t.page, /^결과 \(/),
    convert(1000.5, 'squareMeter', 'pyeong'),
    'Korean full-width number conversion',
  );

  // A clipboard failure is visible instead of silently discarding the requested copy.
  await t.page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => Promise.reject(new Error('clipboard blocked')) },
    });
  });
  await t.page.getByRole('button', { name: '결과 모두 복사', exact: true }).click();
  await t.waitForText('결과를 복사하지 못했습니다.');

  // Keyboard focus, a 375 px viewport, and dark rendering remain usable.
  await koreanValue.focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    await t.page.evaluate(() => document.activeElement?.tagName === 'SELECT'),
    'keyboard focus did not reach a unit selector',
  );
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

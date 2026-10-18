/** The live converter accepts realistic speed and pace inputs and every control updates an independently verified result. */

const METRES_PER_SECOND = {
  kmh: 1 / 3.6,
  mph: 0.44704,
  ms: 1,
  knot: 1852 / 3600,
};

const parseDisplayedNumber = (text) => Number(text.replaceAll(',', '').replaceAll(' ', '').trim());

async function primaryResult(page) {
  const label = page.getByText(/^(Result in|결과 \()/).first();
  return parseDisplayedNumber(await label.locator('..').locator('div').first().innerText());
}

async function statValue(page, label) {
  const card = page.getByText(label, { exact: true }).locator('..');
  return (await card.locator('div').first().innerText()).trim();
}

function convert(value, from, to) {
  return (value * METRES_PER_SECOND[from]) / METRES_PER_SECOND[to];
}

function assertClose(t, actual, expected, message, relativeTolerance = 5e-4) {
  const tolerance = Math.max(1e-10, Math.abs(expected) * relativeTolerance);
  t.assert(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, displayed ${actual}`);
}

export default async function (t) {
  await t.open('/speed-converter');
  await t.page.evaluate(() => localStorage.removeItem('tools:speed-converter:state'));
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });

  const value = t.page.locator('main input[inputmode="decimal"]').first();
  const from = t.page.getByRole('combobox', { name: 'From', exact: true });
  const to = t.page.getByRole('combobox', { name: 'To', exact: true });

  // A common road speed converts to every destination with independently computed fixed factors.
  await value.fill('60');
  await from.selectOption('mph');
  for (const unit of Object.keys(METRES_PER_SECOND)) {
    await to.selectOption(unit);
    assertClose(t, await primaryResult(t.page), convert(60, 'mph', unit), `60 mph to ${unit}`);
  }

  // Pasted grouped values work, the source selector recalculates, and quick-reference headings follow both selectors.
  await value.fill('1,234.5');
  await from.selectOption('kmh');
  await to.selectOption('ms');
  assertClose(t, await primaryResult(t.page), convert(1234.5, 'kmh', 'ms'), 'grouped km/h to m/s');
  const quickTable = t.page.locator('table');
  t.assert(
    (await quickTable.locator('th').allInnerTexts())
      .join('|')
      .includes('Kilometres per hour (km/h)|Metres per second (m/s)'),
    'quick-reference headings did not follow the source and destination selectors',
  );
  assertClose(
    t,
    parseDisplayedNumber(await quickTable.locator('tbody tr').first().locator('td').nth(1).innerText()),
    convert(5, 'kmh', 'ms'),
    'quick-reference result',
  );

  // Swap reverses the units without throwing away conversion precision.
  await value.fill('1');
  await from.selectOption('knot');
  await to.selectOption('mph');
  const exactMph = convert(1, 'knot', 'mph');
  assertClose(t, await primaryResult(t.page), exactMph, 'one knot to mph');
  await t.page.getByRole('button', { name: 'Swap', exact: true }).click();
  t.assert(
    (await from.inputValue()) === 'mph' && (await to.inputValue()) === 'knot',
    'Swap did not reverse both units',
  );
  assertClose(t, await primaryResult(t.page), 1, 'swapped knot value', 5e-7);

  // Zero remains valid, while malformed, negative, and out-of-range values fail visibly instead of becoming zero.
  await value.fill('0');
  t.assert((await primaryResult(t.page)) === 0, 'zero speed did not remain zero');
  t.assert((await statValue(t.page, 'Pace (min/km)')) === '—', 'zero speed should have no running pace');
  for (const [input, message] of [
    ['12 mph', 'malformed input'],
    ['-1', 'negative input'],
    ['1000000000001', 'over-limit input'],
  ]) {
    await value.fill(input);
    t.assert(await t.page.getByRole('alert').isVisible(), `${message} failed without a visible explanation`);
    t.assert(Number.isNaN(await primaryResult(t.page)), `${message} was silently presented as a numeric conversion`);
  }

  // Copy exposes all four exact conversion categories and both pace forms.
  await value.fill('60');
  await from.selectOption('mph');
  await to.selectOption('kmh');
  await t.page.getByRole('button', { name: 'Copy all results', exact: true }).click();
  await t.waitForText('Copied');
  const copied = await t.page.evaluate(() => navigator.clipboard.readText());
  for (const label of [
    'Kilometres per hour (km/h)',
    'Miles per hour (mph)',
    'Metres per second (m/s)',
    'Knots (kn)',
    'Pace (min/km)',
    'Pace (min/mi)',
  ]) {
    t.assert(copied.includes(`${label}:`), `copied results omitted ${label}`);
  }

  // Both pace fields and the distance selector update speed and reciprocal pace results.
  await t.page.getByRole('radio', { name: 'Running pace', exact: true }).click();
  const minutes = t.page.getByRole('spinbutton', { name: /^Minutes/ });
  const seconds = t.page.getByRole('spinbutton', { name: /^Seconds/ });
  const distance = t.page.getByRole('combobox', { name: 'Pace distance', exact: true });
  await minutes.fill('5');
  await seconds.fill('0');
  await distance.selectOption('km');
  assertClose(t, await primaryResult(t.page), 12, '5:00 min/km to km/h');
  t.assert((await statValue(t.page, 'Pace (min/mi)')) === '8:03', '5:00 min/km did not produce 8:03 min/mi');
  await minutes.fill('4');
  assertClose(t, await primaryResult(t.page), 15, 'minutes control');
  await seconds.fill('30');
  assertClose(t, await primaryResult(t.page), 60 / 4.5, 'seconds control');
  await distance.selectOption('mi');
  assertClose(t, await primaryResult(t.page), (1609.344 / 270) * 3.6, 'pace-distance control');

  // Impossible pace values are explained and never masquerade as a stopped runner.
  await seconds.fill('60');
  t.assert(await t.page.getByRole('alert').isVisible(), '60 pace seconds failed without a visible explanation');
  t.assert(Number.isNaN(await primaryResult(t.page)), 'invalid pace was silently presented as zero speed');
  await seconds.fill('30');
  await minutes.fill('4.5');
  t.assert(await t.page.getByRole('alert').isVisible(), 'fractional pace minutes failed without a visible explanation');
  await t.page.getByRole('radio', { name: 'Speed', exact: true }).click();
  t.assert(
    (await t.page.getByRole('alert').count()) === 0,
    'a hidden invalid pace incorrectly marked speed mode invalid',
  );
  assertClose(t, await primaryResult(t.page), convert(60, 'mph', 'kmh'), 'speed after leaving invalid pace');
  await t.page.getByRole('radio', { name: 'Running pace', exact: true }).click();
  t.assert(await t.page.getByRole('alert').isVisible(), 'invalid pace was lost when returning to pace mode');

  // Every saved pace choice survives reload, matching the autosave claim.
  await minutes.fill('6');
  await seconds.fill('15');
  await distance.selectOption('mi');
  await t.page.waitForFunction(() => {
    const saved = JSON.parse(localStorage.getItem('tools:speed-converter:state'));
    return (
      saved?.mode === 'pace' &&
      saved?.paceMinutes === 6 &&
      saved?.paceSeconds === 15 &&
      saved?.paceDistance === 'mi' &&
      saved?.to === 'kmh'
    );
  });
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.waitForFunction(() => document.querySelector('input')?.value === '6');
  t.assert(
    await t.page.getByRole('radio', { name: 'Running pace', exact: true }).isChecked(),
    'pace mode was not restored',
  );
  t.assert(
    (await t.page.getByRole('spinbutton', { name: /^Seconds/ }).inputValue()) === '15',
    'pace seconds were not restored',
  );
  t.assert(
    (await t.page.getByRole('combobox', { name: 'Pace distance', exact: true }).inputValue()) === 'mi',
    'pace distance was not restored',
  );

  // Korean users can paste full-width, comma-grouped input and receive the localized result.
  await t.open('/ko/speed-converter');
  await t.page.evaluate(() => localStorage.removeItem('tools:speed-converter:state'));
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  const koreanValue = t.page.locator('main input[inputmode="decimal"]').first();
  await koreanValue.fill('１，０００．５');
  await t.page.getByRole('combobox', { name: '변환할 단위', exact: true }).selectOption('kmh');
  await t.page.getByRole('combobox', { name: '결과 단위', exact: true }).selectOption('mph');
  assertClose(t, await primaryResult(t.page), convert(1000.5, 'kmh', 'mph'), '한국어 전각 숫자 변환');

  // Keyboard focus, a 375 px viewport, and dark rendering all remain usable.
  await koreanValue.focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    await t.page.evaluate(
      () => document.activeElement?.tagName === 'SELECT' && document.activeElement?.value === 'kmh',
    ),
    'keyboard focus did not reach the source-unit selector',
  );
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal page overflow',
  );
  t.assert(
    (await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );
}

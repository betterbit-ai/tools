/**
 * Shoe size converter: one adult size in, the published row out. The chart below is the
 * adult reference table the page documents, and every value it shows must be reachable
 * from any of the six systems (a conversion that cannot round-trip is a wrong conversion).
 * Also covers the paste formats this audit added: "26.5cm" in Korea (mm) is 265 mm, not an
 * out-of-range 26.5, and "US 8½" is 8.5.
 */

/** [mm, US men, US women, UK, EU] — the published adult reference row for each length. */
const CHART = [
  [210, 3, 4.5, 2.5, 34],
  [215, 3.5, 5, 3, 34.5],
  [220, 4, 5.5, 3.5, 35],
  [225, 4.5, 6, 4, 36],
  [230, 5, 6.5, 4.5, 36.5],
  [235, 5.5, 7, 5, 37],
  [240, 6, 7.5, 5.5, 38],
  [245, 6.5, 8, 6, 38.5],
  [250, 7, 8.5, 6.5, 39],
  [255, 7.5, 9, 7, 40],
  [260, 8, 9.5, 7.5, 40.5],
  [265, 8.5, 10, 8, 41],
  [270, 9, 10.5, 8.5, 42],
  [275, 9.5, 11, 9, 42.5],
  [280, 10, 11.5, 9.5, 43],
  [285, 10.5, 12, 10, 44],
  [290, 11, 12.5, 10.5, 44.5],
  [295, 11.5, 13, 11, 45],
  [300, 12, 13.5, 11.5, 46],
  [305, 12.5, 14, 12, 46.5],
  [310, 13, 14.5, 12.5, 47],
].map(([mm, usMen, usWomen, uk, eu]) => ({ kr: mm, jp: mm / 10, usMen, usWomen, uk, eu }));

const SYSTEMS = ['kr', 'jp', 'usMen', 'usWomen', 'uk', 'eu'];

const rowFor = (value, system) =>
  CHART.reduce((closest, row) => (Math.abs(row[system] - value) < Math.abs(closest[system] - value) ? row : closest));

const LABELS = {
  en: {
    kr: 'Korea (mm)',
    jp: 'Japan (cm)',
    usMen: 'US men',
    usWomen: 'US women',
    uk: 'UK',
    eu: 'EU',
  },
  ko: {
    kr: '한국 (mm)',
    jp: '일본 (cm)',
    usMen: '미국 남성',
    usWomen: '미국 여성',
    uk: '영국 (UK)',
    eu: '유럽 (EU)',
  },
};

async function tap(locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await locator.click();
}

/** The value a system's stat card shows, read from the results panel only. */
async function shown(page, locales, system) {
  const panel = page.locator('main [aria-live="polite"]').first();
  const card = panel.getByText(locales[system], { exact: true }).first().locator('..');
  return Number((await card.innerText()).replace(/[^\d.]/g, ''));
}

function assertRow(t, actual, expected, message) {
  for (const system of SYSTEMS) {
    t.assert(
      actual[system] === expected[system],
      `${message}: ${system} expected ${expected[system]}, displayed ${actual[system]}`,
    );
  }
}

export default async function (t) {
  const page = t.page;
  const labels = LABELS.en;

  await t.open('/shoe-size-converter');
  await page.evaluate(() => localStorage.removeItem('tools:shoe-size-converter:state'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });

  const field = page.locator('main input[type="text"]').first();
  const system = page.locator('main select').first();
  const brand = page.locator('main select').nth(1);
  const readAll = async () => {
    const actual = {};
    for (const key of SYSTEMS) actual[key] = await shown(page, labels, key);
    return actual;
  };

  // The opening state is the Korean 260 mm baseline the page advertises.
  t.assert((await field.inputValue()) === '260', `the field did not open on 260 (holds ${await field.inputValue()})`);
  assertRow(t, await readAll(), rowFor(260, 'kr'), 'default 260 mm');

  // Any of the six systems round-trips to the same published row, for every row in the chart.
  for (const row of CHART) {
    for (const from of SYSTEMS) {
      await system.selectOption(from);
      await field.fill(String(row[from]));
      assertRow(t, await readAll(), row, `${row[from]} read as ${from}`);
    }
  }

  // Japan is centimetres and Korea is millimetres for the same foot length, on every row.
  for (const row of CHART) {
    t.assert(row.jp === row.kr / 10, `row ${row.kr} mm does not equal ${row.jp} cm`);
  }

  // Between-size values land on the nearest published row instead of inventing one.
  await system.selectOption('kr');
  await field.fill('262');
  assertRow(t, await readAll(), rowFor(262, 'kr'), '262 mm rounded to the nearest row');
  await system.selectOption('usMen');
  await field.fill('8.8');
  assertRow(t, await readAll(), rowFor(8.8, 'usMen'), 'US men 8.8 rounded to the nearest row');

  // What a product page shows can be pasted as written: a unit is converted into the
  // unit of the chosen system instead of being read as a wrong, out-of-range number.
  await system.selectOption('kr');
  await field.fill('26.5cm');
  assertRow(t, await readAll(), rowFor(265, 'kr'), '26.5 cm pasted into Korea (mm) is 265 mm');
  await field.fill('265㎜');
  assertRow(t, await readAll(), rowFor(265, 'kr'), '265㎜ with the square-millimetre sign');
  await system.selectOption('jp');
  await field.fill('260 mm');
  assertRow(t, await readAll(), rowFor(26, 'jp'), '260 mm pasted into Japan (cm) is 26 cm');
  await system.selectOption('usMen');
  await field.fill('US 8½');
  assertRow(t, await readAll(), rowFor(8.5, 'usMen'), 'US 8½ pasted with a Unicode half size');
  await system.selectOption('eu');
  await field.fill('EU 42.5');
  assertRow(t, await readAll(), rowFor(42.5, 'eu'), 'EU 42.5 with a country prefix');

  // Leaving the field shows the number that was read, not the pasted decoration.
  await system.selectOption('kr');
  await field.fill('26.5cm');
  await field.blur();
  t.assert(
    (await field.inputValue()) === '265',
    `the read size was not shown back (holds ${await field.inputValue()})`,
  );

  // Out-of-range input is refused in words, never presented as a row.
  await field.fill('205');
  t.assert(await page.getByRole('alert').isVisible(), 'a size below the chart showed no explanation');
  t.assert(
    (await page.locator('main [aria-live="polite"]').first().innerText()).includes(
      'Enter a size in the supported adult range',
    ),
    'an out-of-range size still showed a result',
  );
  await field.fill('');
  await t.waitForText('Enter a size in the supported adult range');
  await field.fill('260');
  t.assert(!(await page.getByRole('alert').isVisible()), 'the explanation stayed after a valid size was entered');

  // Copy carries every label, so the numbers survive leaving the page.
  await system.selectOption('kr');
  await field.fill('280');
  await tap(page.getByRole('button', { name: 'Copy sizes', exact: true }));
  await t.waitForText('Copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  for (const label of Object.values(labels)) {
    t.assert(copied.includes(`${label}:`), `the copied sizes omitted ${label}`);
  }
  t.assert(copied.includes('Korea (mm): 280'), 'the copied sizes carried the wrong millimetres');

  // The brand reminder changes with the select and never replaces the baseline row.
  const rowBefore = await readAll();
  for (const [value, notice] of [
    ['nike', 'Nike notes that the CM size'],
    ['adidas', 'adidas charts include EU third sizes'],
    ['newBalance', 'New Balance publishes width guidance'],
  ]) {
    await brand.selectOption(value);
    await t.waitForText(notice);
    assertRow(t, await readAll(), rowBefore, `the ${value} reminder changed the sizes`);
  }
  await brand.selectOption('none');
  t.assert(
    !(await page
      .getByText('Nike notes that the CM size')
      .isVisible()
      .catch(() => false)),
    'the brand reminder stayed after clearing it',
  );

  // Saved work comes back after a reload.
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem('tools:shoe-size-converter:state') ?? '{}').text === '280' &&
      JSON.parse(localStorage.getItem('tools:shoe-size-converter:state') ?? '{}').system === 'kr',
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForFunction(() => document.querySelector('main input[type="text"]')?.value === '280');
  assertRow(t, await readAll(), rowFor(280, 'kr'), 'the saved 280 mm after a reload');

  // The Korean page uses the same chart and reads a full-width pasted number.
  await t.open('/ko/shoe-size-converter');
  const koreanLabels = LABELS.ko;
  const koreanField = page.locator('main input[type="text"]').first();
  await page.locator('main select').first().selectOption('kr');
  await koreanField.fill('２７０');
  const korean = {};
  for (const key of SYSTEMS) korean[key] = await shown(page, koreanLabels, key);
  assertRow(t, korean, rowFor(270, 'kr'), 'full-width ２７０ on the Korean page');

  // 375 px in dark mode stays readable and does not scroll sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );
  t.assert((await shown(page, koreanLabels, 'usMen')) === rowFor(270, 'kr').usMen, 'the results panel broke at 375 px');

  // Keyboard: the size field leads to the system select in tab order.
  await koreanField.focus();
  await page.keyboard.press('Tab');
  t.assert(
    await page.evaluate(() => document.activeElement?.tagName === 'SELECT'),
    'keyboard focus did not leave the size field for another control',
  );
}

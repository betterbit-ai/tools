/**
 * Hours calculator: a real week typed into the page — a lunch break that shortens a day, a custom
 * week with a night shift, an impossible row, and the copy button — with every total recomputed in
 * this spec from minutes, not read back from the page.
 *
 * Covers the defects this audit fixed:
 *  - a row whose end time is earlier than its start was silently read as an overnight shift with no
 *    cue, so a mistyped 18:00 → 06:00 turned 8 hours into 21; the row now says "next day";
 *  - the page said the week was saved in this browser even when the browser refused storage.
 */

/** Minutes after midnight for an "HH:MM" value. */
const minutes = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};
/** Net minutes for one row, the way the page defines it (end before start = next day). */
const shiftMinutes = (start, end, breakMinutes) => {
  const gross = minutes(end) >= minutes(start) ? minutes(end) - minutes(start) : minutes(end) + 1440 - minutes(start);
  return gross - breakMinutes;
};
const clock = (total) => `${Math.floor(total / 60)}h ${String(((total % 60) + 60) % 60).padStart(2, '0')}m`;
const decimal = (total) => (total / 60).toFixed(2);

const stats = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main div[class*="bg-surface-2"]')]
        .filter((element) => element.children.length === 2 && element.children[0].className.includes('tabular'))
        .map((element) => [element.children[1].textContent.trim(), element.children[0].textContent.trim()]),
    ),
  );

const text = (page) => page.locator('main').innerText();

export default async function (t) {
  const page = t.page;
  await t.open('/hours-calculator');
  await page.waitForTimeout(500);

  const times = page.locator('main input[type=time]');
  const breaks = page.locator('main input[type=number]');
  t.assert((await times.count()) === 14, `the page shows ${await times.count()} time fields instead of 14`);
  t.assert((await breaks.count()) === 7, `the page shows ${await breaks.count()} break fields instead of 7`);

  /** A person changing a time: select the field, type the new value. */
  const setTime = async (index, value) => {
    await times.nth(index).click();
    await times.nth(index).fill(value);
    await page.waitForTimeout(120);
  };
  const setBreak = async (index, value) => {
    await breaks.nth(index).click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(value, { delay: 50 });
    await page.waitForTimeout(150);
  };
  const mondayIs = (i) => i * 2; // start, end of weekday i

  // ── 1. The ready-made week is the standard 9–6 week with an hour of unpaid lunch.
  const initial = await stats(page);
  t.assert(initial['Net hours'] === '40h 00m', `default net: ${initial['Net hours']}`);
  t.assert(initial['Decimal hours'] === '40.00', `default decimal: ${initial['Decimal hours']}`);
  t.assert(initial['Time on clock'] === '45h 00m', `default clock time: ${initial['Time on clock']}`);
  t.assert(initial['Unpaid breaks'] === '5h 00m', `default break total: ${initial['Unpaid breaks']}`);
  t.assert(initial['Days included'] === '5', `default days: ${initial['Days included']}`);
  t.assert((await text(page)).includes('Monday\n8h 00m'), 'the Monday row does not show 8 hours');

  // ── 2. One day changed the way a timesheet differs: 17:30 finish, 30-minute lunch.
  await setTime(mondayIs(0) + 1, '18:30');
  await setBreak(0, '30');
  const monday = clock(shiftMinutes('09:00', '18:30', 30));
  t.assert(
    (await text(page)).includes(`Monday\n${monday}`),
    `Monday 09:00–18:30 with a 30-minute break shows something other than ${monday}`,
  );
  t.assert(
    (await stats(page))['Net hours'] ===
      clock(4 * shiftMinutes('09:00', '18:00', 60) + shiftMinutes('09:00', '18:30', 30)),
    `net after Monday: ${(await stats(page))['Net hours']}`,
  );

  // ── 3. A custom week with a night shift, recomputed here from minutes.
  const week = [
    ['08:30', '17:00', 45],
    ['09:00', '18:30', 30],
    ['07:00', '16:00', 60],
    ['22:00', '06:30', 30],
    ['', '', 0],
  ];
  for (const [index, [start, end, breakMinutes]] of week.entries()) {
    await setTime(mondayIs(index), start);
    await setTime(mondayIs(index) + 1, end);
    await setBreak(index, String(breakMinutes));
  }
  const grossMinutes = week.reduce(
    (total, [start, end]) =>
      total +
      (start
        ? minutes(end) >= minutes(start)
          ? minutes(end) - minutes(start)
          : minutes(end) + 1440 - minutes(start)
        : 0),
    0,
  );
  const breakMinutes = week.reduce((total, row) => total + row[2], 0);
  const netMinutes = grossMinutes - breakMinutes;
  const afterWeek = await stats(page);
  t.assert(
    afterWeek['Net hours'] === clock(netMinutes),
    `custom week net: ${afterWeek['Net hours']} (expected ${clock(netMinutes)})`,
  );
  t.assert(afterWeek['Decimal hours'] === decimal(netMinutes), `custom week decimal: ${afterWeek['Decimal hours']}`);
  t.assert(afterWeek['Time on clock'] === clock(grossMinutes), `custom week clock: ${afterWeek['Time on clock']}`);
  t.assert(afterWeek['Unpaid breaks'] === clock(breakMinutes), `custom week breaks: ${afterWeek['Unpaid breaks']}`);
  t.assert(afterWeek['Days included'] === '4', `custom week days: ${afterWeek['Days included']}`);
  t.assert(
    (await text(page)).includes(`Thursday\n${clock(shiftMinutes('22:00', '06:30', 30))}`),
    'the night shift row is wrong',
  );
  t.assert((await text(page)).includes('next day'), 'the night shift is not marked as finishing the next day');
  t.assert((await text(page)).includes(`Friday\n\u2014`), 'a cleared day is not shown as empty');

  // ── 4. An impossible row is named and left out of the total, not silently counted.
  await setTime(mondayIs(0), '09:00');
  await setTime(mondayIs(0) + 1, '10:00');
  await setBreak(0, '120');
  await page.waitForTimeout(200);
  const invalid = await text(page);
  t.assert(invalid.includes('Check row'), 'an impossible row is not marked');
  t.assert(invalid.includes('1 row(s)'), 'the page does not say how many rows are invalid');
  t.assert(
    (await stats(page))['Net hours'] === clock(netMinutes - shiftMinutes('08:30', '17:00', 45)),
    `the invalid row is still in the total: ${(await stats(page))['Net hours']}`,
  );

  // ── 5. Copy gives the same numbers the page shows.
  await page.getByRole('button', { name: /Copy weekly summary/ }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const shown = await stats(page);
  t.assert(
    copied ===
      `Hours worked: ${shown['Net hours']} (${shown['Decimal hours']} decimal hours)\nTime on clock: ${shown['Time on clock']}\nUnpaid breaks: ${shown['Unpaid breaks']}`,
    `the copied summary does not match the page: ${JSON.stringify(copied)}`,
  );

  // ── 6. Clear and standard-week put the page back where a user expects.
  await page.getByRole('button', { name: 'Clear week' }).click();
  await page.waitForTimeout(200);
  const cleared = await stats(page);
  t.assert(
    cleared['Net hours'] === '0h 00m' && cleared['Days included'] === '0',
    `cleared week: ${JSON.stringify(cleared)}`,
  );
  t.assert(!(await text(page)).includes('Check row'), 'a cleared week still reports invalid rows');
  await page.getByRole('button', { name: 'Use standard week' }).click();
  await page.waitForTimeout(200);
  t.assert((await stats(page))['Net hours'] === '40h 00m', 'the standard week did not come back');

  // ── 7. The week survives a reload, and the Korean page says the same in its own labels.
  await setTime(mondayIs(0), '08:00');
  await setTime(mondayIs(0) + 1, '16:00');
  await setBreak(0, '30');
  await page.waitForTimeout(400);
  const beforeReload = (await stats(page))['Net hours'];
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(700);
  t.assert((await times.nth(0).inputValue()) === '08:00', 'the reload lost the Monday start time');
  t.assert((await stats(page))['Net hours'] === beforeReload, 'the reload changed the weekly total');

  await t.open('/ko/hours-calculator');
  await page.waitForTimeout(500);
  await page.locator('main input[type=time]').nth(0).fill('09:00');
  await page.locator('main input[type=time]').nth(1).fill('18:00');
  await page.locator('main input[type=number]').nth(0).fill('60');
  await page.waitForTimeout(300);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('요일'), 'the Korean page has no weekday column header');
  t.assert(korean.includes('금\n8h 00m'), `the Korean Friday row is not 8 hours: ${korean.slice(0, 200)}`);

  // ── 8. 375 px, dark: the week stacks and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

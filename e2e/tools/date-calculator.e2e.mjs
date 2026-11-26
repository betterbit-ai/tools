/**
 * Date calculator: differences, business-day counts and date shifts, all recomputed here from the
 * calendar rather than trusted from the page.
 *
 * The arithmetic held up in a real browser (including the 2024–2027 South Korean public-holiday
 * table); this spec pins down the day counts, the include-start convention, the DST-free epoch
 * maths, the holiday calendars, the add/subtract modes and the error notices.
 */

const stats = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main div[class*="bg-surface-2"]')]
        .filter((element) => element.children.length === 2 && element.children[0].className.includes('tabular'))
        .map((element) => [element.children[1].textContent.trim(), element.children[0].textContent.trim()]),
    ),
  );

const DAY = 86_400_000;
/** Epoch days for a YYYY-MM-DD string, computed the same way the spec's expectations are written. */
const day = (iso) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / DAY;

/** Business days between two dates, start excluded, the way the tool counts by default. */
const businessDays = (start, end, holidays = new Set()) => {
  let count = 0;
  for (let t = day(start) + 1; t <= day(end); t++) {
    const weekday = new Date(t * DAY).getUTCDay();
    const iso = new Date(t * DAY).toISOString().slice(0, 10);
    if (weekday !== 0 && weekday !== 6 && !holidays.has(iso)) count++;
  }
  return count;
};

const weekendDays = (start, end) => {
  let count = 0;
  for (let t = day(start) + 1; t <= day(end); t++) {
    const weekday = new Date(t * DAY).getUTCDay();
    if (weekday === 0 || weekday === 6) count++;
  }
  return count;
};

const addDays = (iso, amount) => new Date(day(iso) * DAY + amount * DAY).toISOString().slice(0, 10);
const longDate = (iso) =>
  new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(
    new Date(`${iso}T00:00:00`),
  );

export default async function (t) {
  const page = t.page;
  await t.open('/date-calculator');
  await page.waitForTimeout(900);
  const field = (label) => page.locator('main label').filter({ hasText: label });
  const input = (regExp) => field(regExp).locator('input');
  const choose = async (name) => {
    await page
      .locator('main [role=radio]')
      .filter({ hasText: new RegExp(`^${name}$`) })
      .click();
    await page.waitForTimeout(300);
  };
  const pickCountry = async (label) => {
    await page.locator('main select').selectOption({ label });
    await page.waitForTimeout(350);
  };
  /** The switch is a visually hidden checkbox under a label; click the label and read the state. */
  const setToggle = async (name, want) => {
    const box = page.getByRole('checkbox', { name });
    if ((await box.isChecked()) !== want) {
      await page.locator('main label').filter({ hasText: name }).click();
      await page.waitForTimeout(350);
    }
    t.assert((await box.isChecked()) === want, `the “${name}” switch did not turn ${want ? 'on' : 'off'}`);
  };

  // ── 1. A Korean holiday week: Seollal 2026 (Feb 16–18) is excluded from business days.
  await input(/^Start date$/).fill('2026-02-14');
  await input(/^End date$/).fill('2026-02-22');
  await page.waitForTimeout(350);
  const seollal = new Set(['2026-02-16', '2026-02-17', '2026-02-18']);
  let shown = await stats(page);
  t.assert(shown['Total days'] === '8', `total days across Seollal: ${shown['Total days']}`);
  t.assert(
    shown['Business days'] === String(businessDays('2026-02-14', '2026-02-22')),
    `business days without a calendar: ${shown['Business days']}`,
  );
  t.assert(
    shown['Weekend days'] === String(weekendDays('2026-02-14', '2026-02-22')),
    `weekend days: ${shown['Weekend days']}`,
  );
  t.assert(shown['Years, months, days'] === '0y 0m 8d', `span: ${shown['Years, months, days']}`);
  t.assert(shown['Weeks + days'] === '1w 1d', `weeks + days: ${shown['Weeks + days']}`);
  await pickCountry('South Korea');
  shown = await stats(page);
  t.assert(shown['Holidays excluded'] === '3', `Korean holidays excluded: ${shown['Holidays excluded']}`);
  t.assert(
    shown['Business days'] === String(businessDays('2026-02-14', '2026-02-22', seollal)),
    `business days in the Seollal week: ${shown['Business days']}`,
  );

  // ── 2. “Include the start date” adds one day to every count, including the business one.
  await setToggle('Include the start date', true);
  shown = await stats(page);
  t.assert(shown['Total days'] === '9', `total days with the start date: ${shown['Total days']}`);
  t.assert(
    shown['Business days'] === String(businessDays('2026-02-13', '2026-02-22', seollal)),
    `business days with the start date: ${shown['Business days']}`,
  );
  await setToggle('Include the start date', false);

  // ── 3. Month-end clamping: January 31 to March 1 is one month and one day, not 29 days.
  await input(/^Start date$/).fill('2026-01-31');
  await input(/^End date$/).fill('2026-03-01');
  await pickCountry('None (weekends only)');
  shown = await stats(page);
  t.assert(
    shown['Total days'] === String(day('2026-03-01') - day('2026-01-31')),
    `total days Jan 31 → Mar 1: ${shown['Total days']}`,
  );
  t.assert(shown['Years, months, days'] === '0y 1m 1d', `Jan 31 → Mar 1 span: ${shown['Years, months, days']}`);

  // ── 4. US calendar: Independence Day 2026 falls on a Saturday, observed on Friday July 3.
  await input(/^Start date$/).fill('2026-07-01');
  await input(/^End date$/).fill('2026-07-06');
  await pickCountry('United States');
  const july = new Set(['2026-07-03']);
  shown = await stats(page);
  t.assert(shown['Holidays excluded'] === '1', `US holidays excluded: ${shown['Holidays excluded']}`);
  t.assert(
    shown['Business days'] === String(businessDays('2026-07-01', '2026-07-06', july)),
    `US business days: ${shown['Business days']}`,
  );

  // ── 5. Copying the difference names both dates.
  await page.getByRole('button', { name: 'Copy result' }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(
    copied ===
      `${longDate('2026-07-01')} to ${longDate('2026-07-06')}: 5 days (${businessDays('2026-07-01', '2026-07-06', july)} business days)`,
    `the copied difference is ${JSON.stringify(copied)}`,
  );

  // ── 6. Add mode: calendar shift with month-end clamping, then subtraction.
  await choose('Add or subtract');
  await input(/^Base date$/).fill('2026-01-31');
  await input(/^Months$/).fill('1');
  await input(/^Weeks$/).fill('0');
  await page.waitForTimeout(350);
  let result = await page.locator('main div[aria-live=polite]').innerText();
  t.assert(result.includes(longDate('2026-02-28')), `Jan 31 + 1 month shows ${JSON.stringify(result)}`);
  await choose('Subtract');
  await input(/^Base date$/).fill('2026-03-31');
  await page.waitForTimeout(300);
  result = await page.locator('main div[aria-live=polite]').innerText();
  t.assert(result.includes(longDate('2026-02-28')), `Mar 31 − 1 month shows ${JSON.stringify(result)}`);

  // ── 7. Quick presets set the whole shift, and the result follows.
  await choose('Add');
  await page.getByRole('button', { name: '100 days', exact: true }).click();
  await page.waitForTimeout(350);
  t.assert((await input(/^Years$/).inputValue()) === '0', 'the 100-day preset left years behind');
  t.assert((await input(/^Months$/).inputValue()) === '0', 'the 100-day preset left months behind');
  t.assert((await input(/^Weeks$/).inputValue()) === '0', 'the 100-day preset left weeks behind');
  t.assert((await input(/^Days$/).inputValue()) === '100', 'the 100-day preset did not set 100 days');
  result = await page.locator('main div[aria-live=polite]').innerText();
  t.assert(result.includes(longDate(addDays('2026-03-31', 100))), `Mar 31 + 100 days shows ${JSON.stringify(result)}`);

  // ── 8. Business-day mode with the Korean calendar skips Christmas and New Year's Day.
  await setToggle('Count in business days instead of calendar time', true);
  await input(/^Base date$/).fill('2026-12-24');
  await input(/^Business days$/).fill('5');
  await page.waitForTimeout(350);
  result = await page.locator('main div[aria-live=polite]').innerText();
  t.assert(result.includes('2026-12-31'), `business days without holidays shows ${JSON.stringify(result)}`);
  await pickCountry('South Korea');
  result = await page.locator('main div[aria-live=polite]').innerText();
  t.assert(result.includes('2027-01-04'), `business days across Christmas shows ${JSON.stringify(result)}`);

  // ── 9. Outside the Korean table the tool says holidays were not subtracted.
  await choose('Difference');
  await input(/^Start date$/).fill('2030-01-01');
  await input(/^End date$/).fill('2030-01-10');
  await pickCountry('South Korea');
  await page.waitForTimeout(300);
  t.assert(
    /holiday table covers 2024–2027/.test(await page.locator('main').innerText()),
    'a year outside the Korean holiday table shows no note',
  );

  // ── 10. A cleared date is refused with an explanation, not a wrong count.
  await input(/^End date$/).fill('');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((text) => /valid calendar date/.test(text)),
    'an emptied end date is not explained',
  );

  // ── 11. A shift past year 9999 is reported instead of printing a broken date.
  await choose('Add or subtract');
  await input(/^Base date$/).fill('9999-12-30');
  await setToggle('Count in business days instead of calendar time', false);
  await input(/^Years$/).fill('1');
  await page.waitForTimeout(350);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((text) =>
      /outside the supported date range/.test(text),
    ),
    'a date past 9999 is not explained',
  );

  // ── 12. The saved inputs come back after a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(
    () => [...document.querySelectorAll('main input[type=date]')].some((input) => input.value === '9999-12-30'),
    null,
    { timeout: 15_000 },
  );
  t.assert(
    (await page.locator('main').innerText()).includes('Add or subtract'),
    'the reload lost the calculation mode',
  );

  // ── 13. The Korean page labels the counts, and 375 px holds its layout.
  await t.open('/ko/date-calculator');
  await page.waitForTimeout(700);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('총 일수') && korean.includes('영업일'), 'the Korean page is missing its counts');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

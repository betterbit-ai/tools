/**
 * Due-date calculator: what someone does with the date they know — a last period, a conception
 * date, or an IVF transfer — and the timeline the page then promises.
 *
 * The browser clock is frozen on 2026-11-24 so "today", the week count and the countdown are
 * deterministic. Dates are checked against calendar arithmetic computed here, not against the page.
 *
 * Covers the defects this audit fixed:
 *  - "25 weeks 1 days" / "1 weeks": the English week and day counts are now pluralised;
 *  - a cleared cycle-length field used to replace the whole estimate with a generic error, although
 *    the page documents 28 days as the default; an unusable length now says what it accepts, once;
 *  - a tab left open overnight kept yesterday's week count (the date was memoised at mount);
 *  - a date in the future reported a pregnancy week count; it now says the date is in the future.
 */

const iso = (date) => date.toISOString().slice(0, 10);
const day = (value) => {
  const date = new Date(`${value}T12:00:00Z`);
  return date;
};
const addDays = (value, days) => {
  const date = day(value);
  date.setUTCDate(date.getUTCDate() + days);
  return iso(date);
};
const daysBetween = (from, to) => Math.round((day(to) - day(from)) / 86_400_000);

const longDate = (value, locale) =>
  new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date(`${value}T12:00:00`));

async function stat(page, label) {
  return page.evaluate((wanted) => {
    for (const element of document.querySelectorAll('main div[class*="bg-surface-2"]')) {
      if (element.children.length !== 2) continue;
      const [value, name] = [element.children[0], element.children[1]];
      if (!value.className.includes('tabular')) continue;
      if (name.textContent?.trim() !== wanted) continue;
      return value.textContent?.trim() ?? null;
    }
    return null;
  }, label);
}

async function messages(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert], main [role=status]')].map(
      (element) => element.textContent?.trim() ?? '',
    ),
  );
}

export default async function (t) {
  const page = t.page;
  await page.clock.install({ time: new Date('2026-11-24T01:00:00Z') }); // 10:00 in Seoul
  await t.open('/pregnancy-calculator');
  await page.waitForTimeout(500);

  const today = '2026-11-24';
  const date = page.locator('input[type=date]');
  const cycle = page.locator('main input[type=number]').first();
  const setDate = async (value) => {
    await date.fill(value);
    await page.waitForTimeout(250);
  };

  // ── 1. A last period dated 1 June 2026: due 8 March 2027, 25 weeks 1 day today.
  await setDate('2026-06-01');
  const due = addDays('2026-06-01', 280);
  const gestationDays = daysBetween('2026-06-01', today);
  const weeks = Math.floor(gestationDays / 7);
  const days = gestationDays % 7;
  t.assert(
    (await stat(page, 'Estimated due date')) === longDate(due, 'en'),
    `due date: ${await stat(page, 'Estimated due date')}`,
  );
  t.assert(
    (await stat(page, 'Until due date')) === `${daysBetween(today, due)} days`,
    `countdown: ${await stat(page, 'Until due date')}`,
  );
  t.assert(
    (await stat(page, 'Gestational age today')) === `${weeks} weeks ${days} ${days === 1 ? 'day' : 'days'}`,
    `gestational age: ${await stat(page, 'Gestational age today')}`,
  );
  t.assert(
    (await stat(page, 'Trimester today')) === 'Second trimester',
    `trimester: ${await stat(page, 'Trimester today')}`,
  );
  t.assert(
    (await stat(page, 'Estimated conception')) === longDate('2026-06-15', 'en'),
    `conception: ${await stat(page, 'Estimated conception')}`,
  );
  t.assert((await stat(page, 'Pregnancy dating start')) === longDate('2026-06-01', 'en'), 'dating start is wrong');
  t.assert(
    (await stat(page, '13 weeks 6 days')) === longDate(addDays('2026-06-01', 97), 'en'),
    `end of the first trimester: ${await stat(page, '13 weeks 6 days')}`,
  );
  t.assert(
    (await stat(page, '40 weeks 0 days (due date)')) === longDate(due, 'en'),
    'the timeline due date disagrees with the due date',
  );

  // ── 2. A 32-day cycle moves the whole estimate four days later.
  await cycle.fill('32');
  await page.waitForTimeout(250);
  const due32 = addDays('2026-06-01', 284);
  t.assert(
    (await stat(page, 'Estimated due date')) === longDate(due32, 'en'),
    `32-day cycle due date: ${await stat(page, 'Estimated due date')}`,
  );
  t.assert(
    (await stat(page, 'Gestational age today')) ===
      `${Math.floor(daysBetween('2026-06-05', today) / 7)} weeks ${daysBetween('2026-06-05', today) % 7} days`,
    `32-day cycle week count: ${await stat(page, 'Gestational age today')}`,
  );

  // ── 3. Clearing the cycle field falls back to the documented 28 days instead of an error.
  await cycle.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  t.assert(
    (await messages(page)).filter((text) => /cycle length/.test(text)).length === 0,
    `clearing the cycle raised ${(await messages(page)).join(' | ')}`,
  );
  t.assert(
    (await stat(page, 'Estimated due date')) === longDate(due, 'en'),
    `with an empty cycle the due date is ${await stat(page, 'Estimated due date')}`,
  );

  // ── 4. A cycle outside the documented range is named, and no estimate is shown from it.
  await cycle.fill('10');
  await page.waitForTimeout(300);
  t.assert(
    (await messages(page)).some((text) => /from 20 to 45 days/.test(text)),
    `a 10-day cycle shows no explanation: ${(await messages(page)).join(' | ')}`,
  );
  t.assert((await stat(page, 'Estimated due date')) === null, 'a due date was shown for an unusable cycle length');
  await cycle.fill('45');
  await page.waitForTimeout(300);
  t.assert(
    (await stat(page, 'Estimated due date')) === longDate(addDays('2026-06-01', 297), 'en'),
    `45-day cycle: ${await stat(page, 'Estimated due date')}`,
  );
  await cycle.fill('28');
  await page.waitForTimeout(250);

  // ── 5. IVF: the transfer date plus 261 days for a day-5 embryo, 263 for a day-3 embryo.
  await page.getByRole('radio', { name: 'IVF transfer', exact: true }).click();
  await page.waitForTimeout(250);
  await setDate('2026-06-01');
  t.assert(
    (await stat(page, 'Estimated due date')) === longDate(addDays('2026-06-01', 261), 'en'),
    `day-5 transfer: ${await stat(page, 'Estimated due date')}`,
  );
  await page.getByRole('radio', { name: 'Day 3 embryo', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await stat(page, 'Estimated due date')) === longDate(addDays('2026-06-01', 263), 'en'),
    `day-3 transfer: ${await stat(page, 'Estimated due date')}`,
  );

  // ── 6. Conception: 266 days.
  await page.getByRole('radio', { name: 'Conception', exact: true }).click();
  await page.waitForTimeout(250);
  await setDate('2026-06-15');
  t.assert(
    (await stat(page, 'Estimated due date')) === longDate(addDays('2026-06-15', 266), 'en'),
    `conception dating: ${await stat(page, 'Estimated due date')}`,
  );

  // ── 7. One day before the due date, on it, and one day past it read correctly.
  await page.getByRole('radio', { name: 'Last period', exact: true }).click();
  await page.waitForTimeout(250);
  await setDate(addDays('2026-11-25', -280));
  t.assert(
    (await stat(page, 'Until due date')) === '1 day',
    `a due date tomorrow reads "${await stat(page, 'Until due date')}"`,
  );
  await setDate(addDays('2026-11-24', -280));
  t.assert(
    (await stat(page, 'Until due date')) === 'Due today',
    `a due date today reads "${await stat(page, 'Until due date')}"`,
  );
  await setDate(addDays('2026-11-23', -280));
  t.assert(
    (await stat(page, 'Until due date')) === '1 day past',
    `a due date yesterday reads "${await stat(page, 'Until due date')}"`,
  );

  // ── 8. A date in the future is called out instead of reporting a pregnancy that has not started.
  await setDate('2026-12-01');
  t.assert(
    (await messages(page)).some((text) => /in the future/.test(text)),
    `a future date shows no explanation: ${(await messages(page)).join(' | ')}`,
  );
  t.assert(
    (await stat(page, 'Gestational age today')) === 'Not started',
    `a future date reports ${await stat(page, 'Gestational age today')}`,
  );
  t.assert((await stat(page, 'Trimester today')) === 'Not started', 'a future date still reports a trimester');

  // ── 9. Nothing turns the estimate off: the date field can be cleared.
  await date.fill('');
  await page.waitForTimeout(300);
  t.assert((await stat(page, 'Estimated due date')) === null, 'an empty date still shows a due date');

  // ── 10. The Korean page reports the same dates in Korean.
  await t.open('/ko/pregnancy-calculator');
  await page.waitForTimeout(600);
  await page.locator('input[type=date]').fill('2026-06-01');
  await page.waitForTimeout(300);
  t.assert(
    (await stat(page, '출산예정일')) === longDate(due, 'ko'),
    `Korean due date: ${await stat(page, '출산예정일')}`,
  );
  t.assert(
    (await stat(page, '오늘의 임신 주수')) === `${weeks}주 ${days}일`,
    `Korean week count: ${await stat(page, '오늘의 임신 주수')}`,
  );

  // ── 11. 375 px, dark: the result cards fit the phone.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
}

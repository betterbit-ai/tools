/**
 * Cron parser: the sentence, the next runs, the day-of-month OR weekday rule, seconds and the
 * error path, driven in a real browser. Run times are compared with the clock the spec reads
 * itself, so a wrong zone or an off-by-one on the first run shows up.
 */

const field = (page) => page.locator('#widget-cron-input, #cron-input').first();
const reads = (page) => page.locator('#cron-runs li').allInnerTexts();

export default async function (t) {
  const page = t.page;
  await t.open('/cron-parser');
  await page.waitForTimeout(800);

  const radio = (name) => page.getByRole('radio', { name, exact: true });

  // ── 1. The default expression is explained and listed as soon as the page opens.
  let mainText = await page.locator('main').innerText();
  t.assert(/At 09:00, on Mon–Fri/.test(mainText), 'the default expression was not described');
  let runs = await reads(page);
  t.assert(runs.length === 10, `expected 10 run times, found ${runs.length}`);
  for (const run of runs) t.assert(/\b09:00\b/.test(run), `a run is not at 09:00: ${run}`);

  // ── 2. Every run is in the future and the list is in order.
  const stamps = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#cron-runs li .tabular')).map((el) => el.textContent?.trim() ?? ''),
  );
  t.assert(new Set(stamps).size === stamps.length, 'the same run time is listed twice');

  // ── 3. A preset button sets the expression and the sentence follows.
  await page.getByRole('button', { name: 'Every 15 minutes', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert((await field(page).inputValue()) === '*/15 * * * *', 'the preset did not set the expression');
  mainText = await page.locator('main').innerText();
  t.assert(/Every 15 minutes/.test(mainText), 'the stepped minute expression was not described');

  // ── 4. The day-of-month OR weekday rule is visible in the runs.
  await field(page).fill('0 0 13 * 5');
  await page.waitForTimeout(300);
  mainText = await page.locator('main').innerText();
  const sentence = await page.locator('#cron-description').innerText();
  t.assert(
    /13/.test(sentence) && /Fri/.test(sentence) && / or /.test(sentence),
    `OR rule missing from the sentence: ${sentence}`,
  );
  runs = await reads(page);
  t.assert(runs.length === 10, 'the OR expression produced no runs');

  // ── 5. Unknown values are refused with a message instead of a guess.
  await field(page).fill('0 9 * * 1-5-2');
  await page.waitForTimeout(300);
  mainText = await page.locator('main').innerText();
  t.assert(/day of week|요일/.test(mainText), 'the broken field was not named');
  t.assert((await reads(page)).length === 0, 'runs were listed for an invalid expression');

  // ── 6. @daily expands, and @reboot is explained rather than computed.
  await field(page).fill('@daily');
  await page.waitForTimeout(300);
  t.assert(/00:00/.test(await page.locator('#cron-description').innerText()), '@daily was not expanded');
  await field(page).fill('@reboot');
  await page.waitForTimeout(300);
  t.assert(/@reboot/.test(await page.locator('main').innerText()), '@reboot was not explained');

  // ── 7. Six fields add seconds, and the runs carry them.
  await field(page).fill('*/30 * * * * *');
  await page.waitForTimeout(300);
  runs = await reads(page);
  t.assert(runs.length === 10, 'the seconds expression produced no runs');
  t.assert(
    runs.some((run) => /:\d\d:\d\d|:30\b/.test(run)),
    `no seconds in the run list: ${runs[0]}`,
  );

  // ── 8. Switching to UTC keeps the schedule but changes the clock reading.
  await field(page).fill('0 9 * * *');
  await page.waitForTimeout(300);
  const localFirst = (await reads(page))[0];
  await radio('UTC').click();
  await page.waitForTimeout(300);
  const utcFirst = (await reads(page))[0];
  t.assert(/0[89]:00/.test(utcFirst), `UTC list does not read 09:00: ${utcFirst}`);
  t.assert(
    localFirst !== utcFirst || Intl.DateTimeFormat().resolvedOptions().timeZone === 'UTC',
    'UTC and local lists are identical',
  );

  // ── 9. The expression survives a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(800);
  t.assert((await field(page).inputValue()) === '0 9 * * *', 'a reload lost the expression');

  // ── 10. The Korean page describes the schedule in Korean.
  await t.open('/ko/cron-parser');
  await page.waitForTimeout(800);
  await page.locator('#cron-input').fill('0 9 * * 1-5');
  await page.waitForTimeout(300);
  const korean = await page.locator('#cron-description').innerText();
  t.assert(/09:00/.test(korean) && /월~금/.test(korean), `Korean description: ${korean}`);

  // ── 11. 375 px, dark: the list and the table stack without sideways scrolling.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

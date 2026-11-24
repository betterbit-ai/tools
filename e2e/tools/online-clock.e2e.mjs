/**
 * Online clock: what a visitor actually checks — is the time right now, does it keep running, do the
 * 12/24-hour and seconds switches change the display, does the copied value match the screen, and
 * does the clock still tell the right time after the tab has been hidden.
 *
 * Covers the defects this audit fixed:
 *  - the static HTML carried the build time in its timer, so a slow load (or a browser with no
 *    JavaScript) presented that moment as "now" — the page now starts at --:--:-- and fills in the
 *    time once it runs in the browser;
 *  - a hidden tab is throttled, so the display could stay a minute or more behind until the next
 *    scheduled tick — it now re-reads the clock as soon as the tab is visible again.
 */

const pad = (value) => String(value).padStart(2, '0');

/** The clock's own formatting rules, computed here so the assertion does not repeat the code. */
function expected(date, { twelve = false, seconds = true } = {}) {
  const minutes = pad(date.getMinutes());
  if (!twelve) return `${pad(date.getHours())}:${minutes}${seconds ? `:${pad(date.getSeconds())}` : ''}`;
  const twelveHour = date.getHours() % 12 || 12;
  return `${twelveHour}:${minutes}${seconds ? `:${pad(date.getSeconds())}` : ''}`;
}

export default async function (t) {
  const page = t.page;
  await page.clock.install({ time: new Date('2026-10-19T07:29:58Z') });
  await t.open('/online-clock');
  await page.waitForTimeout(200);

  const timer = page.locator('[role=timer]');
  const shown = async () => (await timer.innerText()).replace(/\s+/g, ' ').trim();
  /**
   * Advance the frozen clock onto a moment inside a second whose boundary tick has already
   * run, so the display and Date.now() describe the same instant.
   */
  const settle = async (advance = 1000) => {
    await page.clock.runFor(advance);
    await page.waitForTimeout(80);
    return new Date(await page.evaluate(() => Date.now()));
  };
  const convert12 = (text24) => {
    const [hours, minutes, seconds] = text24.split(':').map(Number);
    return `${hours % 12 || 12}:${pad(minutes)}:${pad(seconds)} ${hours < 12 ? 'AM' : 'PM'}`;
  };
  const dropSeconds = (text12) => text12.replace(/:\d\d /, ' ');

  // ── 1. The static HTML never presents a stored time as now.
  const html = await (await fetch(`${t.base}/online-clock`)).text();
  const staticTimer = html.match(/<div role="timer"[\s\S]*?<\/div>/)?.[0] ?? '';
  t.assert(staticTimer.includes('--:--:--'), `the built HTML does not start on a placeholder: ${staticTimer}`);
  t.assert(!/\d\d:\d\d/.test(staticTimer), `the built HTML presents a stale time as now: ${staticTimer}`);

  // ── 2. It opens on the device clock and ticks in step with it.
  const first = await settle(1500);
  t.assert((await shown()) === expected(first), `the clock reads "${await shown()}" instead of ${expected(first)}`);
  t.assert(
    (await timer.getAttribute('aria-label')) === `Current time: ${expected(first)}`,
    `accessible name: ${await timer.getAttribute('aria-label')}`,
  );
  const second = await settle();
  t.assert((await shown()) === expected(second), `one second later the clock reads "${await shown()}"`);

  // ── 3. 12-hour time adds AM/PM without losing the seconds.
  const as24 = await shown();
  await page.getByRole('radio', { name: '12-hour', exact: true }).click();
  await page.waitForTimeout(150);
  t.assert((await shown()) === convert12(as24), `12-hour display: "${await shown()}" instead of ${convert12(as24)}`);

  // ── 4. Hiding seconds removes them from the display and from the copied value.
  await page.getByText('Show seconds', { exact: true }).click();
  await page.waitForTimeout(150);
  t.assert((await shown()) === dropSeconds(convert12(as24)), `without seconds: "${await shown()}"`);
  await page.getByRole('button', { name: 'Copy time', exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === dropSeconds(convert12(as24)), `copied "${copied}" instead of the displayed time`);

  // ── 5. The date line follows its switch and uses the page's language.
  const dateLine = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(second);
  t.assert((await page.locator('main').innerText()).includes(dateLine), `the date line is missing ${dateLine}`);
  await page.getByText('Show date', { exact: true }).click();
  await page.waitForTimeout(150);
  t.assert(!(await page.locator('main').innerText()).includes(dateLine), 'turning the date off left it visible');

  // ── 6. The time zone and UTC offset come from the browser, not from a server claim.
  const zone = await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const offsetMinutes = -second.getTimezoneOffset();
  const offset = `UTC${offsetMinutes >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}:${pad(
    Math.abs(offsetMinutes) % 60,
  )}`;
  const panel = await page.locator('main').innerText();
  t.assert(panel.includes(zone), `the time zone ${zone} is not shown`);
  t.assert(panel.includes(offset), `the UTC offset ${offset} is not shown`);

  // ── 7. A hidden tab keeps the right time: no tick runs, yet the page catches up on return.
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 2_000);
  const frozen = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(frozen + 65_000);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await page.waitForTimeout(300);
  const refreshed = new Date(frozen + 65_000);
  const refreshedText = `${expected(refreshed, { twelve: true, seconds: false })} ${
    refreshed.getHours() < 12 ? 'AM' : 'PM'
  }`;
  t.assert(
    (await shown()) === refreshedText,
    `after 65 s hidden the clock shows "${await shown()}" instead of ${refreshedText}`,
  );

  // ── 8. Settings survive a reload.
  await page.clock.resume();
  await page.reload({ waitUntil: 'load' });
  // The saved settings arrive with hydration; the static HTML still carries the defaults.
  await page.waitForFunction(
    () => document.querySelector('[role=timer]')?.getAttribute('aria-label') !== 'Current time',
    null,
    { timeout: 15_000 },
  );
  t.assert(
    (await page.getByRole('radio', { name: '12-hour', exact: true }).getAttribute('aria-checked')) === 'true',
    'the reload lost the 12-hour choice',
  );
  t.assert((await shown()).split(':').length === 2, `the reload lost the "hide seconds" choice: "${await shown()}"`);

  // ── 9. The Korean page is Korean and behaves the same.
  await t.open('/ko/online-clock');
  // Wait for hydration to apply the saved settings before touching a control.
  await page.waitForFunction(
    () => document.querySelector('[role=timer]')?.getAttribute('aria-label') !== '현재 시각',
    null,
    {
      timeout: 15_000,
    },
  );
  t.assert(
    (await timer.getAttribute('aria-label')).startsWith('현재 시각'),
    `Korean label: ${await timer.getAttribute('aria-label')}`,
  );
  t.assert(
    (await page.getByRole('radio', { name: '12시간제', exact: true }).getAttribute('aria-checked')) === 'true',
    'the Korean page lost the saved 12-hour choice',
  );
  await page.getByText('날짜 표시', { exact: true }).click();
  await page.waitForTimeout(200);
  const koreanDate = new Intl.DateTimeFormat('ko-KR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(await page.evaluate(() => Date.now())));
  t.assert(
    (await page.locator('main').innerText()).includes(koreanDate),
    `the Korean page does not show ${koreanDate}: ${JSON.stringify(
      await page.evaluate(() => [...document.querySelectorAll('input[type=checkbox]')].map((c) => c.checked)),
    )} ${JSON.stringify(await page.locator('[role=timer]').evaluate((e) => e.parentElement.innerText))}`,
  );

  // ── 10. 375 px, dark: the digits fit and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const box = await timer.boundingBox();
  t.assert(box && box.width <= 375, 'the clock does not fit the phone viewport');
}

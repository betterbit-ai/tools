/**
 * Stopwatch: elapsed time must come from the wall clock (not from interval ticks), so it stays
 * right after a hidden tab, and laps, CSV and local-session restore must agree with what is shown.
 * Keyboard shortcuts must not steal Space from a focused control, and a refused full screen has to
 * be reported instead of doing nothing.
 */

const timer = (page) => page.locator('[role=timer]');

/** "HH:MM:SS.mmm" → milliseconds. */
function ms(text) {
  const match = text.trim().match(/^(\d+):(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) throw new Error(`unexpected stopwatch reading: ${JSON.stringify(text)}`);
  return Number(match[1]) * 3_600_000 + Number(match[2]) * 60_000 + Number(match[3]) * 1_000 + Number(match[4]);
}

export default async function (t) {
  const page = t.page;
  await page.clock.install({ time: new Date('2026-11-22T09:00:00+09:00') });
  await t.open('/stopwatch');
  await page.evaluate(() => localStorage.clear());
  await t.open('/stopwatch');
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);

  const reading = async () => ms(await timer(page).innerText());
  /** The live display refreshes every 50 ms, so a running reading may trail the clock by one tick. */
  const near = (value, expected, label) =>
    t.assert(Math.abs(value - expected) < 60, `${label}: display read ${value} ms, expected about ${expected} ms`);

  // Start → exact elapsed time from the start timestamp.
  await t.click('Start');
  await page.clock.runFor(1_234);
  near(await reading(), 1_234, 'after 1.234 s of running');

  // Lap records a split and keeps running.
  await t.click('Lap');
  await page.clock.runFor(2_000);
  await t.click('Lap');
  await page.clock.runFor(1_000);
  t.assert(
    await page.getByText('Running', { exact: true }).isVisible(),
    'press Lap stopped the stopwatch instead of recording a split',
  );
  const rows = await page.locator('table tbody tr').allInnerTexts();
  t.assert(rows.length === 2, `lap table shows ${rows.length} rows instead of 2`);
  // Newest lap first: lap 2 is 2.000 s long, lap 1 1.234 s.
  t.assert(rows[0].includes('00:00:02.000') && rows[0].includes('00:00:03.234'), `lap 2 row read ${rows[0]}`);
  t.assert(rows[1].includes('00:00:01.234') && rows[1].includes('00:00:01.234'), `lap 1 row read ${rows[1]}`);

  // Pause freezes the reading; the clock keeps moving behind it.
  await t.click('Pause');
  const paused = await reading();
  t.assert(paused === 4_234, `pausing read ${paused} instead of 4234 ms`);
  await page.clock.runFor(5_000);
  t.assert((await reading()) === paused, 'the display kept counting while paused');
  await t.click('Resume');
  await page.clock.runFor(800);
  near(await reading(), paused + 800, 'Resume did not continue from the paused reading');

  // A hidden tab must not lose time: the timestamp moves without any interval tick.
  const hiddenAt = await page.evaluate(() => Date.now());
  const devtools = await page.context().newCDPSession(page);
  await devtools.send('Page.setWebLifecycleState', { state: 'frozen' });
  await devtools.send('Page.setWebLifecycleState', { state: 'active' });
  await page.clock.setSystemTime(hiddenAt + 60_000);
  await page.clock.runFor(100);
  near(await reading(), paused + 800 + 60_100, 'a 60 s hidden tab lost time');
  await devtools.detach();

  // A lap taken right after the tab wakes uses the wall clock too.
  await t.click('Lap');
  const rowsAfterHidden = await page.locator('table tbody tr').allInnerTexts();
  t.assert(
    rowsAfterHidden[0].includes('00:01:01.900') && rowsAfterHidden[0].includes('00:01:05.134'),
    `the lap after the hidden tab read ${rowsAfterHidden[0]} instead of 00:01:01.900 / 00:01:05.134`,
  );

  // CSV carries the same laps with a BOM and Korean headers on the Korean page.
  const csv = await t.download(() => t.click('Download CSV'));
  t.assert(csv.name === 'stopwatch-laps.csv', `CSV was named ${csv.name}`);
  const text = csv.bytes.toString('utf8');
  t.assert(text.startsWith('\uFEFF'), 'CSV has no byte-order mark');
  const lines = text
    .replace(/^\uFEFF/, '')
    .trim()
    .split('\r\n');
  t.assert(lines[0] === 'Lap,Lap time,Total time', `CSV header was ${JSON.stringify(lines[0])}`);
  t.assert(lines.length === 4, `CSV has ${lines.length - 1} lap rows instead of 3`);
  t.assert(lines[1] === '1,00:00:01.234,00:00:01.234', `CSV lap 1 row was ${JSON.stringify(lines[1])}`);
  t.assert(lines[3] === '3,00:01:01.900,00:01:05.134', `CSV lap 3 row was ${JSON.stringify(lines[3])}`);

  // Reset clears the reading and the lap list, and the cleared session is what a refresh restores.
  await t.click('Reset');
  t.assert((await reading()) === 0, 'Reset left a reading on the display');
  // Let the deferred effect flush the cleared session to storage before the refresh below.
  await page.clock.runFor(16);
  t.assert((await page.locator('table tbody tr').count()) === 0, 'Reset left laps behind');
  await t.open('/stopwatch');
  await page.clock.runFor(500);
  t.assert((await reading()) === 0, 'a reset session came back after a refresh');

  // A running session survives a refresh and continues from its saved start time.
  await t.click('Start');
  await page.clock.runFor(3_000);
  await t.open('/stopwatch');
  await page.clock.runFor(1_000);
  near(await reading(), 4_000, 'a running session did not continue after a refresh');

  // Keyboard: L laps, Space pauses, R resets.
  await page.keyboard.press('l');
  t.assert((await page.locator('table tbody tr').count()) === 1, 'the L shortcut did not record a lap');
  await page.keyboard.press('Space');
  t.assert(await page.getByText('Paused', { exact: true }).isVisible(), 'Space did not pause the stopwatch');
  await page.keyboard.press('r');
  t.assert((await reading()) === 0, 'the R shortcut did not reset the stopwatch');

  // Regression: with a button focused, Space must press that button, not pause the clock.
  await t.click('Start');
  await page.clock.runFor(1_000);
  await t.click('Lap');
  t.assert((await page.locator('table tbody tr').count()) === 1, 'clicking Lap while running did not record a lap');
  await page.keyboard.press('Space');
  t.assert(
    await page.getByText('Running', { exact: true }).isVisible(),
    'Space with the Lap button focused paused the stopwatch instead of pressing Lap',
  );
  t.assert(
    (await page.locator('table tbody tr').count()) === 2,
    'Space with the Lap button focused did not record a lap',
  );

  // A refused full screen is reported; the button must not go quietly dead.
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new Error('fullscreen blocked by policy'));
  });
  await t.open('/stopwatch');
  await t.click('Full screen');
  await page
    .getByText('Full screen is not available here. Open this page in its own browser tab and try again.', {
      exact: true,
    })
    .waitFor({ timeout: 5_000 });

  // A browser without the Fullscreen API gets the same explanation, translated.
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined });
  });
  await t.open('/ko/stopwatch');
  await t.click('전체화면');
  await page
    .getByText('이 화면에서는 전체화면을 사용할 수 없습니다. 페이지를 브라우저 탭에서 직접 열고 다시 시도하세요.', {
      exact: true,
    })
    .waitFor({ timeout: 5_000 });

  // 375 px, dark mode: no horizontal overflow.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px dark-mode page has horizontal overflow',
  );
}

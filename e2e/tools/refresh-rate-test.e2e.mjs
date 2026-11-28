/**
 * Measure a real display rate in Chromium, repeat the run, and keep the copied report honest.
 * Headless Chromium frames at the refresh it emulates (~60 Hz), so the reading must land on a
 * plausible rate and must be labelled as browser-observed, not as a panel specification.
 */

export default async function (t) {
  const context = t.page.context();
  await t.open('/refresh-rate-test');

  // The 5-second sample runs on its own; the headline becomes a number, not a placeholder.
  const headline = () => t.page.locator('main .text-5xl').first().innerText();
  let hz = 0;
  for (let i = 0; i < 40; i += 1) {
    const value = Number((await headline()).trim());
    if (Number.isFinite(value) && value > 0) {
      hz = value;
      break;
    }
    await t.page.waitForTimeout(500);
  }
  t.assert(hz >= 20 && hz <= 500, `headline never became a plausible Hz reading: "${await headline()}"`);

  const frameTime = await t.page.getByText('Frame time (median)', { exact: true }).first().locator('..').innerText();
  t.assert(/[\d.]+ ms/.test(frameTime), `frame time was not reported: ${frameTime}`);
  const budget = 1000 / hz;
  const reported = Number(frameTime.match(/([\d.]+) ms/)[1]);
  t.assert(Math.abs(reported - budget) < 0.5, `frame time ${reported} ms does not match ${hz} Hz`);

  // The nearest standard rate must agree with the measured reading.
  const standard = await t.page.getByText('Nearest standard rate', { exact: true }).first().locator('..').innerText();
  const rate = Number(standard.match(/(\d+) Hz/)?.[1]);
  t.assert(Number.isFinite(rate), `standard rate missing: ${standard}`);
  t.assert(Math.abs(rate - hz) / rate <= 0.03, `standard rate ${rate} does not match ${hz} Hz`);

  // A full-screen request must either work or be explained; it must never break the page.
  await t.click('Full screen');
  await t.page.waitForTimeout(300);
  const fullscreenNotice = await t.page.getByText(/refused full screen|허용하지 않았습니다/).count();
  const inFullscreen = await t.page.evaluate(() => Boolean(document.fullscreenElement));
  t.assert(inFullscreen || fullscreenNotice > 0, 'full-screen attempt left no state and no explanation');
  if (inFullscreen) await t.page.evaluate(() => document.exitFullscreen());

  // Copy exactly what another app would receive.
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await t.click('Copy report');
  await t.waitForText('Copied');
  const copied = await t.page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes('Refresh rate:'), 'copied report lost the rate line');
  t.assert(copied.includes('Dropped frames:'), 'copied report lost the dropped-frame line');
  t.assert(copied.includes('Sample:'), 'copied report lost the sample size');
  t.assert(/Hz/.test(copied), 'copied report has no unit');

  // Repeating the test clears the old reading first and finishes with a new one.
  await t.click('Measure again');
  await t.waitForText('Measuring…');
  for (let i = 0; i < 40; i += 1) {
    const value = Number((await headline()).trim());
    if (Number.isFinite(value) && value > 0) break;
    await t.page.waitForTimeout(500);
  }
  t.assert(Number((await headline()).trim()) > 0, 'second run never produced a reading');

  // The Korean page must be translated, not a copy of the English one.
  await t.open('/ko/refresh-rate-test');
  await t.waitForText('가까운 표준 주사율', 20_000);
  t.assert((await t.page.locator('main').innerText()).includes('주사율'), 'Korean page has no Korean heading');

  // Narrow and dark layouts stay usable.
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

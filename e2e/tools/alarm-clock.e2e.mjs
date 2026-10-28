/** Alarms use local wall-clock time, remain visible after throttling, and expose sound failures. */
export default async function (t) {
  await t.page.clock.install({ time: new Date('2026-10-19T07:29:00Z') });
  await t.page.addInitScript(() => {
    window.__alarmOscillatorStarts = 0;
    const originalStart = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      window.__alarmOscillatorStarts += 1;
      return originalStart.apply(this, args);
    };
  });
  await t.open('/alarm-clock');
  await t.page.clock.pauseAt((await t.page.evaluate(() => Date.now())) + 100);

  const timeInput = t.page.getByLabel('Alarm time', { exact: true });
  const labelInput = t.page.getByPlaceholder('Wake up, meeting, laundry…', { exact: true });
  const scheduledTime = await t.page.evaluate(() => {
    const date = new Date(Date.now() + 60_000);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  });

  // A practical labeled alarm saves locally and produces an audible test tone.
  await timeInput.fill(scheduledTime);
  await labelInput.fill('Team stand-up');
  await t.click('Test sound');
  t.assert(
    (await t.page.evaluate(() => window.__alarmOscillatorStarts)) === 1,
    'sound test did not schedule an audible tone',
  );
  await t.click('Add alarm');
  t.assert(await t.page.getByText('Team stand-up', { exact: true }).isVisible(), 'new alarm was not shown');
  t.assert((await t.page.locator('main').innerText()).includes('Next alarm:'), 'next-alarm status was not shown');

  // Simulate a frozen/hidden tab. Advancing the real clock without interval ticks must still ring.
  const hiddenAt = await t.page.evaluate(() => Date.now());
  const devtools = await t.page.context().newCDPSession(t.page);
  await devtools.send('Page.setWebLifecycleState', { state: 'frozen' });
  await devtools.send('Page.setWebLifecycleState', { state: 'active' });
  await t.page.clock.setSystemTime(hiddenAt + 90_000);
  await t.page.clock.runFor(500);
  t.assert(
    await t.page.getByText('Team stand-up is ringing.', { exact: true }).isVisible(),
    'background alarm did not become visible',
  );
  t.assert((await t.page.title()).startsWith('Alarm: Team stand-up'), 'ringing alarm was not exposed in the tab title');
  t.assert(
    (await t.page.evaluate(() => window.__alarmOscillatorStarts)) >= 2,
    'alarm did not play a tone after background-tab throttling',
  );
  await t.page.keyboard.press('Escape');
  t.assert((await t.page.getByRole('alert').count()) === 0, 'Escape did not dismiss the ringing alarm');
  await devtools.detach();

  // Browser audio activation failures must be explained instead of leaving a silent alarm.
  await t.page.addInitScript(() => {
    Object.defineProperty(AudioContext.prototype, 'resume', {
      configurable: true,
      value: () => Promise.reject(new Error('audio activation blocked')),
    });
  });
  await t.page.clock.resume();
  await t.open('/alarm-clock');
  await t.page.clock.pauseAt((await t.page.evaluate(() => Date.now())) + 100);
  await t.click('Test sound');
  t.assert(
    await t.page
      .getByText('The browser blocked the alarm sound. Press Test sound to enable it, then try again.', { exact: true })
      .isVisible(),
    'blocked sound did not explain how to recover',
  );
  t.assert(await t.page.getByRole('alert').isVisible(), 'blocked sound was not exposed as an alert');

  // A missing Web Audio implementation remains usable and is naturally translated in Korean.
  await t.page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined });
  });
  await t.page.clock.resume();
  await t.open('/ko/alarm-clock');
  await t.page.clock.pauseAt((await t.page.evaluate(() => Date.now())) + 100);
  await t.click('소리 테스트');
  t.assert(
    await t.page
      .getByText('이 브라우저에서는 알람 소리를 재생할 수 없습니다. 알람은 화면에 표시됩니다.', { exact: true })
      .isVisible(),
    'missing audio support was not explained in Korean',
  );
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

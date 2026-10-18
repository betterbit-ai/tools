/** The countdown stays wall-clock accurate in background tabs and never hides alarm failures. */
export default async function (t) {
  await t.page.clock.install({ time: new Date('2026-10-19T00:00:00Z') });
  await t.page.addInitScript(() => {
    window.__timerOscillatorStarts = 0;
    const originalStart = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      window.__timerOscillatorStarts += 1;
      return originalStart.apply(this, args);
    };
  });
  await t.open('/timer');
  await t.page.clock.pauseAt((await t.page.evaluate(() => Date.now())) + 100);

  const timer = t.page.getByRole('timer');
  const hours = t.page.getByRole('spinbutton', { name: 'Hours', exact: true });
  const minutes = t.page.getByRole('spinbutton', { name: 'Minutes', exact: true });
  const seconds = t.page.getByRole('spinbutton', { name: 'Seconds', exact: true });

  // An everyday custom countdown starts, advances, pauses, and resumes without real-time waiting.
  await hours.fill('0');
  await minutes.fill('0');
  await seconds.fill('10');
  t.assert((await timer.innerText()) === '00:10', 'custom 10-second input was not accepted');
  await t.click('Test sound');
  t.assert(
    (await t.page.evaluate(() => window.__timerOscillatorStarts)) === 3,
    'sound test did not schedule its three tones',
  );
  await t.click('Start');
  await t.page.clock.runFor(2_200);
  const afterTwoSeconds = await timer.innerText();
  t.assert(
    afterTwoSeconds === '00:08',
    `countdown reached ${afterTwoSeconds} instead of 00:08 after about two seconds`,
  );
  await t.page.keyboard.press('Space');
  await t.page.clock.runFor(5_000);
  t.assert((await timer.innerText()) === '00:08', 'paused countdown kept advancing');
  t.assert(await t.page.getByRole('button', { name: 'Resume', exact: true }).isVisible(), 'Space did not pause');
  await t.page.keyboard.press('Space');

  // Freeze the page with Chrome's lifecycle API, as happens to a hidden tab. After resuming,
  // jump the wall clock past its deadline without running interval ticks, then let one callback
  // run. A tick-counting timer would still show 7 s.
  const hiddenAt = await t.page.evaluate(() => Date.now());
  const devtools = await t.page.context().newCDPSession(t.page);
  await devtools.send('Page.setWebLifecycleState', { state: 'frozen' });
  await devtools.send('Page.setWebLifecycleState', { state: 'active' });
  await t.page.clock.setSystemTime(hiddenAt + 9_000);
  await t.page.clock.runFor(500);
  const backgroundResult = await timer.innerText();
  t.assert(backgroundResult === '00:00', `background timer showed ${backgroundResult} instead of catching up`);
  t.assert((await t.page.title()).startsWith('⏰ Time’s up!'), 'completed timer was not exposed in the tab title');
  t.assert(
    (await t.page.evaluate(() => window.__timerOscillatorStarts)) >= 6,
    'alarm completion did not schedule audible tones',
  );
  await devtools.detach();

  // A running timer survives reload at the correct absolute time. Because reload removes the
  // browser's user-activated AudioContext, the UI must explain how to re-enable its alarm.
  await t.click('Reset');
  await seconds.fill('30');
  await t.click('Start');
  await t.page.clock.runFor(5_200);
  const beforeReload = await timer.innerText();
  t.assert(beforeReload === '00:25', `30-second timer reached ${beforeReload} instead of 00:25`);
  const savedTimer = await t.page.evaluate(() => localStorage.getItem('tools:timer:state'));
  t.assert(savedTimer?.includes('"status":"running"'), `running timer was not persisted: ${savedTimer}`);
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.clock.runFor(100);
  const restoredClock = await t.page.getByRole('timer').innerText();
  t.assert(restoredClock === '00:25', `reload changed the saved remaining time to ${restoredClock}`);
  await t.waitForText('Press Test sound once to enable its alarm in this tab.');
  await t.click('Test sound');
  t.assert(
    (await t.page.getByText('Press Test sound once to enable its alarm in this tab.').count()) === 0,
    'successful sound test did not clear the restored-timer warning',
  );

  // A rejected audio activation is visible instead of silently leaving the alarm enabled.
  await t.click('Reset');
  await t.page.clock.runFor(100);
  await t.page.evaluate(() => localStorage.removeItem('tools:timer:state'));
  await t.page.addInitScript(() => {
    Object.defineProperty(AudioContext.prototype, 'resume', {
      configurable: true,
      value: () => Promise.reject(new Error('audio activation blocked')),
    });
  });
  await t.page.clock.resume();
  await t.open('/timer');
  await t.page.clock.pauseAt((await t.page.evaluate(() => Date.now())) + 100);
  await t.click('Test sound');
  await t.waitForText('The browser blocked the alarm sound. Press Test sound to enable it, then try again.');

  // Unsupported Web Audio is also visible and explained; the visual timer remains usable.
  await t.page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined });
  });
  await t.page.clock.resume();
  await t.open('/timer');
  await t.page.clock.pauseAt((await t.page.evaluate(() => Date.now())) + 100);
  await t.click('Test sound');
  await t.waitForText('This browser cannot play the alarm sound. The timer will still end visibly.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'missing Web Audio was not exposed as an alert');
  await t.page.getByRole('spinbutton', { name: 'Minutes', exact: true }).fill('0');
  const unsupportedSeconds = t.page.getByRole('spinbutton', { name: 'Seconds', exact: true });
  await unsupportedSeconds.fill('1');
  t.assert((await unsupportedSeconds.inputValue()) === '1', 'soundless timer did not accept one-second input');
  const oneSecondClock = await t.page.getByRole('timer').innerText();
  t.assert(oneSecondClock === '00:01', `one-second input updated the timer to ${oneSecondClock}`);
  await t.click('Start');
  await t.page.clock.runFor(1_200);
  const unsupportedResult = await t.page.getByRole('timer').innerText();
  t.assert(unsupportedResult === '00:00', `soundless visual timer stopped at ${unsupportedResult}`);

  // Korean failure copy, keyboard focus, mobile width, and dark rendering remain usable.
  await t.page.clock.resume();
  await t.open('/ko/timer');
  await t.page.clock.pauseAt((await t.page.evaluate(() => Date.now())) + 100);
  await t.click('소리 테스트');
  await t.waitForText('이 브라우저에서는 알람 소리를 재생할 수 없습니다. 타이머 종료는 화면에 표시됩니다.');
  await t.page.getByRole('spinbutton', { name: '시간', exact: true }).focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.labels?.[0]?.innerText.trim())) === '분',
    'keyboard focus did not move through the duration inputs',
  );
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

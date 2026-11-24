/**
 * Pomodoro timer: the loop a person actually runs — add a task, start a 25-minute focus session,
 * keep working while the tab is hidden, hear the break, and find the session in the log.
 *
 * Playwright's clock fast-forwards instead of waiting, and a CDP freeze plus a system-time jump
 * stands in for a background tab.
 *
 * Covers the defects this audit fixed:
 *  - the end of a break was silent: the completion alert keyed off the newest session record, and a
 *    break adds no record, so only focus sessions ever rang;
 *  - Space on a focused button or phase button started/paused the timer instead of pressing the
 *    control, so a keyboard user could not press Reset or Skip at all;
 *  - clearing a minutes field snapped it to 1, so "50" typed after Ctrl+A became 150;
 *  - a blocked notification permission and a missing audio context failed with no explanation;
 *  - a session detected late in a throttled tab was logged at the detection time, not when it ended.
 */

const STATE_KEY = 'tools:pomodoro-timer:state';

async function timerLabel(page) {
  return page.locator('[role=timer]').getAttribute('aria-label');
}

async function saved(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), STATE_KEY);
}

async function notifications(page) {
  return page.evaluate(() => window.__notifications ?? []);
}

/** Seconds in a "Focus: 12:34" label. */
function labelSeconds(text) {
  const match = text.match(/(\d+):(\d\d)$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
}

const clock = (ms) => {
  const total = Math.round(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export default async function (t) {
  const page = t.page;
  await page.clock.install({ time: new Date('2026-10-19T07:00:00Z') });
  await page.addInitScript(() => {
    window.__beeps = 0;
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      window.__beeps += 1;
      return start.apply(this, args);
    };
    window.__notifications = [];
    class StubNotification {
      constructor(title, options) {
        window.__notifications.push({ title, body: options?.body });
      }
      static permission = 'granted';
      static requestPermission() {
        return Promise.resolve('granted');
      }
    }
    Object.defineProperty(window, 'Notification', { configurable: true, writable: true, value: StubNotification });
  });
  await t.open('/pomodoro-timer');
  await page.waitForTimeout(400);

  const primary = () => page.locator('main button[class*="bg-accent"]').first().innerText();
  const beeps = () => page.evaluate(() => window.__beeps);

  // ── 1. It opens ready for a 25-minute focus session.
  t.assert((await timerLabel(page)) === 'Focus: 25:00', `the page opens on "${await timerLabel(page)}"`);
  t.assert((await primary()) === 'Start', `the main button says "${await primary()}"`);

  // Notifications are opt-in: turn them on with the granted permission the stub reports.
  await page.getByText('Browser notifications', { exact: true }).click();
  await page.waitForTimeout(300);
  t.assert(
    await page.evaluate(() => document.querySelector('input[type=checkbox]')?.checked === true),
    'the notification switch stayed off with a granted permission',
  );

  // ── 2. Space belongs to the control that has focus.
  await page.getByRole('button', { name: 'Skip', exact: true }).focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  t.assert(
    (await timerLabel(page)) === 'Short break: 05:00',
    `Space on the focused Skip button left "${await timerLabel(page)}" instead of skipping`,
  );
  t.assert((await primary()) === 'Start', 'Space on Skip started the timer');
  await page.getByRole('radio', { name: 'Focus', exact: true }).click();
  await page.waitForTimeout(200);

  // ── 3. Space on the page starts and pauses, and the tab title carries the countdown.
  await page.locator('main h2').first().click();
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  t.assert((await primary()) === 'Pause', `Space did not start the timer (button: ${await primary()})`);
  await page.clock.runFor(60_000);
  await page.waitForTimeout(100);
  t.assert(
    Math.abs(labelSeconds(await timerLabel(page)) - 24 * 60) <= 1,
    `after a minute: "${await timerLabel(page)}"`,
  );
  t.assert((await page.title()).includes('24:00'), `the tab title does not show the countdown: ${await page.title()}`);

  // ── 4. A hidden tab keeps the right remaining time.
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.waitForTimeout(200);
  t.assert((await timerLabel(page)) === 'Focus: 24:00', 'pausing lost the remaining time');
  t.assert((await primary()) === 'Resume', `after pausing the button says "${await primary()}"`);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.waitForTimeout(200);

  const hiddenAt = await page.evaluate(() => Date.now());
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
  await cdp.send('Page.setWebLifecycleState', { state: 'active' });
  await page.clock.setSystemTime(hiddenAt + 5 * 60_000);
  await page.clock.runFor(400);
  await page.waitForTimeout(150);
  t.assert(
    Math.abs(labelSeconds(await timerLabel(page)) - 19 * 60) <= 2,
    `after five hidden minutes the timer reads "${await timerLabel(page)}" instead of ${clock(19 * 60_000)}`,
  );
  await cdp.detach();

  // ── 5. Finishing the focus session moves to the break, rings, notifies and logs the session.
  const focusEnd = (await saved(page)).endAt;
  await page.clock.setSystemTime(focusEnd + 60_000);
  await page.clock.runFor(400);
  await page.waitForTimeout(200);
  t.assert((await timerLabel(page)) === 'Short break: 05:00', `after the session: "${await timerLabel(page)}"`);
  t.assert((await page.locator('main').innerText()).includes('Session complete'), 'the completion message is missing');
  t.assert((await beeps()) === 2, `the session end played ${await beeps()} tones instead of one two-tone alert`);
  const firstNotes = await notifications(page);
  t.assert(firstNotes.length === 1, `the session end sent ${firstNotes.length} notifications`);
  t.assert(firstNotes[0]?.body === 'Session complete. Next: Short break.', `notification body: ${firstNotes[0]?.body}`);
  const afterFocus = await saved(page);
  t.assert(afterFocus.sessions.length === 1, `the session was not recorded (${afterFocus.sessions.length} records)`);
  t.assert(
    afterFocus.sessions[0].completedAt === focusEnd,
    `the session is logged at ${new Date(afterFocus.sessions[0].completedAt).toISOString()} instead of its end ${new Date(
      focusEnd,
    ).toISOString()}`,
  );
  t.assert((await page.locator('main').innerText()).includes('Focus sessions today'), 'the today count is missing');

  // ── 6. The end of the break rings too.
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.waitForTimeout(200);
  await page.clock.runFor(5 * 60_000 + 1_000);
  await page.waitForTimeout(200);
  t.assert((await timerLabel(page)) === 'Focus: 25:00', `after the break: "${await timerLabel(page)}"`);
  t.assert((await beeps()) === 4, `the break end played ${await beeps()} tones in total; a break should alert too`);
  const secondNotes = await notifications(page);
  t.assert(secondNotes.length === 2, `the break end sent ${secondNotes.length - 1} notifications`);
  t.assert(
    secondNotes[1]?.body === 'Session complete. Next: Focus.',
    `break notification body: ${secondNotes[1]?.body}`,
  );

  // ── 7. A clearing edit of a minutes field does not turn 50 into 150.
  const focusMinutes = page.getByLabel('Focus (minutes)');
  await focusMinutes.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);
  t.assert((await focusMinutes.inputValue()) === '', `clearing the field left "${await focusMinutes.inputValue()}"`);
  t.assert(
    (await timerLabel(page)) === 'Focus: 25:00',
    `an empty field changed the session to "${await timerLabel(page)}"`,
  );
  await page.keyboard.type('50', { delay: 90 });
  await page.waitForTimeout(250);
  t.assert((await focusMinutes.inputValue()) === '50', `typing 50 left "${await focusMinutes.inputValue()}"`);
  t.assert((await timerLabel(page)) === 'Focus: 50:00', `a 50-minute session reads "${await timerLabel(page)}"`);

  // A value beyond the documented range is clamped and shown as such.
  await focusMinutes.fill('999');
  await page.waitForTimeout(250);
  t.assert((await focusMinutes.inputValue()) === '180', `999 minutes is shown as "${await focusMinutes.inputValue()}"`);
  await focusMinutes.fill('1');
  await page.waitForTimeout(200);

  // ── 8. A task is carried into the focus record.
  await page.getByPlaceholder('What will you focus on?').fill('Write the audit spec');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(200);
  t.assert((await page.locator('main').innerText()).includes('Write the audit spec'), 'the task was not added');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.runFor(60_000 + 1_000);
  await page.waitForTimeout(200);
  const withTask = await saved(page);
  t.assert(
    withTask.sessions.at(-1)?.task === 'Write the audit spec',
    `the new session records the task as "${withTask.sessions.at(-1)?.task}"`,
  );

  // ── 9. A running timer survives a reload.
  await page.getByRole('radio', { name: 'Focus', exact: true }).click();
  await focusMinutes.fill('25');
  await page.waitForTimeout(300);
  const buttons = await page.evaluate(() => [...document.querySelectorAll('main button')].map((b) => b.textContent));
  t.assert(buttons.includes('Start'), `the timer is not idle before the reload check: ${buttons.join(' | ')}`);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.runFor(20_000);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(500);
  t.assert((await saved(page)).status === 'running', 'the reload lost the running session');
  t.assert((await primary()) === 'Pause', `after the reload the button says "${await primary()}"`);
  // Leave the timer idle again for the two failure-path reloads below.
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.waitForTimeout(200);

  // ── 10. A refused notification permission is explained instead of the switch silently resetting.
  await page.addInitScript(() => {
    class DeniedNotification {
      static permission = 'denied';
      static requestPermission() {
        return Promise.resolve('denied');
      }
    }
    Object.defineProperty(window, 'Notification', { configurable: true, writable: true, value: DeniedNotification });
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(500);
  await page.getByText('Browser notifications', { exact: true }).click();
  await page.waitForTimeout(400);
  t.assert(
    (await page.locator('main').innerText()).includes('Notifications are blocked for this site'),
    'a denied notification permission is not explained',
  );

  // ── 11. A browser without Web Audio says the sound is unavailable instead of staying silent.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined });
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main').innerText()).includes('could not play the timer sound'),
    'a browser without Web Audio left the missing sound unexplained',
  );
  t.assert((await primary()) === 'Pause', 'the timer did not start without audio');

  // ── 12. The Korean page names the same controls.
  await t.open('/ko/pomodoro-timer');
  await page.waitForTimeout(600);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('집중'), 'the Korean page has no focus phase');
  t.assert(
    (await page.getByRole('button', { name: '건너뛰기', exact: true }).count()) === 1,
    'the Korean page has no skip button',
  );

  // ── 13. 375 px, dark: the countdown and the controls fit.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const box = await page.locator('[role=timer]').boundingBox();
  t.assert(box && box.width <= 375, 'the countdown does not fit the phone viewport');
}

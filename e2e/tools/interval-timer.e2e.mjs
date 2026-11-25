/**
 * Interval timer: start a Tabata round, watch the phases change on time, skip, pause, and come back
 * to a tab that was hidden for a minute.
 *
 * The clock is frozen and advanced by hand, so "the work phase is 20 seconds" is checked rather than
 * waited for. Phase boundaries are computed here from the published Tabata settings, not read from
 * the page.
 */

const START = new Date('2026-11-25T09:00:00Z');

/** Tabata: 5 s get-ready, then 8 × (20 s work + 10 s rest). Boundaries in seconds. */
const SCHEDULE = [
  { phase: 'ready', round: 1, start: 0, end: 5 },
  ...Array.from({ length: 8 }, (_, index) => {
    const workStart = 5 + index * 30;
    return [
      { phase: 'work', round: index + 1, start: workStart, end: workStart + 20 },
      { phase: 'rest', round: index + 1, start: workStart + 20, end: workStart + 30 },
    ];
  }).flat(),
];

function clockText(seconds) {
  const total = Math.ceil(Math.max(0, seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${pad(minutes)}:${pad(rest)}`;
}

/** What the timer should show `elapsed` seconds after Start. */
function expectedAt(elapsed) {
  const current = SCHEDULE.find((entry) => elapsed >= entry.start && elapsed < entry.end);
  if (!current) return { phase: 'done', round: 8, clock: '00:00' };
  return { phase: current.phase, round: current.round, clock: clockText(current.end - elapsed) };
}

export default async function (t) {
  const page = t.page;
  await page.addInitScript(() => {
    window.__oscillators = 0;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) {
      const create = AudioCtor.prototype.createOscillator;
      AudioCtor.prototype.createOscillator = function counted() {
        window.__oscillators += 1;
        return create.call(this);
      };
    }
  });
  await page.clock.install({ time: START });
  await t.open('/interval-timer');
  await page.waitForSelector('[role=timer]', { timeout: 15_000 });
  await page.waitForTimeout(200);

  const timer = page.locator('[role=timer]');
  const clock = async () => (await timer.innerText()).trim();
  const phaseLine = async () =>
    (await timer.evaluate((element) => element.parentElement.querySelector('p').textContent)).trim();
  const roundLine = async () => (await page.locator('main').innerText()).match(/Round \d+ of \d+/)?.[0] ?? '';
  const now = async () => page.evaluate(() => Date.now());
  const advance = async (ms) => {
    await page.clock.runFor(ms);
    await page.waitForTimeout(60);
  };
  const startButton = () => page.getByRole('button', { name: /^Start$|^시작$/ });
  const resetButton = () => page.getByRole('button', { name: /^Reset$|^초기화$/ });

  // ── 1. It opens on the Tabata preset with its total time.
  t.assert((await clock()) === '00:05', `the get-ready countdown starts at ${await clock()}`);
  t.assert(/Get ready|준비/.test(await phaseLine()), `the opening phase is ${await phaseLine()}`);
  t.assert((await roundLine()) === 'Round 1 of 8', `the opening round line is "${await roundLine()}"`);
  t.assert((await page.locator('main').innerText()).includes('04:05'), 'the total session time is not 4:05');

  // ── 2. Start counts down, then runs the first work interval on schedule.
  await startButton().click();
  const startAt = await now();
  await advance(2_000);
  let elapsed = ((await now()) - startAt) / 1000;
  let expected = expectedAt(elapsed);
  t.assert((await clock()) === expected.clock, `2 s in, the clock reads ${await clock()} (expected ${expected.clock})`);
  await advance(3_200);
  elapsed = ((await now()) - startAt) / 1000;
  expected = expectedAt(elapsed);
  t.assert(/Work|운동/.test(await phaseLine()), `after the countdown the phase is ${await phaseLine()}`);
  t.assert((await clock()) === expected.clock, `at work the clock reads ${await clock()} (expected ${expected.clock})`);
  t.assert((await roundLine()) === 'Round 1 of 8', `work round line: ${await roundLine()}`);

  // ── 3. The phase change rang the sound (not silence, not an exception).
  const rings = await page.evaluate(() => window.__oscillators);
  t.assert(rings >= 1, `no phase-change sound was produced (${rings})`);

  // ── 4. Space on a focused button presses that button instead of starting/pausing the timer.
  await resetButton().focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(150);
  t.assert(
    (await clock()) === '00:05' && /Get ready|준비/.test(await phaseLine()),
    `Space on Reset did not reset: ${await phaseLine()} ${await clock()}`,
  );

  // ── 5. Space with no control focused still starts and pauses.
  await page.locator('h1').click();
  await page.keyboard.press('Space');
  await advance(1_000);
  t.assert(
    (await page.getByRole('button', { name: /^Pause$|^일시정지$/ }).count()) === 1,
    'Space did not start the timer',
  );
  await page.locator('h1').click();
  await page.keyboard.press('Space');
  await page.waitForTimeout(120);
  t.assert(
    (await page.getByRole('button', { name: /^Resume$|^계속$/ }).count()) === 1,
    'Space did not pause the timer',
  );
  const pausedClock = await clock();
  await advance(3_000);
  t.assert((await clock()) === pausedClock, 'a paused timer kept counting down');

  // ── 6. Skipping moves to the next phase immediately.
  await page.getByRole('button', { name: /^Resume$|^계속$/ }).click();
  await page.waitForTimeout(100);
  await page.getByRole('button', { name: /Skip phase|단계 건너뛰기/ }).click();
  await page.waitForTimeout(120);
  t.assert(/Work|운동/.test(await phaseLine()), `after skipping the ready phase: ${await phaseLine()}`);
  await resetButton().click();
  await page.waitForTimeout(120);

  // ── 7. A tab hidden for a minute keeps real time instead of the missed ticks.
  await startButton().click();
  const hiddenStart = await now();
  await advance(5_200);
  const beforeHidden = await now();
  t.assert(/Work|운동/.test(await phaseLine()), `before hiding the phase is ${await phaseLine()}`);
  await page.clock.setSystemTime(beforeHidden + 66_000);
  await advance(260);
  elapsed = ((await now()) - hiddenStart) / 1000;
  expected = expectedAt(elapsed);
  t.assert(
    (await clock()) === expected.clock,
    `after 66 s hidden the clock reads ${await clock()} (expected ${expected.clock})`,
  );
  t.assert(
    (await roundLine()) === `Round ${expected.round} of 8`,
    `after 66 s hidden the round line is "${await roundLine()}" (expected round ${expected.round})`,
  );

  // ── 8. While it runs, a preset cannot silently throw the session away.
  const preset = page.getByRole('button', { name: /Tabata 20\/10|타바타 20\/10/ });
  t.assert(await preset.isDisabled(), 'the preset buttons stay usable while a session is running');
  await resetButton().click();
  await page.waitForTimeout(120);
  t.assert(!(await preset.isDisabled()), 'the preset buttons stay disabled after a reset');

  // ── 9. Clearing a seconds field lets the user type the new value.
  const workField = page.getByLabel(/Work \(seconds\)|운동 시간/);
  await workField.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(120);
  const emptied = await workField.inputValue();
  await page.keyboard.type('30');
  await page.waitForTimeout(200);
  t.assert(emptied === '', `clearing the work field left "${emptied}"`);
  t.assert((await workField.inputValue()) === '30', `typing 30 after clearing left "${await workField.inputValue()}"`);
  t.assert(
    (await page.locator('main').innerText()).includes('05:25'),
    'the total did not follow the new work length (5 + 8 × (30 + 10) = 5:25)',
  );

  // ── 10. A whole session ends, and the end is announced.
  await page.getByRole('button', { name: /Tabata 20\/10|타바타 20\/10/ }).click();
  await startButton().click();
  const ringsBefore = await page.evaluate(() => window.__oscillators);
  await advance(246_000);
  t.assert(/Complete|완료/.test(await phaseLine()), `the session ended on ${await phaseLine()}`);
  t.assert((await clock()) === '00:00', `the finished clock reads ${await clock()}`);
  t.assert(
    /Workout complete|운동 완료/.test(await page.locator('main').innerText()),
    'the completion message is missing',
  );
  const ringsAfter = await page.evaluate(() => window.__oscillators);
  t.assert(ringsAfter > ringsBefore, 'the last phase change made no sound');

  // ── 11. Settings survive a reload.
  await resetButton().click();
  await page.getByLabel(/^Rounds|^라운드/).fill('3');
  await page.waitForTimeout(200);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
  t.assert((await page.getByLabel(/^Rounds|^라운드/).inputValue()) === '3', 'the reload lost the round count');

  // ── 12. The Korean page is Korean and keeps the same timing.
  await t.open('/ko/interval-timer');
  await page.waitForTimeout(300);
  t.assert(/인터벌|타바타/.test(await page.locator('main').innerText()), 'the Korean page is not Korean');
  await page.getByRole('button', { name: /^시작$/ }).click();
  await advance(5_200);
  t.assert(/운동/.test(await phaseLine()), `the Korean page phase after 5 s: ${await phaseLine()}`);
  const seo = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
    alternates: [...document.querySelectorAll('link[rel=alternate]')].map((node) => node.getAttribute('href')),
  }));
  t.assert(seo.h1 === 1, `h1 count: ${seo.h1}`);
  t.assert(seo.canonical === 'https://betterbit.org/ko/interval-timer', `canonical: ${seo.canonical}`);
  t.assert(
    seo.alternates.includes('https://betterbit.org/interval-timer'),
    `hreflang pair: ${JSON.stringify(seo.alternates)}`,
  );

  // ── 13. 375 px in dark mode: the digits fit and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  t.assert(overflow <= 1, `the page scrolls sideways by ${overflow}px at 375px`);
  const box = await timer.boundingBox();
  t.assert(box && box.width <= 375, 'the clock does not fit the phone viewport');

  t.assert(t.errors.page.length === 0, `page errors: ${t.errors.page.join(' | ')}`);
}

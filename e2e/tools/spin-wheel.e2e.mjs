/**
 * Spin the wheel: a realistic roster goes in, one ticket comes out, and every control
 * on the page changes what it says it does. Covers the two keyboard/statistics defects
 * this audit fixed: Space on a focused button spun the wheel instead of pressing the
 * button, and the session tally stopped at 8 (the length of the result list).
 */

/** Click a control that may sit under the sticky header once scrolled into view. */
async function tap(locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await locator.click();
}

async function stat(page, label) {
  const element = page.getByText(label, { exact: true }).first().locator('..');
  return Number((await element.innerText()).replace(/[^\d]/g, ''));
}

export default async function (t) {
  const page = t.page;

  // --- Hydration: a dead island would leave these controls doing nothing at all.
  await t.open('/spin-wheel');
  t.assert(!t.errors.page.length, `spin-wheel failed to hydrate: ${t.errors.page[0]}`);
  t.assert(!t.errors.console.length, `spin-wheel logged an error: ${t.errors.console[0]}`);

  const entries = page.locator('textarea');
  const removeWinner = page.getByRole('checkbox', { name: 'Remove winner after each spin', exact: true });
  const spinButton = page.getByRole('button', { name: 'Spin the wheel', exact: true });

  // --- An 80-emoji entry is 160 UTF-16 units but exactly the advertised 80 characters.
  await entries.fill(`${'😀'.repeat(80)}\r\n김민지`);
  t.assert(!(await spinButton.isDisabled()), 'an 80-emoji entry was rejected even though it is within the limit');
  await entries.fill(`${'😀'.repeat(81)}\n김민지`);
  t.assert(await spinButton.isDisabled(), 'an 81-character entry left the spin enabled');
  await t.waitForText('Keep each entry to 80 characters or fewer.');

  // --- Preset lists replace the roster and drive the entry count.
  await entries.fill('Alex\n김민지\n😀 Prize');
  await tap(page.getByRole('button', { name: 'Numbers 1–10', exact: true }));
  t.assert((await entries.inputValue()).split('\n').length === 10, 'the numbers preset did not load ten entries');
  await t.waitForText('10 entries');
  await tap(page.getByRole('button', { name: 'Yes / No', exact: true }));
  t.assert((await entries.inputValue()) === 'Yes\nNo', 'the yes/no preset did not replace the roster');
  await t.waitForText('2 entries');
  await tap(page.getByRole('button', { name: 'Lunch ideas', exact: true }));
  t.assert((await entries.inputValue()).split('\n').length === 6, 'the lunch preset did not load six entries');
  await tap(page.getByRole('button', { name: 'Restore sample', exact: true }));
  t.assert(
    (await entries.inputValue()) === 'Alex\nSam\nJordan\nTaylor',
    'restore sample did not bring the default roster back',
  );

  // --- A keypress on a focused button must press that button, not spin the wheel.
  const yesNo = page.getByRole('button', { name: 'Yes / No', exact: true });
  await yesNo.focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  t.assert(
    (await entries.inputValue()) === 'Yes\nNo',
    'Space on the focused Yes / No button did not press it — the wheel took the key instead',
  );
  t.assert(
    (await page.locator('output').innerText()).trim() === 'Your result will appear here',
    'Space on a focused button started a draw',
  );
  const fullScreen = page.getByRole('button', { name: 'Full screen', exact: true });
  await fullScreen.focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('output').innerText()).trim() === 'Your result will appear here',
    'Space on the focused Full screen button drew a winner',
  );
  if (await page.evaluate(() => !!document.fullscreenElement)) await page.keyboard.press('Escape');

  // --- Space outside a field still spins, and the draw lands on a real ticket.
  await entries.fill('Alex\n김민지\n😀 Prize');
  await page.locator('#spin-wheel-entry-count').click();
  await page.keyboard.press('Space');
  await t.waitForText('Spinning…');
  await page.waitForTimeout(3_400);
  const winner = (await page.locator('output').innerText()).trim();
  t.assert(['Alex', '김민지', '😀 Prize'].includes(winner), `unexpected selected entry: ${winner}`);
  const remaining = (await entries.inputValue()).split('\n');
  t.assert(
    remaining.length === 2 && !remaining.includes(winner),
    `the selected ticket was not removed exactly once: ${remaining.join(', ')}`,
  );
  t.assert((await stat(page, 'Entries remaining')) === 2, 'the remaining-entry count did not follow the removal');
  t.assert((await stat(page, 'Spins this session')) === 1, 'the first spin was not counted');

  // --- Turning winner removal off keeps the roster for repeat draws.
  await tap(page.getByText('Remove winner after each spin', { exact: true }));
  t.assert(!(await removeWinner.isChecked()), 'the winner-removal switch did not turn off');
  await entries.fill('Heads\nTails');
  await tap(spinButton);
  await page.waitForTimeout(3_500);
  t.assert((await entries.inputValue()) === 'Heads\nTails', 'the roster changed although winner removal was off');

  // --- The session tally counts every spin, not just the eight results the list keeps.
  await tap(page.getByText('Remove winner after each spin', { exact: true }));
  t.assert(await removeWinner.isChecked(), 'the winner-removal switch did not turn back on');
  await entries.fill('A\nB\nC\nD\nE\nF\nG\nH\nI\nJ\nK\nL');
  for (let index = 0; index < 9; index += 1) {
    await tap(spinButton);
    await page.waitForTimeout(3_500);
  }
  t.assert(
    (await stat(page, 'Spins this session')) === 11,
    `the session tally stopped short: ${await stat(page, 'Spins this session')} counted for 11 spins`,
  );
  t.assert(
    (await page.locator('ol.grid li').count()) === 8,
    'the result list should keep its eight most recent entries',
  );
  t.assert(
    (await entries.inputValue()).split('\n').length === 3,
    'nine removals from twelve entries should leave three',
  );

  // --- Clearing the result list empties it without touching the roster.
  await tap(page.getByRole('button', { name: 'Clear history', exact: true }));
  t.assert((await page.locator('ol.grid li').count()) === 0, 'clear history left results behind');
  await t.waitForText('Spin the wheel to start a result history.');
  t.assert((await entries.inputValue()).split('\n').length === 3, 'clearing history changed the roster');

  // --- A wheel of 100 entries is allowed; 101 is refused in plain words.
  const hundred = Array.from({ length: 100 }, (_, index) => `Entry ${index + 1}`).join('\n');
  await entries.fill(hundred);
  t.assert(!(await spinButton.isDisabled()), 'a 100-entry wheel was refused');
  await t.waitForText('100 entries');
  await entries.fill(`${hundred}\nEntry 101`);
  t.assert(await spinButton.isDisabled(), '101 entries left the spin enabled');
  await t.waitForText('Use no more than 100 entries in one wheel.');

  // --- An empty roster explains itself instead of spinning.
  await tap(page.getByRole('button', { name: 'Clear list', exact: true }));
  t.assert(await spinButton.isDisabled(), 'an empty roster left the spin enabled');
  await t.waitForText('Add at least two non-empty entries before spinning.');
  t.assert(await page.getByRole('alert').isVisible(), 'the empty-roster problem was not exposed as an alert');

  // --- The roster survives a reload, and the Korean page reads pasted Unicode separators.
  await entries.fill('Alex\n김민지');
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:spin-wheel:settings') ?? '{}').input === 'Alex\n김민지',
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForFunction(() => document.querySelector('textarea')?.value === 'Alex\n김민지');

  await t.open('/ko/spin-wheel');
  await page.locator('textarea').fill('가\u2028나');
  t.assert(
    !(await page.getByRole('button', { name: '돌리기', exact: true }).isDisabled()),
    'a pasted Korean Unicode line separator was not read as two entries',
  );
  await t.waitForText('2개 항목');

  // --- 375 px in dark mode: no sideways scroll, and the page still paints.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );
  await page
    .getByRole('button', { name: '돌리기', exact: true })
    .evaluate((button) => button.scrollIntoView({ block: 'center' }));
  t.assert(
    await page.getByRole('button', { name: '돌리기', exact: true }).isVisible(),
    'the spin action is not reachable at 375 px',
  );
}

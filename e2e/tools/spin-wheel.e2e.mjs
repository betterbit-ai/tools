/** The wheel preserves a realistic Unicode roster, prevents edits during a draw, and remains usable on mobile. */
export default async function (t) {
  await t.page.addInitScript(() => {
    window.__spinWheelHydrationError = null;
    window.addEventListener('astro:hydration-error', (event) => {
      window.__spinWheelHydrationError = event.detail?.error?.message ?? 'unknown hydration error';
    });
  });
  await t.open('/spin-wheel');
  t.assert(!t.errors.page.length, `spin-wheel hydration failed: ${t.errors.page[0]}`);
  t.assert(!t.errors.console.length, `spin-wheel hydration logged an error: ${t.errors.console[0]}`);
  t.assert(
    !(await t.page.evaluate(() => window.__spinWheelHydrationError)),
    `spin-wheel hydration failed: ${await t.page.evaluate(() => window.__spinWheelHydrationError)}`,
  );

  const entries = t.page.locator('textarea');
  const removeWinner = t.page.getByRole('checkbox', { name: 'Remove winner after each spin', exact: true });

  // An 80-emoji entry is 160 UTF-16 code units, but still exactly the advertised 80 characters.
  await entries.fill(`${'😀'.repeat(80)}\r\n김민지`);
  t.assert(
    !(await t.page.getByRole('button', { name: 'Spin the wheel', exact: true }).isDisabled()),
    'an 80-emoji entry was rejected even though it is within the 80-character limit',
  );

  // A normal roster saves locally; the active controls must not permit edits that winner removal would overwrite.
  await entries.fill('Alex\n김민지\n😀 Prize');
  await t.click('Spin the wheel');
  t.assert(await entries.isDisabled(), 'entries remained editable while an active spin could overwrite them');
  t.assert(await removeWinner.isDisabled(), 'winner-removal setting changed during an active spin');
  await t.page.waitForTimeout(3_600);

  const winner = (await t.page.locator('output').innerText()).trim();
  const remaining = await entries.inputValue();
  t.assert(['Alex', '김민지', '😀 Prize'].includes(winner), `unexpected selected entry: ${winner}`);
  t.assert(
    remaining.split('\n').length === 2 && !remaining.split('\n').includes(winner),
    'the selected ticket was not removed exactly once after the spin',
  );
  await t.page.waitForFunction(
    (value) => JSON.parse(localStorage.getItem('tools:spin-wheel:settings') ?? '{}').input === value,
    remaining,
  );
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.waitForFunction((value) => document.querySelector('textarea')?.value === value, remaining);

  // Disabled actions still explain why a wheel cannot be spun.
  await t.click('Clear list');
  await t.waitForText('Add at least two non-empty entries before spinning.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'invalid entry count was not exposed as an alert');

  await t.open('/ko/spin-wheel');
  const koreanEntries = t.page.locator('textarea');
  await koreanEntries.fill('가\u2028나');
  t.assert(
    !(await t.page.getByRole('button', { name: '돌리기', exact: true }).isDisabled()),
    'Korean pasted Unicode line separator was not recognized as two entries',
  );
  const koreanRemoveWinner = t.page.getByRole('checkbox', { name: '돌린 뒤 당첨자 자동 제외', exact: true });
  await koreanRemoveWinner.focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    await t.page
      .getByRole('button', { name: '돌리기', exact: true })
      .evaluate((button) => button === document.activeElement),
    'keyboard focus did not move from the winner-removal switch to the spin action',
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

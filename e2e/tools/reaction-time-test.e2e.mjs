/** Exercise the five-round reaction flow plus keyboard, Korean, mobile and dark-mode use. */

export default async function (t) {
  await t.open('/reaction-time-test');
  const pad = t.page.getByRole('button', {
    name: /Click, tap, or press Space to start|Wait for the signal|Press now!|Click to try again|Start round|Click to test again/,
  });
  const statText = async (label) => t.page.getByText(label, { exact: true }).locator('..').innerText();

  // An early press is rejected and does not populate the first round.
  await pad.click();
  await t.page.getByRole('button', { name: 'Wait for the signal', exact: true }).waitFor();
  await pad.click();
  await t.waitForText('Too soon');
  t.assert((await statText('Round 1')).includes('—'), 'a false start was recorded as a reaction time');

  // Complete five valid rounds. The first is keyboard-only; every accepted round must update its row.
  await pad.focus();
  await t.page.keyboard.down('Space');
  await t.page.waitForTimeout(20);
  await t.page.keyboard.up('Space');
  for (let round = 1; round <= 5; round += 1) {
    await t.page.getByRole('button', { name: 'Press now!', exact: true }).waitFor();
    await t.page.waitForTimeout(120);
    if (round === 1) {
      await t.page.keyboard.down('Space');
      await t.page.waitForTimeout(20);
      await t.page.keyboard.up('Space');
    } else await pad.click();
    if (round < 5) {
      await t.page.getByRole('button', { name: `Start round ${round + 1}`, exact: true }).waitFor();
      t.assert(
        !(await statText(`Round ${round}`)).includes('—'),
        `round ${round} did not record a keyboard or pointer response`,
      );
      await pad.click();
    }
  }
  await t.page.getByRole('button', { name: 'Click to test again', exact: true }).waitFor();
  t.assert((await statText('Average')).includes('ms'), 'the five-round average is missing');
  t.assert((await statText('Lab-reference percentile')).includes('Faster than'), 'the reference percentile is missing');
  t.assert((await statText('Best 5-round average')).includes('ms'), 'the local best average was not saved');

  // Korean copy, a phone-sized viewport, and dark-mode rendering stay usable without overflow.
  await t.open('/ko/reaction-time-test');
  await t.waitForText('반응속도 테스트');
  t.assert(await t.page.getByText('연구 참고 백분위', { exact: true }).isVisible(), 'Korean result label is absent');
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

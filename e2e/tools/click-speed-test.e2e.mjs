/** Exercise real mouse, touch and keyboard CPS runs, local bests, and responsive dark mode. */

export default async function (t) {
  const context = t.page.context();
  await context.clearPermissions();
  await t.open('/click-speed-test');

  const statText = async (label) => t.page.getByText(label, { exact: true }).locator('..').innerText();
  const pad = t.page.getByRole('button', { name: /Click or tap to start|Keep clicking|Click to try again/ });

  // The first pointer press must start the run and count. The default five-second length gives
  // real browser clicks enough scheduling headroom while asserting the fixed-time formula.
  await pad.click();
  for (let press = 0; press < 5; press += 1) await pad.click();
  t.assert(
    (await statText('Clicks')).startsWith('6\n'),
    `the first click was not counted: ${await statText('Clicks')}`,
  );
  await t.waitForText(/Result: 6 clicks ÷ 5 seconds = 1\.20 CPS/);
  t.assert(
    (await statText('Personal best')).includes('\n1.20\n'),
    `the completed run was not saved as a local best: ${await statText('Personal best')}`,
  );

  // A second, lower run must not overwrite the local record.
  await t.page.getByRole('button', { name: 'Click to try again', exact: true }).click();
  await t.waitForText('Keep clicking');
  await t.waitForText(/Result: 1 clicks ÷ 5 seconds = 0\.20 CPS/);
  t.assert((await statText('Personal best')).includes('\n1.20\n'), 'a lower score replaced the local best');

  // The large native button is keyboard-operable; one Space keydown starts the run and key repeat
  // must not inflate the count.
  await t.click('Reset');
  await pad.focus();
  await t.page.keyboard.down('Space');
  await t.page.waitForTimeout(100);
  await t.page.keyboard.up('Space');
  t.assert((await statText('Clicks')).startsWith('1\n'), 'focused Space did not count exactly one press');
  await t.waitForText(/Result: 1 clicks ÷ 5 seconds = 0\.20 CPS/);

  // Touch input is accepted without a protected browser permission.
  await t.click('Reset');
  await pad.dispatchEvent('pointerdown', { button: 0, pointerType: 'touch' });
  t.assert((await statText('Clicks')).startsWith('1\n'), 'a primary touch press did not start and count');
  await t.click('Reset');

  // Korean copy, a phone-sized viewport, and dark-mode rendering must remain usable without page
  // overflow. The 5-second default is also present after localization.
  await t.open('/ko/click-speed-test');
  await t.waitForText('클릭 속도 테스트');
  t.assert(await t.page.getByRole('radio', { name: '5초', exact: true }).isVisible(), 'Korean 5-second mode is absent');
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

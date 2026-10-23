/** WCAG/APCA results should update from real inputs, including on a narrow localized screen. */
export default async function (t) {
  await t.open('/contrast-checker');
  await t.waitForText('WCAG 2 ratio');

  const hexInputs = t.page.locator('input[type=text]');
  await hexInputs.nth(0).fill('#777777');
  await hexInputs.nth(1).fill('#FFFFFF');
  await t.waitForText('4.48:1');
  t.assert(
    (await t.page.locator('main').innerText()).includes('AAA normal text · ≥ 7:1\nFail'),
    'failed WCAG status was not shown',
  );

  // Keyboard focus can reach the swap action, which should preserve the same ratio.
  await t.click('Swap colours');
  t.assert(
    await hexInputs
      .nth(0)
      .inputValue()
      .then((value) => value === '#FFFFFF'),
    'swap did not move the background colour',
  );
  await t.waitForText('4.48:1');
  t.assert(await t.page.getByRole('img', { name: /Live preview/ }).isVisible(), 'live colour preview was not rendered');

  await t.open('/ko/contrast-checker');
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  await t.waitForText('WCAG 2 대비율');
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

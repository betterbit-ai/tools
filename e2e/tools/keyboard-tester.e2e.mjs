/** Exercise physical key input, rollover, diagnostics, accessibility, and browser fallbacks. */

export default async function (t) {
  const context = t.page.context();
  await context.clearPermissions();
  await t.open('/keyboard-tester');

  const testArea = t.page.getByRole('group', { name: 'Keyboard test area', exact: true });
  const statText = async (label) => t.page.getByText(label, { exact: true }).locator('..').innerText();

  // The tool needs no protected API: it must work after all harness permissions are removed.
  await testArea.focus();
  for (const key of ['a', 's', 'd', 'f', 'j', 'k']) await t.page.keyboard.down(key);
  t.assert((await statText('Currently held')).startsWith('6\n'), 'six ordinary held keys were not registered');
  t.assert((await statText('Max simultaneous')).startsWith('6\n'), 'rollover maximum did not reach six');
  for (const key of ['a', 's', 'd', 'f', 'j', 'k']) await t.page.keyboard.up(key);
  t.assert((await statText('Currently held')).startsWith('0\n'), 'released keys remained held');
  t.assert((await statText('Keys tested')).startsWith('6% (6/104)\n'), 'coverage did not count six unique keys');
  t.assert(
    (await statText('Last key')).startsWith('k · KeyK\n'),
    `last physical key was reported incorrectly: ${await statText('Last key')}`,
  );
  await t.waitForText('2–9 keys registered together.');

  // A key released after focus moves must clear. Keydown and keyup can target different elements
  // when Tab performs its default focus navigation.
  await t.click('Reset');
  await testArea.focus();
  await t.page.keyboard.down('Tab');
  await t.page.keyboard.up('Tab');
  t.assert((await statText('Currently held')).startsWith('0\n'), 'Tab stayed held after moving browser focus');
  t.assert((await statText('Last key')).includes('Tab · Tab'), 'Tab was not recorded before focus moved');

  // Chatter is release-to-repress timing. A long initial press followed by a 10 ms repress must
  // still be flagged, while releasing the second press must not hide the finding.
  await t.click('Reset');
  await testArea.focus();
  await t.page.keyboard.down('a');
  await t.page.waitForTimeout(100);
  await t.page.keyboard.up('a');
  await t.page.waitForTimeout(10);
  await t.page.keyboard.down('a');
  await t.page.keyboard.up('a');
  await t.waitForText('Possible chattering on: A.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'chatter finding was not exposed as an alert');

  // Holding an ordinary key for the documented threshold produces a visible, timed warning and
  // releasing it immediately clears the live stuck state.
  await t.click('Reset');
  await testArea.focus();
  await t.page.keyboard.down('b');
  await t.waitForText(/Still reported as held: B \(5\.\d+s\)/, 7_000);
  await t.page.keyboard.up('b');
  await t.page.waitForFunction(() => !document.querySelector('[role="alert"]'));

  // Layout switching changes physical letter labels, and the test target itself is reachable
  // without a mouse.
  await t.page.getByRole('radio', { name: 'Korean (2-set)', exact: true }).click();
  t.assert((await testArea.innerText()).includes('ㅁ'), 'Korean 2-set labels did not replace letter keys');
  await t.page.getByRole('button', { name: 'Reset', exact: true }).focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    await testArea.evaluate((element) => element === document.activeElement),
    'test area is not keyboard focusable',
  );

  // A 375 px viewport intentionally scrolls the full-size board inside its own region without
  // forcing the page sideways; dark mode must retain a rendered background.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has page-level horizontal overflow',
  );
  t.assert(
    await testArea.evaluate((element) => element.scrollWidth > element.clientWidth),
    'full-size keyboard did not remain scrollable inside the mobile viewport',
  );
  t.assert(
    (await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );

  // Current desktop Chrome, Safari, and Firefox expose KeyboardEvent.code. Detect that capability
  // directly (not by user agent), and explain the failure before accepting input when it is absent.
  await t.page.addInitScript(() => {
    Reflect.deleteProperty(KeyboardEvent.prototype, 'code');
  });
  await t.open('/keyboard-tester');
  await t.waitForText('This browser does not expose physical key codes');
  t.assert(await t.page.getByRole('alert').isVisible(), 'missing KeyboardEvent.code was not exposed as an alert');
  t.assert(
    (await t.page.getByRole('group', { name: 'Keyboard test area', exact: true }).getAttribute('aria-disabled')) ===
      'true',
    'unsupported test area remained enabled',
  );

  await t.open('/ko/keyboard-tester');
  await t.waitForText('이 브라우저는 물리 키 코드를 제공하지 않아 키보드 테스트를 실행할 수 없습니다.');
}

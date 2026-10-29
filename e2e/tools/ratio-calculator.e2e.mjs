/** Live calculator modes work in Chromium at desktop and mobile widths. */
export default async function (t) {
  await t.open('/ratio-calculator');
  await t.waitForText('16 : 9');
  await t.page.getByLabel('Width', { exact: true }).fill('1000');
  await t.page.getByLabel('Height', { exact: true }).fill('1000');
  await t.waitForText('1 : 1');

  await t.page.getByRole('radio', { name: 'Proportion', exact: true }).click();
  await t.waitForText('Missing value');
  await t.waitForText('8');

  await t.page.getByRole('radio', { name: 'Recipe', exact: true }).click();
  await t.waitForText('Scale factor');
  await t.waitForText('450');

  await t.page.setViewportSize({ width: 375, height: 800 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  await t.assert(
    await t.page.locator('body').evaluate((body) => body.scrollWidth <= window.innerWidth),
    'mobile layout overflows horizontally',
  );

  await t.open('/ko/ratio-calculator');
  await t.waitForText('비례식 계산기');
  await t.page.getByRole('radio', { name: '화면비', exact: true }).click();
  await t.waitForText('1 : 1');
}

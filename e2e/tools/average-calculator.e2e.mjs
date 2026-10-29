/** Average statistics update from pasted data at desktop and mobile widths. */
export default async function (t) {
  await t.open('/average-calculator');
  await t.waitForText('Average Calculator');

  await t.page.getByLabel('Numbers to analyze', { exact: true }).fill('1, 2, 2, 3, 3, 9');
  await t.waitForText('3.33333333');
  await t.waitForText('2.5');
  await t.waitForText('2, 3');

  await t.page.getByRole('radio', { name: 'Population (n)', exact: true }).click();
  await t.waitForText('2.62466929');

  await t.page.setViewportSize({ width: 375, height: 800 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  await t.assert(
    await t.page.locator('body').evaluate((body) => body.scrollWidth <= window.innerWidth),
    'mobile layout overflows horizontally',
  );

  await t.open('/ko/average-calculator');
  await t.waitForText('평균 계산기');
  await t.page.getByLabel('분석할 숫자', { exact: true }).fill('1, 2, 2, 3, 3, 9');
  await t.waitForText('3.33333333');
}

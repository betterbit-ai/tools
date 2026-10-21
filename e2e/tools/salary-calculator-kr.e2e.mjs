/** Salary landing pages open on their salary and show the same take-home pay as their snippet. */
export default async function (t) {
  await t.open('/ko/salary-calculator-kr/3000-manwon');
  await t.waitForText('2,217,920');
  await t.open('/ko/salary-calculator-kr/10000-manwon');
  await t.waitForText('6,471,093');
  // The base page keeps its own default.
  await t.open('/ko/salary-calculator-kr');
  const text = await t.page.locator('main').innerText();
  t.assert(
    !text.includes('6,471,093') || text.includes('50,000,000'),
    'base page should not inherit a landing-page salary',
  );
}

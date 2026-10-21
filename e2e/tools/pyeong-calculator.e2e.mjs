/** Area landing pages open on their value and show the converted result. */
export default async function (t) {
  await t.open('/ko/pyeong-calculator/84-square-meters');
  await t.waitForText('25.41');
  await t.open('/ko/pyeong-calculator/30-pyeong');
  await t.waitForText('99.17');
}

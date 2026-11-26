/**
 * Exchange rate: a quoted rate turned into a received amount, with every figure recomputed here.
 *
 * Covers the defects this audit fixed:
 *  - reversing the quote and reversing it back did not return the rate the visitor entered
 *    (1,350 → 1,349.527665) because the inverse was rounded to six decimal places;
 *  - the formula line printed the rate rounded to four decimals, so it read
 *    “100 KRW × 0.0007 = 0.0741 USD”, arithmetic that does not hold.
 */

const stats = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main div[class*="bg-surface-2"]')]
        .filter((element) => element.children.length === 2 && element.children[0].className.includes('tabular'))
        .map((element) => [element.children[1].textContent.trim(), element.children[0].textContent.trim()]),
    ),
  );

const rows = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main p.flex')].map((row) => [
        row.children[0].textContent.trim(),
        row.children[1].textContent.trim(),
      ]),
    ),
  );

const formula = (page) => page.locator('main p.font-mono').first().innerText();

const number = (value, digits = 4) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);

export default async function (t) {
  const page = t.page;
  await t.open('/exchange-rate');
  await page.waitForTimeout(600);
  const field = (label) => page.locator('main label').filter({ hasText: label }).locator('input');

  // ── 1. The default quote: 100 USD at 1,350 KRW.
  let shown = await stats(page);
  t.assert(shown['You receive'] === `${number(135_000)} KRW`, `received: ${shown['You receive']}`);
  t.assert(shown['Effective rate'] === number(1_350), `effective rate: ${shown['Effective rate']}`);
  t.assert(
    (await rows(page))['Before fees'] === `${number(135_000)} KRW`,
    `before fees: ${(await rows(page))['Before fees']}`,
  );

  // ── 2. Every input feeds the result: amount, percentage adjustment and fixed fee.
  await field('Amount to exchange').fill('1000');
  await field('Rate adjustment (%)').fill('1.5');
  await field('Fixed fee (KRW)').fill('500');
  await page.waitForTimeout(300);
  const gross = 1_000 * 1_350;
  const charges = (gross * 1.5) / 100 + 500;
  const received = gross - charges;
  shown = await stats(page);
  t.assert(shown['You receive'] === `${number(received)} KRW`, `with fees received: ${shown['You receive']}`);
  t.assert(
    shown['Effective rate'] === number(received / 1_000),
    `with fees effective rate: ${shown['Effective rate']}`,
  );
  let lines = await rows(page);
  t.assert(lines['Before fees'] === `${number(gross)} KRW`, `before fees with fees: ${lines['Before fees']}`);
  t.assert(
    lines['Fees and adjustment'] === `${number(charges)} KRW`,
    `fees and adjustment: ${lines['Fees and adjustment']}`,
  );
  const formulaText = await formula(page);
  for (const piece of [number(1_000), number(1_350), number(gross), number(charges), number(received)]) {
    t.assert(formulaText.includes(piece), `the formula ${JSON.stringify(formulaText)} is missing ${piece}`);
  }

  // ── 3. A discount is subtracted instead of added.
  await field('Rate adjustment (%)').fill('-2');
  await field('Fixed fee (KRW)').fill('0');
  await page.waitForTimeout(300);
  shown = await stats(page);
  t.assert(shown['You receive'] === `${number(gross * 1.02)} KRW`, `a −2% adjustment gave ${shown['You receive']}`);

  // ── 4. Reversing the quote and reversing back returns the rate the visitor entered.
  await field('Amount to exchange').fill('100');
  await field('Rate adjustment (%)').fill('0');
  await field('Quoted rate').fill('1350');
  await page.waitForTimeout(300);
  const swap = page.getByRole('button', { name: 'Reverse currencies and rate' });
  await swap.click();
  await page.waitForTimeout(300);
  const reversedRate = await field('Quoted rate').inputValue();
  t.assert(Math.abs(Number(reversedRate) - 1 / 1_350) < 1e-9, `the reversed rate is ${reversedRate}`);
  t.assert(
    (await stats(page))['You receive'] === `${number(100 / 1_350)} USD`,
    `100 KRW reversed gave ${(await stats(page))['You receive']}`,
  );
  const reversedFormula = await formula(page);
  const shownRate = Number((/× ([0-9.,]+) =/.exec(reversedFormula)?.[1] ?? '').replaceAll(',', ''));
  t.assert(
    Math.abs(shownRate - 1 / 1_350) / (1 / 1_350) < 1e-5,
    `the reversed formula prints the rate as ${shownRate}: ${reversedFormula}`,
  );
  t.assert(
    100 * shownRate < 0.0742 && 100 * shownRate > 0.074,
    `the reversed formula does not multiply out to 0.0741: ${reversedFormula}`,
  );
  await swap.click();
  await page.waitForTimeout(300);
  t.assert(
    (await field('Quoted rate').inputValue()) === '1350',
    `reversing twice left ${await field('Quoted rate').inputValue()} instead of 1350`,
  );

  // ── 5. A small rate is shown with enough digits that the formula still multiplies out.
  await field('Quoted rate').fill('0.000741');
  await page.waitForTimeout(300);
  const tinyFormula = await formula(page);
  t.assert(tinyFormula.includes('0.000741'), `a small rate is rounded in the formula: ${JSON.stringify(tinyFormula)}`);
  t.assert(!/× 0\.0007 =/.test(tinyFormula), `the formula still rounds the rate to 0.0007: ${tinyFormula}`);
  t.assert(
    (await stats(page))['You receive'] === `${number(0.0741)} KRW`,
    `100 × 0.000741 gave ${(await stats(page))['You receive']}`,
  );

  // ── 6. Korean number formats and full-width digits are accepted.
  await field('Quoted rate').fill('1,350');
  await field('Amount to exchange').fill('5만 원');
  await page.waitForTimeout(300);
  shown = await stats(page);
  t.assert(shown['You receive'] === `${number(67_500_000)} KRW`, `5만 원 gave ${shown['You receive']}`);

  // ── 7. Bad input is explained and the swap stays unavailable.
  await field('Quoted rate').fill('abc');
  await page.waitForTimeout(300);
  let alerts = await page.locator('main [role=alert]').allInnerTexts();
  t.assert(alerts.length > 0, 'a non-numeric rate shows no explanation');
  t.assert(await swap.isDisabled(), 'the swap button is still enabled without a usable rate');
  await field('Quoted rate').fill('0');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((text) => /rate above 0/.test(text)),
    'a zero rate is not explained',
  );
  await field('Quoted rate').fill('1350');
  await field('Rate adjustment (%)').fill('150');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((text) => /−100% to 100%/.test(text)),
    'an adjustment above 100% is not explained',
  );
  await field('Rate adjustment (%)').fill('0');

  // ── 8. The copied summary carries the same numbers.
  await field('Amount to exchange').fill('250');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Copy summary' }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(
    copied.includes('Quote: 250 USD × 1,350 KRW/USD') && copied.includes(`You receive: ${number(337_500)} KRW`),
    `the copied summary is wrong: ${JSON.stringify(copied)}`,
  );

  // ── 9. The quote survives a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector('main input[inputmode=decimal]')?.value === '250', null, {
    timeout: 15_000,
  });
  t.assert((await stats(page))['You receive'] === `${number(337_500)} KRW`, 'the reload lost the saved quote');

  // ── 10. The Korean page says the same thing, and 375 px holds its layout.
  await t.open('/ko/exchange-rate');
  await page.waitForTimeout(500);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('실수령액') && korean.includes('실질 환율'), 'the Korean page is missing its labels');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

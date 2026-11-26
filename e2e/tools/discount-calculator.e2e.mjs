/**
 * Discount calculator: stacked coupons in three directions, with every price recomputed here.
 *
 * The tool's arithmetic held up in a real browser; this spec pins the behaviour down (stacked
 * rates, reverse rate, reverse original price, each input's effect, the error notices, the saved
 * inputs) so an audit regression shows up as a failure instead of a wrong price in a shop.
 */

const stats = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main div[class*="bg-surface-2"]')]
        .filter((element) => element.children.length === 2 && element.children[0].className.includes('tabular'))
        .map((element) => [element.children[1].textContent.trim(), element.children[0].textContent.trim()]),
    ),
  );

const steps = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main p.flex')].map((row) => [
        row.children[0].textContent.trim(),
        row.children[1].textContent.trim(),
      ]),
    ),
  );

const money = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
const percent = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);

export default async function (t) {
  const page = t.page;
  await t.open('/discount-calculator');
  await page.waitForTimeout(600);
  const field = (label) => page.locator('main label').filter({ hasText: label }).locator('input');
  const choose = async (name) => {
    await page
      .locator('main [role=radio]')
      .filter({ hasText: new RegExp(`^${name}$`) })
      .click();
    await page.waitForTimeout(250);
  };

  // ── 1. The default 20% + 10% coupon stack on 100 compounds to 72, not 70.
  let shown = await stats(page);
  t.assert(shown['Final price'] === money(72), `default final price: ${shown['Final price']}`);
  t.assert(shown['You save'] === money(28), `default savings: ${shown['You save']}`);
  t.assert(
    shown['Effective discount'] === `${percent(28)}%`,
    `default effective discount: ${shown['Effective discount']}`,
  );
  let detail = await steps(page);
  t.assert(detail['After 20% discount'] === money(80), `first step: ${JSON.stringify(detail)}`);
  t.assert(detail['After 10% discount'] === money(72), `second step: ${JSON.stringify(detail)}`);

  // ── 2. A three-stage stack on 12,900 at 30%, 10% and 5%.
  await field('Original price').fill('12,900');
  await field('First discount (%)').fill('30');
  await field('Coupon discount (%)').fill('10');
  await field('Card or member discount (%)').fill('5');
  await page.waitForTimeout(350);
  const p1 = Math.round(12_900 * 0.7 * 1e6) / 1e6;
  const p2 = Math.round(p1 * 0.9 * 1e6) / 1e6;
  const p3 = Math.round(p2 * 0.95 * 1e6) / 1e6;
  shown = await stats(page);
  t.assert(shown['Final price'] === money(p3), `stacked final price: ${shown['Final price']} (expected ${money(p3)})`);
  t.assert(shown['You save'] === money(12_900 - p3), `stacked savings: ${shown['You save']}`);
  t.assert(
    shown['Effective discount'] === `${percent((1 - p3 / 12_900) * 100)}%`,
    `stacked effective discount: ${shown['Effective discount']}`,
  );
  detail = await steps(page);
  t.assert(detail['After 30% discount'] === money(p1), `30% step: ${JSON.stringify(detail)}`);
  t.assert(detail['After 10% discount'] === money(p2), `10% step: ${JSON.stringify(detail)}`);
  t.assert(detail['After 5% discount'] === money(p3), `5% step: ${JSON.stringify(detail)}`);

  // ── 3. Each field changes the result: clearing the third coupon raises the price.
  await field('Card or member discount (%)').fill('');
  await page.waitForTimeout(300);
  shown = await stats(page);
  t.assert(shown['Final price'] === money(p2), `without the card discount: ${shown['Final price']}`);
  await field('Card or member discount (%)').fill('5');
  await page.waitForTimeout(300);

  // ── 4. Reverse direction: the rate between 12,900 and 7,720.65.
  await choose('Discount rate');
  await field('Final price paid').fill(String(p3));
  await page.waitForTimeout(300);
  shown = await stats(page);
  t.assert(
    shown['Discount rate'] === `${percent((1 - p3 / 12_900) * 100)}%`,
    `reverse rate: ${shown['Discount rate']}`,
  );
  t.assert(shown['You save'] === money(12_900 - p3), `reverse savings: ${shown['You save']}`);

  // ── 5. Reverse direction: the original price behind a stacked discount.
  await choose('Original price');
  shown = await stats(page);
  t.assert(shown['Original price'] === money(12_900), `recovered original price: ${shown['Original price']}`);

  // ── 6. Impossible and malformed input is explained.
  await choose('Discount rate');
  await field('Final price paid').fill('20,000');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((text) => /cannot be higher/.test(text)),
    'a final price above the original is not explained',
  );
  await field('Final price paid').fill('abc');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((text) => /valid non-negative prices/.test(text)),
    'a non-numeric price is not explained',
  );
  await choose('Final price');
  await field('First discount (%)').fill('150');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((text) => /0% and 100%/.test(text)),
    'a 150% discount is not explained',
  );
  await field('First discount (%)').fill('30');
  await field('Original price').fill('0');
  await page.waitForTimeout(300);
  shown = await stats(page);
  t.assert(
    shown['Final price'] === money(0) && shown['Effective discount'] === '0%',
    'a free original price is not handled',
  );

  // ── 7. The copied summary carries the numbers on screen.
  await choose('Final price');
  await field('Original price').fill('12,900');
  await page.waitForTimeout(350);
  t.assert((await stats(page))['Final price'] === money(p3), 'the coupons did not come back in final-price mode');
  await page.getByRole('button', { name: 'Copy summary' }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(
    copied.includes(`Original price: ${money(12_900)}`) && copied.includes(`Final price: ${money(p3)}`),
    `the copied summary is wrong: ${JSON.stringify(copied)}`,
  );

  // ── 8. Inputs survive a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(
    () => [...document.querySelectorAll('main input')].some((input) => input.value === '12,900'),
    null,
    { timeout: 15_000 },
  );
  shown = await stats(page);
  t.assert(shown['Final price'] === money(p3), `the reload lost the coupons: ${shown['Final price']}`);

  // ── 9. The Korean page labels the same modes, and 375 px holds its layout.
  await t.open('/ko/discount-calculator');
  await page.waitForTimeout(500);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('할인가') && korean.includes('정가 역산'), 'the Korean page is missing its modes');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

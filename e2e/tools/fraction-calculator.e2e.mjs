/**
 * Fraction calculator: everyday fraction arithmetic typed the way people write it — a recipe's
 * 3/4, a mixed "1 3/4", a pasted decimal, a negative mixed number — with every answer, the mixed
 * form, the decimal and the working steps checked against values this spec computes exactly.
 *
 * The audit's regression cases:
 *  - 0.1 + 0.2 must be exactly 3/10, not the 0.30000000000000004 a floating-point tool returns;
 *  - division by zero must be explained, never shown as Infinity;
 *  - a value too large to be a real answer (1,001 digits) must be refused with an explanation;
 *  - a saved answer must come back after a reload.
 */

const stats = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main div[class*="bg-surface-2"]')]
        .filter((element) => element.children.length === 2 && element.children[0].className.includes('tabular'))
        .map((element) => [element.children[1].textContent.trim(), element.children[0].textContent.trim()]),
    ),
  );
const messages = (page) => page.locator('main [role=alert], main [role=status]').allInnerTexts();
const working = (page) => page.locator('main ol.mt-3').innerText();

export default async function (t) {
  const page = t.page;
  await t.open('/fraction-calculator');
  await page.waitForTimeout(400);

  const fields = page.locator('main input[type=text]');
  t.assert((await fields.count()) === 2, `the page shows ${await fields.count()} fraction fields instead of 2`);
  const type = async (index, value) => {
    await fields.nth(index).click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(value, { delay: 30 });
    await page.waitForTimeout(200);
  };
  const pick = async (name) => {
    await page.getByRole('radio', { name }).click();
    await page.waitForTimeout(200);
  };

  // ── 1. The page opens on 1/2 + 1/3 with the answer and the working already shown.
  let shown = await stats(page);
  t.assert(shown['Simplified fraction'] === '5/6', `default answer: ${shown['Simplified fraction']}`);
  t.assert(shown['Mixed number'] === '5/6', `default mixed form: ${shown['Mixed number']}`);
  t.assert(shown['Decimal'] === '0.833333333333…', `default decimal: ${shown['Decimal']}`);
  const steps = await working(page);
  t.assert(steps.includes('3/6 + 2/6 = 5/6'), `default working steps are wrong: ${steps}`);

  // ── 2. 3 + 1 3/4, typed as a mixed number.
  await type(0, '3');
  await type(1, '1 3/4');
  shown = await stats(page);
  t.assert(shown['Simplified fraction'] === '19/4', `3 + 1 3/4: ${shown['Simplified fraction']}`);
  t.assert(shown['Mixed number'] === '4 3/4', `3 + 1 3/4 mixed: ${shown['Mixed number']}`);
  t.assert(shown['Decimal'] === '4.75', `3 + 1 3/4 decimal: ${shown['Decimal']}`);

  // ── 3. Decimals must stay exact: 0.1 + 0.2 = 3/10, not 0.30000000000000004.
  await type(0, '0.1');
  await type(1, '0.2');
  shown = await stats(page);
  t.assert(shown['Simplified fraction'] === '3/10', `0.1 + 0.2: ${shown['Simplified fraction']}`);
  t.assert(shown['Decimal'] === '0.3', `0.1 + 0.2 decimal: ${shown['Decimal']}`);

  // ── 4. A pasted value in full-width digits and an ideographic slash is read as a fraction.
  await type(0, '１／２');
  await type(1, '０．５');
  shown = await stats(page);
  t.assert(shown['Simplified fraction'] === '1', `１／２ + ０．５: ${shown['Simplified fraction']}`);

  // ── 5. Subtract and multiply, including a negative mixed number.
  await type(0, '1/2');
  await type(1, '3/4');
  await pick(/− Subtract/);
  shown = await stats(page);
  t.assert(shown['Simplified fraction'] === '-1/4', `1/2 − 3/4: ${shown['Simplified fraction']}`);
  t.assert(shown['Decimal'] === '-0.25', `1/2 − 3/4 decimal: ${shown['Decimal']}`);

  await pick(/× Multiply/);
  await type(0, '-2 1/3');
  await type(1, '5/6');
  shown = await stats(page);
  t.assert(shown['Simplified fraction'] === '-35/18', `-2 1/3 × 5/6: ${shown['Simplified fraction']}`);
  t.assert(shown['Mixed number'] === '-1 17/18', `-2 1/3 × 5/6 mixed: ${shown['Mixed number']}`);

  // ── 6. Divide, and the zero divisor that has no answer.
  await pick(/÷ Divide/);
  await type(0, '1/2');
  await type(1, '3');
  shown = await stats(page);
  t.assert(shown['Simplified fraction'] === '1/6', `1/2 ÷ 3: ${shown['Simplified fraction']}`);
  const divideSteps = await working(page);
  t.assert(divideSteps.includes('1/2 × 1/3'), `the division working does not flip the divisor: ${divideSteps}`);

  await type(1, '0');
  t.assert(
    (await messages(page)).some((message) => /Division by zero/.test(message)),
    'dividing by zero is not explained',
  );
  t.assert(Object.keys(await stats(page)).length === 0, 'a result is still shown for division by zero');
  await type(1, '0.25');
  t.assert((await stats(page))['Simplified fraction'] === '2', 'a decimal divisor is not accepted');

  // ── 7. Inputs that are not a number are explained, and no answer is invented.
  for (const bad of ['1 2', '1/2/3', 'abc', '']) {
    await type(0, bad);
    const shownMessages = await messages(page);
    t.assert(
      shownMessages.some((message) => /Use an integer|Enter both numbers/.test(message)),
      `"${bad}" shows no explanation: ${shownMessages.join(' | ')}`,
    );
    t.assert(Object.keys(await stats(page)).length === 0, `"${bad}" still shows an answer`);
  }

  // ── 8. A value too big to be a fraction is refused instead of frozen on.
  await fields.nth(0).fill('9'.repeat(1001));
  await page.waitForTimeout(300);
  const tooLarge = await messages(page);
  t.assert(
    tooLarge.some((message) => /no more than 1,000 digits|too (large|long|many)/i.test(message)),
    `a 1,001-digit number shows no explanation: ${tooLarge.join(' | ')}`,
  );

  // ── 9. Copy the answer, and get the same calculation back after a reload.
  await type(0, '7/8');
  await type(1, '1/8');
  await pick(/\+ Add/);
  shown = await stats(page);
  t.assert(shown['Simplified fraction'] === '1', `7/8 + 1/8: ${shown['Simplified fraction']}`);
  await page.getByRole('button', { name: 'Copy answer' }).first().click();
  await page.waitForTimeout(300);
  t.assert(
    (await page.evaluate(() => navigator.clipboard.readText())) === '1',
    'the copied answer is not what the page shows',
  );

  await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(700);
  t.assert(
    (await fields.nth(0).inputValue()) === '7/8',
    `the reload lost the first value: ${await fields.nth(0).inputValue()}`,
  );
  t.assert((await stats(page))['Simplified fraction'] === '1', 'the reload changed the answer');

  // ── 10. The Korean page runs the same arithmetic in its own words.
  await t.open('/ko/fraction-calculator');
  await page.waitForTimeout(500);
  await page.locator('main input[type=text]').nth(0).fill('3/4');
  await page.locator('main input[type=text]').nth(1).fill('1/4');
  await page.waitForTimeout(300);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('약분'), 'the Korean page has no simplified-answer label');
  t.assert(korean.includes('1'), 'the Korean page shows no answer for 3/4 + 1/4');

  // ── 11. 375 px, dark: the fields and answer stack without sideways scrolling.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

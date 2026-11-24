/**
 * Percentage calculator: four calculations a searcher actually runs — 15% off 240, what percent 10
 * is of 50, the whole behind a part, and a price change — typed the way people type them.
 *
 * Covers the defects this audit fixed:
 *  - a decimal point did not survive typing: in a number input "7.5" left "57" and "1234.5" left
 *    "51234", because the controlled field re-rendered the partial value and moved the caret;
 *  - "1,250" pasted from a spreadsheet or typed in Korea was rejected, and the field it emptied was
 *    silently calculated as 0;
 *  - text that is not a number had no explanation beyond a generic message.
 */

/** The value of the Stat labelled `label` inside the calculation card at `card`. */
async function stat(page, label, card) {
  return page.evaluate(
    ({ wanted, cardIndex }) => {
      const scope =
        cardIndex === undefined
          ? document
          : document.querySelectorAll('main div[class*="rounded-lg"][class*="bg-surface-2"]')[cardIndex];
      if (!scope) return null;
      for (const element of scope.querySelectorAll('div[class*="bg-surface-2"]')) {
        if (element.children.length !== 2) continue;
        const [value, name] = [element.children[0], element.children[1]];
        if (!value.className.includes('tabular')) continue;
        if (name.textContent?.trim() !== wanted) continue;
        return value.textContent?.trim() ?? null;
      }
      return null;
    },
    { wanted: label, cardIndex: card },
  );
}

async function alerts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert], main [role=status]')].map(
      (element) => element.textContent?.trim() ?? '',
    ),
  );
}

/** The alert or status message inside the card at `card`. */
async function cardMessage(page, card) {
  return page.evaluate((cardIndex) => {
    const scope = document.querySelectorAll('main div[class*="rounded-lg"][class*="bg-surface-2"]')[cardIndex];
    return scope?.querySelector('[role=alert], [role=status]')?.textContent?.trim() ?? '';
  }, card);
}

const grouped = (value, locale = 'en-US', digits = 4) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);

export default async function (t) {
  const page = t.page;
  await t.open('/percentage-calculator');
  await page.waitForTimeout(500);

  const fields = page.locator('main input');
  t.assert((await fields.count()) === 8, `the page shows ${await fields.count()} inputs instead of 8`);
  const field = (index) => fields.nth(index);

  /** Types into a field the way a person does: focus, select what is there, then type. */
  const type = async (index, text) => {
    await field(index).click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(text, { delay: 70 });
    await page.waitForTimeout(200);
  };

  // ── 1. The page opens with a worked example for each of the four calculations.
  t.assert((await stat(page, 'Result', 0)) === '10', `20% of 50: ${await stat(page, 'Result', 0)}`);
  t.assert((await stat(page, 'Percent', 1)) === '20%', `10 of 50: ${await stat(page, 'Percent', 1)}`);
  t.assert((await stat(page, 'Change', 3)) === '+50%', `50 → 75 change: ${await stat(page, 'Change', 3)}`);
  t.assert((await stat(page, 'Difference', 3)) === '+25', `50 → 75 difference: ${await stat(page, 'Difference', 3)}`);
  const first = await page.locator('main').innerText();
  t.assert(first.includes('(20 ÷ 100) × 50 = 10'), 'the formula behind the first result is missing');

  // ── 2. 15% of 240, the everyday case.
  await type(0, '15');
  await type(1, '240');
  t.assert((await stat(page, 'Result', 0)) === '36', `15% of 240: ${await stat(page, 'Result', 0)}`);
  t.assert((await page.locator('main').innerText()).includes('(15 ÷ 100) × 240 = 36'), 'the formula did not follow');

  // ── 3. A decimal percentage survives being typed, and the result uses it.
  await type(0, '7.5');
  t.assert((await field(0).inputValue()) === '7.5', `typing 7.5 left "${await field(0).inputValue()}" in the field`);
  t.assert((await stat(page, 'Result', 0)) === '18', `7.5% of 240: ${await stat(page, 'Result', 0)}`);

  // ── 4. A grouped number from a spreadsheet is read, not rejected.
  await type(1, '1,250');
  t.assert(
    (await field(1).inputValue()) === '1,250',
    `the grouped value was rewritten to "${await field(1).inputValue()}"`,
  );
  t.assert((await stat(page, 'Result', 0)) === '93.75', `7.5% of 1,250: ${await stat(page, 'Result', 0)}`);
  await type(0, '12,5');
  t.assert((await stat(page, 'Result', 0)) === '156.25', `12,5% of 1,250: ${await stat(page, 'Result', 0)}`);

  // A decimal point typed at the end of an integer is incomplete, not wrong: the result holds.
  await type(3, '50.');
  t.assert((await cardMessage(page, 1)) === '', `"50." raised "${await cardMessage(page, 1)}"`);
  t.assert(
    (await field(3).inputValue()) === '50.',
    `the field lost the trailing point: "${await field(3).inputValue()}"`,
  );

  // ── 5. What percent 10 is of 50, and the two cases that have no answer.
  await type(2, '10');
  await type(3, '50');
  t.assert((await stat(page, 'Percent', 1)) === '20%', `10 of 50: ${await stat(page, 'Percent', 1)}`);
  await type(3, '0');
  t.assert(
    (await alerts(page)).some((text) => /other than 0/.test(text)),
    `dividing by a whole of 0 shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  await type(3, '50');

  // ── 6. The whole behind a part, and the percent that has no whole.
  await type(4, '10');
  await type(5, '25');
  t.assert((await stat(page, 'Result', 2)) === '40', `10 is 25% of: ${await stat(page, 'Result', 2)}`);
  await type(5, '0');
  t.assert(
    (await alerts(page)).some((text) => /percent other than 0/.test(text)),
    `a 0% percent shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  await type(5, '25');

  // ── 7. A price change, in both directions, and the change from zero.
  await type(6, '80');
  await type(7, '100');
  t.assert((await stat(page, 'Change', 3)) === '+25%', `80 → 100 change: ${await stat(page, 'Change', 3)}`);
  t.assert((await stat(page, 'Difference', 3)) === '+20', `80 → 100 difference: ${await stat(page, 'Difference', 3)}`);
  await type(7, '60');
  t.assert((await stat(page, 'Change', 3)) === '-25%', `80 → 60 change: ${await stat(page, 'Change', 3)}`);
  t.assert((await stat(page, 'Difference', 3)) === '-20', `80 → 60 difference: ${await stat(page, 'Difference', 3)}`);
  await type(6, '0');
  t.assert(
    (await alerts(page)).some((text) => /starting value other than 0/.test(text)),
    `a change from 0 shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  await type(6, '80');

  // ── 8. Text that is not a number is reported, and nothing is calculated with it.
  await type(1, 'abc');
  t.assert(
    (await alerts(page)).some((text) => /Use numbers only/.test(text)),
    `"abc" shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  t.assert((await stat(page, 'Result', 0)) === null, 'a result was shown for a field that holds text');
  await type(1, '');

  // ── 9. A result too large to display is named instead of shown as Infinity.
  await type(0, '1e200');
  await type(1, '1e200');
  t.assert(
    (await alerts(page)).some((text) => /too large/.test(text)),
    `an overflowing result shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );

  // ── 10. Saved numbers come back after a reload, exactly as typed.
  await type(0, '15');
  await type(1, '1,250');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(500);
  t.assert((await field(0).inputValue()) === '15', `the reload lost the percent: "${await field(0).inputValue()}"`);
  t.assert(
    (await field(1).inputValue()) === '1,250',
    `the reload lost the grouped number: "${await field(1).inputValue()}"`,
  );
  t.assert(
    (await stat(page, 'Result', 0)) === grouped(187.5),
    `after reload 15% of 1250: ${await stat(page, 'Result', 0)}`,
  );

  // ── 11. The Korean page calculates and groups the same way.
  await t.open('/ko/percentage-calculator');
  await page.waitForTimeout(600);
  t.assert(
    (await page.locator('main').innerText()).includes('숫자의 퍼센트'),
    'the Korean page has no section heading',
  );
  await type(0, '15');
  await type(1, '240');
  t.assert((await stat(page, '결과', 0)) === '36', `Korean page 15% of 240: ${await stat(page, '결과', 0)}`);
  await type(1, '1250');
  t.assert(
    (await stat(page, '결과', 0)) === grouped(187.5, 'ko-KR'),
    `Korean page 15% of 1250: ${await stat(page, '결과', 0)}`,
  );

  // ── 12. 375 px, dark: four cards stack and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
}

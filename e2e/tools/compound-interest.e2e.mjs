/**
 * Compound interest: a starting amount plus a monthly contribution, projected for a chosen number
 * of years at a nominal annual rate and compounding frequency.
 *
 * Covers the defects this audit fixed:
 *  - a decimal rate never survived typing: the shared number input re-rendered the partial value,
 *    so typing 5.5 into the rate field left 55 and projected a 55% return. The fields now keep the
 *    text that was typed and read it only when it is a number.
 *  - every rejected input got the same sentence listing every limit; the page now names the field
 *    that needs attention (>100 years, a 150% rate, an amount out of range, or a blank).
 */

/** The projection, computed here from the definition rather than with the tool's code. */
function project({ principal, monthly, rate, years, compounding, timing = 'end' }) {
  const periodic = 1 + rate / 100 / compounding;
  const step = periodic ** (compounding / 12);
  let balance = principal;
  let contributed = principal;
  const rows = [];
  for (let month = 1; month <= years * 12; month++) {
    if (timing === 'beginning') {
      balance += monthly;
      contributed += monthly;
      balance *= step;
    } else {
      balance *= step;
      balance += monthly;
      contributed += monthly;
    }
    if (month % 12 === 0) rows.push({ year: month / 12, balance, contributed, interest: balance - contributed });
  }
  return {
    balance,
    contributed,
    interest: balance - contributed,
    effective: periodic ** compounding - 1,
    rows,
  };
}

const money = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

export default async function (t) {
  const page = t.page;
  await t.open('/compound-interest');
  await page.waitForTimeout(400);

  const fields = page.locator('main input');
  const [principalField, monthlyField, rateField, yearsField] = [
    fields.nth(0),
    fields.nth(1),
    fields.nth(2),
    fields.nth(3),
  ];
  const stat = (label) =>
    page.evaluate((wanted) => {
      for (const box of document.querySelectorAll('main div.rounded-md.bg-surface-2')) {
        if (box.children[1]?.textContent.trim() === wanted) return box.children[0].textContent.trim();
      }
      return null;
    }, label);
  const notice = () =>
    page.evaluate(() => document.querySelector('main [role=alert], main [role=status]')?.textContent?.trim() ?? '');
  const type = async (field, text) => {
    await field.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(text, { delay: 60 });
    await page.waitForTimeout(200);
  };

  // ── 1. The page opens on the English example: 10,000 plus 500 a month at 7% for 20 years.
  t.assert((await principalField.inputValue()) === '10000', 'the example does not start from 10,000');
  t.assert((await rateField.inputValue()) === '7', `the example rate is "${await rateField.inputValue()}"`);
  const base = project({ principal: 10_000, monthly: 500, rate: 7, years: 20, compounding: 12 });
  t.assert((await stat('Final balance')) === money(base.balance), `final balance: ${await stat('Final balance')}`);
  t.assert((await stat('Interest earned')) === money(base.interest), `interest: ${await stat('Interest earned')}`);
  t.assert(
    (await stat('Total contributed')) === money(base.contributed),
    `contributed: ${await stat('Total contributed')}`,
  );
  t.assert((await stat('Effective annual rate')) === '7.23%', `effective rate: ${await stat('Effective annual rate')}`);

  // ── 2. A decimal rate is a rate a person uses, and it must survive being typed.
  await type(rateField, '5.5');
  t.assert(
    (await rateField.inputValue()) === '5.5',
    `typing 5.5 left "${await rateField.inputValue()}" in the rate field`,
  );
  const five = project({ principal: 10_000, monthly: 500, rate: 5.5, years: 20, compounding: 12 });
  t.assert((await stat('Final balance')) === money(five.balance), `5.5% final balance: ${await stat('Final balance')}`);
  t.assert(
    (await stat('Effective annual rate')) === '5.64%',
    `5.5% effective rate: ${await stat('Effective annual rate')}`,
  );

  // A trailing decimal point is an unfinished number, not a reason to drop the field.
  await type(rateField, '5.');
  t.assert((await rateField.inputValue()) === '5.', `"5." became "${await rateField.inputValue()}"`);
  t.assert((await stat('Final balance')) !== null, '"5." stopped the projection');
  await type(rateField, '4.25');
  t.assert((await rateField.inputValue()) === '4.25', `typing 4.25 left "${await rateField.inputValue()}"`);

  // ── 3. Grouped amounts pasted from a spreadsheet are read.
  await type(principalField, '1,000,000');
  t.assert(
    (await principalField.inputValue()) === '1,000,000',
    `the grouped amount became "${await principalField.inputValue()}"`,
  );
  const grouped = project({ principal: 1_000_000, monthly: 500, rate: 4.25, years: 20, compounding: 12 });
  t.assert(
    (await stat('Total contributed')) === money(grouped.contributed),
    `grouped contributed: ${await stat('Total contributed')}`,
  );

  // ── 4. The compounding frequency really changes the projection, and matches the definition.
  await page.getByLabel('Compounding frequency').selectOption('annual');
  await page.waitForTimeout(250);
  const annual = project({ principal: 1_000_000, monthly: 500, rate: 4.25, years: 20, compounding: 1 });
  t.assert(
    (await stat('Final balance')) === money(annual.balance),
    `annual compounding: ${await stat('Final balance')}`,
  );
  t.assert(
    (await stat('Effective annual rate')) === '4.25%',
    `annual effective rate: ${await stat('Effective annual rate')}`,
  );
  await page.getByLabel('Compounding frequency').selectOption('daily');
  await page.waitForTimeout(250);
  const daily = project({ principal: 1_000_000, monthly: 500, rate: 4.25, years: 20, compounding: 365 });
  t.assert((await stat('Final balance')) === money(daily.balance), `daily compounding: ${await stat('Final balance')}`);
  await page.getByLabel('Compounding frequency').selectOption('monthly');
  await page.waitForTimeout(250);

  // ── 5. Contributing at the beginning of the month is worth more than at the end.
  const endOfMonth = Number((await stat('Final balance')).replaceAll(',', ''));
  await page
    .locator('[role=radio]')
    .filter({ hasText: /^Beginning$/ })
    .click();
  await page.waitForTimeout(250);
  const beginning = project({
    principal: 1_000_000,
    monthly: 500,
    rate: 4.25,
    years: 20,
    compounding: 12,
    timing: 'beginning',
  });
  t.assert(
    (await stat('Final balance')) === money(beginning.balance),
    `beginning of month: ${await stat('Final balance')}`,
  );
  t.assert(
    Number((await stat('Final balance')).replaceAll(',', '')) > endOfMonth,
    'the beginning of month is not worth more',
  );
  await page.locator('[role=radio]').filter({ hasText: /^End$/ }).click();
  await page.waitForTimeout(200);

  // ── 6. The yearly projection table matches the totals and has one row per year.
  await type(yearsField, '3');
  await page.waitForTimeout(250);
  const short = project({ principal: 1_000_000, monthly: 500, rate: 4.25, years: 3, compounding: 12 });
  await page.getByRole('button', { name: 'Show all 3 years' }).click();
  await page.waitForTimeout(250);
  const rows = await page.evaluate(() =>
    [...document.querySelectorAll('main tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim())),
  );
  t.assert(rows.length === 3, `the projection shows ${rows.length} years`);
  t.assert(rows[2][0] === '3', `the last row is year ${rows[2][0]}`);
  t.assert(rows[2][1] === money(short.balance), `the last row balance is ${rows[2][1]}`);
  t.assert(rows[2][3] === money(short.interest), `the last row interest is ${rows[2][3]}`);

  // ── 7. A 0% rate earns nothing and returns exactly what was paid in.
  await type(rateField, '0');
  await page.waitForTimeout(200);
  const zero = project({ principal: 1_000_000, monthly: 500, rate: 0, years: 3, compounding: 12 });
  t.assert((await stat('Interest earned')) === '0', `a 0% rate earns ${await stat('Interest earned')}`);
  t.assert((await stat('Final balance')) === money(zero.balance), `a 0% rate ends at ${await stat('Final balance')}`);

  // ── 8. Each limit is reported as the field it belongs to.
  await type(yearsField, '101');
  t.assert(/years from 1 to 100/.test(await notice()), `101 years says: ${await notice()}`);
  await type(yearsField, '2.5');
  t.assert(/whole number of years/.test(await notice()), `2.5 years says: ${await notice()}`);
  await type(yearsField, '10');
  await type(rateField, '150');
  t.assert(/rate from 0% to 100%/.test(await notice()), `a 150% rate says: ${await notice()}`);
  await type(rateField, '5');
  await type(principalField, '2000000000000');
  t.assert(/Amounts can be from 0/.test(await notice()), `2 trillion says: ${await notice()}`);
  await principalField.fill('');
  await page.waitForTimeout(250);
  t.assert(/Fill in every field/.test(await notice()), `an empty amount says: ${await notice()}`);
  t.assert((await stat('Final balance')) === null, 'an empty field still shows a projection');

  // ── 9. The numbers and settings come back after a reload.
  await type(principalField, '5,000,000');
  await type(monthlyField, '300');
  await type(rateField, '3.75');
  await type(yearsField, '15');
  await page.getByLabel('Compounding frequency').selectOption('quarterly');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(400);
  t.assert(
    Number((await principalField.inputValue()).replaceAll(',', '')) === 5_000_000,
    `the reload lost the amount: "${await principalField.inputValue()}"`,
  );
  t.assert((await rateField.inputValue()) === '3.75', `the reload lost the rate: "${await rateField.inputValue()}"`);
  t.assert(
    (await page.getByLabel('Compounding frequency').inputValue()) === 'quarterly',
    'the reload lost the frequency',
  );
  const restored = project({ principal: 5_000_000, monthly: 300, rate: 3.75, years: 15, compounding: 4 });
  t.assert((await stat('Final balance')) === money(restored.balance), `after reload: ${await stat('Final balance')}`);

  // ── 10. Reset returns the example in one press.
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert((await principalField.inputValue()) === '10000', `reset left "${await principalField.inputValue()}"`);

  // ── 11. 375 px, dark: the columns stack and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);

  // ── 12. The Korean page starts from won amounts and explains a limit in Korean.
  await page.setViewportSize({ width: 1280, height: 900 });
  await t.open('/ko/compound-interest');
  await page.waitForTimeout(400);
  // Both languages share the saved session, so start from the Korean example explicitly.
  await page.getByRole('button', { name: '기본값으로 재설정' }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await principalField.inputValue()) === '10000000',
    `the Korean example starts from "${await principalField.inputValue()}"`,
  );
  t.assert((await page.locator('main').innerText()).includes('최종 금액'), 'the Korean page has no result labels');
  const korean = project({ principal: 10_000_000, monthly: 500_000, rate: 5, years: 10, compounding: 12 });
  const koreanMoney = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(korean.balance);
  const koreanFinal = await page.evaluate(() => {
    for (const box of document.querySelectorAll('main div.rounded-md.bg-surface-2')) {
      if (box.children[1]?.textContent.trim() === '최종 금액') return box.children[0].textContent.trim();
    }
    return null;
  });
  t.assert(koreanFinal === koreanMoney, `the Korean projection reads ${koreanFinal} instead of ${koreanMoney}`);
}

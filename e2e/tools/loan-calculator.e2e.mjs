/** The calculator accepts real loan figures and every control produces an independently verified schedule. */

function calculateExpected(principal, annualRate, months, method) {
  const monthlyRate = annualRate / 100 / 12;
  const schedule = [];
  let balance = principal;
  const equalPayment =
    monthlyRate === 0 ? principal / months : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    let principalPaid;
    if (method === 'amortized') principalPaid = month === months ? balance : equalPayment - interest;
    else if (method === 'equalPrincipal') principalPaid = month === months ? balance : principal / months;
    else principalPaid = month === months ? principal : 0;
    const payment = principalPaid + interest;
    balance = Math.abs(balance - principalPaid) < 1e-7 ? 0 : balance - principalPaid;
    schedule.push({ month, payment, principal: principalPaid, interest, balance });
  }

  return {
    schedule,
    firstPayment: schedule[0].payment,
    lastPayment: schedule.at(-1).payment,
    totalInterest: schedule.reduce((sum, row) => sum + row.interest, 0),
    totalPayment: schedule.reduce((sum, row) => sum + row.payment, 0),
  };
}

const parseMoney = (text) => Number(text.replaceAll(',', '').replace(/\s/g, ''));

async function displayedStat(page, label) {
  const card = page.getByText(label, { exact: true }).locator('..');
  return parseMoney(await card.locator('div').first().innerText());
}

function assertRounded(t, actual, expected, decimals, message) {
  const tolerance = 0.5 * 10 ** -decimals + 1e-9;
  t.assert(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, displayed ${actual}`);
}

async function assertSummary(t, expected, labels, decimals) {
  assertRounded(
    t,
    await displayedStat(t.page, labels.firstPayment),
    expected.firstPayment,
    decimals,
    labels.firstPayment,
  );
  assertRounded(t, await displayedStat(t.page, labels.lastPayment), expected.lastPayment, decimals, labels.lastPayment);
  assertRounded(
    t,
    await displayedStat(t.page, labels.totalInterest),
    expected.totalInterest,
    decimals,
    labels.totalInterest,
  );
  assertRounded(
    t,
    await displayedStat(t.page, labels.totalPayment),
    expected.totalPayment,
    decimals,
    labels.totalPayment,
  );
}

const enLabels = {
  firstPayment: 'First monthly payment',
  lastPayment: 'Final monthly payment',
  totalInterest: 'Total interest',
  totalPayment: 'Total repayment',
};

export default async function (t) {
  await t.open('/loan-calculator');
  await t.page.evaluate(() => localStorage.removeItem('tools:loan-calculator:state'));
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });

  const amount = t.page.getByLabel(/^Loan amount/);
  const rate = t.page.getByLabel(/^Annual interest rate/);
  const term = t.page.getByLabel(/^Repayment term/);

  // A realistic 30-year home loan updates live, with no submit action.
  await amount.fill('250000');
  await rate.fill('5.25');
  await term.fill('360');
  const mortgage = calculateExpected(250_000, 5.25, 360, 'amortized');
  await assertSummary(t, mortgage, enLabels, 2);

  // Each amount/rate/term control changes the result it claims to control.
  await amount.fill('275000');
  await assertSummary(t, calculateExpected(275_000, 5.25, 360, 'amortized'), enLabels, 2);
  await rate.fill('4.75');
  await assertSummary(t, calculateExpected(275_000, 4.75, 360, 'amortized'), enLabels, 2);
  await term.fill('240');
  await assertSummary(t, calculateExpected(275_000, 4.75, 240, 'amortized'), enLabels, 2);

  // Every repayment-method control changes both the summary and the schedule.
  for (const [label, method] of [
    ['Equal payment', 'amortized'],
    ['Equal principal', 'equalPrincipal'],
    ['Interest-only', 'bullet'],
  ]) {
    await t.page.getByRole('radio', { name: label, exact: true }).click();
    await assertSummary(t, calculateExpected(275_000, 4.75, 240, method), enLabels, 2);
  }

  // Zero-rate and one-month edge values remain valid; invalid ranges produce a visible alert.
  await rate.fill('0');
  await term.fill('1');
  await assertSummary(t, calculateExpected(275_000, 0, 1, 'bullet'), enLabels, 2);
  await term.fill('601');
  t.assert(await t.page.getByRole('alert').isVisible(), 'a term over 600 months failed without a visible alert');
  await term.fill('600');
  await rate.fill('100');
  await assertSummary(t, calculateExpected(275_000, 100, 600, 'bullet'), enLabels, 2);

  // The disclosure opens and closes the complete schedule, with independently checked first and final rows.
  await amount.fill('10000');
  await rate.fill('6');
  await term.fill('12');
  await t.page.getByRole('radio', { name: 'Equal payment', exact: true }).click();
  const expectedSchedule = calculateExpected(10_000, 6, 12, 'amortized');
  const scheduleButton = t.page.getByRole('button', { name: 'Show all 12 payments', exact: true });
  await scheduleButton.click();
  const hideScheduleButton = t.page.getByRole('button', { name: 'Hide schedule', exact: true });
  t.assert(
    (await hideScheduleButton.getAttribute('aria-expanded')) === 'true',
    'schedule did not report its open state',
  );
  const rows = t.page.locator('#loan-repayment-schedule tbody tr');
  t.assert((await rows.count()) === 12, 'schedule did not render all 12 payments');
  for (const [index, expected] of [
    [0, expectedSchedule.schedule[0]],
    [11, expectedSchedule.schedule[11]],
  ]) {
    const cells = rows.nth(index).locator('td');
    t.assert(Number(await cells.nth(0).innerText()) === expected.month, `wrong month in schedule row ${index + 1}`);
    for (const [cell, key] of [
      [1, 'payment'],
      [2, 'principal'],
      [3, 'interest'],
      [4, 'balance'],
    ]) {
      assertRounded(t, parseMoney(await cells.nth(cell).innerText()), expected[key], 2, `row ${index + 1} ${key}`);
    }
  }
  await hideScheduleButton.click();
  t.assert((await t.page.locator('#loan-repayment-schedule').count()) === 0, 'schedule did not close');

  // Inputs persist across reloads, while Reset restores the documented defaults and closes the schedule.
  await amount.fill('42000');
  await rate.fill('7.25');
  await term.fill('48');
  await t.page.getByRole('radio', { name: 'Equal principal', exact: true }).click();
  const savedState = await t.page.evaluate(() => JSON.parse(localStorage.getItem('tools:loan-calculator:state')));
  t.assert(
    savedState.principal === '42000' &&
      savedState.annualRate === 7.25 &&
      savedState.termMonths === 48 &&
      savedState.method === 'equalPrincipal',
    `latest state was not saved immediately: ${JSON.stringify(savedState)}`,
  );
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.waitForFunction(() => document.querySelector('input')?.value === '42000');
  t.assert((await t.page.getByLabel(/^Annual interest rate/).inputValue()) === '7.25', 'rate was not restored');
  t.assert((await t.page.getByLabel(/^Repayment term/).inputValue()) === '48', 'term was not restored');
  t.assert(
    await t.page.getByRole('radio', { name: 'Equal principal', exact: true }).isChecked(),
    'repayment method was not restored',
  );
  await t.click('Reset');
  t.assert((await t.page.getByLabel(/^Loan amount/).inputValue()) === '10000', 'Reset did not restore the amount');
  t.assert((await t.page.getByLabel(/^Annual interest rate/).inputValue()) === '6', 'Reset did not restore the rate');
  t.assert((await t.page.getByLabel(/^Repayment term/).inputValue()) === '12', 'Reset did not restore the term');

  // Korean users can paste grouped, full-width loan amounts; displayed won values match the independent calculation.
  await t.open('/ko/loan-calculator');
  await t.page.getByLabel(/^대출금액/).fill('３００,０００,０００');
  await t.page.getByLabel(/^연 이자율/).fill('4');
  await t.page.getByLabel(/^상환 기간/).fill('360');
  await t.page.getByRole('radio', { name: '원리금균등', exact: true }).click();
  await assertSummary(
    t,
    calculateExpected(300_000_000, 4, 360, 'amortized'),
    {
      firstPayment: '첫 달 납입액',
      lastPayment: '마지막 달 납입액',
      totalInterest: '총이자',
      totalPayment: '총상환액',
    },
    0,
  );

  // Keyboard operation, mobile layout, and dark rendering all remain usable.
  await t.page.getByLabel(/^대출금액/).focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    (
      await t.page.evaluate(
        () => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.labels?.[0]?.innerText,
      )
    )
      ?.trim()
      .startsWith('연 이자율'),
    'keyboard focus did not reach the interest-rate control',
  );
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal page overflow',
  );
  t.assert(
    (await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );
}

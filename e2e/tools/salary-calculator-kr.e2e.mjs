/**
 * Korea salary calculator: the same take-home a real searcher gets when they type their salary
 * the way Korean payslips and search results write it, and every control moves what it claims to.
 *
 * The income tax is the only table-driven figure, so it is read from the page and every other
 * deduction is recomputed here from the statutory 2026 rates. Covers the defect this audit fixed:
 * typing "5,000만" into the salary field used to leave "5000" behind and show a 5,000원 salary.
 */

const RATES = { pension: 0.0475, health: 0.03595, longTerm: 0.1314, employment: 0.009 };
const PENSION_MIN = 410_000;
const PENSION_MAX = 6_590_000;
const HEALTH_MIN = 10_080;

const amount = (text) => Number(String(text).replace(/[^\d]/g, ''));
const floorToTen = (value) => Math.floor((value + 1e-7) / 10) * 10;

/** Every deduction recomputed from the tax the page displays, at the given salary conditions. */
function deductions({ annualSalary, monthlyNonTaxable = 0, incomeTax }) {
  const monthlyGross = annualSalary / 12;
  const monthlyTaxable = monthlyGross - monthlyNonTaxable;
  const pensionBase = Math.max(PENSION_MIN, Math.min(monthlyTaxable, PENSION_MAX));
  const nationalPension = floorToTen(pensionBase * RATES.pension);
  const healthInsurance = Math.max(HEALTH_MIN, floorToTen(monthlyTaxable * RATES.health));
  const longTermCareInsurance = floorToTen(healthInsurance * RATES.longTerm);
  const employmentInsurance = floorToTen(monthlyTaxable * RATES.employment);
  const localIncomeTax = floorToTen(incomeTax * 0.1);
  const totalDeductions =
    nationalPension + healthInsurance + longTermCareInsurance + employmentInsurance + incomeTax + localIncomeTax;
  return {
    monthlyGross: Math.floor(monthlyGross),
    monthlyTakeHome: Math.max(0, Math.floor(monthlyGross - totalDeductions)),
    totalDeductions,
    nationalPension,
    healthInsurance,
    longTermCareInsurance,
    employmentInsurance,
    localIncomeTax,
  };
}

/** The value in the stat whose label is `label`. */
async function stat(page, label) {
  return page.evaluate((wanted) => {
    for (const element of document.querySelectorAll('main div')) {
      if (element.children.length !== 2) continue;
      const [value, name] = [element.children[0], element.children[1]];
      if (name.textContent?.trim() !== wanted || name.children.length !== 0) continue;
      if (value.children.length !== 0) continue;
      return value.textContent?.trim() ?? null;
    }
    return null;
  }, label);
}

/** The amount in the deduction table row whose item name is `label`. */
async function row(page, label) {
  return page.evaluate((wanted) => {
    for (const cell of document.querySelectorAll('main tbody td')) {
      if (cell.textContent?.trim() === wanted) return cell.nextElementSibling?.textContent?.trim() ?? null;
    }
    return null;
  }, label);
}

export default async function (t) {
  const page = t.page;
  await t.open('/ko/salary-calculator-kr');
  const salaryField = page.getByLabel(/세전 연봉/);
  const nonTaxableField = page.getByLabel(/월 비과세/);
  const dependentsField = page.getByLabel(/공제대상 부양가족 수/);
  const childrenField = page.getByLabel(/8세 이상 20세 이하 자녀 수/);

  // ── 1. A 50,000,000원 salary has to come out the same however it is typed.
  await salaryField.fill('50000000');
  await page.waitForTimeout(150);
  const perMonth = deductions({ annualSalary: 50_000_000, incomeTax: amount(await row(page, '소득세')) });
  t.assert(
    amount(await stat(page, '월 세전 급여')) === perMonth.monthlyGross,
    `monthly gross for 50,000,000: expected ${perMonth.monthlyGross}, got ${await stat(page, '월 세전 급여')}`,
  );
  t.assert(
    amount(await stat(page, '월 실수령액')) === perMonth.monthlyTakeHome,
    `take-home for 50,000,000: expected ${perMonth.monthlyTakeHome}, got ${await stat(page, '월 실수령액')}`,
  );

  // The 5,000만 a Korean searcher types must reach the same result, not "5000".
  t.assert(
    (await salaryField.inputValue()) === '50,000,000',
    `plain digits are not grouped in the field: ${await salaryField.inputValue()}`,
  );
  await salaryField.fill('5,000만');
  await page.waitForTimeout(150);
  t.assert(
    amount(await stat(page, '월 실수령액')) === perMonth.monthlyTakeHome,
    `5,000만 should equal 50,000,000: got ${await stat(page, '월 실수령액')}`,
  );
  const interpretation = await page.getByText('= 50,000,000원').count();
  t.assert(interpretation > 0, 'the amount read from "5,000만" is not shown under the field');
  t.assert(
    (await page.getByText(/연봉이 100만 원 미만입니다/).count()) === 0,
    'a correctly written 5,000만 salary raised the low-salary warning',
  );

  // 만/억 units beyond the plain 만 form.
  await salaryField.fill('1억 5천만');
  await page.waitForTimeout(150);
  t.assert(
    amount(await stat(page, '월 세전 급여')) === Math.floor(150_000_000 / 12),
    `1억 5천만 should be a 150,000,000원 salary: got ${await stat(page, '월 세전 급여')}`,
  );

  // ── 2. Every deduction follows its statutory rate, on 42,000,000원 with no non-taxable pay.
  await salaryField.fill('42000000');
  await nonTaxableField.fill('0');
  await dependentsField.fill('1');
  await childrenField.fill('0');
  await page.getByRole('radio', { name: '100%' }).click();
  await page.waitForTimeout(200);
  const tax100 = amount(await row(page, '소득세'));
  const expected = deductions({ annualSalary: 42_000_000, incomeTax: tax100 });
  t.assert(tax100 > 0, 'income tax is 0 for a 42,000,000원 salary');
  for (const [label, value] of [
    ['국민연금', expected.nationalPension],
    ['건강보험', expected.healthInsurance],
    ['장기요양보험', expected.longTermCareInsurance],
    ['고용보험', expected.employmentInsurance],
    ['지방소득세', expected.localIncomeTax],
    ['월 공제액 합계', expected.totalDeductions],
  ]) {
    const shown = amount(await row(page, label));
    t.assert(shown === value, `${label}: expected ${value}, got ${shown}`);
  }
  t.assert(
    amount(await stat(page, '월 실수령액')) === expected.monthlyTakeHome,
    `take-home for 42,000,000: expected ${expected.monthlyTakeHome}, got ${await stat(page, '월 실수령액')}`,
  );

  // ── 3. Dependents and children lower the income tax, and it comes back at 80% / 100% / 120%.
  await dependentsField.fill('4');
  await childrenField.fill('2');
  await page.waitForTimeout(200);
  const taxFamily = amount(await row(page, '소득세'));
  t.assert(taxFamily < tax100, `dependents and children did not lower income tax (${taxFamily} vs ${tax100})`);
  const dependentsOnly = await page.evaluate(async () => {
    const field = [...document.querySelectorAll('main input[type=number]')].find((input) =>
      input.closest('label')?.textContent?.includes('공제대상 부양가족 수'),
    );
    return field?.value;
  });
  t.assert(dependentsOnly === '4', `dependents field holds ${dependentsOnly}`);

  await childrenField.fill('0');
  await page.waitForTimeout(200);
  const taxFourDependents = amount(await row(page, '소득세'));
  t.assert(
    taxFourDependents > taxFamily,
    `removing the child reduction should raise income tax (${taxFourDependents} vs ${taxFamily})`,
  );

  await page.getByRole('radio', { name: '80%' }).click();
  await page.waitForTimeout(200);
  const tax80 = amount(await row(page, '소득세'));
  await page.getByRole('radio', { name: '120%' }).click();
  await page.waitForTimeout(200);
  const tax120 = amount(await row(page, '소득세'));
  t.assert(
    tax80 < taxFourDependents && tax120 > taxFourDependents,
    `80/100/120% did not scale income tax: ${tax80}/${taxFourDependents}/${tax120}`,
  );
  t.assert(
    Math.abs(tax120 / Math.max(1, taxFourDependents) - 1.2) < 0.02,
    `120% is not 1.2× the 100% tax: ${tax120} vs ${taxFourDependents}`,
  );
  await page.getByRole('radio', { name: '100%' }).click();
  await page.waitForTimeout(150);

  // ── 4. Non-taxable pay comes off the taxable month, so the insurance and tax all drop.
  await nonTaxableField.fill('20만');
  await page.waitForTimeout(200);
  const taxWithMeal = amount(await row(page, '소득세'));
  const withMeal = deductions({ annualSalary: 42_000_000, monthlyNonTaxable: 200_000, incomeTax: taxWithMeal });
  t.assert(taxWithMeal < taxFourDependents, `20만원 non-taxable did not lower income tax (${taxWithMeal})`);
  t.assert(
    amount(await row(page, '국민연금')) === withMeal.nationalPension,
    `pension on the taxable month after 20만원: expected ${withMeal.nationalPension}, got ${await row(page, '국민연금')}`,
  );
  t.assert(
    amount(await stat(page, '월 실수령액')) === withMeal.monthlyTakeHome,
    `take-home after 20만원 non-taxable: expected ${withMeal.monthlyTakeHome}, got ${await stat(page, '월 실수령액')}`,
  );

  // ── 5. Bad input says which field is wrong instead of showing a smaller salary.
  await nonTaxableField.fill('0');
  await salaryField.fill('5000');
  await page.waitForTimeout(200);
  t.assert(
    (await page.getByText(/연봉이 100만 원 미만입니다/).count()) === 1,
    'a 5,000원 salary is shown without the 만원-unit warning',
  );
  await salaryField.fill('오천만');
  await page.waitForTimeout(200);
  t.assert(
    (await page.getByText(/세전 연봉을 금액으로 입력하세요/).count()) === 1,
    'unreadable salary text did not name the salary field',
  );
  t.assert(
    (await page.getByText(/월 실수령액/).count()) >= 1 && (await page.locator('main tbody').count()) === 0,
    'the deduction table stayed on screen while the input could not be read',
  );

  await salaryField.fill('12000000');
  await childrenField.fill('0');
  await dependentsField.fill('1');
  await page.waitForTimeout(200);
  await childrenField.fill('3');
  await page.waitForTimeout(200);
  t.assert(
    (await page.getByText(/자녀 수는 공제대상 부양가족 수보다 클 수 없습니다/).count()) === 1,
    'children over dependents did not name the field',
  );
  await childrenField.fill('0');

  // ── 6. A reload keeps what was typed, and the landing page still opens on its own salary.
  await salaryField.fill('3,600만');
  await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(300);
  t.assert(
    amount(await stat(page, '월 세전 급여')) === 3_000_000,
    `reload lost the salary: monthly gross is ${await stat(page, '월 세전 급여')}`,
  );
  await t.open('/ko/salary-calculator-kr/3000-manwon');
  await t.waitForText('2,217,920');

  // ── 7. 375px: the deduction table scrolls inside its own box, the page does not.
  await page.setViewportSize({ width: 375, height: 812 });
  await t.open('/ko/salary-calculator-kr');
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    table: (() => {
      const box = document.querySelector('main table')?.parentElement;
      return box ? box.scrollWidth - box.clientWidth : -1;
    })(),
  }));
  t.assert(overflow.page <= 1, `the page scrolls sideways by ${overflow.page}px at 375px`);
  t.assert(overflow.table > 0, 'the deduction table was squeezed instead of scrolling inside its box');
  t.assert(
    (await page.getByRole('radio', { name: '100%' }).boundingBox()).width > 0,
    'the withholding radio group is not visible at 375px',
  );
}

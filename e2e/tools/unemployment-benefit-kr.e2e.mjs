/**
 * The 2026 Korean unemployment-benefit estimate for the inputs people actually bring:
 * a wage typed with thousands separators or in 만원, part-time hours, coverage, age band,
 * and the eligibility toggles. Every control must change the amount it claims to, and the
 * figure must match the statutory 60% / floor / cap arithmetic computed here independently.
 */

const HOURLY_MINIMUM = 10_320;
const BENEFIT_RATE = 0.6;
const FLOOR_RATE = 0.8;
const MAX_BASE = 113_500;
const MAX_BENEFIT = 68_100;

const prescribedDays = (months, over50) => {
  if (months < 12) return 120;
  if (months < 36) return over50 ? 180 : 150;
  if (months < 60) return over50 ? 210 : 180;
  if (months < 120) return over50 ? 240 : 210;
  return over50 ? 270 : 240;
};

const estimate = ({ wage, ordinary = 0, hours = 8, months = 48, over50 = false }) => {
  const base = Math.min(Math.max(wage, ordinary), MAX_BASE);
  const wageBenefit = Math.floor(base * BENEFIT_RATE);
  const floorBenefit = Math.floor(HOURLY_MINIMUM * FLOOR_RATE * hours);
  const daily = Math.min(Math.max(wageBenefit, floorBenefit), MAX_BENEFIT);
  const days = prescribedDays(months, over50);
  return { daily, days, total: daily * days };
};

const money = (text) => Number(String(text).replace(/[^\d-]/g, ''));

/** Click a control that may sit under the sticky header once scrolled into view. */
async function tap(locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await locator.click();
}

async function stat(page, label) {
  const labels = page.getByText(label, { exact: true });
  const count = await labels.count();
  for (let index = 0; index < count; index += 1) {
    const parent = labels.nth(index).locator('xpath=..');
    if ((await parent.locator(':scope > div').count()) > 1)
      return (await parent.locator(':scope > div').first().innerText()).trim();
  }
  throw new Error(`no stat labelled ${label}`);
}

export default async function (t) {
  const page = t.page;
  await t.open('/unemployment-benefit-kr');

  const wage = page.getByLabel(/^Average daily wage/);
  const ordinary = page.getByLabel(/^Daily ordinary wage/);
  const hours = page.getByLabel(/^Contracted hours/);
  const months = page.getByLabel(/^Qualifying coverage/);
  const insuredDays = page.getByLabel(/^Insured-unit days/);
  const total = async () => money(await stat(page, 'Estimated total if eligible'));

  // The opening state is the ordinary full-time case: 60% of 100,000 is below the 2026 floor.
  const base = estimate({ wage: 100_000 });
  t.assert((await total()) === base.total, `default total: expected ${base.total}, got ${await total()}`);
  t.assert(money(await stat(page, 'Daily benefit')) === base.daily, 'default daily benefit is wrong');
  t.assert(money(await stat(page, 'Prescribed benefit days')) === base.days, 'default benefit days are wrong');
  t.assert(money(await stat(page, '2026 daily floor')) === 66_048, 'the 8-hour floor is not 66,048');
  t.assert(money(await stat(page, '2026 daily cap')) === 68_100, 'the 2026 cap is not 68,100');

  // A wage pasted with thousands separators is read as one amount, not silently truncated.
  await wage.fill('120,000');
  const grouped = estimate({ wage: 120_000 });
  t.assert(
    (await total()) === grouped.total,
    `a comma-grouped wage was misread: expected ${grouped.total}, got ${await total()} (field holds ${await wage.inputValue()})`,
  );

  // A wage written in 만원 is the same amount.
  await wage.fill('10만원');
  t.assert(
    (await total()) === base.total,
    `a wage in 만원 was misread: expected ${base.total}, got ${await total()} (field holds ${await wage.inputValue()})`,
  );

  // A high wage is capped at 68,100 a day, and the page says so.
  await wage.fill('400000');
  const capped = estimate({ wage: 400_000 });
  t.assert((await total()) === capped.total, `capped total: expected ${capped.total}, got ${await total()}`);
  t.assert(money(await stat(page, 'Daily benefit')) === MAX_BENEFIT, 'the daily benefit was not capped at 68,100');
  await t.waitForText('The 2026 statutory daily cap is applied.');

  // Part-time hours scale the floor.
  await wage.fill('50000');
  await hours.fill('4');
  const partTime = estimate({ wage: 50_000, hours: 4 });
  t.assert(
    money(await stat(page, 'Daily benefit')) === 33_024,
    `the 4-hour floor is wrong: ${await stat(page, 'Daily benefit')}`,
  );
  t.assert((await total()) === partTime.total, `part-time total: expected ${partTime.total}, got ${await total()}`);
  await t.waitForText('The 2026 hourly minimum-wage floor is applied.');

  // Coverage bands and the age band change the prescribed days.
  await hours.fill('8');
  await wage.fill('120000');
  await page.getByRole('radio', { name: '50+ or disabled', exact: true }).click();
  const aged = estimate({ wage: 120_000, over50: true });
  t.assert(
    money(await stat(page, 'Prescribed benefit days')) === aged.days,
    `50+ days at 48 months: ${await stat(page, 'Prescribed benefit days')}`,
  );
  t.assert((await total()) === aged.total, `50+ total: expected ${aged.total}, got ${await total()}`);
  await months.fill('6');
  t.assert(
    money(await stat(page, 'Prescribed benefit days')) === 120,
    'under one year of coverage should give 120 days',
  );
  await months.fill('120');
  t.assert(
    money(await stat(page, 'Prescribed benefit days')) === 270,
    'ten years of coverage for 50+ should give 270 days',
  );
  await page.getByRole('radio', { name: 'Under 50', exact: true }).click();
  t.assert(
    money(await stat(page, 'Prescribed benefit days')) === 240,
    'ten years of coverage for under-50 should give 240 days',
  );
  await months.fill('48');

  // The three eligibility checks are reported individually and change the headline notice.
  await insuredDays.fill('179');
  await t.waitForText('Fewer than 180 insured-unit days entered');
  await t.waitForText('At least one high-level condition is not met');
  await insuredDays.fill('180');
  await t.waitForText('180 insured-unit days entered');
  const separation = page.getByRole('checkbox', { name: 'My separation reason is not disqualifying' });
  await tap(page.getByText('My separation reason is not disqualifying', { exact: true }));
  t.assert(!(await separation.isChecked()), 'the separation toggle did not turn off');
  await t.waitForText('At least one high-level condition is not met');
  await t.waitForText('Separation reason needs official review');
  await tap(page.getByText('My separation reason is not disqualifying', { exact: true }));
  t.assert(await separation.isChecked(), 'the separation toggle did not turn back on');
  await t.waitForText('The three high-level checks you entered are met');

  // An impossible input is explained instead of producing a figure.
  await hours.fill('0');
  await t.waitForText('Enter positive whole numbers');
  t.assert(
    (await page.getByText('Estimated total if eligible', { exact: true }).count()) === 0,
    'an invalid input still showed a total',
  );
  await hours.fill('8');

  // Reset returns to the opening case.
  await tap(page.getByRole('button', { name: 'Reset', exact: true }));
  await t.waitForText('11,888,640');
  await page.waitForFunction(
    () => document.querySelector('input[inputmode="numeric"]')?.value.replace(/[,\s]/g, '') === '100000',
    undefined,
    { timeout: 5_000 },
  );
  t.assert(
    (await wage.inputValue()).replace(/[,\s]/g, '') === '100000',
    `reset left the wage at ${await wage.inputValue()}`,
  );
  t.assert((await total()) === base.total, 'reset did not restore the opening total');

  // The estimate survives a reload.
  await wage.fill('200000');
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:unemployment-benefit-kr:state'))?.averageDailyWage === 200000,
    undefined,
    { timeout: 5_000 },
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForFunction(
    () =>
      document.querySelector('input[inputmode="decimal"], input[inputmode="numeric"]')?.value.replace(/[,\s]/g, '') ===
      '200000',
    undefined,
    { timeout: 10_000 },
  );

  // A preset page opens with its coverage and age band already applied.
  await t.open('/unemployment-benefit-kr/duration-50-or-disabled-1-year');
  t.assert(
    money(await stat(page, 'Prescribed benefit days')) === 180,
    'the 50+/1-year preset did not open on 180 days',
  );

  // Korean page: the same arithmetic under the translated labels.
  await t.open('/ko/unemployment-benefit-kr');
  await page.getByLabel(/^이직 전 1일 평균임금/).fill('100,000');
  await page.getByLabel(/^이직 당시 1일 소정근로시간/).fill('8');
  await page.getByLabel(/^합산 대상 가입기간/).fill('48');
  await tap(page.getByRole('radio', { name: '50세 미만', exact: true }));
  t.assert(
    money(await stat(page, '수급자격 인정 시 총 예상액')) === base.total,
    `한국어 총액: ${await stat(page, '수급자격 인정 시 총 예상액')}`,
  );
  await page.getByLabel(/^이직 전 1일 평균임금/).fill('12만원');
  t.assert(
    money(await stat(page, '수급자격 인정 시 총 예상액')) === grouped.total,
    `한국어 페이지에서 만원 단위 입력이 반영되지 않습니다: ${await stat(page, '수급자격 인정 시 총 예상액')}`,
  );

  // The panel fits a 375 px phone and renders in dark mode.
  await page.setViewportSize({ width: 375, height: 812 });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    '375 px 뷰포트에서 가로 스크롤이 생깁니다',
  );
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    '다크 모드에서 페이지 배경이 렌더링되지 않습니다',
  );
}

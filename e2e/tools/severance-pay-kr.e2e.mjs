/**
 * Korean severance pay: the statutory before-tax estimate from a real final-three-month
 * pay record. Every figure is recomputed here from the statutory formula (average wage of
 * the three calendar months before the retirement date × 30 × service days ÷ 365), and every
 * control must move the numbers it claims to. Covers the defect this audit fixed: clearing one
 * monthly wage total used to be read as 0원 and quietly shrank the estimate.
 */

const DAY_MS = 86_400_000;
const utc = (iso) => new Date(`${iso}T00:00:00Z`);
const iso = (date) => date.toISOString().slice(0, 10);
const daysBetween = (from, to) => Math.round((utc(to) - utc(from)) / DAY_MS);
const addDays = (from, count) => iso(new Date(utc(from).getTime() + count * DAY_MS));

/** Calendar months, keeping a month-end date at the end of the shorter month. */
function subtractMonths(from, months) {
  const [year, month, day] = from.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 - months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return iso(new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay))));
}

function estimate({ start, last, wages, bonus = 0, leave = 0, ordinary = 0, hours = 40 }) {
  const retirement = addDays(last, 1);
  const periodStart = subtractMonths(retirement, 3);
  const serviceDays = daysBetween(start, retirement);
  const wageDays = daysBetween(periodStart, retirement);
  const total = wages.reduce((sum, wage) => sum + wage, 0) + bonus * 0.25 + leave * 0.25;
  const averageDailyWage = total / wageDays;
  const applicableDailyWage = Math.max(averageDailyWage, ordinary);
  const eligible = serviceDays >= 365 && hours >= 15;
  return {
    retirement,
    periodStart,
    serviceDays,
    wageDays,
    total,
    averageDailyWage,
    applicableDailyWage,
    eligible,
    pay: eligible ? Math.round((applicableDailyWage * 30 * serviceDays) / 365) : 0,
  };
}

const money = (text) => Number(String(text).replace(/[^\d.]/g, ''));

async function stat(page, label) {
  const labels = page.getByText(label, { exact: true });
  const count = await labels.count();
  for (let index = 0; index < count; index += 1) {
    const parent = labels.nth(index).locator('xpath=..');
    if ((await parent.locator(':scope > div').count()) > 1) {
      return (await parent.locator(':scope > div').first().innerText()).trim();
    }
  }
  throw new Error(`no stat labelled ${label}`);
}

function assertEstimate(t, actual, expected, message) {
  t.assert(actual.pay === expected.pay, `${message}: expected ${expected.pay}원, displayed ${actual.pay}원`);
  t.assert(
    actual.serviceDays === expected.serviceDays,
    `${message}: service days expected ${expected.serviceDays}, displayed ${actual.serviceDays}`,
  );
  t.assert(
    actual.wageDays === expected.wageDays,
    `${message}: wage-period days expected ${expected.wageDays}, displayed ${actual.wageDays}`,
  );
}

async function checkVariant(t, slug, pay, years, amount, serviceDays) {
  await t.open(`/ko/severance-pay-kr/${slug}`);

  const description = await t.page.locator('meta[name="description"]').getAttribute('content');
  const intro = await t.page.locator('header p').innerText();
  t.assert(description.includes(`${amount}원`), '검색 설명에 계산된 퇴직금이 있어야 합니다');
  t.assert(intro.includes(`세전 예상 퇴직금은 ${amount}원`), '소개와 검색 설명의 퇴직금이 같아야 합니다');
  t.assert(intro.includes(`계속근로 ${serviceDays}일`), '소개에 실제 계속근로일수가 있어야 합니다');
  t.assert((await stat(t.page, '예상 퇴직금(세전)')).includes(`${amount}원`), '계산기 결과가 소개와 같아야 합니다');

  const wageInputs = t.page.getByLabel(/^임금 합계 /);
  t.assert((await wageInputs.first().inputValue()) === String(pay), '월급 preset이 저장된 임금보다 우선해야 합니다');
  t.assert((await wageInputs.nth(2).inputValue()) === String(pay), '세 번째 임금도 preset으로 열려야 합니다');
  t.assert(
    (await t.page.getByLabel('입사일').inputValue()) === `${2026 - years}-03-01`,
    '근속연수 preset이 입사일에 반영되어야 합니다',
  );
  t.assert(
    (await t.page.getByLabel('마지막 근무일').inputValue()) === '2026-02-28',
    '기준 마지막 근무일이 반영되어야 합니다',
  );
}

export default async function (t) {
  const page = t.page;

  // --- The opening state, computed from the statutory formula rather than read off the page.
  await t.open('/ko/severance-pay-kr');
  await page.evaluate(() => localStorage.removeItem('tools:severance-pay-kr:state'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });

  const read = async () => ({
    pay: money(await stat(page, '예상 퇴직금(세전)')),
    serviceDays: money(await stat(page, '계속근로일수')),
    wageDays: money(await stat(page, '평균임금 기간 일수')),
  });

  const defaults = estimate({ start: '2023-01-01', last: '2024-01-31', wages: [3_000_000, 3_000_000, 3_000_000] });
  assertEstimate(t, await read(), defaults, '기본값');
  t.assert(
    money(await stat(page, '1일 평균임금')) === Math.round(defaults.averageDailyWage * 100) / 100,
    '기본값 1일 평균임금',
  );
  t.assert(
    money(await stat(page, '적용 1일 임금')) === Math.round(defaults.applicableDailyWage * 100) / 100,
    '기본값 적용 일급',
  );
  await t.waitForText(`퇴직일: `);
  const summary = await page.locator('main').innerText();
  t.assert(
    summary.includes('2024. 2. 1.') || summary.includes('2024년 2월 1일'),
    '퇴직일이 마지막 근무일 다음 날이어야 합니다',
  );
  t.assert(summary.includes(`3개월 임금 합계: 9,000,000원`), '3개월 임금 합계가 화면에 없습니다');

  // --- A wage pasted with thousands separators is the same amount.
  const wage1 = page.getByLabel(/^임금 합계 1/);
  const wage2 = page.getByLabel(/^임금 합계 2/);
  const wage3 = page.getByLabel(/^임금 합계 3/);
  await wage1.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('2,500,000');
  const grouped = estimate({ start: '2023-01-01', last: '2024-01-31', wages: [2_500_000, 3_000_000, 3_000_000] });
  assertEstimate(t, await read(), grouped, '쉼표가 들어간 임금');

  // --- Bonus and unused annual leave add their 3/12 share, and the breakdown says so.
  await wage1.fill('3000000');
  await page.getByLabel(/^최근 1년 정기상여금 총액/).fill('4000000');
  await page.getByLabel(/^최근 1년 연차수당 총액/).fill('300000');
  const withExtras = estimate({
    start: '2023-01-01',
    last: '2024-01-31',
    wages: [3_000_000, 3_000_000, 3_000_000],
    bonus: 4_000_000,
    leave: 300_000,
  });
  assertEstimate(t, await read(), withExtras, '상여금·연차수당 반영');
  const breakdown = await page.locator('main').innerText();
  t.assert(breakdown.includes('상여금 반영액(3/12): 1,000,000원'), '상여금 3/12 반영액이 표시되지 않았습니다');
  t.assert(breakdown.includes('연차수당 반영액(3/12): 75,000원'), '연차수당 3/12 반영액이 표시되지 않았습니다');
  t.assert(breakdown.includes('평균임금 총액: 10,075,000원'), '평균임금 총액이 틀립니다');

  // --- A known daily ordinary wage above the average becomes the statutory floor.
  await page.getByLabel(/^확인한 1일 통상임금/).fill('200000');
  const floored = estimate({
    start: '2023-01-01',
    last: '2024-01-31',
    wages: [3_000_000, 3_000_000, 3_000_000],
    bonus: 4_000_000,
    leave: 300_000,
    ordinary: 200_000,
  });
  assertEstimate(t, await read(), floored, '통상임금 하한');
  t.assert(money(await stat(page, '적용 1일 임금')) === 200_000, '통상임금이 적용 일급으로 쓰이지 않았습니다');

  // --- Clearing one monthly total is missing data, not 0원: nothing plausible may be shown.
  await page.getByLabel(/^확인한 1일 통상임금/).fill('0');
  await page.getByLabel(/^최근 1년 정기상여금 총액/).fill('0');
  await page.getByLabel(/^최근 1년 연차수당 총액/).fill('0');
  await wage2.fill('');
  await t.waitForText('임금 합계 3개를 모두 입력하고');
  t.assert(await page.getByRole('alert').isVisible(), '빈 임금 칸에 대한 안내가 보이지 않습니다');
  t.assert((await page.getByText('예상 퇴직금(세전)').count()) === 0, '빈 임금 칸인데도 퇴직금이 표시되었습니다');
  await wage2.fill('3000000');
  await t.waitForText('예상 퇴직금(세전)');
  assertEstimate(t, await read(), defaults, '임금을 다시 채운 뒤');

  // --- Less than one year, or under 15 hours a week, is reported as zero with the reason.
  await page.getByLabel('입사일').fill('2023-02-02');
  const shortService = estimate({ start: '2023-02-02', last: '2024-01-31', wages: [3_000_000, 3_000_000, 3_000_000] });
  t.assert(shortService.serviceDays === 364, 'spec: the short-service case should be 364 days');
  assertEstimate(t, await read(), shortService, '1년 미만');
  await t.waitForText('법정 퇴직금 예상액을 0원으로 표시합니다');
  await page.getByLabel('입사일').fill('2023-01-01');
  await page.getByLabel(/^주 소정근로시간/).fill('14');
  t.assert(money(await stat(page, '예상 퇴직금(세전)')) === 0, '주 15시간 미만인데 0원이 아닙니다');
  await page.getByLabel(/^주 소정근로시간/).fill('40');
  assertEstimate(t, await read(), defaults, '주 40시간으로 되돌린 뒤');

  // --- The copied estimate carries the amount, the dates and the daily wage.
  await page.getByRole('button', { name: '예상액 복사', exact: true }).click();
  await t.waitForText('복사됨');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes(`${defaults.pay.toLocaleString('ko-KR')}원`), `복사된 금액이 다릅니다: ${copied}`);
  t.assert(copied.includes('퇴직일'), '복사된 결과에 퇴직일이 없습니다');
  t.assert(copied.includes('계속근로일수'), '복사된 결과에 계속근로일수가 없습니다');

  // --- Reset returns the saved edits to the opening state.
  await wage1.fill('1000000');
  await page.getByRole('button', { name: '초기화', exact: true }).click();
  t.assert((await wage1.inputValue()) === '3000000', '초기화가 월급을 되돌리지 않았습니다');
  assertEstimate(t, await read(), defaults, '초기화 뒤');

  // --- Saved work survives a reload.
  await wage3.fill('4000000');
  const saved = estimate({ start: '2023-01-01', last: '2024-01-31', wages: [3_000_000, 3_000_000, 4_000_000] });
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:severance-pay-kr:state') ?? 'null')?.wages?.[2] === 4_000_000,
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  assertEstimate(t, await read(), saved, '새로고침 뒤 저장된 임금');

  // --- Landing-page presets keep answering with their own salary and dates.
  await checkVariant(t, '300-manwon-3-years', 3_000_000, 3, '9,008,219', '1,096');
  await checkVariant(t, '400-manwon-5-years', 4_000_000, 5, '20,010,959', '1,826');

  // --- 375 px in dark mode, and the date fields stay reachable by keyboard.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile variant should not scroll horizontally (overflow ${overflow}px)`);

  await page.getByLabel('입사일').focus();
  let lastWorkingFocused = false;
  for (let tabs = 0; tabs < 8 && !lastWorkingFocused; tabs++) {
    await page.keyboard.press('Tab');
    lastWorkingFocused = await page
      .getByLabel('마지막 근무일')
      .evaluate((element) => element === document.activeElement);
  }
  t.assert(lastWorkingFocused, '날짜 입력은 키보드 순서로 이동할 수 있어야 합니다');
}

function statText(page, label) {
  return page.getByText(label, { exact: true }).locator('..').innerText();
}

async function checkVariant(t, slug, pay, years, amount, serviceDays) {
  await t.open(`/ko/severance-pay-kr/${slug}`);

  const description = await t.page.locator('meta[name="description"]').getAttribute('content');
  const intro = await t.page.locator('header p').innerText();
  t.assert(description.includes(`${amount}원`), '검색 설명에 계산된 퇴직금이 있어야 합니다');
  t.assert(intro.includes(`세전 예상 퇴직금은 ${amount}원`), '소개와 검색 설명의 퇴직금이 같아야 합니다');
  t.assert(intro.includes(`계속근로 ${serviceDays}일`), '소개에 실제 계속근로일수가 있어야 합니다');
  t.assert((await statText(t.page, '예상 퇴직금(세전)')).includes(`${amount}원`), '계산기 결과가 소개와 같아야 합니다');

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
  await t.open('/ko/severance-pay-kr');
  await t.page.getByLabel('임금 합계 1').fill('1234567');
  await t.page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:severance-pay-kr:state') ?? 'null')?.wages?.[0] === 1234567,
  );

  await checkVariant(t, '300-manwon-3-years', 3_000_000, 3, '9,008,219', '1,096');
  await checkVariant(t, '400-manwon-5-years', 4_000_000, 5, '20,010,959', '1,826');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile variant should not scroll horizontally (overflow ${overflow}px)`);

  await t.page.getByLabel('입사일').focus();
  let lastWorkingFocused = false;
  for (let tabs = 0; tabs < 8 && !lastWorkingFocused; tabs++) {
    await t.page.keyboard.press('Tab');
    lastWorkingFocused = await t.page
      .getByLabel('마지막 근무일')
      .evaluate((element) => element === document.activeElement);
  }
  t.assert(lastWorkingFocused, '날짜 입력은 키보드 순서로 이동할 수 있어야 합니다');
}

function statText(page, label) {
  return page.getByText(label, { exact: true }).locator('..').innerText();
}

async function checkDurationVariant(t, slug, months, ageLabel, days) {
  await t.open(`/ko/unemployment-benefit-kr/${slug}`);

  const description = await t.page.locator('meta[name="description"]').getAttribute('content');
  const intro = await t.page.locator('header p').innerText();
  t.assert(description.includes(`${days}일`), '검색 설명에 공식 소정급여일수가 있어야 합니다');
  t.assert(intro.includes(`소정급여일수 ${days}일`), '소개와 검색 설명의 소정급여일수가 같아야 합니다');
  t.assert(intro.includes('12개월'), '소개에 법정 수급기간 제한도 있어야 합니다');
  t.assert((await statText(t.page, '소정급여일수')).includes(`${days}일`), '계산기 결과가 소개와 같아야 합니다');
  t.assert(
    (await t.page.getByLabel('합산 대상 가입기간(개월)').inputValue()) === String(months),
    '가입기간 preset이 저장값보다 우선해야 합니다',
  );
  t.assert(
    await t.page.getByRole('radio', { name: ageLabel, exact: true }).isChecked(),
    '연령 preset이 선택되어야 합니다',
  );
}

export default async function (t) {
  await t.open('/ko/unemployment-benefit-kr');
  await t.page.getByLabel('합산 대상 가입기간(개월)').fill('120');
  await t.page.getByRole('radio', { name: '50세 이상·장애인', exact: true }).click();
  await t.page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:unemployment-benefit-kr:state') ?? 'null')?.insuranceMonths === 120,
  );

  await checkDurationVariant(t, 'duration-under-50-3-years', 36, '50세 미만', 180);
  await checkDurationVariant(t, 'duration-50-or-disabled-10-years', 120, '50세 이상·장애인', 270);

  await t.open('/ko/unemployment-benefit-kr/minimum-2026');
  const description = await t.page.locator('meta[name="description"]').getAttribute('content');
  const intro = await t.page.locator('header p').innerText();
  t.assert(description.includes('66,048원'), '하한액 검색 설명에 8시간 기준 답이 있어야 합니다');
  t.assert(intro.includes('66,048원'), '하한액 소개가 검색 설명과 같아야 합니다');
  t.assert(
    (await statText(t.page, '1일 구직급여')).includes('66,048원'),
    '계산기가 하한액 preset 결과를 보여야 합니다',
  );
  t.assert(
    (await t.page.getByLabel('이직 전 1일 평균임금(원)').inputValue()) === '50000',
    '하한액 preset이 평균임금을 바꿔야 합니다',
  );

  await t.page.getByLabel('이직 전 1일 평균임금(원)').fill('200000');
  await t.waitForText(/적용 1일 기초금액 113,500원 × 60% = 68,100원/);
  t.assert((await statText(t.page, '1일 구직급여')).includes('68,100원'), '상한 적용 결과가 정확해야 합니다');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile variant should not scroll horizontally (overflow ${overflow}px)`);

  await t.page.getByLabel('이직 전 1일 평균임금(원)').focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    await t.page.getByLabel('확인한 1일 통상임금(원)').evaluate((element) => element === document.activeElement),
    '임금 입력은 키보드 순서로 이동할 수 있어야 합니다',
  );
}

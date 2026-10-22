export default async function (t) {
  await t.open('/ko/weekly-holiday-pay-kr');

  await t.waitForText(/41,280원/);
  let main = await t.page.locator('main').innerText();
  t.assert(
    main.includes('4주 평균 시간, 개근, 1주간 근로관계 조건을 모두 충족'),
    'default result should explain eligibility',
  );
  t.assert(main.includes('1,076,229원'), 'default monthly estimate should be visible');
  t.assert(main.includes('2026년 최저임금 10,320원과 같습니다'), 'default minimum-wage comparison should be visible');

  await t.page.getByRole('checkbox', { name: /선택한 기간 내내 이번 주와 같은 근무표/ }).uncheck({ force: true });
  for (const day of ['월요일', '화요일', '수요일', '목요일', '금요일']) {
    await t.page.getByLabel(`${day} 소정근로시간`).fill('2');
  }
  await t.page.getByLabel('3주 전').fill('10');

  await t.waitForText(/30,960원/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('15시간'), 'irregular four-week average should land on the exact 15-hour boundary');
  t.assert(main.includes('발생'), 'the exact 15-hour boundary should qualify');

  await t.page.getByLabel('3주 전').fill('9.5');
  await t.waitForText(/1주 평균 소정근로시간이 15시간 미만/);
  main = await t.page.locator('main').innerText();
  const holidayPayStat = await t.page.getByText('1주 주휴수당', { exact: true }).locator('..').innerText();
  t.assert(holidayPayStat.includes('0원'), 'below-boundary schedule should show zero holiday pay');

  await t.page.getByLabel('3주 전').fill('10');
  await t.page.getByRole('checkbox', { name: /이번 주 소정근로일을 모두 개근/ }).uncheck({ force: true });
  await t.waitForText(/소정근로일을 모두 개근하지 않았습니다/);
  main = await t.page.locator('main').innerText();
  t.assert(
    main.includes('15시간 ÷ 5 = 3시간'),
    'an ineligible result should preserve the formula hours while payable hours become zero',
  );

  await t.page.getByLabel('약정 시급(원)').fill('10319');
  await t.waitForText(/최저시급보다 부족한 시간당 금액 1원/);
  await t.page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:weekly-holiday-pay-kr:state') ?? 'null')?.hourlyWage === 10319,
  );

  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 }).catch(() => {});
  await t.page.waitForFunction(() => document.querySelector('input[aria-label="약정 시급(원)"]')?.value === '10319');
  t.assert((await t.page.getByLabel('약정 시급(원)').inputValue()) === '10319', 'saved wage should survive reload');
  t.assert(
    !(await t.page.getByRole('checkbox', { name: /이번 주 소정근로일을 모두 개근/ }).isChecked()),
    'attendance choice should survive reload',
  );

  await t.page.getByRole('button', { name: '초기화' }).click();
  await t.page.getByRole('radio', { name: '통상근로자', exact: true }).click();
  for (const day of ['월요일', '화요일', '수요일', '목요일', '금요일']) {
    await t.page.getByLabel(`${day} 소정근로시간`).fill('7');
  }
  await t.page.getByLabel('토요일 소정근로시간').fill('5');
  await t.page.getByLabel('통상적인 1일 소정근로시간').fill('7');
  await t.waitForText(/72,240원/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('7시간 = 7시간'), 'ordinary-worker calculation should use normal workday hours');
  const regularHolidayHours = await t.page.getByText('주휴시간', { exact: true }).locator('..').innerText();
  t.assert(regularHolidayHours.includes('7시간'), 'ordinary six-day schedule should receive seven holiday hours');

  await t.page.getByRole('button', { name: '초기화' }).click();
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile page should not scroll horizontally (overflow ${overflow}px)`);

  await t.page.getByLabel('월요일 소정근로시간').focus();
  await t.page.keyboard.press('Tab');
  const focusedLabel = await t.page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  t.assert(focusedLabel === '화요일 소정근로시간', 'daily inputs should follow a keyboard-friendly order');

  await t.open('/weekly-holiday-pay-kr');
  await t.waitForText(/Weekly holiday pay/);
  main = await t.page.locator('main').innerText();
  t.assert(
    main.includes('The hourly wage equals the 2026 minimum of KRW 10,320.'),
    'English locale should render its localized result',
  );
}

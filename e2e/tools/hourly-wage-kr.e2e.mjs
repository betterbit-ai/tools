export default async function (t) {
  await t.open('/ko/hourly-wage-kr');

  await t.waitForText(/2,156,880원/);
  let main = await t.page.locator('main').innerText();
  t.assert(main.includes('주휴수당 포함 월급'), 'default result should include the monthly headline');
  t.assert(main.includes('1,795,680원'), 'default result should show the amount without weekly holiday pay');
  t.assert(main.includes('82,560원'), 'default result should show the weekly holiday allowance');
  t.assert(main.includes('조건을 모두 충족했습니다'), 'default result should explain why holiday pay applies');
  t.assert(main.includes('2026년 최저임금 10,320원과 같습니다'), 'default result should check minimum wage');

  await t.page.getByLabel('시급(원)').fill('12000');
  await t.page.getByLabel('1일 근무시간').fill('4');
  await t.page.getByLabel('1주 근무일수').fill('5');
  await t.waitForText(/1,248,000원/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('1,044,000원'), 'part-time result should show monthly pay without holiday pay');
  t.assert(main.includes('48,000원'), '20-hour week should add four hours of holiday pay');
  t.assert(main.includes('104 시간'), 'part-time result should show whole monthly paid hours');

  await t.page.getByRole('radio', { name: '사업소득 3.3%', exact: true }).click();
  await t.waitForText(/1,206,820원/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('37,440원'), '3.3% option should itemize the 3% business income tax');
  t.assert(main.includes('3,740원'), '3.3% option should truncate local income tax below KRW 10');
  t.assert(main.includes('41,180원'), '3.3% option should add the separately truncated taxes');
  t.assert(main.includes('근로자의 세후 월급 계산이 아닙니다'), '3.3% option should show the worker-status warning');

  await t.page.getByRole('checkbox', { name: '소정근로일을 모두 개근함' }).uncheck({ force: true });
  await t.waitForText(/소정근로일을 모두 개근하지 않았습니다/);
  const holidayPayStat = await t.page.getByText('1주 주휴수당', { exact: true }).locator('..').innerText();
  t.assert(holidayPayStat.includes('0원'), 'absence should remove weekly holiday pay');

  await t.page.getByLabel('1일 근무시간').fill('2');
  await t.waitForText(/1주 소정근로시간이 15시간 미만입니다/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('개근하지 않았습니다'), 'all failed conditions should remain visible');

  await t.page.getByLabel('시급(원)').fill('10319');
  await t.waitForText(/최저시급보다 부족한 시간당 금액 1원/);
  await t.page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:hourly-wage-kr:state') ?? 'null')?.hourlyWage === 10319,
  );

  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 }).catch(() => {});
  await t.page.waitForFunction(() => document.querySelector('input[aria-label="시급(원)"]')?.value === '10319');
  t.assert((await t.page.getByLabel('시급(원)').inputValue()) === '10319', 'saved hourly wage should survive reload');
  t.assert(
    !(await t.page.getByRole('checkbox', { name: '소정근로일을 모두 개근함' }).isChecked()),
    'saved attendance condition should survive reload',
  );

  await t.page.getByRole('button', { name: '초기화' }).click();
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile page should not scroll horizontally (overflow ${overflow}px)`);

  await t.page.getByLabel('1일 근무시간').focus();
  await t.page.keyboard.press('Tab');
  const focusedLabel = await t.page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  t.assert(focusedLabel === '1주 근무일수', 'numeric inputs should follow a keyboard-friendly order');

  await t.open('/hourly-wage-kr');
  await t.waitForText(/2,156,880 KRW/);
  main = await t.page.locator('main').innerText();
  t.assert(
    main.includes('The hourly rate equals the 2026 minimum wage of KRW 10,320.'),
    'English locale should render its localized result explanation',
  );
}

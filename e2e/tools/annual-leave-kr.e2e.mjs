export default async function (t) {
  await t.open('/ko/annual-leave-kr');

  await t.waitForText(/예상 미사용 연차수당/);
  let main = await t.page.locator('main').innerText();
  t.assert(main.includes('입사일 기준 현재 발생분'), 'the hire-date result should be visible');
  t.assert(main.includes('회계연도 기준 올해 부여분'), 'the fiscal-year result should be visible beside it');
  t.assert(main.includes('왜 이렇게 계산됐나요?'), 'the result should explain its reasoning');

  await t.page.getByLabel('입사일').fill('2025-01-01');
  await t.page.getByLabel('계산 기준일').fill('2025-12-31');
  await t.waitForText(/재직 역일수[^\d]*365 일/);
  let hireStat = await t.page.getByText('입사일 기준 현재 발생분', { exact: true }).locator('..').innerText();
  t.assert(hireStat.includes('11일'), 'a worker leaving after exactly 365 days should have only 11 first-year days');

  await t.page.getByLabel('계산 기준일').fill('2026-01-01');
  await t.waitForText(/재직 역일수[^\d]*366 일/);
  hireStat = await t.page.getByText('입사일 기준 현재 발생분', { exact: true }).locator('..').innerText();
  t.assert(hireStat.includes('15일'), 'employment on the anniversary day should create the 15-day grant');

  await t.page.getByLabel('입사일').fill('2022-05-10');
  await t.page.getByLabel('계산 기준일').fill('2025-05-10');
  await t.page.getByRole('checkbox', { name: /기준일에 퇴사하며/ }).check({ force: true });
  await t.waitForText(/입사일 57일 − 회계연도 50.7일 = 차이 6.3일/);
  const shortfallStat = await t.page.getByText('퇴사 시 부족분', { exact: true }).locator('..').innerText();
  t.assert(shortfallStat.includes('6.3일'), 'the official fiscal-year example should expose a 6.3-day shortfall');
  main = await t.page.locator('main').innerText();
  t.assert(
    main.includes('× 11.3일'),
    'the termination shortfall should be added to the five ledger days in the pay formula',
  );

  await t.page.getByLabel('1주 소정근로시간').fill('20');
  await t.waitForText(/단시간근로자 시간 환산/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('입사일 기준 64시간'), 'a 20-hour worker should see the statutory hour conversion');

  await t.page.getByLabel('입사일').fill('2023-01-01');
  await t.page.getByLabel('계산 기준일').fill('2026-01-01');
  await t.waitForText(/입사일 57일 − 회계연도 57일 = 차이 0일/);
  const fiscalStat = await t.page.getByText('회계연도 기준 올해 부여분', { exact: true }).locator('..').innerText();
  t.assert(fiscalStat.includes('16일'), 'January 1 fiscal grants should use completed service years without lag');

  await t.page.getByRole('checkbox', { name: /완료된 모든 연차 산정기간/ }).uncheck({ force: true });
  await t.waitForText(/회계연도 현재분, 누적 비교와 퇴사 차이를 추정하지 않습니다/);
  const unknownFiscalStat = await t.page
    .getByText('회계연도 기준 올해 부여분', { exact: true })
    .locator('..')
    .innerText();
  t.assert(
    unknownFiscalStat.includes('출근기록 필요'),
    'below-80 fiscal results should require basis-specific records',
  );
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('출근 조건 충족 시'), 'below-80 future accrual should be shown as conditional');
  await t.page.getByRole('checkbox', { name: /완료된 모든 연차 산정기간/ }).check({ force: true });

  await t.page.getByRole('checkbox', { name: /기준일에 퇴사하며/ }).uncheck({ force: true });
  await t.page.getByRole('checkbox', { name: /상시 근로자 5명 이상/ }).uncheck({ force: true });
  await t.waitForText(/법정 연차 0일: 상시 5명 미만/);
  hireStat = await t.page.getByText('입사일 기준 현재 발생분', { exact: true }).locator('..').innerText();
  t.assert(hireStat.includes('0일'), 'an under-five workplace should show zero statutory days');
  const nextStat = await t.page.getByText('다음 발생', { exact: true }).locator('..').innerText();
  t.assert(nextStat.includes('해당 없음'), 'an ineligible worker should not see a theoretical future grant');
  const payStat = await t.page.getByText('예상 미사용 연차수당', { exact: true }).locator('..').innerText();
  t.assert(payStat.includes('0원'), 'the ineligible result should show zero statutory pay');

  await t.page.getByRole('checkbox', { name: /상시 근로자 5명 이상/ }).check({ force: true });
  await t.page.getByRole('checkbox', { name: /기준일에 퇴사하며/ }).check({ force: true });
  await t.page.getByLabel('월 통상임금', { exact: true }).fill('3200000');
  await t.page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:annual-leave-kr:state') ?? 'null')?.monthlyOrdinaryWage === 3200000,
  );

  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 }).catch(() => {});
  await t.page.waitForFunction(() => document.querySelector('input[aria-label="월 통상임금"]')?.value === '3200000');
  t.assert(
    (await t.page.getByLabel('월 통상임금', { exact: true }).inputValue()) === '3200000',
    'saved wage should survive reload',
  );
  t.assert(
    await t.page.getByRole('checkbox', { name: /기준일에 퇴사하며/ }).isChecked(),
    'termination mode should survive reload',
  );

  await t.page.getByRole('button', { name: '초기화' }).click();
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile page should not scroll horizontally (overflow ${overflow}px)`);

  await t.page.getByLabel('입사일').focus();
  let focusedLabel = '';
  for (let presses = 0; presses < 5 && focusedLabel !== '계산 기준일'; presses++) {
    await t.page.keyboard.press('Tab');
    focusedLabel = await t.page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
  }
  t.assert(
    focusedLabel === '계산 기준일',
    `date inputs should follow a keyboard-friendly order (focused ${focusedLabel})`,
  );

  await t.open('/annual-leave-kr');
  await t.waitForText(/Current hire-date grant/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('Current fiscal-year grant'), 'English locale should localize the fiscal-year result');
  t.assert(main.includes('Why this result'), 'English locale should localize the explanation');
}

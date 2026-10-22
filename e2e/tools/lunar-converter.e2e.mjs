export default async function (t) {
  await t.open('/ko/lunar-converter');

  await t.waitForText(/2026·2027년 음력 생일/);
  let main = await t.page.locator('main').innerText();
  t.assert(main.includes('2026년 9월 12일'), 'the default solar date should convert immediately');
  t.assert(main.includes('왜 이 결과인가요?'), 'the result should explain why the date was returned');
  t.assert(main.includes('한국천문연구원 2026·2027 달력자료와 대조'), 'the source check should be visible');

  await t.page.getByRole('radio', { name: '음력 → 양력' }).click();
  await t.page.getByLabel('음력 연도').fill('2026');
  await t.page.getByLabel('음력 월').fill('8');
  await t.page.getByLabel('음력 일').fill('15');
  await t.waitForText(/2026년 9월 25일/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('2027년 9월 15일'), 'the same lunar birthday should show its 2027 solar date');
  t.assert(main.includes('병오년 정유월 임인일'), 'the converted Chuseok date should show its ganji');
  t.assert(main.includes('말띠'), 'the converted date should show the lunar-year zodiac');

  await t.page.getByLabel('음력 연도').fill('2023');
  await t.page.getByLabel('음력 월').fill('2');
  await t.page.getByLabel('음력 일').fill('15');
  await t.page.getByRole('checkbox', { name: '윤달로 입력' }).check({ force: true });
  await t.waitForText(/2023년 4월 5일/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('윤2월'), 'a valid leap-month conversion should label the leap month');
  t.assert(
    main.includes('해당 해에 같은 윤달이 없어 같은 번호의 평달로 계산했습니다.'),
    'annual leap-month birthday fallbacks should explain the convention',
  );

  await t.page.getByLabel('음력 연도').fill('2026');
  await t.waitForText(/존재하지 않는 날짜입니다/);
  t.assert(
    (await t.page.getByText('존재하지 않는 날짜입니다. 음력 30일과 윤달 여부를 다시 확인하세요.').count()) === 1,
    'invalid input should announce one error, not duplicate live feedback',
  );

  await t.page.getByLabel('음력 연도').fill('2023');
  await t.page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:lunar-converter:input') ?? 'null')?.lunarYear === 2023,
  );
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 }).catch(() => {});
  await t.page.waitForFunction(() => document.querySelector('input[type="number"]')?.value === '2023');
  t.assert(
    await t.page.getByRole('checkbox', { name: '윤달로 입력' }).isChecked(),
    'the leap-month setting should survive reload',
  );

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile page should not scroll horizontally (overflow ${overflow}px)`);

  await t.page.getByLabel('음력 연도').focus();
  await t.page.keyboard.press('Tab');
  const monthFocused = await t.page.getByLabel('음력 월').evaluate((element) => element === document.activeElement);
  t.assert(monthFocused, 'lunar fields should follow a keyboard-friendly year → month order');

  await t.open('/lunar-converter');
  await t.waitForText(/Lunar birthday in 2026 and 2027/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('Why this result'), 'the English locale should localize the explanation');
  t.assert(main.includes('Cross-checked with KASI'), 'the English locale should localize the source note');
}

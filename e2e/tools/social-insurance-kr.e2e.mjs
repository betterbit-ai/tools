export default async function (t) {
  await t.open('/ko/social-insurance-kr');

  await t.waitForText(/291,520원/);
  let main = await t.page.locator('main').innerText();
  t.assert(main.includes('299,020원'), 'default employer contribution should be visible');
  t.assert(main.includes('3,299,020원'), 'default employer labor cost should be visible');
  t.assert(main.includes('0.25%'), 'default result should explain the employer-size rate');
  t.assert(main.includes('산재보험료율을 입력하지 않아 0원'), 'missing accident rate should be explained');

  await t.page.getByRole('radio', { name: '연봉', exact: true }).click();
  t.assert(
    (await t.page.getByLabel('세전 연봉(원)').inputValue()) === '36000000',
    'switching to annual input should preserve equivalent pay',
  );
  await t.page.getByLabel('세전 연봉(원)').fill('38400000');
  await t.page.getByLabel('월 비과세 급여(원)').fill('200000');
  await t.page.getByLabel('산재보험료율(%)').fill('1.47');
  await t.waitForText(/343,120원/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('3,543,120원'), 'annual pay, non-taxable pay, and accident rate should affect labor cost');
  t.assert(main.includes('연봉을 12개월로 나눠'), 'annual conversion should be explained');
  t.assert(main.includes('월 비과세 200,000원'), 'non-taxable subtraction should be explained');
  t.assert(main.includes('입력한 1.47% 요율'), 'entered accident rate should be explained');

  await t.page.getByLabel('세전 연봉(원)').fill('120000000');
  await t.page.getByLabel('월 비과세 급여(원)').fill('0');
  await t.waitForText(/313,020원/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('최대 기준소득월액 6,590,000원'), 'second-half pension ceiling should be explained');

  await t.page.getByRole('radio', { name: '2026년 1~6월', exact: true }).click();
  await t.waitForText(/302,570원/);
  main = await t.page.locator('main').innerText();
  t.assert(
    main.includes('최대 기준소득월액 6,370,000원'),
    'first-half pension ceiling should replace the later ceiling',
  );

  await t.page.getByRole('checkbox', { name: '국민연금 포함' }).uncheck({ force: true });
  await t.waitForText(/국민연금 가입 스위치를 꺼서 국민연금은 0원/);
  const pensionRow = await t.page.getByRole('row').filter({ hasText: '국민연금' }).first().innerText();
  t.assert(pensionRow.includes('0원'), 'confirmed pension exclusion should zero both shares');

  await t.page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:social-insurance-kr:state') ?? 'null')?.pensionCovered === false,
  );
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 }).catch(() => {});
  await t.page.waitForFunction(() => document.querySelector('input[type="checkbox"]')?.checked === false);
  t.assert(
    !(await t.page.getByRole('checkbox', { name: '국민연금 포함' }).isChecked()),
    'coverage choice should survive reload',
  );
  t.assert(
    (await t.page.getByLabel('세전 연봉(원)').inputValue()) === '120000000',
    'annual salary should survive reload',
  );

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile page should not scroll horizontally (overflow ${overflow}px)`);

  await t.page.getByLabel('세전 연봉(원)').focus();
  await t.page.keyboard.press('Tab');
  const focusedLabel = await t.page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  t.assert(focusedLabel === '월 비과세 급여(원)', 'inputs should follow a keyboard-friendly order');

  await t.open('/social-insurance-kr');
  await t.waitForText(/Estimated monthly contributions/);
  main = await t.page.locator('main').innerText();
  t.assert(main.includes('Why this result'), 'English locale should render localized result explanations');
}

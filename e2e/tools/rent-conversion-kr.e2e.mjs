function statText(page, label) {
  return page.getByText(label, { exact: true }).locator('..').innerText();
}

export default async function (t) {
  await t.open('/ko/rent-conversion-kr');
  await t.page.evaluate(() => localStorage.removeItem('tools:rent-conversion-kr:state'));
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });

  // The useful default demonstrates automatic capping and reverse-checks a realistic quote.
  t.assert(
    (await statText(t.page, '환산 월세')).includes('833,333 원'),
    '기존 계약 기본값에 연 5% 법정 상한이 적용되지 않았습니다',
  );
  t.assert(
    (await statText(t.page, '실제 계산 전환율')).includes('5%'),
    '입력한 6% 대신 법정 상한 5%가 표시되어야 합니다',
  );
  t.assert(
    (await statText(t.page, '제시 월세의 역산 전환율')).includes('6%'),
    '월 100만원 제안의 역산 전환율이 6%여야 합니다',
  );
  t.assert(
    (await statText(t.page, '월 초과액')).includes('166,667 원'),
    '기본 제안의 법정 상한 초과액이 정확하지 않습니다',
  );
  await t.waitForText(/연 6\.00%가 법정 상한 연 5\.00%를 넘어 5\.00%로 낮춰 계산/);

  // A realistic larger deposit updates every result live without a Calculate action.
  await t.page.getByLabel(/^현재 전세보증금/).fill('50000');
  await t.page.getByLabel(/^전환 후 월세보증금/).fill('20000');
  await t.page.getByLabel(/^적용할 연 전환율/).fill('7');
  await t.page.getByLabel(/^집주인이 제시한 월세/).fill('150');
  t.assert(
    (await statText(t.page, '환산 월세')).includes('1,250,000 원'),
    '3억원 차액의 법정 상한 월세가 정확하지 않습니다',
  );
  t.assert(
    (await statText(t.page, '월 초과액')).includes('250,000 원'),
    '월 150만원 제안의 초과액이 정확하지 않습니다',
  );

  // A new lease retains the entered rate while preserving the ceiling as a comparison only.
  await t.page.getByRole('radio', { name: '신규 계약', exact: true }).click();
  t.assert(
    (await statText(t.page, '환산 월세')).includes('1,750,000 원'),
    '신규 계약은 입력한 7%를 그대로 사용해야 합니다',
  );
  await t.waitForText(/신규 계약은 입력한 연 7\.00%로 계산/);

  // Reverse conversion uses the chosen comparison rate and does not misuse the one-way legal cap.
  await t.page.getByRole('radio', { name: '월세 → 전세', exact: true }).click();
  await t.page.getByLabel(/^현재 월세보증금/).fill('5000');
  await t.page.getByLabel(/^월세\(만원\)/).fill('90');
  await t.page.getByLabel(/^적용할 연 전환율/).fill('5');
  t.assert(
    (await statText(t.page, '환산 전세보증금')).includes('266,000,000 원'),
    '보증금 5천만원·월세 90만원의 5% 역환산이 정확하지 않습니다',
  );
  await t.waitForText(/월세→전세는 입력 전환율로 구한 비교용 환산액/);

  // User effort persists across reloads.
  await t.page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:rent-conversion-kr:state') ?? 'null')?.monthlyRent === '90',
  );
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.waitForFunction(() => document.querySelector('input')?.value === '5000');
  t.assert(
    await t.page.getByRole('radio', { name: '월세 → 전세', exact: true }).isChecked(),
    '전환 방향이 새로고침 뒤 복원되지 않았습니다',
  );
  t.assert(
    (await t.page.getByLabel(/^월세\(만원\)/).inputValue()) === '90',
    '월세 입력이 새로고침 뒤 복원되지 않았습니다',
  );

  // English search content and controls explain the Korean unit and current ceiling natively.
  await t.open('/rent-conversion-kr');
  await t.click('Reset');
  const description = await t.page.locator('meta[name="description"]').getAttribute('content');
  t.assert(
    description.includes('2026 legal ceiling'),
    'English search description should state the current legal basis',
  );
  t.assert(
    (await t.page.getByLabel(/^Current jeonse deposit/).inputValue()) === '30000',
    'English controls should use the documented KRW 10,000 unit',
  );

  // Keyboard order, mobile width, and dark rendering remain usable.
  await t.open('/ko/rent-conversion-kr');
  await t.click('초기화');
  await t.page.getByLabel(/^현재 전세보증금/).focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    await t.page.getByLabel(/^전환 후 월세보증금/).evaluate((element) => element === document.activeElement),
    '보증금 입력의 키보드 순서가 자연스럽지 않습니다',
  );
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `375px 화면에 가로 스크롤이 생깁니다 (${overflow}px)`);
  t.assert(
    (await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    '다크 모드 배경이 렌더링되지 않았습니다',
  );
}

/**
 * Remove duplicate lines: the list a reader pastes from a spreadsheet or a mail export, and every
 * control that decides what counts as the same line.
 *
 * Covers the defect this audit fixed: an Excel "CSV UTF-8" copy starts with a byte-order mark, and
 * the entry it was glued to stopped matching the same name further down the list.
 */

const NAMES = ['김민수', '이서연', '박지훈', '김민수', '이서연', '최유진', '정다은', '김민수'];

async function output(page) {
  return page.locator('main textarea').nth(1).inputValue();
}

async function stats(page) {
  return page.evaluate(() => {
    const found = {};
    for (const element of document.querySelectorAll('main div')) {
      if (element.children.length !== 2) continue;
      const [value, name] = [element.children[0], element.children[1]];
      if (name.children.length !== 0 || value.children.length !== 0) continue;
      found[name.textContent?.trim() ?? ''] = value.textContent?.trim() ?? '';
    }
    return found;
  });
}

async function toggle(page, label) {
  await page.getByText(label, { exact: true }).click();
  await page.waitForTimeout(120);
}

export default async function (t) {
  const page = t.page;
  await t.open('/ko/remove-duplicate-lines');
  const input = page.locator('main textarea').first();

  // ── 2. A 1,000-line export arrives in one paste, and the page stays usable afterwards.
  const longList = Array.from({ length: 1_000 }, (_, index) => `메일 주소 ${index % 200}`).join('\n');
  const started = Date.now();
  await input.click();
  await page.keyboard.insertText(longList);
  await page.waitForTimeout(300);
  const active = await page.evaluate(() => document.activeElement?.tagName);
  const elapsed = Date.now() - started;
  t.assert(active === 'TEXTAREA', `the page lost the field after a 1,000-line paste (${elapsed} ms)`);
  t.assert(
    (await stats(page))['고유 줄 수'] === '200',
    `1,000 lines unique count: ${(await stats(page))['고유 줄 수']}`,
  );
  t.assert(elapsed < 10_000, `a 1,000-line paste took ${elapsed} ms`);
  await input.fill('');
  await page.waitForTimeout(200);

  // ── 3. Keeping the last occurrence keeps its own position.
  await input.fill(NAMES.join('\n'));
  await page.waitForTimeout(200);
  await page.getByRole('radio', { name: '마지막 것' }).click();
  await page.waitForTimeout(200);
  t.assert(
    (await output(page)) === '박지훈\n이서연\n최유진\n정다은\n김민수',
    `last-occurrence output:\n${JSON.stringify(await output(page))}`,
  );
  await page.getByRole('radio', { name: '처음 것' }).click();
  await page.waitForTimeout(150);

  // ── 4. Case and surrounding spaces are comparison-only settings.
  await input.fill('  Apple  \napple\nAPPLE\n pear ');
  await page.waitForTimeout(200);
  t.assert((await output(page)) === '  Apple  \napple\nAPPLE\n pear ', 'the default settings already merged lines');
  await toggle(page, '대소문자 구분');
  await toggle(page, '앞뒤 공백 무시');
  t.assert(
    (await output(page)) === '  Apple  \n pear ',
    `comparison settings output: ${JSON.stringify(await output(page))}`,
  );
  t.assert((await stats(page))['제거한 중복 줄'] === '2', 'yes');
  await toggle(page, '대소문자 구분');
  await toggle(page, '앞뒤 공백 무시');

  // ── 5. Composed and decomposed Korean count as one line, and can be told not to.
  await input.fill('가\n\u1100\u1161\n가');
  await page.waitForTimeout(200);
  t.assert((await output(page)) === '가', `NFC output: ${JSON.stringify(await output(page))}`);
  await toggle(page, '같은 유니코드 문자로 비교');
  t.assert((await output(page)) === '가\n\u1100\u1161', 'turning NFC comparison off did not keep both forms');
  await toggle(page, '같은 유니코드 문자로 비교');

  // ── 6. Sorting is natural and applies after de-duplication.
  await input.fill('항목 10\n항목 2\n항목 1\n항목 2');
  await page.waitForTimeout(200);
  await page.getByLabel('결과 정렬').selectOption({ label: '가나다·A-Z (자연 정렬)' });
  await page.waitForTimeout(200);
  t.assert((await output(page)) === '항목 1\n항목 2\n항목 10', `ascending: ${JSON.stringify(await output(page))}`);
  await page.getByLabel('결과 정렬').selectOption({ label: '역순 (자연 정렬)' });
  await page.waitForTimeout(200);
  t.assert((await output(page)) === '항목 10\n항목 2\n항목 1', `descending: ${JSON.stringify(await output(page))}`);
  await page.getByLabel('결과 정렬').selectOption({ label: '원래 순서' });
  await page.waitForTimeout(150);

  // ── 7. Blank lines: kept, or removed and counted apart from duplicates.
  await input.fill('가\n\n나\n가\n\n');
  await page.waitForTimeout(200);
  const before = await stats(page);
  t.assert(before['입력 줄 수'] === '6', `blank-line input lines: ${before['입력 줄 수']}`);
  t.assert(before['제거한 빈 줄'] === '0', 'blank lines were removed with the setting off');
  await toggle(page, '빈 줄 제거');
  const after = await stats(page);
  t.assert((await output(page)) === '가\n나', `blank-line removal output: ${JSON.stringify(await output(page))}`);
  t.assert(after['제거한 빈 줄'] === '3', `removed blank lines: ${after['제거한 빈 줄']}`);
  t.assert(after['제거한 중복 줄'] === '1', `duplicates next to blanks: ${after['제거한 중복 줄']}`);
  await toggle(page, '빈 줄 제거');

  // ── 8. The byte-order mark of an Excel CSV copy no longer splits one name in two.
  await input.fill(`\uFEFF${NAMES.join('\n')}`);
  await page.waitForTimeout(200);
  t.assert(
    (await output(page)) === '김민수\n이서연\n박지훈\n최유진\n정다은',
    `BOM output:\n${JSON.stringify(await output(page))}`,
  );
  t.assert(
    (await stats(page))['제거한 중복 줄'] === '3',
    `BOM duplicates removed: ${(await stats(page))['제거한 중복 줄']}`,
  );

  // ── 9. Copy: the button, and Ctrl+Enter from outside the fields.
  await input.fill(NAMES.join('\n'));
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '결과 복사' }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === '김민수\n이서연\n박지훈\n최유진\n정다은', `copied text: ${JSON.stringify(copied)}`);
  await page.getByRole('heading', { name: '중복 줄 제거', level: 1 }).click();
  await page.evaluate(() => navigator.clipboard.writeText('cleared'));
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(300);
  t.assert(
    (await page.evaluate(() => navigator.clipboard.readText())) === copied,
    'Ctrl+Enter outside the fields did not copy the result',
  );

  // ── 10. A reload keeps the list and the comparison settings.
  await toggle(page, '앞뒤 공백 무시');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(400);
  t.assert(
    (await input.inputValue()) === NAMES.join('\n'),
    `reload lost the list: ${JSON.stringify(await input.inputValue())}`,
  );
  t.assert(
    (await page.getByRole('checkbox', { name: '앞뒤 공백 무시' }).isChecked()) === true,
    'reload lost the trim setting',
  );

  // ── 11. 375px: nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await t.open('/ko/remove-duplicate-lines');
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const box = await input.boundingBox();
  t.assert(box && box.width > 300, `the list field is ${box?.width}px wide at 375px`);
}

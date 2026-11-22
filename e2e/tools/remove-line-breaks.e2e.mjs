/**
 * Remove line breaks: the paste a reader actually makes from a PDF or a narrow email column,
 * the paragraph and list edges that must survive it, and every control on the page.
 *
 * Covers the defects this audit fixed: a paste that ends with a newline used to leave a stray
 * space at the end of the result (so the copied text carried it), and a byte-order mark at the
 * start of a CSV/PDF copy stayed glued to the first word.
 */

const PDF_TEXT = [
  '국민연금 근로자 부담은 4.75%이고 기준소득월액',
  '41만 원~659만 원 범위에 적용합니다. 건강보험',
  '근로자 부담은 직장가입자 보험료율 7.19%의 절반인',
  '3.595%입니다.',
  '',
  '- 첫 번째 항목',
  '- 두 번째 항목',
  '',
].join('\n');

const SENTENCE =
  '국민연금 근로자 부담은 4.75%이고 기준소득월액 41만 원~659만 원 범위에 적용합니다. 건강보험 근로자 부담은 직장가입자 보험료율 7.19%의 절반인 3.595%입니다.';

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
  await t.open('/ko/remove-line-breaks');
  const input = page.locator('main textarea').first();

  // ── 1. A PDF paste: wrapped lines join, the paragraph break and both list items stay,
  //       and nothing is left dangling at the end.
  await input.fill(PDF_TEXT);
  await page.waitForTimeout(200);
  const expected = `${SENTENCE}\n\n- 첫 번째 항목\n- 두 번째 항목`;
  t.assert((await output(page)) === expected, `PDF preset output:\n${JSON.stringify(await output(page))}`);
  t.assert(!/\s$/.test(await output(page)), 'the result ends with a space');
  const counts = await stats(page);
  t.assert(counts['찾은 줄바꿈'] === '7', `line breaks found: ${counts['찾은 줄바꿈']}`);
  t.assert(counts['제거한 줄바꿈'] === '4', `line breaks removed: ${counts['제거한 줄바꿈']}`);
  t.assert(counts['남긴 줄바꿈'] === '3', `line breaks kept: ${counts['남긴 줄바꿈']}`);

  // ── 2. Mode: 아무것도 없음 glues a split value back together.
  await input.fill('02-123\n4567');
  await page.waitForTimeout(150);
  t.assert((await output(page)) === '02-123 4567', `space mode: ${await output(page)}`);
  await page.getByRole('radio', { name: '아무것도 없음' }).click();
  await page.waitForTimeout(150);
  t.assert((await output(page)) === '02-1234567', `remove mode: ${await output(page)}`);

  // ── 3. Mode: 사용자 지정 shows its separator field and uses it between lines.
  await page.getByRole('radio', { name: '사용자 지정' }).click();
  await page.waitForTimeout(150);
  const separator = page.getByLabel('구분자');
  t.assert((await separator.count()) === 1, 'the custom separator field is not shown');
  await input.fill('가\n나\n다');
  await separator.fill(', ');
  await page.waitForTimeout(200);
  t.assert((await output(page)) === '가, 나, 다', `custom separator: ${await output(page)}`);

  // ── 4. Every toggle changes the result it claims to.
  await page.getByRole('button', { name: 'PDF 복사 정리' }).click();
  await input.fill(PDF_TEXT);
  await page.waitForTimeout(200);
  t.assert((await output(page)) === expected, 'the PDF preset button did not restore its settings');

  await toggle(page, '빈 줄 문단 유지');
  const mergedParagraphs = await output(page);
  t.assert(
    mergedParagraphs === `${SENTENCE}\n- 첫 번째 항목\n- 두 번째 항목`,
    `paragraph preservation off: ${JSON.stringify(mergedParagraphs)}`,
  );
  await toggle(page, '빈 줄 문단 유지');

  await toggle(page, '목록 항목은 줄 유지');
  const mergedLists = await output(page);
  t.assert(
    mergedLists === `${SENTENCE}\n\n- 첫 번째 항목 - 두 번째 항목`,
    `list preservation off: ${JSON.stringify(mergedLists)}`,
  );
  await toggle(page, '목록 항목은 줄 유지');

  await page.getByRole('button', { name: '한 줄로 만들기' }).click();
  t.assert(
    (await output(page)) === `${SENTENCE} - 첫 번째 항목 - 두 번째 항목`,
    'the single-line preset did not merge everything',
  );

  await page.getByRole('button', { name: 'PDF 복사 정리' }).click();
  await input.fill('well-\nKnown and infor-\nmation');
  await page.waitForTimeout(200);
  t.assert((await output(page)) === 'well- Known and information', `hyphen joining: ${await output(page)}`);
  await toggle(page, '나뉜 영어 단어 붙이기');
  t.assert((await output(page)) === 'well- Known and infor- mation', `hyphen joining off: ${await output(page)}`);
  await toggle(page, '나뉜 영어 단어 붙이기');

  await input.fill('  앞뒤 공백  \n  두 번째 줄  ');
  await page.waitForTimeout(200);
  t.assert(
    (await output(page)) === '앞뒤 공백 두 번째 줄',
    `whitespace trimming: ${JSON.stringify(await output(page))}`,
  );
  await toggle(page, '각 줄 앞뒤 공백 정리');
  t.assert(
    (await output(page)) === ' 앞뒤 공백 두 번째 줄 ',
    `turning trimming off still collapsed the line edges: ${JSON.stringify(await output(page))}`,
  );
  await toggle(page, '각 줄 앞뒤 공백 정리');

  await input.fill('두 칸   띄운   문장\n다음 줄');
  await page.waitForTimeout(200);
  t.assert(
    (await output(page)) === '두 칸 띄운 문장 다음 줄',
    `space collapsing: ${JSON.stringify(await output(page))}`,
  );
  await toggle(page, '연속 공백 하나로');
  t.assert(
    (await output(page)) === '두 칸   띄운   문장 다음 줄',
    `turning space collapsing off still collapsed it: ${JSON.stringify(await output(page))}`,
  );
  await toggle(page, '연속 공백 하나로');

  // ── 5. A byte-order mark from a CSV/PDF copy does not reach the result.
  await input.fill('\uFEFF국민연금은 4.75%입니다.\n다음 줄입니다.');
  await page.waitForTimeout(200);
  t.assert(!(await output(page)).includes('\uFEFF'), 'the byte-order mark survived into the result');
  t.assert(
    (await output(page)).startsWith('국민연금은'),
    `first word after a BOM: ${(await output(page)).slice(0, 12)}`,
  );

  // ── 6. Copy: the button, and Ctrl+Shift+C from outside the fields.
  await input.fill(PDF_TEXT);
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: '결과 복사' }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === expected, `the copied text is not the result: ${JSON.stringify(copied)}`);
  await page.getByRole('heading', { name: '줄바꿈 없애기', level: 1 }).click();
  await page.evaluate(() => navigator.clipboard.writeText('cleared'));
  await page.keyboard.press('Control+Shift+KeyC');
  await page.waitForTimeout(300);
  t.assert(
    (await page.evaluate(() => navigator.clipboard.readText())) === expected,
    'Ctrl+Shift+C outside the fields did not copy the result',
  );

  // ── 7. Empty input: nothing to copy, nothing counted.
  await page.getByRole('button', { name: '지우기' }).click();
  await page.waitForTimeout(200);
  t.assert((await output(page)) === '', `the result stayed after clearing: ${JSON.stringify(await output(page))}`);
  t.assert(await page.getByRole('button', { name: '결과 복사' }).isDisabled(), 'copy is enabled with no result');
  t.assert((await stats(page))['찾은 줄바꿈'] === '0', 'the counters did not reset');

  // ── 8. A reload keeps the text and the settings.
  await input.fill('첫 줄\n둘째 줄');
  await page.getByRole('radio', { name: '아무것도 없음' }).click();
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(400);
  t.assert(
    (await input.inputValue()) === '첫 줄\n둘째 줄',
    `reload lost the text: ${JSON.stringify(await input.inputValue())}`,
  );
  t.assert((await output(page)) === '첫 줄둘째 줄', `reload lost the mode: ${JSON.stringify(await output(page))}`);

  // ── 9. 375px: no sideways page scroll, and the input and result are both usable.
  await page.setViewportSize({ width: 375, height: 812 });
  await t.open('/ko/remove-line-breaks');
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const inputBox = await input.boundingBox();
  t.assert(inputBox && inputBox.width > 300, `the input is ${inputBox?.width}px wide at 375px`);
  const spaceOption = page.getByRole('radio', { name: '공백' });
  await spaceOption.scrollIntoViewIfNeeded();
  const optionBox = await spaceOption.boundingBox();
  t.assert(optionBox && optionBox.width > 20 && optionBox.height > 20, 'the separator options are unusable at 375px');
}

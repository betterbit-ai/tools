/**
 * Regex tester: the patterns a developer actually pastes into it, the flags, captures, replacement
 * preview and index numbers, all read from what the page shows.
 *
 * Covers the defect this audit fixed: a pattern with nested repetition, such as (a+)+$, ran on the
 * page itself and froze every script on the tab — the page could not be typed in again. The check
 * now runs in a worker and stops after 1.5 s with a message.
 */

const RAF = { timeout: 15_000 };

async function stat(page, label) {
  return page.evaluate((wanted) => {
    for (const element of document.querySelectorAll('main div')) {
      if (element.children.length !== 2) continue;
      const [value, name] = [element.children[0], element.children[1]];
      if (name.textContent?.trim() !== wanted || name.children.length !== 0) continue;
      if (value.children.length !== 0) continue;
      return value.textContent?.trim() ?? null;
    }
    return null;
  }, label);
}

async function alerts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert]')].map((element) => element.textContent?.trim() ?? ''),
  );
}

const count = async (page) => Number(String(await stat(page, '매치')).replace(/[^\d]/g, ''));

/** Typing settles for 80 ms, then the background check answers; give it room before reading. */
const SETTLE_MS = 700;

async function setPattern(page, pattern) {
  await page.locator('main input[type=text]').first().fill(pattern);
  await page.waitForTimeout(SETTLE_MS);
}

async function setText(page, text) {
  await page.locator('main textarea').first().fill(text);
  await page.waitForTimeout(SETTLE_MS);
}

async function flag(page, label, on) {
  const state = await page.evaluate((wanted) => {
    for (const input of document.querySelectorAll('main input[type=checkbox]')) {
      if (input.closest('label')?.textContent?.trim() === wanted) return input.checked;
    }
    return null;
  }, label);
  if (state !== on) {
    await page.getByText(label, { exact: true }).click();
    await page.waitForTimeout(200);
  }
}

/** The match rows: each shows its captures and named groups as text. */
async function matchRows(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main ol.max-h-96 > li')].map((item) => item.innerText.replace(/\n+/g, ' | ')),
  );
}

export default async function (t) {
  const page = t.page;
  await t.open('/ko/regex-tester');
  const pattern = page.locator('main input[type=text]').first();
  const text = page.locator('main textarea').first();

  // ── 1. The sample pattern works on the sample text.
  await page.waitForTimeout(400);
  t.assert((await count(page)) === 13, `default example matches: ${await count(page)}`);
  const rows = await matchRows(page);
  t.assert(rows.length === 13, `match details listed: ${rows.length}`);
  t.assert(/word: Regex/.test(rows[0]), `the named group is not shown: ${rows[0]}`);
  t.assert(/인덱스 0–5/.test(rows[0]), `the first match index is not 0–5: ${rows[0]}`);

  // ── 2. Flags: i makes a case-insensitive match, y anchors at the last index.
  await setPattern(page, 'hello');
  await setText(page, 'Hello hello HELLO');
  t.assert((await count(page)) === 1, `case-sensitive hello: ${await count(page)}`);
  await flag(page, 'i 대소문자 무시', true);
  t.assert((await count(page)) === 3, `case-insensitive hello: ${await count(page)}`);
  await flag(page, 'i 대소문자 무시', false);

  await setPattern(page, 'a');
  await setText(page, 'baab');
  t.assert((await count(page)) === 2, `a without y: ${await count(page)}`);
  await flag(page, 'y sticky', true);
  t.assert((await count(page)) === 0, `sticky a on "baab" should not match at index 0: ${await count(page)}`);
  await flag(page, 'y sticky', false);

  // ── 3. Captures, named groups and the UTF-16 index a developer copies into code.
  await setPattern(page, '(\\d{4})-(\\d{2})-(\\d{2})');
  await setText(page, '2026-11-22 그리고 2025-01-05');
  t.assert((await count(page)) === 2, `date matches: ${await count(page)}`);
  const dateRows = await matchRows(page);
  t.assert(/\$1: 2026/.test(dateRows[0]) && /\$3: 22/.test(dateRows[0]), `captures: ${dateRows[0]}`);
  t.assert(/인덱스 0–10/.test(dateRows[0]), `date index: ${dateRows[0]}`);

  await setPattern(page, '😀');
  await setText(page, '😀a😀');
  const emojiRows = await matchRows(page);
  t.assert((await count(page)) === 2, `emoji matches: ${await count(page)}`);
  t.assert(/인덱스 0–2/.test(emojiRows[0]), `an emoji should be two UTF-16 units wide: ${emojiRows[0]}`);
  t.assert(/인덱스 3–5/.test(emojiRows[1]), `second emoji index: ${emojiRows[1]}`);

  await setPattern(page, '(?<year>\\d{4})');
  await setText(page, '2026년');
  t.assert((await count(page)) === 1, `named group match: ${await count(page)}`);
  t.assert(/year: 2026/.test((await matchRows(page))[0]), 'the named group value is not shown');

  // ── 4. Replacement preview follows the same JavaScript rules and can be copied.
  await setPattern(page, '(\\d+)');
  await setText(page, '주문 42번, 7개');
  await page.getByLabel(/치환 문자열/).fill('[$1]');
  await page.waitForTimeout(300);
  const preview = await page.evaluate(() => {
    const blocks = [...document.querySelectorAll('main pre')];
    // The highlight block and the replacement preview both hold the text; the preview is last.
    return blocks
      .map((block) => block.innerText)
      .filter((value) => value.includes('주문'))
      .pop();
  });
  t.assert(preview === '주문 [42]번, [7]개', `replacement preview: ${JSON.stringify(preview)}`);
  await page.getByRole('button', { name: '복사', exact: true }).last().click();
  t.assert(
    (await page.evaluate(() => navigator.clipboard.readText())) === '주문 [42]번, [7]개',
    'the replacement preview did not copy',
  );

  // Without g only the first match is replaced, as in JavaScript.
  await flag(page, 'g 전체 검색', false);
  await page.waitForTimeout(300);
  const single = await page.evaluate(() => {
    const blocks = [...document.querySelectorAll('main pre')];
    // The highlight block and the replacement preview both hold the text; the preview is last.
    return blocks
      .map((block) => block.innerText)
      .filter((value) => value.includes('주문'))
      .pop();
  });
  t.assert(
    single === '주문 [42]번, 7개',
    `without g the preview replaced more than the first match: ${JSON.stringify(single)}`,
  );
  await flag(page, 'g 전체 검색', true);

  // ── 5. An invalid pattern is reported, and nothing else claims a result.
  await setPattern(page, '(');
  await page.waitForTimeout(300);
  t.assert(
    (await alerts(page)).some((alert) => /패턴 오류/.test(alert)),
    'an invalid pattern is not reported',
  );
  t.assert((await count(page)) === 0, `an invalid pattern still reported ${await count(page)} matches`);

  // ── 6. The 1,000-match cap says so instead of pretending the list is complete.
  await setPattern(page, '\\d');
  await setText(page, '1'.repeat(1_500));
  await page.waitForTimeout(600);
  t.assert((await count(page)) === 1_000, `capped match count: ${await count(page)}`);
  t.assert((await page.getByText(/처음 1,000개 매치만/).count()) >= 1, 'the 1,000-match cap is not explained');

  // ── 7. A catastrophic pattern stops instead of freezing the tab.
  await setPattern(page, '(a+)+$');
  const started = Date.now();
  await setText(page, 'a'.repeat(30) + '!');
  await page.waitForTimeout(2_100);
  const stopped = Date.now();
  t.assert(
    (await alerts(page)).some((alert) => /1\.5초 안에 끝나지 않아/.test(alert)),
    `no stop notice for a catastrophic pattern: ${JSON.stringify(await alerts(page))}`,
  );
  t.assert(
    (await stat(page, '매치')) === '—',
    `the match count still shows ${await stat(page, '매치')} for a stopped check`,
  );
  t.assert(stopped - started < 6_000, `stopping took ${stopped - started} ms`);
  // The page is still usable: a new pattern and text produce a result right away.
  await setPattern(page, 'a+');
  await setText(page, 'aaa bbb aa');
  await page.waitForTimeout(400);
  t.assert((await count(page)) === 2, `after the stop a plain pattern returned ${await count(page)} matches`);

  // ── 8. An empty pattern asks for one instead of reporting zero matches.
  await setPattern(page, '');
  t.assert(
    (await page.getByText('패턴을 입력하면 실시간 매치를 보여줍니다.').count()) >= 1,
    'an empty pattern does not ask for one',
  );

  // ── 9. A reload keeps the pattern, flags and test text.
  await setPattern(page, '(?<n>\\d+)');
  await setText(page, '12 34');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(600);
  t.assert((await pattern.inputValue()) === '(?<n>\\d+)', `reload lost the pattern: ${await pattern.inputValue()}`);
  t.assert((await text.inputValue()) === '12 34', `reload lost the test text: ${await text.inputValue()}`);
  t.assert((await count(page)) === 2, `after reload the pattern matched ${await count(page)} times`);

  // ── 10. 375px: no sideways page scroll, pattern and test text both on screen.
  await page.setViewportSize({ width: 375, height: 812 });
  await t.open('/ko/regex-tester');
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const patternBox = await pattern.boundingBox();
  t.assert(patternBox && patternBox.width > 150, `the pattern field is ${patternBox?.width}px wide at 375px`);
  // The saved pattern and text come back on the phone-width page too.
  t.assert((await count(page)) === 2, `the 375px page does not show the saved result: ${await count(page)}`);
  void RAF;
}

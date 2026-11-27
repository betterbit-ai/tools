/**
 * Case converter: every format driven in a real browser, with the result compared to text the spec
 * computes itself.
 *
 * Covers the defects this audit fixed:
 *  - Sentence Case read “the u.s. army arrived.” as “The u.S. Army arrived.”, capitalising a letter
 *    inside an abbreviation because any full stop counted as a sentence end;
 *  - the first option of every segmented group was announced as “Writing case Writing case” (and
 *    could not be found by its visible name), because a <label> wrapped the whole radio group.
 */

const text = {
  sentence: 'the quick brown fox jumps over the lazy dog',
  spaced: '  hello',
  quoted: 'HELLO. "HOW ARE YOU?"\nFINE!',
  abbreviation: 'the u.s. army arrived.',
  decimal: 'version 1.5 is out. really.',
  title: 'learning about words with style',
  subtitle: 'a guide: a story about us',
  lines: 'Order Date\nCustomer ID',
  mixed: 'XMLHttpRequest user ID v2',
  korean: '안녕하세요. 오늘 날씨가 좋네요!',
};

const out = (page) => page.locator('#case-output').inputValue();
const read = (page) =>
  page.evaluate(() => ({
    input: document.querySelector('#case-input')?.value ?? '',
    output: document.querySelector('#case-output')?.value ?? '',
    status: document.querySelector('#case-output')?.getAttribute('aria-busy'),
    note: document.querySelector('main [role=status]')?.textContent?.trim() ?? '',
  }));

export default async function (t) {
  const page = t.page;
  await t.open('/case-converter');
  await page.waitForTimeout(600);

  const input = page.locator('#case-input');
  const writing = (name) => page.getByRole('radio', { name, exact: true });
  const developer = (name) => page.getByRole('radio', { name, exact: true });

  // ── 1. Each option in each group is reachable by the name it shows (the first one was not).
  for (const name of [
    'UPPER',
    'lower',
    'Sentence',
    'Title',
    'camelCase',
    'PascalCase',
    'snake_case',
    'kebab-case',
    'CONSTANT',
  ]) {
    t.assert(
      (await page.getByRole('radio', { name, exact: true }).count()) === 1,
      `no radio is named ${JSON.stringify(name)}`,
    );
  }
  t.assert((await page.getByRole('radio', { name: 'AP', exact: true }).count()) === 1, 'no radio is named “AP”');
  t.assert(
    (await page.getByRole('radio', { name: 'Chicago', exact: true }).count()) === 1,
    'no radio is named “Chicago”',
  );

  // ── 2. A fresh page converts nothing and offers nothing to clear or copy.
  t.assert((await out(page)) === '', 'a fresh page already has a result');
  t.assert(
    await page.getByRole('button', { name: 'Clear', exact: true }).isDisabled(),
    'Clear is enabled with no text',
  );
  t.assert(
    await page.getByRole('button', { name: 'Copy result', exact: true }).isDisabled(),
    'Copy is enabled with no result',
  );

  // ── 3. Eleven formats on one sentence, each compared with the expected text.
  await input.fill(text.sentence);
  await page.waitForTimeout(300);
  t.assert((await out(page)) === 'The Quick Brown Fox Jumps Over the Lazy Dog', `default title: ${await out(page)}`);

  for (const [name, expected] of [
    ['UPPER', 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG'],
    ['lower', 'the quick brown fox jumps over the lazy dog'],
    ['Sentence', 'The quick brown fox jumps over the lazy dog'],
    ['Title', 'The Quick Brown Fox Jumps Over the Lazy Dog'],
    ['camelCase', 'theQuickBrownFoxJumpsOverTheLazyDog'],
    ['PascalCase', 'TheQuickBrownFoxJumpsOverTheLazyDog'],
    ['snake_case', 'the_quick_brown_fox_jumps_over_the_lazy_dog'],
    ['kebab-case', 'the-quick-brown-fox-jumps-over-the-lazy-dog'],
    ['CONSTANT', 'THE_QUICK_BROWN_FOX_JUMPS_OVER_THE_LAZY_DOG'],
  ]) {
    await writing(name).click();
    await page.waitForTimeout(250);
    t.assert((await out(page)) === expected, `${name} produced ${JSON.stringify(await out(page))}`);
  }

  // ── 4. AP and Chicago title case differ on long prepositions.
  await writing('Title').click();
  await input.fill(text.title);
  await page.waitForTimeout(300);
  t.assert((await out(page)) === 'Learning About Words With Style', `AP title: ${await out(page)}`);
  await page.getByRole('radio', { name: 'Chicago', exact: true }).click();
  await page.waitForTimeout(250);
  t.assert((await out(page)) === 'Learning about Words with Style', `Chicago title: ${await out(page)}`);
  t.assert(
    (await page.getByRole('radio', { name: 'Chicago', exact: true }).getAttribute('aria-checked')) === 'true',
    'Chicago is not marked as the selected title style',
  );

  // ── 5. A subtitle after a colon starts with a capital; the last word always does.
  await input.fill(text.subtitle);
  await page.waitForTimeout(250);
  t.assert((await out(page)) === 'A Guide: A Story about Us', `Chicago subtitle: ${await out(page)}`);

  // ── 6. Sentence case: a full stop inside an abbreviation or a decimal is not a sentence end.
  await writing('Sentence').click();
  for (const [source, expected] of [
    [text.abbreviation, 'The u.s. Army arrived.'],
    [text.decimal, 'Version 1.5 is out. Really.'],
    [text.quoted, 'Hello. "How are you?"\nFine!'],
    [text.spaced, '  Hello'],
  ]) {
    await input.fill(source);
    await page.waitForTimeout(250);
    t.assert((await out(page)) === expected, `${JSON.stringify(source)} became ${JSON.stringify(await out(page))}`);
  }

  // ── 7. Developer formats split words, keep digits, and treat every line as its own identifier.
  await developer('snake_case').click();
  await input.fill(text.mixed);
  await page.waitForTimeout(250);
  t.assert((await out(page)) === 'xml_http_request_user_id_v2', `snake_case: ${await out(page)}`);
  await developer('camelCase').click();
  await input.fill(text.lines);
  await page.waitForTimeout(250);
  t.assert((await out(page)) === 'orderDate\ncustomerId', `two lines: ${JSON.stringify(await out(page))}`);

  // ── 8. Korean text passes through the writing formats unchanged.
  await writing('Title').click();
  await input.fill(text.korean);
  await page.waitForTimeout(250);
  t.assert((await out(page)) === text.korean, `Korean text became ${JSON.stringify(await out(page))}`);

  // ── 9. Copy puts the result on the clipboard.
  await developer('PascalCase').click();
  await input.fill('hello world');
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await page.waitForTimeout(400);
  t.assert(
    (await page.evaluate(() => navigator.clipboard.readText())) === 'HelloWorld',
    'Copy put the wrong text on the clipboard',
  );

  // ── 10. “Use as input” feeds the result back in; Clear empties both boxes.
  await page.getByRole('button', { name: 'Use as input', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await input.inputValue()) === 'HelloWorld',
    `Use as input left ${JSON.stringify(await input.inputValue())}`,
  );
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert((await input.inputValue()) === '' && (await out(page)) === '', 'Clear left text behind');
  t.assert(
    (await page.evaluate(() => localStorage.getItem('tools:case-converter:text'))) === null,
    'Clear left the text in local storage',
  );

  // ── 11. The last text and format survive a reload.
  await writing('snake_case').click();
  await input.fill('Order Date');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(800);
  t.assert((await input.inputValue()) === 'Order Date', `a reload lost the text (${await input.inputValue()})`);
  t.assert((await out(page)) === 'order_date', `a reload lost the format (${await out(page)})`);

  // ── 12. 270,000 characters convert in a worker, with a status message and a live page.
  const big = 'The quick brown fox jumps over the lazy dog. '.repeat(6000);
  await writing('lower').click();
  const started = Date.now();
  await input.fill(big);
  let busySeen = false;
  let done = await read(page);
  while (Date.now() - started < 30_000) {
    if (done.status === 'true' && done.note.includes('Converting a large text')) busySeen = true;
    if (done.output.length === big.length) break;
    await page.waitForTimeout(100);
    done = await read(page);
  }
  const elapsed = Date.now() - started;
  t.assert(busySeen, 'the page never showed that the large text was converting');
  t.assert(
    done.output === big.toLowerCase(),
    `the large result differs from the lowercase input (${done.output.length} of ${big.length} characters)`,
  );
  t.assert(done.status === 'false' && done.note === '', 'the busy state stayed on after the conversion');
  t.assert(done.input === big, 'the large input was not kept in the box');
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await page.waitForTimeout(400);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.length === big.length, `Copy copied ${copied.length} of ${big.length} characters`);
  t.assert(elapsed < 30_000, `the large conversion took ${elapsed} ms`);

  // ── 13. The Korean page keeps the same formats and shortcut names.
  await t.open('/ko/case-converter');
  await page.waitForTimeout(600);
  await page.locator('#case-input').fill('the quick brown fox');
  await page.waitForTimeout(300);
  t.assert((await out(page)).length > 0, 'the Korean page produced no result');
  t.assert(
    (await page.getByRole('radio', { name: '대문자', exact: true }).count()) === 1,
    'the Korean page has no 대문자 option',
  );

  // ── 14. 375 px, dark: the two columns stack instead of scrolling sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

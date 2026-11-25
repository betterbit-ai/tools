/**
 * JSON formatter: the everyday job — paste a document (or open a file), read it formatted, switch
 * indents, minify, sort keys, copy or download the result, and see exactly where broken JSON fails.
 *
 * Expected output is built here with JSON.stringify from the same input the page receives, so an
 * assertion failure means the page's output differs from what the standard library produces.
 */

const SAMPLE = JSON.stringify(
  {
    order: 'A-1042',
    customer: { name: '김하늘', emoji: '🎉', note: '한국어 · 日本語 · emoji' },
    items: [
      { sku: 'BB-1', qty: 2 },
      { sku: 'BB-2', qty: 1 },
    ],
    paid: false,
    total: 12500.5,
    tags: null,
  },
  null,
  0,
);

/** Sorted copy computed here: object keys ordinal, arrays untouched. */
function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortDeep(value[key])]),
    );
  }
  return value;
}

export default async function (t) {
  const page = t.page;
  await t.open('/json-formatter');
  await page.waitForSelector('#json-input', { timeout: 15_000 });

  const area = page.locator('#json-input');
  const output = page.locator('main pre');
  const shownText = async () => (await output.innerText()).replace(/\u00a0/g, ' ');
  const put = async (value) => {
    await area.fill(value);
    await page.waitForTimeout(200);
  };

  // ── 1. The example is formatted with two spaces on arrival.
  const initial = await shownText();
  t.assert(initial.split('\n').length > 3, `the example did not arrive formatted: ${initial.slice(0, 120)}`);
  t.assert(/^ {2}"/.test(initial.split('\n')[1] ?? ''), 'the default indent is not two spaces');

  // ── 2. A real document (Korean, emoji, CJK, null, float) is preserved exactly.
  await put(SAMPLE);
  t.assert((await shownText()) === JSON.stringify(JSON.parse(SAMPLE), null, 2), 'two-space formatting differs');
  t.assert((await shownText()).includes('🎉'), 'the emoji was dropped');
  t.assert((await shownText()).includes('한국어'), 'the Korean text was dropped');
  t.assert(/Valid JSON|올바른 JSON/.test(await page.locator('main').innerText()), 'valid input is not confirmed');

  // ── 3. Every indent control changes the text.
  await page.getByRole('radio', { name: /^4 spaces$|^4칸$/ }).click();
  await page.waitForTimeout(150);
  t.assert((await shownText()) === JSON.stringify(JSON.parse(SAMPLE), null, 4), 'four-space formatting differs');
  await page.getByRole('radio', { name: /^Tab$|^탭$/ }).click();
  await page.waitForTimeout(150);
  t.assert((await shownText()) === JSON.stringify(JSON.parse(SAMPLE), null, '\t'), 'tab formatting differs');
  await page.getByRole('radio', { name: /^2 spaces$|^2칸$/ }).click();
  await page.waitForTimeout(150);
  t.assert((await shownText()) === JSON.stringify(JSON.parse(SAMPLE), null, 2), 'returning to two spaces differs');

  // ── 4. Minified view and its byte/character statistics.
  await page.getByRole('radio', { name: /^Minified$|^최소화$/ }).click();
  await page.waitForTimeout(150);
  t.assert((await shownText()) === JSON.stringify(JSON.parse(SAMPLE)), 'the minified output differs');

  // ── 5. Sorting orders object keys and leaves arrays alone.
  await page.getByRole('radio', { name: /^Formatted$|^정렬$/ }).click();
  await page.getByText('Sort keys A–Z', { exact: true }).click();
  await page.waitForTimeout(200);
  t.assert(
    (await shownText()) === JSON.stringify(sortDeep(JSON.parse(SAMPLE)), null, 2),
    'sorting reordered the wrong things',
  );
  const sorted = await shownText();
  t.assert(sorted.indexOf('"customer"') < sorted.indexOf('"items"'), 'sorting did not order object keys');
  t.assert(sorted.indexOf('"BB-1"') < sorted.indexOf('"BB-2"'), 'sorting reordered array items');

  // ── 6. Invalid JSON is located exactly, and "jump" selects the offending character.
  const broken = '{\n  "a": 1,\n  "b": [1, 2,]\n}';
  await put(broken);
  let panel = await page.locator('main').innerText();
  t.assert(/line 3|3행|3번째 줄/i.test(panel), `the line of the error is not reported: ${panel.slice(0, 400)}`);
  const commaIndex = broken.indexOf(']');
  const expectedColumn = commaIndex - broken.lastIndexOf('\n', commaIndex);
  t.assert(
    panel.includes(`Line 3, column ${expectedColumn}`),
    `the error position is not line 3, column ${expectedColumn}: ${panel.slice(0, 400)}`,
  );
  await page.getByRole('button', { name: /Jump to error|오류 위치로/ }).click();
  await page.waitForTimeout(150);
  const selection = await page.evaluate(() => {
    const element = document.querySelector('#json-input');
    return {
      start: element.selectionStart,
      text: element.value.slice(element.selectionStart, element.selectionEnd + 1),
    };
  });
  t.assert(selection.start === broken.indexOf(']'), `jump selected index ${selection.start}, not the comma`);

  // ── 7. A 1 MB document is formatted completely, and says when storage cannot keep it.
  await page.waitForTimeout(350);
  const rows = [];
  for (let index = 0; index < 16000; index++) {
    rows.push({ id: index, label: `항목-${index}`, active: index % 2 === 0, score: index / 7 });
  }
  const big = JSON.stringify({ generated: 'e2e', rows });
  t.assert(big.length > 1_000_000, `the large document is only ${big.length} characters`);
  const startedAt = Date.now();
  await put(big);
  const parseMs = Date.now() - startedAt;
  const bigOut = await shownText();
  t.assert(bigOut.length > 1_000_000, `the large document was truncated to ${bigOut.length} characters`);
  t.assert(bigOut.startsWith('{\n  "generated": "e2e"'), 'the large document was not formatted from the start');
  t.assert(parseMs < 8_000, `formatting 1 MB took ${parseMs} ms`);
  const stats = await page.locator('main').innerText();
  const bytes = await page.evaluate((text) => new TextEncoder().encode(text).length, big);
  t.assert(stats.includes(bytes.toLocaleString('en-US')), `the byte count is not ${bytes.toLocaleString('en-US')}`);
  const savedClaim = await page.locator('main').innerText();
  t.assert(
    /Saved in this browser only|이 브라우저에만 저장/.test(savedClaim) || /not saved|저장하지 못/.test(savedClaim),
    `the page neither saved the draft nor said it could not: ${savedClaim.match(/[^.]*(saved|저장)[^.]*/i)?.[0]}`,
  );

  // ── 8. A paste that browsers cannot store says so instead of claiming it was saved.
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function blocked(key, value) {
      if (String(key).includes('json-formatter')) throw new DOMException('quota', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await put('{ "fresh": true }');
  await page.waitForTimeout(500);
  const honesty = await page.locator('main').innerText();
  t.assert(
    !/Saved in this browser only/.test(honesty) || /not saved|저장하지 못/.test(honesty),
    'the page claimed a draft was saved while storage was refusing it',
  );

  // ── 9. A 19-digit number is not silently changed into a different value.
  await put('{"snowflake_id": 12345678901234567890, "small": 42}');
  const precision = await page.locator('main').innerText();
  t.assert(
    /precision|정밀|19|rounded|반올림/i.test(precision),
    `the rounded big integer is presented as exact: ${precision.slice(0, 500)}`,
  );

  // ── 10. Copy and download hand over exactly what is on screen.
  await page.getByText('Sort keys A–Z', { exact: true }).click();
  await page.waitForTimeout(200);
  await put(SAMPLE);
  await page
    .getByRole('button', { name: /^Copy$|^복사$/ })
    .first()
    .click();
  await page.waitForTimeout(150);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === JSON.stringify(JSON.parse(SAMPLE), null, 2), 'the copied text differs from the output');
  const download = await t.download(() =>
    page.getByRole('button', { name: /Download \.json|\.json 다운로드/ }).click(),
  );
  t.assert(download.name === 'formatted.json', `download name: ${download.name}`);
  t.assert(download.bytes.toString('utf8') === copied, 'the downloaded file differs from the output');

  // ── 11. Opening a .json file formats it.
  const file = { name: 'settings.json', mimeType: 'application/json', buffer: Buffer.from('{"a":1,"b":[true,null]}') };
  await page.setInputFiles('input[type=file]', file);
  await page.waitForTimeout(400);
  t.assert(
    (await shownText()).includes('"a": 1'),
    `the dropped file was not formatted: ${(await shownText()).slice(0, 120)}`,
  );

  // ── 12. The Korean page reads Korean and formats the same.
  await t.open('/ko/json-formatter');
  await page.waitForSelector('#json-input', { timeout: 15_000 });
  await page.locator('#json-input').fill('{"한글":"값","emoji":"🎉"}');
  await page.waitForTimeout(200);
  const koOut = await page.locator('main pre').innerText();
  t.assert(koOut.includes('"한글": "값"'), `the Korean page output: ${koOut}`);
  const seo = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
    alternates: [...document.querySelectorAll('link[rel=alternate]')].map((node) => node.getAttribute('href')),
  }));
  t.assert(seo.h1 === 1, `h1 count: ${seo.h1}`);
  t.assert(seo.canonical === 'https://betterbit.org/ko/json-formatter', `canonical: ${seo.canonical}`);
  t.assert(
    seo.alternates.includes('https://betterbit.org/json-formatter'),
    `hreflang pair: ${JSON.stringify(seo.alternates)}`,
  );

  // ── 13. 375 px in dark mode: no sideways scroll.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  t.assert(overflow <= 1, `the page scrolls sideways by ${overflow}px at 375px`);

  t.assert(t.errors.page.length === 0, `page errors: ${t.errors.page.join(' | ')}`);
}

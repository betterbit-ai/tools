/**
 * YAML ↔ JSON: both directions in a real browser, including the details that quietly corrupt
 * config files — date text, merge keys, multi-document streams and integers above 2^53.
 */

const input = (page) => page.locator('#yaml-json-input');
const out = async (page) => {
  const value = await page.locator('#yaml-json-output').inputValue();
  return value;
};

export default async function (t) {
  const page = t.page;
  await t.open('/yaml-json');
  await page.waitForTimeout(900);

  // ── 1. The default sample is already converted, with the date kept as text.
  let result = await out(page);
  t.assert(result.includes('"release": "2026-03-01"'), `date was not kept as written: ${result}`);
  t.assert(!result.includes('T00:00:00'), 'the date turned into an ISO timestamp');
  t.assert(result.includes('"minVersion": "1.3"'), 'a quoted version string lost its quotes');

  // ── 2. A comment is reported, because JSON cannot keep it.
  t.assert(/comment/i.test(await page.locator('main').innerText()), 'the dropped comment was not reported');

  // ── 3. Multi-document YAML becomes one JSON array, and merge keys resolve.
  await input(page).fill(
    ['base: &b', '  image: nginx', '  port: 80', 'web:', '  <<: *b', '  port: 8080', '---', 'kind: Service'].join('\n'),
  );
  await page.waitForTimeout(500);
  result = await out(page);
  t.assert(result.startsWith('['), `documents were not written as an array: ${result.slice(0, 40)}`);
  t.assert(result.includes('"port": 8080'), 'the merge key did not apply');
  t.assert(result.includes('"kind": "Service"'), 'the second document is missing');

  // ── 4. An integer above 2^53 is flagged instead of silently losing digits.
  await input(page).fill('id: 9007199254740993\n');
  await page.waitForTimeout(500);
  const mainText = await page.locator('main').innerText();
  t.assert(/2\^53/.test(mainText), 'the unsafe integer was not reported');

  // ── 5. A real YAML mistake is reported with its line.
  await input(page).fill('a: 1\n  b: 2\n');
  await page.waitForTimeout(500);
  t.assert(/Line 2/.test(await page.locator('main').innerText()), 'the YAML error did not name line 2');

  // ── 6. JSON → YAML keeps types by quoting strings that look like other types.
  await page.getByRole('radio', { name: 'JSON → YAML', exact: true }).click();
  await input(page).fill('{"name":"api","debug":"true","count":3,"port":"8080"}');
  await page.waitForTimeout(500);
  result = await out(page);
  t.assert(result.includes('name: api'), `block YAML missing: ${result}`);
  t.assert(/debug: 'true'/.test(result), `the string "true" was not quoted: ${result}`);
  t.assert(/port: '8080'/.test(result), `the string "8080" was not quoted: ${result}`);
  t.assert(/count: 3/.test(result), `a number was quoted: ${result}`);

  // ── 7. Key sorting produces a stable order.
  const sortToggle = page.getByText('Sort keys alphabetically', { exact: false });
  await sortToggle.click();
  await input(page).fill('{"z":1,"a":{"d":4,"c":3}}');
  await page.waitForTimeout(500);
  result = await out(page);
  t.assert(result.indexOf('a:') < result.indexOf('z:'), `keys were not sorted: ${result}`);

  // ── 8. Broken JSON names the line.
  await input(page).fill('{\n  "a": 1,\n  "b": ,\n}');
  await page.waitForTimeout(500);
  t.assert(/Line 3/.test(await page.locator('main').innerText()), 'the JSON error did not name line 3');

  // ── 9. Download offers the right file for the direction.
  await input(page).fill('{"a":1}');
  await page.waitForTimeout(500);
  const download = await t.download(() => page.getByRole('button', { name: 'Download', exact: true }).click());
  t.assert(download.name.endsWith('.yaml'), `download was named ${download.name}`);
  t.assert(download.size > 0, 'the downloaded file was empty');

  // ── 10. Copy puts the result on the clipboard.
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes('a: 1'), `Copy put ${JSON.stringify(copied)} on the clipboard`);

  // ── 11. Input, direction and options survive a reload.
  await input(page).fill('{"keep":"me"}');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1200);
  t.assert((await page.locator('#yaml-json-input').inputValue()) === '{"keep":"me"}', 'a reload lost the input');
  t.assert((await out(page)).includes('keep: me'), 'a reload lost the direction');

  // ── 12. The Korean page converts and speaks Korean.
  await t.open('/ko/yaml-json');
  await page.waitForTimeout(900);
  await page.getByRole('radio', { name: 'YAML → JSON', exact: true }).click();
  await page.locator('#yaml-json-input').fill('이름: 테스트\n목록:\n  - 가\n');
  await page.waitForTimeout(600);
  t.assert(
    (await page.locator('#yaml-json-output').inputValue()).includes('"이름": "테스트"'),
    'the Korean page did not convert',
  );
  t.assert(
    (await page.getByRole('radio', { name: 'JSON → YAML', exact: true }).count()) === 1,
    'the Korean page lost the direction control',
  );

  // ── 13. 375 px, dark: no sideways scrolling, no page errors.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

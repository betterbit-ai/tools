/**
 * SQL formatter: the layout, the dialect reading and the safety refusal, driven in a real browser.
 */

const input = (page) => page.locator('#sql-input');
const out = (page) => page.locator('#sql-output').inputValue();

export default async function (t) {
  const page = t.page;
  await t.open('/sql-formatter');
  await page.waitForTimeout(900);

  const radio = (name) => page.getByRole('radio', { name, exact: true });

  // ── 1. The sample is laid out by clause as soon as the page opens.
  let result = await out(page);
  t.assert(result.startsWith('SELECT'), `output did not start with SELECT: ${result.slice(0, 30)}`);
  t.assert(result.includes('\nFROM users u'), 'FROM was not put on its own line');
  t.assert(result.includes('\nWHERE u.active = TRUE'), 'WHERE was not put on its own line');
  t.assert(result.includes('\n  AND o.total > 100'), 'the AND condition was not indented');

  // ── 2. No click is needed: typing reformats.
  await input(page).fill('select a,b from t where a=1');
  await page.waitForTimeout(300);
  t.assert(
    (await out(page)) === 'SELECT\n  a,\n  b\nFROM t\nWHERE a = 1',
    `live format: ${JSON.stringify(await out(page))}`,
  );

  // ── 3. Keyword case and identifier case are separate.
  await radio('lower').click();
  await page.waitForTimeout(300);
  result = await out(page);
  t.assert(result.startsWith('select'), `lower case: ${result}`);
  t.assert(result.includes('from t'), 'the FROM keyword did not follow the chosen case');
  t.assert(!result.includes('FROM'), 'a keyword kept upper case in lower mode');
  await radio('UPPER').click();

  // ── 4. String literals and quoted names are never touched.
  await input(page).fill('select \'from where\' as "Order" from t -- note');
  await page.waitForTimeout(300);
  result = await out(page);
  t.assert(result.includes("'from where'"), `literal changed: ${result}`);
  t.assert(result.includes('"Order"'), `quoted name changed: ${result}`);
  t.assert(result.includes('-- note'), `comment dropped: ${result}`);

  // ── 5. The dialect decides how backticks are read.
  await page.getByLabel('Dialect').selectOption('mysql');
  await input(page).fill('select `order`, x from `db`.`t`');
  await page.waitForTimeout(300);
  t.assert((await out(page)).includes('`order`'), `backtick identifier: ${await out(page)}`);

  // ── 6. A subquery is indented and the outer clause resumes after it.
  await input(page).fill('select * from t where id in (select id from o where x = 1) and y = 2');
  await page.waitForTimeout(300);
  result = await out(page);
  t.assert(result.includes('WHERE id IN (\n  SELECT id'), `subquery: ${result}`);
  t.assert(result.includes(')\n  AND y = 2'), `clause after subquery: ${result}`);

  // ── 7. An unclosed string is refused and the original stays in place.
  await input(page).fill("select 'oops");
  await page.waitForTimeout(300);
  t.assert((await out(page)) === "select 'oops", `refusal changed the text: ${await out(page)}`);
  t.assert(/닫히지|never closed/.test(await page.locator('main').innerText()), 'no explanation of the refusal');

  // ── 8. Minify collapses the query to one line.
  await input(page).fill('select a, b\nfrom t\nwhere a = 1 and b = 2');
  await radio('Minify').click();
  await page.waitForTimeout(300);
  t.assert((await out(page)) === 'SELECT a,b FROM t WHERE a=1 AND b=2', `minify: ${await out(page)}`);

  // ── 9. Download names the file query.sql.
  const download = await t.download(() => page.getByRole('button', { name: 'Download .sql', exact: true }).click());
  t.assert(download.name === 'query.sql', `download was named ${download.name}`);
  t.assert(download.size > 0, 'the downloaded file was empty');

  // ── 10. Copy puts the result on the clipboard.
  await radio('Format').click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes('SELECT'), `clipboard held ${JSON.stringify(copied.slice(0, 20))}`);

  // ── 11. The query and options survive a reload.
  await input(page).fill('select keep from me');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(800);
  t.assert((await input(page).inputValue()) === 'select keep from me', 'a reload lost the query');
  t.assert((await out(page)).includes('\nFROM me'), 'a reload lost the options');

  // ── 12. The Korean page formats with Korean labels.
  await t.open('/ko/sql-formatter');
  await page.waitForTimeout(900);
  await page.locator('#sql-input').fill('select 이름 from 사용자 where 이름 = 1');
  await page.waitForTimeout(300);
  t.assert((await page.locator('#sql-output').inputValue()).includes('SELECT 이름'), 'the Korean page did not format');
  t.assert(
    (await page.getByRole('radio', { name: '압축', exact: true }).count()) === 1,
    'the Korean page lost the mode control',
  );

  // ── 13. 375 px, dark: no sideways scrolling, no page errors.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

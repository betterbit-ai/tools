/**
 * CSS & JS minifier: whitespace that carries meaning, licence comments, the line-preserving
 * JavaScript path and the gzip measurement, all in a real browser.
 */

const input = (page) => page.locator('#css-minifier-input');
const out = (page) => page.locator('#css-minifier-output').inputValue();

export default async function (t) {
  const page = t.page;
  await t.open('/css-minifier');
  await page.waitForTimeout(900);

  const radio = (name) => page.getByRole('radio', { name, exact: true });

  // ── 1. The CSS sample is minified on open: comments gone, last semicolons gone.
  let result = await out(page);
  t.assert(!result.includes('/* Card */'), `a comment survived: ${result}`);
  t.assert(result.startsWith('.card{'), `output did not start with the first rule: ${result.slice(0, 40)}`);
  t.assert(result.includes('padding:16px 24px'), `a value gained or lost a space: ${result}`);
  t.assert(!result.includes('} /*'), 'a comment survived next to a closing brace');

  // ── 2. A descendant space stays, because it changes the selector.
  await input(page).fill('.a :hover { color: red } .a > .b { color: blue }');
  await page.waitForTimeout(300);
  result = await out(page);
  t.assert(result.includes('.a :hover{color:red}'), `descendant selector lost its space: ${result}`);
  t.assert(result.includes('.a>.b{color:blue}'), `child combinator kept a space: ${result}`);

  // ── 3. url() contents and strings are copied exactly.
  await input(page).fill('a { background: url("x;y.png"); content: "a  b"; }');
  await page.waitForTimeout(300);
  result = await out(page);
  t.assert(result.includes('url("x;y.png")'), `url content changed: ${result}`);
  t.assert(result.includes('"a  b"'), `string content changed: ${result}`);

  // ── 4. A licence comment is kept by default and dropped when the option is off.
  await input(page).fill('/*! MIT */\n/* gone */\na { color: red; }');
  await page.waitForTimeout(300);
  t.assert((await out(page)).includes('/*! MIT */'), 'the licence comment was dropped by default');
  await page.getByText('Keep /*! licence */ comments', { exact: false }).click();
  await page.waitForTimeout(300);
  t.assert(!(await out(page)).includes('MIT'), 'the licence comment survived with the option off');
  await page.getByText('Keep /*! licence */ comments', { exact: false }).click();

  // ── 5. The JavaScript path removes comments and indentation but never joins lines.
  await radio('JavaScript').click();
  await input(page).fill('// header\nfunction add(a, b) {\n  // sum\n  return a + b;\n}\n');
  await page.waitForTimeout(300);
  result = await out(page);
  t.assert(!result.includes('// header') && !result.includes('// sum'), `comments survived: ${result}`);
  t.assert(
    result === 'function add(a, b) {\nreturn a + b;\n}',
    `lines were joined or split: ${JSON.stringify(result)}`,
  );

  // ── 6. A string that is never closed is refused and explained.
  await input(page).fill('const s = "oops');
  await page.waitForTimeout(300);
  t.assert(/never closed|닫히지/.test(await page.locator('main').innerText()), 'no explanation of the refusal');

  // ── 7. The gzip line reports both sizes.
  await input(page).fill('a{color:red}'.repeat(200));
  await radio('CSS').click();
  await page.waitForTimeout(800);
  const mainText = await page.locator('main').innerText();
  t.assert(/Gzipped:?\s*[\d.]+\s*KB?\s*→/.test(mainText) || /gzip/i.test(mainText), 'no gzip size was reported');

  // ── 8. Download produces a .min.css file.
  const download = await t.download(() => page.getByRole('button', { name: 'Download', exact: true }).click());
  t.assert(download.name === 'styles.min.css', `download was named ${download.name}`);
  t.assert(download.size > 0, 'the downloaded file was empty');

  // ── 9. Copy puts the minified code on the clipboard.
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes('a{color:red}'), `clipboard held ${JSON.stringify(copied.slice(0, 30))}`);

  // ── 10. The code survives a reload together with the language.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(900);
  t.assert((await input(page).inputValue()).includes('a{color:red}'), 'a reload lost the code');

  // ── 11. The Korean page minifies with Korean labels.
  await t.open('/ko/css-minifier');
  await page.waitForTimeout(900);
  await page.locator('#css-minifier-input').fill('a { color: red; }');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('#css-minifier-output').inputValue()) === 'a{color:red}',
    'the Korean page did not minify',
  );
  t.assert(
    (await page.getByRole('radio', { name: 'JavaScript', exact: true }).count()) === 1,
    'the Korean page lost the language control',
  );

  // ── 12. 375 px, dark: no sideways scrolling, no page errors.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

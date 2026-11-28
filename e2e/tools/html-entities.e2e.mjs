/**
 * HTML entities: encode and decode driven in a real browser, with the output compared to text
 * the spec computes itself. Also checks the things a converter is easy to get wrong:
 * one reference per code point for emoji, the legacy names without a semicolon, unknown names
 * reported instead of dropped, and the second pass over double-encoded text.
 */

const input = (page) => page.locator('#entities-input');
const out = (page) => page.locator('#entities-output').inputValue();

export default async function (t) {
  const page = t.page;
  await t.open('/html-entities');
  await page.waitForTimeout(700);

  const radio = (name) => page.getByRole('radio', { name, exact: true });

  // ── 1. A fresh page is usable at once: sample text, five-character encoding, named output.
  t.assert((await input(page).inputValue()).length > 0, 'the tool opened without any sample text');
  t.assert((await out(page)).includes('&amp;'), `default output: ${await out(page)}`);
  t.assert((await out(page)).includes('&quot;'), 'quotes were not escaped by default');
  t.assert((await out(page)).includes('é'), 'the minimal level escaped an accented letter');
  t.assert((await out(page)).includes('한글'), 'the minimal level escaped Korean text');
  t.assert((await out(page)).includes('😀'), 'the minimal level escaped an emoji');

  // ── 2. Non-ASCII + decimal writes one reference per code point (the emoji is not split).
  await radio('Non-ASCII too').click();
  await radio('Decimal').click();
  await page.waitForTimeout(200);
  let result = await out(page);
  t.assert(result.includes('&#233;'), `accented letter: ${result}`);
  t.assert(result.includes('&#54620;'), `Korean syllable: ${result}`);
  t.assert(result.includes('&#128512;'), `emoji was not written as one reference: ${result}`);
  t.assert(!result.includes('&#55357;'), 'the emoji was written as two half references');

  // ── 3. Hexadecimal output.
  await radio('Hex').click();
  await page.waitForTimeout(200);
  t.assert((await out(page)).includes('&#xE9;'), `hex output: ${await out(page)}`);

  // ── 4. Named output prefers HTML 4 names.
  await radio('Named').click();
  await input(page).fill('© ™ … é < > & " \'');
  await page.waitForTimeout(200);
  result = await out(page);
  for (const reference of ['&copy;', '&trade;', '&hellip;', '&eacute;', '&lt;', '&gt;', '&amp;', '&quot;']) {
    t.assert(result.includes(reference), `${reference} missing from ${result}`);
  }

  // ── 5. Line breaks can be written as references for single-line fields.
  // The checkbox itself is visually hidden inside its label, so click the label a user sees.
  const lineBreakToggle = page.getByText('Write line breaks as &#10;', { exact: false });
  await lineBreakToggle.click();
  await input(page).fill('a\nb');
  await page.waitForTimeout(200);
  t.assert((await out(page)) === 'a&#10;b', `line break: ${JSON.stringify(await out(page))}`);
  await lineBreakToggle.click();

  // ── 6. Decoding named, decimal, hex and multi-code-point names.
  await radio('Decode').click();
  await input(page).fill('&lt;b&gt; &copy; &#233; &#x1F600; &NotEqualTilde;');
  await page.waitForTimeout(250);
  result = await out(page);
  t.assert(result.startsWith('<b> © é 😀 '), `decoded text: ${JSON.stringify(result)}`);
  t.assert(
    [...result]
      .slice(-2)
      .map((c) => c.codePointAt(0))
      .join() === '8770,824',
    'multi-code-point name',
  );

  // ── 7. A legacy name needs no semicolon; an unknown name is kept and reported.
  await input(page).fill('&copy 2026 &bogus;');
  await page.waitForTimeout(250);
  result = await out(page);
  t.assert(result.startsWith('© 2026'), `legacy name: ${JSON.stringify(result)}`);
  t.assert(result.includes('&bogus;'), 'an unknown name was changed instead of being kept');
  const mainText = await page.locator('main').innerText();
  t.assert(/bogus/.test(mainText), 'the unknown name was not reported under the result');

  // ── 8. Double-encoded text offers a second pass, and the second pass finishes the job.
  await input(page).fill('&amp;lt;b&amp;gt;');
  await page.waitForTimeout(250);
  t.assert((await out(page)) === '&lt;b&gt;', `first pass: ${await out(page)}`);
  const again = page.getByRole('button', { name: 'Decode once more', exact: true });
  t.assert((await again.count()) > 0, 'no second-pass button for double-encoded text');
  await again.click();
  await page.waitForTimeout(300);
  t.assert((await out(page)) === '<b>', `second pass: ${await out(page)}`);

  // ── 9. An out-of-range number becomes the replacement character and is reported.
  await input(page).fill('&#x110000;');
  await page.waitForTimeout(250);
  t.assert((await out(page)) === '\ufffd', `out-of-range reference: ${JSON.stringify(await out(page))}`);
  t.assert(/1/.test(await page.locator('main').innerText()), 'no report of the invalid reference');

  // ── 10. Copy puts the result on the clipboard.
  await input(page).fill('Tom & Jerry');
  await radio('Encode').click();
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await page.evaluate(() => navigator.clipboard.readText())) === 'Tom &amp; Jerry',
    'Copy put the wrong text on the clipboard',
  );

  // ── 11. The text and the options survive a reload.
  await input(page).fill('a<b>');
  await radio('Non-ASCII too').click();
  await radio('Decimal').click();
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(700);
  t.assert((await input(page).inputValue()) === 'a<b>', `a reload lost the text (${await input(page).inputValue()})`);
  t.assert((await out(page)).includes('&#60;'), `a reload lost the options (${await out(page)})`);

  // ── 12. Clear empties the box and the saved text.
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.waitForTimeout(400);
  t.assert((await input(page).inputValue()) === '', 'Clear left text behind');
  t.assert(
    (await page.evaluate(() => localStorage.getItem('tools:html-entities:input'))) === null,
    'Clear left the text in local storage',
  );

  // ── 13. The Korean page runs the same tool with Korean labels.
  await t.open('/ko/html-entities');
  await page.waitForTimeout(700);
  t.assert((await page.getByRole('radio', { name: '인코딩', exact: true }).count()) === 1, 'no Korean Encode option');
  await page.getByRole('radio', { name: '이름', exact: true }).click();
  await page.locator('#entities-input').fill('<b>한글</b>');
  await page.waitForTimeout(250);
  t.assert(
    (await page.locator('#entities-output').inputValue()).includes('&lt;b&gt;'),
    'the Korean page did not encode',
  );

  // ── 14. 375 px, dark: no sideways scrolling, no page errors.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

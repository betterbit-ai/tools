/**
 * Invisible character: what someone does with it — pick one of the four characters, choose how many,
 * copy them, and check a piece of text to find the ones hiding in it.
 *
 * The copied string is read back from the clipboard and compared with the code point this spec
 * repeats itself, so a wrong character or a wrong count cannot pass.
 */

const CHARACTERS = [
  { id: 'hangul', name: /Hangul filler|한글 채움 문자/i, code: 'U+3164', char: '\u3164' },
  { id: 'braille', name: /Braille|점자/i, code: 'U+2800', char: '\u2800' },
  { id: 'zwsp', name: /Zero.width space|제로 폭|너비 없는/i, code: 'U+200B', char: '\u200B' },
  { id: 'wj', name: /Word joiner|워드 조이너/i, code: 'U+2060', char: '\u2060' },
];

export default async function (t) {
  const page = t.page;
  await t.open('/invisible-character');
  await page.waitForSelector('main textarea', { timeout: 15_000 });

  const countField = page.locator('main input[inputmode=numeric]').first();
  const panel = async () => (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  const copy = async () => {
    await page
      .getByRole('button', { name: /Copy character|문자 복사/ })
      .first()
      .click();
    await page.waitForTimeout(150);
    return page.evaluate(() => navigator.clipboard.readText());
  };

  // ── 1. It opens on one character of the first type.
  t.assert((await panel()).includes('U+3164'), `the opening code point: ${(await panel()).slice(0, 200)}`);
  t.assert((await countField.inputValue()) === '1', `the opening count: ${await countField.inputValue()}`);
  let copied = await copy();
  t.assert(copied === '\u3164', `one copy is ${JSON.stringify(copied)}`);

  // ── 2. The count control changes how many characters are produced.
  for (const n of [3, 50, 1000]) {
    await countField.fill(String(n));
    await page.waitForTimeout(120);
    copied = await copy();
    t.assert(copied.length === n, `${n} characters produced ${copied.length}`);
    t.assert(
      [...copied].every((character) => character === '\u3164'),
      `count ${n} mixed characters`,
    );
  }

  // ── 3. Typing a count replaces the field instead of appending to it (the field is not rewritten
  //        under the caret), so "250" is 250 and not 1250 or the maximum.
  await countField.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('250');
  await page.waitForTimeout(200);
  t.assert((await countField.inputValue()) === '250', `typing 250 left ${await countField.inputValue()}`);
  copied = await copy();
  t.assert(copied.length === 250, `the typed 250 produced ${copied.length} characters`);

  // ── 4. Clearing the count does not silently become the minimum in a way that breaks typing.
  await countField.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(150);
  const afterClear = await countField.inputValue();
  await page.keyboard.type('12');
  await page.waitForTimeout(200);
  t.assert((await countField.inputValue()) === '12', `clearing then typing 12 left ${await countField.inputValue()}`);
  t.assert(afterClear === '' || afterClear === '1', `clearing left ${afterClear}`);

  // ── 5. An over-limit count says what the limit is instead of quietly showing a different number.
  await countField.fill('25000');
  await page.waitForTimeout(200);
  const overLimit = await page.locator('main').innerText();
  const overValue = await countField.inputValue();
  t.assert(overValue === '25000', `the field rewrote the typed count as ${overValue}`);
  t.assert(
    /10,?000/.test(overLimit),
    `an over-limit count is not explained: ${overLimit.replace(/\s+/g, ' ').slice(0, 300)}`,
  );
  copied = await copy();
  t.assert(copied.length <= 10_000, `an over-limit count produced ${copied.length} characters`);

  // ── 6. Every character type changes the code point, the copy, and the generated count.
  await countField.fill('4');
  await page.waitForTimeout(120);
  for (const entry of CHARACTERS) {
    await page.getByRole('radio', { name: entry.name }).first().click();
    await page.waitForTimeout(150);
    const text = await panel();
    t.assert(text.includes(entry.code), `${entry.id} shows ${text.slice(0, 200)}`);
    copied = await copy();
    t.assert(
      copied.length === 4 && [...copied].every((character) => character === entry.char),
      `${entry.id} copied ${JSON.stringify(copied)}`,
    );
  }

  // ── 7. The tester counts what is really in a pasted string.
  const pasted = `계약서\u200B에\u3164숨은\u2800문자\u2060가\u200B있다 😀`;
  await page.locator('main textarea').fill(pasted);
  await page.waitForTimeout(250);
  const inspect = await page.locator('main').innerText();
  const codePoints = [...pasted].length;
  const recognized = [...pasted].filter((character) => CHARACTERS.some((entry) => entry.char === character)).length;
  t.assert(
    inspect.includes(String(codePoints)),
    `the total (${codePoints} code points) is not shown: ${inspect.replace(/\s+/g, ' ').slice(-400)}`,
  );
  t.assert(inspect.includes(String(recognized)), `the recognized count (${recognized}) is not shown`);
  t.assert(inspect.includes('U+200B'), 'the zero-width space in the pasted text was not listed');
  t.assert(inspect.includes('U+3164'), 'the Hangul filler in the pasted text was not listed');
  t.assert(inspect.includes('U+1F600') || !inspect.includes('Emoji'), 'the emoji was counted as one character');

  // ── 8. A large paste with many distinct characters stays responsive and bounded.
  const wide = Array.from({ length: 600 }, (_, index) => String.fromCodePoint(0x4e00 + index)).join('');
  const startedAt = Date.now();
  await page.locator('main textarea').fill(wide.repeat(4));
  await page.waitForTimeout(300);
  const elapsed = Date.now() - startedAt;
  const items = await page.locator('main ul li').count();
  t.assert(elapsed < 6_000, `a 2,400-character paste took ${elapsed} ms`);
  t.assert(items <= 120, `the detection list rendered ${items} rows`);
  t.assert((await panel()).includes('2,400'), 'the total for the large paste is wrong');

  // ── 9. Settings survive a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('main input[inputmode=numeric]')?.value === '4', null, {
    timeout: 15_000,
  });
  t.assert(
    (await page.getByRole('radio', { name: CHARACTERS[3].name }).first().getAttribute('aria-checked')) === 'true',
    'the reload lost the selected character',
  );

  // ── 10. The Korean page is Korean and produces the same character.
  await t.open('/ko/invisible-character');
  await page.waitForTimeout(300);
  const koText = await page.locator('main').innerText();
  t.assert(/투명|보이지|보이지 않는/.test(koText), `the Korean page is not Korean: ${koText.slice(0, 200)}`);
  await page
    .getByRole('button', { name: /문자 복사/ })
    .first()
    .click();
  await page.waitForTimeout(150);
  copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.length === 4, `the Korean page copied ${copied.length} characters`);
  const seo = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
    alternates: [...document.querySelectorAll('link[rel=alternate]')].map((node) => node.getAttribute('href')),
  }));
  t.assert(seo.h1 === 1, `h1 count: ${seo.h1}`);
  t.assert(seo.canonical === 'https://betterbit.org/ko/invisible-character', `canonical: ${seo.canonical}`);
  t.assert(
    seo.alternates.includes('https://betterbit.org/invisible-character'),
    `hreflang pair: ${JSON.stringify(seo.alternates)}`,
  );

  // ── 11. 375 px in dark mode: no sideways scroll.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  t.assert(overflow <= 1, `the page scrolls sideways by ${overflow}px at 375px`);

  t.assert(t.errors.page.length === 0, `page errors: ${t.errors.page.join(' | ')}`);
}

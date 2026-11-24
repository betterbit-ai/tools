/**
 * Lorem Ipsum: the amounts people ask for — 3 paragraphs, 5 sentences, 120 words, exactly 50
 * characters, the Korean style, HTML output — with every count checked here against the text in
 * the box rather than against the tool's own number.
 *
 * Covers the defects this audit fixed:
 *  - clearing the amount field rewrote it to 1, so typing 20 afterwards produced 120 paragraphs;
 *  - an amount above the documented 100 was accepted silently: the field said 500 while the box
 *    held 100 paragraphs, with no message;
 *  - two quick presses of the regenerate button in the same millisecond produced the same text;
 *  - a saved amount outside 1–100 came back unclamped.
 */

const CLASSIC = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

const words = (text) => (text.trim() ? text.trim().split(/\s+/u).length : 0);
const characters = (text) => Array.from(text).length;
const paragraphs = (text) => text.split('\n\n').filter(Boolean).length;

async function stats(page) {
  return page.evaluate(() => {
    const result = {};
    for (const card of document.querySelectorAll('main div[class*="bg-surface-2"]')) {
      if (card.children.length !== 2) continue;
      const [value, label] = [card.children[0], card.children[1]];
      if (!value.className.includes('tabular')) continue;
      result[label.textContent.trim()] = value.textContent.trim();
    }
    return result;
  });
}

export default async function (t) {
  const page = t.page;
  await t.open('/lorem-ipsum');
  await page.waitForTimeout(500);

  const output = page.locator('main textarea').first();
  const amount = page.locator('main input').first();
  const text = async () => output.inputValue();

  // ── 1. The page opens with three paragraphs of Latin text that starts like the classic.
  let value = await text();
  t.assert(paragraphs(value) === 3, `the page opens with ${paragraphs(value)} paragraphs instead of 3`);
  t.assert(value.startsWith(CLASSIC), `the classic opening is missing: "${value.slice(0, 60)}"`);
  let shown = await stats(page);
  t.assert(shown['Paragraphs'] === '3', `the paragraph stat reads ${shown['Paragraphs']}`);
  t.assert(shown['Words'] === String(words(value)), `the word stat reads ${shown['Words']} for ${words(value)} words`);
  t.assert(
    shown['Characters'] === String(characters(value)),
    `the character stat reads ${shown['Characters']} for ${characters(value)} characters`,
  );

  // ── 2. 100 words, the most the tool documents, is exactly 100 words.
  await page.getByRole('radio', { name: 'Words', exact: true }).click();
  await page.waitForTimeout(200);
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('100', { delay: 40 });
  await page.waitForTimeout(300);
  value = await text();
  t.assert(words(value) === 100, `asking for 100 words produced ${words(value)}`);
  shown = await stats(page);
  t.assert(shown['Words'] === '100', `the word stat reads ${shown['Words']}`);
  t.assert(shown['Paragraphs'] === '1', `one paragraph of words reports ${shown['Paragraphs']} paragraphs`);

  // ── 3. Five sentences contain five sentence marks — the generator's own sentence count.
  //    The classic opening brings its own comma, so it is switched off for this count.
  await page.locator('main label').filter({ hasText: 'Start with the classic opening' }).click();
  await page.waitForTimeout(200);
  t.assert(!(await text()).startsWith(CLASSIC), 'the classic opening stayed after switching it off');
  await page.getByRole('radio', { name: 'Sentences', exact: true }).click();
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('5', { delay: 40 });
  await page.waitForTimeout(300);
  value = await text();
  const marks = (value.match(/[.,]/g) ?? []).length;
  t.assert(marks === 5, `five sentences contain ${marks} sentence marks: "${value.slice(0, 80)}"`);

  // ── 4. Characters are counted exactly, in both text styles.
  await page.getByRole('radio', { name: 'Characters', exact: true }).click();
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('50', { delay: 40 });
  await page.waitForTimeout(300);
  value = await text();
  t.assert(characters(value) === 50, `asking for 50 characters produced ${characters(value)}`);
  t.assert((await stats(page))['Characters'] === '50', 'the character stat does not read 50');

  // A whole paragraph of Korean placeholder text is an everyday request: 500 or 1,000 characters
  // used to be cut to 100 without a word.
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('5000', { delay: 30 });
  await page.waitForTimeout(400);
  value = await text();
  t.assert(characters(value) === 5_000, `asking for 5,000 characters produced ${characters(value)}`);
  t.assert(
    (await stats(page))['Characters'] === '5,000',
    `the character stat reads ${(await stats(page))['Characters']}`,
  );

  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('20000', { delay: 30 });
  await page.waitForTimeout(500);
  value = await text();
  t.assert(characters(value) === 10_000, `asking for 20,000 characters produced ${characters(value)}`);
  t.assert(
    (await page.locator('main [role=status]').allInnerTexts()).some((notice) => /from 1 to 10,000/.test(notice)),
    'the 10,000 character ceiling is not explained',
  );
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('50', { delay: 30 });
  await page.waitForTimeout(300);

  await page.getByRole('radio', { name: 'Korean', exact: true }).click();
  await page.waitForTimeout(300);
  value = await text();
  t.assert(characters(value) === 50, `50 Korean characters produced ${characters(value)}`);
  t.assert(/[가-힣]/.test(value), 'Korean mode produced no Hangul');
  t.assert(!value.includes('Lorem ipsum'), 'Korean mode still produced Latin placeholder text');
  t.assert(
    (await page.getByText('Start with the classic opening').count()) === 0,
    'the Latin-only classic opening toggle is offered in Korean mode',
  );

  // ── 5. HTML output wraps each paragraph and keeps the requested count.
  await page.getByRole('radio', { name: 'Paragraphs', exact: true }).click();
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('4', { delay: 40 });
  await page.getByRole('radio', { name: 'HTML <p>' }).click();
  await page.waitForTimeout(300);
  value = await text();
  t.assert(/^(<p>[^<]*<\/p>\n){3}<p>[^<]*<\/p>$/.test(value.trim()), `HTML output is "${value.slice(0, 80)}"`);
  t.assert((await stats(page))['Paragraphs'] === '4', 'HTML output does not report 4 paragraphs');

  await page.getByRole('radio', { name: 'Plain text' }).click();
  await page.getByRole('radio', { name: 'Latin', exact: true }).click();
  await page.waitForTimeout(300);

  // ── 6. Clearing the amount no longer turns the next entry into a different number.
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);
  t.assert((await amount.inputValue()) === '', `clearing the amount left "${await amount.inputValue()}" in the field`);
  t.assert(
    (await page.locator('main [role=status]').allInnerTexts()).some((notice) => /from 1 to 100/.test(notice)),
    'an empty amount is not explained',
  );
  await page.keyboard.type('20', { delay: 60 });
  await page.waitForTimeout(300);
  t.assert((await amount.inputValue()) === '20', `typing 20 after clearing left "${await amount.inputValue()}"`);
  value = await text();
  t.assert(paragraphs(value) === 20, `typing 20 produced ${paragraphs(value)} paragraphs`);

  // ── 7. An amount above 100 is clamped with a message instead of silently ignored.
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('500', { delay: 40 });
  await page.waitForTimeout(400);
  value = await text();
  t.assert(paragraphs(value) === 100, `asking for 500 paragraphs produced ${paragraphs(value)}`);
  const notice = (await page.locator('main [role=status]').allInnerTexts()).join(' ');
  t.assert(/from 1 to 100/.test(notice) && /100/.test(notice), `a 500 paragraph request shows "${notice}"`);
  t.assert((await amount.getAttribute('aria-invalid')) === 'true', 'an out-of-range amount is not marked invalid');
  await amount.blur();
  await page.waitForTimeout(200);
  t.assert((await amount.inputValue()) === '100', `blurring left "${await amount.inputValue()}" in the amount field`);

  // A zero amount is treated the same way.
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('0', { delay: 40 });
  await page.waitForTimeout(300);
  t.assert(paragraphs(await text()) === 1, 'a 0 amount did not fall back to a single paragraph');
  t.assert(
    (await page.locator('main [role=status]').allInnerTexts()).some((text) => /from 1 to 100/.test(text)),
    'a 0 amount is not explained',
  );

  // ── 8. Two regenerate presses a moment apart give different text.
  await page.getByRole('radio', { name: 'Paragraphs', exact: true }).click();
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('2', { delay: 40 });
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Generate another' }).click();
  const first = await text();
  await page.getByRole('button', { name: 'Generate another' }).click();
  const second = await text();
  t.assert(first !== second, 'pressing Generate another twice gave the same text');
  t.assert(paragraphs(first) === 2 && paragraphs(second) === 2, 'regenerating changed the paragraph count');

  // ── 9. Settings and the same text come back after a reload.
  await page.getByRole('radio', { name: 'Korean', exact: true }).click();
  await page.getByRole('radio', { name: 'Words', exact: true }).click();
  await amount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('30', { delay: 40 });
  await page.waitForTimeout(500);
  const saved = await text();
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(600);
  const restored = await text();
  t.assert(words(restored) === 30, `after reload 30 words became ${words(restored)}`);
  t.assert(/[가-힣]/.test(restored), 'the reload lost the Korean style');
  t.assert((await amount.inputValue()) === '30', `the reload lost the amount: "${await amount.inputValue()}"`);
  t.assert(restored === saved, 'the reload did not restore the same text');

  // ── 10. The Korean page counts Korean characters the same way.
  await t.open('/ko/lorem-ipsum');
  await page.waitForTimeout(600);
  await page.getByRole('radio', { name: '글자 수' }).click();
  const koAmount = page.locator('main input').first();
  await koAmount.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('120', { delay: 40 });
  await page.waitForTimeout(300);
  const koText = await page.locator('main textarea').first().inputValue();
  t.assert(characters(koText) === 120, `the Korean page produced ${characters(koText)} characters for 120`);
  t.assert(/[가-힣]/.test(koText), 'the Korean page produced no Hangul');

  // ── 11. 375 px, dark: the panel stacks and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(await output.isVisible(), 'the generated text box is not visible at 375px');
}

/**
 * Korean number converter: what a person preparing a contract actually does — types a won amount,
 * reads the four Korean forms, copies the one their document asks for.
 *
 * Expected strings are written out by hand (not produced by the tool's own converter), so the spec
 * fails if the Hangul reading drifts. Everyday and document forms differ only where Korean writing
 * convention says they do: a leading 일 before 십/백/천 is dropped in the everyday reading.
 */

const CASES = [
  // digits typed, everyday reading, full amount with 원, 금 form, 일금 form
  ['10000000', '천만', '일천만원', '금 일천만원정', '일금 일천만원정'],
  ['12345678', '천이백삼십사만오천육백칠십팔', '일천이백삼십사만오천육백칠십팔원'],
  ['1250000', '백이십오만', '일백이십오만원'],
  ['0', '영', '영원', '금 영원정', '일금 영원정'],
  ['1', '일', '일원'],
  ['10000', '만', '일만원'],
  ['100000000', '일억', '일억원'],
  ['123', '백이십삼', '일백이십삼원'],
  ['1000', '천', '일천원'],
  ['1111', '천백십일', '일천일백일십일원'],
  ['20000', '이만', '이만원'],
  ['1000001', '백만일', '일백만일원'],
  ['1234567890', '십이억삼천사백오십육만칠천팔백구십', '일십이억삼천사백오십육만칠천팔백구십원'],
  ['5050', '오천오십', '오천오십원'],
];

/** Values the spec itself knows the page cannot represent, with the message it must show. */
const REJECTED = [
  ['12.5', /소수점|decimal/i],
  ['-5', /0 이상|zero or a positive/i],
  ['열만원', /숫자만|digits only/i],
  ['1'.repeat(53), /큰 단위 범위|unit range/i],
];

export default async function (t) {
  const page = t.page;
  await t.open('/korean-number');
  await page.waitForFunction(() => document.querySelector('input[inputmode=numeric]')?.value, null, {
    timeout: 15_000,
  });

  const input = page.locator('input[inputmode=numeric]');
  const results = async () => (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  const cards = async () => {
    const texts = await page
      .locator('main article')
      .evaluateAll((nodes) => nodes.map((node) => node.innerText.replace(/\s+/g, ' ').trim()));
    return texts;
  };

  // ── 1. A stored amount or the example is already converted on arrival.
  t.assert((await input.inputValue()).length > 0, 'the amount field arrived empty');

  // ── 2. Every amount reads correctly in all four forms.
  for (const [digits, plain, amount, geum, ilgeum] of CASES) {
    await input.fill(digits);
    await page.waitForTimeout(60);
    const shown = await cards();
    t.assert(shown.length === 4, `expected four result cards for ${digits}, got ${shown.length}: ${shown}`);
    const [plainCard, amountCard, geumCard, ilgeumCard] = shown;
    t.assert(plainCard?.includes(plain), `${digits} everyday reading: ${plainCard}`);
    t.assert(amountCard?.includes(amount), `${digits} amount: ${amountCard}`);
    if (geum) t.assert(geumCard?.includes(geum), `${digits} 금 form: ${geumCard}`);
    if (ilgeum) t.assert(ilgeumCard?.includes(ilgeum), `${digits} 일금 form: ${ilgeumCard}`);
  }

  // ── 3. Pasted spreadsheet and Korean-keyboard input is read, not rejected.
  for (const [typed, expected] of [
    ['₩ 12,345,678원', '일천이백삼십사만오천육백칠십팔원'],
    ['１２，３４５ 원', '일만이천삼백사십오원'],
    [' 1 000 000 ', '일백만원'],
  ]) {
    await input.fill(typed);
    await page.waitForTimeout(60);
    const shown = await cards();
    t.assert(
      shown[1]?.includes(expected),
      `pasting ${JSON.stringify(typed)} gave ${JSON.stringify(shown[1])} instead of ${expected}`,
    );
  }

  // ── 4. The numeric field keeps what was typed instead of rewriting it.
  t.assert((await input.inputValue()) === ' 1 000 000 ', 'the field rewrote the pasted text');

  // ── 5. Wrong input is explained, not guessed.
  for (const [typed, pattern] of REJECTED) {
    await input.fill(typed);
    await page.waitForTimeout(60);
    const text = await results();
    t.assert(pattern.test(text), `${JSON.stringify(typed).slice(0, 24)} was not explained: ${text.slice(0, 200)}`);
    t.assert((await cards()).length === 0, `${JSON.stringify(typed).slice(0, 24)} still showed a converted amount`);
  }

  // ── 6. Clearing the field says what to do rather than showing a stale amount.
  await input.fill('');
  await page.waitForTimeout(60);
  t.assert((await cards()).length === 0, 'an empty field still showed a converted amount');
  t.assert(/입력|Enter/i.test(await results()), 'an empty field did not ask for an amount');

  // ── 7. Reset restores the documented example, Clear empties, both change the field.
  await page.getByRole('button', { name: /예시로 초기화|Reset example/ }).click();
  await page.waitForTimeout(60);
  t.assert((await input.inputValue()) === '10,000,000', `reset left ${await input.inputValue()}`);
  await page.getByRole('button', { name: /^지우기$|^Clear$/ }).click();
  await page.waitForTimeout(60);
  t.assert((await input.inputValue()) === '', 'Clear did not empty the field');

  // ── 8. Each card's Copy button puts its own value on the clipboard.
  await input.fill('1250000');
  await page.waitForTimeout(60);
  const cardCopyButtons = page.locator('main article button');
  const cardCount = await cardCopyButtons.count();
  t.assert(cardCount === 4, `expected four result cards with a copy button, found ${cardCount}`);
  const expectedClipboard = ['백이십오만', '일백이십오만원', '금 일백이십오만원정', '일금 일백이십오만원정'];
  for (let index = 0; index < 4; index++) {
    await page.locator('main article').nth(index).getByRole('button').click();
    await page.waitForTimeout(120);
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    t.assert(copied === expectedClipboard[index], `card ${index + 1} copied ${JSON.stringify(copied)}`);
  }

  // ── 9. The saved amount comes back after a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('input[inputmode=numeric]')?.value === '1250000', null, {
    timeout: 15_000,
  });
  t.assert((await cards())[1]?.includes('일백이십오만원'), 'the reload lost the converted amount');

  // ── 10. The Korean page reads Korean and converts the same amount.
  await t.open('/ko/korean-number');
  await page.waitForFunction(
    () => document.querySelector('input[inputmode=numeric]')?.closest('label')?.innerText.includes('금액'),
    null,
    { timeout: 15_000 },
  );
  const koInput = page.locator('input[inputmode=numeric]');
  await koInput.fill('3400000');
  await page.waitForTimeout(60);
  t.assert((await cards())[1]?.includes('삼백사십만원'), `Korean page amount: ${JSON.stringify(await cards())}`);
  const koText = await page.locator('main').innerText();
  t.assert(koText.includes('문서 표기 (일금)'), 'the Korean page is missing the 일금 card');

  // ── 11. SEO: one h1, canonical, hreflang pair and the localized title.
  const seo = await page.evaluate(() => ({
    h1: [...document.querySelectorAll('h1')].map((node) => node.textContent.trim()),
    canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
    alternates: [...document.querySelectorAll('link[rel=alternate]')].map((node) => node.getAttribute('href')),
    title: document.title,
    description: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
  }));
  t.assert(seo.h1.length === 1, `h1 count: ${seo.h1.length}`);
  t.assert(seo.canonical === 'https://betterbit.org/ko/korean-number', `canonical: ${seo.canonical}`);
  t.assert(
    seo.alternates.includes('https://betterbit.org/korean-number'),
    `hreflang pair: ${JSON.stringify(seo.alternates)}`,
  );
  t.assert(seo.title.includes('숫자 한글'), `title: ${seo.title}`);
  t.assert(seo.description.length > 40, 'the description is missing');

  // ── 12. 375 px in dark mode: the cards stack and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  t.assert(overflow <= 1, `the page scrolls sideways by ${overflow}px at 375px`);
  const wide = await page.evaluate(
    () =>
      [...document.querySelectorAll('main article')].filter((node) => node.scrollWidth > node.clientWidth + 1).length,
  );
  t.assert(wide === 0, `${wide} result cards overflow at 375px`);

  // ── 13. No console errors were raised while using it.
  t.assert(t.errors.console.length === 0, `console errors: ${t.errors.console.join(' | ')}`);
}

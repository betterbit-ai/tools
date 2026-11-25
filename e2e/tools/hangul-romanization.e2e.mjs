/**
 * Korean romanization: everyday Korean typed the way a person would — a place name, a greeting, the
 * ㅎ words that used to print a placeholder, and a passport-style name — with each result compared
 * to the Revised Romanization the spec expects.
 *
 * Covers the defects this audit fixed:
 *  - any syllable ending in ㅎ followed by a vowel printed the literal word "undefined":
 *    좋아요 → "joundefinedayo", 싫어요 → "silundefinedeo", 않아 → "anundefineda";
 *  - ㅎ before ㄱ/ㄷ/ㅈ/ㅅ was not merged, so 좋다 → "jotda" and 많다 → "manda";
 *  - a family name typed alone (이) came out as "i" instead of "Lee", and two-syllable family
 *    names were split (남궁민수 → "Nam Gungminsu").
 */

const output = (page) => page.locator('#hangul-romanization-output').inputValue();

export default async function (t) {
  const page = t.page;
  await t.open('/hangul-romanization');
  await page.waitForTimeout(400);

  const field = page.locator('#hangul-romanization-input');
  const type = async (value) => {
    await field.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(value, { delay: 25 });
    await page.waitForTimeout(200);
  };
  const modes = async (name) => {
    await page.getByRole('radio', { name }).click();
    await page.waitForTimeout(200);
  };

  t.assert((await output(page)) === '', 'the empty page already holds a result');

  // ── 0. The conversion-type options are announced by their own names, not the group label twice.
  const radioNames = await page
    .locator('[role=radiogroup] [role=radio]')
    .evaluateAll((radios) => radios.map((radio) => radio.getAttribute('aria-label') ?? radio.textContent.trim()));
  t.assert(
    JSON.stringify(radioNames) === JSON.stringify(['Official RR', 'Passport name']),
    `the conversion-type options are announced as ${JSON.stringify(radioNames)}`,
  );

  // ── 1. Ordinary text: places, a greeting, and the sound changes RR is known for.
  const cases = [
    ['서울 종로 경복궁', 'Seoul Jongno Gyeongbokgung'],
    ['안녕하세요', 'Annyeonghaseyo'],
    ['한국어 같이 밭이', 'Hangugeo Gachi Bachi'],
    ['값이 없어요', 'Gapsi Eopseoyo'],
    ['앉다 읽다 삶', 'Anda Ikda Sam'],
    ['왕십리', 'Wangsimni'],
    ['대한민국 만세', 'Daehanminguk Manse'],
  ];
  for (const [input, expected] of cases) {
    await type(input);
    t.assert((await output(page)) === expected, `${input} → "${await output(page)}" (expected "${expected}")`);
  }

  // ── 2. The ㅎ words that used to print "undefined".
  const hWords = [
    ['좋아요', 'Joayo'],
    ['싫어요', 'Sireoyo'],
    ['않아', 'Ana'],
    ['좋다', 'Jota'],
    ['많다', 'Manta'],
    ['싫다', 'Silta'],
    ['않다', 'Anta'],
    ['괜찮다', 'Gwaenchanta'],
    ['좋고', 'Joko'],
  ];
  for (const [input, expected] of hWords) {
    await type(input);
    const result = await output(page);
    t.assert(!/undefined/.test(result), `${input} still prints a placeholder: "${result}"`);
    t.assert(result === expected, `${input} → "${result}" (expected "${expected}")`);
  }

  // ── 3. Mixed text keeps its non-Korean characters exactly where they were.
  await type('안녕, world! 😀 2026');
  t.assert((await output(page)) === 'Annyeong, world! 😀 2026', `mixed text: "${await output(page)}"`);

  // ── 4. Text without a modern Hangul syllable is explained, not silently converted.
  await type('hello world');
  const notice = await page.locator('main [role=alert], main [role=status]').allInnerTexts();
  t.assert(
    notice.some((message) => /Hangul syllable/.test(message)),
    `Latin text shows no notice: ${notice.join(' | ')}`,
  );

  // ── 5. The example and clear buttons do what they say.
  await page.getByRole('button', { name: 'Try an example' }).click();
  await page.waitForTimeout(250);
  t.assert((await output(page)).includes('Seoul'), `the example button produced "${await output(page)}"`);
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(250);
  t.assert((await field.inputValue()) === '' && (await output(page)) === '', 'Clear left text behind');

  // ── 6. Passport names: one surname, a compound surname, a name per word, and no capitalisation.
  await modes(/Passport name/);
  await type('김민수');
  t.assert((await output(page)) === 'Kim Minsu', `김민수: "${await output(page)}"`);
  await type('류현진');
  t.assert((await output(page)) === 'Ryu Hyeonjin', `류현진: "${await output(page)}"`);
  await type('남궁민수');
  t.assert((await output(page)) === 'Namgung Minsu', `남궁민수: "${await output(page)}"`);
  await type('제갈공명');
  t.assert((await output(page)) === 'Jegal Gongmyeong', `제갈공명: "${await output(page)}"`);
  await type('이');
  t.assert((await output(page)) === 'Lee', `이 alone: "${await output(page)}"`);
  await type('김민수 박복남');
  t.assert((await output(page)) === 'Kim Minsu Park Boknam', `two names: "${await output(page)}"`);
  await page.getByText('Capitalize each result', { exact: false }).click();
  await page.waitForTimeout(250);
  await type('김민수');
  t.assert((await output(page)) === 'kim minsu', `without capitalisation: "${await output(page)}"`);

  // ── 7. Copy puts the visible result on the clipboard.
  await page.getByRole('button', { name: 'Copy result' }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await page.evaluate(() => navigator.clipboard.readText())) === 'kim minsu',
    'the copied text is not the result',
  );

  // ── 8. The input comes back after a reload, and Clear removes it for good.
  await page.getByText('Capitalize each result', { exact: false }).click();
  await page.waitForTimeout(250);
  await modes(/Official RR/);
  await type('서울 종로');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page
    .waitForFunction(() => document.querySelector('#hangul-romanization-input')?.value === '서울 종로', null, {
      timeout: 20_000,
    })
    .catch(() => {});
  t.assert((await field.inputValue()) === '서울 종로', `the reload lost the input: "${await field.inputValue()}"`);
  t.assert((await output(page)) === 'Seoul Jongno', `the reload changed the result: "${await output(page)}"`);
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(800);
  t.assert((await field.inputValue()) === '', 'Clear did not remove the saved input');

  // ── 9. The Korean page uses the same rules and its own labels.
  await t.open('/ko/hangul-romanization');
  await page.waitForTimeout(500);
  await page.locator('#hangul-romanization-input').fill('좋아요 싫어요');
  await page.waitForTimeout(300);
  const korean = await page.locator('#hangul-romanization-output').inputValue();
  t.assert(korean === 'Joayo Sireoyo', `Korean page 좋아요 싫어요: "${korean}"`);
  t.assert((await page.locator('main').innerText()).includes('로마자'), 'the Korean page has no romanization heading');

  // ── 10. 375 px, dark: the result box is tall enough to read and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const heights = await page.evaluate(() => ({
    input: document.querySelector('#hangul-romanization-input').clientHeight,
    output: document.querySelector('#hangul-romanization-output').clientHeight,
  }));
  t.assert(heights.output >= 120, `the result box is only ${heights.output}px tall at 375px`);
  t.assert(heights.input >= 200, `the input box is only ${heights.input}px tall at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

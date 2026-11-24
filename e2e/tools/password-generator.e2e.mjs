/**
 * Password generator: what someone does when a site demands a new password — pick a length, keep
 * every character type, copy it, then switch to a passphrase and dial the words.
 *
 * Covers the defects this audit fixed and the promises the page makes:
 *  - a blocked clipboard used to fail without a word, so Copy looked pressed and nothing happened;
 *  - every enabled character type really appears in the generated password, and the entropy figure
 *    matches the size of the space the generator samples (checked here independently);
 *  - length and word count are validated, and an error replaces the result instead of leaving a
 *    password that does not follow the chosen settings.
 */

const SETS = { uppercase: 26, lowercase: 26, numbers: 10, symbols: '!@#$%^&*_-+=?'.length };

/** Bits for `length` characters over these sets, with every set required to appear. */
function entropyBits(length, sizes) {
  const alphabet = sizes.reduce((total, size) => total + size, 0);
  let valid = 0n;
  for (let mask = 0; mask < 1 << sizes.length; mask += 1) {
    let removed = 0;
    let bits = 0;
    sizes.forEach((size, index) => {
      if (mask & (1 << index)) {
        removed += size;
        bits += 1;
      }
    });
    const term = BigInt(alphabet - removed) ** BigInt(length);
    valid += bits % 2 === 0 ? term : -term;
  }
  const text = valid.toString();
  const lead = text.slice(0, 15);
  return Math.log2(Number(lead)) + (text.length - lead.length) * Math.log2(10);
}

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*_-+=?';

async function entropy(page) {
  const text = await page.locator('main').innerText();
  return Number(text.match(/(\d+) bits/)?.[1] ?? NaN);
}

async function alerts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert]')].map((element) => element.textContent?.trim() ?? ''),
  );
}

export default async function (t) {
  const page = t.page;
  await t.open('/password-generator');
  await page.waitForTimeout(500);

  const output = page.locator('output');
  const password = async () => ((await output.count()) ? await output.innerText() : '');
  const length = page.getByLabel('Password length');
  const words = page.getByLabel('Number of words');

  // ── 1. It opens on a 20-character password that uses all four character types.
  const first = await password();
  t.assert(first.length === 20, `the first password is ${first.length} characters, not 20`);
  for (const [name, pool] of [
    ['uppercase', UPPER],
    ['lowercase', LOWER],
    ['numbers', DIGITS],
    ['symbols', SYMBOLS],
  ]) {
    t.assert(
      [...first].some((character) => pool.includes(character)),
      `the password ${first} has no ${name} character`,
    );
  }
  t.assert(
    Math.abs((await entropy(page)) - Math.round(entropyBits(20, Object.values(SETS)))) <= 0,
    `entropy for 20 characters and 4 sets: ${await entropy(page)}, expected ${Math.round(
      entropyBits(20, Object.values(SETS)),
    )}`,
  );
  t.assert(
    (await page.locator('main').innerText()).includes('20 characters · 4 selected character sets'),
    'the length note is missing',
  );
  t.assert(
    (await page.locator('main').innerText()).includes('Very strong'),
    'a 20-character password is not called very strong',
  );

  // ── 2. Copy puts exactly the shown password on the clipboard.
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await page.waitForTimeout(200);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === first, `copied "${copied}" instead of the shown password`);
  t.assert((await page.getByText('Copied', { exact: true }).count()) === 1, 'the copy button did not confirm the copy');

  // ── 3. A new length changes the password, the count and the entropy figure.
  await length.fill('24');
  await page.waitForTimeout(250);
  const longer = await password();
  t.assert(longer.length === 24, `after choosing 24 the password is ${longer.length} characters`);
  t.assert(longer !== first, 'a new length did not generate a new password');
  t.assert(
    (await entropy(page)) === Math.round(entropyBits(24, Object.values(SETS))),
    `entropy for 24 characters: ${await entropy(page)}`,
  );

  // ── 4. Typing a length keeps what was typed instead of snapping back.
  await length.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('32', { delay: 80 });
  await page.waitForTimeout(250);
  t.assert((await length.inputValue()) === '32', `the length field shows "${await length.inputValue()}"`);
  t.assert((await password()).length === 32, `the password is ${(await password()).length} characters long`);

  // ── 5. A length the generator cannot honour is refused with an explanation.
  await length.fill('3');
  await page.waitForTimeout(250);
  t.assert(
    (await alerts(page)).some((text) => /from 4 to 128/.test(text)),
    `a length of 3 shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  t.assert((await password()) === '', 'a password was shown for a length that cannot be generated');
  await length.fill('20');
  await page.waitForTimeout(250);
  t.assert((await password()).length === 20, 'the generator did not recover after the bad length');

  // ── 6. Turning off every character type is explained rather than silently generating nothing.
  for (const name of ['Uppercase', 'Lowercase', 'Numbers', 'Symbols']) {
    await page.getByText(name, { exact: true }).click();
    await page.waitForTimeout(120);
  }
  t.assert(
    (await alerts(page)).some((text) => /at least one character type/.test(text)),
    `no selected type shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  for (const name of ['Uppercase', 'Lowercase', 'Numbers', 'Symbols']) {
    await page.getByText(name, { exact: true }).click();
    await page.waitForTimeout(120);
  }

  // ── 7. Look-alike characters can be excluded, and the entropy follows the smaller pool.
  await page.getByText('Exclude look-alike characters (I, l, 1, O, 0)', { exact: true }).click();
  await page.waitForTimeout(250);
  const unambiguous = await password();
  t.assert(
    ![...unambiguous].some((character) => 'Il1O0o'.includes(character)),
    `the password ${unambiguous} still contains a look-alike character`,
  );
  t.assert(
    (await entropy(page)) === Math.round(entropyBits(20, [24, 23, 8, SETS.symbols])),
    `entropy with look-alikes excluded: ${await entropy(page)}`,
  );
  await page.getByText('Exclude look-alike characters (I, l, 1, O, 0)', { exact: true }).click();
  await page.waitForTimeout(200);

  // ── 8. R generates again from anywhere on the page.
  const beforeKey = await password();
  await page.locator('main h1, main p').first().click();
  await page.keyboard.press('r');
  await page.waitForTimeout(250);
  t.assert((await password()) !== beforeKey, 'pressing R did not generate a new password');

  // ── 9. Passphrases: 6 words from the 128-word list, and the separator follows the choice.
  await page.getByRole('radio', { name: 'Word passphrase', exact: true }).click();
  await page.waitForTimeout(300);
  const phrase = await password();
  t.assert(phrase.split('-').length === 6, `a six-word passphrase has ${phrase.split('-').length} words`);
  t.assert((await entropy(page)) === 42, `six words from 128 give ${await entropy(page)} bits, not 42`);
  await page.getByText('Space', { exact: true }).click();
  await page.waitForTimeout(300);
  const spaced = await password();
  t.assert(spaced.split(' ').length === 6, `with the space separator: "${spaced}"`);
  t.assert(!spaced.includes('-'), `the hyphen survived the separator change: ${spaced}`);
  await words.fill('12');
  await page.waitForTimeout(300);
  t.assert((await password()).split(' ').length === 12, 'twelve words did not produce twelve words');
  t.assert((await entropy(page)) === 84, `twelve words give ${await entropy(page)} bits, not 84`);
  await words.fill('13');
  await page.waitForTimeout(300);
  t.assert(
    (await alerts(page)).some((text) => /from 2 to 12/.test(text)),
    `thirteen words shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );

  // ── 10. Settings are remembered after a reload.
  await page.getByRole('radio', { name: 'Random password', exact: true }).click();
  await length.fill('24');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(500);
  t.assert((await length.inputValue()) === '24', `the reload lost the length: "${await length.inputValue()}"`);
  t.assert(
    (await password()).length === 24,
    `after the reload the password is ${(await password()).length} characters`,
  );

  // ── 11. A blocked clipboard is reported instead of leaving Copy looking dead.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('clipboard blocked')) },
    });
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await alerts(page)).some((text) => /blocked the clipboard/.test(text)),
    `a refused copy shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );

  // ── 12. The Korean page names the same controls.
  await t.open('/ko/password-generator');
  await page.waitForTimeout(600);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('비밀번호 길이'), 'the Korean page has no length label');
  t.assert(
    (await page.getByRole('button', { name: '비밀번호 생성', exact: true }).count()) === 1,
    'the Korean page has no generate button',
  );

  // ── 13. 375 px, dark: the result stays inside the screen.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const box = await output.boundingBox();
  t.assert(box && box.width <= 375, 'the password box does not fit the phone viewport');
}

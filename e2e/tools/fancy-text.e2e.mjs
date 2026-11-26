/**
 * Fancy text: a name typed once and read as Unicode styles, with every result recomputed here from
 * its own character map rather than trusted from the page.
 *
 * Covers the defects this audit fixed:
 *  - “Spaced” and “Strikethrough” split a flag (🇰🇷) and a joined family emoji (👨‍👩‍👧) into
 *    separate letters, so the copy-pasted bio showed 🇰 🇷 and 👨 ‍ 👩 ‍ 👧;
 *  - the character count followed UTF-16 code points, so one family emoji counted as five;
 *  - “Spaced” doubled the spaces already in the text (“A B” became “A   B”).
 */

const BOLD = {
  A: '𝐀',
  B: '𝐁',
  C: '𝐂',
  D: '𝐃',
  E: '𝐄',
  F: '𝐅',
  G: '𝐆',
  H: '𝐇',
  I: '𝐈',
  J: '𝐉',
  K: '𝐊',
  L: '𝐋',
  M: '𝐌',
  N: '𝐍',
  O: '𝐎',
  P: '𝐏',
  Q: '𝐐',
  R: '𝐑',
  S: '𝐒',
  T: '𝐓',
  U: '𝐔',
  V: '𝐕',
  W: '𝐖',
  X: '𝐗',
  Y: '𝐘',
  Z: '𝐙',
  a: '𝐚',
  b: '𝐛',
  c: '𝐜',
  d: '𝐝',
  e: '𝐞',
  f: '𝐟',
  g: '𝐠',
  h: '𝐡',
  i: '𝐢',
  j: '𝐣',
  k: '𝐤',
  l: '𝐥',
  m: '𝐦',
  n: '𝐧',
  o: '𝐨',
  p: '𝐩',
  q: '𝐪',
  r: '𝐫',
  s: '𝐬',
  t: '𝐭',
  u: '𝐮',
  v: '𝐯',
  w: '𝐰',
  x: '𝐱',
  y: '𝐲',
  z: '𝐳',
  0: '𝟎',
  1: '𝟏',
  2: '𝟐',
  3: '𝟑',
  4: '𝟒',
  5: '𝟓',
  6: '𝟔',
  7: '𝟕',
  8: '𝟖',
  9: '𝟗',
};

const bold = (text) => [...text].map((character) => BOLD[character] ?? character).join('');

/** Style label -> the text the page shows for it. */
const results = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main article')].map((article) => [
        article.querySelector('h3').textContent.trim(),
        article.querySelector('p').textContent,
      ]),
    ),
  );

/** “4 results” on the page. */
const resultCount = async (page) => Object.keys(await results(page)).length;

const stats = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('main div[class*="bg-surface-2"]')]
        .filter((element) => element.children.length === 2 && element.children[0].className.includes('tabular'))
        .map((element) => [element.children[1].textContent.trim(), element.children[0].textContent.trim()]),
    ),
  );

export default async function (t) {
  const page = t.page;
  await t.open('/fancy-text');
  await page.waitForTimeout(600);

  const input = page.locator('main textarea');
  /** A segmented radio button, matched on its own text (the group label leaks into the checked one). */
  const choose = async (name) => {
    await page
      .locator('main [role=radio]')
      .filter({ hasText: new RegExp(`^${name}$`) })
      .click();
    await page.waitForTimeout(200);
  };

  // ── 1. The example name on page load, with the bold row computed here.
  t.assert((await input.inputValue()) === 'Your name', `the page opens with "${await input.inputValue()}"`);
  let shown = await results(page);
  t.assert(
    shown.Bold === bold('Your name'),
    `bold row is ${JSON.stringify(shown.Bold)} (expected ${JSON.stringify(bold('Your name'))})`,
  );
  t.assert((await stats(page)).Characters === '9', `character count is ${(await stats(page)).Characters}`);
  const all = await resultCount(page);

  // ── 2. Every control changes what it claims: the style-group filter.
  await choose('Text styles');
  shown = await results(page);
  t.assert(
    !('Spaced' in shown) && !('Sparkles' in shown) && 'Bold' in shown,
    `the text-styles filter still lists decorations: ${Object.keys(shown).join(', ')}`,
  );
  await choose('Decorations');
  shown = await results(page);
  t.assert(
    JSON.stringify(Object.keys(shown).sort()) === JSON.stringify(['Brackets', 'Spaced', 'Sparkles', 'Strikethrough']),
    `the decorations filter lists ${Object.keys(shown).join(', ')}`,
  );
  await choose('All');
  t.assert((await resultCount(page)) === all, 'switching back to All did not restore every result');

  // ── 3. Korean text: only styles that really change it stay, including the digit styles.
  await input.fill('안녕 세상 2026');
  await page.waitForTimeout(300);
  shown = await results(page);
  t.assert(
    Object.keys(shown).length === 11,
    `Korean text with digits gave ${Object.keys(shown).length} results: ${Object.keys(shown).join(', ')}`,
  );
  t.assert(
    shown.Spaced === '안 녕 세 상 2 0 2 6',
    `spacing Korean doubled its spaces: ${JSON.stringify(shown.Spaced)}`,
  );
  t.assert(shown.Brackets === '【안녕 세상 2026】', `brackets: ${JSON.stringify(shown.Brackets)}`);
  t.assert((await stats(page)).Characters === '10', `Korean character count: ${(await stats(page)).Characters}`);

  // ── 4. A flag and a joined family emoji survive spacing and strikethrough, and count as one each.
  await input.fill('🇰🇷 가족 👨‍👩‍👧 1');
  await page.waitForTimeout(300);
  shown = await results(page);
  t.assert(
    shown.Spaced === '🇰🇷 가 족 👨‍👩‍👧 1',
    `spacing split the flag or the family emoji: ${JSON.stringify(shown.Spaced)}`,
  );
  t.assert(
    shown.Strikethrough === '🇰🇷̶ 가̶족̶ 👨‍👩‍👧̶ 1̶',
    `strikethrough broke an emoji sequence: ${JSON.stringify(shown.Strikethrough)}`,
  );
  t.assert(
    (await stats(page)).Characters === '8',
    `the flag and family emoji are counted as ${(await stats(page)).Characters} characters instead of 8`,
  );

  // ── 5. Copy puts the exact styled text on the clipboard.
  const boldRow = page
    .locator('main article')
    .filter({ has: page.getByRole('heading', { name: 'Bold', exact: true }) });
  await boldRow.getByRole('button').click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === shown.Bold, `copied text is ${JSON.stringify(copied)}`);

  // ── 6. Clear empties the input, the results list explains why it is empty, and nothing is kept.
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(300);
  t.assert((await input.inputValue()) === '', 'Clear left text in the input');
  t.assert(
    /No styles in this group change the current text/.test(await page.locator('main').innerText()),
    'an empty input shows no explanation',
  );

  // ── 7. Typed text survives a reload in the same browser.
  await input.fill('Good vibes only');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector('main textarea')?.value === 'Good vibes only', null, {
    timeout: 15_000,
  });
  const afterReload = await results(page);
  t.assert(
    afterReload['Small caps'] === 'Gᴏᴏᴅ ᴠɪʙᴇꜱ ᴏɴʟʏ',
    `small caps after reload: ${JSON.stringify(afterReload['Small caps'])}`,
  );

  // ── 8. The Korean page labels the same controls.
  await t.open('/ko/fancy-text');
  await page.waitForTimeout(400);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('꾸밀 텍스트') && korean.includes('영문 글씨체'), 'the Korean page is missing its labels');

  // ── 9. 375 px, dark: nothing pushes the page sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

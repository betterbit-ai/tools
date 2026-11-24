/**
 * Korean spell checker: the sentences people actually paste — a message with several mistakes, a
 * word ending in 수 that must not be pulled apart, a long document — checked against the text the
 * tool shows and the text it hands back.
 *
 * Covers the defects this audit fixed:
 *  - “접수있다 / 점수있어요 / 가수있네” were rewritten as “접 수 있다”, “점 수 있어요”: the spacing
 *    rule now applies only to “-(으)ㄹ 수 있다”, where the syllable before 수 ends in ㄹ;
 *  - a space-only suggestion read “! → !”, so the change was invisible; the space is shown as ␣;
 *  - a large paste rendered one card per match and could freeze the tab; the list is capped and
 *    says how many suggestions there are;
 *  - when the browser refused to store a long draft, the page still said it was saved.
 */

const SAMPLE = '몇일 뒤에 메세지를 보낼수있어요 ! 웬지 금새 설레임이 생겼어요.';
const SAMPLE_FIXED = '며칠 뒤에 메시지를 보낼 수 있어요! 왠지 금세 설렘이 생겼어요.';

const LIST = (label = 'Suggestions to review') => `main ul[aria-label="${label}"]`;

async function suggestions(page, label = 'Suggestions to review') {
  return page.evaluate((aria) => {
    const list = document.querySelector(`main ul[aria-label="${aria}"]`);
    return list ? [...list.children].map((item) => item.innerText.split('\n')[0].trim()) : [];
  }, label);
}

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
  await t.open('/korean-spell-check');
  await page.waitForTimeout(400);

  const input = page.locator('main textarea').first();
  const output = page.locator('main textarea').nth(1);
  const type = async (text) => {
    await input.click();
    await page.keyboard.press('Control+a');
    if (text === '') await page.keyboard.press('Backspace');
    else await page.keyboard.type(text, { delay: 5 });
    await page.waitForTimeout(300);
  };

  // ── 1. An empty page invites pasting and claims nothing.
  t.assert((await stats(page))['Suggestions'] === '0', 'an empty page already shows suggestions');
  t.assert(
    (await page.locator('main').innerText()).includes('Paste Korean text to see'),
    'the empty state is not explained',
  );

  // ── 2. The example sentence finds every listed pattern, and the corrected text is exact.
  await page.getByRole('button', { name: 'Try an example' }).click();
  await page.waitForTimeout(400);
  t.assert((await input.inputValue()) === SAMPLE, `the example filled "${await input.inputValue()}"`);
  const found = await suggestions(page);
  t.assert(found.length === 7, `the example produced ${found.length} suggestions: ${found.join(' | ')}`);
  for (const pair of [
    '몇일 → 며칠',
    '메세지 → 메시지',
    '낼수있 → 낼 수 있',
    '웬지 → 왠지',
    '금새 → 금세',
    '설레임 → 설렘',
  ]) {
    t.assert(found.includes(pair), `the suggestion list is missing ${pair}: ${found.join(' | ')}`);
  }
  t.assert(
    found.includes('␣! → !'),
    `the space before the exclamation mark is shown as ${found.find((item) => item.includes('!'))}`,
  );
  t.assert((await output.inputValue()) === SAMPLE_FIXED, `the suggested text is "${await output.inputValue()}"`);
  t.assert(
    (await stats(page))['Suggestions'] === '7',
    `the suggestion stat reads ${(await stats(page))['Suggestions']}`,
  );

  // ── 3. A word that merely ends in 수 keeps its syllable: no suggestion, no change.
  const words = '접수있다고 합니다. 점수있어요? 가수있네요.';
  await type(words);
  t.assert((await suggestions(page)).length === 0, `“수” words produced ${(await suggestions(page)).join(' | ')}`);
  t.assert((await output.inputValue()) === words, `“수” words were changed to "${await output.inputValue()}"`);

  // The real “-(으)ㄹ 수 있다” form is still spaced.
  await type('할수있다고 들었어요.');
  const spaced = await suggestions(page);
  t.assert(spaced.includes('할수있 → 할 수 있'), `“할수있다” produced ${spaced.join(' | ')}`);
  t.assert((await output.inputValue()) === '할 수 있다고 들었어요.', `the output is "${await output.inputValue()}"`);

  // ── 4. Applying one suggestion changes only that one.
  await type('몇일 뒤에 메세지를 보냈어요.');
  t.assert((await suggestions(page)).length === 2, 'the two-mistake sentence does not show two suggestions');
  await page.locator(`${LIST()} li`).first().getByRole('button', { name: 'Apply', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await input.inputValue()) === '며칠 뒤에 메세지를 보냈어요.',
    `after applying the first suggestion the input is "${await input.inputValue()}"`,
  );
  t.assert((await suggestions(page)).length === 1, 'the applied suggestion was not removed from the list');
  t.assert(
    (await output.inputValue()) === '며칠 뒤에 메시지를 보냈어요.',
    'the suggested text does not follow the input',
  );

  // ── 5. Apply all finishes the job and says how many were applied.
  await page.getByRole('button', { name: 'Apply all' }).click();
  await page.waitForTimeout(300);
  t.assert(
    (await input.inputValue()) === '며칠 뒤에 메시지를 보냈어요.',
    `apply all left "${await input.inputValue()}"`,
  );
  t.assert((await suggestions(page)).length === 0, 'suggestions remain after Apply all');
  const notices = await page.locator('main [role=status]').allInnerTexts();
  t.assert(
    notices.some((notice) => /1 suggestion\(s\) applied|2 suggestion\(s\) applied/.test(notice)),
    `applying everything shows no count: ${notices.join(' | ')}`,
  );
  t.assert(
    (await output.inputValue()) === (await input.inputValue()),
    'the suggested text differs from the corrected input',
  );

  // ── 6. The keyboard shortcut applies everything too.
  await type('금새 끝났어요. 역활이 컸습니다.');
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(300);
  t.assert(
    (await input.inputValue()) === '금세 끝났어요. 역할이 컸습니다.',
    `Ctrl+Enter left "${await input.inputValue()}"`,
  );

  // ── 7. The draft comes back after a reload, and Clear removes it.
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(600);
  t.assert(
    (await page.locator('main textarea').first().inputValue()) === '금세 끝났어요. 역할이 컸습니다.',
    'the reload lost the draft',
  );
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(600);
  t.assert((await page.locator('main textarea').first().inputValue()) === '', 'Clear left the text in the box');
  t.assert(
    (await page.evaluate(() => localStorage.getItem('tools:korean-spell-check:text'))) === null,
    'Clear left the draft in local storage',
  );

  // ── 8. A long document is checked, listed in a bounded way, and still correctable in one press.
  const repeats = 2_500;
  const long = '몇일 뒤에 메세지를 보냈습니다. 할수있어요. '.repeat(repeats); // ~100 KB, three matches per line
  const expectedMatches = repeats * 3;
  await page.evaluate((text) => {
    const area = document.querySelector('main textarea');
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(area, text);
    area.dispatchEvent(new Event('input', { bubbles: true }));
  }, long);
  await page.waitForTimeout(2_000);
  const longStats = await stats(page);
  const formatted = new Intl.NumberFormat('en-US').format(expectedMatches);
  t.assert(longStats['Suggestions'] === formatted, `a long document reports ${longStats['Suggestions']} suggestions`);
  const rendered = await page.evaluate(
    () => document.querySelectorAll('main ul[aria-label="Suggestions to review"] li').length,
  );
  t.assert(rendered === 100, `a long document renders ${rendered} suggestion cards`);
  const capped = await page.evaluate(() => {
    const list = document.querySelector('main ul[aria-label="Suggestions to review"]');
    return list?.previousElementSibling?.textContent?.trim() ?? '';
  });
  t.assert(capped.includes(`first 100 of ${formatted}`), `the capped list says "${capped}"`);
  await page.getByRole('button', { name: 'Apply all' }).click();
  await page.waitForTimeout(1_500);
  const fixedLong = await page.locator('main textarea').first().inputValue();
  t.assert(!fixedLong.includes('몇일') && !fixedLong.includes('메세지'), 'Apply all did not correct the long document');
  t.assert(
    fixedLong.includes('며칠 뒤에 메시지를 보냈습니다. 할 수 있어요.'),
    'the long document was corrected incorrectly',
  );

  // ── 9. When the browser refuses to store the draft, the page says so instead of claiming it is saved.
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (String(key).startsWith('tools:korean-spell-check')) throw new DOMException('QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(500);
  await page.locator('main textarea').first().click();
  await page.keyboard.type('되요', { delay: 20 });
  await page.waitForTimeout(900);
  t.assert(
    (await page.locator('main').innerText()).includes('Too long to keep in this browser'),
    'a failed save is still reported as saved',
  );

  // ── 10. The Korean page labels the same controls.
  await t.open('/ko/korean-spell-check');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: '예시 문장' }).click();
  await page.waitForTimeout(400);
  const koFound = await suggestions(page, '확인할 제안');
  t.assert(koFound.length === 7, `the Korean page found ${koFound.length} suggestions`);
  t.assert(
    (await page.locator('main').innerText()).includes('확인할 제안'),
    'the Korean page does not label the suggestion list',
  );
  t.assert(
    (await page.locator('main [role=status]').allInnerTexts()).some((notice) => /확인한 뒤 적용/.test(notice)),
    'the Korean review notice is missing',
  );

  // ── 11. 375 px, dark: the panels stack and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(await page.locator('main textarea').first().isVisible(), 'the input is not visible at 375px');
}

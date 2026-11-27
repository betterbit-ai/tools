/**
 * Special characters: real clicks copying real characters, and a search that finds them.
 *
 * Covers the defects this audit fixed:
 *  - pressing “/” threw “TypeError: focus is not a function” and left the caret where it was,
 *    because the shared text input never handed its DOM node back through a ref;
 *  - a search was confined to the group picked last (and remembered), so typing “star” while
 *    ㄹ was selected answered “No characters match this search” for a symbol one pick away;
 *  - the count read “1 characters”.
 */

const face = (page) =>
  page.evaluate(() => {
    const main = document.querySelector('main');
    const section = (name) => main.querySelector(`section[aria-labelledby=${name}]`);
    const tiles = (root) => [...(root?.querySelectorAll('button') ?? [])].map((b) => b.textContent.trim());
    return {
      count: section('cm-results')?.querySelector('span.text-xs')?.textContent?.trim() ?? '',
      results: tiles(section('cm-results')),
      recent: tiles(section('cm-recent')),
      recentHeading: main.querySelector('#cm-recent')?.textContent?.trim() ?? null,
      status: [...main.querySelectorAll('[role=status]')].map((el) => el.textContent.trim()).filter(Boolean),
      noResults: main.innerText.includes('No characters match this search.'),
      group: main.querySelector('select')?.value,
      groupOptions: [...(main.querySelector('select')?.options ?? [])].map((o) => o.value),
      searchValue: main.querySelector('input[type=text]')?.value,
    };
  });

const chars = (view) => view.results.map((tile) => Array.from(tile)[0]);

export default async function (t) {
  const page = t.page;
  await t.open('/character-map');
  await page.waitForTimeout(600);

  // ── 1. Popular symbols open the page, with a count that agrees with the grid.
  let view = await face(page);
  t.assert(view.group === 'popular', `the page opened on the ${view.group} group`);
  t.assert(view.results.length === 18, `the popular group shows ${view.results.length} tiles`);
  t.assert(view.count === '18 characters', `the count reads ${JSON.stringify(view.count)}`);
  for (const symbol of ['★', '→', '✓', '♥', '©', '±']) {
    t.assert(chars(view).includes(symbol), `the popular group has no ${symbol}`);
  }
  t.assert(view.recent.length === 0, 'a fresh page already has recent copies');

  // ── 2. One click copies exactly that character and records it.
  await page.getByRole('button', { name: 'Copy ★, U+2605', exact: true }).click();
  await page.waitForTimeout(400);
  view = await face(page);
  t.assert((await page.evaluate(() => navigator.clipboard.readText())) === '★', 'the clipboard does not hold ★');
  t.assert(view.status.includes('★ copied'), `no copy confirmation appeared (${JSON.stringify(view.status)})`);
  t.assert(view.recentHeading === 'Recent copies', 'the recent copies heading did not appear');
  t.assert(
    view.recent.length === 1 && view.recent.some((tile) => tile.includes('★')),
    `recent copies read ${JSON.stringify(view.recent)}`,
  );

  await page.getByRole('button', { name: /Copy →, U\+2192/ }).click();
  await page.waitForTimeout(300);
  view = await face(page);
  t.assert((await page.evaluate(() => navigator.clipboard.readText())) === '→', 'the clipboard does not hold →');
  t.assert(view.recent[0].includes('→'), `the newest copy is not listed first (${JSON.stringify(view.recent)})`);

  // ── 3. “/” focuses the search box (it used to throw and move nothing).
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press('/');
  await page.waitForTimeout(300);
  const focused = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    placeholder: document.activeElement?.getAttribute?.('placeholder'),
  }));
  t.assert(focused.tag === 'INPUT', `“/” left focus on ${focused.tag}`);
  t.assert(/Search star/.test(focused.placeholder ?? ''), `“/” focused ${JSON.stringify(focused.placeholder)}`);
  t.assert(!t.errors.page.length, `“/” raised ${t.errors.page[0]}`);
  await page.keyboard.type('heart');

  // ── 4. Search by English name, Korean name, symbol and code point.
  const search = page.locator('main input[type=text]').first();
  const look = async (query) => {
    await search.fill(query);
    await page.waitForTimeout(250);
    return face(page);
  };
  let found = await look('heart');
  t.assert(chars(found).join('') === '♥♡', `“heart” found ${JSON.stringify(chars(found))}`);
  t.assert(found.count === '2 characters', `“heart” is counted as ${JSON.stringify(found.count)}`);

  found = await look('하트');
  t.assert(chars(found).join('') === '♥♡', `“하트” found ${JSON.stringify(chars(found))}`);

  found = await look('U+2713');
  t.assert(chars(found).join('') === '✓', `“U+2713” found ${JSON.stringify(chars(found))}`);
  t.assert(found.count === '1 character', `one result is counted as ${JSON.stringify(found.count)}`);

  found = await look('2713');
  t.assert(chars(found).join('') === '✓', `“2713” found ${JSON.stringify(chars(found))}`);

  found = await look('∞');
  t.assert(chars(found).join('') === '∞', `“∞” found ${JSON.stringify(chars(found))}`);

  found = await look('zzzz');
  t.assert(found.results.length === 0 && found.noResults, 'a search with no match says nothing');

  // ── 5. The group picked earlier does not trap a search inside it.
  await search.fill('');
  await page.selectOption('main select', 'rieul');
  await page.waitForTimeout(400);
  view = await face(page);
  t.assert(view.group === 'rieul', 'the group picker did not change');
  t.assert(view.results.length === 16, `the ㄹ group shows ${view.results.length} tiles`);
  t.assert(chars(view).includes('₩'), 'the ㄹ group is missing ₩');

  found = await look('star');
  t.assert(chars(found).includes('★'), `a search inside the ㄹ group cannot find ★ (${JSON.stringify(chars(found))})`);
  t.assert(!found.noResults, 'a search inside the ㄹ group reported no results for ★');

  // ── 6. Each group really changes the list, and “All characters” holds every group.
  const perGroup = {};
  for (const group of [
    'giyok',
    'nieun',
    'digeut',
    'rieul',
    'mieum',
    'bieup',
    'siot',
    'ieung',
    'jieut',
    'chieut',
    'hieut',
  ]) {
    await search.fill('');
    await page.selectOption('main select', group);
    await page.waitForTimeout(200);
    perGroup[group] = (await face(page)).results.length;
  }
  t.assert(perGroup.hieut === 14, `the ㅎ group shows ${perGroup.hieut} tiles`);
  // ㅁ holds 24 shapes and arrows plus the seven symbols that only appear in the popular group.
  t.assert(perGroup.mieum === 31, `the ㅁ group shows ${perGroup.mieum} tiles`);
  t.assert(perGroup.giyok === 12, `the ㄱ group shows ${perGroup.giyok} tiles`);
  const grouped = Object.values(perGroup).reduce((sum, n) => sum + n, 0);

  await search.fill('');
  await page.selectOption('main select', 'all');
  await page.waitForTimeout(300);
  view = await face(page);
  t.assert(
    view.results.length === grouped && grouped === 180,
    `“All characters” shows ${view.results.length}, the groups add up to ${grouped}`,
  );
  t.assert(chars(view).includes('™') && chars(view).includes('Ω'), '“All characters” is missing entries');

  // ── 7. Recent copies survive a reload, and the group picker comes back.
  await search.fill('');
  await page.selectOption('main select', 'hieut');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Copy α, U+03B1', exact: true }).click();
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(700);
  view = await face(page);
  t.assert(view.group === 'hieut', `the group picker came back as ${view.group}`);
  t.assert(
    view.recent.some((tile) => tile.includes('α')),
    `recent copies lost α (${JSON.stringify(view.recent)})`,
  );

  // ── 8. A copy from the recent row works too and stays at the front.
  const recentAlpha = page.locator('section[aria-labelledby=cm-recent] button').first();
  await recentAlpha.click();
  await page.waitForTimeout(300);
  t.assert((await page.evaluate(() => navigator.clipboard.readText())) === 'α', 'a recent-tile click copied nothing');

  // ── 9. The Korean page searches and copies the same way.
  await t.open('/ko/character-map');
  await page.waitForTimeout(600);
  const korean = page.locator('main input[type=text]').first();
  await korean.fill('화살표');
  await page.waitForTimeout(300);
  const koreanView = await face(page);
  t.assert(koreanView.results.length > 0, 'the Korean keyword search found no arrow');
  t.assert(chars(koreanView).includes('→'), `the Korean search found ${JSON.stringify(chars(koreanView))}`);
  await page.locator('section[aria-labelledby=cm-results] button[aria-label="→ 문자 복사, U+2192"]').first().click();
  await page.waitForTimeout(400);
  t.assert((await page.evaluate(() => navigator.clipboard.readText())) === '→', 'the Korean page copied nothing');

  // ── 10. 375 px, dark: the grid wraps instead of pushing the page sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

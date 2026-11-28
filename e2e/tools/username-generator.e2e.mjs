/**
 * Generate a real batch, tighten it to a platform's rule, keep the keyword, switch to Korean,
 * and keep a favourite across a reload — the path a person takes before signing up somewhere.
 */

export default async function (t) {
  const context = t.page.context();
  await t.open('/username-generator');

  const suggestions = t.page.getByRole('list', { name: 'Suggestions' });
  const names = () => suggestions.locator('li button:first-child');
  const list = suggestions.locator('li');
  t.assert((await list.count()) === 12, `default batch was ${await list.count()} instead of 12`);

  const firstBatch = await names().allInnerTexts();
  for (const name of firstBatch) {
    t.assert([...name].length <= 20, `"${name}" exceeds the 20-character default`);
    t.assert(/^[A-Z]/.test(name), `"${name}" is not the capitalised word-pair style`);
  }

  // Another click must produce a different batch, not the same list again.
  await t.click('Generate more');
  await t.page.waitForTimeout(200);
  const secondBatch = await names().allInnerTexts();
  t.assert(secondBatch.join('|') !== firstBatch.join('|'), 'Generate more returned the identical batch');

  // Choosing X applies its 15-character limit and hides separators it does not allow.
  await t.page.selectOption('select[aria-label="Where will you use it?"]', 'x');
  await t.page.waitForTimeout(200);
  const limited = await names().allInnerTexts();
  t.assert(limited.length > 0, 'no names survived the X limit');
  for (const name of limited) t.assert([...name].length <= 15, `"${name}" exceeds X's 15 characters`);
  t.assert((await t.page.locator('main').innerText()).includes('15-character limit'), 'X limit was not explained');
  t.assert(
    (await t.page.locator('main input[type=number]').nth(1).inputValue()) === '15',
    'the disabled length field still shows the old limit instead of the platform limit',
  );
  t.assert(
    (await suggestions.locator('li').first().innerText()).includes('/15'),
    'the character counter still uses the pre-platform limit',
  );
  const separatorLabels = await t.page.locator('[role="radiogroup"] button').allInnerTexts();
  t.assert(!separatorLabels.includes('.'), 'X still offers a period separator it does not accept');
  t.assert(
    (await t.page.getByRole('radio', { name: 'None', exact: true }).count()) === 1,
    'the separator label was repeated into the radio names',
  );

  // A keyword must appear in every suggestion.
  const keyword = t.page.locator('main input[type=text]').first();
  await keyword.fill('panda');
  await t.page.waitForTimeout(200);
  const withKeyword = await names().allInnerTexts();
  t.assert(withKeyword.length > 0, 'keyword search produced no names');
  for (const name of withKeyword) t.assert(/panda/i.test(name), `"${name}" is missing the keyword`);

  // A Hangul keyword in an English style must warn, not silently mangle the name.
  await keyword.fill('감자');
  await t.waitForText('The keyword is written in Korean');
  t.assert((await list.count()) > 0, 'the keyword warning emptied the list');

  // Korean styles must produce Hangul-only names that fit the limit.
  await t.page.selectOption('select[aria-label="Style"]', 'ko-modifier-noun');
  await t.page.waitForTimeout(200);
  const korean = await names().allInnerTexts();
  t.assert(korean.length > 0, 'Korean style produced no names');
  for (const name of korean) {
    t.assert(/^[\uac00-\ud7a3]+$/.test(name), `"${name}" is not a Hangul-only nickname`);
    t.assert(name.includes('감자'), `"${name}" dropped the Korean keyword`);
  }

  // Copy all must hand over the visible list, one name per line.
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await t.click('Copy all');
  await t.waitForText('Copied');
  const copied = await t.page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.split('\n').length === korean.length, 'copied batch does not match the visible list');
  t.assert(
    copied.split('\n').every((line) => /^[\uac00-\ud7a3]+$/.test(line)),
    'copied batch lost the Hangul names',
  );

  // A saved favourite must survive a reload (local storage, not session state).
  const favourite = korean[0];
  await t.page.getByRole('button', { name: `Save to favourites`, exact: true }).first().click();
  await t.waitForText('Saved names');
  t.assert((await t.page.locator('main').innerText()).includes(favourite), 'favourite was not shown after saving');
  await t.open('/username-generator');
  await t.waitForText('Saved names');
  t.assert((await t.page.locator('main').innerText()).includes(favourite), 'favourite did not survive a reload');

  // Impossible constraints must explain the empty result instead of printing nothing.
  const count = t.page.locator('main input[type=number]').first();
  await count.fill('6');
  await t.page.waitForTimeout(200);
  t.assert((await list.count()) === 6, `count control did not produce 6 names (${await list.count()})`);

  // Korean page, mobile width and dark mode.
  await t.open('/ko/username-generator');
  await t.waitForText('추천 이름');
  t.assert((await t.page.locator('main').innerText()).includes('닉네임'), 'Korean page is not translated');
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(
    (await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );
}

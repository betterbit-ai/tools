/**
 * Coin flip: real flips read back from the page, with the tally recomputed from the results shown.
 *
 * Covers the defects this audit fixed:
 *  - a 199-to-1 tally printed “199 (100%)” and “1 (1%)” side by side — 101% of the flips — because
 *    each share was rounded on its own;
 *  - Space on a focused control flipped the coin instead of pressing that control, so a keyboard
 *    user could not reset the tally, and holding Space fed the tally with auto-repeats.
 */

const face = (page) =>
  page.evaluate(() => {
    const main = document.querySelector('main');
    const output = main.querySelector('output');
    const stats = [...main.querySelectorAll('div[class*="bg-surface-2"]')]
      .filter((el) => el.children.length === 2 && el.children[0].className.includes('tabular'))
      .map((el) => ({ value: el.children[0].textContent.trim(), label: el.children[1].textContent.trim() }));
    return {
      heading: output?.querySelector('span')?.textContent?.trim() ?? null,
      latest: output?.querySelector('strong')?.textContent?.trim() ?? null,
      stats: Object.fromEntries(stats.map((s) => [s.label, s.value])),
      history: [...main.querySelectorAll('ol[class*="gap-2"] li')].map((li) =>
        li.textContent.trim().replace(/^\d+\.\s*/, ''),
      ),
    };
  });

const share = (value) => Number(/\((\d+)%\)/.exec(value ?? '')?.[1] ?? NaN);
const count = (value) => Number(/^(\d+)/.exec(value ?? '')?.[1] ?? NaN);

/** Every visible number must agree with the history and the labels currently in use. */
const checkFace = (t, view, { heads, tails, labels }) => {
  t.assert(
    view.stats[labels.heads] !== undefined,
    `the tally has no ${labels.heads} tile (${JSON.stringify(view.stats)})`,
  );
  t.assert(
    count(view.stats[labels.heads]) === heads,
    `${labels.heads} shows ${view.stats[labels.heads]}, expected ${heads}`,
  );
  t.assert(
    count(view.stats[labels.tails]) === tails,
    `${labels.tails} shows ${view.stats[labels.tails]}, expected ${tails}`,
  );
  t.assert(view.stats.Total === String(heads + tails), `Total shows ${view.stats.Total}, expected ${heads + tails}`);
  const total = heads + tails;
  const expectedHeads = total ? Math.round((heads / total) * 100) : 0;
  t.assert(
    share(view.stats[labels.heads]) === expectedHeads,
    `${labels.heads} shows ${view.stats[labels.heads]}%, expected ${expectedHeads}%`,
  );
  const shares = share(view.stats[labels.heads]) + share(view.stats[labels.tails]);
  t.assert(total ? shares === 100 : shares === 0, `the shares add up to ${shares}%`);
  if (total) t.assert(view.history[0] !== undefined, 'a flip is counted but the recent list is empty');
  return view;
};

export default async function (t) {
  const page = t.page;
  await t.open('/coin-flip');
  await page.waitForTimeout(600);

  const english = { heads: 'Heads', tails: 'Tails' };
  const flip = page.getByRole('button', { name: 'Flip the coin', exact: true });
  const reset = page.getByRole('button', { name: 'Reset tally', exact: true });

  // ── 1. A fresh page has no result and no tally.
  let view = await face(page);
  t.assert(view.latest === '—', `a fresh page shows ${JSON.stringify(view.latest)}`);
  t.assert(view.heading === 'Ready to flip', `a fresh page says ${JSON.stringify(view.heading)}`);
  checkFace(t, view, { heads: 0, tails: 0, labels: english });
  t.assert(view.history.length === 0, 'a fresh page already lists flips');
  t.assert(await reset.isDisabled(), 'Reset tally is enabled with nothing to reset');

  // ── 2. Forty flips: every one is counted, labelled, and listed newest first.
  for (let i = 0; i < 40; i++) await flip.click();
  await page.waitForTimeout(300);
  view = await face(page);
  const totalHeads = count(view.stats.Heads);
  const totalTails = count(view.stats.Tails);
  t.assert(totalHeads + totalTails === 40, `40 clicks produced ${totalHeads + totalTails} flips`);
  checkFace(t, view, { heads: totalHeads, tails: totalTails, labels: english });
  t.assert(view.heading === 'Landed on', `after a flip the panel says ${JSON.stringify(view.heading)}`);
  t.assert(view.latest === 'Heads' || view.latest === 'Tails', `the result box shows ${JSON.stringify(view.latest)}`);
  t.assert(view.history.length === 12, `the recent list holds ${view.history.length} results instead of 12`);
  t.assert(view.history[0] === view.latest, 'the newest result is not the one at the top of the list');

  // ── 3. Space flips from the page, and only once per press.
  const before = count((await face(page)).stats.Total);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press(' ');
  await page.waitForTimeout(250);
  t.assert(count((await face(page)).stats.Total) === before + 1, 'Space did not flip exactly once');

  // ── 4. Space on a focused button presses that button — it does not flip.
  await reset.focus();
  await page.keyboard.press(' ');
  await page.waitForTimeout(300);
  view = await face(page);
  t.assert(view.stats.Total === '0', `Space on Reset tally left ${view.stats.Total} flips instead of resetting`);
  t.assert(view.history.length === 0, 'Reset tally left results in the recent list');

  for (let i = 0; i < 3; i++) await flip.click();
  await page.waitForTimeout(200);
  const beforeButtonSpace = count((await face(page)).stats.Total);
  await flip.focus();
  await page.keyboard.press(' ');
  await page.waitForTimeout(250);
  t.assert(
    count((await face(page)).stats.Total) === beforeButtonSpace + 1,
    'Space on the focused flip button flipped more than once',
  );

  // ── 5. Holding the key does not flood the tally with repeats.
  const beforeRepeat = count((await face(page)).stats.Total);
  await page.evaluate(() => {
    for (let i = 0; i < 5; i++) window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true }));
  });
  await page.waitForTimeout(250);
  t.assert(
    count((await face(page)).stats.Total) === beforeRepeat,
    `five auto-repeats added ${count((await face(page)).stats.Total) - beforeRepeat} flips`,
  );

  // ── 6. Space inside a choice field types a space instead of flipping.
  const choices = page.locator('main input[type=text]');
  const beforeTyping = count((await face(page)).stats.Total);
  await choices.nth(0).fill('');
  await choices.nth(0).click();
  await page.keyboard.type('짜장 면 ');
  await page.waitForTimeout(300);
  t.assert(count((await face(page)).stats.Total) === beforeTyping, 'typing a space in a choice field flipped the coin');
  t.assert((await choices.nth(0).inputValue()) === '짜장 면 ', 'the choice field lost the typed space');

  // ── 7. Custom labels reach the result, the tally and the saved history.
  await choices.nth(0).fill('짜장면');
  await choices.nth(1).fill('짬뽕');
  await page.waitForTimeout(300);
  for (let i = 0; i < 6; i++) await flip.click();
  await page.waitForTimeout(300);
  view = await face(page);
  const custom = { heads: '짜장면', tails: '짬뽕' };
  const customHeads = count(view.stats['짜장면']);
  const customTails = count(view.stats['짬뽕']);
  checkFace(t, view, { heads: customHeads, tails: customTails, labels: custom });
  t.assert(
    view.latest === '짜장면' || view.latest === '짬뽕',
    `the result box still shows ${JSON.stringify(view.latest)} with custom labels`,
  );
  t.assert(
    view.history.every((label) => label === '짜장면' || label === '짬뽕'),
    `the recent list kept old labels: ${JSON.stringify(view.history)}`,
  );

  // ── 8. The tally and the labels survive a reload.
  const saved = view;
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(700);
  view = await face(page);
  t.assert(view.stats.Total === saved.stats.Total, `a reload lost the tally (${view.stats.Total})`);
  t.assert(view.stats['짜장면'] === saved.stats['짜장면'], 'a reload lost the custom labels');
  t.assert(
    (await page.locator('main input[type=text]').nth(0).inputValue()) === '짜장면',
    'a reload lost the first choice',
  );

  // ── 9. A very one-sided tally still adds up to 100% (it printed 100% and 1% before).
  await page.evaluate(() => {
    localStorage.setItem(
      'tools:coin-flip:state',
      JSON.stringify({ history: ['heads', 'tails', 'heads'], heads: 199, tails: 1 }),
    );
    localStorage.setItem('tools:coin-flip:labels', JSON.stringify({ heads: 'Heads', tails: 'Tails' }));
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(600);
  view = await face(page);
  checkFace(t, view, { heads: 199, tails: 1, labels: english });
  t.assert(share(view.stats.Heads) === 100, `199 of 200 flips reads ${view.stats.Heads}`);
  t.assert(share(view.stats.Tails) === 0, `1 of 200 flips reads ${view.stats.Tails}`);

  // ── 10. Reset clears the tally and the list, and the button goes back to disabled.
  await reset.click();
  await page.waitForTimeout(300);
  view = await face(page);
  checkFace(t, view, { heads: 0, tails: 0, labels: english });
  t.assert(view.latest === '—', 'Reset tally left a result on screen');
  t.assert(await reset.isDisabled(), 'Reset tally stays enabled after a reset');

  // ── 11. The Korean page flips and tallies too, with its own default choices.
  await page.evaluate(() => {
    localStorage.removeItem('tools:coin-flip:state');
    localStorage.removeItem('tools:coin-flip:labels');
  });
  await t.open('/ko/coin-flip');
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: '동전 던지기', exact: true }).click();
  await page.waitForTimeout(300);
  const korean = await face(page);
  t.assert(korean.stats['앞면'] !== undefined, `the Korean tally has no 앞면 tile (${JSON.stringify(korean.stats)})`);
  t.assert(korean.stats['누적'] === '1', `the Korean total reads ${korean.stats['누적']}`);
  t.assert(korean.heading === '나온 면', `the Korean result panel says ${JSON.stringify(korean.heading)}`);

  // ── 12. 375 px, dark: no sideways scrolling, no page error.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

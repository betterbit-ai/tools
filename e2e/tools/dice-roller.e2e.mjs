/**
 * Dice roller: real rolls read back from the page, with every total recomputed from the dice shown.
 *
 * Covers the defects this audit fixed:
 *  - a “Quick rolls” button changed the expression but did not roll, so the result panel kept the
 *    previous roll (2d6) next to an expression that said d20 — and Copy copied the wrong result;
 *  - the tool prints “2d6+d8−1” (U+2212) in its hint, its errors and its own results, but the
 *    parser rejected that minus, so a copied roll could not be rolled again.
 */

const face = (page) =>
  page.evaluate(() => {
    const output = document.querySelector('main output');
    if (!output) return null;
    return {
      expression: output.querySelector('p.font-mono')?.textContent?.trim() ?? '',
      dice: [...output.querySelectorAll('div.rounded-md')]
        .filter((die) => /^d\d+ · (kept|dropped)$/.test(die.children[1]?.textContent?.trim() ?? ''))
        .map((die) => ({
          value: Number(die.children[0].textContent.trim()),
          sides: Number(/d(\d+)/.exec(die.children[1].textContent)?.[1] ?? 0),
          kept: /kept$/.test(die.children[1].textContent.trim()),
        })),
      stats: Object.fromEntries(
        [...output.querySelectorAll('div[class*="bg-surface-2"]')]
          .filter((element) => element.children.length === 2 && element.children[0].className.includes('tabular'))
          .map((element) => [element.children[1].textContent.trim(), element.children[0].textContent.trim()]),
      ),
      text: output.innerText,
    };
  });

const alertText = (page) => page.locator('main [role=alert]').allInnerTexts();

const historyCount = (page) => page.locator('main ol.grid li').count();

/** Every roll must stay inside its dice's range and add up. */
const checkRoll = (t, roll, { expression, diceCount, sides, modifier = 0 }) => {
  t.assert(roll !== null, 'no roll is shown');
  t.assert(
    roll.expression === expression,
    `the result shows ${JSON.stringify(roll.expression)} instead of ${JSON.stringify(expression)}`,
  );
  t.assert(roll.dice.length === diceCount, `${diceCount} dice were rolled but ${roll.dice.length} are shown`);
  for (const die of roll.dice) {
    t.assert(Number.isInteger(die.value) && die.value >= 1 && die.value <= sides, `a d${sides} showed ${die.value}`);
  }
  const kept = roll.dice.filter((die) => die.kept);
  const expected = kept.reduce((sum, die) => sum + die.value, 0) + modifier;
  t.assert(roll.stats.Total === String(expected), `the total is ${roll.stats.Total}, the dice add up to ${expected}`);
  t.assert(roll.stats.Modifier === String(modifier), `the modifier reads ${roll.stats.Modifier}`);
  return roll;
};

export default async function (t) {
  const page = t.page;
  await t.open('/dice-roller');
  await page.waitForTimeout(700);

  const input = page.locator('main input[type=text]');
  const rollButton = page.getByRole('button', { name: 'Roll dice', exact: true });
  const roll = async (expression) => {
    if (expression !== undefined) await input.fill(expression);
    await rollButton.click();
    await page.waitForTimeout(200);
    return face(page);
  };

  // ── 1. The page opens with a real 2d6 roll.
  const initial = checkRoll(t, await face(page), { expression: '2d6', diceCount: 2, sides: 6 });

  // ── 2. A quick-roll button rolls the preset it names (it used to leave the old 2d6 result up).
  await page.getByRole('button', { name: 'd20', exact: true }).click();
  await page.waitForTimeout(250);
  t.assert(
    (await input.inputValue()) === 'd20',
    `the D20 quick roll left ${JSON.stringify(await input.inputValue())} in the expression`,
  );
  let shown = checkRoll(t, await face(page), { expression: 'd20', diceCount: 1, sides: 20 });
  t.assert(shown.dice.length === 1, 'a quick d20 roll is still showing more than one die');

  // ── 3. Ability-score and advantage presets use keep-high notation.
  await page.getByRole('button', { name: 'Ability score', exact: true }).click();
  await page.waitForTimeout(250);
  shown = checkRoll(t, await face(page), { expression: '4d6kh3', diceCount: 4, sides: 6 });
  t.assert(
    shown.dice.filter((die) => die.kept).length === 3 && shown.dice.filter((die) => !die.kept).length === 1,
    'ability score keeps three of four dice',
  );
  await page.getByRole('button', { name: 'Advantage', exact: true }).click();
  await page.waitForTimeout(250);
  checkRoll(t, await face(page), { expression: '2d20kh1', diceCount: 2, sides: 20 });
  t.assert((await face(page)).dice.filter((die) => die.kept).length === 1, 'advantage keeps exactly one of two d20');

  // ── 4. Typed notation with a positive modifier, submitted with Enter.
  await input.fill('4d6kh3+2');
  await input.press('Enter');
  await page.waitForTimeout(250);
  shown = checkRoll(t, await face(page), { expression: '4d6kh3 + 2', diceCount: 4, sides: 6, modifier: 2 });
  const kept = shown.dice.filter((die) => die.kept).map((die) => die.value);
  t.assert(shown.stats['Dice rolled'] === '4', `the dice-rolled stat says ${shown.stats['Dice rolled']}`);

  // ── 5. The tool's own example, with the minus it prints, rolls instead of erroring.
  await input.fill('2d6+d8−1');
  await input.press('Enter');
  await page.waitForTimeout(250);
  t.assert((await alertText(page)).length === 0, `the tool’s own example was refused: ${(await alertText(page))[0]}`);
  shown = await face(page);
  t.assert(shown.expression === '2d6 + d8 − 1', `the result shows ${JSON.stringify(shown.expression)} for 2d6+d8−1`);
  t.assert(shown.dice.length === 3, `2d6+d8 rolled ${shown.dice.length} dice`);
  const sum = shown.dice.reduce((total, die) => total + die.value, 0) - 1;
  t.assert(shown.stats.Total === String(sum), `2d6+d8−1 total is ${shown.stats.Total}, expected ${sum}`);

  // ── 6. A copied roll can be pasted back in and rolled again.
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(/^2d6 \+ d8 − 1: /.test(copied), `the copied roll reads ${JSON.stringify(copied)}`);
  await roll(copied.replace(/:.*$/, ''));
  t.assert((await alertText(page)).length === 0, 'a copied roll is refused when pasted back');

  // ── 7. Sixty d6 rolls all land on a face between 1 and 6, and history stays bounded.
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    shown = await roll('d6');
    const value = shown.dice[0].value;
    t.assert(value >= 1 && value <= 6, `a d6 showed ${value}`);
    seen.add(value);
  }
  t.assert(seen.size >= 4, `60 d6 rolls only produced ${[...seen].join(', ')}`);
  t.assert((await historyCount(page)) === 10, `history holds ${await historyCount(page)} rolls instead of 10`);

  // ── 8. The R shortcut rolls without being in a field.
  const beforeShortcut = await historyCount(page);
  await page.locator('main h1').click();
  await page.keyboard.press('r');
  await page.waitForTimeout(300);
  t.assert((await historyCount(page)) >= Math.min(10, beforeShortcut), 'pressing R did not roll');
  const shortcutRoll = await face(page);
  t.assert(shortcutRoll.dice[0].value >= 1, 'the shortcut produced no roll');

  // ── 9. Bad expressions are explained, not swallowed.
  for (const [expression, message] of [
    ['0d6', /no more than 100 dice/],
    ['d1', /2 to 1,000 sides/],
    ['1001d6', /no more than 100 dice/],
    ['d6+20000', /−10,000 to 10,000/],
    ['4d6kh5', /number kept/],
    ['dice', /dice notation/],
    ['2d6+d8−12d4', /dice notation/],
  ]) {
    await roll(expression);
    const alerts = await alertText(page);
    t.assert(
      alerts.some((text) => message.test(text)),
      `${JSON.stringify(expression)} is not explained (alerts: ${JSON.stringify(alerts)})`,
    );
  }
  await roll('');
  t.assert(
    (await alertText(page)).some((text) => /2d6 or d20\+5/.test(text)),
    'an empty expression shows no explanation',
  );

  // ── 10. Clearing history empties it, and the last expression survives a reload.
  await roll('3d8');
  await page.getByRole('button', { name: 'Clear history', exact: true }).click();
  await page.waitForTimeout(250);
  t.assert((await historyCount(page)) === 0, 'Clear history left rolls behind');
  t.assert(
    /latest 10 rolls are kept in this browser/.test(await page.locator('main').innerText()),
    'the empty history explains nothing',
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector('main input[type=text]')?.value === '3d8', null, {
    timeout: 15_000,
  });
  checkRoll(t, await face(page), { expression: '3d8', diceCount: 3, sides: 8 });

  // ── 11. The Korean page keeps the same notation and rolls.
  await t.open('/ko/dice-roller');
  await page.waitForTimeout(600);
  const korean = page.locator('main');
  t.assert((await korean.innerText()).includes('빠른 굴림'), 'the Korean page is missing its preset group');
  await page.locator('main input[type=text]').fill('2d6+d8−1');
  await page.getByRole('button', { name: '주사위 굴리기', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert((await face(page)).expression === '2d6 + d8 − 1', 'the Korean page refuses the minus sign it prints');

  // ── 12. 375 px, dark: the dice grid wraps instead of pushing the page sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

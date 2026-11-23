/**
 * Random number generator: the draws a real visitor makes — a die, a raffle without repeats,
 * a quadrillion-wide range — read from the page's own output, with every value checked here.
 *
 * Covers the defects this audit fixed:
 *  - the preset buttons changed the range but left the previous draw on screen, labelled with the
 *    new range, until Generate was pressed again;
 *  - a bound above the old ±1,000,000,000 limit was blocked by the browser's own form validation,
 *    so pressing Generate did nothing at all and the stale result stayed;
 *  - ranges wider than 2³² values threw, although the bounds advertised whole numbers up to a
 *    quadrillion.
 */

const lines = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
const values = async (page) =>
  (await page.locator('main output').count()) ? lines(await page.locator('main output').innerText()).map(Number) : [];

/** The value in the stat whose label is `label`. */
async function stat(page, label) {
  return page.evaluate((wanted) => {
    for (const element of document.querySelectorAll('main div')) {
      if (element.children.length !== 2) continue;
      const [value, name] = [element.children[0], element.children[1]];
      if (name.textContent?.trim() !== wanted || name.children.length !== 0) continue;
      if (value.children.length !== 0) continue;
      return value.textContent?.trim() ?? null;
    }
    return null;
  }, label);
}

/** The danger notices on the page, i.e. what the tool says is wrong with the input. */
async function alerts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert]')].map((element) => element.textContent?.trim() ?? ''),
  );
}

const within = (list, min, max) => list.every((value) => Number.isInteger(value) && value >= min && value <= max);

/** Waits for the debounced redraw that follows a settings change. */
const settle = (page) => page.waitForTimeout(400);

export default async function (t) {
  const page = t.page;
  await t.open('/ko/random-number');

  const minField = page.getByLabel(/최솟값/);
  const maxField = page.getByLabel(/최댓값/);
  const countField = page.getByLabel(/생성 개수/);
  const generate = page.getByRole('button', { name: '숫자 생성', exact: true });

  // ── 1. The page opens with one usable number, not an empty box.
  await settle(page);
  const opening = await values(page);
  t.assert(opening.length === 1 && within(opening, 1, 100), `the opening draw is not one value from 1–100: ${opening}`);
  t.assert((await stat(page, '생성 개수')) === '1', `opening count stat: ${await stat(page, '생성 개수')}`);
  t.assert((await stat(page, '범위')) === '1–100', `opening range stat: ${await stat(page, '범위')}`);
  t.assert((await alerts(page)).length === 0, `the page opens with an error: ${(await alerts(page)).join(' | ')}`);

  // ── 2. Editing the range redraws by itself, and every value stays inside the new range.
  await minField.fill('1');
  await maxField.fill('10');
  await countField.fill('20');
  await settle(page);
  const ten = await values(page);
  t.assert(ten.length === 20, `20 draws produced ${ten.length} numbers`);
  t.assert(within(ten, 1, 10), `a 1–10 draw produced values outside the range: ${ten.filter((v) => v < 1 || v > 10)}`);
  t.assert((await stat(page, '범위')) === '1–10', `range stat after editing: ${await stat(page, '범위')}`);
  t.assert(new Set(ten).size > 1, 'repeats allowed, yet the draw only ever produced one value');

  // ── 3. A quadrillion-wide range is drawn, not rejected and not silently ignored.
  await maxField.fill('1000000000000');
  await countField.fill('3');
  await settle(page);
  const huge = await values(page);
  t.assert((await alerts(page)).length === 0, `1–1,000,000,000,000 raised ${(await alerts(page)).join(' | ')}`);
  t.assert(huge.length === 3 && within(huge, 1, 1_000_000_000_000), `quadrillion range drew ${huge}`);
  t.assert(
    huge.some((value) => value > 1_000_000_000),
    `every value from a 1,000,000,000,000 range came back under a billion: ${huge}`,
  );
  t.assert(
    (await maxField.inputValue()) === '1000000000000',
    `the max field lost its value: ${await maxField.inputValue()}`,
  );

  // Negative bounds, typed the way a statistics exercise writes them.
  await minField.fill('-50');
  await maxField.fill('50');
  await countField.fill('40');
  await settle(page);
  const signed = await values(page);
  t.assert(signed.length === 40 && within(signed, -50, 50), `-50–50 draw: ${signed}`);
  t.assert(
    signed.some((value) => value < 0),
    '-50–50 never produced a negative number',
  );

  // ── 4. The preset buttons redraw the numbers they name.
  await page.getByRole('button', { name: /주사위/ }).click();
  await settle(page);
  const die = await values(page);
  t.assert(die.length === 1 && within(die, 1, 6), `the die preset drew ${die}`);
  t.assert((await stat(page, '범위')) === '1–6', `die preset range stat: ${await stat(page, '범위')}`);

  await page.getByRole('button', { name: /로또/ }).click();
  await settle(page);
  const lottery = await values(page);
  t.assert(lottery.length === 6, `the lottery preset drew ${lottery.length} numbers: ${lottery}`);
  t.assert(within(lottery, 1, 45), `lottery numbers outside 1–45: ${lottery}`);
  t.assert(new Set(lottery).size === 6, `lottery numbers repeat: ${lottery}`);
  t.assert(
    lottery.every((value, index) => index === 0 || lottery[index - 1] <= value),
    `lottery numbers are not ascending: ${lottery}`,
  );

  // ── 5. No repeats holds on a range that is not sorted, and reports a range that cannot hold them.
  await page.getByRole('button', { name: /중 10개/ }).click();
  await settle(page);
  const tenOfHundred = await values(page);
  t.assert(tenOfHundred.length === 10 && within(tenOfHundred, 1, 100), `10 from 1–100: ${tenOfHundred}`);

  const repeats = page.getByRole('checkbox', { name: /중복 없음/ });
  await page.getByText('중복 없음', { exact: true }).click();
  await settle(page);
  t.assert(await repeats.isChecked(), 'the no-repeat switch did not turn on');
  await minField.fill('1');
  await maxField.fill('6');
  await countField.fill('10');
  await settle(page);
  t.assert(
    (await alerts(page)).some((text) => /중복 없이 뽑을 수 있는/.test(text)),
    `1–6 with 10 no-repeat draws shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  await countField.fill('6');
  await settle(page);
  const sixOfSix = await values(page);
  t.assert(
    [...sixOfSix].sort((a, b) => a - b).join(',') === '1,2,3,4,5,6',
    `six no-repeat draws from 1–6 did not cover the range: ${sixOfSix}`,
  );

  // ── 6. Sort order changes the order it claims to.
  await page.getByLabel(/결과 순서/).selectOption('desc');
  await settle(page);
  const descending = await values(page);
  t.assert(
    descending.every((value, index) => index === 0 || descending[index - 1] >= value),
    `descending order is not descending: ${descending}`,
  );
  await page.getByLabel(/결과 순서/).selectOption('asc');
  await settle(page);
  const ascending = await values(page);
  t.assert(
    ascending.every((value, index) => index === 0 || ascending[index - 1] <= value),
    `ascending order is not ascending: ${ascending}`,
  );
  await page.getByLabel(/결과 순서/).selectOption('draw');
  await settle(page);

  // ── 7. Bad input is explained in the page, never a silent no-op.
  await minField.fill('10');
  await maxField.fill('1');
  await settle(page);
  t.assert(
    (await alerts(page)).some((text) => /최솟값은 최댓값보다 클 수 없습니다/.test(text)),
    `min above max shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  await maxField.fill('1001');
  await minField.fill('1');
  await settle(page);
  await maxField.fill('2000000000000000');
  await settle(page);
  t.assert(
    (await alerts(page)).some((text) => /1,000,000,000,000,000/.test(text)),
    `a bound past the guardrail shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  t.assert((await values(page)).length === 0, 'a number was still shown while the bounds were invalid');

  // A cleared count is invalid, not a zero-length draw.
  await maxField.fill('45');
  await countField.fill('');
  await settle(page);
  t.assert(
    (await alerts(page)).some((text) => /1,000,000,000,000,000|개수/.test(text)),
    `an empty count shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );

  // ── 8. Generate and the G shortcut draw again from the same settings.
  await countField.fill('5');
  await settle(page);
  const beforeGenerate = await values(page);
  await generate.click();
  await page.waitForTimeout(250);
  const afterGenerate = await values(page);
  t.assert(afterGenerate.length === 5 && within(afterGenerate, 1, 45), `Generate drew ${afterGenerate}`);
  t.assert(beforeGenerate.join() !== afterGenerate.join(), 'Generate did not draw a new set');

  await page.getByRole('heading', { name: '랜덤 숫자 생성기', level: 1 }).click();
  const beforeKey = await values(page);
  await page.keyboard.press('g');
  await page.waitForTimeout(250);
  t.assert((await values(page)).join() !== beforeKey.join(), 'G outside a field did not draw a new set');
  await minField.click();
  await page.keyboard.press('g');
  await page.waitForTimeout(250);
  t.assert((await minField.inputValue()).includes('g') === false, 'the letter g was typed into the number field');

  // ── 9. Copy gives the same newline-separated list that is on screen.
  await countField.fill('4');
  await settle(page);
  const copied = await values(page);
  await page.getByRole('button', { name: '복사', exact: true }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(
    clipboard
      .split('\n')
      .map((line) => Number(line.trim()))
      .join() === copied.join(),
    `clipboard does not match the result: ${JSON.stringify(clipboard)} vs ${copied}`,
  );

  // ── 10. A reload keeps the settings and draws with them.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await settle(page);
  t.assert((await maxField.inputValue()) === '45', `reload lost the maximum: ${await maxField.inputValue()}`);
  t.assert((await countField.inputValue()) === '4', `reload lost the count: ${await countField.inputValue()}`);
  const reloaded = await values(page);
  t.assert(
    reloaded.length === 4 && within(reloaded, 1, 45) && new Set(reloaded).size === 4,
    `the draw after reload does not follow the restored settings: ${reloaded}`,
  );

  // ── 11. The lottery landing page opens on its own settings and draws.
  await t.open('/ko/random-number/lottery-6-45');
  await settle(page);
  const landing = await values(page);
  t.assert(landing.length === 6 && within(landing, 1, 45), `the 6/45 landing page drew ${landing}`);
  t.assert(new Set(landing).size === 6, `the 6/45 landing page repeats numbers: ${landing}`);

  // ── 12. 375px: nothing scrolls sideways and the draw button is reachable.
  await page.setViewportSize({ width: 375, height: 812 });
  await t.open('/ko/random-number');
  await settle(page);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const buttonBox = await generate.boundingBox();
  t.assert(buttonBox && buttonBox.width > 80, 'the generate button is not visible at 375px');

  // ── 13. The English page draws too.
  await page.setViewportSize({ width: 1280, height: 900 });
  await t.open('/random-number');
  await settle(page);
  const english = await lines(await page.locator('main output').innerText());
  t.assert(english.length >= 1, 'the English page shows no draw');
}

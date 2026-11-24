/**
 * Lotto generator: a real user fixing their own numbers for this week's Lotto 6/45 draw, with
 * every visible line checked here — six different numbers from 1 to 45, in ascending order,
 * including each fixed ball and none of the excluded ones.
 *
 * Covers the defect this audit fixed: the panel kept showing the previous draw after a ball or
 * the line count changed, so a "fixed" number could be missing from the line on screen (and the
 * lines stat disagreed with the selected count). A draw is now made whenever the settings change.
 */

const PICK = 6;
const MAX = 45;

function combinations(n, k) {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) result = (result * (n - Math.min(k, n - k) + i)) / i;
  return Math.round(result);
}

const grouped = (value) => new Intl.NumberFormat('en-US').format(value);

/** Each drawn line as an array of numbers, read from the <ol> the page renders. */
async function lines(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main output ol')].map((ol) =>
      [...ol.children].map((li) => Number(li.textContent.trim())),
    ),
  );
}

/** The Stat cards in the tool: { label: value }. */
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

const ball = (page, number) => page.getByRole('button', { name: new RegExp(`^${String(number).padStart(2, '0')}: `) });

function checkLine(t, line, { fixed = [], excluded = [], label = 'line' }) {
  t.assert(line.length === PICK, `${label} has ${line.length} numbers instead of ${PICK}: ${line.join(' ')}`);
  t.assert(new Set(line).size === PICK, `${label} repeats a number: ${line.join(' ')}`);
  t.assert(
    line.every((n) => Number.isInteger(n) && n >= 1 && n <= MAX),
    `${label} has a number outside 1–45: ${line.join(' ')}`,
  );
  t.assert(
    line.every((n, i) => i === 0 || line[i - 1] < n),
    `${label} is not in ascending order: ${line.join(' ')}`,
  );
  for (const number of fixed) t.assert(line.includes(number), `${label} is missing fixed ${number}: ${line.join(' ')}`);
  for (const number of excluded)
    t.assert(!line.includes(number), `${label} contains excluded ${number}: ${line.join(' ')}`);
}

export default async function (t) {
  const page = t.page;
  await t.open('/lotto-generator');
  await page.waitForTimeout(500);

  // ── 1. The page opens with a usable quick pick, not an empty panel.
  let drawn = await lines(page);
  t.assert(drawn.length === 1, `the page opens with ${drawn.length} lines`);
  checkLine(t, drawn[0], { label: 'the first line' });
  let shown = await stats(page);
  t.assert(
    shown['Possible combinations'] === grouped(combinations(45, 6)),
    `possible combinations: ${shown['Possible combinations']}`,
  );
  t.assert(shown['Fixed balls'] === '0' && shown['Excluded balls'] === '0', 'the page opens with a selection');
  t.assert(
    (await page.getByRole('button', { name: /: (Unselected|Fixed|Excluded)$/ }).count()) === 45,
    'the board does not show 45 balls',
  );

  // A fresh draw is a draw: same six-number format, and the button works from the keyboard.
  await page.getByRole('button', { name: 'Generate Lotto numbers' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  checkLine(t, (await lines(page))[0], { label: 'the line after pressing Enter on Generate' });

  // ── 2. Fixing a ball puts it in every line and the panel follows immediately.
  await ball(page, 7).click();
  await page.waitForTimeout(300);
  t.assert(
    (await page.getByRole('button', { name: '07: Fixed' }).count()) === 1,
    'the fixed ball does not report its state',
  );
  drawn = await lines(page);
  checkLine(t, drawn[0], { fixed: [7], label: 'the line after fixing 07' });
  shown = await stats(page);
  t.assert(shown['Fixed balls'] === '1', `fixed count reads ${shown['Fixed balls']}`);
  t.assert(
    shown['Possible combinations'] === grouped(combinations(44, 5)),
    `with one fixed ball the combinations read ${shown['Possible combinations']}`,
  );

  // ── 3. The same ball becomes an exclusion; no line may contain it any more.
  await ball(page, 7).click();
  await page.waitForTimeout(300);
  drawn = await lines(page);
  checkLine(t, drawn[0], { excluded: [7], label: 'the line after excluding 07' });
  shown = await stats(page);
  t.assert(shown['Excluded balls'] === '1', `excluded count reads ${shown['Excluded balls']}`);
  t.assert(
    shown['Possible combinations'] === grouped(combinations(44, 6)),
    `with one excluded ball the combinations read ${shown['Possible combinations']}`,
  );

  // A third click clears the choice.
  await ball(page, 7).click();
  await page.waitForTimeout(250);
  t.assert(
    (await page.getByRole('button', { name: '07: Unselected' }).count()) === 1,
    'clicking an excluded ball did not clear it',
  );

  // ── 4. Two fixed and three excluded numbers, the way someone plays a set of numbers.
  for (const number of [7, 21]) await ball(page, number).click();
  for (const number of [1, 2, 3]) {
    await ball(page, number).click();
    await ball(page, number).click();
  }
  await page.waitForTimeout(400);
  shown = await stats(page);
  t.assert(
    shown['Fixed balls'] === '2' && shown['Excluded balls'] === '3',
    `counts read ${shown['Fixed balls']}/${shown['Excluded balls']}`,
  );
  const expectedCount = combinations(MAX - 2 - 3, PICK - 2);
  t.assert(
    shown['Possible combinations'] === grouped(expectedCount),
    `2 fixed and 3 excluded should leave ${grouped(expectedCount)} combinations, page shows ${shown['Possible combinations']}`,
  );
  drawn = await lines(page);
  checkLine(t, drawn[0], { fixed: [7, 21], excluded: [1, 2, 3], label: 'the constrained line' });

  // ── 5. Five lines, the maximum. Each line stands alone and keeps the constraints.
  await page.getByRole('radio', { name: '5', exact: true }).click();
  await page.waitForTimeout(400);
  drawn = await lines(page);
  t.assert(drawn.length === 5, `choosing 5 lines shows ${drawn.length}`);
  drawn.forEach((line, index) =>
    checkLine(t, line, { fixed: [7, 21], excluded: [1, 2, 3], label: `line ${index + 1}` }),
  );
  shown = await stats(page);
  t.assert(shown['Lines'] === '5', `the lines stat reads ${shown['Lines']} after choosing 5`);

  // ── 6. Six fixed numbers are the whole line.
  for (const number of [11, 19, 27, 33]) await ball(page, number).click();
  await page.waitForTimeout(400);
  drawn = await lines(page);
  t.assert(
    drawn.every((line) => line.join(' ') === '7 11 19 21 27 33'),
    `with six fixed numbers the lines read ${drawn.map((line) => line.join(' ')).join(' | ')}`,
  );
  shown = await stats(page);
  t.assert(
    shown['Possible combinations'] === '1',
    `six fixed numbers leave "${shown['Possible combinations']}" combinations`,
  );

  // ── 7. Clearing the selections returns to a plain quick pick.
  await page.getByRole('button', { name: 'Clear selections' }).click();
  await page.waitForTimeout(300);
  shown = await stats(page);
  t.assert(shown['Fixed balls'] === '0' && shown['Excluded balls'] === '0', 'clear selections left a ball selected');
  t.assert(
    shown['Possible combinations'] === grouped(combinations(45, 6)),
    `after clearing, combinations read ${shown['Possible combinations']}`,
  );
  drawn = await lines(page);
  t.assert(drawn.length === 5, `after clearing, ${drawn.length} lines are shown`);

  // ── 8. Copy gives the same lines the panel shows, in the same order.
  await page.getByRole('button', { name: 'Copy' }).first().click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const expectedCopy = drawn
    .map((line, index) => `Line ${index + 1}: ${line.map((n) => String(n).padStart(2, '0')).join(' ')}`)
    .join('\n');
  t.assert(copied === expectedCopy, `copied text was "${copied.replace(/\n/g, ' / ')}"`);

  // ── 9. The keyboard shortcut draws again outside a field.
  const beforeG = (await lines(page)).map((line) => line.join(' ')).join('|');
  await page.locator('main h1, main h2').first().click();
  await page.keyboard.press('g');
  await page.waitForTimeout(400);
  const afterG = (await lines(page)).map((line) => line.join(' ')).join('|');
  t.assert(beforeG !== afterG, 'pressing G did not draw new lines');
  (await lines(page)).forEach((line, index) => checkLine(t, line, { label: `line ${index + 1} after G` }));

  // ── 10. Settings and a fresh valid draw come back after a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(600);
  shown = await stats(page);
  t.assert(shown['Fixed balls'] === '0' && shown['Excluded balls'] === '0', 'the reload lost the cleared selection');
  drawn = await lines(page);
  t.assert(drawn.length === 5, `after reload ${drawn.length} lines are shown instead of 5`);
  drawn.forEach((line, index) => checkLine(t, line, { label: `line ${index + 1} after reload` }));

  // ── 11. A set that cannot make a line is explained instead of drawn.
  for (let number = 1; number <= 39; number++) {
    await ball(page, number).click();
    await ball(page, number).click();
  }
  await page.waitForTimeout(800);
  shown = await stats(page);
  t.assert(shown['Excluded balls'] === '39', `39 exclusions read ${shown['Excluded balls']}`);
  t.assert(
    shown['Possible combinations'] === '1',
    `39 exclusions leave "${shown['Possible combinations']}" combinations`,
  );
  drawn = await lines(page);
  t.assert(drawn.length === 5, `with six numbers left, ${drawn.length} lines are shown`);
  t.assert(
    drawn.every((line) => line.join(' ') === '40 41 42 43 44 45'),
    `the only remaining line should be 40–45, got ${drawn.map((l) => l.join(' ')).join(' | ')}`,
  );

  await ball(page, 40).click();
  await ball(page, 40).click();
  await page.waitForTimeout(500);
  const error = await page.locator('main [role=alert]').allInnerTexts();
  t.assert(
    error.some((text) => /at least 6 numbers available/.test(text)),
    `40 exclusions show "${error.join(' | ')}"`,
  );
  t.assert((await lines(page)).length === 0, 'lines are still shown when no valid line can be drawn');

  // ── 12. The Korean page labels and draws the same way.
  await t.open('/ko/lotto-generator');
  await page.waitForTimeout(600);
  await ball(page, 7).click();
  await page.waitForTimeout(300);
  drawn = await lines(page);
  checkLine(t, drawn[0], { fixed: [7], label: 'the Korean page line' });
  await page.getByRole('button', { name: '복사' }).first().click();
  await page.waitForTimeout(250);
  const koCopied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(/^1게임: (\d{2} ){5}\d{2}$/.test(koCopied), `the Korean copy text is "${koCopied}"`);
  t.assert(
    (await page.locator('main').innerText()).includes('고정수'),
    'the Korean page does not label the fixed-ball count',
  );

  // ── 13. 375 px: the 45 balls fit, the results stack, nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(await page.locator('main button[aria-label^="45:"]').isVisible(), 'the last ball is not visible at 375px');
}

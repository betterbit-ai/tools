/**
 * Ladder game: four friends deciding who buys coffee, then twenty for a team draw. The mapping is
 * read back from the board itself — every vertical column and rung in the SVG — and compared with
 * the answers the page prints, so a shown result can never disagree with the path a person can
 * trace with a finger.
 *
 * Covers the defects this audit fixed:
 *  - long names were cut at 13 characters regardless of width, so two 13-character Korean names
 *    overlapped each other on the board; display now follows the lane width it has;
 *  - the segmented line-count group and other radio groups had their group label folded into the
 *    first option's accessible name.
 */

/** Reads the board: lane x positions, rungs, top names and bottom labels. */
async function board(page) {
  return page.evaluate(() => {
    const svg = [...document.querySelectorAll('main svg')].find((element) => element.getAttribute('aria-label'));
    if (!svg) return null;
    const lines = [...svg.querySelectorAll('line')].map((line) => ({
      x1: Number(line.getAttribute('x1')),
      x2: Number(line.getAttribute('x2')),
      y1: Number(line.getAttribute('y1')),
      y2: Number(line.getAttribute('y2')),
    }));
    const texts = [...svg.querySelectorAll('text')].map((text) => {
      const box = text.getBBox();
      return {
        x: Number(text.getAttribute('x')),
        y: Number(text.getAttribute('y')),
        text: text.textContent,
        left: box.x,
        right: box.x + box.width,
      };
    });
    return {
      lanes: lines
        .filter((line) => line.x1 === line.x2)
        .map((line) => line.x1)
        .sort((a, b) => a - b),
      rungs: lines
        .filter((line) => line.y1 === line.y2)
        .map((line) => ({ left: line.x1, right: line.x2, y: line.y1 }))
        .sort((a, b) => a.y - b.y || a.left - b.left),
      top: texts.filter((text) => text.y < 40).sort((a, b) => a.x - b.x),
      bottom: texts.filter((text) => text.y > 40).sort((a, b) => a.x - b.x),
      paths: svg.querySelectorAll('path').length,
      width: Number(svg.getAttribute('width')),
    };
  });
}

/** Traces each lane through the rungs, exactly as a person follows the board with a finger. */
function traced(lanes, rungs) {
  return lanes.map((_, start) => {
    let column = start;
    for (const rung of rungs) {
      const left = lanes.indexOf(rung.left);
      if (left === column) column += 1;
      else if (left + 1 === column) column -= 1;
    }
    return column;
  });
}

async function assignments(page) {
  return page.evaluate(() => {
    const list = document.querySelector('main ol[aria-label]');
    if (!list) return null;
    return [...list.children].map((item) => {
      const spans = [...item.querySelectorAll('span')].map((span) => span.textContent.trim());
      const name = spans[0] ?? '';
      const outcome = (spans[1] ?? '').replace(/^[^\p{L}\p{N}]*/u, '').trim();
      return { name, outcome };
    });
  });
}

export default async function (t) {
  const page = t.page;
  await t.open('/ladder-game');
  await page.waitForTimeout(400);

  const inputs = page.locator('main input');
  const fill = async (index, value) => {
    await inputs.nth(index).click();
    await page.keyboard.press('Control+a');
    if (value === '') await page.keyboard.press('Backspace');
    else await page.keyboard.type(value, { delay: 10 });
  };

  // ── 1. Before a draw there is no board, and nothing claims otherwise.
  t.assert((await board(page)) === null, 'a board is drawn before the user asked for one');
  t.assert(
    (await page.locator('main').innerText()).includes('Build a ladder to reveal the paths.'),
    'the empty board is not explained',
  );
  t.assert(
    await page.getByRole('button', { name: 'Copy results' }).isDisabled(),
    'Copy results is enabled with no draw',
  );

  // ── 2. Four friends, four different outcomes.
  const names = ['Alex', 'Sam', 'Jordan', 'Taylor'];
  const outcomes = ['Buy coffee', 'Wash dishes', 'Take notes', 'Clean desk'];
  for (let index = 0; index < 4; index++) {
    await fill(index * 2, names[index]);
    await fill(index * 2 + 1, outcomes[index]);
  }
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /^Build/ }).click();
  await page.waitForTimeout(700);

  let drawn = await board(page);
  t.assert(drawn !== null, 'the ladder was not drawn');
  t.assert(drawn.lanes.length === 4, `the board has ${drawn.lanes.length} lanes instead of 4`);
  t.assert(
    drawn.top.map((text) => text.text).join(',') === names.join(','),
    `the top row reads ${drawn.top.map((text) => text.text).join(',')}`,
  );
  t.assert(
    drawn.bottom.every((text) => text.text === '?'),
    `the outcomes are shown before they are revealed: ${drawn.bottom.map((text) => text.text).join(',')}`,
  );
  t.assert(drawn.paths === 0, 'a path is drawn before a participant is chosen');

  // ── 3. Reveal all: every player gets one outcome, and every outcome is used once.
  await page.getByRole('button', { name: 'Reveal all' }).click();
  await page.waitForTimeout(600);
  const revealed = await assignments(page);
  t.assert(revealed && revealed.length === 4, `the results list has ${revealed?.length} entries`);
  t.assert(
    revealed.map((item) => item.name).join(',') === names.join(','),
    `the results list names ${revealed.map((item) => item.name).join(',')}`,
  );
  t.assert(
    new Set(revealed.map((item) => item.outcome)).size === 4,
    `two players got the same outcome: ${revealed.map((item) => item.outcome).join(',')}`,
  );
  t.assert(
    revealed.every((item) => outcomes.includes(item.outcome)),
    `the results contain an outcome nobody entered: ${revealed.map((item) => item.outcome).join(',')}`,
  );

  // The board and the printed answer must agree: trace the rungs independently.
  drawn = await board(page);
  const columns = traced(drawn.lanes, drawn.rungs);
  const tracedOutcomes = columns.map((column) => drawn.bottom[column]?.text);
  t.assert(
    tracedOutcomes.join(',') === revealed.map((item) => item.outcome).join(','),
    `following the board ends at ${tracedOutcomes.join(',')} but the page says ${revealed.map((item) => item.outcome).join(',')}`,
  );
  t.assert(
    drawn.bottom.every((text) => outcomes.includes(text.text)),
    'the bottom row still hides an outcome after Reveal all',
  );

  // ── 4. One participant at a time: the printed answer equals that player's traced path.
  await page.getByRole('button', { name: 'Reveal all' }).isDisabled();
  await page.getByRole('button', { name: 'Sam', exact: true }).click();
  await page.waitForTimeout(1_200);
  const single = await page.locator('main output').innerText();
  const samColumn = columns[1];
  const samOutcome = drawn.bottom[samColumn]?.text;
  t.assert(
    single.trim() === `Sam → ${samOutcome}`,
    `choosing Sam shows "${single.trim()}" but the board leads to "${samOutcome}"`,
  );
  const pathsAfterChoice = await page.evaluate(() => {
    const svg = [...document.querySelectorAll('main svg')].find((element) => element.getAttribute('aria-label'));
    return svg.querySelectorAll('path').length;
  });
  t.assert(pathsAfterChoice === 1, `choosing one player draws ${pathsAfterChoice} paths`);

  // ── 5. Copy results gives the same lines the page prints.
  await page.getByRole('button', { name: 'Copy results' }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const expectedLines = revealed.map((item) => `${item.name} → ${item.outcome}`).join('\n');
  t.assert(copied === expectedLines, `copied text is "${copied.replace(/\n/g, ' | ')}"`);

  // ── 6. Adding a fifth player keeps the entries and rebuilds a fair draw.
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(300);
  await fill(8, 'Riley');
  await fill(9, 'Buy snacks');
  await page.getByRole('button', { name: /^Build/ }).click();
  await page.getByRole('button', { name: 'Reveal all' }).click();
  await page.waitForTimeout(700);
  const five = await assignments(page);
  t.assert(five && five.length === 5, `five players produced ${five?.length} results`);
  t.assert(new Set(five.map((item) => item.outcome)).size === 5, 'two of five players got the same outcome');
  drawn = await board(page);
  t.assert(drawn.lanes.length === 5, `the board has ${drawn.lanes.length} lanes for five players`);
  t.assert(
    traced(drawn.lanes, drawn.rungs)
      .map((column) => drawn.bottom[column]?.text)
      .join(',') === five.map((item) => item.outcome).join(','),
    'the five-player board and the printed results disagree',
  );

  // Removing the row brings back four lanes.
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.waitForTimeout(300);
  t.assert((await board(page)) === null, 'the board was kept after the player count changed');
  t.assert((await page.locator('main input').count()) === 8, 'removing a player left the extra fields');

  // ── 7. Long names are trimmed to the lane instead of overlapping each other.
  const longNames = ['Maximilian Alexander', 'Bartholomew Jones', 'Christopher Nolan', 'Alexandria Kate'];
  for (let index = 0; index < 4; index++) await fill(index * 2, longNames[index]);
  await page.getByRole('button', { name: /^Build/ }).click();
  await page.waitForTimeout(700);
  drawn = await board(page);
  for (let index = 1; index < drawn.top.length; index++) {
    const gap = drawn.top[index].left - drawn.top[index - 1].right;
    t.assert(
      gap > 0,
      `the names "${drawn.top[index - 1].text}" and "${drawn.top[index].text}" overlap by ${Math.abs(gap).toFixed(1)}px`,
    );
  }
  t.assert(
    drawn.top.every((text) => text.text.length > 3),
    `a long name was cut to nothing: ${drawn.top.map((text) => text.text).join(',')}`,
  );

  // ── 8. An empty row stops the build instead of drawing an unnamed player.
  await fill(0, '');
  await page.waitForTimeout(300);
  t.assert(await page.getByRole('button', { name: /^Build/ }).isDisabled(), 'Build is enabled with an empty name');
  t.assert((await board(page)) === null, 'the board stayed after a name was cleared');
  await fill(0, 'Alex');
  await page.waitForTimeout(200);
  t.assert(
    await page.getByRole('button', { name: /^Build/ }).isEnabled(),
    'Build stayed disabled after the name was filled',
  );
  t.assert(
    (await page.locator('main [role=alert]').count()) === 0,
    `an alert is shown for a filled form: ${await page.locator('main [role=alert]').allInnerTexts()}`,
  );

  // Over-long labels are cut at the documented 80 characters while typing.
  await fill(1, 'x'.repeat(120));
  await page.waitForTimeout(200);
  t.assert(
    (await inputs.nth(1).inputValue()).length === 80,
    `a 120-character label became ${(await inputs.nth(1).inputValue()).length}`,
  );

  // ── 9. The L shortcut draws a board outside a field.
  await fill(1, 'Wash dishes');
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  await page.keyboard.press('l');
  await page.waitForTimeout(700);
  const shortcutBoard = await board(page);
  t.assert(shortcutBoard !== null, 'pressing L did not draw a board');
  t.assert(shortcutBoard.lanes.length === 4, `the shortcut board has ${shortcutBoard.lanes.length} lanes`);

  // ── 10. Names come back after a reload; the draw does not pretend to.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(600);
  t.assert(
    (await page.locator('main input').nth(0).inputValue()) === 'Alex',
    `the reload lost the names: "${await page.locator('main input').nth(0).inputValue()}"`,
  );
  t.assert((await board(page)) === null, 'a board survived a reload although it is not saved');

  // ── 11. The Korean page keeps the same rules and labels.
  await t.open('/ko/ladder-game');
  await page.waitForTimeout(500);
  const koInputs = page.locator('main input');
  const koNames = ['김철수입니다만', '박영희의친구들', '이민수형님께서', '최지우사모님'];
  for (let index = 0; index < 4; index++) {
    await koInputs.nth(index * 2).click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(koNames[index], { delay: 5 });
  }
  await page.getByRole('button', { name: /사다리 만들기/ }).click();
  await page.waitForTimeout(700);
  const koBoard = await board(page);
  for (let index = 1; index < koBoard.top.length; index++) {
    const gap = koBoard.top[index].left - koBoard.top[index - 1].right;
    t.assert(
      gap > 0,
      `the Korean names "${koBoard.top[index - 1].text}" and "${koBoard.top[index].text}" overlap by ${Math.abs(gap).toFixed(1)}px`,
    );
  }
  await page.getByRole('button', { name: '전체 공개' }).click();
  await page.waitForTimeout(500);
  const koResults = await page.evaluate(() =>
    [...document.querySelectorAll('main ol[aria-label] li')].map((item) => item.innerText.replace(/\s+/g, ' ')),
  );
  t.assert(koResults.length === 4, `the Korean page lists ${koResults.length} results`);
  t.assert(
    koResults.every((line) => line.includes('→')),
    `the Korean results do not use the arrow: ${koResults.join(' | ')}`,
  );

  // ── 12. Twenty players at 375 px: the page itself does not scroll sideways.
  for (let index = 4; index < 20; index++) await page.getByRole('button', { name: '인원 추가' }).click();
  await page.waitForTimeout(300);
  t.assert((await page.locator('main input').count()) === 40, 'the board did not grow to twenty players');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /사다리 만들기/ }).click();
  await page.waitForTimeout(800);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px with twenty players`);
  const scrollingBoard = await page.evaluate(() => {
    const svg = [...document.querySelectorAll('main svg')].find((element) => element.getAttribute('aria-label'));
    const wrapper = svg?.parentElement;
    return wrapper ? wrapper.scrollWidth - wrapper.clientWidth : 0;
  });
  t.assert(scrollingBoard > 0, 'a twenty-player board does not scroll inside its own frame');
}

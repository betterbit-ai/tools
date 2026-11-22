/**
 * Random picker: the flow a host runs in front of a room — paste the names, draw, draw again,
 * and read the result out. Everything asserted here is text the user can see.
 *
 * Covers the defect this audit fixed: "Draws this session" was read from the recent-results list,
 * which keeps 10, so it stopped counting after the tenth draw.
 */

const list = (names) => names.join('\n');
const samples = (count, name = (index) => `참가자${index + 1}`) =>
  Array.from({ length: count }, (_, index) => name(index));

/** The value in the stat whose label is `label`. */
async function stat(page, label) {
  return page.evaluate((wanted) => {
    for (const element of document.querySelectorAll('main div')) {
      if (element.children.length !== 2) continue;
      const [value, name] = [element.children[0], element.children[1]];
      if (name.textContent?.trim() !== wanted || name.children.length !== 0) continue;
      if (value.children.length !== 0 && value.tagName !== 'SPAN') continue;
      return value.textContent?.trim() ?? null;
    }
    return null;
  }, label);
}

/** The name shown in the result box. */
async function result(page) {
  return (await page.locator('main output').innerText()).trim();
}

/** The danger notices on the page: what the tool says is wrong with the list. */
async function alerts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert]')].map((element) => element.textContent?.trim() ?? ''),
  );
}

/** The removal switch is a visually hidden checkbox inside its label, so the label is what clicks. */
async function setRemoval(t, page, on) {
  const box = page.getByRole('checkbox', { name: /당첨자 자동 제외/ });
  if ((await box.isChecked()) !== on) {
    await page.getByText('추첨 뒤 당첨자 자동 제외', { exact: true }).click();
    await page.waitForTimeout(100);
  }
  t.assert((await box.isChecked()) === on, `the removal switch did not turn ${on ? 'on' : 'off'}`);
}

/** One draw takes the fixed 800 ms reveal, then the button is enabled again. */
async function draw(page, times = 1) {
  for (let i = 0; i < times; i += 1) {
    await page.getByRole('button', { name: '이름 뽑기' }).click();
    await page.waitForTimeout(950);
  }
}

export default async function (t) {
  const page = t.page;
  await t.open('/ko/random-picker');
  const entries = page.getByLabel(/이름 또는 선택지/);
  const pick = page.getByRole('button', { name: '이름 뽑기' });
  const removeWinner = page.getByRole('checkbox', { name: /당첨자 자동 제외/ });

  // ── 1. The sample list draws one of its four names and takes that one entry out.
  const defaults = ['민지', '서준', '지우', '도윤'];
  await setRemoval(t, page, true);
  await entries.fill(list(defaults));
  await page.waitForTimeout(150);
  t.assert((await stat(page, '남은 항목')) === '4', 'the four sample entries are not counted');
  t.assert((await page.getByText('결과가 여기에 표시됩니다').count()) === 1, 'a result is shown before the first draw');

  await draw(page);
  const firstWinner = await result(page);
  t.assert(defaults.includes(firstWinner), `the winner "${firstWinner}" is not one of the entered names`);
  t.assert(
    (await stat(page, '남은 항목')) === '3',
    `entries remaining after one draw: ${await stat(page, '남은 항목')}`,
  );
  t.assert((await stat(page, '이번 세션 추첨')) === '1', `draws this session: ${await stat(page, '이번 세션 추첨')}`);
  t.assert((await entries.inputValue()).split('\n').length === 3, 'the winner was not removed from the list');
  t.assert(!(await entries.inputValue()).split('\n').includes(firstWinner), 'the drawn name is still in the list');

  // ── 2. Drawing past ten times keeps counting, while the recent list stays at ten.
  await entries.fill(list(samples(30)));
  await page.waitForTimeout(150);
  await draw(page, 11);
  t.assert(
    (await stat(page, '이번 세션 추첨')) === '12',
    `after 12 draws the session counter reads ${await stat(page, '이번 세션 추첨')}`,
  );
  const recent = await page.evaluate(
    () =>
      [...document.querySelectorAll('main ol li')].filter((item) => item.closest('ol')?.className.includes('grid'))
        .length,
  );
  t.assert(recent === 10, `the recent-results list shows ${recent} entries, not 10`);
  t.assert((await stat(page, '남은 항목')) === '19', `30 entries minus 11 draws: ${await stat(page, '남은 항목')}`);

  // ── 3. Turning removal off draws from the same list again.
  await setRemoval(t, page, false);
  await entries.fill(list(['가', '나', '다']));
  await page.waitForTimeout(150);
  await draw(page, 6);
  t.assert((await entries.inputValue()).split('\n').length === 3, 'entries were removed with removal switched off');
  t.assert(
    (await stat(page, '남은 항목')) === '3',
    `entries remaining with removal off: ${await stat(page, '남은 항목')}`,
  );

  // ── 4. Two entries both come up over enough draws, and a repeated line is a separate ticket.
  await entries.fill(list(['가', '나']));
  await page.waitForTimeout(150);
  const seen = new Set();
  for (let round = 0; round < 10; round += 1) {
    await draw(page, 2);
    seen.add(await result(page));
  }
  t.assert(seen.size === 2, `20 draws over two entries only produced ${[...seen].join(', ')}`);

  await setRemoval(t, page, true);
  await entries.fill(list(['가', '나', '가']));
  await page.waitForTimeout(150);
  t.assert(
    (await page.getByText('3개 항목 · 최대 1,000개').count()) === 1,
    'a repeated line is not counted as its own ticket',
  );
  await draw(page);
  const weightedWinner = await result(page);
  const left = (await entries.inputValue()).split('\n');
  t.assert(left.length === 2, `one ticket should have gone, leaving 2 lines: ${left.length}`);
  t.assert(
    weightedWinner === '가' ? left.filter((name) => name === '가').length === 1 : left.length === 2,
    'removal took more than the one drawn ticket',
  );

  // ── 5. The result summary can be copied, and it names the winner and the draw size.
  await entries.fill(list(['가', '나', '다', '라']));
  await setRemoval(t, page, true);
  await page.waitForTimeout(150);
  await draw(page);
  const winner = await result(page);
  await page.getByRole('button', { name: '결과 복사' }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(clipboard.includes(winner), `the copied summary does not name the winner: ${clipboard}`);
  t.assert(/추첨 항목 수: 4/.test(clipboard), `the copied summary does not state the draw size: ${clipboard}`);

  // ── 6. R draws when the focus is outside a field, and does not while typing a name.
  await setRemoval(t, page, true);
  await entries.fill(list(['가', '나', '다']));
  await page.waitForTimeout(150);
  const beforeR = Number(await stat(page, '이번 세션 추첨'));
  await page.getByRole('heading', { name: '제비뽑기', level: 1 }).click();
  await page.keyboard.press('r');
  await page.waitForTimeout(1_100);
  t.assert(Number(await stat(page, '이번 세션 추첨')) === beforeR + 1, 'R outside a field did not draw');
  await entries.click();
  await page.keyboard.press('r');
  await page.waitForTimeout(200);
  t.assert((await entries.inputValue()).includes('r'), 'R typed into the list did not reach the field');

  // ── 7. Bad lists say what is wrong instead of drawing nothing.
  await entries.fill('가');
  await page.waitForTimeout(150);
  t.assert(
    (await alerts(page)).some((text) => /두 개 이상 넣으세요/.test(text)),
    'a one-name list has no error',
  );
  t.assert(await pick.isDisabled(), 'the pick button is enabled for a one-name list');

  await entries.fill(list(samples(1_001)));
  await page.waitForTimeout(250);
  t.assert(
    (await alerts(page)).some((text) => /1,000개 이하/.test(text)),
    '1,001 entries are not rejected',
  );

  await entries.fill(list(['가', '나'.repeat(201)]));
  await page.waitForTimeout(150);
  t.assert(
    (await alerts(page)).some((text) => /200자 이하/.test(text)),
    'a 201-character entry is not rejected',
  );

  // ── 8. A reload keeps the list and the removal preference; the session count starts over.
  await entries.fill(list(['가', '나', '다']));
  await setRemoval(t, page, false);
  await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(300);
  t.assert((await entries.inputValue()) === '가\n나\n다', `reload lost the list: ${await entries.inputValue()}`);
  t.assert(!(await removeWinner.isChecked()), 'reload turned removal back on');
  t.assert((await stat(page, '이번 세션 추첨')) === '0', `a new page session kept the old draw count`);

  // ── 9. 375px: nothing scrolls sideways and the draw button is on screen.
  await page.setViewportSize({ width: 375, height: 812 });
  await t.open('/ko/random-picker');
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const buttonBox = await pick.boundingBox();
  t.assert(
    buttonBox && buttonBox.width > 100 && buttonBox.y + buttonBox.height <= 812,
    'the draw button is off screen at 375px',
  );
}

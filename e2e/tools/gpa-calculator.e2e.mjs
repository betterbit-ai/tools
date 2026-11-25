/**
 * GPA calculator: a transcript entered once and read on three scales, with every GPA recomputed in
 * this spec from the grade tables rather than trusted from the page.
 *
 * Covers the defects this audit fixed:
 *  - typing "3.5" credits into the number field left "53", and clearing a credit field put the old
 *    value back: the controlled number input moved the caret on every keystroke;
 *  - at 375 px the courses table pushed the whole page 172 px sideways instead of scrolling inside
 *    its own panel;
 *  - removing a middle course row reused the wrong row's inputs.
 */

const POINTS = {
  4.5: {
    'A+': 4.5,
    A0: 4,
    'A-': 3.7,
    'B+': 3.5,
    B0: 3,
    'B-': 2.7,
    'C+': 2.5,
    C0: 2,
    'C-': 1.7,
    'D+': 1.5,
    D0: 1,
    'D-': 0.7,
    F: 0,
  },
  4.3: {
    'A+': 4.3,
    A0: 4,
    'A-': 3.7,
    'B+': 3.3,
    B0: 3,
    'B-': 2.7,
    'C+': 2.3,
    C0: 2,
    'C-': 1.7,
    'D+': 1.3,
    D0: 1,
    'D-': 0.7,
    F: 0,
  },
  '4.0': {
    'A+': 4,
    A0: 4,
    'A-': 3.7,
    'B+': 3.3,
    B0: 3,
    'B-': 2.7,
    'C+': 2.3,
    C0: 2,
    'C-': 1.7,
    'D+': 1.3,
    D0: 1,
    'D-': 0.7,
    F: 0,
  },
};
/** GPA on each scale for a list of [credits, grade]; P is left out, F stays in. */
const gpaOf = (courses) =>
  Object.fromEntries(
    Object.keys(POINTS).map((scale) => {
      const graded = courses.filter(([, grade]) => grade !== 'P');
      const credits = graded.reduce((total, [value]) => total + value, 0);
      const points = graded.reduce((total, [value, grade]) => total + POINTS[scale][grade] * value, 0);
      return [
        scale,
        credits
          ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
              Math.round((points / credits) * 1e6) / 1e6,
            )
          : '—',
      ];
    }),
  );

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
  await t.open('/gpa-calculator');
  await page.waitForTimeout(500);

  const rows = page.locator('main tbody tr');
  t.assert((await rows.count()) === 3, `the page opens with ${await rows.count()} course rows instead of 3`);
  const cell = (index) => ({
    name: rows.nth(index).locator('input[type=text]').first(),
    credits: rows.nth(index).locator('input[type=text]').nth(1),
    grade: rows.nth(index).locator('select'),
    remove: rows.nth(index).getByRole('button'),
  });
  const setGrade = async (index, grade) => {
    await cell(index).grade.selectOption(grade);
    await page.waitForTimeout(150);
  };
  /** Types credits one key at a time, the way the decimal bug showed up. */
  const typeCredits = async (index, value) => {
    await cell(index).credits.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(value, { delay: 80 });
    await page.waitForTimeout(250);
  };

  // ── 1. The default three courses on all three scales.
  let shown = await stats(page);
  const initial = gpaOf([
    [3, 'A+'],
    [3, 'B+'],
    [2, 'A0'],
  ]);
  t.assert(shown['4.5 scale'] === initial['4.5'], `4.5 default: ${shown['4.5 scale']} (expected ${initial['4.5']})`);
  t.assert(shown['4.3 scale'] === initial['4.3'], `4.3 default: ${shown['4.3 scale']}`);
  t.assert(shown['4.0 scale'] === initial['4.0'], `4.0 default: ${shown['4.0 scale']}`);
  t.assert(shown['GPA credits'] === '8', `GPA credits default: ${shown['GPA credits']}`);

  // ── 2. A half-credit course typed as "3.5" keeps its decimal point and its value.
  await typeCredits(0, '3.5');
  t.assert(
    (await cell(0).credits.inputValue()) === '3.5',
    `typing 3.5 left "${await cell(0).credits.inputValue()}" in the credits field`,
  );
  shown = await stats(page);
  const halfCredit = gpaOf([
    [3.5, 'A+'],
    [3, 'B+'],
    [2, 'A0'],
  ]);
  t.assert(shown['4.5 scale'] === halfCredit['4.5'], `3.5 credits on 4.5: ${shown['4.5 scale']}`);
  t.assert(shown['GPA credits'] === '8.5', `GPA credits with 3.5: ${shown['GPA credits']}`);

  // ── 3. Clearing a credit field clears it, and the next number is the next number.
  await cell(0).credits.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(250);
  t.assert((await cell(0).credits.inputValue()) === '', `clearing left "${await cell(0).credits.inputValue()}"`);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((message) => /credits/.test(message)),
    'an empty credit field shows no explanation',
  );
  await typeCredits(0, '4');
  t.assert(
    (await cell(0).credits.inputValue()) === '4',
    `typing 4 after clearing gave "${await cell(0).credits.inputValue()}"`,
  );
  t.assert((await stats(page))['GPA credits'] === '9', `GPA credits after 4: ${(await stats(page))['GPA credits']}`);

  // ── 4. Grades change the result on every scale: a 4-credit A+, 3-credit B0, 2-credit C0.
  await setGrade(0, 'A+');
  await setGrade(1, 'B0');
  await setGrade(2, 'C0');
  shown = await stats(page);
  const mixed = gpaOf([
    [4, 'A+'],
    [3, 'B0'],
    [2, 'C0'],
  ]);
  for (const scale of ['4.5', '4.3', '4.0']) {
    t.assert(
      shown[`${scale} scale`] === mixed[scale],
      `${scale} for A+/B0/C0: ${shown[`${scale} scale`]} (expected ${mixed[scale]})`,
    );
  }

  // ── 5. A pass/fail course adds completed credits but never moves the GPA.
  await page.getByRole('button', { name: 'Add course' }).click();
  await page.waitForTimeout(250);
  t.assert((await rows.count()) === 4, 'Add course did not add a row');
  await setGrade(3, 'P');
  await typeCredits(3, '2');
  shown = await stats(page);
  t.assert(shown['Pass credits'] === '2', `pass credits: ${shown['Pass credits']}`);
  t.assert(shown['4.5 scale'] === mixed['4.5'], `a P course changed the 4.5 GPA: ${shown['4.5 scale']}`);

  // ── 6. Removing the middle row keeps every remaining row's own course and grade.
  const names = ['Alpha', 'Beta', 'Gamma', 'Pass/Fail'];
  for (const [index, name] of names.entries()) await cell(index).name.fill(name);
  await page.waitForTimeout(300);
  await cell(1).remove.click();
  await page.waitForTimeout(300);
  t.assert((await rows.count()) === 3, `removing a row left ${await rows.count()} rows`);
  const leftNames = await page
    .locator('main tbody input[type=text]')
    .evaluateAll((inputs) => inputs.filter((_, index) => index % 2 === 0).map((input) => input.value));
  t.assert(
    JSON.stringify(leftNames) === JSON.stringify(['Alpha', 'Gamma', 'Pass/Fail']),
    `after removing the middle row the names are ${JSON.stringify(leftNames)}`,
  );
  const leftGrades = await page
    .locator('main tbody select')
    .evaluateAll((selects) => selects.map((select) => select.value));
  t.assert(
    JSON.stringify(leftGrades) === JSON.stringify(['A+', 'C0', 'P']),
    `after removing the middle row the grades are ${JSON.stringify(leftGrades)}`,
  );

  // ── 7. Values outside the table are refused instead of quietly counted.
  await typeCredits(1, '0');
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((message) => /credits/.test(message)),
    'a 0-credit course is not explained',
  );
  await typeCredits(1, '101');
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((message) => /credits/.test(message)),
    'a 101-credit course is not explained',
  );
  await typeCredits(1, '2');
  t.assert(
    (await stats(page))['GPA credits'] === '6',
    `GPA credits after fixing the row: ${(await stats(page))['GPA credits']}`,
  );

  // ── 8. Copy the summary, then check the same courses survive a reload.
  await page.getByRole('button', { name: 'Copy results' }).click();
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(/GPA \(4\.5\): \d\.\d\d/.test(copied), `the copied summary is wrong: ${JSON.stringify(copied)}`);
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(700);
  t.assert((await rows.count()) === 3, 'the reload lost a course row');
  t.assert((await cell(0).name.inputValue()) === 'Alpha', 'the reload lost a course name');
  t.assert((await cell(0).credits.inputValue()) === '4', 'the reload lost the credits');

  // ── 9. The Korean page labels the same three scales.
  await t.open('/ko/gpa-calculator');
  await page.waitForTimeout(500);
  const korean = await page.locator('main').innerText();
  t.assert(
    korean.includes('4.5 만점') && korean.includes('4.3 만점') && korean.includes('4.0 만점'),
    'the Korean page is missing a scale',
  );
  t.assert(korean.includes('평점 반영 학점'), 'the Korean page is missing the GPA-credits label');

  // ── 10. 375 px, dark: the panel no longer pushes the page sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const tableScrolls = await page.evaluate(() => {
    const wrapper = document.querySelector('main div.overflow-x-auto');
    return wrapper ? wrapper.scrollWidth > wrapper.clientWidth : false;
  });
  t.assert(tableScrolls, 'the course table does not scroll inside its own panel at 375px');
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);
}

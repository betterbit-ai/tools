/**
 * Team generator: a pasted roster (including a spreadsheet's tab-separated name/score pairs) must
 * produce teams that hold every person once, keep sizes within one, balance documented scores and
 * report totals without floating-point noise. Every control is checked for the effect it claims.
 */

const card = (page, index) => page.locator('div[aria-live="polite"] section').nth(index);
const names = async (page) => page.locator('div[aria-live="polite"] section li').allInnerTexts();
const cardNames = async (page, index) => card(page, index).locator('li').allInnerTexts();
const cardText = async (page, index) => card(page, index).innerText();

/** Team totals as shown ("Skill total: 5.3"), parsed without assuming which team got which. */
async function totals(page) {
  const count = await page.locator('div[aria-live="polite"] section').count();
  const values = [];
  for (let i = 0; i < count; i++) {
    const text = await cardText(page, i);
    const match = text.match(/(?:Skill total|실력 합계): (-?[\d.]+)/);
    values.push(match ? Number(match[1]) : null);
  }
  return values;
}

export default async function (t) {
  const page = t.page;
  await page.goto(t.base + '/team-generator');
  await page.evaluate(() => localStorage.clear());
  await t.open('/team-generator');

  const roster = page.getByLabel(/^Participants/);
  const teamCount = page.getByLabel(/^Number of teams/);

  // The sample roster generates teams on arrival: six people, two teams of three.
  await t.waitForText(/Team 1/);
  t.assert(
    (await names(page)).length === 6,
    `sample roster produced ${(await names(page)).length} players instead of 6`,
  );
  t.assert(
    JSON.stringify([...(await cardNames(page, 0)), ...(await cardNames(page, 1))].sort()) ===
      JSON.stringify(['Alex', 'Casey', 'Jordan', 'Morgan', 'Sam', 'Taylor']),
    'the default roster was not split into the two teams unchanged',
  );

  // A roster pasted from a spreadsheet: name, tab, score.
  const sheet = '민지\t4.1\n서준\t3.2\n지우\t2.1\n도윤\t1.1\n하은\t4.5\n예준\t2.5';
  await roster.fill(sheet);
  await page.waitForTimeout(300);
  const afterEdit = await page.locator('main').innerText();
  t.assert(afterEdit.includes('6 participants · up to 200'), 'tab-separated rows were not counted as six participants');
  t.assert(
    afterEdit.includes('Add at least two participants to make teams.'),
    'editing the roster did not clear the previous result',
  );

  // Balance skill accepts the spreadsheet roster and splits both headcount and score.
  // Greedy, highest score first: 4.5+2.5+2.1 and 4.1+3.2+1.1.
  await page.getByRole('radio', { name: 'Balance skill', exact: true }).click();
  await t.click('Generate teams');
  await t.waitForText(/Skill total/);
  const balanced = [...(await names(page))].sort();
  t.assert(
    JSON.stringify(balanced) === JSON.stringify(['도윤', '민지', '서준', '예준', '지우', '하은'].sort()),
    `balanced teams held ${JSON.stringify(balanced)}`,
  );
  const sizes = [(await cardNames(page, 0)).length, (await cardNames(page, 1)).length];
  t.assert(Math.abs(sizes[0] - sizes[1]) <= 1, `team sizes differ by more than one person: ${sizes}`);

  const shownTotals = (await totals(page)).sort((a, b) => a - b);
  t.assert(
    JSON.stringify(shownTotals) === JSON.stringify([8.4, 9.1]),
    `balanced totals were ${JSON.stringify(shownTotals)} instead of the expected 8.4 and 9.1`,
  );
  const spread = (await page.locator('main').innerText()).match(/([\d.]+)\s*Skill-total spread/);
  t.assert(spread && Number(spread[1]) === 0.7, `the spread line showed ${spread?.[1]} instead of 0.7`);

  // Each team's total must be the sum of its own members' scores, and it must not leak float noise.
  const memberScores = new Map([
    ['민지', 4.1],
    ['서준', 3.2],
    ['지우', 2.1],
    ['도윤', 1.1],
    ['하은', 4.5],
    ['예준', 2.5],
  ]);
  for (let i = 0; i < 2; i++) {
    const text = await cardText(page, i);
    const printed = text.match(/(?:Skill total|실력 합계): (-?[\d.]+)/)?.[1];
    t.assert(printed && !/0{4,}/.test(printed), `team ${i + 1} printed a noisy total: ${printed}`);
    const members = await cardNames(page, i);
    const sum = Math.round(members.reduce((acc, name) => acc + (memberScores.get(name) ?? 0), 0) * 1e6) / 1e6;
    t.assert(Number(printed) === sum, `team ${i + 1} total ${printed} does not equal its members' sum ${sum}`);
  }

  // Copy teams puts the same result on the clipboard, score totals included.
  await t.click('Copy teams');
  await page.getByText('Copied', { exact: true }).waitFor({ timeout: 5_000 });
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.startsWith('Team 1 (Skill total: '), `clipboard text was ${JSON.stringify(copied.slice(0, 80))}`);
  for (const name of memberScores.keys()) t.assert(copied.includes(name), `copied teams omit ${name}`);

  // Team count is a real control: eleven people into three teams gives 4, 4 and 3.
  await page.getByRole('radio', { name: 'Random', exact: true }).click();
  await roster.fill(Array.from({ length: 11 }, (_, i) => `참가자${i + 1}`).join('\n'));
  await teamCount.fill('3');
  await t.click('Generate teams');
  await t.waitForText(/Team 3/);
  const threeSizes = await Promise.all([0, 1, 2].map(async (i) => (await cardNames(page, i)).length));
  t.assert(
    JSON.stringify([...threeSizes].sort()) === JSON.stringify([3, 4, 4]),
    `11 people in 3 teams produced sizes ${threeSizes}`,
  );
  const first = [...(await names(page))].sort();

  // Shuffle again keeps the same people and sizes.
  await t.click('Shuffle again');
  await page.waitForTimeout(300);
  const second = [...(await names(page))].sort();
  t.assert(JSON.stringify(first) === JSON.stringify(second), 'shuffling changed who is in the teams');
  const reshuffledSizes = await Promise.all([0, 1, 2].map(async (i) => (await cardNames(page, i)).length));
  t.assert(
    JSON.stringify([...reshuffledSizes].sort()) === JSON.stringify([3, 4, 4]),
    `reshuffle changed team sizes to ${reshuffledSizes}`,
  );

  // A roster too small and a team count too large must explain themselves instead of failing quietly.
  await roster.fill('혼자');
  await page.waitForTimeout(300);
  t.assert(
    await page.getByText('Add at least two non-empty participant lines.', { exact: true }).isVisible(),
    'a one-person roster did not explain the minimum',
  );
  t.assert(
    await page.getByRole('button', { name: 'Generate teams' }).isDisabled(),
    'Generate stayed enabled with one participant',
  );
  await roster.fill('가\n나');
  await teamCount.fill('3');
  await page.waitForTimeout(300);
  t.assert(
    await page
      .getByText('Choose a whole number of teams from 2 through the number of participants.', { exact: true })
      .isVisible(),
    'a team count above the participant count was not explained',
  );

  // Restore sample and Clear list both act on the roster.
  await t.click('Restore sample');
  await page.waitForTimeout(300);
  t.assert((await roster.inputValue()).includes('Alex, 4'), 'Restore sample did not put the sample back');
  await t.click('Clear list');
  await page.waitForTimeout(300);
  t.assert((await roster.inputValue()) === '', 'Clear list left names behind');
  t.assert(
    await page.getByText('Add at least two participants to make teams.', { exact: true }).isVisible(),
    'an empty roster did not return to the waiting message',
  );

  // Korean page: comma, full-width comma, tab and a 점 suffix all read as scores.
  // 4.5 and 1.5 join one team, 3 and 2 the other.
  await t.open('/ko/team-generator');
  await page.getByLabel(/^참가자 명단/).fill('민지, 4.5점\n서준，3\n지우\t2\n도윤, 1.5');
  await page.getByLabel(/^팀 수/).fill('2');
  await page.getByRole('radio', { name: '실력 균형', exact: true }).click();
  await t.click('팀 만들기');
  await t.waitForText(/실력 합계/);
  const koreanTotals = (await totals(page)).sort((a, b) => a - b);
  t.assert(
    JSON.stringify(koreanTotals) === JSON.stringify([5, 6]),
    `Korean page totals were ${JSON.stringify(koreanTotals)} instead of 5 and 6`,
  );

  // 375 px, dark mode: no horizontal overflow.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px dark-mode page has horizontal overflow',
  );
}

/**
 * World clock: the clocks must show the real wall-clock time (also after the tab was hidden),
 * a typed city name must be accepted, every control must change what it claims, and the
 * reference date must follow today across midnight.
 */

const SEOUL = 'Asia/Seoul';

const formatIn = (zone, instant, hour12 = false) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12,
  }).format(new Date(instant));

const dateIn = (zone, instant) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(instant),
  );

const cards = (page) => page.locator('article h2');

export default async function (t) {
  // 2026-11-19 09:00:00 in Seoul, frozen so every displayed second is predictable.
  const start = Date.UTC(2026, 10, 19, 0, 0, 0);
  await t.page.clock.install({ time: new Date(start) });
  await t.page.clock.pauseAt(new Date(start));
  await t.open('/world-clock');

  // Default city clocks show the exact local time for the frozen instant.
  const seoulCard = t.page.locator('article', { has: t.page.getByRole('heading', { name: 'Seoul' }) }).first();
  t.assert(
    (await seoulCard.innerText()).includes(formatIn(SEOUL, start)),
    `Seoul card does not show ${formatIn(SEOUL, start)}`,
  );
  const newYorkCard = t.page.locator('article', { has: t.page.getByRole('heading', { name: 'New York' }) }).first();
  t.assert(
    (await newYorkCard.innerText()).includes(formatIn('America/New_York', start)),
    'New York card shows the wrong local time',
  );
  t.assert((await cards(t.page).count()) === 4, 'default clock should start with four cities');

  // A running clock counts wall-clock time, not timer callbacks: five seconds later the
  // display is exactly five seconds later.
  await t.page.clock.runFor(5_000);
  await t.waitForText(formatIn(SEOUL, start + 5_000), 5_000);

  // A hidden tab throttles timers, so the clock has to refresh when the tab becomes visible
  // again instead of waiting for its next (up to a minute away) tick.
  const afterJump = start + 11 * 60_000;
  await t.page.clock.setSystemTime(new Date(afterJump));
  await t.page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await t.waitForText(formatIn(SEOUL, afterJump), 5_000);

  // A plain city name is what people type; the suggestion list shows "Tokyo, Japan — Asia/Tokyo".
  await t.open('/ko/world-clock');
  const cityInput = t.page.getByLabel('도시 또는 IANA 시간대');
  await cityInput.fill('도쿄');
  await t.click('도시 추가');
  await t.waitForText('도쿄');
  t.assert(
    (await t.page.getByRole('heading', { name: '도쿄', exact: true }).count()) === 1,
    'typing 도쿄 did not add Tokyo',
  );
  t.assert((await cards(t.page).count()) === 5, 'adding Tokyo should leave five city cards');

  // An English name works too, and adding the same city twice is reported instead of duplicated.
  await cityInput.fill('Tokyo');
  await t.click('도시 추가');
  await t.waitForText('이미 세계 시계에 추가된 도시입니다.');
  t.assert((await cards(t.page).count()) === 5, 'adding Tokyo twice duplicated the card');

  // An ambiguous entry stays an explicit error.
  await cityInput.fill('미국');
  await t.click('도시 추가');
  await t.waitForText('도시 이름');

  // 12-hour format reaches the city cards and the overlap grid.
  await t.page.getByRole('radio', { name: '12시간제' }).click();
  await t.waitForText(/오전|오후/, 5_000);
  t.assert(
    (await t.page.locator('ol[aria-label="업무시간 겹침"]').innerText()).includes('오전'),
    '12-hour format did not reach the overlap grid',
  );

  // Removing a city updates the grid totals (London is the third card, leaving four cities).
  await t.page.getByRole('button', { name: '도시 삭제' }).nth(2).click();
  await t.waitForText(/\/4 /, 5_000);
  t.assert((await cards(t.page).count()) === 4, 'removing a city should leave four cards');
  t.assert(!(await t.page.getByRole('heading', { name: '런던' }).count()), 'London should be gone');

  // The reference date can be chosen, and "오늘" brings it back to today.
  const dateInput = t.page.locator('input[type=date]');
  await dateInput.fill('2026-12-01');
  t.assert((await dateInput.inputValue()) === '2026-12-01', 'the planner date did not change');
  await t.click('오늘');
  t.assert(
    (await dateInput.inputValue()) === dateIn(SEOUL, afterJump),
    `"오늘" did not restore today (${dateIn(SEOUL, afterJump)})`,
  );

  // Nothing is lost when storage is blocked, but the promise that the list is saved has to
  // become visible instead of silently failing.
  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('storage blocked');
    };
  });
  await t.open('/ko/world-clock');
  await t.page.getByLabel('도시 또는 IANA 시간대').fill('파리');
  await t.click('도시 추가');
  await t.waitForText('로컬 저장소를 막아');

  // Looking at the page on a phone must not add horizontal scrolling.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px world clock page has horizontal overflow',
  );

  // The planner date follows today across midnight until someone picks a date.
  await t.page.evaluate(() => localStorage.clear());
  await t.page.clock.setSystemTime(new Date(Date.UTC(2026, 10, 19, 14, 59, 50))); // 23:59:50 KST
  await t.open('/ko/world-clock');
  t.assert(
    (await t.page.locator('input[type=date]').inputValue()) === '2026-11-19',
    'the planner did not start on today',
  );
  await t.page.clock.runFor(20_000);
  let value = '';
  for (let i = 0; i < 50 && value !== '2026-11-20'; i++) {
    value = await t.page.locator('input[type=date]').inputValue();
    if (value !== '2026-11-20') await t.page.waitForTimeout(100);
  }
  t.assert(value === '2026-11-20', `the planner date did not roll over at midnight (got ${value})`);
}

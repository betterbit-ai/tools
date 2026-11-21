/**
 * Time zone converter: a city typed as people type it ("tokyo", "도쿄") has to resolve, a
 * half-typed name must not blank the result or shout an error while the field is being edited,
 * the conversion has to match the browser's own IANA data (including DST), the skipped and repeated
 * clock times have to be labelled, the controls have to change what they claim, and the promise that
 * the last cities come back has to be retracted when storage is blocked.
 */

const partsIn = (zone, instant) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const value = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, Number(p.value)]));
  return value;
};

/** How the page prints a moment: full date and short time in the selected zone. */
const formatIn = (zone, instant, hourCycle = 'h23') =>
  new Intl.DateTimeFormat('en', { timeZone: zone, dateStyle: 'full', timeStyle: 'short', hourCycle }).format(
    new Date(instant),
  );

const offsetAt = (instant, zone) => {
  const p = partsIn(zone, instant);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(instant / 1000) * 1000;
};

/** The instant of a wall-clock time in a zone, resolved through the zone's own offsets. */
const instantOf = (date, time, zone) => {
  const wall = Date.parse(`${date}T${time}:00Z`);
  let guess = wall - offsetAt(wall, zone);
  guess = wall - offsetAt(guess, zone);
  return guess;
};

const stat = (page, label) =>
  page.evaluate((wanted) => {
    for (const box of document.querySelectorAll('main [aria-live=polite] div')) {
      const [value, name] = box.children;
      if (value && name && name.textContent?.trim() === wanted) return value.textContent.trim();
    }
    return null;
  }, label);

const result = (page) => page.locator('main [aria-live=polite]').innerText();
const alerts = (page) => page.locator('main [role=alert], main [role=status]').allInnerTexts();

/** Leave the field the way a person does after typing a city. */
const leave = async (t, selector = '#tz-from') => {
  await t.page.locator('main h1').click();
  await t.page.waitForTimeout(50);
  return t.page.locator(selector).inputValue();
};

export default async function (t) {
  await t.page.addInitScript(() => localStorage.clear());
  await t.open('/time-zone-converter');
  const from = t.page.locator('#tz-from');
  const to = t.page.locator('#tz-to');
  const date = t.page.locator('input[type=date]');
  const time = t.page.locator('input[type=time]');

  // ── A normal conversion matches the browser's own zone data ─────────────────────
  await date.fill('2026-06-10');
  await time.fill('13:38');
  const seoulInstant = instantOf('2026-06-10', '13:38', 'Asia/Seoul');
  let text = await result(t.page);
  t.assert(text.includes(formatIn('Asia/Seoul', seoulInstant)), 'the source time is not the time that was entered');
  t.assert(
    text.includes(formatIn('America/New_York', seoulInstant)),
    `Seoul 13:38 is not New York ${formatIn('America/New_York', seoulInstant)}`,
  );
  t.assert((await stat(t.page, 'Offset difference')) === '−13:00', 'the Seoul–New York offset difference is wrong');
  t.assert((await stat(t.page, 'Date change')) === 'Same day', 'the same-day label is wrong');

  // ── A city typed in a plain, lower-case English form resolves ──────────────────
  await from.click();
  await from.fill('');
  await from.pressSequentially('tokyo', { delay: 20 });
  t.assert(!(await alerts(t.page)).some((a) => a.includes('valid IANA')), 'typing "tokyo" was reported as unknown');
  text = await result(t.page);
  t.assert(text.includes('Tokyo, Japan — Asia/Tokyo'), `typing "tokyo" did not pick Tokyo: ${text}`);
  t.assert(
    text.includes(formatIn('America/New_York', instantOf('2026-06-10', '13:38', 'Asia/Tokyo'))),
    'the conversion did not follow the newly typed source city',
  );
  // Leaving the field settles the wording to the full zone label.
  t.assert((await leave(t)) === 'Tokyo, Japan — Asia/Tokyo', 'the typed city was not settled to its zone label');

  // ── A half-typed name neither blanks the result nor shouts while edited ───────
  await from.click();
  await from.fill('a');
  await t.page.waitForTimeout(100);
  const partialAlerts = await alerts(t.page);
  t.assert(
    !partialAlerts.some((a) => a.includes('valid IANA')),
    `a partial city name raises an error while it is still being typed: ${partialAlerts}`,
  );
  t.assert((await result(t.page)).includes('Tokyo, Japan — Asia/Tokyo'), 'a partial city name blanked the result');
  await leave(t);
  t.assert(
    (await alerts(t.page)).some((a) => a.includes('valid IANA')),
    'an unresolved city is not reported after leaving',
  );
  await from.click();
  await from.fill('Seoul');
  await leave(t);
  await t.page.waitForTimeout(50);
  t.assert((await alerts(t.page)).length === 0, `the error did not clear after a valid city: ${await alerts(t.page)}`);
  t.assert((await from.inputValue()) === 'Seoul, South Korea — Asia/Seoul', 'the settled Seoul label is wrong');

  // ── Daylight-saving edge cases, with New York as the source and Tokyo as the target ──
  await from.click();
  await from.fill('New York');
  await leave(t);
  t.assert((await from.inputValue()) === 'New York, United States — America/New_York', 'the settled label is wrong');
  await to.click();
  await to.fill('Tokyo');
  await leave(t, '#tz-to');
  t.assert((await to.inputValue()) === 'Tokyo, Japan — Asia/Tokyo', 'the settled target label is wrong');

  await date.fill('2026-03-08');
  await time.fill('02:30');
  t.assert(
    (await alerts(t.page)).some((a) => a.includes('does not exist')),
    'a skipped local time (02:30 on the US spring-forward day) is not reported',
  );

  await date.fill('2026-11-01');
  await time.fill('01:30');
  t.assert(
    (await alerts(t.page)).some((a) => a.includes('occurs twice')),
    'a repeated local time (01:30 on the US fall-back day) is not labelled',
  );
  t.assert(
    (await result(t.page)).includes(formatIn('Asia/Tokyo', Date.parse('2026-11-01T05:30:00Z'))),
    `the repeated hour did not use the earlier occurrence (${formatIn('Asia/Tokyo', Date.parse('2026-11-01T05:30:00Z'))})`,
  );

  // A late-evening New York time lands on the next calendar day in Tokyo.
  await date.fill('2026-11-20');
  await time.fill('20:00');
  const evening = instantOf('2026-11-20', '20:00', 'America/New_York');
  t.assert(
    (await result(t.page)).includes(formatIn('Asia/Tokyo', evening)),
    `New York 20:00 is not Tokyo ${formatIn('Asia/Tokyo', evening)}`,
  );
  t.assert(
    (await stat(t.page, 'Date change')) === 'Next day',
    'the next-day label is wrong for a late New York evening',
  );
  t.assert((await stat(t.page, 'Offset difference')) === '+14:00', 'the New York–Tokyo offset difference is wrong');

  // ── Swap turns the converted time into the new source ─────────────────────────
  await t.click('Swap cities');
  t.assert((await from.inputValue()).startsWith('Tokyo'), 'swapping did not put Tokyo in the source field');
  t.assert((await to.inputValue()).startsWith('New York'), 'swapping did not put New York in the target field');
  t.assert((await date.inputValue()) === '2026-11-21', 'swapping did not bring the converted date');
  t.assert(
    (await time.inputValue()) === '10:00',
    `swapping did not bring the converted time (${await time.inputValue()})`,
  );
  t.assert(
    (await stat(t.page, 'Date change')) === 'Previous day',
    'the swapped conversion lost the previous-day label',
  );

  // ── The clock-format switch reaches both results ──────────────────────────────
  await t.page.getByRole('radio', { name: '12-hour' }).click();
  text = await result(t.page);
  t.assert(/AM|PM/u.test(text), 'the 12-hour format did not reach the results');
  await t.page.getByRole('radio', { name: '24-hour' }).click();

  // ── An IANA name typed by hand also works ─────────────────────────────────────
  await from.click();
  await from.fill('Europe/London');
  t.assert((await leave(t)) === 'London, United Kingdom — Europe/London', 'an IANA zone did not settle to its label');

  // ── The copied summary carries both times ─────────────────────────────────────
  await t.page.getByRole('button', { name: 'Copy result' }).click();
  const copied = await t.page.evaluate(() => navigator.clipboard.readText());
  t.assert(
    copied.includes('London, United Kingdom — Europe/London:') &&
      copied.includes('New York, United States — America/New_York:'),
    `the copied result is wrong: ${copied}`,
  );

  // ── A phone-sized screen keeps the fields usable ──────────────────────────────
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px time-zone page has horizontal overflow',
  );
  t.assert(
    await t.page.evaluate(() =>
      [...document.querySelectorAll('main input')].every((field) => field.getBoundingClientRect().width > 80),
    ),
    'a time-zone field is squeezed too narrow on a phone',
  );

  // ── Korean page: a Korean city name, and a save that could not happen ─────────
  await t.page.setViewportSize({ width: 1280, height: 900 });
  await t.open('/ko/time-zone-converter');
  const fromKo = t.page.locator('#tz-from');
  await fromKo.click();
  await fromKo.fill('');
  await fromKo.pressSequentially('도쿄', { delay: 40 });
  t.assert((await leave(t, '#tz-from')) === '도쿄, 일본 — Asia/Tokyo', 'typing 도쿄 did not settle to Tokyo');
  t.assert((await result(t.page)).includes('도쿄, 일본 — Asia/Tokyo'), '도쿄 was not used as the source city');

  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };
  });
  await t.open('/ko/time-zone-converter');
  await t.waitForText('저장하지 못했습니다', 5_000);
}

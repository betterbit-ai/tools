/**
 * Countdown: what a visitor sets up and shares — a named event, a local date and optional time,
 * a live display, a calendar D-day, and the link that reopens the same event.
 *
 * Covers the defects this audit fixed:
 *  - the headline "Copy share link" button was disabled on every load and never became usable:
 *    the static HTML rendered it disabled because the server cannot know the page URL, and
 *    hydration never cleared an attribute only the server had written. The button now carries the
 *    fragment it can build without `window`, so it starts enabled and the absolute link replaces it
 *    once the client runs.
 *  - the static HTML showed the countdown computed when the site was built, presenting a stale
 *    number as "now" on a slow load; it now shows dashes until the first client render.
 */

/** Day/hour/minute/second breakdown of `target - now`, computed here without the tool's code. */
function remaining(now, target) {
  let seconds = Math.max(0, Math.ceil((target - now) / 1000));
  const days = Math.floor(seconds / 86_400);
  seconds -= days * 86_400;
  const hours = Math.floor(seconds / 3_600);
  seconds -= hours * 3_600;
  const minutes = Math.floor(seconds / 60);
  return { days, hours, minutes, seconds: seconds - minutes * 60 };
}

const pad = (value) => String(value).padStart(2, '0');

/** Total seconds a display like {days: 1, hours: 01, minutes: 10, seconds: 05} stands for. */
const total = (parts) =>
  Number(parts.days) * 86_400 + Number(parts.hours) * 3_600 + Number(parts.minutes) * 60 + Number(parts.seconds);

export default async function (t) {
  const page = t.page;
  const start = new Date('2026-11-26T01:40:00Z'); // 10:40 in the browser's Asia/Seoul clock
  await page.clock.install({ time: start });

  /** The four numbers inside [role=timer], read by their label, with the clock they were drawn from. */
  const values = () =>
    page.evaluate(() => {
      const timer = document.querySelector('[role=timer]');
      const out = {};
      for (const stat of timer?.querySelectorAll('div.rounded-md.bg-surface-2') ?? []) {
        const [value, label] = [stat.children[0], stat.children[1]];
        if (label) out[label.textContent.trim().toLowerCase()] = value.textContent.trim();
      }
      out.dday = timer?.querySelector('span.tabular')?.textContent?.trim() ?? '';
      out.notice = timer?.querySelector('[role=alert], [role=status]')?.textContent?.trim() ?? '';
      out.heading = timer?.getAttribute('aria-label') ?? '';
      out.now = Date.now();
      return out;
    });

  /**
   * The displayed countdown must match the target the visitor set, measured on the clock the page
   * was reading. A tick can land between the last redraw and this read, so one second either way
   * is not a defect; a wrong hour or a stale day is.
   */
  const assertCountdown = async (shown, target, label) => {
    const want = total(remaining(shown.now, target.getTime()));
    const got = total(shown);
    t.assert(
      Math.abs(got - want) <= 1,
      `${label}: the page reads ${shown.days}d ${shown.hours}:${shown.minutes}:${shown.seconds}, ${want}s were left`,
    );
  };

  const copyButton = page.getByRole('button', { name: /Copy share link/ });
  const dateField = page.locator('input[type=date]');
  const timeField = page.locator('input[type=time]');
  const nameField = page.locator('input[type=text]').first();

  // ── 1. The built page never presents its build-time countdown as now, and its share button
  //      is not shipped in a state the browser cannot undo.
  const html = await (await fetch(`${t.base}/countdown`)).text();
  const staticTimer = html.match(/<section role="timer"[\s\S]*?<\/section>/)?.[0] ?? '';
  t.assert(staticTimer.includes('—'), `the built HTML has no placeholder in the timer: ${staticTimer.slice(0, 160)}`);
  t.assert(
    !/<button[^>]*\sdisabled[\s=>][^>]*>Copy share link/.test(html),
    'the built HTML ships its share button disabled',
  );

  await t.open('/countdown');
  await page.waitForTimeout(500);

  // ── 2. It opens on the next New Year, counting down in days, hours, minutes and seconds.
  let shown = await values();
  t.assert((await dateField.inputValue()) === '2027-01-01', 'the date field does not hold the next New Year');
  await assertCountdown(shown, new Date(2027, 0, 1), 'New Year');
  t.assert(shown.days === '35' && shown.hours === '13', `New Year opens at ${shown.days}d ${shown.hours}h`);
  t.assert(shown.dday === 'D-36', `the calendar D-day reads ${shown.dday}`);
  t.assert(shown.heading === 'New Year', `the timer is labelled ${JSON.stringify(shown.heading)}`);

  // ── 3. It keeps its own time: one second later the display has moved on by one.
  const firstSeconds = Number((await values()).seconds);
  await page.clock.runFor(1000);
  await page.waitForTimeout(60);
  const nextSeconds = Number((await values()).seconds);
  const drop = (firstSeconds - nextSeconds + 60) % 60;
  t.assert(drop >= 1 && drop <= 2, `after one second of clock the display went ${firstSeconds} → ${nextSeconds}`);

  // ── 4. The event name reaches the timer and the address bar.
  await nameField.fill('Trip to Busan');
  await page.waitForTimeout(200);
  shown = await values();
  t.assert(shown.heading === 'Trip to Busan', `the timer is labelled ${JSON.stringify(shown.heading)}`);
  t.assert(page.url().includes('Trip+to+Busan'), `the address bar did not follow the name: ${page.url()}`);

  // ── 5. A date and time combination a person would actually enter, including a same-day one.
  await dateField.fill('2026-11-27');
  await timeField.fill('18:30');
  await page.waitForTimeout(200);
  shown = await values();
  await assertCountdown(shown, new Date(2026, 10, 27, 18, 30), 'tomorrow 18:30');
  t.assert(shown.days === '1' && shown.hours === '07', `tomorrow 18:30 reads ${shown.days}d ${shown.hours}h`);
  t.assert(shown.dday === 'D-1', `tomorrow's D-day reads ${shown.dday}`);

  await dateField.fill('2026-11-26');
  await timeField.fill('12:00');
  await page.waitForTimeout(200);
  shown = await values();
  t.assert(shown.days === '0', `today at noon shows ${shown.days} days`);
  t.assert(shown.hours === '01', `today at noon shows ${shown.hours}:${shown.minutes}`);
  t.assert(shown.dday === 'D-Day', `a target later today reads ${shown.dday}`);

  // ── 6. After the moment passes it counts elapsed time and says so instead of counting backwards.
  await dateField.fill('2026-11-25');
  await timeField.fill('09:30');
  await page.waitForTimeout(200);
  shown = await values();
  t.assert(shown.dday === 'D+1', `a target a day ago reads ${shown.dday}`);
  t.assert(shown.days === '1' && shown.hours === '01', `elapsed time reads ${shown.days}d ${shown.hours}h`);
  t.assert(/passed|elapsed|ago/i.test(shown.notice), `nothing explains that the target passed: ${shown.notice}`);

  // ── 7. A hidden tab slows timers down; the display still reads the device clock when it wakes.
  await dateField.fill('2026-11-28');
  await timeField.fill('18:30');
  await page.waitForTimeout(200);
  await page.clock.setSystemTime(new Date('2026-11-27T09:40:00Z')); // 18:40 Seoul, no timer fired yet
  await page.clock.runFor(300);
  await page.waitForTimeout(80);
  shown = await values();
  t.assert(
    shown.days === '0' && shown.hours === '23' && shown.minutes === '50' && shown.seconds === '00',
    `after a 33-hour jump the display reads ${shown.days}d ${shown.hours}:${shown.minutes}:${shown.seconds}`,
  );

  // ── 8. The share link copies the exact address and reopens the same event on a fresh load.
  await dateField.fill('2026-12-31');
  await timeField.fill('23:59');
  await nameField.fill('Year end');
  await page.waitForTimeout(250);
  t.assert(await copyButton.isEnabled(), 'the share link button is still disabled');
  await copyButton.click();
  await page.waitForTimeout(150);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === page.url(), `copied ${copied} instead of the page address ${page.url()}`);
  t.assert(
    copied.includes('date=2026-12-31') && copied.includes('time=23%3A59'),
    `the link misses its values: ${copied}`,
  );

  await page.goto(copied, { waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(400);
  t.assert((await dateField.inputValue()) === '2026-12-31', 'the shared link lost the date');
  t.assert((await timeField.inputValue()) === '23:59', 'the shared link lost the time');
  t.assert((await nameField.inputValue()) === 'Year end', 'the shared link lost the name');
  shown = await values();
  await assertCountdown(shown, new Date(2026, 11, 31, 23, 59), 'shared link');

  // ── 9. Quick events set the next occurrence rather than a past one.
  await t.click('Christmas');
  await page.waitForTimeout(200);
  t.assert((await dateField.inputValue()) === '2026-12-25', 'Christmas did not set 2026-12-25');
  await t.click("Valentine's Day");
  await page.waitForTimeout(200);
  t.assert((await dateField.inputValue()) === '2027-02-14', "Valentine's Day did not move to the next 14 February");
  await t.click('Reset');
  await page.waitForTimeout(200);
  t.assert((await dateField.inputValue()) === '2027-01-01', 'Reset did not return to New Year');

  // ── 10. A missing date is answered with an explanation, and the share button comes back with one.
  await dateField.fill('');
  await page.waitForTimeout(200);
  shown = await values();
  t.assert(!(await copyButton.isEnabled()), 'the share button offers a link for a date that is not set');
  t.assert(shown.notice.length > 0, 'an empty date shows no explanation');
  await dateField.fill('2027-05-05');
  await page.waitForTimeout(250);
  t.assert(await copyButton.isEnabled(), 'the share button stayed disabled after a valid date was set');
  shown = await values();
  t.assert(shown.dday === 'D-159', `5 May reads ${shown.dday}`);

  // ── 11. A long event name is cut where a person would expect, without splitting characters.
  await nameField.fill('가'.repeat(120));
  await page.waitForTimeout(200);
  t.assert((await nameField.inputValue()).length === 80, 'the name was not cut to 80 characters');

  // ── 12. 375 px, dark: the two columns stack and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);

  // ── 13. The Korean page counts down in Korean.
  await page.setViewportSize({ width: 1280, height: 900 });
  await t.open('/ko/countdown');
  await page.waitForTimeout(500);
  await page.locator('input[type=date]').fill('2027-01-01');
  await page.locator('input[type=time]').fill('');
  await page.waitForTimeout(300);
  const korean = await page.evaluate(() => {
    const timer = document.querySelector('[role=timer]');
    return {
      text: timer.innerText.replace(/\s+/g, ' '),
      values: [...timer.querySelectorAll('div.rounded-md.bg-surface-2')].map((stat) =>
        stat.children[0].textContent.trim(),
      ),
      now: Date.now(),
    };
  });
  t.assert(korean.text.includes('일') && korean.text.includes('시간'), `the Korean timer reads ${korean.text}`);
  const koreanParts = {
    days: korean.values[0],
    hours: korean.values[1],
    minutes: korean.values[2],
    seconds: korean.values[3],
  };
  const koreanWant = remaining(korean.now, new Date(2027, 0, 1).getTime());
  t.assert(
    Math.abs(total(koreanParts) - total(koreanWant)) <= 1,
    `the Korean countdown reads ${korean.text}, ${total(koreanWant)}s were left`,
  );
}

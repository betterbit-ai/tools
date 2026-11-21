/**
 * Typing test: the sample has to be real text, the clock has to start on the first keystroke and
 * stop at the chosen duration, WPM and 타수 have to match an independently counted score, a restart
 * has to put the cursor back in the box, Korean IME composition has to survive, pasting has to stay
 * blocked, and a personal best that could not be saved has to be visible.
 */

/** One labelled Stat box from any aria-live result area. */
const stat = (page, label) =>
  page.evaluate((wanted) => {
    for (const box of document.querySelectorAll('div[aria-live=polite] > div')) {
      const [value, name] = box.children;
      if (name?.textContent?.trim() === wanted) return value?.textContent?.trim() ?? null;
    }
    return null;
  }, label);

const sample = async (page) => (await page.locator('#tt-sample-sr').textContent()).trim();
const words = (text) => text.split(/\s+/u).filter(Boolean);
/** The first paint carries a fixed seed sample; wait for the shuffled one the island swaps in. */
const waitForSample = (page) =>
  page.waitForFunction(
    () => new Set((document.querySelector('#tt-sample-sr')?.textContent ?? '').trim().split(/\s+/u)).size > 5,
    null,
    { timeout: 5_000 },
  );

/* ── An independent 2-벌식 keystroke count, written from the keyboard layout, not from the page. ── */
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JONG = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];
const doubleVowel = new Set(['ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ']);
const doubleFinal = new Set(['ㄳ', 'ㄵ', 'ㄶ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅄ']);
function strokes(ch) {
  const code = ch.codePointAt(0);
  if (code < 0xac00 || code > 0xd7a3) return 1; // a space or a Latin letter is one key
  const offset = code - 0xac00;
  const jung = JUNG[Math.floor(offset / 28) % 21];
  const jong = JONG[offset % 28];
  return 1 + (doubleVowel.has(jung) ? 2 : 1) + (jong ? (doubleFinal.has(jong) ? 2 : 1) : 0);
}
const totalStrokes = (text) => [...text].reduce((sum, ch) => sum + strokes(ch), 0);

/** Compose one Hangul syllable key by key, the way a Korean IME does, and commit it. */
async function imeType(t, cdp, syllable) {
  const code = syllable.codePointAt(0);
  if (code < 0xac00 || code > 0xd7a3) {
    await cdp.send('Input.insertText', { text: syllable });
    return;
  }
  const offset = code - 0xac00;
  const cho = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[Math.floor(offset / 588)];
  const jung = JUNG[Math.floor(offset / 28) % 21];
  for (const text of [cho, cho + jung, syllable]) {
    await cdp.send('Input.imeSetComposition', { text, selectionStart: text.length, selectionEnd: text.length });
    await t.page.waitForTimeout(20);
    const value = await t.page.locator('#tt-input').inputValue();
    t.assert(value.endsWith(text), `composing ${text} left the box at "${value}"`);
  }
  await cdp.send('Input.insertText', { text: syllable });
  await t.page.waitForTimeout(20);
  t.assert((await t.page.locator('#tt-input').inputValue()).endsWith(syllable), `committing ${syllable} was lost`);
}

export default async function (t) {
  await t.open('/typing-test');
  await waitForSample(t.page);
  // Freeze the clock only after the island has hydrated: a paused clock also stops the frame
  // callback Preact flushes effects with, so the first sample has to be in place already.
  const start = new Date('2026-11-21T01:00:00Z');
  await t.page.clock.install({ time: start });
  await t.page.clock.pauseAt(start);
  const input = t.page.locator('#tt-input');

  // ── The sample is real prose, not one repeated word ──────────────────────────────
  const english = await sample(t.page);
  t.assert(english.length > 100, `the English sample is too short (${english.length} chars)`);
  t.assert(new Set(words(english)).size > 20, 'the English sample reuses too few distinct words');

  // ── Idle state ──────────────────────────────────────────────────────────────────
  t.assert((await stat(t.page, 'Time left')) === '30s', 'the test does not start at 30 seconds');
  t.assert((await stat(t.page, 'WPM')) === '0', 'the idle WPM is not 0');
  t.assert((await stat(t.page, 'Accuracy')) === '100%', 'the idle accuracy is not 100%');
  t.assert((await stat(t.page, 'Personal best')) === '—', 'a fresh page already has a personal best');
  t.assert((await t.page.evaluate(() => document.activeElement?.id)) === 'tt-input', 'the box is not focused on load');

  // ── The clock starts on the first keystroke, not on page load ──────────────────
  const prefix = english.slice(0, 25);
  await input.pressSequentially(prefix, { delay: 0 });
  t.assert((await input.inputValue()) === prefix, 'the first characters were not accepted');
  await t.page.clock.runFor(6_000);
  t.assert((await stat(t.page, 'Time left')) === '24s', 'six seconds of typing did not use six seconds');
  // WPM counts five characters as a word.
  t.assert((await stat(t.page, 'WPM')) === String(Math.round(25 / 5 / 0.1)), 'WPM after 25 chars in 6 s is wrong');
  t.assert((await stat(t.page, 'Accuracy')) === '100%', 'a clean prefix is not 100% accurate');

  // A typo lowers accuracy and stops counting toward speed.
  await input.press(english[25] === 'x' ? 'q' : 'x');
  await t.page.clock.runFor(6_000);
  t.assert((await stat(t.page, 'Accuracy')) === '96.2%', `one wrong character gives ${await stat(t.page, 'Accuracy')}`);
  t.assert((await stat(t.page, 'WPM')) === '25', 'a typo still counted toward speed');

  // Correcting it brings accuracy back.
  await input.press('Backspace');
  await input.press(english[25]);
  await t.page.clock.runFor(3_000);
  t.assert((await stat(t.page, 'Accuracy')) === '100%', 'correcting the typo did not restore accuracy');

  // ── The test stops at the chosen duration and keeps a personal best ───────────
  await t.page.clock.runFor(20_000);
  t.assert((await stat(t.page, 'Time left')) === '0s', 'the test did not reach the end of the duration');
  t.assert(await input.isDisabled(), 'the typing box is still editable after the test ended');
  t.assert((await stat(t.page, 'WPM')) === '10', 'the final WPM is not the capped 30-second score');
  t.assert((await stat(t.page, 'Personal best')) === '10', 'the personal best was not recorded');
  t.assert(
    (await t.page.evaluate(() => localStorage.getItem('tools:typing-test:best:en:30'))) === '10',
    'the personal best was not written to this browser',
  );
  await t.waitForText('New personal best!', 5_000);

  // ── Restart puts the cursor back (the next run has to start by typing) ────────
  await t.click('Restart');
  await t.page.clock.runFor(50); // effects (and the frame callback) flush on a clock tick while paused
  t.assert((await input.inputValue()) === '', 'restart did not clear the box');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.id)) === 'tt-input',
    'restart did not put the cursor back in the typing box',
  );
  await t.page.keyboard.type(prefix.slice(0, 6), { delay: 10 });
  t.assert((await input.inputValue()) === prefix.slice(0, 6), 'typing right after a restart was lost');

  // Esc also restarts from the results screen.
  await t.page.clock.runFor(31_000);
  t.assert(await input.isDisabled(), 'the second run did not finish');
  await t.page.keyboard.press('Escape');
  await t.page.clock.runFor(50);
  t.assert((await input.inputValue()) === '', 'Esc did not restart after the test ended');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.id)) === 'tt-input',
    'Esc left the cursor outside the typing box',
  );

  // ── Pasting the sample is refused ─────────────────────────────────────────────
  await t.page.evaluate((text) => navigator.clipboard.writeText(text), english);
  await input.press('Control+V');
  t.assert((await input.inputValue()) === '', 'pasting the sample into the box was allowed');

  // ── Duration and language controls change what they promise ───────────────────
  await t.page.getByRole('radio', { name: '15s' }).click();
  t.assert((await stat(t.page, 'Time left')) === '15s', 'the 15-second option did not shorten the test');
  t.assert(words(await sample(t.page)).length < words(english).length, 'the shorter test kept the long sample');

  await t.page.getByRole('radio', { name: '한글' }).click();
  t.assert((await stat(t.page, 'CPM')) === '0', 'the Korean speed unit did not switch to keystrokes per minute');
  const korean = await sample(t.page);
  t.assert(/[가-힣]/u.test(korean), 'the Korean mode still shows English words');

  // ── Korean IME composition is read, not rebuilt ───────────────────────────────
  const cdp = await t.page.context().newCDPSession(t.page);
  await input.click();
  const koreanPrefix = [...korean].slice(0, 3).join('');
  for (const ch of koreanPrefix) await imeType(t, cdp, ch);
  t.assert((await input.inputValue()) === koreanPrefix, 'the Korean composition was lost');
  await t.page.clock.runFor(6_000);
  const expected = totalStrokes(koreanPrefix);
  t.assert(
    (await stat(t.page, 'CPM')) === String(Math.round(expected / 0.1)),
    `CPM for "${koreanPrefix}" (${expected} strokes) is ${await stat(t.page, 'CPM')}`,
  );
  t.assert((await stat(t.page, 'Accuracy')) === '100%', 'typed Korean was not scored as accurate');

  // ── A phone-sized screen keeps the test usable ────────────────────────────────
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px typing-test page has horizontal overflow',
  );
  t.assert(
    await t.page.evaluate(() => {
      const box = document.querySelector('#tt-input');
      if (!box) return false;
      return box.getBoundingClientRect().width > 240 && parseFloat(getComputedStyle(box).fontSize) >= 16;
    }),
    'the typing box is too narrow for a phone, or small enough to make iOS zoom on focus',
  );

  // ── A personal best that cannot be stored is said out loud ────────────────────
  await t.page.setViewportSize({ width: 1280, height: 900 });
  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('storage blocked');
    };
  });
  await t.open('/ko/typing-test');
  await t.page.clock.runFor(200); // a paused clock needs a tick for the island's effects to settle
  await input.click();
  await t.page.keyboard.insertText([...(await sample(t.page))].slice(0, 5).join(''));
  await t.page.clock.runFor(31_000);
  await t.waitForText('개인 최고 기록을 저장하지 못했습니다', 5_000);
}

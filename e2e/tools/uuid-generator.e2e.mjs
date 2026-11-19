/**
 * UUID generator: RFC 9562 v4/v7 bits, a batch size a person can type, and — the part that used
 * to be wrong — the text-format and case controls have to change the IDs already on screen
 * without throwing those IDs away.
 */

const UUID_STANDARD = /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const outputText = (page) => page.locator('output').innerText();
const lines = async (page) => (await outputText(page)).trim().split('\n');

const stat = (page, label) =>
  page.evaluate((wanted) => {
    for (const box of document.querySelectorAll('div[aria-live=polite] > div')) {
      const [value, name] = box.children;
      if (name?.textContent?.trim() === wanted) return value?.textContent?.trim() ?? null;
    }
    return null;
  }, label);

export default async function (t) {
  await t.page.addInitScript(() => localStorage.clear());

  // ── A new visit starts with one ready-to-copy v4 UUID ───────────────────────────────
  await t.open('/uuid-generator');
  await t.waitForText(/[0-9a-f]{8}-[0-9a-f]{4}-4/, 10_000);
  const first = (await lines(t.page))[0];
  t.assert(UUID_STANDARD.test(first), `the first UUID is not a v4 UUID: ${first}`);
  t.assert((await stat(t.page, 'Generated')) === '1', 'the page did not start with one UUID');

  // ── A batch size presets generates that many ─────────────────────────────────────────
  await t.click('100 UUIDs');
  let batch = await lines(t.page);
  t.assert(batch.length === 100, `"100 UUIDs" left ${batch.length} UUIDs`);
  t.assert(
    batch.every((line) => UUID_STANDARD.test(line)),
    'a generated value is not a v4 UUID',
  );
  t.assert(
    (await t.page.getByRole('textbox', { name: /How many/ }).inputValue()) === '100',
    'the preset did not set the count',
  );
  t.assert(new Set(batch).size === 100, 'the batch contains duplicates');
  t.assert((await stat(t.page, 'Generated')) === '100', 'the generated count is wrong');

  // ── Changing the text format keeps the same IDs ─────────────────────────────────────
  const firstStandard = batch[0];
  await t.page.getByRole('radio', { name: 'No hyphens' }).click();
  batch = await lines(t.page);
  t.assert(batch.length === 100, 'switching format lost part of the batch');
  t.assert(
    batch[0] === firstStandard.replaceAll('-', ''),
    'the format control changed the IDs instead of their format',
  );
  t.assert(
    batch.every((line) => /^[0-9a-f]{32}$/.test(line)),
    'the compact output still has hyphens',
  );

  await t.page.getByRole('radio', { name: 'URN' }).click();
  t.assert((await lines(t.page))[0] === `urn:uuid:${firstStandard}`, 'the URN output does not wrap the same UUID');

  await t.page.getByRole('radio', { name: '{ Braces }' }).click();
  t.assert((await lines(t.page))[0] === `{${firstStandard}}`, 'the brace output does not wrap the same UUID');

  await t.page.getByText('Uppercase A–F').click();
  const upper = await lines(t.page);
  t.assert(upper[0] === `{${firstStandard.toUpperCase()}}`, 'uppercase did not re-render the same UUID');
  t.assert(
    upper.every((line) => /^\{[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}\}$/.test(line)),
    'uppercase left lowercase digits',
  );
  await t.page.getByText('Uppercase A–F').click();

  // ── The copy format wraps what is on screen ─────────────────────────────────────────
  await t.page.getByRole('radio', { name: 'JSON array' }).click();
  const parsed = JSON.parse(await outputText(t.page));
  t.assert(Array.isArray(parsed) && parsed.length === 100, 'the JSON copy format is not an array of the batch');
  t.assert(parsed[0] === `{${firstStandard}}`, 'the JSON array does not hold the same UUIDs');
  await t.page.getByRole('radio', { name: 'Lines' }).click();

  // ── v7: time-ordered IDs with a real timestamp prefix ───────────────────────────────
  await t.page.getByRole('radio', { name: 'Standard' }).click();
  t.assert((await lines(t.page))[0] === firstStandard, 'switching back to the standard format lost the batch');
  const before = Date.now();
  await t.page.getByRole('radio', { name: 'v7 time-ordered' }).click();
  const v7 = (await lines(t.page))[0];
  t.assert(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v7), `not a v7 UUID: ${v7}`);
  const stamp = parseInt(v7.slice(0, 8) + v7.slice(9, 13), 16);
  t.assert(Math.abs(stamp - before) < 5 * 60_000, 'the v7 timestamp prefix is not the generation time');
  t.assert((await lines(t.page)).length === 100, 'switching to v7 lost the batch size');

  // ── A typed batch size, including one copied with a separator ───────────────────────
  const count = t.page.getByRole('textbox', { name: /How many/ });
  await count.fill('1,000');
  t.assert((await count.inputValue()) === '1,000', 'a grouped batch size was rewritten while typing');
  await t.click('Generate UUIDs');
  t.assert((await lines(t.page)).length === 1000, 'generating 1,000 typed UUIDs did not work');
  t.assert((await stat(t.page, 'Generated')) === '1,000', 'the printed batch size is not grouped');

  // The documented maximum works in one click.
  await t.click('1,000 UUIDs');
  await count.fill('10000');
  await t.click('Generate UUIDs');
  const max = await lines(t.page);
  t.assert(max.length === 10_000, `10,000 UUIDs produced ${max.length} lines`);
  t.assert(UUID_STANDARD.test(max[max.length - 1]), 'the last UUID of a 10,000 batch is malformed');

  // A batch size that cannot be used is explained and does not wipe the IDs on screen.
  await count.fill('0');
  await t.waitForText('Enter a whole number from 1 to 10,000', 5_000);
  t.assert((await lines(t.page)).length === 10_000, 'an invalid batch size cleared the generated list');

  await count.fill('10');
  await t.click('Generate UUIDs');
  t.assert((await lines(t.page)).length === 10, 'the tool did not recover from an invalid batch size');

  // ── The G shortcut makes a new batch ────────────────────────────────────────────────
  const beforeShortcut = (await lines(t.page))[0];
  await t.page.locator('h1').click();
  await t.page.keyboard.press('g');
  t.assert((await lines(t.page))[0] !== beforeShortcut, 'the G shortcut did not generate a new batch');

  // ── A phone-sized screen ────────────────────────────────────────────────────────────
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px UUID page has horizontal overflow',
  );

  // Blocked storage: the note says the options stay in this browser, so it has to say when they do not.
  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };
  });
  await t.open('/ko/uuid-generator');
  await t.waitForText('저장하지 못했습니다', 5_000);
}

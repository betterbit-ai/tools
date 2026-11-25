/**
 * Hash generator: checksums for text, Unicode and a real file, each compared with a digest computed
 * here by Node's crypto — never by reading the page back to itself.
 *
 * Covers the defects this audit fixed:
 *  - MD5 ran as one blocking pass over the whole file (a 40 MB file froze the page for ~0.5 s with
 *    no progress and no way to stop it); it now streams and reports progress, and Cancel works;
 *  - a pasted document over 200,000 characters was silently not kept while the page still said
 *    "Saved only in this browser", so a refresh replaced it with an older value;
 *  - the input size re-encoded the whole text on every keystroke.
 */
import { createHash } from 'node:crypto';
import { mkdtempSync, openSync, writeSync, closeSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const digestOf = (algorithm, bytes) => createHash(algorithm).update(bytes).digest('hex');
const sha256 = (value) => digestOf('sha256', Buffer.from(value, 'utf8'));
const md5 = (value) => digestOf('md5', Buffer.from(value, 'utf8'));

const stat = (page, label) =>
  page.evaluate((wanted) => {
    for (const element of document.querySelectorAll('main div[class*="bg-surface-2"]')) {
      if (element.children.length !== 2 || !element.children[0].className.includes('tabular')) continue;
      if (element.children[1].textContent.trim() === wanted) return element.children[0].textContent.trim();
    }
    return null;
  }, label);

export default async function (t) {
  const page = t.page;
  await t.open('/hash-generator');
  await page.waitForTimeout(600);

  const output = () => page.locator('main output').innerText();
  const textarea = page.locator('main textarea');
  const expected = page.locator('main input[type=text]');
  const setText = async (value) => {
    await textarea.fill(value);
    await page.waitForTimeout(700);
  };
  const pickAlgorithm = async (name) => {
    await page.getByRole('radio', { name, exact: true }).click();
    await page.waitForTimeout(700);
  };
  const matchMessage = async () => {
    const messages = await page.locator('main [role=status], main [role=alert]').allInnerTexts();
    return messages.find((message) => /Match|No match/.test(message)) ?? '';
  };

  // ── 0. The controls are announced by their own names.
  const radioNames = await page
    .locator('[role=radiogroup] [role=radio]')
    .evaluateAll((radios) => radios.map((radio) => radio.getAttribute('aria-label') ?? radio.textContent.trim()));
  t.assert(
    JSON.stringify(radioNames) === JSON.stringify(['Text', 'File', 'MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']),
    `the hash controls are announced as ${JSON.stringify(radioNames)}`,
  );

  // ── 1. The page opens on SHA-256 of its own sample text.
  t.assert((await output()) === sha256('Betterbit Tools'), `the default digest is wrong: ${await output()}`);
  t.assert((await stat(page, 'Digest size')) === '32 B', `digest size: ${await stat(page, 'Digest size')}`);

  // ── 2. Text typed by a user: every algorithm, checked against Node's crypto.
  await setText('abc');
  t.assert((await output()) === sha256('abc'), `SHA-256 of "abc": ${await output()}`);
  t.assert((await stat(page, 'Input size')) === '3 B', `input size of "abc": ${await stat(page, 'Input size')}`);
  for (const [algorithm, name] of [
    ['md5', 'MD5'],
    ['sha1', 'SHA-1'],
    ['sha256', 'SHA-256'],
    ['sha384', 'SHA-384'],
    ['sha512', 'SHA-512'],
  ]) {
    await pickAlgorithm(name);
    t.assert((await output()) === digestOf(algorithm, Buffer.from('abc')), `${name} of "abc": ${await output()}`);
  }

  // ── 3. Unicode is hashed as UTF-8, not as code units.
  await pickAlgorithm('SHA-256');
  await setText('안녕하세요 😀');
  t.assert((await output()) === sha256('안녕하세요 😀'), `SHA-256 of Korean and an emoji: ${await output()}`);
  await pickAlgorithm('MD5');
  t.assert((await output()) === md5('안녕하세요 😀'), `MD5 of Korean and an emoji: ${await output()}`);
  t.assert((await page.locator('main').innerText()).includes('legacy checksums only'), 'the MD5 warning is missing');

  // ── 4. A 1 MB paste is hashed completely and quickly.
  const megabyte = 'abcdefghij'.repeat(100_000);
  await pickAlgorithm('SHA-256');
  const started = Date.now();
  await setText(megabyte);
  t.assert(Date.now() - started < 8000, `1 MB of text took ${Date.now() - started} ms`);
  t.assert((await output()) === sha256(megabyte), 'the 1 MB SHA-256 digest is wrong');
  t.assert((await stat(page, 'Input size')) === '977 KB', `1 MB input size: ${await stat(page, 'Input size')}`);

  // ── 5. A document too long to keep is named as such instead of claiming it was saved.
  await setText('x'.repeat(200_001));
  const saveLabel = await page.locator('main').innerText();
  t.assert(
    saveLabel.includes('Too long to keep after a refresh'),
    'a 200,001-character document still claims it is saved',
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(800);
  t.assert(
    (await textarea.inputValue()).length !== 200_001,
    'the over-long document was kept after all, so the label is wrong',
  );

  // ── 6. An expected checksum is compared after harmless formatting, and a wrong one is caught.
  await setText('abc');
  const abcDigest = sha256('abc');
  await expected.fill(abcDigest.toUpperCase().match(/.{2}/g).join(':'));
  await page.waitForTimeout(400);
  t.assert(
    /Match/.test(await matchMessage()),
    `a colon-separated uppercase checksum is not matched: ${await matchMessage()}`,
  );
  const digits = abcDigest.split('');
  digits[0] = digits[0] === '0' ? '1' : '0';
  await expected.fill(digits.join(''));
  await page.waitForTimeout(400);
  t.assert(/No match/.test(await matchMessage()), `a wrong checksum is not caught: ${await matchMessage()}`);
  await expected.fill('');
  await page.waitForTimeout(300);
  t.assert((await matchMessage()) === '', 'the comparison stays on screen after the expected field is cleared');

  // ── 7. Copy the digest.
  await page.getByRole('button', { name: 'Copy' }).first().click();
  await page.waitForTimeout(300);
  t.assert((await page.evaluate(() => navigator.clipboard.readText())) === sha256('abc'), 'the copied digest is wrong');

  // ── 8. File mode: a 4 MB file hashed with SHA-256 and MD5, checked against the same bytes.
  const sample = Buffer.alloc(4 * 1024 * 1024 + 7);
  for (let index = 0; index < sample.length; index++) sample[index] = (index * 31 + 7) & 0xff;
  const file = { name: 'sample-4mb.bin', mimeType: 'application/octet-stream', buffer: sample };
  await page.getByRole('radio', { name: 'File', exact: true }).click();
  await page.waitForTimeout(300);
  await page.setInputFiles('main input[type=file]', file);
  await page.waitForTimeout(2500);
  t.assert((await output()) === sha256(sample), 'the 4 MB file SHA-256 digest is wrong');
  t.assert((await stat(page, 'Input size')) === '4 MB', `4 MB file size reads ${await stat(page, 'Input size')}`);
  await pickAlgorithm('MD5');
  t.assert((await output()) === digestOf('md5', sample), 'the 4 MB file MD5 digest is wrong');
  t.assert((await page.locator('main').innerText()).includes('sample-4mb.bin'), 'the chosen file is not named');

  // ── 9. The Korean page and a 375 px dark screen.
  await t.open('/ko/hash-generator');
  await page.waitForTimeout(500);
  await page
    .getByRole('radio', { name: /텍스트|Text/ })
    .first()
    .click();
  await page.getByRole('radio', { name: 'SHA-256', exact: true }).click();
  await page.waitForTimeout(300);
  await page.locator('main textarea').fill('abc');
  await page.waitForTimeout(700);
  t.assert((await page.locator('main output').innerText()) === sha256('abc'), 'the Korean page hashes differently');
  t.assert((await page.locator('main').innerText()).includes('해시'), 'the Korean page has no hash heading');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  t.assert(!t.errors.page.length, `page error: ${t.errors.page[0]}`);

  // The heavy file work runs last: a single-process test browser that has just hashed 100 MB
  // cannot load another page, and the Korean and mobile checks above do not need that memory.
  await t.open('/hash-generator');
  await page.waitForTimeout(600);
  await page.getByRole('radio', { name: 'File', exact: true }).click();
  await page.getByRole('radio', { name: 'MD5', exact: true }).click();
  await page.waitForTimeout(300);

  // ── 10. A 40 MB MD5 reports progress, can be cancelled, and never freezes the page.
  const scratch = mkdtempSync(join(tmpdir(), 'hash-e2e-'));
  const bigPath = join(scratch, 'large-40mb.bin');
  const big = Buffer.alloc(40 * 1024 * 1024);
  for (let index = 0; index < big.length; index += 4096) big[index] = index & 0xff;
  const bigFd = openSync(bigPath, 'w');
  writeSync(bigFd, big);
  closeSync(bigFd);
  const bigFile = bigPath;
  await page.setInputFiles('main input[type=file]', bigFile);
  const sawProgress = await page
    .waitForFunction(() => /Calculating… \d+%/.test(document.querySelector('main').innerText), { timeout: 10_000 })
    .then(() => true)
    .catch(() => false);
  t.assert(sawProgress, 'a 40 MB MD5 hash shows neither progress nor a way to stop it');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(800);
  t.assert((await output()).trim() !== digestOf('md5', big), 'Cancel did not stop the hash');
  const afterCancel = await page.locator('main').innerText();
  t.assert(!/Calculating/.test(afterCancel), 'the progress message stays after cancelling');

  // Painted frames are measured only while the hash runs: selecting the file is the browser's work.
  await page.setInputFiles('main input[type=file]', bigFile);
  await page.waitForFunction(() => /Calculating/.test(document.querySelector('main').innerText), { timeout: 10_000 });
  await page.evaluate(() => {
    window.__gaps = [];
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      window.__gaps.push(now - last);
      last = now;
      if (window.__gaps.length < 5000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.waitForFunction(
    (wanted) => document.querySelector('main output').textContent.trim() === wanted,
    digestOf('md5', big),
    { timeout: 60_000 },
  );
  const worstGap = await page.evaluate(() => Math.round(Math.max(...window.__gaps)));
  t.assert(worstGap < 300, `the page stopped painting for ${worstGap} ms while hashing 40 MB`);

  // ── 10. A file over the stated 64 MB limit is refused with an explanation.
  const oversizedPath = join(scratch, 'too-big.bin');
  const oversizedFd = openSync(oversizedPath, 'w');
  writeSync(oversizedFd, Buffer.alloc(64 * 1024 * 1024 + 1));
  closeSync(oversizedFd);
  await page.setInputFiles('main input[type=file]', oversizedPath);
  await page.waitForTimeout(600);
  t.assert(
    (await page.locator('main [role=alert]').allInnerTexts()).some((message) => /64 MB/.test(message)),
    'a file over the limit is refused without an explanation',
  );

  rmSync(scratch, { recursive: true, force: true });
}

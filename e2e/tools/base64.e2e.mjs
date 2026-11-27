// Real-browser audit for base64: 1 MB pastes, an 8 MB file, Unicode, files, URL-safe output and
// error positions. Large text is inserted the way a paste inserts it (native value + input event),
// because driving a megabyte through the automation protocol crashes the headless renderer itself.
const b64 = (text) => Buffer.from(text, 'utf8').toString('base64');

async function resultText(page) {
  return page.locator('main pre').first().innerText();
}

let previous = null;

/**
 * Waits until the result area shows a new, finished result. Checking only for the absence of
 * "Converting…" would return the previous conversion, because the new one starts after the
 * 150 ms debounce and a re-render.
 */
async function settled(t, timeoutMs = 30_000, allowSame = false) {
  const started = Date.now();
  for (;;) {
    const text = await resultText(t.page);
    const finished = !text.includes('Converting') && text !== 'The result will appear here.';
    if (finished && (allowSame || text !== previous)) {
      previous = text;
      return text;
    }
    if (Date.now() - started > timeoutMs) t.fail(`conversion did not settle within ${timeoutMs} ms`);
    await t.page.waitForTimeout(100);
  }
}

/** Inserts text into the tool's textarea exactly as a paste does. */
async function paste(t, text) {
  await t.page.evaluate((value) => {
    const area = document.querySelector('#base64-input');
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(area, value);
    area.dispatchEvent(new Event('input', { bubbles: true }));
  }, text);
  await t.page.waitForTimeout(350);
}

export default async function (t) {
  const page = t.page;
  await t.open('/base64');
  const field = page.locator('#base64-input');
  const set = async (value) => {
    await field.fill(value);
    return settled(t);
  };

  // 1) Default sample is encoded on load.
  const sample = await settled(t);
  t.assert(sample === b64('Betterbit Tools'), `default output ${sample} is not the Base64 of the sample`);

  // 2) Unicode, emoji and CJK characters round-trip through UTF-8.
  const unicode = '한글 🎉 日本語 ﬁ';
  t.assert((await set(unicode)) === b64(unicode), 'Unicode encoding does not match UTF-8 Base64');

  // 3) A 1 MB paste is a normal input, not an error, and finishes quickly.
  // '?' and '~' make the encoder emit both / and +, so the URL-safe comparison is real.
  const bigText = 'The quick brown fox jumps over the lazy dog. 한글 🎉 ???~~~\n'.repeat(16_000);
  const bigBytes = Buffer.byteLength(bigText, 'utf8');
  t.assert(bigBytes > 1_000_000, 'the 1 MB fixture is too small');
  const pasteStart = Date.now();
  await paste(t, bigText);
  const bigEncoded = await settled(t);
  const pasteMs = Date.now() - pasteStart;
  t.assert(
    bigEncoded === b64(bigText),
    `the 1 MB paste did not encode to the expected Base64 (${bigEncoded.length} of ${b64(bigText).length} characters, starts "${bigEncoded.slice(0, 24)}")`,
  );
  t.assert(pasteMs < 6_000, `a ${(bigBytes / 1e6).toFixed(1)} MB paste took ${pasteMs} ms`);
  // 1.4 MB of output is under the display limit, so the whole result is readable.
  t.assert(!(await page.locator('main').innerText()).includes('Showing the first'), 'a 1.4 MB result was cut short');

  // 4) URL-safe output swaps the two symbols and keeps the rest identical.
  await page.getByRole('radio', { name: 'URL-safe (-_)' }).click();
  const urlEncoded = await settled(t);
  t.assert(
    urlEncoded === b64(bigText).replaceAll('+', '-').replaceAll('/', '_'),
    'URL-safe output does not match the standard alphabet with +/ swapped',
  );
  await page.getByRole('radio', { name: 'Standard (+/)' }).click();
  await page.waitForTimeout(350);

  // 5) Decoding the 1 MB Base64 gives the original text back.
  await page.getByRole('radio', { name: 'Decode' }).click();
  await paste(t, bigEncoded);
  t.assert((await settled(t)) === bigText, 'decoding the 1 MB Base64 did not return the original text');
  // The size figures describe the payload, not the whitespace and padding around it.
  t.assert((await page.locator('main').innerText()).includes('-25%'), 'the decoded size change is wrong');

  // 6) A full data: URI is decoded by taking its payload.
  const greeting = '안녕하세요, 반갑습니다';
  t.assert(
    (await set(`data:text/plain;charset=utf-8;base64,${b64(greeting)}`)) === greeting,
    'data URI was not decoded',
  );

  // 7) Invalid input names the exact character and position instead of failing silently.
  await field.fill('SGVsbG8*');
  await t.waitForText(/isn.t part of the Base64 alphabet/, 10_000);
  const errorText = await page.locator('main').innerText();
  t.assert(/\*/.test(errorText) && /8/.test(errorText), `the invalid-character error is not specific: ${errorText}`);

  // 8) Non-UTF-8 bytes are reported, and the file download keeps them byte for byte.
  await field.fill('//79');
  await t.waitForText(/isn.t valid UTF-8/, 10_000);
  const downloaded = await t.download(() => t.click('Download file'));
  t.assert(downloaded.bytes.equals(Buffer.from([0xff, 0xfe, 0xfd])), 'the decoded binary download has the wrong bytes');

  // 9) Encoding a real file, then downloading its .txt, matches an independent Base64.
  await page.getByRole('radio', { name: 'Encode' }).click();
  const payload = Buffer.alloc(300_000);
  for (let i = 0; i < payload.length; i++) payload[i] = (i * 37) & 0xff;
  await t.upload({ name: '보고서 🧾.bin', mimeType: 'application/octet-stream', buffer: payload });
  await t.waitForText('보고서 🧾.bin', 15_000);
  await page.waitForTimeout(400);
  const fileEncoded = await settled(t);
  t.assert(fileEncoded === payload.toString('base64'), 'the uploaded file did not encode to the expected Base64');
  const encodedTxt = await t.download(() => t.click('Download .txt'));
  t.assert(
    Buffer.from(encodedTxt.bytes).toString('utf8') === fileEncoded,
    'the downloaded .txt does not match the output',
  );

  // 10) The largest file the tool advertises (8 MB) finishes without killing the tab, shows part of
  // the result with an explanation, and still downloads every byte.
  await t.click('Clear');
  const maxFile = Buffer.alloc(8 * 1024 * 1024 - 1);
  for (let i = 0; i < maxFile.length; i += 4093) maxFile[i] = i & 0xff;
  const eightStart = Date.now();
  await t.upload({ name: 'photo-8mb.bin', mimeType: 'application/octet-stream', buffer: maxFile });
  await t.waitForText('photo-8mb.bin', 15_000);
  await page.waitForTimeout(500);
  const eightText = await settled(t, 60_000);
  t.assert(eightText.length <= 2_000_000, `the 11 MB result was rendered in full (${eightText.length} characters)`);
  const eightNotice = await page.locator('main').innerText();
  t.assert(/Showing the first/.test(eightNotice), 'the truncated result is not explained');
  const eightSize = Math.ceil((8 * 1024 * 1024 - 1) / 3) * 4;
  const mib = eightSize / 1024 / 1024;
  const expectedSizeLabel = mib >= 100 ? `${Math.round(mib)} MB` : `${mib.toFixed(1)} MB`;
  t.assert(
    (await page.locator('main').innerText()).includes(expectedSizeLabel),
    `the output size stat does not show ${expectedSizeLabel}`,
  );
  const eightDownload = await t.download(() => t.click('Download .txt'), 120_000);
  const expectedEight = maxFile.toString('base64');
  t.assert(eightDownload.size === expectedEight.length, 'the 8 MB .txt download is not the full result');
  t.assert(
    Buffer.from(eightDownload.bytes).subarray(0, 64).toString('utf8') === expectedEight.slice(0, 64),
    'the 8 MB download does not start with the expected Base64',
  );
  t.assert(
    Buffer.from(eightDownload.bytes).subarray(-64).toString('utf8') === expectedEight.slice(-64),
    'the 8 MB download does not end with the expected Base64',
  );
  t.assert(Date.now() - eightStart < 90_000, 'the 8 MB encode took too long to be usable');

  // 11) An over-limit file is refused with an explanation rather than a silent no-op.
  await t.click('Clear');
  const tooBig = Buffer.alloc(9 * 1024 * 1024, 7);
  await t.upload({ name: 'too-big.bin', mimeType: 'application/octet-stream', buffer: tooBig });
  t.assert(/8 MB/.test(await page.locator('main').innerText()), 'an over-limit file was not explained');

  // 12) Keyboard-only: focus and Enter change the mode.
  await page.getByRole('radio', { name: 'Decode' }).focus();
  await page.keyboard.press('Enter');
  t.assert(
    (await page.getByRole('radio', { name: 'Decode' }).getAttribute('aria-checked')) === 'true',
    'Decode is not keyboard-operable',
  );

  // 13) Mobile and dark mode.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);

  // 14) The Korean page states the same limits.
  await t.open('/ko/base64');
  const korean = await page.locator('main').innerText();
  t.assert(/8MB/.test(korean) && /12MB/.test(korean), 'the Korean page omits the size limits');
}

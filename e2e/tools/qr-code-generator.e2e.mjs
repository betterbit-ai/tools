/**
 * QR code generator: make the codes a real user makes — a website, Korean text with an emoji,
 * a Wi-Fi network whose name contains a semicolon — download them, and scan each one back with
 * this site's own QR reader to prove the download really carries what the page promised.
 *
 * Covers the defects this audit fixed:
 *  - the page opened on a red "enter a website address" error before anything was typed;
 *  - "too long" never said how long, so a 1 MB paste left the visitor guessing;
 *  - the address, text, and Wi-Fi password were written into localStorage although the page said
 *    only settings were saved.
 */

const SCAN_FIELD = 'main textarea[aria-label="원본 QR 내용"]';

async function alerts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert]')].map((element) => element.textContent?.trim() ?? ''),
  );
}

/** Renders the downloaded SVG through the browser's own image pipeline so it can be scanned. */
async function svgToPng(page, svgText) {
  const base64 = await page.evaluate(async (text) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('the downloaded SVG did not render'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    canvas.getContext('2d').drawImage(image, 0, 0, 1024, 1024);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  }, svgText);
  return Buffer.from(base64, 'base64');
}

/** Downloads the button's file and decodes it with the site's own QR scanner page. */
async function downloadAndScan(t, page, buttonName) {
  const file = await t.download(
    async () => page.getByRole('button', { name: buttonName, exact: true }).click(),
    30_000,
  );
  const png = file.name.endsWith('.png') ? file.bytes : await svgToPng(page, file.bytes.toString('utf8'));
  await t.open('/ko/qr-code-scanner');
  await page.waitForTimeout(300);
  await page.setInputFiles('input[type=file]', { name: 'qr.png', mimeType: 'image/png', buffer: png });
  const field = page.locator(SCAN_FIELD);
  await field.waitFor({ timeout: 25_000 });
  return { name: file.name, size: file.size, text: await field.inputValue() };
}

export default async function (t) {
  const page = t.page;
  await page.goto('about:blank');
  await t.open('/ko/qr-code-generator');
  await page.evaluate(() => localStorage.clear());
  await t.open('/ko/qr-code-generator');
  await page.waitForTimeout(500);

  const urlField = page.locator('main textarea').first();
  const svgButton = 'SVG 저장';
  const pngButton = 'PNG 저장';

  // ── 1. A first visit is not an error state.
  t.assert((await alerts(page)).length === 0, `the page opens with ${(await alerts(page)).join(' | ')}`);
  t.assert((await page.locator('main img').count()) === 0, 'a QR code is shown before any content was entered');
  const openingText = await page.locator('main').innerText();
  t.assert(/M 수준에서/.test(openingText), 'the page does not show how full the code is');

  // ── 2. A plain domain becomes a scannable https link, in both downloads.
  await urlField.fill('betterbit.org');
  await page.waitForTimeout(400);
  t.assert((await page.locator('main img').count()) === 1, 'typing an address did not show a preview');
  t.assert(/모듈/.test(await page.locator('main').innerText()), 'the preview does not report its module count');

  const svg = await downloadAndScan(t, page, svgButton);
  t.assert(svg.name === 'qr-code.svg', `SVG download is named ${svg.name}`);
  t.assert(svg.text === 'https://betterbit.org', `the SVG decodes to ${JSON.stringify(svg.text)}`);

  await t.open('/ko/qr-code-generator');
  await page.waitForTimeout(400);
  await urlField.fill('betterbit.org');
  await page.waitForTimeout(400);
  const png = await downloadAndScan(t, page, pngButton);
  t.assert(png.name === 'qr-code.png', `PNG download is named ${png.name}`);
  t.assert(png.text === 'https://betterbit.org', `the PNG decodes to ${JSON.stringify(png.text)}`);
  t.assert(png.size > 1000, `the PNG is only ${png.size} bytes`);

  // ── 3. Korean text with an emoji survives the download byte for byte.
  await t.open('/ko/qr-code-generator');
  await page.waitForTimeout(400);
  await page.getByRole('radio', { name: '텍스트', exact: true }).click();
  const korean = '한글 😀 테스트';
  await page.locator('main textarea').first().fill(korean);
  await page.waitForTimeout(400);
  const koreanPng = await downloadAndScan(t, page, pngButton);
  t.assert(koreanPng.text === korean, `Korean text decodes to ${JSON.stringify(koreanPng.text)}`);

  // ── 4. A Wi-Fi code escapes the semicolons a network name may contain.
  await t.open('/ko/qr-code-generator');
  await page.waitForTimeout(400);
  await page.getByRole('radio', { name: '와이파이', exact: true }).click();
  await page.waitForTimeout(200);
  await page.locator('main input[type=text]').first().fill('우리집;5G');
  await page.locator('main input[type=password]').first().fill('p@ss;word');
  await page.waitForTimeout(400);
  const wifi = await downloadAndScan(t, page, pngButton);
  t.assert(
    wifi.text === 'WIFI:T:WPA;S:우리집\\;5G;P:p@ss\\;word;;',
    `the Wi-Fi payload is ${JSON.stringify(wifi.text)}`,
  );
  t.assert(
    (await page.locator('main').innerText()).includes('우리집;5G'),
    'the scanner did not read back the network name from the generated code',
  );

  // ── 5. Long content names the limit instead of a generic refusal.
  await t.open('/ko/qr-code-generator');
  await page.waitForTimeout(400);
  await page.getByRole('radio', { name: '텍스트', exact: true }).click();
  const longField = page.locator('main textarea').first();
  await longField.fill('가'.repeat(2_000));
  await page.waitForTimeout(600);
  const tooLongM = (await alerts(page)).join(' | ');
  t.assert(/2,331/.test(tooLongM), `2,000 Korean characters at M do not name the 2,331-byte limit: ${tooLongM}`);
  t.assert(/M 수준/.test(tooLongM), `the too-long message does not name the level: ${tooLongM}`);
  t.assert((await page.locator('main img').count()) === 0, 'an oversized payload still shows a code');
  t.assert(/넘었습니다/.test(await page.locator('main').innerText()), 'the byte counter does not show it is over');

  await page.getByRole('radio', { name: 'H', exact: true }).click();
  await page.waitForTimeout(400);
  const tooLongH = (await alerts(page)).join(' | ');
  t.assert(/1,273/.test(tooLongH), `the limit at H is not 1,273 bytes: ${tooLongH}`);

  await page.getByRole('radio', { name: 'L', exact: true }).click();
  await page.waitForTimeout(500);
  t.assert(
    (await alerts(page)).length === 1,
    '2,000 Korean characters fit at no level, yet the level switch cleared the error',
  );
  await longField.fill('가'.repeat(900));
  await page.waitForTimeout(500);
  t.assert((await alerts(page)).length === 0, `900 Korean characters at L raised ${(await alerts(page)).join(' | ')}`);
  t.assert((await page.locator('main img').count()) === 1, '900 Korean characters at L show no code');

  // ── 6. A 1 MB paste is refused clearly and leaves the page usable.
  await longField.fill('a'.repeat(1_000_000));
  await page.waitForTimeout(1_200);
  const megabyte = (await alerts(page)).join(' | ');
  t.assert(/2,953/.test(megabyte), `a 1 MB paste at L does not name the 2,953-byte limit: ${megabyte}`);
  await longField.fill('betterbit.org/ko');
  await page.waitForTimeout(500);
  t.assert((await alerts(page)).length === 0, 'the page stayed stuck on the error after the content was shortened');
  t.assert((await page.locator('main img').count()) === 1, 'no code was drawn after the 1 MB paste was replaced');

  // ── 7. Clearing the field explains what is missing; it does not nag before typing.
  await longField.fill('');
  await page.waitForTimeout(400);
  t.assert(
    (await alerts(page)).some((text) => /입력하세요/.test(text)),
    `an emptied field shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );

  // ── 8. Unreadable colour combinations are refused, readable ones are not.
  await longField.fill('betterbit.org');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('main input[type=color]')];
    inputs[0].value = '#ffffff';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = '#000000';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(400);
  t.assert(
    (await alerts(page)).some((text) => /대비|어둡게/.test(text)),
    `white on black shows no contrast warning: ${(await alerts(page)).join(' | ')}`,
  );
  t.assert((await page.locator('main img').count()) === 0, 'a code was drawn in unreachable colours');
  await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('main input[type=color]')];
    inputs[0].value = '#102a43';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = '#f7fafc';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(400);
  t.assert((await alerts(page)).length === 0, 'a readable navy-on-white pair is still refused');

  // ── 9. A logo forces H correction and the downloaded code still scans.
  const logo = await t.image({ width: 256, height: 256, type: 'image/png', name: 'logo.png' });
  await t.upload([logo]);
  await page.waitForTimeout(600);
  const withLogo = await page.locator('main').innerText();
  t.assert(/로고를 넣으면 H/.test(withLogo), 'the page does not say a logo uses H correction');
  t.assert(
    (await page.getByRole('radio', { name: 'H', exact: true }).getAttribute('aria-checked')) === 'true',
    'the error-correction control still shows the level from before the logo',
  );
  const logoPng = await downloadAndScan(t, page, pngButton);
  // Still in text mode here, so the payload is exactly what was typed.
  t.assert(logoPng.text === 'betterbit.org', `the code with a logo decodes to ${JSON.stringify(logoPng.text)}`);

  // ── 10. A refresh keeps the options but never the address or the Wi-Fi password.
  await t.open('/ko/qr-code-generator');
  await page.waitForTimeout(400);
  await page.getByRole('radio', { name: '와이파이', exact: true }).click();
  await page.waitForTimeout(200);
  await page.locator('main input[type=text]').first().fill('사무실');
  await page.locator('main input[type=password]').first().fill('secret-pass');
  await page.waitForTimeout(500);
  const stored = await page.evaluate(() => localStorage.getItem('tools:qr-code-generator:settings'));
  t.assert(stored && !stored.includes('secret-pass'), `the Wi-Fi password is in localStorage: ${stored}`);
  t.assert(stored && !stored.includes('사무실'), `the network name is in localStorage: ${stored}`);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(400);
  t.assert(
    (await page.locator('main input[type=text]').first().inputValue()) === '',
    'the network name came back after a refresh',
  );
  t.assert(
    (await page.getByRole('radio', { name: '와이파이', exact: true }).getAttribute('aria-checked')) === 'true',
    'the refresh lost the chosen content type',
  );

  // ── 11. 375px: nothing scrolls sideways and both download buttons are reachable.
  await page.setViewportSize({ width: 375, height: 812 });
  await t.open('/ko/qr-code-generator');
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  await page.getByRole('radio', { name: '웹사이트', exact: true }).click();
  await page.locator('main textarea').first().fill('betterbit.org');
  await page.waitForTimeout(400);
  t.assert(
    (await page.getByRole('button', { name: pngButton, exact: true }).boundingBox()) !== null,
    'the PNG button is not visible at 375px',
  );

  // ── 12. The English page draws the same link.
  await page.setViewportSize({ width: 1280, height: 900 });
  await t.open('/qr-code-generator');
  await page.waitForTimeout(400);
  await page.locator('main textarea').first().fill('betterbit.org');
  await page.waitForTimeout(400);
  t.assert((await page.locator('main img').count()) === 1, 'the English page drew no code');
}

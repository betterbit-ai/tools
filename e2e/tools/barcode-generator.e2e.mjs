// Real-browser audit for barcode-generator: typing heights, check digits, quiet zones,
// the actual bars in the preview, downloads and copying.
const EAN13_5901234123457 =
  '10100010110100111011001100100110111101001110101010110011011011001000010101110010011101000100101';
const CODE128_A = '11010010000' + '10100011000' + '10001011000' + '1100011101011';

/** Reads the preview <img> data URI and turns its bar rectangles back into a module string. */
async function moduleString(t) {
  const src = await t.page.locator('main img').first().getAttribute('src');
  const svg = decodeURIComponent(src.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
  const width = Number(svg.match(/<svg[^>]* width="([\d.]+)"/)[1]);
  const bars = [...svg.matchAll(/<rect x="([\d.]+)" y="0" width="([\d.]+)"/g)].map((m) => ({
    x: Number(m[1]),
    w: Number(m[2]),
  }));
  t.assert(bars.length > 5, 'the preview contains no bars');
  const moduleWidth = bars[0].w;
  const total = Math.round(width / moduleWidth);
  const modules = new Array(total).fill('0');
  for (const bar of bars) {
    const start = Math.round(bar.x / moduleWidth);
    const count = Math.round(bar.w / moduleWidth);
    for (let i = 0; i < count; i++) modules[start + i] = '1';
  }
  return { modules: modules.join(''), width, moduleWidth, svg };
}

export default async function (t) {
  const page = t.page;
  await t.open('/barcode-generator');
  await page.waitForTimeout(500);
  const value = page.getByRole('textbox', { name: 'Value to encode' });
  const height = page.getByRole('textbox', { name: 'Bar height' });
  const barWidth = page.getByRole('textbox', { name: 'Bar width' });

  // 1) The default value renders immediately, with usable defaults.
  const initial = await moduleString(t);
  t.assert(initial.moduleWidth === 2, `default bar width is ${initial.moduleWidth}px`);
  t.assert(initial.modules.slice(10, -10).endsWith('1100011101011'), 'the default Code 128 symbol has no stop pattern');

  // 2) Typing a bar height is an everyday input: 120 must give 120, not a clamped 240.
  await height.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('120', { delay: 80 });
  t.assert((await height.inputValue()) === '120', `typing 120 left "${await height.inputValue()}" in the field`);
  await page.keyboard.press('Enter');
  const afterHeight = decodeURIComponent(await page.locator('main img').first().getAttribute('src'));
  const renderedHeight = Number(afterHeight.match(/<svg[^>]* height="(\d+)"/)[1]);
  t.assert(renderedHeight === 140, `a 120 px bar height with the value line rendered as ${renderedHeight} px`);

  // 3) Out-of-range typing is clamped when the field is left, instead of breaking the layout.
  await height.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('999', { delay: 60 });
  await barWidth.click();
  t.assert((await height.inputValue()) === '240', `999 was not clamped on blur: ${await height.inputValue()}`);

  // 4) Bar width follows the same rules.
  await barWidth.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('4', { delay: 60 });
  await page.keyboard.press('Enter');
  t.assert((await barWidth.inputValue()) === '4', `bar width typing failed: ${await barWidth.inputValue()}`);

  // 5) The bars in the preview are the published Code 128 symbol for the value.
  await value.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('A');
  await page.waitForTimeout(300);
  const single = await moduleString(t);
  const quiet = 10;
  t.assert(
    single.modules.slice(quiet, quiet + CODE128_A.length) === CODE128_A,
    `the rendered bars do not match the Code 128 symbol for "A": ${single.modules.slice(quiet, quiet + 60)}`,
  );
  t.assert(single.modules.slice(0, quiet) === '0'.repeat(quiet), 'the left quiet zone is not blank');
  t.assert(single.modules.slice(-quiet) === '0'.repeat(quiet), 'the right quiet zone is not blank');

  // 6) EAN-13 accepts 12 digits, adds the check digit, and draws the published symbol.
  await page.getByRole('radio', { name: 'EAN-13' }).click();
  await value.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('590123412345');
  await page.waitForTimeout(300);
  const ean = await moduleString(t);
  t.assert(
    ean.modules.slice(11, 11 + 95) === EAN13_5901234123457,
    'the EAN-13 bars do not match the published symbol for 5901234123457',
  );
  // GS1: 11 modules of quiet zone on the left, 7 on the right.
  t.assert(ean.modules.slice(0, 11) === '0'.repeat(11), 'EAN-13 is missing its 11-module left quiet zone');
  t.assert(ean.modules.slice(11 + 95) === '0'.repeat(7), 'EAN-13 is missing its 7-module right quiet zone');
  const stats = await page.locator('main').innerText();
  t.assert(stats.includes('5901234123457'), 'the calculated check digit is not shown');
  t.assert(stats.includes('95'), 'the module count is not shown');

  // 7) A wrong 13th digit is explained instead of drawing a wrong label.
  await value.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('5901234123458');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main').innerText()).includes('check digit does not match'),
    'a wrong EAN-13 check digit was not explained',
  );
  t.assert((await page.locator('main img').count()) === 0, 'an invalid EAN-13 value still drew a barcode');

  // 8) Hyphens and spaces are ignored, and the download is a real SVG of that symbol.
  await value.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('590-1234 12345');
  await page.waitForTimeout(300);
  const download = await t.download(() => t.click('Download SVG'));
  t.assert(download.name === 'barcode-ean13.svg', `unexpected download name ${download.name}`);
  const downloaded = download.bytes.toString('utf8');
  t.assert(downloaded.startsWith('<svg'), 'the downloaded file is not an SVG');
  t.assert(downloaded.includes('fill="white"'), 'the downloaded SVG has no white background');
  const downloadedBars = [...downloaded.matchAll(/<rect x="([\d.]+)" y="0" width="([\d.]+)"/g)];
  t.assert(downloadedBars.length > 30, 'the downloaded SVG has almost no bars');

  // 9) Copy SVG puts the same markup on the clipboard.
  await t.click('Copy SVG');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(clipboard.startsWith('<svg') && clipboard.length > 1_000, 'Copy SVG did not copy the markup');

  // 10) Korean text is explained, not silently dropped.
  await page.getByRole('radio', { name: 'Code 128' }).click();
  await value.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('상품-001');
  await page.waitForTimeout(300);
  t.assert(
    (await page.locator('main').innerText()).includes('printable ASCII only'),
    'Korean input got no explanation',
  );

  // 11) Mobile, dark mode, and keyboard operation of the format switch.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);
  await page.getByRole('radio', { name: 'EAN-13' }).focus();
  await page.keyboard.press('Enter');
  t.assert(
    (await page.getByRole('radio', { name: 'EAN-13' }).getAttribute('aria-checked')) === 'true',
    'the format switch is not keyboard-operable',
  );

  // 12) The Korean page carries the same quiet-zone facts.
  await t.open('/ko/barcode-generator');
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('왼쪽 11모듈'), 'the Korean page does not state the EAN-13 quiet zones');
}

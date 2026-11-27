// Real-browser audit for gradient-generator: the preview must paint the exact CSS that gets copied.
async function background(t) {
  return t.page
    .locator('main div[role="img"]')
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundImage);
}

async function cssBlock(t) {
  return t.page.locator('main pre').first().innerText();
}

export default async function (t) {
  const page = t.page;
  await t.open('/gradient-generator');
  await page.waitForTimeout(300);

  // 1) The default preview is a linear OKLCH gradient the browser actually painted.
  const painted = await background(t);
  t.assert(painted.includes('linear-gradient'), `the preview is not a linear gradient: ${painted}`);
  t.assert(painted.includes('oklch'), `the preview was not painted in oklch: ${painted}`);

  // 2) The CSS block carries a solid fallback, a pre-blended line and the modern line.
  const block = await cssBlock(t);
  const lines = block.split('\n');
  t.assert(lines.length === 3, `expected three declarations, got ${lines.length}: ${block}`);
  t.assert(lines[0].startsWith('background-color: #'), 'the solid fallback is missing');
  t.assert(/^background-image: linear-gradient\(135deg, #/.test(lines[1]), 'the sRGB fallback line is malformed');
  t.assert(lines[1].split(',').length > 10, 'the sRGB fallback is not pre-blended');
  t.assert(lines[2].includes('135deg in oklch'), 'the OKLCH declaration is missing');

  // 3) Copy CSS copies the same block.
  await t.click('Copy CSS');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === block, 'the copied CSS differs from what is shown');

  // 4) Angle changes appear in the declaration.
  const angle = page.getByRole('spinbutton', { name: 'Angle' });
  await angle.fill('90');
  await page.waitForTimeout(200);
  t.assert((await cssBlock(t)).includes('linear-gradient(90deg in oklch'), 'the angle did not reach the CSS');
  t.assert((await background(t)).includes('90deg'), 'the preview did not follow the angle');

  // 5) Radial and conic switch the function, and radial has no angle control.
  await page.getByRole('radio', { name: 'Radial' }).click();
  await page.waitForTimeout(200);
  t.assert((await background(t)).includes('radial-gradient'), 'radial preview did not switch');
  t.assert(await angle.isDisabled(), 'the angle field is still editable for a radial gradient');
  await page.getByRole('radio', { name: 'Conic' }).click();
  await page.waitForTimeout(200);
  t.assert((await background(t)).includes('conic-gradient'), 'conic preview did not switch');
  t.assert((await cssBlock(t)).includes('from 90deg at 50% 50%'), 'the conic start angle is missing');

  // 6) Stops: adding one gives three, removing it returns to two.
  const stopHexes = () => page.getByRole('textbox', { name: /^Stop HEX/ });
  t.assert((await stopHexes().count()) === 2, 'the default should have two stops');
  await t.click('Add stop');
  await page.waitForTimeout(200);
  t.assert((await stopHexes().count()) === 3, 'Add stop did not add a stop');
  const third = await stopHexes().nth(1).inputValue();
  t.assert(/^#[0-9a-f]{6}$/.test(third), `the inserted stop has no color: ${third}`);
  await page.getByRole('button', { name: 'Remove stop 2' }).click();
  await page.waitForTimeout(200);
  t.assert((await stopHexes().count()) === 2, 'Remove stop did not remove it');

  // 7) A preset loads its exact colors.
  await page.getByRole('button', { name: 'Load preset: aurora' }).click();
  await page.waitForTimeout(200);
  t.assert((await stopHexes().count()) === 3, 'the aurora preset should have three stops');
  t.assert((await stopHexes().nth(0).inputValue()) === '#22d3ee', 'the aurora preset colors are wrong');

  // 8) Choosing sRGB drops the fallback line.
  await page.getByRole('radio', { name: 'sRGB' }).click();
  await page.waitForTimeout(200);
  const srgbBlock = await cssBlock(t);
  t.assert(srgbBlock.split('\n').length === 2, 'the sRGB blend should need only two lines');
  t.assert(!srgbBlock.includes('in oklch'), 'the sRGB blend still claims oklch');
  await page.getByRole('radio', { name: 'OKLCH' }).click();
  await page.waitForTimeout(200);

  // 9) Editing a stop's hex updates the preview.
  const first = stopHexes().nth(0);
  await first.fill('#112233');
  await page.waitForTimeout(200);
  t.assert((await cssBlock(t)).includes('#112233'), 'a typed stop color did not reach the CSS');

  // 10) Mobile, dark mode and the Korean page.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);

  await t.open('/ko/gradient-generator');
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('CSS 그라데이션 생성기'), 'the Korean page is missing its heading');
  t.assert(/OKLCH/.test(korean), 'the Korean page does not mention OKLCH');
}

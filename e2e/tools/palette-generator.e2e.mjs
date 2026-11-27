// Real-browser audit for palette-generator: the swatches, the WCAG numbers, and the exports.
const toLinear = (channel) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

/** Independent WCAG 2.x contrast ratio from a hex string. */
function contrast(hex, other = { r: 255, g: 255, b: 255 }) {
  const rgb = {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
  const luminance = (color) => 0.2126 * toLinear(color.r) + 0.7152 * toLinear(color.g) + 0.0722 * toLinear(color.b);
  const a = luminance(rgb);
  const b = luminance(other);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function swatches(t) {
  return t.page.locator('main div[style*="background-color"]');
}

async function hexes(t) {
  const boxes = swatches(t);
  const count = await boxes.count();
  const values = [];
  for (let index = 0; index < count; index++) {
    const text = await boxes.nth(index).innerText();
    const match = text.match(/#[0-9a-f]{6}/);
    if (match) values.push(match[0]);
  }
  return values;
}

export default async function (t) {
  const page = t.page;
  await t.open('/palette-generator');

  // 1) Default state is a usable five-color palette.
  await page.waitForTimeout(300);
  let colors = await hexes(t);
  t.assert(colors.length === 5, `expected 5 swatches by default, got ${colors.length}`);
  t.assert(new Set(colors).size === 5, 'the default palette repeats a color');

  // 2) The base color is kept exactly.
  const base = page.getByRole('textbox', { name: 'Base color HEX' });
  await base.fill('#ff0000');
  await page.waitForTimeout(200);
  colors = await hexes(t);
  t.assert(colors[0] === '#ff0000', `the base color was not kept: first swatch is ${colors[0]}`);

  // 3) Contrast figures match an independent WCAG calculation.
  const boxText = await swatches(t).nth(1).innerText();
  const shown = boxText.match(/([\d.]+):1 \/ ([\d.]+):1/);
  t.assert(shown, `no contrast pair on a swatch: ${boxText}`);
  const hex = (boxText.match(/#[0-9a-f]{6}/) ?? [])[0];
  t.assert(hex, 'the swatch does not print its hex');
  t.assert(
    Math.abs(Number(shown[1]) - contrast(hex)) < 0.11,
    `on-white ratio for ${hex} shows ${shown[1]}, calculated ${contrast(hex).toFixed(2)}`,
  );
  t.assert(
    Math.abs(Number(shown[2]) - contrast(hex, { r: 0, g: 0, b: 0 })) < 0.11,
    `on-black ratio for ${hex} shows ${shown[2]}, calculated ${contrast(hex, { r: 0, g: 0, b: 0 }).toFixed(2)}`,
  );

  // 4) The harmony selector changes the palette.
  const beforeHarmony = await hexes(t);
  const harmony = page.getByRole('combobox', { name: 'Harmony' });
  await harmony.selectOption('triadic');
  await page.waitForTimeout(200);
  const afterHarmony = await hexes(t);
  t.assert(afterHarmony[0] === '#ff0000', 'the base color moved when the harmony changed');
  t.assert(afterHarmony.join() !== beforeHarmony.join(), 'changing the harmony did not change the palette');

  // 5) The color count is honored.
  await page.getByRole('combobox', { name: 'Colors' }).selectOption('8');
  await page.waitForTimeout(200);
  t.assert((await hexes(t)).length === 8, 'the count selector did not produce 8 colors');

  // 6) Copy CSS carries every color as a custom property.
  await t.click('CSS variables');
  const css = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(css.startsWith(':root {'), `the copied CSS is not a :root block: ${css.slice(0, 40)}`);
  const copied = [...css.matchAll(/--color-(\d+): (#[0-9a-f]{6});/g)];
  t.assert(copied.length === 8, `the CSS has ${copied.length} color variables, not 8`);
  const shownHexes = await hexes(t);
  t.assert(copied[0][2] === shownHexes[0], 'the first CSS variable does not match the first swatch');

  // 7) Tailwind and JSON exports are valid.
  await t.click('Tailwind');
  const tailwind = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(/palette:\s*\{/.test(tailwind) && tailwind.includes(shownHexes[0]), 'the Tailwind export is malformed');
  await t.click('JSON');
  const json = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
  t.assert(
    json.base === '#ff0000' && json.harmony === 'triadic' && json.colors.length === 8,
    'the JSON export is wrong',
  );

  // 8) An invalid hex is explained and does not draw a broken palette.
  await base.fill('zzz');
  await page.waitForTimeout(200);
  t.assert((await page.locator('main').innerText()).includes('Enter a HEX color'), 'an invalid hex got no message');
  await base.fill('#0f766e');
  await page.waitForTimeout(200);
  t.assert((await hexes(t))[0] === '#0f766e', 'typing a valid hex did not restore the palette');

  // 9) Mobile, dark mode and the Korean page.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);

  await t.open('/ko/palette-generator');
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('컬러 팔레트 생성기'), 'the Korean page is missing its heading');
  t.assert(/OKLCH/.test(korean), 'the Korean page does not mention OKLCH');
}

/**
 * Colour converter: a HEX code typed, pasted or picked, and the RGB, HSL, OKLCH and WCAG readings
 * a designer copies into a stylesheet.
 *
 * Covers the defects this audit fixed:
 *  - a grey was reported with a hue (#808080 came out as oklch(60% 0 89.9)) because a vanishing
 *    chroma left the hue wherever floating-point noise pointed; an achromatic colour now reports
 *    hue 0 and the page says the hue is powerless.
 *  - a half-typed code was answered with a red error on every keystroke; an unfinished hex code is
 *    now an ordinary hint, and only text that cannot become a colour is an error.
 */

/** Independent reference values for the colours used below (sRGB → HSL / Oklab, WCAG luminance). */
const reference = {
  '#3B82F6': { hsl: 'hsl(217.2 91.2% 59.8%)', oklch: 'oklch(62.3% 0.188 259.8)', white: '3.68:1', black: '5.71:1' },
  '#FF0000': { hsl: 'hsl(0 100% 50%)', oklch: 'oklch(62.8% 0.2577 29.2)', white: '4.00:1', black: '5.25:1' },
  '#00FF00': { hsl: 'hsl(120 100% 50%)', oklch: 'oklch(86.6% 0.2948 142.5)', white: '1.37:1', black: '15.30:1' },
  '#0000FF': { hsl: 'hsl(240 100% 50%)', oklch: 'oklch(45.2% 0.3132 264.1)', white: '8.59:1', black: '2.44:1' },
};

export default async function (t) {
  const page = t.page;
  await t.open('/color-converter');
  await page.waitForTimeout(400);

  const hex = page.getByLabel(/^HEX color/);
  const channels = {
    r: page.getByLabel('Red', { exact: true }),
    g: page.getByLabel('Green', { exact: true }),
    b: page.getByLabel('Blue', { exact: true }),
  };
  /** The value beside a result label, e.g. HSL → "hsl(…)". */
  const resultOf = (label) =>
    page.evaluate((wanted) => {
      for (const block of document.querySelectorAll('main div.min-w-0.rounded-md')) {
        if (block.querySelector('p')?.textContent.trim() === wanted)
          return block.querySelectorAll('p')[1]?.textContent.trim();
      }
      return null;
    }, label);
  const contrastLine = (label) =>
    page.evaluate((wanted) => {
      for (const card of document.querySelectorAll('main div.rounded-md.border')) {
        if (card.querySelector('p')?.textContent.trim() === wanted) {
          const ratio = card.querySelector('p.tabular')?.textContent.trim();
          const checks = [...card.querySelectorAll('span')].map((s) => s.textContent.trim());
          return { ratio, checks };
        }
      }
      return null;
    }, label);
  const notice = () =>
    page.evaluate(() => document.querySelector('main [role=alert], main [role=status]')?.textContent?.trim() ?? '');
  const noticeRole = () =>
    page.evaluate(() => document.querySelector('main [role=alert], main [role=status]')?.getAttribute('role') ?? '');
  const typeHex = async (text) => {
    await hex.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(text, { delay: 50 });
    await page.waitForTimeout(200);
  };

  // ── 1. It opens on the example colour with every format and both contrast readings.
  t.assert((await hex.inputValue()) === '#3B82F6', `the page opens on "${await hex.inputValue()}"`);
  t.assert((await channels.r.inputValue()) === '59', `the example red channel is ${await channels.r.inputValue()}`);
  t.assert((await resultOf('HEX color')) === '#3B82F6', `HEX result: ${await resultOf('HEX color')}`);
  t.assert((await resultOf('RGB channels')) === 'rgb(59 130 246)', `RGB result: ${await resultOf('RGB channels')}`);
  t.assert((await resultOf('HSL')) === reference['#3B82F6'].hsl, `HSL result: ${await resultOf('HSL')}`);
  t.assert((await resultOf('OKLCH')) === reference['#3B82F6'].oklch, `OKLCH result: ${await resultOf('OKLCH')}`);
  t.assert(
    (await contrastLine('On white')).ratio === reference['#3B82F6'].white,
    `on white: ${(await contrastLine('On white')).ratio}`,
  );
  t.assert(
    (await contrastLine('On black')).ratio === reference['#3B82F6'].black,
    `on black: ${(await contrastLine('On black')).ratio}`,
  );

  // ── 2. Typing a code without the hash, in lower case, converts as it goes.
  await typeHex('ff0000');
  t.assert((await resultOf('HEX color')) === '#FF0000', `lower-case hex result: ${await resultOf('HEX color')}`);
  t.assert((await resultOf('HSL')) === reference['#FF0000'].hsl, `red HSL: ${await resultOf('HSL')}`);
  t.assert((await resultOf('OKLCH')) === reference['#FF0000'].oklch, `red OKLCH: ${await resultOf('OKLCH')}`);
  t.assert((await channels.r.inputValue()) === '255', `red channel: ${await channels.r.inputValue()}`);

  // ── 3. The three-digit shorthand expands to six digits.
  await typeHex('#0f0');
  t.assert((await resultOf('HEX color')) === '#00FF00', `#0f0 expanded to ${await resultOf('HEX color')}`);
  t.assert((await resultOf('OKLCH')) === reference['#00FF00'].oklch, `green OKLCH: ${await resultOf('OKLCH')}`);
  await typeHex('#00f');
  t.assert((await resultOf('OKLCH')) === reference['#0000FF'].oklch, `blue OKLCH: ${await resultOf('OKLCH')}`);

  // ── 4. A half-typed code is a hint, not an error; impossible text is an error.
  await typeHex('#3B');
  t.assert((await notice()).length > 0, 'a half-typed code shows no hint');
  t.assert((await noticeRole()) === 'status', `a half-typed code is announced as an error (${await noticeRole()})`);
  t.assert((await resultOf('HEX color')) === null, 'a half-typed code still shows a result');
  await typeHex('#GGHHII');
  t.assert((await noticeRole()) === 'alert', 'text that cannot be a colour is not announced as an error');
  await typeHex('#3B82F6F');
  t.assert((await noticeRole()) === 'alert', 'an eight-digit code is accepted as if it had no alpha');
  await typeHex('');
  t.assert((await notice()).length > 0, 'an empty field says nothing');

  // ── 5. The RGB channels are a second way in, and each one changes the colour it claims to.
  await typeHex('#000000');
  await channels.r.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('255', { delay: 50 });
  await page.waitForTimeout(250);
  t.assert((await resultOf('HEX color')) === '#FF0000', `editing red gave ${await resultOf('HEX color')}`);
  await channels.g.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('255', { delay: 50 });
  await page.waitForTimeout(250);
  t.assert((await resultOf('HEX color')) === '#FFFF00', `editing green gave ${await resultOf('HEX color')}`);
  await channels.b.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('255', { delay: 50 });
  await page.waitForTimeout(250);
  t.assert((await resultOf('HEX color')) === '#FFFFFF', `editing blue gave ${await resultOf('HEX color')}`);
  t.assert((await resultOf('OKLCH')) === 'oklch(100% 0 0)', `white OKLCH: ${await resultOf('OKLCH')}`);
  t.assert(
    (await contrastLine('On white')).ratio === '1.00:1',
    `white on white: ${(await contrastLine('On white')).ratio}`,
  );

  // An out-of-range channel is refused and explained, not clamped silently.
  await channels.r.fill('300');
  await page.waitForTimeout(250);
  t.assert((await notice()).length > 0, 'a 300 channel is accepted silently');
  t.assert((await resultOf('HEX color')) === null, 'a 300 channel still shows a colour');
  await channels.r.fill('128');
  await page.waitForTimeout(250);

  // ── 6. A grey has no hue, and the page says so instead of reporting 89.9°.
  await typeHex('#808080');
  t.assert((await resultOf('OKLCH')) === 'oklch(60% 0 0)', `grey OKLCH: ${await resultOf('OKLCH')}`);
  t.assert((await resultOf('HSL')) === 'hsl(0 0% 50.2%)', `grey HSL: ${await resultOf('HSL')}`);

  // ── 7. The contrast thresholds follow WCAG 2: 4.54:1 passes AA, 4.48:1 does not.
  await typeHex('#767676');
  const passes = await contrastLine('On white');
  t.assert(passes.ratio === '4.54:1', `#767676 on white reads ${passes.ratio}`);
  t.assert(
    passes.checks.some((text) => /AA text: Pass/.test(text)),
    `4.54:1 AA reads ${passes.checks.join(' / ')}`,
  );
  await typeHex('#777777');
  const fails = await contrastLine('On white');
  t.assert(fails.ratio === '4.48:1', `#777777 on white reads ${fails.ratio}`);
  t.assert(
    fails.checks.some((text) => /AA text: Fail/.test(text)),
    `4.48:1 AA reads ${fails.checks.join(' / ')}`,
  );

  // ── 8. Copy hands over exactly what the page shows.
  await typeHex('#3B82F6');
  await page.evaluate(() => navigator.clipboard.writeText(''));
  const hslCopy = page.locator('main div.min-w-0.rounded-md').filter({ hasText: 'HSL' }).getByRole('button');
  await hslCopy.click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === reference['#3B82F6'].hsl, `the copied HSL is ${copied}`);

  // ── 9. The colour picker is a third way in.
  await page.locator('input[type=color]').fill('#123456');
  await page.waitForTimeout(250);
  t.assert((await hex.inputValue()) === '#123456', `the picker left "${await hex.inputValue()}"`);
  t.assert((await channels.b.inputValue()) === '86', `the picker left blue at ${await channels.b.inputValue()}`);

  // ── 10. The choice survives a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(400);
  t.assert((await hex.inputValue()) === '#123456', `the reload lost the colour: "${await hex.inputValue()}"`);

  // ── 11. Reset returns the example.
  await page.getByRole('button', { name: 'Reset example' }).click();
  await page.waitForTimeout(300);
  t.assert((await hex.inputValue()) === '#3B82F6', `reset left "${await hex.inputValue()}"`);

  // ── 12. 375 px, dark: nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);

  // ── 13. The Korean page converts and labels in Korean.
  await page.setViewportSize({ width: 1280, height: 900 });
  await t.open('/ko/color-converter');
  await page.waitForTimeout(400);
  await page.getByLabel(/^HEX 색상 코드/).fill('#FF0000');
  await page.waitForTimeout(300);
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('hsl(0 100% 50%)'), 'the Korean page did not convert the colour');
  t.assert(korean.includes('WCAG'), 'the Korean page lost the contrast section');
}

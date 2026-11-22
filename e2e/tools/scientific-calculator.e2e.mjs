/**
 * Scientific calculator: expressions typed as people type them, the DEG/RAD switch, the
 * keypad, memory, and a history that comes back after a reload. Every number is recomputed
 * here with plain JavaScript. Covers the two defects this audit fixed: typing a digit after
 * "=" used to glue it onto the result (144 + "7" became 1447 while the keypad started a new
 * number), and MC/MR/M+/M− said nothing when the display held an expression with no value.
 */

const number = (text) =>
  Number(
    String(text)
      .replaceAll(',', '')
      .replace(/[^\d.eE+-]/g, ''),
  );

async function tap(locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await locator.click();
}

export default async function (t) {
  const page = t.page;
  await t.open('/scientific-calculator');
  await page.evaluate(() => localStorage.removeItem('tools:scientific-calculator:state'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  t.assert(!t.errors.page.length, `the calculator failed to hydrate: ${t.errors.page[0]}`);

  const display = page.locator('main input[type="text"]').first();
  const box = display.locator('xpath=..');
  const preview = async () => {
    const text = (await box.innerText()).replace(/\s+/g, ' ').trim();
    const match = text.match(/=\s*(-?[\d.,]+(?:e[+-]?\d+)?)\s*$/);
    return match ? number(match[1]) : null;
  };
  const typeExpression = async (expression) => {
    await display.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(expression);
    await page.waitForTimeout(120);
  };
  const press = (name) => tap(page.getByRole('button', { name, exact: true }));

  // --- Scientific notation, trigonometry in degrees, roots and powers.
  await typeExpression('1.25e-6*4');
  t.assert((await preview()) === 5e-6, `1.25e-6*4 previewed ${await preview()}`);
  await page.keyboard.press('Enter');
  t.assert(number(await display.inputValue()) === 5e-6, `after Enter the display held ${await display.inputValue()}`);

  await typeExpression('sin(30)+sqrt(16)^2');
  t.assert(Math.abs((await preview()) - 16.5) < 1e-9, `sin(30)+sqrt(16)^2 previewed ${await preview()}`);
  await page.keyboard.press('Enter');
  t.assert(number(await display.inputValue()) === 16.5, 'sin(30)+sqrt(16)^2 did not calculate to 16.5');

  // --- RAD changes how trig reads its arguments: sin(pi/2) = 1.
  await page.getByRole('radio', { name: 'RAD', exact: true }).click();
  await typeExpression('sin(pi/2)');
  t.assert(Math.abs((await preview()) - 1) < 1e-9, `sin(pi/2) in radians previewed ${await preview()}`);
  await page.getByRole('radio', { name: 'DEG', exact: true }).click();
  await typeExpression('sin(30)');
  t.assert(Math.abs((await preview()) - 0.5) < 1e-9, 'switching back to DEG did not restore sin(30) = 0.5');

  // --- After "=", typing starts a new calculation (the keypad has always done this).
  await typeExpression('12*12');
  await page.keyboard.press('Enter');
  t.assert(number(await display.inputValue()) === 144, '12*12 did not calculate to 144');
  await page.keyboard.type('7');
  t.assert(
    (await display.inputValue()) === '7',
    `typing after = glued the digit onto the result: ${await display.inputValue()}`,
  );
  t.assert((await preview()) === 7, 'the fresh number was not previewed');

  // --- An operator after "=" continues from the answer instead.
  await typeExpression('12*12');
  await page.keyboard.press('Enter');
  await press('+');
  await press('1');
  await press('=');
  t.assert(number(await display.inputValue()) === 145, '+ after = did not continue from 144');

  // --- The keypad builds the same expression as the keyboard.
  await press('AC');
  for (const key of ['1', '2', '×', '3']) await press(key);
  t.assert((await display.inputValue()) === '12×3', `the keypad built ${await display.inputValue()}`);
  await press('=');
  t.assert(number(await display.inputValue()) === 36, 'the keypad result for 12×3 was not 36');

  // --- Percent is documented as "divide by 100", and it is.
  await typeExpression('50%');
  t.assert(Math.abs((await preview()) - 0.5) < 1e-9, '50% was not read as 0.5');

  // --- Undefined work is refused in words and never shown as a number.
  for (const [expression, expected] of [
    ['1/0', 'not mathematically defined'],
    ['tan(90)', 'not mathematically defined'],
    ['sqrt(-1)', 'negative-number square root'],
    ['171!', 'too large to display'],
  ]) {
    await typeExpression(expression);
    await page.keyboard.press('Enter');
    const alert = await page.getByRole('alert').innerText();
    t.assert(alert.includes(expected), `${expression} did not explain itself: ${alert}`);
    t.assert((await display.inputValue()) === expression, `${expression} was silently replaced by a result`);
  }

  // --- Memory: M+ stores the display value, MR brings it back, MC clears it.
  await press('AC');
  await page.keyboard.type('250');
  await press('M+');
  await press('AC');
  await press('MR');
  t.assert(number(await display.inputValue()) === 250, `MR returned ${await display.inputValue()}`);
  await page.keyboard.type('+50');
  await page.keyboard.press('Enter');
  await press('M+');
  await press('AC');
  await press('MR');
  // M+ adds the value on screen (250 + 50 = 300) to what memory already holds (250).
  t.assert(
    number(await display.inputValue()) === 550,
    `M+ did not add to memory: MR returned ${await display.inputValue()}`,
  );

  // --- Memory with an expression that has no value says so instead of doing nothing.
  await press('AC');
  await page.keyboard.type('sqrt(-1)');
  await press('M+');
  const memoryAlert = await page.getByRole('alert').innerText();
  t.assert(memoryAlert.includes('memory was not changed'), `M+ on an empty value said: ${memoryAlert}`);
  await press('AC');
  await press('MR');
  t.assert(number(await display.inputValue()) === 550, 'memory changed even though M+ reported it was not');
  await press('MC');
  await press('AC');
  await press('MR');
  t.assert(number(await display.inputValue()) === 0, 'MC did not clear memory');

  // --- Every calculation is kept in history, newest first, and a line loads its result back.
  await press('AC');
  await page.keyboard.type('7*6');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await page.keyboard.type('8*8');
  await page.keyboard.press('Enter');
  const historyItems = page.locator('main ul.max-h-80 > li');
  t.assert((await historyItems.count()) >= 2, 'the calculations were not added to history');
  t.assert((await historyItems.first().innerText()).includes('8'), 'history is not newest first');
  await tap(historyItems.last());
  t.assert(
    number(await display.inputValue()) !== 64,
    'loading the oldest history line did not change the display back to an older result',
  );

  // --- Esc clears everything, and the work survives a reload.
  await page.keyboard.press('Escape');
  t.assert((await display.inputValue()) === '', 'Esc did not clear the display');
  await page.keyboard.type('2+3');
  await page.keyboard.press('Enter');
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:scientific-calculator:state') ?? 'null')?.history?.length >= 3,
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  t.assert((await page.locator('main ul.max-h-80 > li').count()) >= 3, 'history did not come back after a reload');

  // --- A huge paste is capped at 2,000 characters and never freezes the page.
  await display.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText(`${'1+'.repeat(1_500)}1`);
  await page.waitForTimeout(500);
  t.assert((await display.inputValue()).length === 2_000, 'the 2,000-character limit was not applied');
  await page.keyboard.press('Escape');
  await page.keyboard.type('6*7');
  t.assert((await preview()) === 42, 'the calculator stopped responding after a huge paste');

  // --- The Korean page works, at 375 px, in dark mode.
  await t.open('/ko/scientific-calculator');
  const koreanDisplay = page.locator('main input[type="text"]').first();
  await tap(page.getByRole('button', { name: 'AC', exact: true }));
  await koreanDisplay.click();
  await page.keyboard.type('2+2');
  t.assert(
    (await koreanDisplay.locator('xpath=..').innerText()).replace(/\s+/g, ' ').includes('= 4'),
    'the Korean page did not preview 2+2 = 4',
  );
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );
  await tap(page.getByRole('button', { name: '=', exact: true }));
  t.assert(number(await koreanDisplay.inputValue()) === 4, 'the = key did not work at 375 px');
}

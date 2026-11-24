/**
 * Number base converter: the numbers a searcher actually types — 101101₂, FF₁₆, a grouped
 * 1,234,567 pasted from a spreadsheet — with every visible card checked against BigInt here.
 *
 * Covers the defects this audit fixed:
 *  - a grouped number pasted from a spreadsheet or written the Korean way ("1,234,567") was
 *    rejected character by character, although spaces were accepted as separators;
 *  - the input field capped text at 10,001 characters, so a longer paste was silently shortened
 *    before the tool said it could not convert it;
 *  - the error was drawn only inside a notice, with no aria-invalid/description tying it to the
 *    field a screen reader was on.
 */

const STANDARD = [2, 8, 10, 16];

/** Groups a formatted value the way the tool displays it, computed independently here. */
function group(value, size) {
  const sign = value.startsWith('-') ? '-' : '';
  const digits = sign ? value.slice(1) : value;
  const out = [];
  for (let end = digits.length; end > 0; end -= size) out.unshift(digits.slice(Math.max(0, end - size), end));
  return sign + out.join(' ');
}

function formatValue(baseValue, base) {
  return baseValue.toString(base).toUpperCase();
}

/** The cards under "All representations": { label: value } with the label text as shown. */
async function cards(page) {
  return page.evaluate(() => {
    const result = {};
    for (const card of document.querySelectorAll('main div[class*="bg-surface-2"]')) {
      if (card.children.length !== 2) continue;
      const [value, label] = [card.children[0], card.children[1]];
      if (!value.className.includes('tabular')) continue;
      result[label.textContent.trim()] = value.textContent.trim();
    }
    return result;
  });
}

async function alerts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert]')].map((element) => element.textContent?.trim() ?? ''),
  );
}

export default async function (t) {
  const page = t.page;
  await t.open('/number-base-converter');
  await page.waitForTimeout(400);

  const input = page.locator('main input').first();
  const fromBase = page.locator('main select').nth(0);
  const targetBase = page.locator('main select').nth(1);
  const type = async (text) => {
    await input.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(text, { delay: 25 });
    await page.waitForTimeout(150);
  };

  // ── 1. The worked example is on screen: 255 in decimal, base 36 as the extra base.
  let shown = await cards(page);
  t.assert((await input.inputValue()) === '255', `the example input is "${await input.inputValue()}"`);
  t.assert((await fromBase.inputValue()) === '10', 'the example does not use base 10');
  t.assert((await targetBase.inputValue()) === '36', 'the example does not use base 36 as the extra base');
  t.assert(shown['Decimal (base 10)'] === '255', `255₁₀ shows "${shown['Decimal (base 10)']}"`);
  t.assert(shown['Binary (base 2)'] === '1111 1111', `255₁₀ in binary shows "${shown['Binary (base 2)']}"`);
  t.assert(shown['Hexadecimal (base 16)'] === 'FF', `255₁₀ in hex shows "${shown['Hexadecimal (base 16)']}"`);
  t.assert(shown['Base 36'] === '73', `255₁₀ in base 36 shows "${shown['Base 36']}"`);
  t.assert(Object.keys(shown).length === 5, `the panel shows ${Object.keys(shown).length} cards instead of 5`);

  // ── 2. 101101 in binary, the classic homework conversion, checked against BigInt.
  await type('101101');
  await fromBase.selectOption('2');
  await page.waitForTimeout(200);
  shown = await cards(page);
  const binary = 0b101101n;
  t.assert(shown['Decimal (base 10)'] === '45', `101101₂ in decimal shows "${shown['Decimal (base 10)']}"`);
  t.assert(shown['Octal (base 8)'] === group('55', 3), `101101₂ in octal shows "${shown['Octal (base 8)']}"`);
  t.assert(shown['Hexadecimal (base 16)'] === '2D', `101101₂ in hex shows "${shown['Hexadecimal (base 16)']}"`);
  t.assert(shown['Base 36'] === formatValue(binary, 36), `101101₂ in base 36 shows "${shown['Base 36']}"`);

  // Every control changes what it says it changes: the extra base.
  for (const extra of [3, 7, 12, 36]) {
    await targetBase.selectOption(String(extra));
    await page.waitForTimeout(120);
    const values = await cards(page);
    const label = `Base ${extra}`;
    t.assert(
      values[label] === group(binary.toString(extra).toUpperCase(), 3),
      `choosing base ${extra} shows "${values[label]}"`,
    );
  }

  // ── 3. Hexadecimal input, and a target base that already exists (no duplicated card).
  await fromBase.selectOption('16');
  await type('FF');
  shown = await cards(page);
  await targetBase.selectOption('2');
  await page.waitForTimeout(200);
  shown = await cards(page);
  t.assert(shown['Decimal (base 10)'] === '255', `FF₁₆ shows "${shown['Decimal (base 10)']}" in decimal`);
  t.assert(Object.keys(shown).length === 4, `FF₁₆ with base 2 as the extra shows ${Object.keys(shown).length} cards`);

  // ── 4. A grouped number pasted from a spreadsheet is read, not rejected.
  await fromBase.selectOption('10');
  await targetBase.selectOption('36');
  await type('1,234,567');
  shown = await cards(page);
  t.assert((await alerts(page)).length === 0, `"1,234,567" shows "${(await alerts(page)).join(' ')}"`);
  const grouped = 1234567n;
  t.assert(shown['Decimal (base 10)'] === group('1234567', 3), `1,234,567 shows "${shown['Decimal (base 10)']}"`);
  t.assert(
    shown['Hexadecimal (base 16)'] === group(formatValue(grouped, 16), 2),
    `1,234,567 in hex shows "${shown['Hexadecimal (base 16)']}"`,
  );
  t.assert(
    shown['Binary (base 2)'] === group(formatValue(grouped, 2), 4),
    `1,234,567 in binary shows "${shown['Binary (base 2)']}"`,
  );

  // A comma anywhere else is reported instead of turning a decimal comma into another number.
  await type('1,5');
  const groupingAlert = (await alerts(page))[0] ?? '';
  t.assert(/groups of three digits/.test(groupingAlert), `"1,5" shows "${groupingAlert}"`);
  t.assert((await input.getAttribute('aria-invalid')) === 'true', 'the input is not marked invalid');
  t.assert(Object.keys(await cards(page)).length === 0, 'a result is shown for an input that is not a valid number');
  t.assert(
    (await page.locator('main [id="number-base-converter-error"]').count()) === 1,
    'the error message has no element for aria-describedby to point at',
  );

  // ── 5. Everyday invalid input keeps the typed text and explains itself.
  await fromBase.selectOption('2');
  await type('102');
  t.assert(
    /“2” is not available/.test((await alerts(page))[0] ?? ''),
    `binary "102" shows "${(await alerts(page))[0]}"`,
  );
  await type('１２３');
  t.assert(
    /not an ASCII digit/.test((await alerts(page))[0] ?? ''),
    `full-width digits show "${(await alerts(page))[0]}"`,
  );
  t.assert((await input.inputValue()) === '１２３', 'the pasted lookalike digits were silently changed');

  // ── 6. A negative value and the 0x prefix, both in hex.
  await fromBase.selectOption('16');
  await type('-0xFF');
  shown = await cards(page);
  t.assert(shown['Decimal (base 10)'] === '-255', `-0xFF shows "${shown['Decimal (base 10)']}"`);

  // ── 7. Copy gives the unspaced value a spreadsheet or compiler needs.
  await fromBase.selectOption('10');
  await type('255');
  await page.getByRole('button', { name: 'Copy' }).first().click();
  await page.waitForTimeout(200);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === '11111111', `the copied binary value is "${copied}"`);
  t.assert((await page.getByRole('button', { name: 'Copied' }).count()) >= 1, 'the copy button gives no confirmation');

  // ── 8. Saved input and bases come back after a reload.
  await type('777');
  await targetBase.selectOption('5');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(500);
  t.assert((await input.inputValue()) === '777', `the reload lost the input: "${await input.inputValue()}"`);
  t.assert(
    (await targetBase.inputValue()) === '5',
    `the reload lost the extra base: "${await targetBase.inputValue()}"`,
  );
  shown = await cards(page);
  t.assert(
    shown['Base 5'] === group(777n.toString(5).toUpperCase(), 3),
    `after reload 777₁₀ in base 5 shows "${shown['Base 5']}"`,
  );

  // Reset brings the example back.
  await page.getByRole('button', { name: 'Reset example' }).click();
  await page.waitForTimeout(200);
  t.assert((await input.inputValue()) === '255', `reset left "${await input.inputValue()}"`);

  // ── 9. The documented 10,000-digit ceiling is explained, and a longer paste is not cut silently.
  await input.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('9'.repeat(10_001));
  await page.waitForTimeout(1_500);
  t.assert(
    /Use 10,000 digits or fewer/.test((await alerts(page))[0] ?? ''),
    `10,001 digits show "${(await alerts(page))[0]}"`,
  );
  t.assert((await input.inputValue()).length === 10_001, 'a too-long paste was silently shortened in the field');
  await input.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('9'.repeat(10_000));
  await page.waitForTimeout(2_000);
  shown = await cards(page);
  const bigDecimal = shown['Decimal (base 10)'] ?? '';
  t.assert(
    bigDecimal.replace(/ /g, '') === '9'.repeat(10_000),
    `a 10,000-digit decimal does not come back intact (${bigDecimal.length} chars)`,
  );
  const bigBinary = (shown['Binary (base 2)'] ?? '').replace(/ /g, '');
  t.assert(
    bigBinary === (BigInt('9'.repeat(10_000)) || 0n).toString(2).toUpperCase(),
    'the binary value of the 10,000-digit number is wrong',
  );

  // ── 10. The Korean page converts and labels the same way.
  await t.open('/ko/number-base-converter');
  await page.waitForTimeout(500);
  const koInput = page.locator('main input').first();
  await koInput.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('1,000', { delay: 20 });
  await page.waitForTimeout(300);
  const koCards = await cards(page);
  t.assert(
    koCards['10진수 (base 10)'] === group('1000', 3),
    `Korean page 1,000 shows "${koCards['10진수 (base 10)']}"`,
  );

  // ── 11. 375 px and dark: the result cards stack and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
}

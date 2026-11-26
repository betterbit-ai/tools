/**
 * Data size converter: converting the sizes people actually paste — "1.5", "1,024", a value in
 * bits — and seeing both the SI and IEC readings of the same bytes.
 *
 * Covers the defects this audit fixed:
 *  - a decimal point never survived typing: "1.5" left "51" in the field and 51 MB on screen,
 *    because the shared number input re-rendered the partial value and moved the caret. The field
 *    now keeps the text the visitor typed and reads it only when it is a number.
 *  - a size beyond the exactly representable range (100,000 PB) was shown as 0 bytes in every
 *    unit, with no explanation; it is now reported as too large for this converter.
 *  - an empty field was calculated as 0 MB and answered with a table full of zeros; it now says
 *    what to enter and shows no numbers.
 *  - the main result was labelled "Result (Gigabytes (GB, 1,000,000,000 B))"; it now names the
 *    unit symbol.
 */

export default async function (t) {
  const page = t.page;
  await t.open('/data-size-converter');
  await page.waitForTimeout(400);

  const field = page.locator('main input[type=text]').first();
  const from = page.getByLabel('From');
  const to = page.getByLabel('Result unit');
  const result = async () => (await page.locator('[aria-live=polite] .tabular').first().innerText()).trim();
  const label = async () => (await page.locator('[aria-live=polite] .text-xs.text-muted').first().innerText()).trim();
  const alerts = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('main [role=alert], main [role=status]')].map((e) => e.textContent.trim()),
    );
  const statValue = (unit) =>
    page.evaluate((wanted) => {
      for (const stat of document.querySelectorAll('main div.rounded-md.bg-surface-2')) {
        if (stat.children[1]?.textContent.trim() === wanted) return stat.children[0].textContent.trim();
      }
      return null;
    }, unit);

  const type = async (text) => {
    await field.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(text, { delay: 60 });
    await page.waitForTimeout(200);
  };

  // ── 1. It opens on the worked example: 1,000 MB → 1 GB, with both unit systems.
  t.assert((await field.inputValue()) === '1000', `the field opens with "${await field.inputValue()}"`);
  t.assert((await result()) === '1', `1,000 MB in GB reads ${await result()}`);
  t.assert((await label()) === 'Result (GB)', `the result is labelled ${await label()}`);
  t.assert((await statValue('GiB')) === '0.931323', `1 GB decimal in GiB reads ${await statValue('GiB')}`);
  t.assert((await statValue('Bytes (B)')) === '1,000,000,000', `the byte total reads ${await statValue('Bytes (B)')}`);
  t.assert((await statValue('Bits (bit)')) === '8,000,000,000', `the bit total reads ${await statValue('Bits (bit)')}`);

  // ── 2. A decimal size survives being typed, and the conversion uses it.
  await type('1.5');
  t.assert((await field.inputValue()) === '1.5', `typing 1.5 left "${await field.inputValue()}"`);
  t.assert((await result()) === '0.0015', `1.5 MB in GB reads ${await result()}`);
  t.assert((await statValue('kB')) === '1,500', `1.5 MB in kB reads ${await statValue('kB')}`);

  // ── 3. A grouped value pasted from a spreadsheet or typed in Korea is read, not refused.
  await type('1,024.5');
  t.assert((await field.inputValue()) === '1,024.5', `the grouped value became "${await field.inputValue()}"`);
  t.assert((await result()) === '1.0245', `1,024.5 MB in GB reads ${await result()}`);

  // ── 4. A half-typed number ("1.") is not an error and does not change the meaning.
  await type('1.');
  t.assert((await field.inputValue()) === '1.', `the trailing point was dropped: "${await field.inputValue()}"`);
  t.assert((await alerts()).length === 0, `"1." raised ${(await alerts()).join(' | ')}`);
  t.assert((await result()) === '0.001', `"1." in GB reads ${await result()}`);

  // ── 5. Bits and bytes stay distinct, in both directions.
  await from.selectOption('bit');
  await to.selectOption('B');
  await type('8');
  t.assert((await result()) === '1', `8 bit in B reads ${await result()}`);
  await to.selectOption('bit');
  await type('1');
  await from.selectOption('B');
  t.assert((await result()) === '8', `1 B in bit reads ${await result()}`);

  // ── 6. The SI versus IEC distinction is kept: 1 TB is about 931 GiB, not 1,000 GiB.
  await from.selectOption('TB');
  await to.selectOption('GiB');
  await type('1');
  t.assert((await result()) === '931.32', `1 TB in GiB reads ${await result()}`);
  t.assert((await statValue('GiB')) === '931.32', `the IEC column reads ${await statValue('GiB')}`);

  // ── 7. The swap button carries the converted value across and exchanges the units.
  await to.selectOption('GB');
  await type('512');
  await page.getByRole('button', { name: 'Swap units' }).click();
  await page.waitForTimeout(250);
  t.assert((await field.inputValue()) === '512000', `after the swap the field holds "${await field.inputValue()}"`);
  t.assert((await from.inputValue()) === 'GB', 'the swap did not exchange the units');
  t.assert((await to.inputValue()) === 'TB', 'the swap did not exchange the units');

  // ── 8. A tiny but nonzero size is not printed as 0.
  await from.selectOption('bit');
  await to.selectOption('PB');
  await type('1');
  t.assert((await result()) !== '0', `1 bit in PB reads ${await result()}`);
  t.assert(/e-/.test(await result()), `1 bit in PB reads ${await result()} instead of an exponent`);

  // ── 9. A size beyond the precise range is explained instead of showing 0 bytes everywhere.
  await from.selectOption('PB');
  await type('100000');
  t.assert((await result()) === '—', `100,000 PB shows a result of ${await result()}`);
  const tooLarge = await alerts();
  t.assert(
    tooLarge.some((text) => /8 PiB|9,007,199,254,740,991/.test(text)),
    `no explanation: ${tooLarge.join(' | ')}`,
  );

  // ── 10. Text is reported, and negatives are refused, rather than calculated as 0.
  await type('1 GB');
  t.assert(
    (await alerts()).some((text) => /number/.test(text)),
    `"1 GB" shows no explanation: ${(await alerts()).join(' | ')}`,
  );
  t.assert((await result()) === '—', 'a field holding prose still shows a number');
  await type('-5');
  t.assert((await result()) === '—', 'a negative size still shows a number');

  // ── 11. An empty field asks for a size instead of showing zero everywhere.
  await field.fill('');
  await page.waitForTimeout(200);
  t.assert(
    (await alerts()).some((text) => /Enter a size/.test(text)),
    'an empty field shows no hint',
  );
  t.assert((await result()) === '—', `an empty field shows ${await result()}`);
  t.assert((await statValue('MB')) === '—', `an empty field shows ${await statValue('MB')} MB`);

  // ── 12. The value and units come back after a reload, exactly as typed.
  await type('2,048.5');
  await from.selectOption('MiB');
  await to.selectOption('GB');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(400);
  t.assert((await field.inputValue()) === '2,048.5', `the reload lost the value: "${await field.inputValue()}"`);
  t.assert((await from.inputValue()) === 'MiB' && (await to.inputValue()) === 'GB', 'the reload lost the units');
  t.assert((await result()) === '2.148', `2,048.5 MiB in GB reads ${await result()}`);

  // ── 13. Copy all results copies the table that is on screen.
  await page.getByRole('button', { name: 'Copy all results' }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes('GiB: 2'), `the copied table reads ${copied.split('\n').slice(0, 3).join(' / ')}`);
  t.assert(copied.split('\n').length === 12, `the copied table has ${copied.split('\n').length} lines`);

  // ── 14. A preset page starts from its own conversion instead of the saved one.
  await t.open('/data-size-converter/mb-to-gb');
  await page.waitForTimeout(400);
  const presetValue = await page.locator('main input[type=text]').first().inputValue();
  t.assert(presetValue === '1000', `the MB to GB page opens on "${presetValue}"`);

  // ── 15. 375 px, dark: nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);

  // ── 16. The Korean page reads and labels the same conversion.
  await t.open('/ko/data-size-converter');
  await page.waitForTimeout(400);
  const koreanField = page.locator('main input[type=text]').first();
  await koreanField.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('1.5', { delay: 60 });
  await page.waitForTimeout(250);
  const koreanResult = (await page.locator('[aria-live=polite] .tabular').first().innerText()).trim();
  t.assert(koreanResult === '0.0015', `the Korean page reads ${koreanResult} for 1.5 MB in GB`);
  t.assert((await page.locator('main').innerText()).includes('십진 (SI)'), 'the Korean page has no SI column');
}

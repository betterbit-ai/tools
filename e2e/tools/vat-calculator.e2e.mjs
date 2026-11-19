/**
 * VAT calculator: amounts and rates people actually type (1,234.56, 7.5) have to reach the
 * calculation intact, both directions have to be the real inverse of each other, and the printed
 * net + VAT has to equal the printed gross.
 */

/** One labelled Stat box from any aria-live result area. */
const stat = (page, label) =>
  page.evaluate((wanted) => {
    for (const box of document.querySelectorAll('div[aria-live=polite] > div')) {
      const [value, name] = box.children;
      if (name?.textContent?.trim() === wanted) return value?.textContent?.trim() ?? null;
    }
    return null;
  }, label);

const numeric = (text) => Number((text ?? '').replace(/[^\d.eE+-]/g, ''));

export default async function (t) {
  await t.page.addInitScript(() => localStorage.clear());

  // ── English page, add VAT at the UK standard rate ───────────────────────────────────
  await t.open('/vat-calculator');
  t.assert((await stat(t.page, 'Net (before VAT)')) === '100', 'the page did not start at 100');
  t.assert((await stat(t.page, 'VAT amount')) === '20', 'the default 20% VAT is wrong');
  t.assert((await stat(t.page, 'Gross (including VAT)')) === '120', 'the default gross is wrong');

  // A real invoice amount with cents and a thousands separator.
  const amount = t.page.getByRole('textbox', { name: /Amount before VAT/ });
  await amount.fill('1,234.56');
  t.assert((await amount.inputValue()) === '1,234.56', `the amount was rewritten to "${await amount.inputValue()}"`);
  t.assert(numeric(await stat(t.page, 'Net (before VAT)')) === 1234.56, 'the net amount was not read');
  t.assert(numeric(await stat(t.page, 'Gross (including VAT)')) === 1481.47, '1,234.56 + 20% is wrong');
  t.assert(numeric(await stat(t.page, 'VAT amount')) === 246.91, 'the VAT part of 1,234.56 is wrong');

  // A decimal rate must survive typing: this used to become 57 or drop the digit after "7.".
  const rate = t.page.getByRole('textbox', { name: /VAT rate/ });
  await rate.fill('');
  await rate.pressSequentially('7.5', { delay: 60 });
  t.assert((await rate.inputValue()) === '7.5', `typing 7.5 left "${await rate.inputValue()}"`);
  t.assert((await stat(t.page, 'Rate used')) === '7.5%', 'the decimal rate was not used');

  // The printed figures have to add up, including amounts that do not land on whole cents.
  const net = numeric(await stat(t.page, 'Net (before VAT)'));
  const tax = numeric(await stat(t.page, 'VAT amount'));
  const gross = numeric(await stat(t.page, 'Gross (including VAT)'));
  t.assert(Math.abs(net + tax - gross) < 0.005, `net ${net} + VAT ${tax} does not add up to ${gross}`);
  t.assert(Math.abs(gross - 1234.56 * 1.075) < 0.01, `1,234.56 + 7.5% is wrong (${gross})`);

  // ── Extracting is the real inverse of adding ─────────────────────────────────────────
  await t.page.getByRole('radio', { name: 'Extract VAT' }).click();
  t.assert(
    (await t.page.getByRole('textbox', { name: /Amount including VAT/ }).count()) === 1,
    'extract mode did not rename the amount field',
  );
  await t.page.getByRole('textbox', { name: /Amount including VAT/ }).fill('110000');
  await t.page.getByRole('combobox', { name: /Standard-rate preset/ }).selectOption('kr');
  t.assert((await rate.inputValue()) === '10', 'the Korea preset did not set 10%');
  t.assert(numeric(await stat(t.page, 'Net (before VAT)')) === 100_000, '110,000 incl. 10% is not 100,000 net');
  t.assert(numeric(await stat(t.page, 'VAT amount')) === 10_000, '110,000 incl. 10% is not 10,000 VAT');
  t.assert(numeric(await stat(t.page, 'Gross (including VAT)')) === 110_000, 'the inclusive total changed');

  // Subtracting the rate instead of dividing gives 99,000 — the page must not do that.
  t.assert(numeric(await stat(t.page, 'Net (before VAT)')) !== 99_000, 'extraction subtracted the rate');

  await t.page.getByRole('radio', { name: 'Add VAT' }).click();
  await t.page.getByRole('textbox', { name: /Amount before VAT/ }).fill('121000');
  t.assert(numeric(await stat(t.page, 'Gross (including VAT)')) === 133_100, '121,000 + 10% is wrong');

  // A zero rate is a real answer, not an error.
  await rate.fill('0');
  t.assert(numeric(await stat(t.page, 'VAT amount')) === 0, 'a 0% rate did not give 0 VAT');
  t.assert(numeric(await stat(t.page, 'Gross (including VAT)')) === 121_000, 'a 0% rate changed the amount');

  // Values that cannot be used are explained, next to the amount.
  await amount.fill('열두 개');
  await t.waitForText('Enter the amount as a number', 5_000);
  await amount.fill('500');
  await rate.fill('150');
  await t.waitForText('Enter a VAT rate from 0 to 100', 5_000);
  await rate.fill('10');
  t.assert(numeric(await stat(t.page, 'Gross (including VAT)')) === 550, 'the tool did not recover from invalid input');

  // Reset returns the page to its documented starting point.
  await t.click('Reset');
  t.assert((await amount.inputValue()) === '100', 'reset did not restore the amount');

  // ── Korean page, the reverse direction, and a phone-sized screen ─────────────────────
  await t.open('/ko/vat-calculator');
  await t.waitForText('부가세');
  t.assert(
    (await t.page.getByRole('textbox', { name: /공급가액/ }).inputValue()) === '100000',
    'the Korean default is not 100,000',
  );
  await t.page.getByRole('radio', { name: '포함가에서 역산' }).click();
  await t.page.getByRole('textbox', { name: /합계금액/ }).fill('110,000');
  t.assert(numeric(await stat(t.page, '공급가액(세전)')) === 100_000, 'the Korean extraction is wrong');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px VAT page has horizontal overflow',
  );
  t.assert(
    await t.page.evaluate(() => {
      const fields = [...document.querySelectorAll('input[inputmode=decimal]')];
      return fields.every((field) => field.getBoundingClientRect().width > 60);
    }),
    'the amount and rate fields are squeezed too narrow on a phone',
  );

  // Blocked storage has to be visible: the page promises the settings stay in this browser.
  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };
  });
  await t.open('/ko/vat-calculator');
  await t.page.getByRole('textbox', { name: /공급가액/ }).fill('50000');
  await t.waitForText('저장 안 됨', 5_000);
}

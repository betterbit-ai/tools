/**
 * Volume converter: a recipe amount has to survive typing (0.5, 1,000, 0,5), the result has to
 * follow the chosen cup standard, every control has to change what it claims to, and a value the
 * tool cannot use has to say so instead of showing 0.
 */

const ML_PER_US_CUP = 236.5882365;
const ML_PER_KO_CUP = 200;
const ML_PER_METRIC_CUP = 250;

/** The big result card's number. */
const resultText = (page) => page.locator('div[aria-live=polite]').first().locator('> div > div').first().innerText();

const number = async (page) => {
  const text = await resultText(page);
  return Number(text.replace(/[^\d.eE+-]/g, ''));
};

export default async function (t) {
  await t.page.addInitScript(() => localStorage.clear());

  // ── English page: a US cup is 236.5882365 mL ─────────────────────────────────────────
  await t.open('/volume-converter');
  const value = t.page.getByRole('textbox', { name: 'Volume' });
  t.assert((await value.inputValue()) === '1', 'the page did not start at one US cup');
  t.assert(Math.abs((await number(t.page)) - ML_PER_US_CUP) < 0.01, '1 US cup is not 236.59 mL');

  // Half a cup is the most common recipe amount: typing it used to leave "50" (11,829 mL).
  await value.fill('');
  await value.pressSequentially('0.5', { delay: 60 });
  t.assert((await value.inputValue()) === '0.5', `typing 0.5 left "${await value.inputValue()}"`);
  t.assert(Math.abs((await number(t.page)) - 0.5 * ML_PER_US_CUP) < 0.01, 'half a US cup is wrong');

  // A decimal comma from a European or Korean keyboard.
  await value.fill('1,5');
  t.assert((await value.inputValue()) === '1,5', 'a decimal comma was rewritten while typing');
  t.assert(Math.abs((await number(t.page)) - 1.5 * ML_PER_US_CUP) < 0.01, '"1,5" cups is wrong');

  // A number copied from a document arrives with a thousands separator.
  await value.fill('1,000');
  t.assert((await value.inputValue()) === '1,000', 'a grouped number was rewritten while typing');
  t.assert(Math.abs((await number(t.page)) - 1000 * ML_PER_US_CUP) < 0.5, '"1,000" cups is wrong');

  // Text that is not a number is explained instead of silently becoming 0.
  await value.fill('1 cup');
  await t.waitForText('Enter a number', 5_000);
  t.assert((await resultText(t.page)) === '—', 'an unreadable value still showed a result');

  // Above the supported range the page says so rather than showing 0 mL.
  await value.fill('1000000000001');
  await t.waitForText('Enter a volume from 0', 5_000);
  t.assert((await resultText(t.page)) === '—', 'an out-of-range value still showed a result');

  // ── The cup standard decides the answer ─────────────────────────────────────────────
  await value.fill('1');
  await t.page.getByRole('combobox', { name: 'To' }).selectOption('milliliter');
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('koreanCup');
  t.assert(Math.abs((await number(t.page)) - ML_PER_KO_CUP) < 1e-9, '1 Korean cup is not 200 mL');

  await t.page.getByRole('combobox', { name: 'From' }).selectOption('usLegalCup');
  t.assert(Math.abs((await number(t.page)) - 240) < 1e-9, '1 US legal cup is not 240 mL');

  await t.page.getByRole('combobox', { name: 'From' }).selectOption('metricCup');
  t.assert(Math.abs((await number(t.page)) - ML_PER_METRIC_CUP) < 1e-9, '1 metric cup is not 250 mL');

  await t.page.getByRole('combobox', { name: 'From' }).selectOption('usCup');
  t.assert(Math.abs((await number(t.page)) - ML_PER_US_CUP) < 0.01, 'switching back to US cups failed');

  // Every other measure follows the same amount.
  const other = await t.page.locator('div[aria-live=polite]').nth(1).innerText();
  t.assert(other.includes('8') && other.includes('16') && other.includes('48'), 'cup → fl oz/tbsp/tsp are wrong');

  // Swapping keeps the amount: 1 cup → 236.59 mL becomes 236.59 mL → 1 cup.
  await t.click('Swap units');
  t.assert(
    (await t.page.getByRole('combobox', { name: 'From' }).inputValue()) === 'milliliter',
    'swap did not flip From',
  );
  t.assert((await t.page.getByRole('combobox', { name: 'To' }).inputValue()) === 'usCup', 'swap did not flip To');
  t.assert(Math.abs((await number(t.page)) - 1) < 1e-6, `the amount did not survive a swap (${await number(t.page)})`);
  t.assert(!(await value.inputValue()).includes(','), 'the swapped value was written with a separator');

  // ── Quick reference follows the units and shows recipe fractions ─────────────────────
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('usCup');
  await t.page.getByRole('combobox', { name: 'To' }).selectOption('milliliter');
  const table = () => t.page.locator('table').innerText();
  t.assert((await table()).includes('⅓') && (await table()).includes('78.8627'), 'the cup table lost its thirds');
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('liter');
  t.assert((await table()).includes('1.5') && (await table()).includes('1,500'), 'the table did not follow the units');

  // ── Korean page, presets and a phone-sized screen ────────────────────────────────────
  await t.open('/ko/volume-converter/ml-to-cups');
  await t.waitForText('컵');
  t.assert(
    (await t.page.getByRole('combobox', { name: '변환 전' }).inputValue()) === 'milliliter',
    'the mL preset did not select millilitres',
  );
  t.assert(
    (await t.page.getByRole('textbox', { name: '부피' }).inputValue()) === '500',
    'the mL preset did not start at 500',
  );
  t.assert(Math.abs((await number(t.page)) - 500 / ML_PER_US_CUP) < 0.0001, '500 mL to US cups is wrong');

  await t.open('/ko/volume-converter');
  await t.page.getByRole('combobox', { name: '변환 전' }).selectOption('koreanCup');
  await t.page.getByRole('textbox', { name: '부피' }).fill('2.5');
  t.assert(Math.abs((await number(t.page)) - 500) < 1e-9, '2.5 Korean cups is not 500 mL');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px volume converter page has horizontal overflow',
  );

  // The "saved in this browser" note has to turn into a warning when storage is refused.
  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };
  });
  await t.open('/ko/volume-converter');
  await t.page.getByRole('textbox', { name: '부피' }).fill('12');
  await t.waitForText('저장 안 됨', 5_000);
}

/**
 * Weight converter: the value field has to accept what a person types (decimals, grouped
 * thousands), every control has to change the visible result, and small results must not be
 * displayed as 0.
 */

const KG_TO_LB = 2.2046226218487757;
const LB_TO_KG = 0.45359237;

const resultNumber = (page) =>
  page
    .locator('div[aria-live=polite]')
    .first()
    .innerText()
    .then((text) => Number(text.split('\n')[0].replace(/[^\d.eE+-]/g, '')));

export default async function (t) {
  await t.page.addInitScript(() => localStorage.clear());

  // ── Plain page (English, so the numbers are easy to compare) ──────────────────────────
  await t.open('/weight-converter');
  const valueField = t.page.getByLabel('Value');
  await valueField.fill('70');
  t.assert(Math.abs((await resultNumber(t.page)) - 70 * KG_TO_LB) < 0.01, '70 kg to lb is wrong');

  // A decimal point must survive typing: this used to become "705".
  await valueField.fill('');
  await valueField.pressSequentially('70.5', { delay: 60 });
  t.assert((await valueField.inputValue()) === '70.5', `typing 70.5 left "${await valueField.inputValue()}"`);
  t.assert(Math.abs((await resultNumber(t.page)) - 70.5 * KG_TO_LB) < 0.01, '70.5 kg to lb is wrong');

  await valueField.fill('');
  await valueField.pressSequentially('0.5', { delay: 60 });
  t.assert((await valueField.inputValue()) === '0.5', `typing 0.5 left "${await valueField.inputValue()}"`);
  t.assert(Math.abs((await resultNumber(t.page)) - 0.5 * KG_TO_LB) < 0.0001, '0.5 kg to lb is wrong');

  // A number copied from a document arrives with a thousands separator.
  await valueField.fill('1,000');
  t.assert((await valueField.inputValue()) === '1,000', 'a grouped number was rewritten while typing');
  t.assert(Math.abs((await resultNumber(t.page)) - 1000 * KG_TO_LB) < 0.01, '"1,000" kg to lb is wrong');

  // Text that is not a number is reported instead of silently becoming 0.
  await valueField.fill('70 lb');
  await t.waitForText('Enter a number', 5_000);
  t.assert(!(await resultNumber(t.page)), 'an unreadable value still produced a number');

  // Units are chosen by the person, and the swap button flips them without losing precision.
  await valueField.fill('70');
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('lb');
  await t.page.getByRole('combobox', { name: 'To' }).selectOption('kg');
  t.assert(Math.abs((await resultNumber(t.page)) - 70 * LB_TO_KG) < 0.001, '70 lb to kg is wrong');
  await t.click('Swap units');
  t.assert(
    (await t.page.getByRole('combobox', { name: 'From' }).inputValue()) === 'kg',
    'swap did not flip the from unit',
  );
  t.assert((await t.page.getByRole('combobox', { name: 'To' }).inputValue()) === 'lb', 'swap did not flip the to unit');
  t.assert((await valueField.inputValue()).startsWith('31.7514659'), `swap wrote "${await valueField.inputValue()}"`);
  t.assert(Math.abs((await resultNumber(t.page)) - 70) < 0.0001, 'the value did not survive a swap');

  // Korean market units, and the two different 근.
  await valueField.fill('1');
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('don');
  await t.page.getByRole('combobox', { name: 'To' }).selectOption('g');
  t.assert(Math.abs((await resultNumber(t.page)) - 3.75) < 1e-9, '1 don is not 3.75 g');
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('geunMeat');
  t.assert(Math.abs((await resultNumber(t.page)) - 600) < 1e-9, '1 geun (meat) is not 600 g');
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('geunProduce');
  t.assert(Math.abs((await resultNumber(t.page)) - 375) < 1e-9, '1 geun (produce) is not 375 g');

  // A tiny but real result is never shown as 0 — neither in the result nor in the table.
  await valueField.fill('1');
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('mg');
  await t.page.getByRole('combobox', { name: 'To' }).selectOption('t');
  const tiny = await resultNumber(t.page);
  t.assert(tiny === 1e-9, `1 mg to t showed ${tiny}`);
  t.assert((await t.page.locator('table').innerText()).includes('1E-9'), 'the quick table shows 0 for 1 mg');

  // The quick reference table follows the chosen units.
  await t.page.getByRole('combobox', { name: 'From' }).selectOption('kg');
  await t.page.getByRole('combobox', { name: 'To' }).selectOption('lb');
  const table = await t.page.locator('table').innerText();
  t.assert(table.includes('2.2046') && table.includes('154.32'), 'the quick table does not follow the units');

  // ── Korean page, presets and mobile layout ────────────────────────────────────────────
  await t.open('/ko/weight-converter/kg-to-stone');
  await t.waitForText('스톤');
  t.assert(
    (await t.page.getByRole('combobox', { name: '변환할 단위' }).inputValue()) === 'kg',
    'the kg preset did not select kg',
  );
  t.assert(
    (await t.page.getByRole('combobox', { name: '결과 단위' }).inputValue()) === 'st',
    'the kg preset did not select stone',
  );

  await t.open('/ko/weight-converter');
  await t.page.getByRole('combobox', { name: '변환할 단위' }).selectOption('kg');
  await t.page.getByRole('combobox', { name: '결과 단위' }).selectOption('lb');
  await t.page.getByLabel('값').fill('0.5');
  t.assert(Math.abs((await resultNumber(t.page)) - 0.5 * KG_TO_LB) < 0.0001, 'the Korean page dropped the decimal');
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px weight converter page has horizontal overflow',
  );

  // The "saved automatically" note has to turn into a warning when the browser refuses to store.
  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };
  });
  await t.open('/ko/weight-converter');
  await t.page.getByLabel('값').fill('12');
  await t.waitForText('저장 안 됨', 5_000);
}

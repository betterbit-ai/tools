export default async function (t) {
  await t.open('/reverse-text');
  const input = t.page.getByLabel('Text to reverse');
  const output = t.page.getByLabel('Reversed text');

  await input.fill('one  two\n안녕 👋🏽 é');
  t.assert(
    (await output.inputValue()) === 'é 👋🏽 녕안\nowt  eno',
    'character reversal did not keep Korean text, emoji, and a combined accent intact',
  );

  await t.page.getByRole('radio', { name: 'Word order' }).click();
  t.assert(
    (await output.inputValue()) === 'two  one\né 👋🏽 안녕',
    'word-order reversal did not preserve whitespace per line',
  );

  await t.page.getByRole('radio', { name: 'Line order' }).click();
  t.assert((await output.inputValue()) === '안녕 👋🏽 é\none  two', 'line-order reversal did not preserve line contents');

  await t.open('/ko/reverse-text');
  await t.page.waitForTimeout(100);
  await t.page.getByLabel('뒤집을 텍스트').fill('하나 둘');
  await t.page.getByRole('radio', { name: '단어 순서' }).click();
  t.assert((await t.page.getByLabel('뒤집은 텍스트').inputValue()) === '둘 하나', 'Korean word-order reversal failed');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px dark-mode page has horizontal overflow',
  );
}

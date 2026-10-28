export default async function (t) {
  await t.open('/find-and-replace');
  const input = t.page.getByLabel('Original text');
  const output = t.page.getByLabel('Preview');

  await input.fill('cat catalog cat!\n2026-10-28');
  await t.page.getByRole('textbox', { name: /^Find/ }).fill('cat');
  await t.page.getByRole('textbox', { name: /^Replace with/ }).fill('dog');
  await t.page.getByText('Whole words only', { exact: true }).click();
  t.assert(
    (await output.inputValue()) === 'dog catalog dog!\n2026-10-28',
    'whole-word preview changed a partial match',
  );

  await t.page.getByText('Use regular expression', { exact: true }).click();
  await t.page.getByRole('textbox', { name: /^Find/ }).fill('(\\d{4})-(\\d{2})-(\\d{2})');
  await t.page.getByRole('textbox', { name: /^Replace with/ }).fill('$3/$2/$1');
  t.assert(
    (await output.inputValue()) === 'cat catalog cat!\n28/10/2026',
    'regex capture replacement did not update live',
  );

  await t.click('Use preview as input');
  t.assert(
    (await input.inputValue()) === 'cat catalog cat!\n28/10/2026',
    'applying the preview did not update the source',
  );
  await t.click('Undo');
  t.assert((await input.inputValue()) === 'cat catalog cat!\n2026-10-28', 'undo did not restore the source');

  await t.page.evaluate(() => localStorage.clear());
  await t.open('/ko/find-and-replace');
  await t.page.getByLabel('원문 텍스트').fill('가나다 가');
  await t.page.getByRole('textbox', { name: /^찾을 내용/ }).fill('가');
  await t.page.getByRole('textbox', { name: /^바꿀 내용/ }).fill('나');
  await t.page.getByText('단어 전체만', { exact: true }).click();
  t.assert(
    (await t.page.getByLabel('결과 미리보기').inputValue()) === '가나다 나',
    'Korean whole-word matching changed a partial word',
  );

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px dark-mode page has horizontal overflow',
  );
}

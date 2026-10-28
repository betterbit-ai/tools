export default async function (t) {
  await t.open('/sort-lines');
  const input = t.page.getByLabel('Lines to sort');
  const output = t.page.getByLabel('Sorted lines');

  await input.fill('item 10\nitem 2\nitem 1\nApple\napple\nbanana\n');
  await t.page.getByText('Remove empty lines', { exact: true }).click();
  await t.page.getByText('Remove duplicate lines', { exact: true }).click();
  t.assert(
    (await output.inputValue()) === 'Apple\nbanana\nitem 1\nitem 2\nitem 10',
    'natural sorting and case-insensitive duplicate cleanup did not produce the expected result',
  );

  await t.page.getByRole('radio', { name: 'Reverse lines' }).click();
  t.assert(
    (await output.inputValue()) === 'banana\nApple\nitem 1\nitem 2\nitem 10',
    'reverse-lines mode did not preserve and flip the input order',
  );

  await t.open('/ko/sort-lines');
  await t.page.getByRole('radio').first().click();
  await t.page.getByLabel('정렬할 줄').fill('하늘\n가나\n다람쥐');
  t.assert(
    (await t.page.getByLabel('정렬 결과').inputValue()) === '가나\n다람쥐\n하늘',
    'Korean 가나다순 did not use the Korean locale',
  );

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px dark-mode page has horizontal overflow',
  );
}

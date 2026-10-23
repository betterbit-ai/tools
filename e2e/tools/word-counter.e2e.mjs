/** Landing pages apply their own limit and counting rule, then calculate the advertised totals. */
export default async function (t) {
  await t.page.addInitScript(() => {
    localStorage.setItem('tools:word-counter:limit', '77');
    localStorage.setItem('tools:word-counter:limit-metric', 'charactersNoSpaces');
  });

  await t.open('/ko/word-counter/jasoseo-1000-characters');
  await t.waitForText('1,000 남음');
  t.assert(
    (await t.page.getByRole('combobox', { name: '계산 기준' }).inputValue()) === 'characters',
    'cover-letter preset did not override the saved metric',
  );
  const input = t.page.getByLabel('입력할 글');
  await input.fill('가'.repeat(1001));
  await t.waitForText('1 초과');
  await t.waitForText('1,000 중 1,001 사용');

  await t.open('/ko/word-counter/sms-80-bytes');
  await t.waitForText('80바이트에 한글 40자');
  await t.page.getByLabel('입력할 글').fill('가'.repeat(41));
  await t.waitForText('80 중 82 사용');
  await t.waitForText('2 초과');
  t.assert(
    (await t.page.getByRole('combobox', { name: '계산 기준' }).inputValue()) === 'bytesLegacy',
    'Korean SMS page did not select the byte rule',
  );

  await t.open('/ko/word-counter/x-post-280');
  await t.page.getByLabel('입력할 글').fill(`${'가'.repeat(140)}a`);
  await t.waitForText('280 중 281 사용');
  await t.waitForText('1 초과');
  await t.waitForText('웹 주소 23점');
  t.assert(
    (await t.page.getByRole('link', { name: 'X twitter-text v3' }).getAttribute('href'))?.includes(
      'twitter/twitter-text',
    ),
    'X rule did not expose its official source',
  );

  await t.open('/ko/word-counter/youtube-description-5000-bytes');
  await t.page.getByLabel('입력할 글').fill('가'.repeat(1667));
  await t.waitForText('5,000 중 5,001 사용');
  await t.waitForText('1 초과');

  await t.open('/word-counter/sms-160-characters');
  await t.waitForText('160 remaining');
  await t.waitForText('160 GSM-7 characters or 70 characters');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px landing page has horizontal overflow',
  );
}

function statText(page, label) {
  return page.getByText(label, { exact: true }).locator('..').innerText();
}

async function checkKoreanVariant(t, birthYear, expectSchool) {
  await t.open(`/ko/age-calculator/${birthYear}-born`);

  const description = await t.page.locator('meta[name="description"]').getAttribute('content');
  const intro = await t.page.locator('header p').innerText();
  const range = intro.match(/생일 전 만 (\d+)세, 생일부터 만 (\d+)세이고 연 나이는 (\d+)세이며 ([^\s]+띠)입니다/);
  t.assert(range, `${birthYear}년생 소개에 만 나이 범위·연 나이·띠가 있어야 합니다`);
  const [, beforeBirthday, fromBirthday, yearAge, zodiac] = range;

  t.assert(description.includes(`생일 전 만 ${beforeBirthday}세`), '설명과 소개의 생일 전 만 나이가 같아야 합니다');
  t.assert(description.includes(`생일부터 만 ${fromBirthday}세`), '설명과 소개의 생일 후 만 나이가 같아야 합니다');
  t.assert(description.includes(`연 나이는 ${yearAge}세`), '설명과 소개의 연 나이가 같아야 합니다');
  t.assert(description.includes(zodiac), '설명과 소개의 띠가 같아야 합니다');
  if (expectSchool) {
    const school = intro.match(/통상 ((?:초등학교|중학교|고등학교) \d학년)입니다/)?.[1];
    t.assert(school, '소개에 통상 학년 답이 있어야 합니다');
    t.assert(description.includes(school), '검색 설명과 소개의 학년이 같아야 합니다');
  }

  t.assert(
    (await t.page.getByLabel('생년월일').inputValue()) === `${birthYear}-01-01`,
    'variant preset should win over a saved birth date',
  );
  t.assert(
    (await statText(t.page, '만 나이')).includes(`${fromBirthday}세`),
    '계산기의 만 나이가 소개 범위와 맞아야 합니다',
  );
  t.assert((await statText(t.page, '연 나이')).includes(`${yearAge}세`), '계산기의 연 나이가 소개와 맞아야 합니다');
  t.assert((await statText(t.page, '띠')).includes(zodiac), '계산기의 띠가 소개와 맞아야 합니다');
}

export default async function (t) {
  await t.open('/ko/age-calculator');
  await t.page.getByLabel('생년월일').fill('1999-12-31');
  await t.page.waitForFunction(() => localStorage.getItem('tools:age-calculator:birthDate') === '1999-12-31');

  await checkKoreanVariant(t, 2000, false);
  await checkKoreanVariant(t, 2010, true);
  await checkKoreanVariant(t, 2015, true);

  await t.open('/age-calculator/2000-born');
  const englishIntro = await t.page.locator('header p').innerText();
  const englishDescription = await t.page.locator('meta[name="description"]').getAttribute('content');
  const englishAnswer = englishIntro.match(
    /is (\d+) before their birthday and (\d+) from their birthday in (\d+); their Korean year age is (\d+), and their zodiac animal is ([A-Za-z]+)/,
  );
  t.assert(englishAnswer, 'English intro should answer the age range, year age and zodiac');
  const [, beforeBirthday, fromBirthday, referenceYear, yearAge, zodiac] = englishAnswer;
  t.assert(
    englishDescription.includes(
      `${beforeBirthday} before their birthday and ${fromBirthday} from it in ${referenceYear}`,
    ),
    'English snippet should carry the same age range',
  );
  t.assert(englishDescription.includes(`Korean year age ${yearAge}`), 'English snippet should carry the same year age');
  t.assert(englishDescription.includes(`${zodiac} zodiac`), 'English snippet should carry the same zodiac');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const overflow = await t.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  t.assert(overflow <= 1, `mobile variant should not scroll horizontally (overflow ${overflow}px)`);

  await t.page.getByLabel('Date of birth').focus();
  let referenceDateFocused = false;
  for (let tabs = 0; tabs < 5 && !referenceDateFocused; tabs++) {
    await t.page.keyboard.press('Tab');
    referenceDateFocused = await t.page
      .getByLabel('As of date')
      .evaluate((element) => element === document.activeElement);
  }
  t.assert(referenceDateFocused, 'date fields should remain reachable in keyboard order');

  t.assert(t.errors.page.length === 0, 'variant pages should have no uncaught page errors');
}

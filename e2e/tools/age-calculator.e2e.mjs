function statText(page, label) {
  return page.getByText(label, { exact: true }).locator('..').innerText();
}

function calendarDaysBetween(start, end) {
  const toUtcDay = (iso) => {
    const [year, month, day] = iso.split('-').map(Number);
    return Date.UTC(year, month - 1, day) / 86_400_000;
  };
  return toUtcDay(end) - toUtcDay(start);
}

function internationalAge(birth, reference) {
  const [birthYear, birthMonth, birthDay] = birth.split('-').map(Number);
  const [referenceYear, referenceMonth, referenceDay] = reference.split('-').map(Number);
  return (
    referenceYear -
    birthYear -
    (referenceMonth < birthMonth || (referenceMonth === birthMonth && referenceDay < birthDay) ? 1 : 0)
  );
}

function localTodayIso() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join(
    '-',
  );
}

async function assertEnglishResults(t, birth, reference) {
  const expectedInternationalAge = internationalAge(birth, reference);
  const expectedDaysLived = calendarDaysBetween(birth, reference) + 1;
  const expectedNextBirthdayDays = calendarDaysBetween(reference, '2026-02-28');

  t.assert(
    (await statText(t.page, 'International age (만 나이)')).includes(`${expectedInternationalAge} years old`),
    'international age should use the independently calculated birthday rule',
  );
  t.assert(
    (await statText(t.page, 'Exact age')).includes('25y 0m 1d'),
    'leap-day exact age should clamp to February 28',
  );
  t.assert(
    (await statText(t.page, 'Korean counting age (세는 나이)')).includes('26 years old'),
    'Korean counting age should use birth year as age one',
  );
  t.assert(
    (await statText(t.page, 'Year age (연 나이)')).includes('25 years old'),
    'year age should ignore the birthday',
  );
  t.assert((await statText(t.page, 'Chinese zodiac')).includes('Dragon'), 'zodiac should match the birth year');
  t.assert((await statText(t.page, 'Star sign')).includes('Pisces'), 'star sign should match the birth month and day');
  t.assert(
    (await statText(t.page, 'Days lived')).includes(`${expectedDaysLived.toLocaleString('en-US')}rd day`),
    'days lived should include the birth date and match an independent UTC-day count',
  );
  t.assert(
    (await statText(t.page, 'Next birthday')).includes(`in ${expectedNextBirthdayDays} days`),
    'next birthday countdown should use the clamped non-leap-year birthday',
  );
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
  const birth = '2000-02-29';
  const reference = '2025-03-01';

  await t.open('/age-calculator');
  await t.page.getByLabel('Date of birth').fill(birth);
  await t.page.getByLabel('As of date').fill(reference);
  await assertEnglishResults(t, birth, reference);

  await t.page.getByLabel('Date of birth').fill('1999-12-31');
  t.assert(
    (await statText(t.page, 'Year age (연 나이)')).includes('26 years old'),
    'changing the birth-date control should recalculate year age immediately',
  );
  await t.page.getByLabel('Date of birth').fill(birth);

  await t.page.getByLabel('Date of birth').fill('2025-03-02');
  await t.waitForText('The date of birth must be on or before the "as of" date.');
  await t.page.getByLabel('Date of birth').fill('');
  await t.waitForText('Choose a valid calendar date.');
  await t.page.getByLabel('Date of birth').fill(birth);

  await t.click('Reset to today');
  t.assert(
    (await t.page.getByLabel('As of date').inputValue()) === localTodayIso(),
    'Reset to today should replace the comparison date with the browser-local calendar date',
  );
  await t.page.getByLabel('As of date').fill(reference);
  await assertEnglishResults(t, birth, reference);

  await t.click('Copy summary');
  await t.waitForText('Copied');
  t.assert(
    (await t.page.evaluate(() => navigator.clipboard.readText())).includes('25 years old'),
    'Copy summary should put the visible result on the clipboard',
  );

  await t.page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => Promise.reject(new Error('Clipboard permission denied')) },
    }),
  );
  await t.click('Copy summary');
  await t.waitForText('Could not copy the summary. Check your browser clipboard permission and try again.');

  await t.page.waitForFunction(
    (savedBirthDate) => localStorage.getItem('tools:age-calculator:birthDate') === savedBirthDate,
    birth,
  );
  await t.open('/age-calculator');
  await t.page.waitForFunction(
    (savedBirthDate) => document.querySelector('input[type="date"]')?.value === savedBirthDate,
    birth,
  );
  t.assert(
    (await t.page.getByLabel('Date of birth').inputValue()) === birth,
    'a valid birth date should persist in this browser',
  );

  await t.open('/ko/age-calculator');
  await t.page.getByLabel('생년월일').fill(birth);
  await t.page.getByLabel('기준일').fill(reference);
  t.assert(
    (await statText(t.page, '만 나이')).includes('25세'),
    'Korean result should show the localized international age',
  );
  t.assert(
    (await statText(t.page, '정확한 만 나이')).includes('25년 0개월 1일'),
    'Korean exact-age formatting should remain readable',
  );
  t.assert(
    (await statText(t.page, '세는 나이')).includes('26세'),
    'Korean counting age should update from the same dates',
  );
  t.assert(
    (await statText(t.page, '태어난 지')).includes('9,133일째'),
    'Korean number formatting should keep digit grouping',
  );

  await checkKoreanVariant(t, 2010, true);

  await t.open('/age-calculator/2000-born');
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
  t.assert(t.errors.page.length === 0, 'calculator pages should have no uncaught page errors');
}

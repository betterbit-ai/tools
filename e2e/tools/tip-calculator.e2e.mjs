/**
 * Tip calculator: amounts and rates the way people paste them (1,234.56, 18%, 50,000원, 3명) have to
 * reach the calculation intact, the printed tip + service + bill have to equal the printed total, the
 * exact split has to add back up, every preset and country has to change what it claims, and an
 * input the calculator cannot store has to say so.
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

const money = (minor, locale, currency, digits) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(minor / 10 ** digits);

/** The independent calculation the page is checked against, in integer minor units. */
function expected({ billMinor, tipPercent, servicePercent = 0, people = 1 }) {
  const service = Math.round((billMinor * servicePercent) / 100);
  const tip = Math.round((billMinor * tipPercent) / 100);
  const total = billMinor + service + tip;
  const lower = Math.floor(total / people);
  const higherCount = total % people;
  return {
    service,
    tip,
    total,
    lower,
    higher: higherCount ? lower + 1 : lower,
    higherCount,
    lowerCount: people - higherCount,
  };
}

const notices = (page) => page.locator('main [role=alert], main [role=status]').allInnerTexts();

export default async function (t) {
  await t.page.addInitScript(() => localStorage.clear());

  // ── English page: the documented default ────────────────────────────────────────
  await t.open('/tip-calculator');
  const bill = t.page.getByRole('textbox', { name: /Bill before tip/ });
  const tip = t.page.getByRole('textbox', { name: /Tip \(%\)/ });
  const service = t.page.getByRole('textbox', { name: /Service charge/ });
  const people = t.page.getByRole('textbox', { name: /People/ });
  t.assert((await bill.inputValue()) === '50', 'the default bill is not 50');
  t.assert((await tip.inputValue()) === '20', 'the US preset does not start at 20%');
  t.assert((await stat(t.page, 'Tip')) === '$10.00', '20% of $50 is not $10.00');
  t.assert((await stat(t.page, 'Total')) === '$60.00', 'the default total is wrong');
  t.assert((await stat(t.page, 'Highest share')) === '$60.00', 'one diner does not pay the whole total');

  // ── A real receipt, a typed percent sign, and an exact split ──────────────────
  await bill.fill('1,234.56');
  await tip.fill('18%');
  await service.fill('10%');
  await people.fill('3');
  const split = expected({ billMinor: 123_456, tipPercent: 18, servicePercent: 10, people: 3 });
  t.assert((await stat(t.page, 'Tip')) === money(split.tip, 'en-US', 'USD', 2), 'the tip on 1,234.56 is wrong');
  t.assert(
    (await stat(t.page, 'Service charge')) === money(split.service, 'en-US', 'USD', 2),
    'the service charge is wrong',
  );
  t.assert((await stat(t.page, 'Total')) === money(split.total, 'en-US', 'USD', 2), 'the total is wrong');
  t.assert(
    (await stat(t.page, 'Highest share')) === money(split.higher, 'en-US', 'USD', 2),
    'the highest per-person share is wrong',
  );
  const text = (await notices(t.page)).join(' ');
  t.assert(
    text.includes(`${split.higherCount} pay ${money(split.higher, 'en-US', 'USD', 2)}`) &&
      text.includes(`${split.lowerCount} pay ${money(split.lower, 'en-US', 'USD', 2)}`),
    `the split notice does not match the exact shares: ${text}`,
  );

  // The preset buttons drive the same field the person types into.
  await t.page.getByRole('radio', { name: '15%' }).click();
  t.assert((await tip.inputValue()) === '15', 'the 15% preset did not set the rate');
  t.assert(
    (await stat(t.page, 'Tip')) ===
      money(expected({ billMinor: 123_456, tipPercent: 15, servicePercent: 10 }).tip, 'en-US', 'USD', 2),
    '15% did not recalculate the tip',
  );

  // ── Changing the country changes the preset and the currency ──────────────────
  await t.page.getByRole('combobox').selectOption('kr');
  t.assert((await tip.inputValue()) === '0', 'the Korea preset does not start at 0%');
  t.assert((await stat(t.page, 'Tip')) === '₩0', 'a 0% tip in Korea still shows a tip');
  t.assert(/^₩/u.test(await stat(t.page, 'Total')), 'the Korean country does not format in won');

  // ── Invalid input is explained instead of showing a wrong total ───────────────
  await t.page.getByRole('combobox').selectOption('us');
  await people.fill('2.5');
  await t.waitForText('whole number of people', 5_000);
  t.assert((await stat(t.page, 'Total')) === null, 'a partial person still produced a total');
  await people.fill('3');
  t.assert((await stat(t.page, 'Total')) !== null, 'the calculator did not recover from an invalid head count');

  await bill.fill('');
  t.assert((await stat(t.page, 'Total')) === null, 'an empty bill still produced a total');
  await bill.fill('100');
  await tip.fill('15');
  t.assert((await stat(t.page, 'Tip')) === money(1500, 'en-US', 'USD', 2), 'the tip on $100 at 15% is not $15.00');

  // ── Korean page: the amounts and counts people actually paste ────────────────
  await t.open('/ko/tip-calculator');
  const koBill = t.page.getByRole('textbox', { name: /팁 제외 금액/ });
  const koTip = t.page.getByRole('textbox', { name: /팁 비율/ });
  const koPeople = t.page.getByRole('textbox', { name: /인원수/ });
  await koBill.fill('50,000원');
  await koPeople.fill('3명');
  await koTip.fill('10%');
  t.assert((await koBill.inputValue()) === '50,000원', 'the pasted won amount was rewritten');
  t.assert(
    (await stat(t.page, '팁')) === money(5_000, 'ko-KR', 'KRW', 0),
    `the tip on 50,000원 at 10% is ${await stat(t.page, '팁')}`,
  );
  t.assert((await stat(t.page, '최종 금액')) === money(55_000, 'ko-KR', 'KRW', 0), 'the Korean total is wrong');
  t.assert(
    (await stat(t.page, '1인 최대 결제액')) === money(18_334, 'ko-KR', 'KRW', 0),
    'the highest share of 55,000원 for three people is wrong',
  );
  const koNotices = (await notices(t.page)).join(' ');
  t.assert(
    koNotices.includes('1명은 ₩18,334') && koNotices.includes('2명은 ₩18,333'),
    `the exact 55,000원 split is not explained: ${koNotices}`,
  );
  t.assert(!koNotices.includes('입력하세요'), 'the page still reports an input error');
  // The printed formula repeats the rate the person typed: a pasted "10%" must not print "10%%".
  const formula = await t.page.locator('main p.font-mono').first().innerText();
  t.assert(formula.includes('× 10% ÷ 100'), `the printed formula is wrong: ${formula}`);
  t.assert(!formula.includes('%%'), `the printed formula repeats the percent sign: ${formula}`);

  // Copying the summary carries the same figures.
  await t.page.getByRole('button', { name: '요약 복사' }).click();
  const copied = await t.page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes('₩5,000') && copied.includes('₩55,000'), `the copied summary is wrong: ${copied}`);

  // ── A phone-sized screen keeps every field usable ─────────────────────────────
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px tip page has horizontal overflow',
  );
  t.assert(
    await t.page.evaluate(() =>
      [...document.querySelectorAll('input[inputmode]')].every((field) => field.getBoundingClientRect().width > 60),
    ),
    'a tip field is squeezed too narrow on a phone',
  );

  // ── The "saved in this browser" promise is kept or retracted ──────────────────
  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };
  });
  await t.open('/ko/tip-calculator');
  await t.waitForText('저장 안 됨', 5_000);
}

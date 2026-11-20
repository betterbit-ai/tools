/**
 * The Unix timestamp converter for both directions, with the values a real user brings:
 * ten-digit seconds, thirteen-digit milliseconds (from Date.now()), a negative timestamp
 * before 1970, and a date typed into the field. Every control must change the result it
 * claims to, and out-of-range or malformed input must be explained.
 */

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

const iso = (ms) => new Date(ms).toISOString();

const display = (ms, zone, locale = 'en-US') =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'medium',
    hourCycle: 'h23',
    timeZone: zone === 'utc' ? 'UTC' : TZ,
  }).format(new Date(ms));

/** Click a control that may sit under the sticky header once scrolled to the viewport top. */
async function tap(locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await locator.click();
}

/** The <output> of the result row that carries this label. */
async function row(page, label) {
  const labels = page.getByText(label, { exact: true });
  const count = await labels.count();
  for (let index = 0; index < count; index += 1) {
    const output = labels.nth(index).locator('xpath=..').locator('output');
    if (await output.count()) return (await output.first().innerText()).trim();
  }
  throw new Error(`no result row labelled ${label}`);
}

export default async function (t) {
  const page = t.page;
  await t.open('/unix-timestamp');

  const timestamp = page.getByRole('textbox', { name: /^Unix timestamp/ });
  const dateField = page.getByRole('textbox', { name: /^Date and time/ });

  // A ten-digit second value a searcher would paste.
  await timestamp.fill('1704067200');
  t.assert((await row(page, 'Read as')) === 'Seconds', `a ten-digit value was read as ${await row(page, 'Read as')}`);
  t.assert((await row(page, 'Unix seconds')) === '1704067200', 'seconds row is wrong');
  t.assert((await row(page, 'Unix milliseconds')) === '1704067200000', 'milliseconds row is wrong');
  t.assert((await row(page, 'ISO 8601 (UTC)')) === '2024-01-01T00:00:00.000Z', 'ISO row is wrong');
  t.assert((await row(page, 'UTC time')) === display(1704067200000, 'utc'), 'readable UTC time is wrong');

  // The 13-digit milliseconds that Date.now() returns.
  await timestamp.fill('1704067200123');
  t.assert((await row(page, 'Read as')) === 'Milliseconds', 'a thirteen-digit value was not read as milliseconds');
  t.assert(
    (await row(page, 'Unix seconds')) === '1704067200.123',
    `millisecond remainder was rounded: ${await row(page, 'Unix seconds')}`,
  );
  t.assert((await row(page, 'ISO 8601 (UTC)')) === '2024-01-01T00:00:00.123Z', 'ISO row lost the milliseconds');
  t.assert((await dateField.inputValue()) === '2024-01-01T00:00', 'the date field was not filled from the timestamp');

  // A timestamp before the epoch stays negative and correct.
  await timestamp.fill('-86400');
  t.assert(
    (await row(page, 'ISO 8601 (UTC)')) === '1969-12-31T00:00:00.000Z',
    `negative timestamp: ${await row(page, 'ISO 8601 (UTC)')}`,
  );
  t.assert((await row(page, 'Unix seconds')) === '-86400', 'negative seconds row is wrong');

  // The unit override really reinterprets the same digits.
  await timestamp.fill('1704067200123');
  await tap(page.getByRole('radio', { name: 'Seconds', exact: true }));
  const forcedSecondsMs = 1704067200123 * 1000;
  t.assert((await row(page, 'Read as')) === 'Seconds', 'unit override was ignored');
  t.assert(
    (await row(page, 'Unix milliseconds')) === String(forcedSecondsMs),
    'unit override did not multiply to milliseconds',
  );
  t.assert((await row(page, 'ISO 8601 (UTC)')) === iso(forcedSecondsMs), 'unit override did not change the date');
  await timestamp.fill('1704067200');
  await tap(page.getByRole('radio', { name: 'Milliseconds', exact: true }));
  t.assert(
    (await row(page, 'ISO 8601 (UTC)')) === iso(1704067200),
    'choosing milliseconds for a ten-digit value did not reinterpret it',
  );
  await tap(page.getByRole('radio', { name: 'Auto', exact: true }));

  // Malformed and out-of-range values are explained instead of guessed.
  await timestamp.fill('1.5');
  await t.waitForText('Use an integer only');
  await timestamp.fill('1,704,067,200');
  await t.waitForText('Use an integer only');
  await timestamp.fill('8640000000000001');
  await t.waitForText('outside the JavaScript Date range');
  t.assert((await page.locator('main output').count()) === 0, 'an error still showed a converted value');
  await timestamp.fill('');
  await t.waitForText('Enter a Unix timestamp or a valid date and time.');

  // Date to timestamp, read as UTC: the exact instant the field names.
  await timestamp.fill('1704067200');
  await dateField.fill('2024-03-01T09:30');
  t.assert(
    (await timestamp.inputValue()) === String(Date.UTC(2024, 2, 1, 9, 30) / 1000),
    `date to timestamp (UTC): ${await timestamp.inputValue()}`,
  );
  t.assert(
    (await row(page, 'ISO 8601 (UTC)')) === '2024-03-01T09:30:00.000Z',
    'the ISO row did not follow the edited date',
  );

  // The same wall-clock time read as device time is a different instant.
  await tap(page.getByRole('radio', { name: 'Device time', exact: true }));
  t.assert(
    (await row(page, 'Device time')) === display(Date.UTC(2024, 2, 1, 9, 30), 'local'),
    'the readable row did not switch to device time',
  );
  await dateField.fill('2024-03-01T09:30');
  const localSeconds = String(new Date(2024, 2, 1, 9, 30).getTime() / 1000);
  t.assert(
    (await timestamp.inputValue()) === localSeconds,
    `date to timestamp (device time): expected ${localSeconds}, got ${await timestamp.inputValue()}`,
  );
  t.assert(
    (await row(page, 'ISO 8601 (UTC)')) === iso(new Date(2024, 2, 1, 9, 30).getTime()),
    'the ISO row is not the same instant as the device-time entry',
  );

  // Seconds precision: a log line at 09:30:45 must be reproducible.
  await tap(page.getByRole('radio', { name: 'UTC', exact: true }));
  await dateField.fill('2024-03-01T09:30:45');
  t.assert(
    (await timestamp.inputValue()) === '1709285445',
    `a time with seconds could not be entered: the timestamp field holds ${await timestamp.inputValue()}`,
  );
  t.assert((await row(page, 'ISO 8601 (UTC)')) === '2024-03-01T09:30:45.000Z', 'seconds were dropped from the ISO row');

  // "Use current time" starts from now.
  await tap(page.getByRole('button', { name: 'Use current time', exact: true }));
  const nowSeconds = Number(await timestamp.inputValue());
  t.assert(Math.abs(nowSeconds - Date.now() / 1000) < 10, `current time button left ${await timestamp.inputValue()}`);
  t.assert((await row(page, 'Read as')) === 'Seconds', 'current time did not switch the unit to seconds');

  // "/" focuses the timestamp field from elsewhere on the page.
  await page.getByRole('heading', { name: 'Unix Timestamp Converter', level: 1 }).click();
  await page.keyboard.press('/');
  t.assert(
    (await page.evaluate(() => document.activeElement?.getAttribute('placeholder'))) === '1704067200',
    'the / shortcut did not focus the timestamp field',
  );

  // The last state survives a reload.
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tools:unix-timestamp:state')));
  t.assert(saved && saved.timestamp === String(nowSeconds), `state was not saved: ${JSON.stringify(saved)}`);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForFunction(
    (value) => document.querySelector('main input[inputmode="numeric"]')?.value === value,
    String(nowSeconds),
    { timeout: 10_000 },
  );

  // Korean page: same conversions under the translated labels.
  await t.open('/ko/unix-timestamp');
  await page.getByRole('textbox', { name: /^유닉스 타임스탬프/ }).fill('1704067200');
  t.assert((await row(page, 'ISO 8601 (UTC)')) === '2024-01-01T00:00:00.000Z', '한국어 페이지의 ISO 결과가 다릅니다');
  t.assert(
    (await row(page, 'UTC 시간')) === display(1704067200000, 'utc', 'ko'),
    `한국어 페이지의 UTC 시간 표시가 다릅니다: ${await row(page, 'UTC 시간')}`,
  );
  await page.getByRole('textbox', { name: /^날짜와 시간/ }).fill('2024-03-01T09:30:45');
  t.assert(
    (await page.getByRole('textbox', { name: /^유닉스 타임스탬프/ }).inputValue()) === '1709285445',
    '한국어 페이지에서 초 단위 날짜 입력이 반영되지 않습니다',
  );

  // The panel fits a 375 px phone and renders in dark mode.
  await page.setViewportSize({ width: 375, height: 812 });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    '375 px 뷰포트에서 가로 스크롤이 생깁니다',
  );
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    '다크 모드에서 페이지 배경이 렌더링되지 않습니다',
  );
}

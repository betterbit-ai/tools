/**
 * CSV ↔ JSON: the file a person actually has — Korean names, a comma inside a quoted field, an
 * emoji, a semicolon export from Excel — and the file they get back.
 *
 * Covers the defects this audit fixed:
 *  - a downloaded CSV had no byte-order mark, so Excel opened Korean text as mojibake while the
 *    preview on screen looked correct (see §10);
 *  - a large paste re-parsed the whole document on every keystroke afterwards, freezing the page
 *    while someone edited a 1 MB file (see §11).
 */

const csv = [
  '이름,도시,금액,가입',
  '"김, 철수",서울,12000,true',
  '홍길동,"부산, 해운대",,false',
  '"줄\n바꿈",대구,3.5,false',
  '😀 이모지,제주,0,true',
].join('\r\n');

const records = [
  { 이름: '김, 철수', 도시: '서울', 금액: '12000', 가입: 'true' },
  { 이름: '홍길동', 도시: '부산, 해운대', 금액: '', 가입: 'false' },
  { 이름: '줄\n바꿈', 도시: '대구', 금액: '3.5', 가입: 'false' },
  { 이름: '😀 이모지', 도시: '제주', 금액: '0', 가입: 'true' },
];

export default async function (t) {
  const page = t.page;
  await t.open('/csv-json');
  await page.waitForTimeout(400);

  const input = page.locator('main textarea').first();
  const output = page.locator('main textarea').nth(1);
  const notice = () =>
    page.evaluate(() => document.querySelector('main [role=alert], main [role=status]')?.textContent?.trim() ?? '');
  const stats = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('main div.rounded-md.bg-surface-2')].map((box) => [
        box.children[1]?.textContent?.trim(),
        box.children[0]?.textContent?.trim(),
      ]),
    );
  const fill = async (text) => {
    await input.fill(text);
    await page.waitForTimeout(300);
  };

  // ── 1. The page opens on a worked example that converts as it loads.
  const sample = await output.inputValue();
  t.assert(
    Array.isArray(JSON.parse(sample)) && JSON.parse(sample).length === 2,
    'the example does not convert to two records',
  );
  t.assert(JSON.parse(sample)[0].id === '001', 'the example lost the leading zero of an id column');
  t.assert(
    (await stats()).some(([label, value]) => label === 'Rows' && value === '2'),
    `the row count reads ${JSON.stringify(await stats())}`,
  );

  // ── 2. A real Korean CSV with a quoted comma, quoted newline and an emoji converts exactly.
  await fill(csv);
  const json = JSON.parse(await output.inputValue());
  t.assert(JSON.stringify(json) === JSON.stringify(records), `the records are ${JSON.stringify(json)}`);
  t.assert((await output.inputValue()).includes('"김, 철수"'), 'the quoted comma was not kept inside one field');
  t.assert((await output.inputValue()).includes('줄\\n바꿈'), 'the quoted line break was not kept inside one field');

  // ── 3. Types are kept as text unless the visitor asks for inference.
  await page.getByText('Infer numbers, true/false, and null', { exact: true }).click();
  await page.waitForTimeout(300);
  const typed = JSON.parse(await output.inputValue());
  t.assert(typed[0].금액 === 12000, `with inference the amount is ${JSON.stringify(typed[0].금액)}`);
  t.assert(typed[3].금액 === 0, 'a zero amount is not read as a number');
  t.assert(typed[0].가입 === true, 'true is not read as a boolean');
  t.assert(typed[1].금액 === '', 'an empty cell became something other than an empty string');
  await page.getByText('Infer numbers, true/false, and null', { exact: true }).click();
  await page.waitForTimeout(300);

  // ── 4. The header row switch turns the first line into data and names the columns by position.
  await page.getByText('First row is headers', { exact: true }).click();
  await page.waitForTimeout(300);
  const withoutHeader = JSON.parse(await output.inputValue());
  t.assert(
    Array.isArray(withoutHeader[0]) && withoutHeader.length === 5,
    'without a header row the output is not five rows of values',
  );
  t.assert(withoutHeader[0][0] === '이름', `the first cell is ${JSON.stringify(withoutHeader[0][0])}`);
  await page.getByText('First row is headers', { exact: true }).click();
  await page.waitForTimeout(300);

  // ── 5. Indentation is a choice, and the output follows it.
  await page.getByLabel('JSON indent').selectOption('4');
  await page.waitForTimeout(250);
  t.assert(
    (await output.inputValue()).split('\n')[2].startsWith('        "'),
    'four-space indentation was not applied',
  );
  await page.getByLabel('JSON indent').selectOption('2');
  await page.waitForTimeout(250);

  // ── 6. A semicolon export and a tab export are detected, and an explicit choice is obeyed.
  await fill('이름;도시\n김;서울');
  t.assert(JSON.parse(await output.inputValue())[0].도시 === '서울', 'the semicolon file was not split into columns');
  await fill('이름\t도시\n김\t서울');
  t.assert(JSON.parse(await output.inputValue())[0].도시 === '서울', 'the tab file was not split into columns');
  await page.getByLabel('Delimiter').selectOption('comma');
  await page.waitForTimeout(250);
  t.assert((await notice()).length > 0, 'forcing a delimiter that the file does not use says nothing');
  await page.getByLabel('Delimiter').selectOption('auto');
  await page.waitForTimeout(250);

  // ── 7. Text that cannot be read is explained at the place it fails, and nothing is pretended.
  await fill('이름,도시\n"김,서울');
  t.assert(/quote/i.test(await notice()), `an unclosed quote says: ${await notice()}`);
  await fill('이름,도시\n김,서울,부산');
  t.assert(/2|two/.test(await notice()) && /3|three/.test(await notice()), `a ragged row says: ${await notice()}`);
  t.assert((await output.inputValue()) === '', 'a failed conversion still shows output');
  await fill('이름,이름\n김,이');
  t.assert(/이름/.test(await notice()), `a duplicate header says: ${await notice()}`);

  // ── 8. JSON to CSV, including the fields that need quoting.
  await page
    .locator('[role=radio]')
    .filter({ hasText: /JSON → CSV/ })
    .click();
  await page.waitForTimeout(300);
  await fill('[{"이름":"김, 철수","메모":"줄\\n바꿈"},{"이름":"홍길동","메모":""}]');
  const back = await output.inputValue();
  t.assert(back.startsWith('이름,메모'), `the CSV header is ${JSON.stringify(back.slice(0, 20))}`);
  t.assert(back.includes('"김, 철수"'), 'a comma inside a value was not quoted');
  t.assert(back.includes('"줄\n바꿈"'), 'a line break inside a value was not quoted');
  // Round trip: the CSV it produced reads back as the same two records.
  await page
    .locator('[role=radio]')
    .filter({ hasText: /CSV → JSON/ })
    .click();
  await page.waitForTimeout(250);
  await fill(back);
  const roundTrip = JSON.parse(await output.inputValue());
  t.assert(roundTrip.length === 2, `the round trip produced ${roundTrip.length} records`);
  t.assert(
    roundTrip[0].이름 === '김, 철수' && roundTrip[0].메모 === '줄\n바꿈',
    `the round trip changed a value: ${JSON.stringify(roundTrip[0])}`,
  );
  await page
    .locator('[role=radio]')
    .filter({ hasText: /JSON → CSV/ })
    .click();
  await page.waitForTimeout(250);
  await fill('{"a":1}');
  t.assert(
    (await output.inputValue()).startsWith('a'),
    `a single object became ${JSON.stringify((await output.inputValue()).slice(0, 20))}`,
  );
  await fill('[1,2,3]');
  t.assert(/record|object/i.test(await notice()), `an array of numbers says: ${await notice()}`);

  // ── 9. Copy gives the same text the page shows.
  await page
    .locator('[role=radio]')
    .filter({ hasText: /CSV → JSON/ })
    .click();
  await page.waitForTimeout(250);
  await fill('이름,금액\n김,10');
  await page.getByRole('button', { name: /^Copy/ }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied === (await output.inputValue()), 'the copied text differs from the output on screen');

  // ── 10. A downloaded CSV opens in Excel with the Korean intact: it carries a byte-order mark.
  await page
    .locator('[role=radio]')
    .filter({ hasText: /CSV → JSON/ })
    .click();
  await page.waitForTimeout(250);
  await fill('이름,금액\n김,10');
  await page
    .locator('[role=radio]')
    .filter({ hasText: /JSON → CSV/ })
    .click();
  await page.waitForTimeout(250);
  await fill('[{"이름":"김","금액":10}]');
  const csvDownload = await t.download(() => page.getByRole('button', { name: 'Download' }).click());
  t.assert(csvDownload.name === 'converted.csv', `the CSV download is named ${csvDownload.name}`);
  t.assert(
    csvDownload.bytes[0] === 0xef && csvDownload.bytes[1] === 0xbb && csvDownload.bytes[2] === 0xbf,
    'the downloaded CSV has no byte-order mark, so Excel will show the Korean as mojibake',
  );
  t.assert(csvDownload.bytes.toString('utf8').includes('김'), 'the downloaded CSV lost the Korean text');
  const jsonDownload = await t.download(async () => {
    await page
      .locator('[role=radio]')
      .filter({ hasText: /CSV → JSON/ })
      .click();
    await page.waitForTimeout(250);
    await fill('이름\n김');
    await page.getByRole('button', { name: 'Download' }).click();
  });
  t.assert(jsonDownload.name === 'converted.json', `the JSON download is named ${jsonDownload.name}`);
  t.assert(
    JSON.parse(jsonDownload.bytes.toString('utf8'))[0].이름 === '김',
    'the downloaded JSON lost the Korean text',
  );

  // ── 11. A 1 MB file is converted without freezing the page, and one more keystroke still works.
  const header = '이름,도시,금액,메모';
  const rows = [];
  for (let index = 0; index < 32_000; index += 1) rows.push(`고객${index},서울,${index},"메모 ${index}, 특이사항"`);
  const big = `${header}\n${rows.join('\n')}`;
  t.assert(big.length > 1_000_000, `the sample is only ${big.length} bytes`);
  const started = Date.now();
  // A paste in one step, the way a 1 MB spreadsheet export arrives: set the field and fire input.
  await page.evaluate((text) => {
    const area = document.querySelectorAll('main textarea')[0];
    area.focus();
    area.value = text;
    area.dispatchEvent(new Event('input', { bubbles: true }));
  }, big);
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('main div.rounded-md.bg-surface-2')].some(
        (box) => box.children[1]?.textContent.trim() === 'Rows' && box.children[0]?.textContent.trim() === '32,000',
      ),
    null,
    { timeout: 30_000 },
  );
  const convertedIn = Date.now() - started;
  t.assert(convertedIn < 10_000, `a 1 MB paste took ${convertedIn} ms`);

  // The output box is capped so the page stays usable, and says what it is not showing.
  const shown = (await output.inputValue()).length;
  t.assert(shown < big.length * 2, `the output box holds ${shown} characters`);
  t.assert(
    /Copy and Download include the whole result/.test(await notice()),
    `the capped output has no explanation: ${await notice()}`,
  );
  t.assert((await page.locator('main').innerText()).includes('32,000'), 'the row count is missing for the large file');

  // Typing one more character does not re-parse the megabyte while the key is being handled.
  const typingStarted = Date.now();
  await input.click();
  await page.keyboard.press('Control+Home');
  await page.keyboard.type('A', { delay: 0 });
  const typedIn = Date.now() - typingStarted;
  t.assert(typedIn < 3_000, `one keystroke in a 1 MB file took ${typedIn} ms`);
  t.assert((await page.evaluate(() => 1)) === 1, 'the page stopped answering after a keystroke in a large file');
  await page.waitForTimeout(600);

  // What is downloaded is the whole file, not the capped preview.
  const bigDownload = await t.download(() => page.getByRole('button', { name: 'Download' }).click(), 60_000);
  t.assert(bigDownload.bytes.length > big.length, `the download is only ${bigDownload.bytes.length} bytes`);
  t.assert(JSON.parse(bigDownload.bytes.toString('utf8')).length === 32_000, 'the downloaded JSON is missing rows');

  // ── 12. A pasted file upload is converted too, and the direction follows the extension.
  await page
    .locator('[role=radio]')
    .filter({ hasText: /CSV → JSON/ })
    .click();
  await page.waitForTimeout(250);
  const file = { name: 'customers.json', mimeType: 'application/json', buffer: Buffer.from('[{"이름":"박"}]', 'utf8') };
  await page.setInputFiles('main input[type=file]', file);
  await page.waitForTimeout(400);
  t.assert(
    (await page
      .locator('[role=radio]')
      .filter({ hasText: /JSON → CSV/ })
      .getAttribute('aria-checked')) === 'true',
    'a .json upload did not switch to JSON to CSV',
  );
  t.assert((await output.inputValue()).includes('박'), 'the uploaded file was not converted');

  // ── 13. 375 px, dark: nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);

  // ── 14. The Korean page converts and explains in Korean.
  await page.setViewportSize({ width: 1280, height: 900 });
  await t.open('/ko/csv-json');
  await page.waitForTimeout(400);
  await page
    .locator('[role=radio]')
    .filter({ hasText: /CSV → JSON/ })
    .click();
  await page.waitForTimeout(250);
  await page.locator('main textarea').first().fill('이름,도시\n김,서울');
  await page.waitForTimeout(600);
  const korean = JSON.parse(await page.locator('main textarea').nth(1).inputValue());
  t.assert(korean[0].도시 === '서울', 'the Korean page did not convert');
  t.assert((await page.locator('main').innerText()).includes('행'), 'the Korean page has no row label');
}

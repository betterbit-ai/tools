/**
 * The URL encoder works for the inputs a real searcher brings: Korean text, reserved
 * characters, a full link, and a pasted form value. Every control on the page (direction,
 * scope, swap, query-row edits) must change the visible result, and a malformed percent
 * escape must be explained rather than guessed.
 */

// Independent references for the three scopes.
const component = (text) =>
  encodeURIComponent(text).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const wholeUrl = (text) => encodeURI(text);
const formValue = (text) =>
  encodeURIComponent(text)
    .replace(/[!'()~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');

export default async function (t) {
  const page = t.page;
  await t.open('/url-encoder');

  const input = page.getByRole('textbox', { name: /^Input/ });
  const result = page.getByRole('textbox', { name: /^Result/ });
  const readResult = async () => result.inputValue();

  // A realistic Korean search value with every separator a value can contain.
  const korean = '한글 검색 & a=b/c?d#e 100%';
  await input.fill(korean);
  t.assert((await readResult()) === component(korean), `component encoding of Korean text: got ${await readResult()}`);
  t.assert((await readResult()).includes('%ED%95%9C%EA%B8%80'), 'Korean was not encoded as UTF-8 bytes');

  // Whole URL keeps the link structure readable.
  const link = 'https://example.com/검색?q=한글 검색&page=2#결과';
  await input.fill(link);
  await page.getByRole('radio', { name: 'Whole URL', exact: true }).click();
  t.assert((await readResult()) === wholeUrl(link), `whole-URL encoding: got ${await readResult()}`);

  // Form values use + for spaces and keep * literal, as application/x-www-form-urlencoded does.
  const formText = 'a b&c=d+e*~';
  await input.fill(formText);
  await page.getByRole('radio', { name: 'Form value', exact: true }).click();
  const formEncoded = formValue(formText);
  t.assert((await readResult()) === formEncoded, `form encoding: expected ${formEncoded}, got ${await readResult()}`);
  t.assert(formEncoded.startsWith('a+b%26c%3Dd%2Be'), 'form encoding must turn spaces into + and a literal + into %2B');

  // Decoding the tool's own output returns the original text in every scope.
  for (const scope of ['Component', 'Whole URL', 'Form value']) {
    await input.fill(korean);
    await page.getByRole('radio', { name: scope, exact: true }).click();
    const encoded = await readResult();
    await page.getByRole('radio', { name: 'Decode', exact: true }).click();
    await input.fill(encoded);
    t.assert((await readResult()) === korean, `${scope} decode of its own encoded value: got ${await readResult()}`);
    await page.getByRole('radio', { name: 'Encode', exact: true }).click();
  }
  await page.getByRole('radio', { name: 'Component', exact: true }).click();

  // Malformed input is explained, not silently mangled.
  await page.getByRole('radio', { name: 'Decode', exact: true }).click();
  await input.fill('100%');
  await t.waitForText('The percent sign at character 4 must be followed by two hexadecimal digits.');
  t.assert((await readResult()) === '', 'a malformed percent escape must not produce a result');
  await input.fill('%E0%A4');
  await t.waitForText('This is not valid UTF-8 percent-encoded text.');
  await input.fill('a%20b');
  t.assert((await readResult()) === 'a b', 'decoding a valid escape did not recover the space');
  await page.getByRole('radio', { name: 'Encode', exact: true }).click();

  // The query table: a pasted link is split into decoded rows, and editing a row rebuilds the link.
  const shopLink = 'https://shop.example.com/item?id=42&size=XL#top';
  await input.fill(shopLink);
  const names = page.getByRole('textbox', { name: 'Name', exact: true });
  const values = page.getByRole('textbox', { name: 'Value', exact: true });
  t.assert((await names.count()) === 2, `expected two query rows, got ${await names.count()}`);
  t.assert(
    (await names.nth(0).inputValue()) === 'id' && (await values.nth(0).inputValue()) === '42',
    'first row is wrong',
  );
  t.assert(
    (await names.nth(1).inputValue()) === 'size' && (await values.nth(1).inputValue()) === 'XL',
    'second row is wrong',
  );

  // Typing a new name must reach the rebuilt URL and keep the caret in the field the user is editing.
  await names.nth(0).click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('pid');
  t.assert(
    (await names.nth(0).inputValue()) === 'pid',
    `typing a name lost characters: got ${await names.nth(0).inputValue()}`,
  );
  t.assert(
    (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Name',
    'focus left the name field while typing, so a real edit needs a click per character',
  );
  t.assert(
    (await input.inputValue()) === 'https://shop.example.com/item?pid=42&size=XL#top',
    `editing a name did not rebuild the URL: got ${await input.inputValue()}`,
  );

  // A value with spaces is rebuilt with form-style escaping, and a literal plus survives.
  await values.nth(0).fill('red blue');
  t.assert(
    (await input.inputValue()) === 'https://shop.example.com/item?pid=red+blue&size=XL#top',
    `editing a value did not rebuild the URL: got ${await input.inputValue()}`,
  );
  await values.nth(0).fill('a+b');
  t.assert(
    (await input.inputValue()).includes('pid=a%2Bb'),
    `a literal plus in a value must be %2B, got ${await input.inputValue()}`,
  );

  // The fragment stays after the query, and a parameter without = stays name-only until given a value.
  await input.fill('https://shop.example.com/item?flag&id=42#top');
  t.assert((await names.count()) === 2, 'a name-only parameter was not listed');
  t.assert((await values.nth(0).inputValue()) === '', 'a name-only parameter should show an empty value');
  await values.nth(0).fill('on');
  t.assert(
    (await input.inputValue()) === 'https://shop.example.com/item?flag=on&id=42#top',
    `giving a name-only parameter a value did not add the =: got ${await input.inputValue()}`,
  );

  // Add and remove change the rebuilt link.
  await page.getByRole('button', { name: 'Add parameter', exact: true }).click();
  t.assert((await names.count()) === 3, 'adding a parameter did not add a row');
  await page.getByRole('button', { name: 'Remove', exact: true }).last().click();
  t.assert((await names.count()) === 2, 'removing a parameter did not remove the row');
  await page.getByRole('button', { name: 'Remove', exact: true }).first().click();
  t.assert(
    (await input.inputValue()) === 'https://shop.example.com/item?id=42#top',
    `removing the first parameter left the wrong link: got ${await input.inputValue()}`,
  );

  // An encoded redirect value stays one parameter and is readable in the row.
  const redirect = 'https://app.example.com/cb?next=https%3A%2F%2Fexample.com%2Fnext%3Fa%3D1%26b%3D2';
  await input.fill(redirect);
  t.assert((await names.count()) === 1, `nested URL was split into ${await names.count()} parameters`);
  t.assert(
    (await values.nth(0).inputValue()) === 'https://example.com/next?a=1&b=2',
    `nested value was not decoded as one value: got ${await values.nth(0).inputValue()}`,
  );

  // Swap turns the result into the input and flips the direction.
  await page.getByRole('radio', { name: 'Encode', exact: true }).click();
  await input.fill('a b');
  await page.getByRole('button', { name: 'Use result as input', exact: true }).click();
  t.assert((await input.inputValue()) === 'a%20b', 'swap did not move the result into the input');
  t.assert(
    (await page.getByRole('radio', { name: 'Decode', exact: true }).getAttribute('aria-checked')) === 'true',
    'swap did not flip the direction to Decode',
  );
  t.assert((await readResult()) === 'a b', `decoding after swap: got ${await readResult()}`);
  await page.getByRole('radio', { name: 'Encode', exact: true }).click();

  // Copy puts the visible result on the clipboard.
  await input.fill('값 & 테스트');
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await page.getByRole('button', { name: 'Copied', exact: true }).waitFor({ timeout: 5_000 });
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(clipboard === component('값 & 테스트'), `clipboard held ${clipboard}`);

  // The last input survives a reload.
  await input.fill('https://shop.example.com/item?id=42#top');
  await page.waitForFunction(
    () => localStorage.getItem('tools:url-encoder:input') === 'https://shop.example.com/item?id=42#top',
    undefined,
    { timeout: 5_000 },
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForFunction(
    () => document.querySelector('main textarea')?.value === 'https://shop.example.com/item?id=42#top',
    undefined,
    { timeout: 10_000 },
  );

  // Korean page: the same conversion under the translated labels.
  await t.open('/ko/url-encoder');
  const koInput = page.getByRole('textbox', { name: /^입력/ });
  await koInput.fill('한글 & 값');
  await page.getByRole('radio', { name: '구성 요소', exact: true }).click();
  t.assert(
    (await page.getByRole('textbox', { name: /^결과/ }).inputValue()) === component('한글 & 값'),
    '한국어 페이지의 구성 요소 인코딩 결과가 다릅니다',
  );
  await page.getByRole('radio', { name: '전체 URL', exact: true }).click();
  t.assert(
    (await page.getByRole('textbox', { name: /^결과/ }).inputValue()) === wholeUrl('한글 & 값'),
    '한국어 페이지의 전체 URL 인코딩 결과가 다릅니다',
  );
  await page.getByRole('radio', { name: '디코딩', exact: true }).click();
  await page.getByRole('textbox', { name: /^입력/ }).fill('%EA%B0%92');
  t.assert(
    (await page.getByRole('textbox', { name: /^결과/ }).inputValue()) === '값',
    '한국어 페이지의 디코딩 결과가 다릅니다',
  );

  // The panel fits a 375 px phone and the query rows stay usable there.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('textbox', { name: /^입력/ }).fill('https://shop.example.com/item?id=42&size=XL#top');
  t.assert(
    (await page.getByRole('textbox', { name: '이름', exact: true }).count()) === 2,
    '모바일에서 쿼리 행이 보이지 않습니다',
  );
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

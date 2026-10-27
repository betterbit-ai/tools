/** A real image must remain byte-for-byte identical through each code output. */
export default async function (t) {
  await t.open('/image-to-base64');

  const phonePhoto = await t.image({
    width: 4032,
    height: 3024,
    type: 'image/jpeg',
    name: 'phone photo 12MP.jpg',
  });
  await t.upload(phonePhoto);
  const output = t.page.getByLabel('Ready-to-copy code');
  await output.waitFor({ timeout: 60_000 });
  await t.page.waitForFunction(
    (expected) => document.querySelector('textarea')?.value === expected,
    `data:image/jpeg;base64,${phonePhoto.buffer.toString('base64')}`,
  );

  const dataUri = await output.inputValue();
  t.assert(
    dataUri === `data:image/jpeg;base64,${phonePhoto.buffer.toString('base64')}`,
    'Data URI changed the original photo bytes',
  );
  t.assert((await t.page.getByText('Original size', { exact: true }).count()) === 1, 'source size was not shown');
  t.assert((await t.page.getByText('Base64 size', { exact: true }).count()) === 1, 'encoded size was not shown');

  // The focused HTML radio works with the keyboard, and custom alt text is safely escaped.
  const html = t.page.getByRole('radio', { name: 'HTML' });
  await html.focus();
  await t.page.keyboard.press('Enter');
  const altInput = t.page.getByLabel('Image description (alt text)');
  await altInput.fill('A "quoted" <logo> & emoji 🖼️');
  const htmlOutput = await output.inputValue();
  t.assert(
    htmlOutput.includes('alt="A &quot;quoted&quot; &lt;logo&gt; &amp; emoji 🖼️"'),
    'HTML alt text was not escaped',
  );
  t.assert(htmlOutput.includes(phonePhoto.buffer.toString('base64')), 'HTML output lost image bytes');

  await t.page.getByRole('radio', { name: 'CSS' }).click();
  await t.page.getByLabel('CSS class name').fill('Hero image 2!');
  const cssOutput = await output.inputValue();
  t.assert(cssOutput.startsWith('.hero-image-2 {\n'), 'CSS class was not converted to a safe selector');
  t.assert(cssOutput.includes(phonePhoto.buffer.toString('base64')), 'CSS output lost image bytes');

  await t.click('Copy code');
  await t.waitForText('Copied');

  await t.click('Clear image');
  await t.upload({ name: 'not-an-image.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') });
  await t.waitForText('Choose an image file such as PNG, JPG, WebP, GIF, SVG, AVIF or HEIC.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'invalid-file error was not exposed to assistive technology');

  await t.open('/ko/image-to-base64');
  await t.waitForText('이미지 Base64 변환');
  await t.upload(await t.image({ width: 64, height: 64, type: 'image/png', name: '로고 🖼️.png' }));
  await t.page.getByLabel('바로 복사할 코드').waitFor({ timeout: 30_000 });
  t.assert(
    await t.page.getByText('결과 글자 수', { exact: true }).isVisible(),
    'Korean output metrics were not rendered',
  );

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(await t.page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches), 'dark mode was not active');
}

const PNG_SIGNATURE = '89504e470d0a1a0a';

function pngSize(bytes) {
  if (bytes.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) throw new Error('download is not a PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/** A realistic phone screenshot renders locally with a browser frame and downloads as a bounded PNG. */
export default async function (t) {
  await t.open('/screenshot-beautifier');
  const photo = await t.image({
    width: 4032,
    height: 3024,
    type: 'image/jpeg',
    name: '출시 화면 😀.jpg',
  });
  await t.upload(photo);
  await t.page.getByRole('button', { name: 'Download PNG' }).waitFor({ timeout: 30_000 });
  await t.page.getByLabel('Browser title').fill('제품 출시 😀');
  await t.page.getByRole('radio', { name: 'Dark browser' }).click();
  await t.page.getByRole('radio', { name: '16:9' }).click();
  await t.page.waitForFunction(() => {
    const preview = document.querySelector('img[alt="Preview of the decorated screenshot"]');
    return preview instanceof HTMLImageElement && preview.naturalWidth > 0;
  });
  const download = await t.download(() => t.click('Download PNG'), 120_000);
  const dimensions = pngSize(download.bytes);
  t.assert(download.name === '출시 화면 😀-mockup.png', `Unicode output filename changed to ${download.name}`);
  t.assert(dimensions.width / dimensions.height > 1.7, '16:9 canvas did not create a landscape export');
  t.assert(Math.max(dimensions.width, dimensions.height) <= 4096, 'export exceeded the 4096px safety cap');
  t.assert(download.size > 1000, 'exported PNG is unexpectedly empty');

  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This image could not be rendered.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'unreadable image error was not announced');

  await t.open('/ko/screenshot-beautifier');
  const tiny = await t.image({ width: 320, height: 240, type: 'image/png', name: '화면.png' });
  await t.upload(tiny);
  await t.page.getByRole('button', { name: 'PNG 다운로드' }).waitFor({ timeout: 30_000 });
  t.assert(await t.page.getByText('원본 크기', { exact: true }).isVisible(), 'Korean source dimensions were not shown');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(await t.page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches), 'dark mode was not active');
}

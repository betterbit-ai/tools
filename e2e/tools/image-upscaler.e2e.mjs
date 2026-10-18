/** Phone photos must be accepted (reduced, not rejected), and a small image must upscale to exact 4× size. */
const pngSize = (bytes) => ({ width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });

export default async function (t) {
  await t.open('/image-upscaler');

  // A 12 MP phone photo: reduced to the 2× work size with a note, never "more than … pixels".
  await t.upload(await t.image({ width: 4032, height: 3024, name: 'IMG_0001.jpg' }));
  await t.waitForText(/already large, so the AI works on a 1,825×1,369 copy/);
  await t.waitForText('3650×2738');
  const text = await t.page.locator('main').innerText();
  t.assert(!/more than [\d,]+ pixels/.test(text), 'a 12 MP photo was rejected');

  // A small PNG at 4×: the download is exactly 4× the input.
  await t.upload(await t.image({ width: 320, height: 200, type: 'image/png' }));
  await t.page.getByRole('radio', { name: '4×' }).click();
  await t.click('Upscale with AI');
  const file = await t.download(() => t.click('Download upscaled image', { timeout: 180_000 }), 240_000);
  t.assert(file.name.endsWith('-4x-upscaled.png'), `unexpected file name ${file.name}`);
  const size = pngSize(file.bytes);
  t.assert(size.width === 1280 && size.height === 800, `expected 1280×800, got ${size.width}×${size.height}`);
}

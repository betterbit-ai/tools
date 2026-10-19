/** Real phone photos must produce an exact, cancellable collage without concurrent full-size decodes. */

const JPEG_SIGNATURE = 'ffd8ff';

function jpegSize(bytes) {
  let offset = 2;
  while (offset + 8 < bytes.length) {
    while (offset < bytes.length && bytes[offset] !== 0xff) offset++;
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const length = bytes.readUInt16BE(offset);
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  throw new Error('JPEG dimensions were not found');
}

function padToSize(file, bytes) {
  if (file.buffer.length >= bytes) return file;
  return { ...file, buffer: Buffer.concat([file.buffer, Buffer.alloc(bytes - file.buffer.length)]) };
}

async function transparentPng(page) {
  const base64 = await page.evaluate(async () => {
    const canvas = new OffscreenCanvas(320, 240);
    const context = canvas.getContext('2d');
    context.fillStyle = '#2a6';
    context.fillRect(0, 0, 160, 240);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }
    return btoa(binary);
  });
  return { name: 'transparent.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') };
}

export default async function (t) {
  await t.open('/collage-maker');

  const phone12 = padToSize(
    await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'IMG_12MP.JPG' }),
    4 * 1024 * 1024,
  );
  const phone24 = padToSize(
    await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'IMG_24MP.JPG' }),
    6 * 1024 * 1024,
  );
  const transparent = await transparentPng(t.page);
  const tiny = await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' });
  const panorama = await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'panorama.jpg' });

  // The renderer must hold at most one decoded phone photo at a time.
  await t.page.evaluate(() => {
    const original = window.createImageBitmap.bind(window);
    window.__collageOriginalCreateImageBitmap = original;
    window.__collageActiveDecodes = 0;
    window.__collagePeakDecodes = 0;
    window.__holdFirstCollageDecode = true;
    window.createImageBitmap = async (...args) => {
      window.__collageActiveDecodes++;
      window.__collagePeakDecodes = Math.max(window.__collagePeakDecodes, window.__collageActiveDecodes);
      try {
        const bitmap = await original(...args);
        if (window.__holdFirstCollageDecode) {
          window.__holdFirstCollageDecode = false;
          await new Promise((resolve) => {
            window.__releaseFirstCollageDecode = resolve;
          });
        }
        return bitmap;
      } finally {
        window.__collageActiveDecodes--;
      }
    };
  });

  await t.upload([phone12, phone24, transparent, tiny, panorama]);
  await t.page.waitForFunction(() => window.__collageActiveDecodes === 1);
  await t.page.getByRole('radio', { name: 'Portrait' }).click();
  await t.page.waitForTimeout(100);
  await t.page.evaluate(() => window.__releaseFirstCollageDecode());
  await t.page.getByAltText('Preview of the finished photo collage').waitFor({ timeout: 120_000 });
  t.assert(
    (await t.page.evaluate(() => window.__collagePeakDecodes)) === 1,
    'full-size source images were decoded concurrently',
  );

  const result = await t.download(() => t.click('Download collage'), 180_000);
  t.assert(result.name === 'photo-collage-2400x3000.jpg', `unexpected download name ${result.name}`);
  t.assert(result.bytes.subarray(0, 3).toString('hex') === JPEG_SIGNATURE, 'download is not a JPEG');
  const dimensions = jpegSize(result.bytes);
  t.assert(
    dimensions.width === 2400 && dimensions.height === 3000,
    `expected 2400×3000, got ${dimensions.width}×${dimensions.height}`,
  );
  t.assert(result.size > 1_000, 'downloaded JPEG is unexpectedly empty');
  t.assert(result.size <= dimensions.width * dimensions.height * 4, 'download is larger than raw RGBA output');

  // Encoding can be cancelled. A late canvas callback must never trigger a stale download.
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__collageOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishCollageEncode = () => original.call(this, callback, ...args);
    };
  });
  let downloadsAfterCancel = 0;
  const countDownload = () => downloadsAfterCancel++;
  t.page.on('download', countDownload);
  await t.click('Download collage');
  await t.waitForText('Encoding JPG…', 120_000);
  await t.click('Cancel');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__collageOriginalToBlob;
    window.__finishCollageEncode();
  });
  await t.waitForText('Collage creation cancelled.');
  await t.page.waitForTimeout(500);
  t.page.off('download', countDownload);
  t.assert(downloadsAfterCancel === 0, 'cancelled encoding still triggered a download');

  // The documented 12-photo bound keeps all accepted photos and explains extras visibly.
  await t.click('Clear photos');
  const small = await t.image({ width: 64, height: 64, type: 'image/png', name: 'small.png' });
  await t.upload(
    Array.from({ length: 13 }, (_, index) => ({
      ...small,
      name: `small-${index + 1}.png`,
    })),
  );
  await t.waitForText('A collage can include up to 12 photos. Extra files were not added.');
  t.assert(
    (await t.page.locator('ul[aria-label="Photos in collage order"] > li').count()) === 12,
    'the 12-photo bound did not keep exactly 12 inputs',
  );

  // A corrupt file fails visibly instead of leaving an endless preview status.
  await t.click('Clear photos');
  await t.upload([
    await t.image({ width: 64, height: 64, type: 'image/png', name: 'valid.png' }),
    { name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg') },
  ]);
  await t.waitForText('A photo could not be decoded or the collage could not be encoded.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'render failure was not exposed as an alert');

  // The finished interface remains usable at the required mobile width and in dark mode.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

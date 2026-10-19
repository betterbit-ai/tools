/** Real camera images must crop at exact pixels, keep transparency, and export without hidden stalls. */

const JPEG_SIGNATURE = 'ffd8ff';
const PNG_SIGNATURE = '89504e470d0a1a0a';

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

function imageSize(bytes) {
  if (bytes.subarray(0, 3).toString('hex') === JPEG_SIGNATURE) return jpegSize(bytes);
  if (bytes.subarray(0, 8).toString('hex') === PNG_SIGNATURE) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  throw new Error('download is not a JPEG or PNG');
}

function padToSize(file, bytes) {
  if (file.buffer.length >= bytes) return file;
  return { ...file, buffer: Buffer.concat([file.buffer, Buffer.alloc(bytes - file.buffer.length)]) };
}

async function transparentPng(page) {
  const base64 = await page.evaluate(async () => {
    const canvas = new OffscreenCanvas(800, 600);
    const context = canvas.getContext('2d');
    context.fillStyle = '#2a6';
    context.fillRect(0, 0, 400, 600);
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

async function alphaAt(page, bytes, x, y) {
  return page.evaluate(
    async ({ base64, x, y }) => {
      const binary = atob(base64);
      const data = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([data], { type: 'image/png' }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return context.getImageData(x, y, 1, 1).data[3];
    },
    { base64: bytes.toString('base64'), x, y },
  );
}

function assertImage(t, file, { width, height, signature, maxBytes = width * height * 4 }) {
  const dimensions = imageSize(file.bytes);
  t.assert(
    dimensions.width === width && dimensions.height === height,
    `${file.name} expected ${width}x${height}, got ${dimensions.width}x${dimensions.height}`,
  );
  t.assert(
    file.bytes.subarray(0, signature.length / 2).toString('hex') === signature,
    `${file.name} has the wrong type`,
  );
  t.assert(file.size > 500, `${file.name} is unexpectedly empty`);
  t.assert(file.size <= maxBytes, `${file.name} is larger than uncompressed RGBA pixels`);
}

async function setCrop(t, { x = 0, y = 0, width, height }) {
  await t.page.getByLabel('X (px)').fill(String(x));
  await t.page.getByLabel('Y (px)').fill(String(y));
  await t.page.getByLabel('Width (px)').fill(String(width));
  await t.page.getByLabel('Height (px)').fill(String(height));
}

async function downloadCrop(t, timeout = 180_000) {
  return t.download(() => t.click('Download'), timeout);
}

export default async function (t) {
  await t.open('/image-cropper');

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

  // Exact numeric fields crop a realistic 12 MP photo at the requested native pixels.
  await t.upload(phone12);
  await t.waitForText('3226×2419');
  await setCrop(t, { x: 16, y: 24, width: 1200, height: 900 });
  const result12 = await downloadCrop(t);
  t.assert(result12.name === 'IMG_12MP-crop-1200x900.jpg', `unexpected file name ${result12.name}`);
  assertImage(t, result12, { width: 1200, height: 900, signature: JPEG_SIGNATURE });

  // A full 24 MP phone crop is an everyday input and must keep going in a background tab.
  await t.click('Choose another photo');
  await t.upload(phone24);
  await t.waitForText('4800×3200');
  await setCrop(t, { width: 6000, height: 4000 });
  const foreground = await t.page.context().newPage();
  const result24Promise = t.download(async () => {
    await t.click('Download');
    await foreground.bringToFront();
  }, 240_000);
  const result24 = await result24Promise;
  await t.page.bringToFront();
  await foreground.close();
  assertImage(t, result24, { width: 6000, height: 4000, signature: JPEG_SIGNATURE });

  // Circle PNG output preserves transparent source pixels and adds a transparent mask.
  await t.click('Choose another photo');
  await t.upload(transparent);
  await t.waitForText('640×480');
  await t.page.getByRole('radio', { name: 'Circle' }).click();
  await setCrop(t, { width: 600, height: 600 });
  const transparentResult = await downloadCrop(t);
  assertImage(t, transparentResult, { width: 600, height: 600, signature: PNG_SIGNATURE });
  t.assert((await alphaAt(t.page, transparentResult.bytes, 100, 300)) === 255, 'opaque PNG pixels were lost');
  t.assert((await alphaAt(t.page, transparentResult.bytes, 550, 300)) === 0, 'source PNG transparency was filled');
  t.assert((await alphaAt(t.page, transparentResult.bytes, 10, 10)) === 0, 'circle mask was not transparent');

  // Tiny and unusually wide inputs take the same exact native-pixel path.
  await t.click('Choose another photo');
  await t.upload(tiny);
  await t.waitForText('51×51');
  await setCrop(t, { width: 64, height: 64 });
  const tinyResult = await downloadCrop(t);
  assertImage(t, tinyResult, { width: 64, height: 64, signature: PNG_SIGNATURE });

  await t.click('Choose another photo');
  await t.upload(panorama);
  await t.waitForText('4800×640');
  await setCrop(t, { x: 500, y: 100, width: 5000, height: 600 });
  const panoramaResult = await downloadCrop(t);
  assertImage(t, panoramaResult, { width: 5000, height: 600, signature: JPEG_SIGNATURE });

  // Cancelling a delayed browser encode prevents its late callback from downloading stale output.
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__cropOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishCropEncode = () => original.call(this, callback, ...args);
    };
  });
  let downloadsAfterCancel = 0;
  const countDownload = () => downloadsAfterCancel++;
  t.page.on('download', countDownload);
  await t.click('Download');
  await t.waitForText('Encoding image…');
  await t.click('Cancel');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__cropOriginalToBlob;
    window.__finishCropEncode();
  });
  await t.waitForText('Export cancelled.');
  await t.page.waitForTimeout(500);
  t.page.off('download', countDownload);
  t.assert(downloadsAfterCancel === 0, 'cancelled encoding still downloaded a late result');

  // A browser format fallback is reported instead of downloading mislabeled bytes.
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__cropOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(new Blob(['wrong format'], { type: 'image/png' }));
    };
  });
  await t.click('Download');
  await t.waitForText('The cropped image could not be created.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'format fallback was not exposed as an alert');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__cropOriginalToBlob;
  });

  // The crop area remains keyboard-operable after long exports.
  const cropArea = t.page.getByRole('group', { name: /Crop area/ });
  await cropArea.focus();
  await cropArea.press('ArrowRight');
  t.assert((await t.page.getByLabel('X (px)').inputValue()) === '501', 'arrow key did not nudge the crop by one pixel');

  // Decode and canvas failures are visible rather than console-only or unchanged downloads.
  await t.click('Choose another photo');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg') });
  await t.waitForText('This file can’t be read by your browser.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'decode failure was not exposed as an alert');

  // The interface stays usable at the required mobile width, in dark mode, and by keyboard.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

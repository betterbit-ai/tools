/** Full-resolution redaction must handle ordinary camera images without hidden failures or stale downloads. */

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
    const canvas = new OffscreenCanvas(640, 480);
    const context = canvas.getContext('2d');
    context.fillStyle = '#2a6';
    context.fillRect(0, 0, 320, 480);
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

async function pixelAt(page, bytes, mimeType, x, y) {
  return page.evaluate(
    async ({ base64, mimeType, x, y }) => {
      const binary = atob(base64);
      const data = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([data], { type: mimeType }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return Array.from(context.getImageData(x, y, 1, 1).data);
    },
    { base64: bytes.toString('base64'), mimeType, x, y },
  );
}

async function chooseFormat(t, value) {
  await t.page.getByLabel('Download format').selectOption(value);
}

async function addRegion(t) {
  const button = t.page.getByRole('button', { name: 'Add region' });
  await button.focus();
  await button.press('Enter');
}

async function downloadEdited(t, timeout = 180_000) {
  await t.page.getByRole('button', { name: 'Download edited image' }).waitFor({ timeout: 120_000 });
  return t.download(() => t.click('Download edited image'), timeout);
}

function assertImage(t, file, { width, height, signature, maxBytes = width * height * 4 }) {
  const dimensions = imageSize(file.bytes);
  t.assert(
    dimensions.width === width && dimensions.height === height,
    `${file.name} expected ${width}×${height}, got ${dimensions.width}×${dimensions.height}`,
  );
  t.assert(
    file.bytes.subarray(0, signature.length / 2).toString('hex') === signature,
    `${file.name} has the wrong type`,
  );
  t.assert(file.size > 500, `${file.name} is unexpectedly empty`);
  t.assert(file.size <= maxBytes, `${file.name} is larger than the raw pixel data`);
}

export default async function (t) {
  await t.open('/image-blur-pixelate');

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

  // A normal 12 MP phone photo renders and downloads at its exact source size.
  await t.upload(phone12);
  await t.waitForText('4032');
  await addRegion(t);
  await chooseFormat(t, 'image/jpeg');
  const result12 = await downloadEdited(t);
  t.assert(result12.name === 'IMG_12MP-redacted.jpg', `unexpected file name ${result12.name}`);
  assertImage(t, result12, { width: 4032, height: 3024, signature: JPEG_SIGNATURE });

  // A 24 MP photo completes while its page is in the background instead of relying on throttled timers.
  await t.click('Change image');
  await t.upload(phone24);
  await t.waitForText('6000');
  await addRegion(t);
  await chooseFormat(t, 'image/jpeg');
  const foreground = await t.page.context().newPage();
  const result24Promise = t.download(async () => {
    await t.click('Download edited image');
    await foreground.bringToFront();
  }, 240_000);
  const result24 = await result24Promise;
  await t.page.bringToFront();
  await foreground.close();
  assertImage(t, result24, { width: 6000, height: 4000, signature: JPEG_SIGNATURE });

  // PNG output keeps transparent pixels and native dimensions.
  await t.click('Change image');
  await t.upload(transparent);
  await t.waitForText('640');
  await addRegion(t);
  await chooseFormat(t, 'image/png');
  const transparentResult = await downloadEdited(t);
  assertImage(t, transparentResult, { width: 640, height: 480, signature: PNG_SIGNATURE });
  t.assert((await alphaAt(t.page, transparentResult.bytes, 500, 240)) === 0, 'PNG transparency was filled or lost');

  // Tiny and unusually wide images use the same native-size path.
  await t.click('Change image');
  await t.upload(tiny);
  await t.waitForText('64');
  await addRegion(t);
  const tinyResult = await downloadEdited(t);
  assertImage(t, tinyResult, { width: 64, height: 64, signature: PNG_SIGNATURE });
  const sourceCenter = await pixelAt(t.page, tiny.buffer, 'image/png', 32, 32);
  const outputCenter = await pixelAt(t.page, tinyResult.bytes, 'image/png', 32, 32);
  const sourceCorner = await pixelAt(t.page, tiny.buffer, 'image/png', 5, 5);
  const outputCorner = await pixelAt(t.page, tinyResult.bytes, 'image/png', 5, 5);
  t.assert(sourceCenter.join(',') !== outputCenter.join(','), 'blur did not change pixels inside the selected region');
  t.assert(sourceCorner.join(',') === outputCorner.join(','), 'blur changed pixels outside the selected region');

  await t.click('Change image');
  await t.upload(panorama);
  await t.waitForText('6000');
  await addRegion(t);
  await chooseFormat(t, 'image/jpeg');
  const panoramaResult = await downloadEdited(t);
  assertImage(t, panoramaResult, { width: 6000, height: 800, signature: JPEG_SIGNATURE });

  // Encoding can be cancelled; a late canvas callback must not trigger a stale download.
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__blurOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishBlurEncode = () => original.call(this, callback, ...args);
    };
  });
  let downloadsAfterCancel = 0;
  const countDownload = () => downloadsAfterCancel++;
  t.page.on('download', countDownload);
  await t.click('Download edited image');
  await t.waitForText('Encoding full-size image…');
  await t.click('Cancel');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__blurOriginalToBlob;
    window.__finishBlurEncode();
  });
  await t.waitForText('Export cancelled.');
  await t.page.waitForTimeout(500);
  t.page.off('download', countDownload);
  t.assert(downloadsAfterCancel === 0, 'cancelled encoding still downloaded a late result');

  // A failed temporary pixelation canvas is visible instead of silently exporting an unchanged region.
  await t.page.getByRole('radio', { name: 'Pixelate' }).click();
  await t.page.getByRole('button', { name: 'Download edited image' }).waitFor();
  await t.page.waitForFunction(() =>
    Array.from(document.querySelectorAll('button')).some(
      (button) => button.textContent.trim() === 'Download edited image' && !button.disabled,
    ),
  );
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    window.__blurOriginalGetContext = original;
    HTMLCanvasElement.prototype.getContext = function (...args) {
      if (this.width < 100 && this.height < 100) return null;
      return original.apply(this, args);
    };
  });
  await t.click('Download edited image');
  await t.waitForText('This image could not be rendered.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'pixelation canvas failure was hidden');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.getContext = window.__blurOriginalGetContext;
  });

  // A malformed image fails visibly rather than leaving an empty editor or console-only error.
  await t.click('Change image');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg') });
  await t.waitForText('This image cannot be opened by your browser.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'decode failure was not exposed as an alert');

  // The interface remains usable at the required mobile width and in dark mode.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

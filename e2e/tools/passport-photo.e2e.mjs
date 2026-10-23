const JPEG_SIGNATURE = 'ffd8';

function padToSize(file, bytes) {
  if (file.buffer.length >= bytes) return file;
  return { ...file, buffer: Buffer.concat([file.buffer, Buffer.alloc(bytes - file.buffer.length)]) };
}

function jpegInfo(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('download is not a JPEG');
  let width;
  let height;
  let dpi;
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > bytes.length) break;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) break;
    if (
      marker === 0xe0 &&
      bytes.subarray(offset + 2, offset + 7).equals(Buffer.from('JFIF\0', 'binary')) &&
      bytes[offset + 9] === 1
    ) {
      const xDensity = bytes.readUInt16BE(offset + 10);
      const yDensity = bytes.readUInt16BE(offset + 12);
      if (xDensity === yDensity) dpi = xDensity;
    }
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      height = bytes.readUInt16BE(offset + 3);
      width = bytes.readUInt16BE(offset + 5);
    }
    offset += length;
  }
  if (!width || !height) throw new Error('JPEG dimensions were not found');
  return { width, height, dpi };
}

function assertJpeg(t, file, { width, height, maxBytes = width * height * 4 }) {
  const info = jpegInfo(file.bytes);
  t.assert(file.bytes.subarray(0, 2).toString('hex') === JPEG_SIGNATURE, `${file.name} has the wrong type`);
  t.assert(
    info.width === width && info.height === height,
    `${file.name} is ${info.width}x${info.height}, expected ${width}x${height}`,
  );
  t.assert(info.dpi === 300, `${file.name} has ${info.dpi ?? 'no'} DPI metadata instead of 300 DPI`);
  t.assert(file.size > 500, `${file.name} is unexpectedly empty`);
  t.assert(file.size <= maxBytes, `${file.name} is larger than the promised raw-pixel bound`);
}

async function transparentPng(page) {
  const base64 = await page.evaluate(async () => {
    const canvas = new OffscreenCanvas(1200, 800);
    const context = canvas.getContext('2d');
    context.fillStyle = '#2a6';
    context.fillRect(0, 0, 600, 800);
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

async function pixelAt(page, bytes, x, y) {
  return page.evaluate(
    async ({ base64, x, y }) => {
      const binary = atob(base64);
      const data = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([data], { type: 'image/jpeg' }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return [...context.getImageData(x, y, 1, 1).data];
    },
    { base64: bytes.toString('base64'), x, y },
  );
}

async function waitForPreview(t, timeout = 180_000) {
  await t.page.getByRole('button', { name: 'Download photo', exact: true }).waitFor({ state: 'visible', timeout });
  const button = t.page.getByRole('button', { name: 'Download photo', exact: true });
  await t.page.waitForFunction((element) => !element.disabled, await button.elementHandle(), { timeout });
}

async function replaceAndUpload(t, file) {
  await t.click('Choose another photo');
  await t.upload(file);
}

async function downloadPhoto(t, timeout = 180_000) {
  await waitForPreview(t, timeout);
  return t.download(() => t.click('Download photo'), timeout);
}

/** Real phone photos and unusual images produce cancellable, exact 300-DPI downloads. */
export default async function (t) {
  await t.open('/passport-photo');

  const phone12 = padToSize(
    await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-12mp.jpg' }),
    4 * 1024 * 1024,
  );
  const phone24 = padToSize(
    await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'phone-24mp.jpg' }),
    6 * 1024 * 1024,
  );
  const transparent = await transparentPng(t.page);
  const tiny = await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' });
  const wide = await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' });
  t.assert(
    phone12.buffer.length >= 3 * 1024 * 1024 && phone12.buffer.length <= 6 * 1024 * 1024,
    `12 MP fixture should resemble a 3–6 MB phone JPEG, got ${phone12.buffer.length} bytes`,
  );

  // The main flow creates an exact US 2×2 photo and a physically correct 4×6 print sheet.
  await t.upload(phone12);
  const result12 = await downloadPhoto(t);
  t.assert(result12.name === 'phone-12mp-us-passport-photo.jpg', `unexpected file name ${result12.name}`);
  assertJpeg(t, result12, { width: 602, height: 602, maxBytes: phone12.buffer.length });
  const sheet = await t.download(() => t.click('Download 4 × 6 sheet'), 180_000);
  t.assert(sheet.name === 'phone-12mp-us-passport-print-sheet.jpg', `unexpected sheet name ${sheet.name}`);
  assertJpeg(t, sheet, { width: 1200, height: 1800 });

  // A 24 MP phone photo keeps processing while the tool is behind another tab.
  await replaceAndUpload(t, phone24);
  const foreground = await t.page.context().newPage();
  await foreground.goto('about:blank');
  await foreground.bringToFront();
  await waitForPreview(t, 240_000);
  await t.page.bringToFront();
  await foreground.close();
  const result24 = await t.download(() => t.click('Download photo'), 180_000);
  assertJpeg(t, result24, { width: 602, height: 602, maxBytes: phone24.buffer.length });

  // PNG transparency is honestly flattened to the tool's documented white-background JPEG.
  await replaceAndUpload(t, transparent);
  const transparentResult = await downloadPhoto(t);
  assertJpeg(t, transparentResult, { width: 602, height: 602 });
  const flattenedPixel = await pixelAt(t.page, transparentResult.bytes, 550, 301);
  t.assert(
    flattenedPixel[0] > 245 && flattenedPixel[1] > 245 && flattenedPixel[2] > 245 && flattenedPixel[3] === 255,
    `transparent pixels were not flattened to white: ${flattenedPixel.join(',')}`,
  );

  // Tiny input remains usable but gets a visible quality warning before download.
  await replaceAndUpload(t, tiny);
  await t.waitForText('smaller than the 602 × 602 px output');
  const tinyResult = await downloadPhoto(t);
  assertJpeg(t, tinyResult, { width: 602, height: 602 });

  // An unusually wide image is cropped, not rejected or stretched.
  await replaceAndUpload(t, wide);
  const wideResult = await downloadPhoto(t);
  assertJpeg(t, wideResult, { width: 602, height: 602, maxBytes: wide.buffer.length });

  // A delayed encode exposes progress, can be cancelled, and cannot publish a late stale result.
  await t.click('Choose another photo');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__passportOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishPassportEncode = () => original.call(this, callback, ...args);
    };
  });
  await t.upload({ ...phone24, name: 'cancel-me.jpg' });
  await t.waitForText('Encoding photo…', 120_000);
  await t.click('Cancel');
  await t.waitForText('Preview update cancelled.');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__passportOriginalToBlob;
    window.__finishPassportEncode();
  });
  await t.page.waitForTimeout(500);
  t.assert(
    await t.page.getByRole('button', { name: 'Download photo', exact: true }).isDisabled(),
    'cancelled encoding exposed a late preview result',
  );
  await t.click('Resume preview');
  await waitForPreview(t, 180_000);

  // A browser encoder fallback is explained instead of downloading mislabeled PNG bytes as JPEG.
  await t.click('Choose another photo');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__passportOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(new Blob(['wrong format'], { type: 'image/png' }));
    };
  });
  await t.upload(await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'fallback.jpg' }));
  await t.waitForText('Your browser could not create a JPEG photo.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'format fallback was not exposed as an alert');
  t.assert(
    await t.page.getByRole('button', { name: 'Download photo', exact: true }).isDisabled(),
    'format fallback was offered as a successful download',
  );
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__passportOriginalToBlob;
  });

  // Decode failures stay visible instead of leaving an unchanged or silent preview.
  await t.click('Choose another photo');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg') });
  await t.waitForText('This image could not be read by your browser.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'decode failure was not exposed as an alert');

  // Upload and settings remain keyboard-operable at the required dark-mode mobile width.
  const dropzone = t.page.getByRole('button', { name: /Drop a portrait/ });
  await dropzone.focus();
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.getAttribute('role'))) === 'button',
    'dropzone is not focusable',
  );
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await t.page.evaluate(() => ({
    dark: matchMedia('(prefers-color-scheme: dark)').matches,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.dark, 'dark color scheme was not active');
  t.assert(
    viewport.scrollWidth <= viewport.clientWidth,
    `mobile page overflowed by ${viewport.scrollWidth - viewport.clientWidth}px`,
  );

  // Korean copy describes the tested large-photo, cancellation and JPEG-alpha behavior.
  await t.open('/ko/passport-photo');
  const koreanText = await t.page.locator('main').textContent();
  t.assert(koreanText.includes('1,200만·2,400만 화소'), 'Korean phone-photo guidance is missing');
  t.assert(koreanText.includes('취소'), 'Korean cancellation guidance is missing');
  t.assert(koreanText.includes('흰색으로 채워'), 'Korean transparency behavior is missing');
}

import { unzipSync } from 'fflate';

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

function imageInfo(bytes) {
  if (bytes.subarray(0, 3).toString('hex') === JPEG_SIGNATURE) {
    return { type: 'image/jpeg', ...jpegSize(bytes), hasAlpha: false };
  }
  if (bytes.subarray(0, 8).toString('hex') === PNG_SIGNATURE) {
    return {
      type: 'image/png',
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
      hasAlpha: bytes[25] === 4 || bytes[25] === 6,
    };
  }
  throw new Error('download is not a readable PNG or JPEG');
}

function padToSize(file, bytes) {
  if (file.buffer.length >= bytes) return file;
  return { ...file, buffer: Buffer.concat([file.buffer, Buffer.alloc(bytes - file.buffer.length)]) };
}

async function transparentPng(t) {
  const base64 = await t.page.evaluate(async () => {
    const canvas = new OffscreenCanvas(1200, 800);
    const context = canvas.getContext('2d');
    context.fillStyle = '#286b51';
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

async function alphaSamples(page, bytes) {
  return page.evaluate(async (base64) => {
    const binary = atob(base64);
    const data = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([data], { type: 'image/png' }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let minimum = 255;
    for (let index = 3; index < pixels.length; index += 4) minimum = Math.min(minimum, pixels[index]);
    return {
      minimum,
      top: context.getImageData(400, 100, 1, 1).data[3],
      bottom: context.getImageData(400, 1100, 1, 1).data[3],
    };
  }, bytes.toString('base64'));
}

function entry(files, name) {
  const bytes = files[name];
  if (!bytes) throw new Error(`ZIP is missing ${name}`);
  return Buffer.from(bytes);
}

function assertImage(t, files, expected) {
  const bytes = entry(files, expected.name);
  const info = imageInfo(bytes);
  t.assert(info.type === expected.type, `${expected.name} has type ${info.type}`);
  t.assert(
    info.width === expected.width && info.height === expected.height,
    `${expected.name} is ${info.width}x${info.height}, expected ${expected.width}x${expected.height}`,
  );
  if (expected.alpha !== undefined) {
    t.assert(info.hasAlpha === expected.alpha, `${expected.name} alpha=${info.hasAlpha}, expected ${expected.alpha}`);
  }
  t.assert(bytes.length > 500, `${expected.name} is unexpectedly empty`);
  t.assert(bytes.length <= expected.width * expected.height * 4, `${expected.name} is larger than raw RGBA pixels`);
  return bytes;
}

/** Full-resolution batches rotate without cropping, silent format fallback, or foreground-only progress. */
export default async function (t) {
  await t.open('/image-rotate-flip');

  const phone12 = padToSize(
    await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'IMG_12MP.JPG' }),
    4 * 1024 * 1024,
  );
  const phone24 = padToSize(
    await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'IMG_24MP.JPG' }),
    6 * 1024 * 1024,
  );
  const transparent = await transparentPng(t);
  const tiny = await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' });
  const wide = await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' });
  t.assert(
    phone12.buffer.length >= 3 * 1024 * 1024 && phone12.buffer.length <= 6 * 1024 * 1024,
    `12 MP fixture should resemble a 3–6 MB phone JPEG, got ${phone12.buffer.length} bytes`,
  );

  await t.page.getByRole('radio', { name: '90°' }).click();
  await t.page.getByLabel('Flip horizontally (mirror)').check({ force: true });
  await t.upload([phone12, phone24, transparent, tiny, wide]);

  // A realistic batch must keep processing while another tab is in front.
  const foreground = await t.page.context().newPage();
  await foreground.goto('about:blank');
  await foreground.bringToFront();
  await t.waitForText('Download 5 images as ZIP', 240_000);
  await t.page.bringToFront();
  await foreground.close();

  const pageText = await t.page.locator('main').innerText();
  t.assert(!pageText.includes('could not be'), 'an everyday image failed to rotate');
  const archive = await t.download(() => t.click('Download 5 images as ZIP'), 180_000);
  t.assert(archive.name === 'rotated-images.zip', `unexpected archive name ${archive.name}`);
  const files = unzipSync(archive.bytes);
  t.assert(Object.keys(files).length === 5, `expected 5 ZIP entries, got ${Object.keys(files).length}`);
  assertImage(t, files, {
    name: 'IMG_12MP-rotated.jpg',
    type: 'image/jpeg',
    width: 3024,
    height: 4032,
  });
  assertImage(t, files, {
    name: 'IMG_24MP-rotated.jpg',
    type: 'image/jpeg',
    width: 4000,
    height: 6000,
  });
  const transparentResult = assertImage(t, files, {
    name: 'transparent-rotated.png',
    type: 'image/png',
    width: 800,
    height: 1200,
    alpha: true,
  });
  const alpha = await alphaSamples(t.page, transparentResult);
  t.assert(alpha.minimum === 0, 'transparent PNG pixels were filled or lost');
  t.assert(alpha.top === 0 && alpha.bottom === 255, 'the selected rotation and horizontal flip were not applied');
  assertImage(t, files, { name: 'tiny-rotated.png', type: 'image/png', width: 64, height: 64, alpha: true });
  assertImage(t, files, { name: 'wide-rotated.jpg', type: 'image/jpeg', width: 800, height: 6000 });

  // A delayed encode exposes progress, can be cancelled, and cannot publish a stale result.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__rotateOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishRotateEncode = () => original.call(this, callback, ...args);
    };
  });
  await t.upload({ ...phone24, name: 'cancel-me.jpg' });
  await t.waitForText(/Rotating 1 of 1: cancel-me\.jpg.*Encoding/, 30_000);
  await t.click('Cancel rotation');
  await t.waitForText('Rotation cancelled. Your original files are still available.');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__rotateOriginalToBlob;
    window.__finishRotateEncode();
  });
  await t.page.waitForTimeout(500);
  const cancelledRow = t.page.locator('li', { hasText: 'cancel-me.jpg' });
  t.assert(
    (await cancelledRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'cancelled work exposed a late result',
  );
  await t.click('Resume rotation');
  await cancelledRow
    .getByRole('button', { name: 'Download', exact: true })
    .waitFor({ state: 'visible', timeout: 180_000 });

  // A browser encoder fallback is explained instead of downloading mislabeled bytes.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__rotateOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(new Blob(['wrong format'], { type: 'image/png' }));
    };
  });
  await t.upload(await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'fallback.jpg' }));
  await t.waitForText('Your browser could not encode the selected output format.');
  const fallbackRow = t.page.locator('li', { hasText: 'fallback.jpg' });
  t.assert(await fallbackRow.getByRole('alert').isVisible(), 'format fallback was not exposed as an alert');
  t.assert(
    (await fallbackRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'format fallback was offered as a successful download',
  );
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__rotateOriginalToBlob;
  });

  // Decode failures are visible and attached to the affected file.
  await t.click('Clear all');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This file can’t be read by your browser.');
  t.assert(
    await t.page.locator('li', { hasText: 'broken.jpg' }).getByRole('alert').isVisible(),
    'decode failure was not exposed as an alert',
  );

  // Settings remain keyboard-operable and the panel fits a dark-mode phone viewport.
  const rotation180 = t.page.getByRole('radio', { name: '180°' });
  await rotation180.focus();
  await rotation180.press('Enter');
  t.assert((await rotation180.getAttribute('aria-checked')) === 'true', 'rotation did not change by keyboard');
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

  // Korean copy must describe the same tested batch and phone-photo behavior.
  await t.open('/ko/image-rotate-flip');
  const koreanText = await t.page.locator('main').textContent();
  t.assert(koreanText.includes('50장'), 'Korean batch limit is missing');
  t.assert(koreanText.includes('2,400만 화소'), 'Korean phone-photo guidance is missing');
}

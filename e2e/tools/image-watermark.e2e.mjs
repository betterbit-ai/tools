import { unzipSync } from 'fflate';

function imageInfo(bytes) {
  if (bytes.length >= 26 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return {
      type: 'image/png',
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
      hasAlpha: bytes[25] === 4 || bytes[25] === 6,
    };
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
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
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return {
          type: 'image/jpeg',
          width: bytes.readUInt16BE(offset + 5),
          height: bytes.readUInt16BE(offset + 3),
          hasAlpha: false,
        };
      }
      offset += length;
    }
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
    context.fillStyle = '#5c2d91';
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

async function countOpaquePixels(page, bytes, bounds) {
  return page.evaluate(
    async ({ base64, bounds }) => {
      const binary = atob(base64);
      const data = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([data], { type: 'image/png' }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      const pixels = context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height).data;
      let opaque = 0;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) opaque++;
      return opaque;
    },
    { base64: bytes.toString('base64'), bounds },
  );
}

/** Full-resolution watermarking must be visible, cancellable, and honest for everyday images. */
export default async function (t) {
  await t.open('/image-watermark');

  const phone12 = padToSize(
    await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-12mp.jpg' }),
    4 * 1024 * 1024,
  );
  const phone24 = padToSize(
    await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'phone-24mp.jpg' }),
    6 * 1024 * 1024,
  );
  const transparent = await transparentPng(t);
  const tiny = await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' });
  const wide = await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' });
  t.assert(
    phone12.buffer.length >= 3 * 1024 * 1024 && phone12.buffer.length <= 6 * 1024 * 1024,
    `12 MP fixture should resemble a 3–6 MB phone JPEG, got ${phone12.buffer.length} bytes`,
  );

  await t.upload([phone12, phone24, transparent, tiny, wide]);

  // Processing must continue while another tab is in front.
  await t.waitForText(/Watermarking 1 of 5:/, 30_000);
  const foreground = await t.page.context().newPage();
  await foreground.goto('about:blank');
  await foreground.bringToFront();
  await t.waitForText('Download all (5) as ZIP', 240_000);
  await t.page.bringToFront();
  await foreground.close();

  const pageText = await t.page.locator('main').innerText();
  t.assert(!pageText.includes('could not be watermarked'), 'an everyday image failed to watermark');
  const archive = await t.download(() => t.click('Download all (5) as ZIP'), 180_000);
  t.assert(archive.name === 'watermarked-images.zip', `unexpected archive name ${archive.name}`);
  const files = unzipSync(archive.bytes);
  t.assert(Object.keys(files).length === 5, `expected 5 ZIP entries, got ${Object.keys(files).length}`);
  assertImage(t, files, {
    name: 'phone-12mp-watermarked.jpg',
    type: 'image/jpeg',
    width: 4032,
    height: 3024,
  });
  assertImage(t, files, {
    name: 'phone-24mp-watermarked.jpg',
    type: 'image/jpeg',
    width: 6000,
    height: 4000,
  });
  const transparentResult = assertImage(t, files, {
    name: 'transparent-watermarked.png',
    type: 'image/png',
    width: 1200,
    height: 800,
    alpha: true,
  });
  assertImage(t, files, { name: 'tiny-watermarked.png', type: 'image/png', width: 64, height: 64, alpha: true });
  assertImage(t, files, { name: 'wide-watermarked.jpg', type: 'image/jpeg', width: 6000, height: 800 });
  const markedPixels = await countOpaquePixels(t.page, transparentResult, { x: 700, y: 600, width: 468, height: 168 });
  t.assert(markedPixels > 0, 'the downloaded transparent PNG does not contain the visible bottom-right watermark');

  // A delayed encode exposes progress, can be cancelled, and cannot publish a stale result.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__watermarkOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishWatermarkEncode = () => original.call(this, callback, ...args);
    };
  });
  await t.upload({ ...phone24, name: 'cancel-me.jpg' });
  await t.waitForText(/Watermarking 1 of 1: cancel-me\.jpg.*Encoding/, 30_000);
  await t.click('Cancel watermarking');
  await t.waitForText('Watermarking cancelled. Your original files are still available.');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__watermarkOriginalToBlob;
    window.__finishWatermarkEncode();
  });
  await t.page.waitForTimeout(500);
  const cancelledRow = t.page.locator('li', { hasText: 'cancel-me.jpg' });
  t.assert(
    (await cancelledRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'cancelled work exposed a late result',
  );
  await t.click('Resume watermarking');
  await cancelledRow
    .getByRole('button', { name: 'Download', exact: true })
    .waitFor({ state: 'visible', timeout: 180_000 });

  // A browser encoder fallback is explained instead of downloading mislabeled bytes.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__watermarkOriginalToBlob = original;
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
    HTMLCanvasElement.prototype.toBlob = window.__watermarkOriginalToBlob;
  });

  // Decode failures are visible and attached to the affected file.
  await t.click('Clear all');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This image can’t be read by your browser.');
  t.assert(
    await t.page.locator('li', { hasText: 'broken.jpg' }).getByRole('alert').isVisible(),
    'decode failure was not exposed as an alert',
  );

  // Controls stay keyboard-operable and the panel fits a dark-mode phone viewport.
  const repeatPattern = t.page.getByRole('radio', { name: 'Repeat pattern' });
  await repeatPattern.focus();
  await repeatPattern.press('Enter');
  t.assert((await repeatPattern.getAttribute('aria-checked')) === 'true', 'layout did not change by keyboard');
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

  // Korean copy describes the tested phone-photo path and cancellable one-at-a-time processing.
  await t.open('/ko/image-watermark');
  const koreanText = await t.page.locator('main').textContent();
  t.assert(koreanText.includes('1,200만·2,400만 화소'), 'Korean phone-photo guidance is missing');
  t.assert(koreanText.includes('취소'), 'Korean cancellation guidance is missing');
}

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

async function transparentPng(t) {
  const base64 = await t.page.evaluate(async () => {
    const canvas = new OffscreenCanvas(1200, 800);
    const context = canvas.getContext('2d');
    context.fillStyle = '#5c2d91';
    context.fillRect(0, 0, 600, 800);
    context.fillStyle = 'rgba(25, 180, 130, 0.35)';
    context.beginPath();
    context.arc(800, 400, 280, 0, Math.PI * 2);
    context.fill();
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  });
  return {
    name: 'transparent-logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(base64, 'base64'),
  };
}

async function phoneJpeg(t, width, height, name) {
  const base64 = await t.page.evaluate(
    async ({ width, height }) => {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      const pixels = context.createImageData(width, height);
      let seed = 0x368;
      for (let y = 0, offset = 0; y < height; y++) {
        for (let x = 0; x < width; x++, offset += 4) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          const noise = ((seed >>> 24) & 31) - 15;
          pixels.data[offset] = Math.max(0, Math.min(255, 35 + (x / width) * 170 + noise));
          pixels.data[offset + 1] = Math.max(0, Math.min(255, 55 + (y / height) * 150 + noise));
          pixels.data[offset + 2] = Math.max(0, Math.min(255, 145 - (x / width) * 70 + noise));
          pixels.data[offset + 3] = 255;
        }
      }
      context.putImageData(pixels, 0, 0);
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      return btoa(binary);
    },
    { width, height },
  );
  return { name, mimeType: 'image/jpeg', buffer: Buffer.from(base64, 'base64') };
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
  if (expected.smallerThan) {
    t.assert(bytes.length < expected.smallerThan, `${expected.name} grew to ${bytes.length} bytes`);
  }
}

/** Real phone-sized batches finish as valid, honest downloads without freezing the page. */
export default async function (t) {
  await t.open('/image-resizer');

  const phone12 = await phoneJpeg(t, 4032, 3024, 'phone-12mp.jpg');
  const phone24 = await phoneJpeg(t, 6000, 4000, 'phone-24mp.jpg');
  t.assert(
    phone12.buffer.length >= 3_000_000 && phone12.buffer.length <= 6_000_000,
    `12 MP fixture should resemble a 3–6 MB phone JPEG, got ${phone12.buffer.length} bytes`,
  );
  const transparent = await transparentPng(t);
  const tiny = await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' });
  const wide = await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' });

  await t.page.getByLabel('Don’t enlarge smaller images').check({ force: true });
  await t.page.setInputFiles('input[type=file]', [phone12, phone24, transparent, tiny, wide], { timeout: 120_000 });
  await t.waitForText('Download all (5) as ZIP', 180_000);
  const pageText = await t.page.locator('main').innerText();
  t.assert(!pageText.includes('could not be resized'), 'an everyday image failed to resize');

  const archive = await t.download(() => t.click('Download all (5) as ZIP'), 120_000);
  t.assert(archive.name === 'resized-images.zip', `unexpected archive name ${archive.name}`);
  const files = unzipSync(archive.bytes);
  t.assert(Object.keys(files).length === 5, `expected 5 ZIP entries, got ${Object.keys(files).length}`);
  assertImage(t, files, {
    name: 'phone-12mp-1080x810.jpg',
    type: 'image/jpeg',
    width: 1080,
    height: 810,
    smallerThan: phone12.buffer.length,
  });
  assertImage(t, files, {
    name: 'phone-24mp-1080x720.jpg',
    type: 'image/jpeg',
    width: 1080,
    height: 720,
    smallerThan: phone24.buffer.length,
  });
  assertImage(t, files, {
    name: 'transparent-logo-1080x720.png',
    type: 'image/png',
    width: 1080,
    height: 720,
    alpha: true,
  });
  assertImage(t, files, { name: 'tiny-64x64.png', type: 'image/png', width: 64, height: 64 });
  assertImage(t, files, { name: 'wide-1080x144.jpg', type: 'image/jpeg', width: 1080, height: 144 });

  // Resizing continues while another tab is in front.
  await t.click('Clear all');
  await t.upload({ ...phone12, name: 'background.jpg' });
  await t.waitForText(/Resizing 1 of 1: background\.jpg/, 30_000);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await t.page
    .locator('li', { hasText: 'background.jpg' })
    .getByRole('button', { name: 'Download', exact: true })
    .waitFor({ state: 'visible', timeout: 120_000 });
  await t.page.bringToFront();
  await background.close();

  // A delayed encode exposes progress, can be cancelled, and cannot publish a stale result.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__resizerOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishResizeEncode = () => original.call(this, callback, ...args);
    };
  });
  await t.upload({ ...phone24, name: 'cancel-me.jpg' });
  await t.waitForText(/Resizing 1 of 1: cancel-me\.jpg.*Encoding/, 30_000);
  await t.click('Cancel resizing');
  await t.waitForText('Resizing cancelled. Your original files are still available.');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__resizerOriginalToBlob;
    window.__finishResizeEncode();
  });
  await t.page.waitForTimeout(500);
  const cancelledRow = t.page.locator('li', { hasText: 'cancel-me.jpg' });
  t.assert(
    (await cancelledRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'cancelled work exposed a late result',
  );
  t.assert((await t.page.getByRole('button', { name: 'Resume resizing' }).count()) === 1, 'resume was not offered');
  await t.click('Resume resizing');
  await cancelledRow
    .getByRole('button', { name: 'Download', exact: true })
    .waitFor({ state: 'visible', timeout: 120_000 });

  // A browser encoder fallback is explained instead of downloading mislabeled bytes.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__resizerOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(new Blob(['wrong format'], { type: 'image/png' }));
    };
  });
  await t.upload(await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'fallback.jpg' }));
  await t.waitForText('Your browser could not encode the selected output format.');
  const fallbackRow = t.page.locator('li', { hasText: 'fallback.jpg' });
  t.assert(
    (await fallbackRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'format fallback was offered as a successful download',
  );
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__resizerOriginalToBlob;
  });

  // Decode failures are visible in the affected row.
  await t.click('Clear all');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This file can’t be read by your browser.');

  // Settings stay keyboard-operable and the panel fits a dark-mode phone viewport.
  const percentageMode = t.page.getByRole('radio', { name: 'Percentage' });
  await percentageMode.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await percentageMode.getAttribute('aria-checked')) === 'true', 'resize mode did not change by keyboard');
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

  // Korean copy exposes the tested phone-photo support and bounded batch behavior too.
  await t.open('/ko/image-resizer');
  const koreanText = await t.page.locator('main').textContent();
  t.assert(koreanText.includes('1,200만·2,400만 화소 휴대폰 사진'), 'Korean phone-photo guidance is missing');
}

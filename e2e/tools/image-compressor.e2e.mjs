import { unzipSync } from 'fflate';

function imageInfo(bytes) {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
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
      let seed = 0x365;
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

function byName(files, name) {
  const bytes = files[name];
  if (!bytes) throw new Error(`ZIP is missing ${name}`);
  return Buffer.from(bytes);
}

function assertAllowedSize(t, actual, sourceWidth, sourceHeight, label) {
  const allowed = [1, 0.75, 0.5, 0.35, 0.25].some(
    (scale) =>
      actual.width === Math.max(1, Math.round(sourceWidth * scale)) &&
      actual.height === Math.max(1, Math.round(sourceHeight * scale)),
  );
  t.assert(allowed, `${label} was cropped or resized unexpectedly to ${actual.width}x${actual.height}`);
}

/** Real phone-sized images finish as valid, honest downloads without freezing the page. */
export default async function (t) {
  await t.open('/image-compressor');

  const phone12 = await phoneJpeg(t, 4032, 3024, 'phone-12mp.jpg');
  const phone24 = await phoneJpeg(t, 6000, 4000, 'phone-24mp.jpg');
  t.assert(
    phone12.buffer.length >= 3_000_000 && phone12.buffer.length <= 6_000_000,
    `12 MP fixture should resemble a 3–6 MB phone JPEG, got ${phone12.buffer.length} bytes`,
  );
  const inputs = [
    phone12,
    phone24,
    await transparentPng(t),
    await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' }),
    await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' }),
  ];

  await t.page.setInputFiles('input[type=file]', inputs, { timeout: 120_000 });
  await t.waitForText('Download all (5) as ZIP', 180_000);
  const pageText = await t.page.locator('main').innerText();
  t.assert(!pageText.includes('could not be compressed'), 'an everyday image failed to compress');

  const archive = await t.download(() => t.click('Download all (5) as ZIP'), 120_000);
  t.assert(archive.name === 'compressed-images.zip', `unexpected archive name ${archive.name}`);
  const files = unzipSync(archive.bytes);
  t.assert(Object.keys(files).length === 5, `expected 5 ZIP entries, got ${Object.keys(files).length}`);

  for (const input of inputs) {
    const outputName =
      input.name.replace(/\.[^.]+$/, '-compressed') + (input.mimeType === 'image/jpeg' ? '.jpg' : '.png');
    const output = byName(files, outputName);
    const info = imageInfo(output);
    t.assert(info.type === input.mimeType, `${input.name} became ${info.type}`);
    t.assert(output.length <= 500 * 1024, `${input.name} missed the 500 KB target (${output.length} bytes)`);
    t.assert(
      output.length <= input.buffer.length,
      `${input.name} grew from ${input.buffer.length} to ${output.length} bytes`,
    );
  }

  const twelve = imageInfo(byName(files, 'phone-12mp-compressed.jpg'));
  const twentyFour = imageInfo(byName(files, 'phone-24mp-compressed.jpg'));
  const transparent = imageInfo(byName(files, 'transparent-logo-compressed.png'));
  const tiny = imageInfo(byName(files, 'tiny-compressed.png'));
  const wide = imageInfo(byName(files, 'wide-compressed.jpg'));
  assertAllowedSize(t, twelve, 4032, 3024, '12 MP output');
  assertAllowedSize(t, twentyFour, 6000, 4000, '24 MP output');
  t.assert(
    transparent.width === 1200 && transparent.height === 800 && transparent.hasAlpha,
    `transparent PNG changed unexpectedly (${transparent.width}x${transparent.height}, alpha=${transparent.hasAlpha})`,
  );
  t.assert(tiny.width === 64 && tiny.height === 64, `tiny image changed dimensions to ${tiny.width}x${tiny.height}`);
  assertAllowedSize(t, wide, 6000, 800, 'wide output');

  // Compression must continue when the user switches tabs.
  await t.click('Clear all');
  await t.upload({ ...phone12, name: 'background.jpg' });
  await t.waitForText(/Compressing 1 of 1/, 30_000);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await t.page
    .locator('li', { hasText: 'background.jpg' })
    .getByRole('button', { name: 'Download', exact: true })
    .waitFor({ state: 'visible', timeout: 120_000 });
  await t.page.bringToFront();
  await background.close();

  // A long search exposes progress, can be cancelled, and leaves an explicit retry path.
  await t.click('Clear all');
  await t.page.getByLabel('Target file size').fill('1');
  await t.upload({ ...phone24, name: 'cancel-me.jpg' });
  await t.waitForText(/Compressing 1 of 1: cancel-me\.jpg/, 30_000);
  await t.click('Cancel compression');
  await t.waitForText('Compression cancelled. Your original files are still available.');
  t.assert((await t.page.getByText(/Compressing 1 of 1/).count()) === 0, 'progress remained after cancellation');
  t.assert((await t.page.getByRole('button', { name: 'Retry compression' }).count()) === 1, 'retry was not offered');

  // An unreadable image is explained in its file row rather than failing silently.
  await t.click('Clear all');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This file can’t be read by your browser.');

  // The settings remain keyboard-operable and the panel fits a dark-mode phone viewport.
  const qualityMode = t.page.getByRole('radio', { name: 'Quality slider' });
  await qualityMode.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await qualityMode.getAttribute('aria-checked')) === 'true', 'compression mode did not change by keyboard');
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
}

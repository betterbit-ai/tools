import { unzipSync } from 'fflate';

const PNG_SIGNATURE = '89504e470d0a1a0a';
const JPEG_SIGNATURE = 'ffd8ff';

function imageInfo(bytes) {
  if (bytes.subarray(0, 8).toString('hex') === PNG_SIGNATURE) {
    return {
      type: 'image/png',
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
      hasAlpha: bytes[25] === 4 || bytes[25] === 6,
    };
  }

  if (bytes.subarray(0, 3).toString('hex') === JPEG_SIGNATURE) {
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
    context.fillStyle = '#563d7c';
    context.fillRect(0, 0, 600, 800);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }
    return btoa(binary);
  });
  return { name: 'transparent-logo.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') };
}

function byName(files, name) {
  const bytes = files[name];
  if (!bytes) throw new Error(`ZIP is missing ${name}`);
  return Buffer.from(bytes);
}

async function alphaAt(t, bytes, x, y) {
  return t.page.evaluate(
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

/** Real phone photos and unusual dimensions convert in a batch with visible, cancellable work. */
export default async function (t) {
  await t.open('/image-converter');

  const phone12 = padToSize(
    await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-12mp.jpg' }),
    4 * 1024 * 1024,
  );
  const phone24 = padToSize(
    await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'phone-24mp.jpg' }),
    6 * 1024 * 1024,
  );
  const transparent = await transparentPng(t);
  const inputs = [
    phone12,
    phone24,
    transparent,
    await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' }),
    await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' }),
  ];
  t.assert(
    phone12.buffer.length >= 3 * 1024 * 1024 && phone12.buffer.length <= 6 * 1024 * 1024,
    `12 MP fixture should be 3–6 MB, got ${phone12.buffer.length} bytes`,
  );

  await t.page.getByLabel('Convert to').selectOption('image/jpeg');
  await t.page.setInputFiles('input[type=file]', inputs, { timeout: 120_000 });
  const firstOutcome = await t.waitForText(/too large|Converting 1 of 5/, 120_000);
  t.assert(!firstOutcome.includes('too large'), 'an ordinary 24 MP phone photo was rejected');

  // Conversion continues while another tab is in front; MessageChannel yields are not timer-throttled.
  const foreground = await t.page.context().newPage();
  await foreground.goto('about:blank');
  await foreground.bringToFront();
  await t.page.getByRole('button', { name: 'Download all (5) as ZIP' }).waitFor({ timeout: 240_000 });
  await t.page.bringToFront();
  await foreground.close();

  const pageText = await t.page.locator('main').innerText();
  t.assert(!pageText.includes('could not be converted'), 'an everyday image failed without a usable result');
  const archive = await t.download(() => t.click('Download all (5) as ZIP'), 180_000);
  t.assert(archive.name === 'converted-images.zip', `unexpected archive name ${archive.name}`);
  const files = unzipSync(archive.bytes);
  t.assert(Object.keys(files).length === 5, `expected 5 ZIP entries, got ${Object.keys(files).length}`);

  const expected = [
    ['phone-12mp.jpg', 4032, 3024],
    ['phone-24mp.jpg', 6000, 4000],
    ['transparent-logo.jpg', 1200, 800],
    ['tiny.jpg', 64, 64],
    ['wide.jpg', 6000, 800],
  ];
  for (const [name, width, height] of expected) {
    const output = byName(files, name);
    const info = imageInfo(output);
    t.assert(info.type === 'image/jpeg', `${name} has type ${info.type}`);
    t.assert(
      info.width === width && info.height === height,
      `${name} expected ${width}×${height}, got ${info.width}×${info.height}`,
    );
    t.assert(output.length > 500, `${name} is unexpectedly empty`);
    t.assert(output.length <= width * height * 4, `${name} is larger than uncompressed RGBA pixels`);
  }

  // PNG output retains transparent pixels and exact dimensions.
  await t.click('Clear all');
  await t.page.getByLabel('Convert to').selectOption('image/png');
  await t.upload(transparent);
  await t.page.getByRole('button', { name: 'Download', exact: true }).last().waitFor({ timeout: 60_000 });
  const png = await t.download(() => t.page.getByRole('button', { name: 'Download', exact: true }).last().click());
  const pngInfo = imageInfo(png.bytes);
  t.assert(pngInfo.type === 'image/png', `transparent output has type ${pngInfo.type}`);
  t.assert(pngInfo.width === 1200 && pngInfo.height === 800, 'transparent PNG dimensions changed');
  t.assert(pngInfo.hasAlpha && (await alphaAt(t, png.bytes, 1000, 400)) === 0, 'PNG transparency was lost');

  // A user can cancel a pending encode; its late callback must not publish a stale download.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__converterOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      if (this.width > 500) window.__finishConverterEncode = () => original.call(this, callback, ...args);
      else original.call(this, callback, ...args);
    };
  });
  await t.upload(await t.image({ width: 1200, height: 800, type: 'image/jpeg', name: 'cancel-me.jpg' }));
  await t.waitForText(/Converting 1 of 1: cancel-me\.jpg/);
  await t.page.waitForFunction(() => typeof window.__finishConverterEncode === 'function');
  await t.click('Cancel conversion');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__converterOriginalToBlob;
    window.__finishConverterEncode();
  });
  await t.waitForText('Conversion cancelled. Your original files are still available.');
  t.assert((await t.page.getByRole('button', { name: 'Retry conversion' }).count()) === 1, 'retry was not offered');
  const cancelledRow = t.page.locator('li', { hasText: 'cancel-me.jpg' });
  t.assert(
    (await cancelledRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'cancelled output became downloadable',
  );

  // Decode and encode errors are explained instead of being swallowed.
  await t.click('Clear all');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This file can’t be read by your browser.');

  // Keyboard controls remain usable at the required dark-mode phone viewport.
  const format = t.page.getByLabel('Convert to');
  await format.focus();
  await t.page.keyboard.press('Home');
  await t.page.keyboard.press('ArrowDown');
  t.assert((await format.inputValue()) === 'image/png', 'format could not be changed with the keyboard');
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

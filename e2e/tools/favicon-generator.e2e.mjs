/** Real phone photos and unusual images must produce a complete, honest favicon package. */

import { unzipSync } from 'fflate';

const PNG_SIGNATURE = '89504e470d0a1a0a';
const EXPECTED_PNGS = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'favicon-48x48.png': 48,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
};

function jpegAtLeast(file, targetBytes) {
  const segments = [];
  let size = file.buffer.length;
  while (size < targetBytes) {
    const payloadLength = Math.min(65_533, targetBytes - size - 4);
    if (payloadLength <= 0) break;
    const segment = Buffer.alloc(payloadLength + 4);
    segment[0] = 0xff;
    segment[1] = 0xfe;
    segment.writeUInt16BE(payloadLength + 2, 2);
    segment.fill(0x61, 4);
    segments.push(segment);
    size += segment.length;
  }
  return { ...file, buffer: Buffer.concat([file.buffer.subarray(0, 2), ...segments, file.buffer.subarray(2)]) };
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

function assertPackage(t, archive, sourceName) {
  t.assert(archive.name === 'favicon-package.zip', `${sourceName}: unexpected archive name ${archive.name}`);
  t.assert(archive.bytes.subarray(0, 4).toString('hex') === '504b0304', `${sourceName}: download is not a ZIP`);
  const files = unzipSync(archive.bytes);
  for (const [name, expectedSize] of Object.entries(EXPECTED_PNGS)) {
    const bytes = Buffer.from(files[name] ?? []);
    t.assert(bytes.subarray(0, 8).toString('hex') === PNG_SIGNATURE, `${sourceName}: ${name} is not a PNG`);
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    t.assert(
      width === expectedSize && height === expectedSize,
      `${sourceName}: ${name} expected ${expectedSize}×${expectedSize}, got ${width}×${height}`,
    );
    t.assert(bytes.length <= expectedSize * expectedSize * 4 + 65_536, `${sourceName}: ${name} exceeds raw RGBA size`);
  }
  const ico = Buffer.from(files['favicon.ico'] ?? []);
  t.assert(ico.readUInt16LE(0) === 0 && ico.readUInt16LE(2) === 1, `${sourceName}: favicon.ico header is invalid`);
  t.assert(ico.readUInt16LE(4) === 3, `${sourceName}: favicon.ico does not contain three frames`);
  t.assert(
    [16, 32, 48].every((size, index) => ico[6 + index * 16] === size && ico[7 + index * 16] === size),
    `${sourceName}: favicon.ico frame dimensions are wrong`,
  );
  const manifest = JSON.parse(Buffer.from(files['site.webmanifest'] ?? []).toString('utf8'));
  t.assert(manifest.name === 'Audit Site', `${sourceName}: site.webmanifest lost the website name`);
  return files;
}

async function uploadAndDownload(t, file, sourceName) {
  await t.upload(file);
  await t.page.getByRole('button', { name: 'Download favicon package' }).waitFor({ timeout: 120_000 });
  const archive = await t.download(() => t.click('Download favicon package'), 120_000);
  return assertPackage(t, archive, sourceName);
}

export default async function (t) {
  await t.open('/favicon-generator');
  await t.page.getByRole('radio', { name: 'Image' }).click();
  await t.page.getByLabel('Website name').fill('Audit Site');

  const phone12 = jpegAtLeast(
    await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'IMG_12MP.JPG' }),
    4 * 1024 * 1024,
  );
  await uploadAndDownload(t, phone12, '12 MP JPEG');

  const phone24 = jpegAtLeast(
    await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'IMG_24MP.JPG' }),
    6 * 1024 * 1024,
  );
  await t.upload(phone24);
  const foreground = await t.page.context().newPage();
  await foreground.goto('about:blank');
  await foreground.bringToFront();
  await t.page.getByRole('button', { name: 'Download favicon package' }).waitFor({ timeout: 120_000 });
  await t.page.bringToFront();
  await foreground.close();
  assertPackage(t, await t.download(() => t.click('Download favicon package'), 120_000), '24 MP background-tab JPEG');

  await t.page.getByText('Transparent background', { exact: true }).click();
  const transparentFiles = await uploadAndDownload(t, await transparentPng(t.page), 'transparent PNG');
  const transparent512 = Buffer.from(transparentFiles['android-chrome-512x512.png']);
  t.assert((await alphaAt(t.page, transparent512, 170, 256)) > 0, 'transparent PNG lost its opaque pixels');
  t.assert((await alphaAt(t.page, transparent512, 340, 256)) === 0, 'transparent PNG had transparency filled');

  await uploadAndDownload(
    t,
    await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' }),
    '64×64 PNG',
  );

  const panoramaFiles = await uploadAndDownload(
    t,
    await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'panorama.jpg' }),
    '6000×800 JPEG',
  );
  const panorama512 = Buffer.from(panoramaFiles['android-chrome-512x512.png']);
  t.assert((await alphaAt(t.page, panorama512, 256, 256)) > 0, 'contain mode lost the panorama content');
  t.assert((await alphaAt(t.page, panorama512, 256, 64)) === 0, 'contain mode cropped or stretched the panorama');

  // A replacement invalidates the prior package immediately. Encoding can be cancelled,
  // and its late callback must not expose stale output.
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__restoreFaviconToBlob = () => {
      HTMLCanvasElement.prototype.toBlob = original;
    };
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      const canvas = this;
      window.__finishFaviconEncode = () => original.call(canvas, callback, ...args);
    };
  });
  await t.upload(await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'cancel.jpg' }));
  await t.waitForText(/Making icon 1 of 6…/);
  t.assert(
    !(await t.page.getByRole('button', { name: 'Download favicon package' }).isVisible()),
    'a stale package remained downloadable while a replacement was rendering',
  );
  await t.page.waitForFunction(() => typeof window.__finishFaviconEncode === 'function');
  await t.click('Cancel processing');
  await t.page.evaluate(() => {
    window.__restoreFaviconToBlob();
    window.__finishFaviconEncode();
  });
  await t.waitForText('Favicon rendering cancelled. Your image remains on this device.');
  await t.page.waitForTimeout(500);
  t.assert(
    !(await t.page.getByRole('button', { name: 'Download favicon package' }).isVisible()),
    'cancelled encoding exposed a late favicon package',
  );

  // ZIP preparation errors are shown to the user instead of becoming an unhandled click rejection.
  await t.upload(await t.image({ width: 320, height: 240, type: 'image/png', name: 'package-error.png' }));
  await t.page.getByRole('button', { name: 'Download favicon package' }).waitFor({ timeout: 120_000 });
  await t.page.evaluate(() => {
    const original = Blob.prototype.arrayBuffer;
    window.__restoreFaviconArrayBuffer = () => {
      Blob.prototype.arrayBuffer = original;
    };
    Blob.prototype.arrayBuffer = function () {
      if (this instanceof File) return original.call(this);
      return Promise.reject(new Error('simulated package read failure'));
    };
  });
  await t.click('Download favicon package');
  await t.waitForText('The favicon package could not be prepared. Try again.');
  await t.page.evaluate(() => window.__restoreFaviconArrayBuffer());
  t.assert(await t.page.getByRole('alert').isVisible(), 'package preparation failure was hidden');

  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg') });
  await t.waitForText('This image could not be read. Try a PNG, JPG, or WebP file.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'corrupt image failure was hidden');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

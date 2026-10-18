/** Real phone photos and unusual aspect ratios must export as honest, uncropped PNGs. */

const PNG_SIGNATURE = '89504e470d0a1a0a';
const MAX_OUTPUT_PIXELS = 16_000_000;
const MAX_OUTPUT_DIMENSION = 8_192;

function constrainedSize(width, height) {
  const scale = Math.min(
    1,
    Math.sqrt(MAX_OUTPUT_PIXELS / (width * height)),
    MAX_OUTPUT_DIMENSION / width,
    MAX_OUTPUT_DIMENSION / height,
  );
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}

function assertPng(t, file, expected, sourceName) {
  t.assert(file.bytes.subarray(0, 8).toString('hex') === PNG_SIGNATURE, `${sourceName} did not download as PNG`);
  const width = file.bytes.readUInt32BE(16);
  const height = file.bytes.readUInt32BE(20);
  t.assert(
    width === expected.width && height === expected.height,
    `${sourceName} expected ${expected.width}×${expected.height}, got ${width}×${height}`,
  );
  t.assert(width * height <= MAX_OUTPUT_PIXELS, `${sourceName} exceeded the documented memory-safe pixel limit`);
  t.assert(file.size > 100, `${sourceName} produced an empty PNG`);
}

async function uploadAndDownload(t, image, expected = constrainedSize(image.width, image.height)) {
  await t.upload(image.file);
  await t.waitForText(`Using image: ${image.file.name}`, 60_000);
  const result = await t.download(() => t.click('Download PNG'), 120_000);
  t.assert(result.name === `${image.file.name.replace(/\.[^.]+$/, '')}-meme.png`, `unexpected name ${result.name}`);
  assertPng(t, result, expected, image.file.name);
  return result;
}

async function transparentPng(page, width, height) {
  const b64 = await page.evaluate(
    async ({ width, height }) => {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      context.fillStyle = '#2a6';
      context.fillRect(0, 0, width / 2, height);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      return btoa(binary);
    },
    { width, height },
  );
  return {
    width,
    height,
    file: { name: 'transparent-overlay.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') },
  };
}

async function alphaAt(page, bytes, x, y) {
  return page.evaluate(
    async ({ b64, x, y }) => {
      const binary = atob(b64);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return context.getImageData(x, y, 1, 1).data[3];
    },
    { b64: bytes.toString('base64'), x, y },
  );
}

export default async function (t) {
  await t.open('/meme-generator');

  // Native image decoding cannot be interrupted mid-call, but Cancel must immediately stop waiting
  // and discard the decoder's eventual result instead of silently replacing the current canvas.
  await t.page.evaluate(() => {
    const original = window.createImageBitmap.bind(window);
    window.__originalCreateImageBitmap = window.createImageBitmap;
    window.createImageBitmap = (...args) =>
      new Promise((resolve, reject) => {
        window.__finishImageDecode = () => original(...args).then(resolve, reject);
      });
  });
  const cancelled = await t.image({ width: 64, height: 64, type: 'image/png', name: 'cancelled.png' });
  await t.upload(cancelled);
  await t.waitForText('Reading and preparing the image…');
  await t.click('Cancel');
  await t.page.evaluate(() => {
    window.createImageBitmap = window.__originalCreateImageBitmap;
    window.__finishImageDecode();
  });
  await t.page.waitForTimeout(300);
  t.assert(
    !(await t.page.locator('main').innerText()).includes('Using image: cancelled.png'),
    'cancelled decode was used',
  );

  // Ordinary 12 MP and 24 MP phone photos work. The smaller photo stays full-size;
  // the larger one is reduced proportionally to the documented 16 MP canvas bound.
  for (const input of [
    { width: 4032, height: 3024, name: 'IMG_4032.JPG' },
    { width: 6000, height: 4000, name: 'IMG_24MP.JPG' },
  ]) {
    const file = await t.image({ ...input, type: 'image/jpeg' });
    await uploadAndDownload(t, { ...input, file });
    const output = constrainedSize(input.width, input.height);
    const expectedPreview = constrainedSizeForPreview(output.width, output.height);
    await t.page.waitForFunction(({ width, height }) => {
      const canvas = document.querySelector('canvas');
      return canvas?.width === width && canvas?.height === height;
    }, expectedPreview);
    const pageText = await t.page.locator('main').innerText();
    if (input.width === 4032) {
      t.assert(!pageText.includes('Large image reduced from'), '12 MP image was incorrectly reported as reduced');
    } else {
      t.assert(
        pageText.includes(`Large image reduced from 6000×4000 to ${output.width}×${output.height} pixels`),
        '24 MP downscaling was not explained with exact output dimensions',
      );
    }
  }

  // Transparency survives the complete upload/render/download path.
  const transparent = await transparentPng(t.page, 320, 240);
  const transparentResult = await uploadAndDownload(t, transparent);
  t.assert(
    (await alphaAt(t.page, transparentResult.bytes, 300, 120)) === 0,
    'transparent source pixels became opaque in the PNG export',
  );

  // Tiny and very wide images keep their exact dimensions instead of being enlarged or cropped.
  for (const input of [
    { width: 64, height: 64, name: 'tiny.png', type: 'image/png' },
    { width: 6000, height: 800, name: 'panorama.jpg', type: 'image/jpeg' },
  ]) {
    const file = await t.image(input);
    await uploadAndDownload(t, { ...input, file });
  }

  // Saving yields before full-resolution work, paints a status, and lets the user cancel a pending encoder.
  let downloadsAfterCancel = 0;
  const countCancelledDownload = () => downloadsAfterCancel++;
  t.page.on('download', countCancelledDownload);
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__originalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishPngEncode = () => original.call(this, callback, ...args);
    };
  });
  await t.click('Download PNG');
  await t.waitForText('Creating PNG…');
  await t.click('Cancel');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__originalToBlob;
    window.__finishPngEncode();
  });
  await t.page.waitForTimeout(500);
  t.page.off('download', countCancelledDownload);
  t.assert(downloadsAfterCancel === 0, 'cancelled PNG encoding still triggered a download');

  // Corrupt input fails visibly and leaves the last good image available.
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg') });
  await t.waitForText('This image can’t be read by your browser.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'decode failure was not exposed as an alert');

  // The blank preset is also a complete path, and the final UI remains usable on a phone in dark mode.
  await t.page.getByRole('radio', { name: 'Square 1:1' }).click();
  const square = await t.download(() => t.click('Download PNG'));
  assertPng(t, square, { width: 1080, height: 1080 }, 'square blank canvas');
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(
    (await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );
}

function constrainedSizeForPreview(width, height) {
  const scale = Math.min(1, Math.sqrt(2_000_000 / (width * height)), 2_048 / width, 2_048 / height);
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}

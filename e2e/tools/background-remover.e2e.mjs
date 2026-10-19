/** Real phone photos and unusual inputs must become honest, full-size transparent PNGs. */

const PNG_SIGNATURE = '89504e470d0a1a0a';

function assertPng(t, file, expected, sourceName) {
  t.assert(file.bytes.subarray(0, 8).toString('hex') === PNG_SIGNATURE, `${sourceName} did not download as PNG`);
  const width = file.bytes.readUInt32BE(16);
  const height = file.bytes.readUInt32BE(20);
  t.assert(
    width === expected.width && height === expected.height,
    `${sourceName} expected ${expected.width}×${expected.height}, got ${width}×${height}`,
  );
  t.assert(file.size > 100, `${sourceName} produced an empty PNG`);
  t.assert(file.size <= width * height * 4 + 65_536, `${sourceName} PNG is unexpectedly larger than raw RGBA pixels`);
}

async function removeAndDownload(t, input) {
  await t.upload(input.file);
  await t.waitForText(`${input.width}×${input.height}`, 60_000);
  await t.click('Remove background');
  await t.page.getByRole('button', { name: 'Download transparent PNG' }).waitFor({ timeout: 240_000 });
  const result = await t.download(() => t.click('Download transparent PNG'));
  const stem = input.file.name.replace(/\.[^/.]+$/, '');
  t.assert(result.name === `${stem}-background-removed.png`, `unexpected download name ${result.name}`);
  assertPng(t, result, input, input.file.name);
  return result;
}

async function transparentPng(page, width, height) {
  const base64 = await page.evaluate(
    async ({ width, height }) => {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      context.fillStyle = '#2a6';
      context.fillRect(0, 0, width / 2, height);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      }
      return btoa(binary);
    },
    { width, height },
  );
  return {
    width,
    height,
    file: {
      name: 'transparent-subject.png',
      mimeType: 'image/png',
      buffer: Buffer.from(base64, 'base64'),
    },
  };
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

export default async function (t) {
  await t.open('/background-remover');

  // Ordinary 12 MP and 24 MP phone photos both finish at their exact source dimensions.
  for (const input of [
    { width: 4032, height: 3024, type: 'image/jpeg', name: 'IMG_12MP.JPG' },
    { width: 6000, height: 4000, type: 'image/jpeg', name: 'IMG_24MP.JPG' },
  ]) {
    const file = await t.image(input);
    await removeAndDownload(t, { ...input, file });
    const text = await t.page.locator('main').innerText();
    t.assert(!text.includes('Choose a smaller image'), `${input.name} was rejected as too large`);
  }

  // Existing transparency is never filled in by the segmentation/export path.
  const transparent = await transparentPng(t.page, 320, 240);
  const transparentResult = await removeAndDownload(t, transparent);
  t.assert((await alphaAt(t.page, transparentResult.bytes, 300, 120)) === 0, 'transparent source pixels became opaque');

  // Tiny images and wide panoramas are not enlarged, cropped, or distorted.
  for (const input of [
    { width: 64, height: 64, type: 'image/png', name: 'tiny.png' },
    { width: 6000, height: 800, type: 'image/jpeg', name: 'panorama.jpg' },
  ]) {
    const file = await t.image(input);
    await removeAndDownload(t, { ...input, file });
  }

  // The engine used for the completed result is disclosed instead of silently falling back.
  await t.waitForText(/WebGPU|WASM/, 10_000);

  // A corrupt image fails visibly, while the previous successful result remains available.
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg') });
  await t.waitForText('This image cannot be read by your browser.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'decode failure was not exposed as an alert');
  t.assert(
    await t.page.getByRole('button', { name: 'Download transparent PNG' }).isVisible(),
    'a failed replacement discarded the last successful result',
  );

  // Cancel during asynchronous PNG encoding discards the late callback and never exposes stale output.
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__originalBackgroundRemoverToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishBackgroundRemoverEncode = () => original.call(this, callback, ...args);
    };
  });
  const encodingCancel = await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'encode.jpg' });
  await t.upload(encodingCancel);
  await t.click('Remove background');
  await t.waitForText('Creating the full-size transparent PNG…', 240_000);
  await t.click('Cancel processing');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__originalBackgroundRemoverToBlob;
    window.__finishBackgroundRemoverEncode();
  });
  await t.page.waitForTimeout(500);
  t.assert(
    !(await t.page.getByRole('button', { name: 'Download transparent PNG' }).isVisible()),
    'cancelled PNG encoding exposed a stale result',
  );

  // A model/network failure is explained visibly instead of looking like a stuck button.
  await t.page.route('**/models/u2netp.onnx', (route) => route.fulfill({ status: 503, body: 'unavailable' }));
  const failedModel = await t.image({ width: 64, height: 64, type: 'image/png', name: 'model-error.png' });
  await t.upload(failedModel);
  await t.click('Remove background');
  await t.waitForText('The local AI model could not finish.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'model failure was not exposed as an alert');
  await t.page.unroute('**/models/u2netp.onnx');

  // Work can be cancelled immediately, even while the model response is still pending.
  await t.page.route('**/models/u2netp.onnx', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5_000));
    await route.continue();
  });
  const cancellable = await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'cancel.jpg' });
  await t.upload(cancellable);
  await t.click('Remove background');
  await t.waitForText('Reading the image on this device…');
  await t.click('Cancel processing');
  await t.page.waitForTimeout(300);
  t.assert(
    !(await t.page.getByRole('button', { name: 'Cancel processing' }).isVisible()),
    'cancelled processing remained active',
  );

  // The finished interface remains usable at the required mobile width and in dark mode.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

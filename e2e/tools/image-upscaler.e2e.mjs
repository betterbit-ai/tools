const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function pngInfo(bytes) {
  if (bytes.length < 26 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('download is not a readable PNG');
  }
  return {
    type: 'image/png',
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    hasAlpha: bytes[25] === 4 || bytes[25] === 6,
  };
}

async function phoneJpeg(t, width, height, name) {
  const base64 = await t.page.evaluate(
    async ({ width, height }) => {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      const pixels = context.createImageData(width, height);
      let seed = 0x388;
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
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      }
      return btoa(binary);
    },
    { width, height },
  );
  return { name, mimeType: 'image/jpeg', buffer: Buffer.from(base64, 'base64') };
}

async function transparentPng(t) {
  const base64 = await t.page.evaluate(async () => {
    const canvas = new OffscreenCanvas(96, 64);
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(24, 8, 88, 56);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#db2777');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(56, 32, 28, 0, Math.PI * 2);
    context.fill();
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

async function assertAccepted(t, file, dimensionText) {
  await t.upload(file);
  await t.waitForText(file.name, 120_000);
  await t.waitForText(dimensionText, 120_000);
  const text = await t.page.locator('main').innerText();
  t.assert(!text.includes('Choose a smaller image first.'), `${file.name} was rejected`);
}

/** Real phone photos are accepted, and real AI output remains honest, responsive and downloadable. */
export default async function (t) {
  await t.open('/image-upscaler');

  // Routing from the start disables Chromium's HTTP cache, allowing a later model-load failure check.
  let failModel = false;
  await t.page.route('**/models/realesr-general-x4v3-dyn.onnx', (route) =>
    failModel ? route.abort('failed') : route.continue(),
  );

  const phone12 = await phoneJpeg(t, 4032, 3024, 'phone-12mp.jpg');
  const phone24 = await phoneJpeg(t, 6000, 4000, 'phone-24mp.jpg');
  t.assert(
    phone12.buffer.length >= 3_000_000 && phone12.buffer.length <= 6_000_000,
    `12 MP fixture should resemble a 3–6 MB phone JPEG, got ${phone12.buffer.length} bytes`,
  );
  const transparent = await transparentPng(t);
  const tiny = await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' });
  const wide = await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' });

  await assertAccepted(t, phone12, '4,032×3,024');
  await t.waitForText(/AI works on a 1,825×1,369 copy/);
  await t.waitForText('3650×2738');
  await assertAccepted(t, phone24, '6,000×4,000');
  await assertAccepted(t, wide, '6,000×800');
  await assertAccepted(t, tiny, '64×64');
  await assertAccepted(t, transparent, '96×64');

  // A real 12 MP job starts after proportional reduction, then cancellation returns control
  // immediately and cannot publish a late result.
  await assertAccepted(t, phone12, '4,032×3,024');
  await t.click('Upscale with AI');
  const cancel = t.page.getByRole('button', { name: 'Cancel processing' });
  await cancel.waitFor({ state: 'visible', timeout: 30_000 });
  await cancel.click();
  await t.page.getByRole('button', { name: 'Upscale with AI' }).waitFor({ state: 'visible', timeout: 30_000 });
  await t.page.waitForTimeout(500);
  t.assert(
    (await t.page.getByRole('button', { name: 'Download upscaled image' }).count()) === 0,
    'cancelled work exposed a late download',
  );

  // A transparent PNG completes in a background tab and downloads at the exact promised 4× size.
  await assertAccepted(t, transparent, '96×64');
  await t.page.getByRole('radio', { name: '4×' }).click();
  await t.waitForText('384×256');
  await t.click('Upscale with AI');
  await t.waitForText(/Rebuilding detail: tile/, 180_000);
  const progressText = await t.page.locator('main').innerText();
  if (progressText.includes('CPU')) {
    t.assert(progressText.includes('WebGPU could not be used'), 'CPU fallback was not explained');
  }
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  const downloadButton = t.page.getByRole('button', { name: 'Download upscaled image' });
  await downloadButton.waitFor({ state: 'visible', timeout: 240_000 });
  await t.page.bringToFront();
  await background.close();

  const alpha = await t.page.getByRole('img', { name: 'After' }).evaluate(async (image) => {
    const bitmap = await createImageBitmap(await (await fetch(image.src)).blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    const corner = context.getImageData(0, 0, 1, 1).data[3];
    const center = context.getImageData(bitmap.width / 2, bitmap.height / 2, 1, 1).data[3];
    bitmap.close();
    return { corner, center };
  });
  t.assert(alpha.corner === 0 && alpha.center > 0, `transparency was lost (${alpha.corner}, ${alpha.center})`);

  const file = await t.download(() => downloadButton.click(), 60_000);
  t.assert(file.name === 'transparent-logo-4x-upscaled.png', `unexpected file name ${file.name}`);
  const info = pngInfo(file.bytes);
  t.assert(info.type === 'image/png', `unexpected output type ${info.type}`);
  t.assert(info.width === 384 && info.height === 256, `expected 384×256, got ${info.width}×${info.height}`);
  t.assert(info.hasAlpha, 'downloaded PNG does not support alpha');
  t.assert(file.size > 100 && file.size < 384 * 256 * 4, `unexpected output size ${file.size} bytes`);

  // Decode and model-fetch failures are visible and actionable instead of silently doing nothing.
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This image cannot be read by your browser.');
  await assertAccepted(t, tiny, '64×64');
  failModel = true;
  await t.click('Upscale with AI');
  await t.waitForText('The local AI model could not load.', 30_000);
  t.assert((await t.page.getByRole('button', { name: 'Upscale with AI' }).count()) === 1, 'retry was not offered');

  // Controls remain keyboard-operable and the panel fits a dark-mode phone viewport.
  const twoTimes = t.page.getByRole('radio', { name: '2× (recommended)' });
  await twoTimes.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await twoTimes.getAttribute('aria-checked')) === 'true', 'scale did not change by keyboard');
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

  await t.open('/ko/image-upscaler');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('최대 5,000만 픽셀'), 'Korean input-limit copy is stale');
  t.assert(korean.includes('시작 전 안내에 실제 결과 크기'), 'Korean output-size explanation is missing');
}

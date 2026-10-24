import qrcode from 'qrcode-generator';

function qrMatrix(value) {
  const code = qrcode(0, 'M');
  code.addData(value, 'Byte');
  code.make();
  return Array.from({ length: code.getModuleCount() }, (_, row) =>
    Array.from({ length: code.getModuleCount() }, (_, column) => code.isDark(row, column)),
  );
}

async function qrImage(t, { width, height, type, name, value, qrSide, noisy = false, transparent = false }) {
  const matrix = qrMatrix(value);
  const base64 = await t.page.evaluate(
    async ({ width, height, type, matrix, qrSide, noisy, transparent }) => {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');

      if (noisy) {
        const pixels = context.createImageData(width, height);
        let seed = 0x378;
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
      } else if (transparent) {
        context.clearRect(0, 0, width, height);
        context.fillStyle = 'rgba(26, 130, 105, 0.35)';
        context.beginPath();
        context.arc(width * 0.28, height * 0.5, Math.min(width, height) * 0.25, 0, Math.PI * 2);
        context.fill();
      } else {
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#286b56');
        gradient.addColorStop(1, '#71426f');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }

      const modules = matrix.length;
      const cell = Math.max(1, Math.floor(qrSide / (modules + 8)));
      const side = cell * (modules + 8);
      const left = Math.floor((width - side) / 2);
      const top = Math.floor((height - side) / 2);
      context.fillStyle = '#ffffff';
      context.fillRect(left, top, side, side);
      context.fillStyle = '#000000';
      for (let row = 0; row < modules; row++) {
        for (let column = 0; column < modules; column++) {
          if (matrix[row][column]) {
            context.fillRect(left + (column + 4) * cell, top + (row + 4) * cell, cell, cell);
          }
        }
      }

      const blob = await canvas.convertToBlob({ type, quality: 0.9 });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      }
      return btoa(binary);
    },
    { width, height, type, matrix, qrSide, noisy, transparent },
  );
  return { name, mimeType: type, buffer: Buffer.from(base64, 'base64') };
}

async function scanAndExpect(t, fixture, expected, dimensions) {
  await t.upload(fixture);
  await t.page.waitForFunction(
    (value) => document.querySelector('textarea[aria-label="Original QR content"]')?.value === value,
    expected,
    { timeout: 120_000 },
  );
  await t.waitForText(dimensions, 120_000);
  const main = await t.page.locator('main').innerText();
  t.assert(!main.includes('No QR code was found'), `${fixture.name} did not decode`);
  t.assert(!main.includes('too large'), `${fixture.name} hit an image limit`);
}

/** Real phone photos and awkward image shapes decode locally without freezing or failing silently. */
export default async function (t) {
  await t.open('/qr-code-scanner');

  const phone12 = await qrImage(t, {
    width: 4032,
    height: 3024,
    type: 'image/jpeg',
    name: 'phone-12mp.jpg',
    value: 'https://betterbit.org/qr/phone-12mp',
    qrSide: 900,
    noisy: true,
  });
  t.assert(
    phone12.buffer.length >= 3_000_000 && phone12.buffer.length <= 6_000_000,
    `12 MP fixture should resemble a 3–6 MB phone JPEG, got ${phone12.buffer.length} bytes`,
  );
  const phone24 = await qrImage(t, {
    width: 6000,
    height: 4000,
    type: 'image/jpeg',
    name: 'phone-24mp.jpg',
    value: 'https://betterbit.org/qr/phone-24mp',
    qrSide: 1100,
    noisy: true,
  });
  const transparent = await qrImage(t, {
    width: 1200,
    height: 800,
    type: 'image/png',
    name: 'transparent.png',
    value: 'transparent-png',
    qrSide: 520,
    transparent: true,
  });
  const tiny = await qrImage(t, {
    width: 64,
    height: 64,
    type: 'image/png',
    name: 'tiny.png',
    value: 'tiny',
    qrSide: 64,
  });
  const wide = await qrImage(t, {
    width: 6000,
    height: 800,
    type: 'image/jpeg',
    name: 'wide.jpg',
    value: 'https://betterbit.org/qr/wide',
    qrSide: 650,
  });

  await scanAndExpect(t, phone12, 'https://betterbit.org/qr/phone-12mp', '4032 × 3024 px');
  await scanAndExpect(t, phone24, 'https://betterbit.org/qr/phone-24mp', '6000 × 4000 px');
  await scanAndExpect(t, transparent, 'transparent-png', '1200 × 800 px');
  await scanAndExpect(t, tiny, 'tiny', '64 × 64 px');
  await scanAndExpect(t, wide, 'https://betterbit.org/qr/wide', '6000 × 800 px');

  // A long no-code scan exposes cancellation and must not publish a late result.
  const blank24 = await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'cancel-me.jpg' });
  await t.page.evaluate(() => {
    const original = MessagePort.prototype.postMessage;
    window.__scannerOriginalPostMessage = original;
    let held = false;
    MessagePort.prototype.postMessage = function (...args) {
      if (!held) {
        held = true;
        window.__continueScannerYield = () => original.apply(this, args);
        return;
      }
      return original.apply(this, args);
    };
  });
  await t.upload(blank24);
  await t.waitForText(/Looking for a QR code.*%/, 30_000);
  await t.click('Cancel scan');
  await t.page.evaluate(() => {
    MessagePort.prototype.postMessage = window.__scannerOriginalPostMessage;
    window.__continueScannerYield();
    delete window.__scannerOriginalPostMessage;
    delete window.__continueScannerYield;
  });
  await t.waitForText('Scan cancelled. Choose another image when you are ready.');
  await t.page.waitForTimeout(500);
  t.assert(
    (await t.page.getByText('No QR code was found', { exact: false }).count()) === 0,
    'cancelled scan reported a result',
  );

  // Work continues while another tab is in front; MessageChannel yields are not timer-throttled.
  const backgroundScan = await qrImage(t, {
    width: 4032,
    height: 3024,
    type: 'image/jpeg',
    name: 'background.jpg',
    value: 'background-tab-result',
    qrSide: 850,
    noisy: true,
  });
  await t.upload(backgroundScan);
  await t.waitForText(/Looking for a QR code.*%/, 30_000);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await t.page.waitForFunction(
    () => document.querySelector('textarea[aria-label="Original QR content"]')?.value === 'background-tab-result',
    undefined,
    { timeout: 120_000 },
  );
  await t.page.bringToFront();
  await background.close();

  // Decode and camera failures are visible rather than swallowed.
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This file could not be read as an image.');
  await t.page.evaluate(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const context = canvas.getContext('2d');
          context.fillStyle = '#d8ddd9';
          context.fillRect(0, 0, canvas.width, canvas.height);
          window.__qrCameraCanvas = canvas;
          const stream = canvas.captureStream(10);
          window.__qrCameraStream = stream;
          return stream;
        },
        enumerateDevices: async () => [{ kind: 'videoinput', deviceId: 'test-camera', label: 'Test camera' }],
      },
    });
  });
  await t.click('Start camera');
  await t.page.getByRole('button', { name: 'Stop camera', exact: true }).waitFor({ timeout: 30_000 });
  await t.click('Stop camera');
  const cameraStopped = await t.page.evaluate(
    () =>
      window.__qrCameraStream.getTracks().every((track) => track.readyState === 'ended') &&
      document.querySelector('video[aria-label="Camera preview"]')?.srcObject === null,
  );
  t.assert(cameraStopped, 'camera stop action did not complete');

  // A fatal frame-decoding error stops the stream and is shown instead of being swallowed forever.
  await t.click('Start camera');
  await t.page.getByRole('button', { name: 'Stop camera', exact: true }).waitFor({ timeout: 30_000 });
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    window.__scannerOriginalGetContext = original;
    HTMLCanvasElement.prototype.getContext = function (...args) {
      return this === window.__qrCameraCanvas ? original.apply(this, args) : null;
    };
  });
  await t.waitForText(
    'Camera scanning stopped because a video frame could not be read. Start it again or try an image.',
    30_000,
  );
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.getContext = window.__scannerOriginalGetContext;
    delete window.__scannerOriginalGetContext;
  });
  t.assert(
    await t.page.evaluate(() => window.__qrCameraStream.getTracks().every((track) => track.readyState === 'ended')),
    'fatal frame error left the camera running',
  );

  // The scanner stays keyboard-operable and fits a dark-mode phone viewport.
  const dropzone = t.page.getByRole('button', { name: /Scan a QR image/ });
  await dropzone.focus();
  t.assert(
    (await dropzone.evaluate((element) => document.activeElement === element)) === true,
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

  await t.open('/ko/qr-code-scanner');
  const koreanText = await t.page.locator('main').innerText();
  t.assert(koreanText.includes('1,200만·2,400만 화소'), 'Korean phone-photo guidance is missing');
}

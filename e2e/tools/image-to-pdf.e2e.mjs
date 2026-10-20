import { PDFDocument } from 'pdf-lib';

function jpegInfo(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('embedded image is not a JPEG');
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
      return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  throw new Error('could not read the embedded JPEG header');
}

function embeddedJpegInfo(pdfBytes) {
  const infos = [];
  let offset = 0;
  while ((offset = pdfBytes.indexOf(Buffer.from([0xff, 0xd8]), offset)) >= 0) {
    const end = pdfBytes.indexOf(Buffer.from([0xff, 0xd9]), offset + 2);
    if (end < 0) throw new Error('embedded JPEG has no end marker');
    infos.push(jpegInfo(pdfBytes.subarray(offset, end + 2)));
    offset = end + 2;
  }
  return infos;
}

async function realisticPhoneJpeg(t, width, height, name) {
  const base64 = await t.page.evaluate(
    async ({ width, height }) => {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      const pixels = context.createImageData(width, height);
      let seed = 0x370;
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
  return { name: 'transparent.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') };
}

async function waitForEnabledDownload(t, timeout = 180_000) {
  await t.page.waitForFunction(
    () => {
      const buttons = [...document.querySelectorAll('button')];
      const download = buttons.find((button) => button.textContent?.trim() === 'Download PDF');
      return download && !download.disabled;
    },
    undefined,
    { timeout, polling: 250 },
  );
}

/** Everyday photo batches become a truthful, cancellable PDF even while the page is in the background. */
export default async function (t) {
  await t.open('/image-to-pdf');

  const phone12 = await realisticPhoneJpeg(t, 4032, 3024, 'phone-12mp.jpg');
  const phone24 = await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'phone-24mp.jpg' });
  const transparent = await transparentPng(t);
  const tiny = await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' });
  const wide = await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' });
  t.assert(
    phone12.buffer.length >= 3_000_000 && phone12.buffer.length <= 6_000_000,
    `12 MP fixture should resemble a 3–6 MB phone JPEG, got ${phone12.buffer.length} bytes`,
  );

  await t.upload([phone12, phone24, transparent, tiny, wide]);
  await t.waitForText(/Processing 1 of 5:/, 30_000);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await waitForEnabledDownload(t);
  await t.page.bringToFront();
  await background.close();

  const pageText = await t.page.locator('main').innerText();
  t.assert(!pageText.includes('could not be converted'), 'an everyday image failed to convert');
  t.assert(!pageText.includes('too large'), 'an everyday phone image was rejected as too large');
  t.assert(pageText.includes('5 page(s)'), 'the ready result did not report all five pages');

  const download = await t.download(() => t.click('Download PDF'), 120_000);
  t.assert(download.name === 'images.pdf', `unexpected download name ${download.name}`);
  t.assert(download.bytes.subarray(0, 8).toString() === '%PDF-1.4', 'download is not a PDF 1.4 file');
  const document = await PDFDocument.load(download.bytes);
  t.assert(document.getPageCount() === 5, `expected 5 pages, got ${document.getPageCount()}`);
  const images = embeddedJpegInfo(download.bytes);
  t.assert(images.length === 5, `expected 5 embedded JPEGs, got ${images.length}`);
  const expected = [
    { width: 4032, height: 3024 },
    { width: 5016, height: 3344 },
    { width: 1200, height: 800 },
    { width: 64, height: 64 },
    { width: 6000, height: 800 },
  ];
  for (const [index, info] of images.entries()) {
    t.assert(
      info.width === expected[index].width && info.height === expected[index].height,
      `page ${index + 1} JPEG is ${info.width}x${info.height}, expected ${expected[index].width}x${expected[index].height}`,
    );
  }
  const inputBytes = [phone12, phone24, transparent, tiny, wide].reduce((sum, file) => sum + file.buffer.length, 0);
  t.assert(download.size < inputBytes, `quality 85 PDF grew from ${inputBytes} to ${download.size} bytes`);

  // A delayed encode exposes progress, can be cancelled, and cannot publish a late result.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__imageToPdfOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishImageToPdfEncode = () => original.call(this, callback, ...args);
    };
  });
  await t.upload(await t.image({ width: 1600, height: 1200, type: 'image/jpeg', name: 'cancel-me.jpg' }));
  await t.waitForText(/Processing 1 of 1: cancel-me\.jpg.*Encoding/, 30_000);
  await t.click('Cancel');
  await t.waitForText('Conversion cancelled. Your original images are still available.');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__imageToPdfOriginalToBlob;
    window.__finishImageToPdfEncode();
  });
  await t.page.waitForTimeout(500);
  t.assert(
    (await t.page.getByRole('button', { name: 'Download PDF' }).count()) === 0,
    'cancelled work exposed a late PDF',
  );
  await t.click('Resume conversion');
  await waitForEnabledDownload(t);

  // A browser encoder fallback is visible instead of being embedded as a mislabeled JPEG.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__imageToPdfOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(new Blob(['not a jpeg'], { type: 'image/png' }));
    };
  });
  await t.upload(await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'fallback.jpg' }));
  await t.waitForText('Your browser could not encode this image as JPEG.');
  t.assert(
    (await t.page.getByRole('button', { name: 'Download PDF' }).count()) === 0,
    'invalid JPEG was offered in a PDF',
  );
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__imageToPdfOriginalToBlob;
  });

  // Decode failures are visible and block a silently incomplete PDF.
  await t.click('Clear all');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This file can’t be read by your browser.');
  t.assert(
    (await t.page.getByRole('button', { name: 'Download PDF' }).count()) === 0,
    'broken input exposed a partial PDF',
  );

  // Settings stay keyboard-operable and the panel fits a dark-mode phone viewport.
  const a4 = t.page.getByRole('radio', { name: 'A4' });
  await a4.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await a4.getAttribute('aria-checked')) === 'true', 'page size did not change by keyboard');
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

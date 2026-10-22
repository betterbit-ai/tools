import { unzipSync } from 'fflate';

const REAL_HEIC_BASE64 =
  'AAAAGGZ0eXBoZWljAAAAAG1pZjFoZWljAAABLm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAAAAAAAAAAAAAAAAAAAAADnBpdG0AAAAAAAEAAAAiaWxvYwAAAABEQAABAAEAAAAAAU4AAQAAAAAAAAClAAAAI2lpbmYAAAAAAAEAAAAVaW5mZQIAAAAAAQAAaHZjMQAAAACuaXBycAAAAJFpcGNvAAAAdWh2Y0MBA3AAAAAAAAAAAAAe8AD8/fj4AAAPAyAAAQAYQAEMAf//A3AAAAMAkAAAAwAAAwAeugJAIQABAChCAQEDcAAAAwCQAAADAAADAB6gIIEFlupJKa5sCAAAAwAIAAADAAhAIgABAAdEAcFysCJAAAAAFGlzcGUAAAAAAAAAQAAAAEAAAAAVaXBtYQAAAAAAAAABAAECgQIAAACtbWRhdAAAAKEmAa8TgIGSEXXAGM2sfMMD8HKXsBNBYjkEW6//QKl1HfLCc/SN/bWOG2ARaa8rk4JsxRuKJFz/vIlnrSBv0Pk7pYMv503LniUfVt0RGOMyTBZVcbnDhlXs0nsTVObq7679Fh7MfXPARYndCrwpKWSNTQcCjNVYWPVOenDxU81lLBnE070xnN107IoLiTNywdiNWzedf/q6zzV3iwZflrO94A==';

function imageInfo(bytes) {
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
        };
      }
      offset += length;
    }
  }
  throw new Error('download is not a readable JPEG');
}

function padToSize(file, size) {
  if (file.buffer.length >= size) return file;
  return { ...file, buffer: Buffer.concat([file.buffer, Buffer.alloc(size - file.buffer.length)]) };
}

/**
 * Chrome cannot create HEIC fixtures. Wrap browser-generated pixels in a HEIF
 * signature and let the init-script below stand in for Safari's native HEIC
 * decoder. A separate test uses real HEVC bytes through the production WASM
 * decoder, so neither decode path is left as a pure mock.
 */
function nativeHeic(file, name) {
  const ftyp = Buffer.alloc(24);
  ftyp.writeUInt32BE(24, 0);
  ftyp.write('ftyp', 4);
  ftyp.write('heic', 8);
  ftyp.writeUInt32BE(0, 12);
  ftyp.write('mif1', 16);
  ftyp.write('heic', 20);
  return { name, mimeType: 'image/heic', buffer: Buffer.concat([ftyp, file.buffer]) };
}

async function installNativeHeicShim(page) {
  await page.addInitScript(() => {
    const original = window.createImageBitmap.bind(window);
    window.__heicOriginalCreateImageBitmap = original;
    window.__heicNativeCreateImageBitmap = async (source, options) => {
      if (source instanceof Blob && source.size > 24) {
        const header = new Uint8Array(await source.slice(0, 24).arrayBuffer());
        const brand = String.fromCharCode(...header.slice(8, 12));
        if (String.fromCharCode(...header.slice(4, 8)) === 'ftyp' && brand === 'heic') {
          const payload = source.slice(24);
          const magic = new Uint8Array(await payload.slice(0, 12).arrayBuffer());
          const type = magic[0] === 0xff && magic[1] === 0xd8 ? 'image/jpeg' : 'image/png';
          return original(new Blob([payload], { type }), options);
        }
      }
      return original(source, options);
    };
    window.createImageBitmap = window.__heicNativeCreateImageBitmap;
  });
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
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
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

function assertJpeg(t, files, expected) {
  const bytes = entry(files, expected.name);
  const info = imageInfo(bytes);
  t.assert(info.type === 'image/jpeg', `${expected.name} has type ${info.type}`);
  t.assert(
    info.width === expected.width && info.height === expected.height,
    `${expected.name} is ${info.width}x${info.height}, expected ${expected.width}x${expected.height}`,
  );
  t.assert(bytes.length > 300, `${expected.name} is unexpectedly empty`);
  t.assert(bytes.length < expected.width * expected.height * 4, `${expected.name} exceeds raw RGBA size`);
  if (expected.smallerThan) {
    t.assert(bytes.length < expected.smallerThan, `${expected.name} did not stay below its padded phone input`);
  }
}

async function pixelAt(t, bytes, x, y) {
  return t.page.evaluate(
    async ({ base64, x, y }) => {
      const binary = atob(base64);
      const data = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
      const bitmap = await window.__heicOriginalCreateImageBitmap(new Blob([data], { type: 'image/jpeg' }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return Array.from(context.getImageData(x, y, 1, 1).data);
    },
    { base64: bytes.toString('base64'), x, y },
  );
}

/** Real phone-sized work, genuine HEVC decoding, cancellation and failures all stay visible and honest. */
export default async function (t) {
  await installNativeHeicShim(t.page);
  await t.open('/heic-to-jpg');

  const phone12Jpeg = padToSize(
    await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-12mp.jpg' }),
    4 * 1024 * 1024,
  );
  const phone24Jpeg = padToSize(
    await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'phone-24mp.jpg' }),
    6 * 1024 * 1024,
  );
  t.assert(
    phone12Jpeg.buffer.length >= 3 * 1024 * 1024 && phone12Jpeg.buffer.length <= 6 * 1024 * 1024,
    `12 MP fixture should be 3–6 MB, got ${phone12Jpeg.buffer.length} bytes`,
  );

  const inputs = [
    nativeHeic(phone12Jpeg, 'phone-12mp.heic'),
    nativeHeic(phone24Jpeg, 'phone-24mp.heic'),
    nativeHeic(await transparentPng(t), 'transparent.heic'),
    nativeHeic(await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' }), 'tiny.heic'),
    nativeHeic(await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'wide.jpg' }), 'wide.heic'),
  ];

  await t.page.setInputFiles('input[type=file]', inputs, { timeout: 120_000 });
  await t.waitForText(/Converting 1 of 5: phone-12mp\.heic/, 120_000);

  // MessageChannel yields keep the queue moving while another tab is in front.
  const foreground = await t.page.context().newPage();
  await foreground.goto('about:blank');
  await foreground.bringToFront();
  await t.page.getByRole('button', { name: 'Download all (5) as ZIP' }).waitFor({ timeout: 240_000 });
  await t.page.bringToFront();
  await foreground.close();

  const pageText = await t.page.locator('main').innerText();
  t.assert(!pageText.includes('could not be decoded'), 'an everyday phone-sized image failed');
  const archive = await t.download(() => t.click('Download all (5) as ZIP'), 180_000);
  t.assert(archive.name === 'heic-to-jpg.zip', `unexpected archive name ${archive.name}`);
  const files = unzipSync(archive.bytes);
  t.assert(Object.keys(files).length === 5, `expected 5 ZIP entries, got ${Object.keys(files).length}`);

  assertJpeg(t, files, {
    name: 'phone-12mp.jpg',
    width: 4032,
    height: 3024,
    smallerThan: inputs[0].buffer.length,
  });
  assertJpeg(t, files, {
    name: 'phone-24mp.jpg',
    width: 6000,
    height: 4000,
    smallerThan: inputs[1].buffer.length,
  });
  assertJpeg(t, files, { name: 'transparent.jpg', width: 1200, height: 800 });
  assertJpeg(t, files, { name: 'tiny.jpg', width: 64, height: 64 });
  assertJpeg(t, files, { name: 'wide.jpg', width: 6000, height: 800 });
  const transparentPixel = await pixelAt(t, entry(files, 'transparent.jpg'), 1000, 400);
  t.assert(
    transparentPixel[0] > 245 && transparentPixel[1] > 245 && transparentPixel[2] > 245,
    `transparent HEIC pixels were not composited onto white: ${transparentPixel.join(',')}`,
  );

  // Chromium's real fallback decoder handles genuine HEVC/HEIC bytes.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    window.createImageBitmap = window.__heicOriginalCreateImageBitmap;
  });
  await t.upload({
    name: 'real-hevc.heic',
    mimeType: 'image/heic',
    buffer: Buffer.from(REAL_HEIC_BASE64, 'base64'),
  });
  const realRow = t.page.locator('li', { hasText: 'real-hevc.heic' });
  await realRow.getByRole('button', { name: 'Download', exact: true }).waitFor({ timeout: 120_000 });
  const real = await t.download(() => realRow.getByRole('button', { name: 'Download', exact: true }).click());
  const realInfo = imageInfo(real.bytes);
  t.assert(realInfo.width === 64 && realInfo.height === 64, `real HEIC became ${realInfo.width}x${realInfo.height}`);

  // A delayed encoder exposes progress, cancels promptly, and cannot publish a stale result.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    window.createImageBitmap = window.__heicNativeCreateImageBitmap;
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__heicOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishHeicEncode = () => original.call(this, callback, ...args);
    };
  });
  const cancelInput = nativeHeic(
    await t.image({ width: 1200, height: 800, type: 'image/jpeg', name: 'cancel.jpg' }),
    'cancel.heic',
  );
  await t.upload(cancelInput);
  await t.waitForText(/cancel\.heic · Encoding JPEG/, 30_000);
  await t.click('Cancel conversion');
  await t.waitForText('Conversion cancelled. Your original files are still available.');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__heicOriginalToBlob;
    window.__finishHeicEncode();
  });
  await t.page.waitForTimeout(500);
  const cancelledRow = t.page.locator('li', { hasText: 'cancel.heic' });
  t.assert(
    (await cancelledRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'cancelled work exposed a late download',
  );
  await t.click('Resume conversion');
  await cancelledRow.getByRole('button', { name: 'Download', exact: true }).waitFor({ timeout: 60_000 });

  // Encoder format fallback and renamed non-HEIC bytes are explained, never offered as successful JPGs.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    window.__heicOriginalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(new Blob(['wrong format'], { type: 'image/png' }));
    };
  });
  await t.upload(
    nativeHeic(await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'fallback.jpg' }), 'fallback.heic'),
  );
  await t.waitForText('Your browser decoded the photo but could not create a JPEG.');
  const fallbackRow = t.page.locator('li', { hasText: 'fallback.heic' });
  t.assert(
    (await fallbackRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'a PNG browser fallback was presented as a JPEG success',
  );
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__heicOriginalToBlob;
  });
  const retryQuality = t.page.getByRole('slider', { name: /JPG quality/ });
  await retryQuality.focus();
  await t.page.keyboard.press('ArrowLeft');
  await fallbackRow.getByRole('button', { name: 'Download', exact: true }).waitFor({ timeout: 60_000 });
  t.assert(
    !(await fallbackRow.innerText()).includes('could not create a JPEG'),
    'changing a setting did not clear the prior encoder error after a successful retry',
  );

  await t.click('Clear all');
  const renamed = await t.image({ width: 640, height: 480, type: 'image/jpeg', name: 'renamed.heic' });
  await t.upload({ ...renamed, name: 'renamed.heic', mimeType: 'image/heic' });
  await t.waitForText('Not a HEIC file');
  const renamedRow = t.page.locator('li', { hasText: 'renamed.heic' });
  t.assert(
    (await renamedRow.getByRole('button', { name: 'Download', exact: true }).count()) === 0,
    'renamed JPEG bytes were silently accepted as HEIC',
  );

  // Keyboard controls remain usable at the required dark-mode phone viewport.
  const quality = t.page.getByRole('slider', { name: /JPG quality/ });
  await quality.focus();
  const before = Number(await quality.inputValue());
  await t.page.keyboard.press('ArrowLeft');
  t.assert(Number(await quality.inputValue()) === before - 1, 'quality could not be changed with the keyboard');
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

  await t.open('/ko/heic-to-jpg');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('한 번에 최대 50장'), 'Korean batch limit does not match behavior');
  t.assert(korean.includes('EXIF 구조는 픽셀 변환에 성공해도'), 'Korean metadata compatibility guidance is missing');
}

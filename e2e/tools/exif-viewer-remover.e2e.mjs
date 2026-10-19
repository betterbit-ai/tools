/** Real camera-sized batches must be cleaned without recompression, silent failures, or frozen work. */

import { unzipSync } from 'fflate';

const JPEG_SIGNATURE = 'ffd8ff';
const PNG_SIGNATURE = '89504e470d0a1a0a';

function jpegSize(bytes) {
  let offset = 2;
  while (offset + 8 < bytes.length) {
    while (offset < bytes.length && bytes[offset] !== 0xff) offset++;
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const length = bytes.readUInt16BE(offset);
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  throw new Error('JPEG dimensions were not found');
}

function imageSize(bytes) {
  if (bytes.subarray(0, 3).toString('hex') === JPEG_SIGNATURE) return jpegSize(bytes);
  if (bytes.subarray(0, 8).toString('hex') === PNG_SIGNATURE) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  throw new Error('download is not a JPEG or PNG');
}

function jpegWithMetadata(file, targetBytes) {
  const segments = [Buffer.from([0xff, 0xe1, 0x00, 0x0a, 0x45, 0x78, 0x69, 0x66, 0, 0, 0x49, 0x49])];
  let size = file.buffer.length + segments[0].length;
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

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const kind = Buffer.from(type, 'ascii');
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  kind.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([kind, data])), data.length + 8);
  return chunk;
}

function pngWithMetadata(file) {
  const ihdrEnd = 8 + 12 + file.buffer.readUInt32BE(8);
  const text = pngChunk('tEXt', Buffer.from('Location\0Home address'));
  return {
    ...file,
    buffer: Buffer.concat([file.buffer.subarray(0, ihdrEnd), text, file.buffer.subarray(ihdrEnd)]),
  };
}

function hasJpegMetadata(bytes) {
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) return false;
    const length = bytes.readUInt16BE(offset + 2);
    if (marker === 0xe1 || marker === 0xed || marker === 0xfe) return true;
    offset += length + 2;
  }
  return false;
}

function hasPngMetadata(bytes) {
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    if (['eXIf', 'iTXt', 'tEXt', 'zTXt', 'tIME'].includes(type)) return true;
    offset += length + 12;
  }
  return false;
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
  return {
    name: 'transparent.png',
    mimeType: 'image/png',
    buffer: Buffer.from(base64, 'base64'),
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
  await t.open('/exif-viewer-remover');

  const phone12 = jpegWithMetadata(
    await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'IMG_12MP.JPG' }),
    4 * 1024 * 1024,
  );
  const phone24 = jpegWithMetadata(
    await t.image({ width: 6000, height: 4000, type: 'image/jpeg', name: 'IMG_24MP.JPG' }),
    6 * 1024 * 1024,
  );
  const transparent = pngWithMetadata(await transparentPng(t.page));
  const tiny = await t.image({ width: 64, height: 64, type: 'image/png', name: 'tiny.png' });
  const panorama = await t.image({ width: 6000, height: 800, type: 'image/jpeg', name: 'panorama.jpg' });
  const inputs = [phone12, phone24, transparent, tiny, panorama];

  await t.upload(inputs);
  await t.page.getByRole('button', { name: 'Clean 5 photos' }).waitFor({ timeout: 120_000 });
  t.assert((await t.page.getByText('Metadata found', { exact: true }).count()) >= 3, 'metadata was not reported');

  await t.click('Clean 5 photos');
  const foreground = await t.page.context().newPage();
  await foreground.goto('about:blank');
  await foreground.bringToFront();
  await t.page.getByRole('button', { name: 'Download ZIP (5)' }).waitFor({ state: 'visible', timeout: 120_000 });
  await t.page.bringToFront();
  await foreground.close();
  const archive = await t.download(() => t.click('Download ZIP (5)'), 120_000);
  t.assert(archive.name === 'clean-photos.zip', `unexpected archive name ${archive.name}`);
  t.assert(archive.bytes.subarray(0, 4).toString('hex') === '504b0304', 'batch download is not a ZIP');

  const files = unzipSync(archive.bytes);
  const expected = [
    ['private-image-01.jpg', phone12, 4032, 3024],
    ['private-image-02.jpg', phone24, 6000, 4000],
    ['private-image-03.png', transparent, 640, 480],
    ['private-image-04.png', tiny, 64, 64],
    ['private-image-05.jpg', panorama, 6000, 800],
  ];
  for (const [name, source, width, height] of expected) {
    const bytes = Buffer.from(files[name] ?? []);
    t.assert(bytes.length > 0, `${name} is missing from the ZIP`);
    const dimensions = imageSize(bytes);
    t.assert(
      dimensions.width === width && dimensions.height === height,
      `${name} expected ${width}×${height}, got ${dimensions.width}×${dimensions.height}`,
    );
    t.assert(bytes.length <= source.buffer.length, `${name} is larger than its source despite byte-level cleanup`);
    if (name.endsWith('.jpg')) t.assert(!hasJpegMetadata(bytes), `${name} still contains JPEG metadata`);
    else t.assert(!hasPngMetadata(bytes), `${name} still contains PNG metadata`);
  }
  t.assert(
    (await alphaAt(t.page, Buffer.from(files['private-image-03.png']), 500, 240)) === 0,
    'cleaning filled transparent PNG pixels',
  );

  // ZIP preparation is cancellable and a late blob read cannot trigger a stale download.
  await t.page.evaluate(() => {
    const original = Blob.prototype.arrayBuffer;
    window.__restoreExifBlobArrayBuffer = () => {
      Blob.prototype.arrayBuffer = original;
    };
    Blob.prototype.arrayBuffer = function () {
      if (this instanceof File) return original.call(this);
      return new Promise((resolve) => {
        window.__finishExifBlobRead = async () => resolve(await original.call(this));
      });
    };
  });
  let downloadsAfterZipCancel = 0;
  const countZipDownload = () => downloadsAfterZipCancel++;
  t.page.on('download', countZipDownload);
  await t.click('Download ZIP (5)');
  await t.waitForText('Preparing ZIP 1 of 5…');
  await t.page.waitForFunction(() => typeof window.__finishExifBlobRead === 'function');
  await t.click('Cancel');
  await t.page.evaluate(() => {
    window.__finishExifBlobRead();
    window.__restoreExifBlobArrayBuffer();
  });
  await t.waitForText('ZIP preparation cancelled.');
  await t.page.waitForTimeout(500);
  t.page.off('download', countZipDownload);
  t.assert(downloadsAfterZipCancel === 0, 'cancelled ZIP preparation still triggered a download');

  // A malformed image fails visibly rather than appearing as a clean copy.
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg') });
  await t.waitForText('Use a valid JPG, PNG, or WebP image.');
  t.assert(await t.page.getByText('Use a valid JPG, PNG, or WebP image.').isVisible(), 'read failure was hidden');

  // The detected container controls the download type even when the source name and MIME lie.
  await t.click('Clear all');
  const misleading = await t.image({ width: 320, height: 240, type: 'image/jpeg', name: 'misleading.png' });
  misleading.mimeType = 'image/png';
  const trailingPayload = Buffer.from('private bytes after JPEG end');
  misleading.buffer = Buffer.concat([misleading.buffer, trailingPayload]);
  await t.upload(misleading);
  await t.page.getByRole('button', { name: 'Clean 1 photos' }).waitFor();
  await t.click('Clean 1 photos');
  const normalized = await t.download(async () => {
    await t.page.getByRole('button', { name: 'Download clean copy' }).first().waitFor();
    await t.click('Download clean copy');
  });
  t.assert(normalized.name === 'private-image-01.jpg', `misnamed JPEG downloaded as ${normalized.name}`);
  t.assert(normalized.bytes.subarray(0, 3).toString('hex') === JPEG_SIGNATURE, 'misnamed JPEG bytes changed type');
  t.assert(!normalized.bytes.includes(trailingPayload), 'bytes after the JPEG end marker survived cleanup');

  // Batch work paints exact progress and a late worker result cannot undo cancellation.
  await t.click('Clear all');
  await t.page.evaluate(() => {
    const original = File.prototype.arrayBuffer;
    const calls = new WeakMap();
    window.__restoreExifArrayBuffer = () => {
      File.prototype.arrayBuffer = original;
    };
    File.prototype.arrayBuffer = function () {
      const count = (calls.get(this) ?? 0) + 1;
      calls.set(this, count);
      if (count !== 2) return original.call(this);
      return new Promise((resolve) => {
        window.__finishExifRead = async () => resolve(await original.call(this));
      });
    };
  });
  const cancellable = jpegWithMetadata(
    await t.image({ width: 800, height: 600, type: 'image/jpeg', name: 'cancel.jpg' }),
    512 * 1024,
  );
  await t.upload(cancellable);
  await t.page.getByRole('button', { name: 'Clean 1 photos' }).waitFor();
  await t.click('Clean 1 photos');
  await t.waitForText('Cleaning 1 of 1…');
  await t.page.waitForFunction(() => typeof window.__finishExifRead === 'function');
  await t.click('Cancel');
  await t.page.evaluate(() => {
    window.__finishExifRead();
    window.__restoreExifArrayBuffer();
  });
  await t.waitForText('Cleaning cancelled.');
  await t.page.waitForTimeout(500);
  t.assert(
    !(await t.page.getByRole('button', { name: 'Download clean copy' }).isVisible()),
    'cancelled work exposed a late clean result',
  );

  // A visible 50-photo bound prevents unbounded retained source and result blobs.
  await t.click('Clear all');
  const small = await t.image({ width: 64, height: 64, type: 'image/png', name: 'small.png' });
  await t.upload(
    Array.from({ length: 51 }, (_, index) => ({
      ...small,
      name: `small-${index + 1}.png`,
    })),
  );
  await t.waitForText('Up to 50 photos can be kept in one batch. Extra files were not added.');
  await t.page.getByRole('button', { name: 'Clean 50 photos' }).waitFor({ timeout: 120_000 });
  t.assert(
    (await t.page.locator('ul[aria-live="polite"] > li').count()) === 50,
    'the documented batch bound did not keep exactly 50 files',
  );

  // The interface remains usable at the required mobile width and in dark mode.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

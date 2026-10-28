import { unzipSync } from 'fflate';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

async function assertJpeg(t, bytes, expected = {}) {
  const metadata = await sharp(bytes).metadata();
  t.assert(metadata.format === 'jpeg', `expected a JPEG, got ${metadata.format ?? 'unknown'}`);
  t.assert((metadata.width ?? 0) > 0 && (metadata.height ?? 0) > 0, 'JPEG has no readable dimensions');
  if (expected.width) {
    t.assert(
      metadata.width === expected.width && metadata.height === expected.height,
      `JPEG is ${metadata.width}x${metadata.height}, expected ${expected.width}x${expected.height}`,
    );
  }
  return metadata;
}

async function assertJpegsCanBecomePdf(t, files, expectedPages) {
  const document = await PDFDocument.create();
  for (const bytes of files) {
    await assertJpeg(t, bytes);
    const image = await document.embedJpg(bytes);
    const page = document.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  const reopened = await PDFDocument.load(await document.save());
  t.assert(
    reopened.getPageCount() === expectedPages,
    `expected ${expectedPages} reopenable image pages, got ${reopened.getPageCount()}`,
  );
}

async function makeImageHeavyPdf(t) {
  const image = await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-photo.jpg' });
  const document = await PDFDocument.create();
  const embedded = await document.embedJpg(image.buffer);
  const page = document.addPage([842, 595]);
  page.drawImage(embedded, { x: 0, y: 0, width: 842, height: 595 });
  return {
    name: 'image-heavy.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save({ useObjectStreams: false })),
  };
}

async function makeEncryptedPdf(t) {
  const source = await t.pdf({ pages: 1, name: 'private.pdf' });
  await t.open('/protect-pdf');
  await t.upload(source);
  await t.page.getByLabel('Password to open the PDF').fill('correct horse battery staple');
  await t.page.getByLabel('Confirm password').fill('correct horse battery staple');
  return t.download(() => t.click('Protect and download'), 90_000);
}

async function waitForReady(t, timeout = 120_000) {
  try {
    await t.waitForText('JPG images ready', timeout);
  } catch (error) {
    const state = await t.page.locator('main').innerText();
    throw new Error(`${error instanceof Error ? error.message : error}\nCurrent page state:\n${state}`);
  }
}

/** Real documents render into decodable JPGs, keep progressing in the background, and cancel cleanly. */
export default async function (t) {
  const encrypted = await makeEncryptedPdf(t);
  await t.open('/pdf-to-jpg');

  // A one-page PDF produces one directly downloadable, correctly sized JPEG.
  await t.page.getByRole('radio', { name: 'Standard' }).click();
  await t.upload(await t.pdf({ pages: 1, name: 'one-page.pdf' }));
  await waitForReady(t);
  const onePage = await t.download(() => t.click('Download JPG'));
  t.assert(onePage.name === 'one-page_page-1.jpg', `unexpected one-page filename ${onePage.name}`);
  await assertJpeg(t, onePage.bytes, { width: 1240, height: 1755 });
  await assertJpegsCanBecomePdf(t, [onePage.bytes], 1);

  // Changing settings and immediately replacing a completed file must not leave the new PDF stuck reading.
  await t.page.getByRole('radio', { name: 'Screen' }).click();
  await t.upload(await t.pdf({ pages: 30, name: 'thirty-pages.pdf' }));
  // Thirty ordinary pages finish while another tab is in front and download in page order.
  await t.waitForText(/Converting page \d+ of 30/);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await waitForReady(t, 180_000);
  await t.page.bringToFront();
  await background.close();

  const archive = await t.download(() => t.click('Download ZIP'), 120_000);
  t.assert(archive.name === 'thirty-pages_jpg.zip', `unexpected archive filename ${archive.name}`);
  const entries = unzipSync(archive.bytes);
  const names = Object.keys(entries).sort();
  t.assert(names.length === 30, `expected 30 JPG files, got ${names.length}`);
  t.assert(names[0] === 'thirty-pages_page-01.jpg', `unexpected first entry ${names[0]}`);
  t.assert(names[29] === 'thirty-pages_page-30.jpg', `unexpected last entry ${names[29]}`);
  const thirtyJpegs = names.map((name) => Buffer.from(entries[name]));
  await assertJpegsCanBecomePdf(t, thirtyJpegs, 30);

  // A PDF containing a phone-sized image renders rather than being rejected for source pixels.
  await t.upload(await makeImageHeavyPdf(t));
  await waitForReady(t, 120_000);
  const imageHeavy = await t.download(() => t.click('Download JPG'));
  t.assert(imageHeavy.size > 10_000, `image-heavy output is suspiciously small at ${imageHeavy.size} bytes`);
  await assertJpeg(t, imageHeavy.bytes, { width: 1123, height: 794 });

  // Delaying JPEG encoding makes cancellation observable; late work must not publish a result.
  await t.page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    window.__pdfToJpgOriginalToBlob = original;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      window.__finishPdfToJpgEncode = () => original.call(this, callback, ...args);
    };
  });
  await t.upload(await t.pdf({ pages: 1, name: 'cancel-me.pdf' }));
  await t.page.waitForFunction(() => typeof window.__finishPdfToJpgEncode === 'function', undefined, {
    timeout: 30_000,
  });
  await t.click('Cancel');
  await t.waitForText('Conversion cancelled. Your PDF and settings are still available.');
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__pdfToJpgOriginalToBlob;
    window.__finishPdfToJpgEncode();
  });
  await t.page.waitForTimeout(500);
  t.assert(
    (await t.page.getByRole('button', { name: /Download (JPG|ZIP)/ }).count()) === 0,
    'cancelled conversion exposed a late download',
  );
  await t.click('Resume conversion');
  await waitForReady(t);

  // A browser encoder fallback is visible instead of downloading mislabeled bytes.
  await t.page.evaluate(() => {
    window.__pdfToJpgOriginalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(new Blob(['not a jpeg'], { type: 'image/png' }));
    };
  });
  await t.upload(await t.pdf({ pages: 1, name: 'encoder-fallback.pdf' }));
  await t.waitForText("This PDF couldn't be converted in this browser.");
  t.assert(
    (await t.page.getByRole('button', { name: /Download (JPG|ZIP)/ }).count()) === 0,
    'invalid encoder output exposed a download',
  );
  await t.page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.__pdfToJpgOriginalToBlob;
  });

  // Password protection is identified explicitly instead of becoming a generic failure.
  await t.upload({ name: 'private.pdf', mimeType: 'application/pdf', buffer: encrypted.bytes });
  await t.waitForText('This PDF is password-protected. Remove its password before converting it.');

  // Controls remain keyboard-operable and the panel fits a dark-mode phone viewport.
  const print = t.page.getByRole('radio', { name: 'Print' });
  await print.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await print.getAttribute('aria-checked')) === 'true', 'resolution did not change from the keyboard');
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

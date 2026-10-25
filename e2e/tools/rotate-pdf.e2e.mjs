import { PDFDocument } from 'pdf-lib';

async function assertRotatedPdf(t, download, expectedRotations) {
  t.assert(download.size > 0, 'the rotated PDF download was empty');
  const document = await PDFDocument.load(download.bytes);
  t.assert(
    document.getPageCount() === expectedRotations.length,
    `expected ${expectedRotations.length} pages, got ${document.getPageCount()}`,
  );
  expectedRotations.forEach((rotation, index) => {
    t.assert(
      document.getPage(index).getRotation().angle === rotation,
      `page ${index + 1} was rotated ${document.getPage(index).getRotation().angle}°, expected ${rotation}°`,
    );
  });
}

async function makeImageHeavyPdf(t) {
  const image = await t.image({ width: 4032, height: 3024, type: 'image/png', name: 'phone-photo.png' });
  const document = await PDFDocument.create();
  const embedded = await document.embedPng(image.buffer);
  for (let pageNumber = 0; pageNumber < 2; pageNumber++) {
    const page = document.addPage([3024, 4032]);
    page.drawImage(embedded, { x: 0, y: 0, width: 3024, height: 4032 });
  }
  return {
    name: 'two-phone-scans.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save({ useObjectStreams: false })),
  };
}

async function makeEncryptedPdf(t) {
  const source = await t.pdf({ pages: 2, name: 'private.pdf' });
  await t.open('/protect-pdf');
  await t.upload(source);
  await t.page.getByLabel('Password to open the PDF').fill('correct horse battery staple');
  await t.page.getByLabel('Confirm password').fill('correct horse battery staple');
  return t.download(() => t.click('Protect and download'), 90_000);
}

/** Rotation stays responsive and preserves readable pages, even for long and image-heavy PDFs. */
export default async function (t) {
  const encrypted = await makeEncryptedPdf(t);
  await t.open('/rotate-pdf');

  // Existing encryption is identified instead of becoming a generic or silent failure.
  await t.upload({ name: 'private.pdf', mimeType: 'application/pdf', buffer: encrypted.bytes });
  await t.waitForText('This PDF is password-protected. Remove its password before rotating it.');

  // A Unicode-named one-page PDF can be turned with its per-page control and opened again.
  const onePage = await t.pdf({ pages: 1, name: '계약서.résumé 📄.PDF' });
  await t.upload(onePage);
  await t.waitForText('1 page');
  await t.click('Rotate page 1 right 90 degrees');
  const onePageResult = await t.download(() => t.click('Download rotated PDF'));
  t.assert(onePageResult.name === '계약서.résumé 📄_rotated.pdf', `unexpected rotated filename: ${onePageResult.name}`);
  await assertRotatedPdf(t, onePageResult, [90]);

  // A routine 30-page document previews in a background tab and saves every chosen orientation.
  const thirtyPages = await t.pdf({ pages: 30, name: 'thirty-pages.pdf' });
  await t.upload(thirtyPages);
  await t.waitForText(/Creating preview \d+ of 30/);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await t.waitForText('30 pages', 120_000);
  await t.page.bringToFront();
  await t.click('Rotate all left');
  await t.click('Rotate page 15 right 90 degrees');
  const thirtyPageResult = await t.download(() => t.click('Download rotated PDF'), 120_000);
  const expectedThirty = Array.from({ length: 30 }, (_, index) => (index === 14 ? 0 : 270));
  await assertRotatedPdf(t, thirtyPageResult, expectedThirty);
  await background.close();

  // A PDF made from an ordinary 12 MP phone image keeps both full pages and substantial image data.
  const imagePdf = await makeImageHeavyPdf(t);
  await t.upload(imagePdf);
  await t.waitForText('2 pages', 120_000);
  await t.click('Rotate all right');
  const imageResult = await t.download(() => t.click('Download rotated PDF'), 120_000);
  await assertRotatedPdf(t, imageResult, [90, 90]);
  t.assert(imageResult.size > 100_000, `image-heavy output was unexpectedly tiny (${imageResult.size} bytes)`);

  // Cancelling preview work is explicit, leaves no late result, and a subsequent upload still works.
  await t.upload(thirtyPages);
  await t.waitForText(/Creating preview \d+ of 30/);
  await t.click('Cancel');
  await t.waitForText('Your PDF is read and saved in this browser. Nothing is uploaded.');
  await t.page.waitForTimeout(500);
  t.assert((await t.page.getByText(/Creating preview/).count()) === 0, 'preview progress remained after cancellation');
  t.assert(
    await t.page.getByRole('button', { name: 'Download rotated PDF' }).isDisabled(),
    'cancel left the output enabled',
  );

  // Cancelling the background writer terminates it and prevents a late download.
  await t.upload(imagePdf);
  await t.waitForText('2 pages', 120_000);
  await t.page.evaluate(() => {
    const NativeWorker = window.Worker;
    window.__rotatePdfNativeWorker = NativeWorker;
    window.Worker = function (...args) {
      const worker = new NativeWorker(...args);
      if (String(args[0]).includes('rotate.worker')) {
        const postMessage = worker.postMessage.bind(worker);
        worker.postMessage = (...postArgs) => {
          window.__releaseRotatePdfWorker = () => {
            try {
              postMessage(...postArgs);
            } catch {
              // A correctly cancelled worker has already been terminated.
            }
          };
        };
      }
      return worker;
    };
    window.Worker.prototype = NativeWorker.prototype;
  });
  let cancelledDownloads = 0;
  const countCancelledDownload = () => cancelledDownloads++;
  t.page.on('download', countCancelledDownload);
  await t.click('Download rotated PDF');
  await t.waitForText('Saving PDF…');
  await t.click('Cancel');
  await t.waitForText('Your PDF is read and saved in this browser. Nothing is uploaded.');
  await t.page.evaluate(() => {
    window.Worker = window.__rotatePdfNativeWorker;
    window.__releaseRotatePdfWorker?.();
  });
  await t.page.waitForTimeout(500);
  t.page.off('download', countCancelledDownload);
  t.assert(cancelledDownloads === 0, 'cancelled saving still downloaded a late result');

  // Damaged input has an actionable visible error rather than a no-op.
  await t.upload({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') });
  await t.waitForText("This file can't be read as a PDF.");

  // The complete flow remains keyboard-operable and the dark phone layout does not overflow.
  await t.upload(onePage);
  await t.waitForText('1 page');
  const rotateButton = t.page.getByRole('button', { name: 'Rotate page 1 left 90 degrees' });
  await rotateButton.focus();
  await t.page.keyboard.press('Enter');
  const keyboardResult = await t.download(() => {
    const button = t.page.getByRole('button', { name: 'Download rotated PDF' });
    return button.focus().then(() => t.page.keyboard.press('Enter'));
  });
  await assertRotatedPdf(t, keyboardResult, [270]);

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

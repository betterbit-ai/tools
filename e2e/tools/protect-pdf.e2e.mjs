import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const TEST_PASSWORD = '비밀 🔐 with spaces';

async function makeLargeImagePdf(t) {
  const image = await t.image({ width: 4032, height: 3024, type: 'image/png', name: 'phone-scan.png' });
  const document = await PDFDocument.create();
  const embedded = await document.embedPng(image.buffer);
  const page = document.addPage([595, 842]);
  page.drawImage(embedded, { x: 0, y: 198, width: 595, height: 446 });
  return {
    name: '휴대폰-스캔.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save({ useObjectStreams: false })),
  };
}

async function assertProtectedPdf(t, download, expectedPages, sourceSize, password = TEST_PASSWORD) {
  t.assert(download.size > 0, 'the protected PDF download was empty');
  t.assert(
    download.size > sourceSize / 2,
    `the protected PDF was unexpectedly small (${download.size} bytes from ${sourceSize} bytes)`,
  );

  let openedWithoutPassword = true;
  try {
    await PDFDocument.load(download.bytes);
  } catch (error) {
    openedWithoutPassword = false;
    t.assert(
      /encrypted/i.test(String(error)),
      `the protected PDF failed for a reason other than encryption: ${String(error)}`,
    );
  }
  t.assert(!openedWithoutPassword, 'the downloaded PDF opened without asking for its password');

  const loadingTask = getDocument({ data: new Uint8Array(download.bytes), password });
  const opened = await loadingTask.promise;
  t.assert(opened.numPages === expectedPages, `expected ${expectedPages} pages, got ${opened.numPages}`);
  await loadingTask.destroy();
}

async function enterPassword(t, password = TEST_PASSWORD) {
  await t.page.getByLabel('Password to open the PDF').fill(password);
  await t.page.getByLabel('Confirm password').fill(password);
}

async function protectSelected(t, timeout = 120_000) {
  await enterPassword(t);
  return t.download(() => t.click('Protect and download'), timeout);
}

/** Real PDFs remain readable and encrypted; long, failed, cancelled, and background work is visible. */
export default async function (t) {
  await t.open('/protect-pdf');

  // A Unicode-named one-page PDF gets a distinct, encrypted, readable copy.
  const onePage = await t.pdf({ pages: 1, name: '계약서.résumé 📄.PDF' });
  await t.upload(onePage);
  const onePageResult = await protectSelected(t);
  t.assert(
    onePageResult.name === '계약서.résumé 📄_protected.pdf',
    `unexpected protected filename: ${onePageResult.name}`,
  );
  await assertProtectedPdf(t, onePageResult, 1, onePage.buffer.length);
  await t.waitForText('Password-protected copy downloaded. Both password fields have been cleared.');

  // A routine 30-page document finishes while another tab is in front.
  const thirtyPages = await t.pdf({ pages: 30, name: 'thirty-pages.pdf' });
  await t.upload(thirtyPages);
  await enterPassword(t);
  const background = await t.page.context().newPage();
  const thirtyPageResult = await t.download(async () => {
    await t.click('Protect and download');
    await t.waitForText(/Encrypting locally:/);
    await background.goto('about:blank');
    await background.bringToFront();
  }, 120_000);
  await t.page.bringToFront();
  await assertProtectedPdf(t, thirtyPageResult, 30, thirtyPages.buffer.length);
  await background.close();

  // A PDF built from an ordinary 12 MP phone image is not rejected or truncated.
  const imagePdf = await makeLargeImagePdf(t);
  await t.upload(imagePdf);
  const imageResult = await protectSelected(t, 180_000);
  t.assert(imageResult.name === '휴대폰-스캔_protected.pdf', `unexpected image-PDF name: ${imageResult.name}`);
  await assertProtectedPdf(t, imageResult, 1, imagePdf.buffer.length);

  // Cancelling invalidates the active worker: it must not download later, and retry must work.
  await t.upload(imagePdf);
  await enterPassword(t);
  let cancelledDownloads = 0;
  const countCancelledDownload = () => cancelledDownloads++;
  t.page.on('download', countCancelledDownload);
  await t.click('Protect and download');
  await t.page.getByRole('button', { name: 'Cancel' }).click({ force: true });
  await t.waitForText('Encryption cancelled. Your original PDF is still available.');
  await t.page.waitForTimeout(1_000);
  t.page.off('download', countCancelledDownload);
  t.assert(cancelledDownloads === 0, 'cancelled encryption still downloaded a late result');
  t.assert((await t.page.getByText('Password-protected copy downloaded.').count()) === 0, 'cancel showed success');
  const retry = await t.download(() => t.click('Protect and download'), 180_000);
  await assertProtectedPdf(t, retry, 1, imagePdf.buffer.length);

  // Existing encryption and damaged input produce distinct visible failures, never silent no-ops.
  await t.upload({ name: 'already-private.pdf', mimeType: 'application/pdf', buffer: onePageResult.bytes });
  await enterPassword(t, 'another password');
  await t.click('Protect and download');
  await t.page.getByRole('button', { name: 'Protect and download' }).waitFor({ timeout: 120_000 });
  const encryptedFailure = await t.page.locator('main').innerText();
  t.assert(
    encryptedFailure.includes('This PDF already needs a password to open. Remove its existing password first'),
    `encrypted PDF did not get the specific failure message: ${encryptedFailure}`,
  );

  await t.upload({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') });
  await enterPassword(t, 'another password');
  await t.click('Protect and download');
  await t.waitForText("Can't read this file as a PDF.");

  // The complete flow remains keyboard-operable and the dark phone layout does not overflow.
  await t.upload(onePage);
  await enterPassword(t);
  const protectButton = t.page.getByRole('button', { name: 'Protect and download' });
  await protectButton.focus();
  const keyboardResult = await t.download(() => t.page.keyboard.press('Enter'), 120_000);
  await assertProtectedPdf(t, keyboardResult, 1, onePage.buffer.length);

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

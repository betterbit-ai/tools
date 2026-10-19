import { PDFDocument } from 'pdf-lib';

async function assertReadablePdf(t, download, expectedPages) {
  const document = await PDFDocument.load(download.bytes);
  t.assert(
    document.getPageCount() === expectedPages,
    `expected ${expectedPages} pages, got ${document.getPageCount()}`,
  );
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

/** Page deletion stays responsive, preserves real PDF pages, and explains unsupported encrypted input. */
export default async function (t) {
  const encrypted = await makeEncryptedPdf(t);
  await t.open('/delete-pdf-pages');

  await t.upload({ name: 'private.pdf', mimeType: 'application/pdf', buffer: encrypted.bytes });
  await t.waitForText('This PDF is password-protected. Remove its password before deleting pages.');

  // A one-page PDF opens normally, but the only page cannot be deleted.
  const onePage = await t.pdf({ pages: 1, name: 'one-page.pdf' });
  await t.upload(onePage);
  await t.waitForText('1 page');
  await t.click('Mark page 1 for deletion');
  await t.waitForText('Keep at least one page in the PDF.');
  t.assert(await t.page.getByRole('button', { name: 'Download new PDF' }).isDisabled(), 'empty output was enabled');

  // A realistic multi-page job continues while the tab is in the background.
  const thirtyPages = await t.pdf({ pages: 30, name: 'thirty-pages.pdf' });
  await t.upload(thirtyPages);
  await t.waitForText(/Creating preview \d+ of 30/);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await t.waitForText('30 pages', 120_000);
  await t.page.bringToFront();
  await t.page.getByLabel('Pages to delete').fill('1, 15-16, 30');
  const thirtyPageResult = await t.download(() => t.click('Download new PDF'), 120_000);
  await assertReadablePdf(t, thirtyPageResult, 26);
  t.assert(thirtyPageResult.name === 'thirty-pages_pages-deleted.pdf', `unexpected name ${thirtyPageResult.name}`);
  await background.close();

  // Large embedded phone images remain intact because pages are copied, not rasterized again.
  const imagePdf = await makeImageHeavyPdf(t);
  await t.upload(imagePdf);
  await t.waitForText('2 pages', 120_000);
  await t.click('Mark page 1 for deletion');
  const imageResult = await t.download(() => t.click('Download new PDF'), 120_000);
  await assertReadablePdf(t, imageResult, 1);
  t.assert(imageResult.size > 100_000, `image-heavy output was unexpectedly tiny (${imageResult.size} bytes)`);

  // Cancelling preview work is explicit and returns to the initial state.
  await t.upload(thirtyPages);
  await t.waitForText(/Creating preview \d+ of 30/);
  await t.click('Cancel');
  await t.waitForText('Your PDF is read and saved in this browser. Nothing is uploaded.');
  t.assert((await t.page.getByText(/Creating preview/).count()) === 0, 'preview progress remained after cancellation');

  // Controls remain usable from a keyboard and the dark-mode phone layout does not overflow.
  await t.upload(onePage);
  await t.waitForText('1 page');
  const pageButton = t.page.getByRole('button', { name: 'Mark page 1 for deletion' });
  await pageButton.focus();
  await t.page.keyboard.press('Enter');
  await t.waitForText('Keep at least one page in the PDF.');
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

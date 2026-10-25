import { PDFDocument } from 'pdf-lib';

async function assertReadablePdf(t, download, expectedPages) {
  t.assert(download.size > 0, 'downloaded PDF was empty');
  const document = await PDFDocument.load(download.bytes);
  t.assert(
    document.getPageCount() === expectedPages,
    `expected ${expectedPages} pages, got ${document.getPageCount()}`,
  );
  return document;
}

async function makeImageHeavyPdf(t) {
  const image = await t.image({ width: 4032, height: 3024, type: 'image/png', name: 'phone-photo.png' });
  const document = await PDFDocument.create();
  const embedded = await document.embedPng(image.buffer);
  const portrait = document.addPage([3024, 4032]);
  portrait.drawImage(embedded, { x: 0, y: 0, width: 3024, height: 4032 });
  const landscape = document.addPage([4032, 3024]);
  landscape.drawImage(embedded, { x: 0, y: 0, width: 4032, height: 3024 });
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

/** Reordering stays responsive, preserves real pages, and explains unsupported encrypted input. */
export default async function (t) {
  const encrypted = await makeEncryptedPdf(t);
  await t.open('/reorder-pdf');

  await t.upload({ name: 'private.pdf', mimeType: 'application/pdf', buffer: encrypted.bytes });
  await t.waitForText('This PDF is password-protected. Remove its password before reordering it.');

  // A one-page document follows the same complete open-and-download path.
  const onePage = await t.pdf({ pages: 1, name: 'one-page.pdf' });
  await t.upload(onePage);
  await t.waitForText('1 page');
  const onePageResult = await t.download(() => t.click('Download reordered PDF'), 120_000);
  await assertReadablePdf(t, onePageResult, 1);
  t.assert(onePageResult.name === 'one-page_reordered.pdf', `unexpected name ${onePageResult.name}`);

  // A realistic multi-page job reports progress and continues in a background tab.
  const thirtyPages = await t.pdf({ pages: 30, name: 'thirty-pages.pdf' });
  await t.upload(thirtyPages);
  await t.waitForText(/Creating preview \d+ of 30/);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await t.waitForText('30 pages', 120_000);
  await t.page.bringToFront();
  await t.click('Reverse order');
  const thirtyPageResult = await t.download(() => t.click('Download reordered PDF'), 120_000);
  await assertReadablePdf(t, thirtyPageResult, 30);
  await background.close();

  // Large embedded phone images stay intact, and keyboard reordering reaches the downloaded file.
  const imagePdf = await makeImageHeavyPdf(t);
  await t.upload(imagePdf);
  await t.waitForText('2 pages', 120_000);
  const moveSecondEarlier = t.page.getByRole('button', { name: 'Move original page 2 earlier' });
  await moveSecondEarlier.focus();
  await t.page.keyboard.press('Enter');
  const imageResult = await t.download(() => t.click('Download reordered PDF'), 120_000);
  const imageDocument = await assertReadablePdf(t, imageResult, 2);
  t.assert(imageResult.size > 100_000, `image-heavy output was unexpectedly tiny (${imageResult.size} bytes)`);
  t.assert(imageDocument.getPage(0).getWidth() === 4032, 'keyboard reorder did not put landscape page first');
  t.assert(imageDocument.getPage(1).getWidth() === 3024, 'keyboard reorder did not put portrait page second');

  // Cancelling preview work is explicit and returns to the initial state.
  await t.upload(thirtyPages);
  await t.waitForText(/Creating preview \d+ of 30/);
  await t.click('Cancel');
  await t.waitForText('Your PDF is read and saved in this browser. Nothing is uploaded.');
  t.assert((await t.page.getByText(/Creating preview/).count()) === 0, 'preview progress remained after cancellation');

  // The dark-mode phone layout remains usable without horizontal overflow.
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

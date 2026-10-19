import { PDFDocument } from 'pdf-lib';

async function assertReadablePdf(t, download, expectedPages) {
  const document = await PDFDocument.load(download.bytes);
  t.assert(
    document.getPageCount() === expectedPages,
    `expected ${expectedPages} pages, got ${document.getPageCount()}`,
  );
}

async function makeImagePdf(t) {
  const image = await t.image({ width: 4032, height: 3024, type: 'image/png', name: 'phone-scan.png' });
  const document = await PDFDocument.create();
  const embedded = await document.embedPng(image.buffer);
  const page = document.addPage([595, 842]);
  page.drawImage(embedded, { x: 0, y: 198, width: 595, height: 446 });
  return {
    name: 'phone-scan.pdf',
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

/** Real PDFs stay readable, ordinary 30-page jobs finish in a background tab, and failures are explicit. */
export default async function (t) {
  const encrypted = await makeEncryptedPdf(t);
  await t.open('/compress-pdf');

  await t.upload({ name: 'private.pdf', mimeType: 'application/pdf', buffer: encrypted.bytes });
  await t.waitForText('This PDF is password-protected. Remove its password before compressing it.');

  // A compact text PDF is never presented as successfully compressed.
  const onePage = await t.pdf({ pages: 1, name: 'one-page.pdf' });
  await t.upload(onePage);
  await t.waitForText('Keep your original — this PDF is already compact');
  const rebuilt = await t.download(() => t.click('Download the rebuilt PDF anyway'));
  await assertReadablePdf(t, rebuilt, 1);
  t.assert(rebuilt.size > onePage.buffer.length, 'the text-PDF warning should correspond to a larger rebuilt file');

  // The default level previously rejected an ordinary 30-page A4 PDF on a cumulative pixel counter.
  const thirtyPages = await t.pdf({ pages: 30, name: 'thirty-pages.pdf' });
  await t.upload(thirtyPages);
  await t.waitForText(/Compressing page \d+ of 30/);
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await t.waitForText('Keep your original — this PDF is already compact', 120_000);
  await t.page.bringToFront();
  const thirtyPageResult = await t.download(() => t.click('Download the rebuilt PDF anyway'));
  await assertReadablePdf(t, thirtyPageResult, 30);
  await background.close();

  // Image-heavy input should produce a genuinely smaller, readable PDF.
  const imagePdf = await makeImagePdf(t);
  await t.upload(imagePdf);
  await t.waitForText('Compressed PDF ready', 120_000);
  const compressed = await t.download(() => t.click('Download compressed PDF'));
  await assertReadablePdf(t, compressed, 1);
  t.assert(
    compressed.size < imagePdf.buffer.length,
    `expected ${compressed.size} bytes to be below ${imagePdf.buffer.length}`,
  );

  // Cancelling a long job returns the UI to its initial state.
  await t.upload(thirtyPages);
  await t.waitForText(/Compressing page \d+ of 30/);
  await t.click('Cancel');
  await t.waitForText('Your PDF is compressed in this browser. Nothing is uploaded.');
  t.assert((await t.page.getByText(/Compressing page/).count()) === 0, 'progress remained visible after cancellation');

  // The controls remain keyboard-operable and the panel does not overflow a dark-mode phone viewport.
  const smaller = t.page.getByRole('radio', { name: 'Smaller' });
  await smaller.focus();
  await t.page.keyboard.press('Enter');
  t.assert(
    (await smaller.getAttribute('aria-checked')) === 'true',
    'compression level did not change from the keyboard',
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
}

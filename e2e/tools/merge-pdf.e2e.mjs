import { PDFDocument } from 'pdf-lib';

async function makeSizedPdf(width, height, name) {
  const document = await PDFDocument.create();
  document.addPage([width, height]);
  return { name, mimeType: 'application/pdf', buffer: Buffer.from(await document.save()) };
}

async function makeImagePdf(t) {
  const photo = await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-photo.jpg' });
  const document = await PDFDocument.create();
  const image = await document.embedJpg(photo.buffer);
  const page = document.addPage([595, 842]);
  page.drawImage(image, { x: 0, y: 198, width: 595, height: 446 });
  return {
    name: 'large-image-scan.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save({ useObjectStreams: false })),
  };
}

async function makeEncryptedPdf(t) {
  const source = await t.pdf({ pages: 1, name: 'private-source.pdf' });
  await t.open('/protect-pdf');
  await t.upload(source);
  await t.page.getByLabel('Password to open the PDF').fill('correct horse battery staple');
  await t.page.getByLabel('Confirm password').fill('correct horse battery staple');
  const protectedPdf = await t.download(() => t.click('Protect and download'), 90_000);
  return { name: 'private.pdf', mimeType: 'application/pdf', buffer: protectedPdf.bytes };
}

async function waitForDownloadButton(t, timeout = 120_000) {
  await t.page.waitForFunction(
    () => {
      const button = [...document.querySelectorAll('button')].find(
        (candidate) => candidate.textContent?.trim() === 'Download merged PDF',
      );
      return button && !button.disabled;
    },
    undefined,
    { timeout, polling: 100 },
  );
}

async function assertReadablePdf(t, download, expectedPages) {
  t.assert(download.size > 0, 'downloaded PDF was empty');
  const document = await PDFDocument.load(download.bytes);
  t.assert(
    document.getPageCount() === expectedPages,
    `expected ${expectedPages} pages, got ${document.getPageCount()}`,
  );
  return document;
}

/** Realistic PDFs merge in order in a background tab; invalid input and cancellation stay visible. */
export default async function (t) {
  const encrypted = await makeEncryptedPdf(t);
  const onePage = await makeSizedPdf(320, 480, 'one-page.pdf');
  const thirtyPages = await t.pdf({ pages: 30, name: 'thirty-pages.pdf' });
  const imagePdf = await makeImagePdf(t);

  await t.open('/merge-pdf');
  await t.upload([onePage, thirtyPages, imagePdf]);

  // Keyboard reordering changes the page order in the actual download.
  const moveOnePageDown = t.page.locator('li', { hasText: 'one-page.pdf' }).getByRole('button', { name: 'Move down' });
  await moveOnePageDown.focus();
  await t.page.keyboard.press('Enter');

  // Inspection and merging continue while another tab is in front.
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await waitForDownloadButton(t);
  await t.page.bringToFront();

  const merged = await t.download(() => t.click('Download merged PDF'));
  const mergedDocument = await assertReadablePdf(t, merged, 32);
  t.assert(merged.name === 'merged.pdf', `unexpected download name: ${merged.name}`);
  t.assert(mergedDocument.getPage(0).getWidth() === 595, 'keyboard reorder did not move the 30-page PDF first');
  t.assert(mergedDocument.getPage(30).getWidth() === 320, 'the one-page PDF did not move to the second position');
  await background.close();

  // Password-protected and corrupt rows are explicit and skipped; valid files still merge.
  await t.click('Clear all');
  await t.upload([
    onePage,
    encrypted,
    { name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') },
  ]);
  await t.page
    .getByText("Password-protected — can't be merged until it's unlocked.", { exact: true })
    .waitFor({ timeout: 30_000 });
  await t.page.getByText("Can't be read — this file isn't a valid PDF.", { exact: true }).waitFor({ timeout: 30_000 });
  const privateRow = await t.page.locator('li', { hasText: 'private.pdf' }).innerText();
  t.assert(
    privateRow.includes("Password-protected — can't be merged until it's unlocked."),
    `encrypted PDF was not identified: ${privateRow}`,
  );
  await waitForDownloadButton(t);
  const validOnly = await t.download(() => t.click('Download merged PDF'));
  await assertReadablePdf(t, validOnly, 1);

  // A many-file job reports progress and can be stopped without discarding the input list.
  await t.click('Clear all');
  const longBatch = Array.from({ length: 20 }, (_, index) => ({
    ...thirtyPages,
    name: `batch-${String(index + 1).padStart(2, '0')}.pdf`,
  }));
  await t.upload(longBatch);
  await t.waitForText(/Merging file \d+ of 20:/, 120_000);
  await t.click('Cancel');
  await t.waitForText('Merge canceled. Your files are still here.');
  t.assert((await t.page.getByText(/Merging file \d+ of 20:/).count()) === 0, 'progress remained after cancellation');
  t.assert(
    (await t.page.locator('li', { hasText: /batch-\d+\.pdf/ }).count()) === 20,
    'canceling discarded input files',
  );

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

import { PDFDocument } from 'pdf-lib';

const TEST_PASSWORD = 'correct horse 🔐 battery staple';

async function makeImageHeavyPdf(t) {
  const image = await t.image({ width: 4032, height: 3024, type: 'image/png', name: 'phone-photo.png' });
  const document = await PDFDocument.create();
  const embedded = await document.embedPng(image.buffer);
  for (let pageNumber = 0; pageNumber < 3; pageNumber++) {
    const page = document.addPage([3024, 4032]);
    page.drawImage(embedded, { x: 0, y: 0, width: 3024, height: 4032 });
  }
  return {
    name: '휴대폰-스캔.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save({ useObjectStreams: false })),
  };
}

async function protectPdf(t, source) {
  await t.open('/protect-pdf');
  await t.upload(source);
  await t.page.getByLabel('Password to open the PDF').fill(TEST_PASSWORD);
  await t.page.getByLabel('Confirm password').fill(TEST_PASSWORD);
  const protectedPdf = await t.download(() => t.click('Protect and download'), 180_000);

  let openedWithoutPassword = true;
  try {
    await PDFDocument.load(protectedPdf.bytes);
  } catch (error) {
    openedWithoutPassword = false;
    t.assert(/encrypted/i.test(String(error)), `protected fixture failed unexpectedly: ${String(error)}`);
  }
  t.assert(!openedWithoutPassword, 'the protected fixture opened without its password');
  return { name: source.name, mimeType: 'application/pdf', buffer: protectedPdf.bytes };
}

async function unlockSelected(t, timeout = 180_000) {
  await t.page.getByLabel('Current PDF password').fill(TEST_PASSWORD);
  return t.download(() => t.click('Unlock and download'), timeout);
}

async function assertUnlockedPdf(t, download, expectedPages, sourceSize) {
  t.assert(download.size > 0, 'the unlocked PDF download was empty');
  const document = await PDFDocument.load(download.bytes);
  t.assert(
    document.getPageCount() === expectedPages,
    `expected ${expectedPages} pages, got ${document.getPageCount()}`,
  );
  t.assert(
    download.size > sourceSize / 4,
    `the unlocked PDF was unexpectedly small (${download.size} bytes from ${sourceSize} bytes)`,
  );
}

/** Known-password decryption preserves real documents, remains responsive, and explains every failure. */
export default async function (t) {
  const onePage = await protectPdf(t, await t.pdf({ pages: 1, name: '계약서.résumé 📄.PDF' }));
  const thirtyPages = await protectPdf(t, await t.pdf({ pages: 30, name: 'thirty-pages.pdf' }));
  const imagePdf = await protectPdf(t, await makeImageHeavyPdf(t));

  await t.open('/unlock-pdf');

  // A Unicode-named one-page PDF gets a distinct, readable, unencrypted copy.
  await t.upload(onePage);
  const onePageResult = await unlockSelected(t);
  t.assert(
    onePageResult.name === '계약서.résumé 📄_unlocked.pdf',
    `unexpected unlocked filename: ${onePageResult.name}`,
  );
  await assertUnlockedPdf(t, onePageResult, 1, onePage.buffer.length);
  await t.waitForText('Unlocked copy downloaded. The password field has been cleared.');

  // A routine 30-page document finishes while another tab is in front.
  await t.upload(thirtyPages);
  await t.page.getByLabel('Current PDF password').fill(TEST_PASSWORD);
  const background = await t.page.context().newPage();
  const thirtyPageResult = await t.download(async () => {
    await t.click('Unlock and download');
    await t.waitForText(/Unlocking locally:/);
    await background.goto('about:blank');
    await background.bringToFront();
  }, 180_000);
  await t.page.bringToFront();
  await assertUnlockedPdf(t, thirtyPageResult, 30, thirtyPages.buffer.length);
  await background.close();

  // A PDF made from an ordinary 12 MP phone image is not rejected or truncated.
  await t.upload(imagePdf);
  const imageResult = await unlockSelected(t);
  t.assert(imageResult.name === '휴대폰-스캔_unlocked.pdf', `unexpected image-PDF name: ${imageResult.name}`);
  await assertUnlockedPdf(t, imageResult, 3, imagePdf.buffer.length);

  // Wrong passwords and damaged files produce distinct visible failures.
  await t.upload(onePage);
  await t.page.getByLabel('Current PDF password').fill('wrong password');
  await t.click('Unlock and download');
  await t.page.getByRole('button', { name: 'Unlock and download' }).waitFor({ timeout: 180_000 });
  const wrongPasswordFailure = await t.page.locator('main').innerText();
  t.assert(
    wrongPasswordFailure.includes("That password didn't unlock this PDF. Check the password and try again."),
    `wrong password did not get the specific failure message: ${wrongPasswordFailure}`,
  );

  await t.upload({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') });
  await t.click('Unlock and download');
  await t.waitForText("Can't read this file as a PDF.");

  // Cancelling invalidates the active worker: no late download, and retry still works.
  await t.upload(imagePdf);
  await t.page.getByLabel('Current PDF password').fill(TEST_PASSWORD);
  let cancelledDownloads = 0;
  const countCancelledDownload = () => cancelledDownloads++;
  t.page.on('download', countCancelledDownload);
  await t.click('Unlock and download');
  await t.page.getByRole('button', { name: 'Cancel' }).click({ force: true });
  await t.waitForText('Unlocking cancelled. Your original PDF is still available.');
  await t.page.waitForTimeout(1_000);
  t.page.off('download', countCancelledDownload);
  t.assert(cancelledDownloads === 0, 'cancelled unlocking still downloaded a late result');
  const retry = await t.download(() => t.click('Unlock and download'), 180_000);
  await assertUnlockedPdf(t, retry, 3, imagePdf.buffer.length);

  // The complete flow remains keyboard-operable and the dark phone layout does not overflow.
  await t.upload(onePage);
  await t.page.getByLabel('Current PDF password').fill(TEST_PASSWORD);
  const unlockButton = t.page.getByRole('button', { name: 'Unlock and download' });
  await unlockButton.focus();
  const keyboardResult = await t.download(() => t.page.keyboard.press('Enter'), 180_000);
  await assertUnlockedPdf(t, keyboardResult, 1, onePage.buffer.length);

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

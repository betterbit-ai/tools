import { PDFDict, PDFDocument, PDFName } from 'pdf-lib';

async function assertReadablePdf(t, download, expectedPages) {
  t.assert(download.size > 0, 'the signed PDF download was empty');
  const document = await PDFDocument.load(download.bytes);
  t.assert(
    document.getPageCount() === expectedPages,
    `expected ${expectedPages} pages in the signed PDF, got ${document.getPageCount()}`,
  );
}

async function imageCountsByPage(bytes) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map((page) => {
    const resources = page.node.Resources();
    const xObjects = resources.lookupMaybe(PDFName.of('XObject'), PDFDict);
    return xObjects ? [...xObjects.keys()].length : 0;
  });
}

async function makePhonePhotoPdf(t) {
  const photo = await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-photo.jpg' });
  const document = await PDFDocument.create();
  const image = await document.embedJpg(photo.buffer);
  const page = document.addPage([595, 842]);
  page.drawImage(image, { x: 0, y: 198, width: 595, height: 446 });
  return {
    name: 'phone-scan.pdf',
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

async function waitForReadyPreview(t) {
  await t.page.waitForFunction(
    () => {
      const button = [...document.querySelectorAll('button')].find(
        (candidate) => candidate.textContent?.trim() === 'Download signed PDF',
      );
      return button && !button.disabled;
    },
    undefined,
    { timeout: 120_000, polling: 100 },
  );
}

/** Real PDFs stay readable and private; long work is visible, cancellable, and background-safe. */
export default async function (t) {
  const encrypted = await makeEncryptedPdf(t);
  await t.open('/sign-pdf');

  // Existing encryption is identified instead of becoming a generic or silent failure.
  await t.upload({ name: 'private.pdf', mimeType: 'application/pdf', buffer: encrypted.bytes });
  await t.waitForText('This PDF is password-protected and can’t be signed here. Remove the password first.');

  // A Unicode-named one-page PDF can be signed entirely by keyboard and opens again with a signature image.
  const contract = await t.pdf({ pages: 1, name: '근로계약서.résumé 📄.PDF' });
  await t.upload(contract);
  const typeMode = t.page.getByRole('radio', { name: 'Type' });
  await typeMode.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await typeMode.getAttribute('aria-checked')) === 'true', 'typed signature mode did not work by keyboard');
  await t.page.getByLabel('Your name').fill('홍길동');
  await waitForReadyPreview(t);
  const signaturePosition = t.page.getByRole('button', { name: /Signature position/ });
  await signaturePosition.focus();
  await t.page.keyboard.press('ArrowLeft');
  const downloadButton = t.page.getByRole('button', { name: 'Download signed PDF' });
  await downloadButton.focus();
  const signed = await t.download(() => t.page.keyboard.press('Enter'), 120_000);
  t.assert(signed.name === '근로계약서.résumé 📄_signed.pdf', `unexpected signed filename: ${signed.name}`);
  await assertReadablePdf(t, signed, 1);
  t.assert(
    signed.size > contract.buffer.length,
    'the text-only contract did not grow after a signature image was embedded',
  );
  const onePageImages = await imageCountsByPage(signed.bytes);
  t.assert(onePageImages[0] === 1, `expected one signature image on the page, got ${onePageImages[0]}`);
  await t.waitForText('Your signed PDF has been downloaded.');

  // A routine 30-page signing job exposes progress, can be cancelled without a late download, and retries cleanly.
  const thirtyPages = await t.pdf({ pages: 30, name: 'thirty-pages.pdf' });
  await t.upload(thirtyPages);
  await waitForReadyPreview(t);
  await t.page.getByLabel('Page to sign').fill('15');
  await waitForReadyPreview(t);
  await t.page.evaluate(() => {
    const original = Worker.prototype.postMessage;
    window.__signPdfOriginalPostMessage = original;
    Worker.prototype.postMessage = function (message, ...rest) {
      if (message?.type === 'sign') {
        window.__signPdfHeldMessage = () => original.call(this, message, ...rest);
        return;
      }
      return original.call(this, message, ...rest);
    };
  });
  let cancelledDownloads = 0;
  const countCancelledDownload = () => cancelledDownloads++;
  t.page.on('download', countCancelledDownload);
  await t.click('Download signed PDF');
  await t.waitForText('Signing in a background worker…');
  await t.click('Cancel');
  await t.waitForText('Signing cancelled. Your original PDF is unchanged.');
  await t.page.evaluate(() => {
    Worker.prototype.postMessage = window.__signPdfOriginalPostMessage;
    try {
      window.__signPdfHeldMessage?.();
    } catch {
      // The cancelled worker was terminated, so a held message may no longer be accepted.
    }
  });
  await t.page.waitForTimeout(500);
  t.page.off('download', countCancelledDownload);
  t.assert(cancelledDownloads === 0, 'cancelled signing still downloaded a late result');

  const background = await t.page.context().newPage();
  const thirtyPageResult = await t.download(async () => {
    await t.click('Download signed PDF');
    await background.goto('about:blank');
    await background.bringToFront();
  }, 120_000);
  await t.page.bringToFront();
  await assertReadablePdf(t, thirtyPageResult, 30);
  const thirtyPageImages = await imageCountsByPage(thirtyPageResult.bytes);
  t.assert(
    thirtyPageImages.every((count, index) => count === (index === 14 ? 1 : 0)),
    `signature image was on the wrong page: ${thirtyPageImages.join(', ')}`,
  );
  await background.close();

  // A PDF made from an ordinary 12MP phone photo preserves its page and original image while adding the signature.
  const phoneScan = await makePhonePhotoPdf(t);
  await t.upload(phoneScan);
  await waitForReadyPreview(t);
  const phoneResult = await t.download(() => t.click('Download signed PDF'), 120_000);
  await assertReadablePdf(t, phoneResult, 1);
  const phoneImages = await imageCountsByPage(phoneResult.bytes);
  t.assert(
    phoneImages[0] === 2,
    `phone scan should keep its photo and add one signature, got ${phoneImages[0]} images`,
  );
  t.assert(
    phoneResult.size > phoneScan.buffer.length / 2,
    `phone scan output was unexpectedly small (${phoneResult.size} bytes from ${phoneScan.buffer.length})`,
  );

  // Corrupt input produces an actionable error instead of leaving a stale success state behind.
  await t.upload({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') });
  await t.waitForText("That file isn't a readable PDF.");
  t.assert(
    (await t.page.getByText('Your signed PDF has been downloaded.').count()) === 0,
    'a broken replacement retained a stale success message',
  );

  // Rapid replacement cancels stale parsing/rendering; only the newest file can become downloadable.
  const slowReplacementSource = await t.pdf({ pages: 30, name: 'slow-to-open.pdf' });
  const replacement = await t.pdf({ pages: 1, name: 'replacement.pdf' });
  await t.upload(slowReplacementSource);
  await t.upload(replacement);
  await waitForReadyPreview(t);
  const replacementResult = await t.download(() => t.click('Download signed PDF'), 120_000);
  t.assert(
    replacementResult.name === 'replacement_signed.pdf',
    `stale parsing replaced the newest upload: ${replacementResult.name}`,
  );
  await assertReadablePdf(t, replacementResult, 1);

  // The complete panel still fits a dark phone viewport.
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

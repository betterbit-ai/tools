import { PDFDict, PDFDocument, PDFName } from 'pdf-lib';

async function imageNamesByPage(bytes) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map((page) => {
    const resources = page.node.Resources();
    const xObjects = resources.lookupMaybe(PDFName.of('XObject'), PDFDict);
    return xObjects ? [...xObjects.keys()].map((name) => name.asString()) : [];
  });
}

async function makeLargeImagePdf(t) {
  const image = await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-scan.jpg' });
  const document = await PDFDocument.create();
  const embedded = await document.embedJpg(image.buffer);
  const page = document.addPage([595, 842]);
  page.drawImage(embedded, { x: 0, y: 198, width: 595, height: 446 });
  return {
    name: '휴대폰-스캔.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save({ useObjectStreams: false })),
  };
}

/** Text and image layers survive in the downloaded PDF, including selected pages and a routine 12 MP scan. */
export default async function (t) {
  await t.open('/watermark-pdf');

  const source = await t.pdf({ pages: 4, name: '계약서.résumé 📄.PDF' });
  await t.upload(source);
  await t.waitForText('4 pages');
  await t.page.getByLabel('Watermark text').fill('대외비 🔒 SAMPLE');
  const choosePages = t.page.getByRole('radio', { name: 'Choose pages' });
  await choosePages.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await choosePages.getAttribute('aria-checked')) === 'true', 'page selector did not work by keyboard');
  await t.page.getByLabel('Page numbers').fill('1, 3-4');
  const textResult = await t.download(() => t.click('Add watermark and download'), 120_000);
  t.assert(
    textResult.name === '계약서.résumé 📄_watermarked.pdf',
    `unexpected watermarked filename: ${textResult.name}`,
  );
  const textDocument = await PDFDocument.load(textResult.bytes);
  t.assert(textDocument.getPageCount() === 4, `expected 4 pages, got ${textDocument.getPageCount()}`);
  const textImages = await imageNamesByPage(textResult.bytes);
  t.assert(
    textImages[0].length > 0 && textImages[1].length === 0 && textImages[2].length > 0 && textImages[3].length > 0,
    `watermark image layers were on the wrong pages: ${textImages.map((names) => names.length).join(', ')}`,
  );
  await t.waitForText('The watermarked PDF has been downloaded.');

  // A transparent logo is accepted through the second dropzone and appears on every page.
  await t.upload(source);
  await t.waitForText('4 pages');
  await t.click('Image or logo');
  const logo = await t.image({ width: 400, height: 120, type: 'image/png', name: 'brand-logo.png' });
  await t.page.locator('input[type=file]').nth(1).setInputFiles(logo);
  await t.waitForText('brand-logo.png');
  const logoResult = await t.download(() => t.click('Add watermark and download'), 120_000);
  const logoDocument = await PDFDocument.load(logoResult.bytes);
  t.assert(logoDocument.getPageCount() === 4, 'logo watermark changed the page count');
  const logoImages = await imageNamesByPage(logoResult.bytes);
  t.assert(
    logoImages.every((names) => names.length > 0),
    `logo did not appear on all pages: ${logoImages.map((names) => names.length).join(', ')}`,
  );

  // A PDF built from an ordinary 12 MP phone image is preserved and remains readable.
  const imagePdf = await makeLargeImagePdf(t);
  await t.upload(imagePdf);
  await t.waitForText('1 pages');
  await t.click('Text');
  const imagePdfResult = await t.download(() => t.click('Add watermark and download'), 180_000);
  const imagePdfDocument = await PDFDocument.load(imagePdfResult.bytes);
  t.assert(imagePdfDocument.getPageCount() === 1, '12 MP scan watermark output lost its page');
  t.assert(imagePdfResult.size > imagePdf.buffer.length / 2, '12 MP scan watermark output was unexpectedly small');

  // The page remains usable by keyboard and at a dark 375px viewport.
  const action = t.page.getByRole('button', { name: 'Add watermark and download' });
  await action.focus();
  const keyboardResult = await t.download(() => t.page.keyboard.press('Enter'), 180_000);
  t.assert(keyboardResult.size > 0, 'keyboard activation did not download a PDF');

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

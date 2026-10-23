import { PDFDocument } from 'pdf-lib';

async function assertReadablePdf(t, download, expectedPages) {
  t.assert(download.size > 0, 'the signed PDF download was empty');
  const document = await PDFDocument.load(download.bytes);
  t.assert(
    document.getPageCount() === expectedPages,
    `expected ${expectedPages} pages in the signed PDF, got ${document.getPageCount()}`,
  );
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

async function waitForReadyPreview(t) {
  await t.page.getByLabel('Page to sign').waitFor({ timeout: 120_000 });
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

/** Real PDFs remain private, printable and keyboard-usable, including phone-photo scans and rapid replacement. */
export default async function (t) {
  await t.open('/sign-pdf');

  // Corrupt input produces an actionable error instead of leaving a stale file state behind.
  await t.upload({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') });
  await t.waitForText("That file isn't a readable PDF.");

  const contract = await t.pdf({ pages: 3, name: '근로계약서.pdf' });
  await t.upload(contract);
  await t.page.getByRole('radio', { name: 'Type' }).click();
  await t.page.getByLabel('Your name').fill('홍길동');
  await waitForReadyPreview(t);
  const signaturePosition = t.page.getByRole('button', { name: /Signature position/ });
  await signaturePosition.focus();
  await t.page.keyboard.press('ArrowLeft');

  // A keyboard-adjusted, typed signature is embedded on the selected (middle) page.
  const pageField = t.page.getByLabel('Page to sign');
  await pageField.fill('2');
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
  const signed = await t.download(() => t.click('Download signed PDF'), 120_000);
  t.assert(signed.name === '근로계약서_signed.pdf', `unexpected signed filename: ${signed.name}`);
  await assertReadablePdf(t, signed, 3);
  t.assert(
    signed.size > contract.buffer.length,
    'the text-only contract did not grow after a signature image was embedded',
  );

  // A user can choose a new PDF before a previous parse/render finishes; only the newest file may win.
  const slow = await t.pdf({ pages: 30, name: 'slow-to-open.pdf' });
  const replacement = await t.pdf({ pages: 1, name: 'replacement.pdf' });
  await t.upload(slow);
  await t.upload(replacement);
  await t.waitForText('replacement.pdf');
  await t.page.waitForFunction(
    () => document.querySelector('main')?.textContent?.includes('1 pages') ?? false,
    undefined,
    { timeout: 120_000, polling: 100 },
  );
  const replacementDownload = await t.download(() => t.click('Download signed PDF'), 120_000);
  t.assert(
    replacementDownload.name === 'replacement_signed.pdf',
    `stale file replaced the newest upload: ${replacementDownload.name}`,
  );
  await assertReadablePdf(t, replacementDownload, 1);

  // A 12MP phone photo scan stays readable after signing, and the dark mobile panel has no horizontal overflow.
  const phoneScan = await makePhonePhotoPdf(t);
  await t.upload(phoneScan);
  await t.waitForText('phone-scan.pdf');
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
  const phoneResult = await t.download(() => t.click('Download signed PDF'), 120_000);
  await assertReadablePdf(t, phoneResult, 1);
  t.assert(phoneResult.size > 100_000, `phone scan output was unexpectedly small (${phoneResult.size} bytes)`);

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

import { unzipSync } from 'fflate';
import { PDFDocument } from 'pdf-lib';

async function makeImagePdf(t, pages = 1, name = 'phone-scan.pdf') {
  const photo = await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'phone-photo.jpg' });
  const document = await PDFDocument.create();
  const image = await document.embedJpg(photo.buffer);
  for (let index = 0; index < pages; index++) {
    const page = document.addPage([595, 842]);
    page.drawImage(image, { x: 0, y: 198, width: 595, height: 446 });
  }
  return {
    name,
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

async function waitForReady(t, timeout = 120_000) {
  await t.page.waitForFunction(
    () => {
      const button = [...document.querySelectorAll('button')].find((candidate) =>
        ['Download PDF', 'Download ZIP'].includes(candidate.textContent?.trim() ?? ''),
      );
      return button && !button.disabled;
    },
    undefined,
    { timeout, polling: 100 },
  );
}

async function assertReadablePdf(t, bytes, expectedPages) {
  const document = await PDFDocument.load(bytes);
  t.assert(
    document.getPageCount() === expectedPages,
    `expected ${expectedPages} pages, got ${document.getPageCount()}`,
  );
  return document;
}

/** Realistic PDFs split into readable outputs; long, failed, cancelled, and background work stays visible. */
export default async function (t) {
  const encrypted = await makeEncryptedPdf(t);
  const onePage = await t.pdf({ pages: 1, name: 'one-page.pdf' });
  const thirtyPages = await t.pdf({ pages: 30, name: 'thirty-pages.pdf' });
  const imagePdf = await makeImagePdf(t);
  const longImagePdf = await makeImagePdf(t, 30, 'thirty-page-scan.pdf');

  await t.open('/split-pdf');

  // A one-page input produces a directly downloadable, readable PDF.
  await t.upload(onePage);
  await waitForReady(t);
  const single = await t.download(() => t.click('Download PDF'));
  t.assert(single.name === 'one-page_p1.pdf', `unexpected one-page filename: ${single.name}`);
  await assertReadablePdf(t, single.bytes, 1);

  // A routine 30-page document splits into three chunks while another tab is in front.
  await t.upload(thirtyPages);
  const everyMode = t.page.getByRole('radio', { name: 'Every N pages' });
  await everyMode.focus();
  await t.page.keyboard.press('Enter');
  await t.page.getByLabel('Pages per file').fill('10');
  const background = await t.page.context().newPage();
  await background.goto('about:blank');
  await background.bringToFront();
  await waitForReady(t);
  await t.page.bringToFront();
  const chunks = await t.download(() => t.click('Download ZIP'));
  t.assert(chunks.name === 'thirty-pages_split.zip', `unexpected ZIP filename: ${chunks.name}`);
  const entries = unzipSync(chunks.bytes);
  const names = Object.keys(entries).sort();
  t.assert(names.length === 3, `expected 3 PDF parts, got ${names.length}`);
  t.assert(
    names.join(',') === 'thirty-pages_p1-10.pdf,thirty-pages_p11-20.pdf,thirty-pages_p21-30.pdf',
    `unexpected ZIP entries: ${names.join(', ')}`,
  );
  for (const name of names) await assertReadablePdf(t, entries[name], 10);
  await background.close();

  // A PDF made from a 12 MP phone image remains readable and is not truncated.
  await t.upload(imagePdf);
  await waitForReady(t);
  const imageResult = await t.download(() => t.click('Download PDF'));
  await assertReadablePdf(t, imageResult.bytes, 1);
  t.assert(
    imageResult.size >= imagePdf.buffer.length * 0.8,
    `image PDF was unexpectedly tiny (${imageResult.size} bytes from ${imagePdf.buffer.length} bytes)`,
  );

  // Existing encryption and damaged files produce distinct visible errors, never silent no-ops.
  await t.upload(encrypted);
  await t.waitForText("Password-protected — can't be split until it's unlocked.");
  t.assert(
    (await t.page.getByRole('button', { name: /Download/ }).count()) === 0,
    'encrypted input exposed a download',
  );
  await t.upload({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') });
  await t.waitForText("Can't be read — this file isn't a valid PDF.");

  // A long split reports determinate progress and cancellation cannot publish a late result.
  await t.page.evaluate(() => {
    const NativeWorker = window.Worker;
    window.__splitPdfNativeWorker = NativeWorker;
    window.Worker = class extends NativeWorker {
      set onmessage(listener) {
        this.__splitPdfListener = listener;
        this.addEventListener('message', (event) => {
          if (event.data?.action === 'complete') {
            setTimeout(() => listener?.call(this, event), 1_500);
          } else {
            listener?.call(this, event);
          }
        });
      }

      get onmessage() {
        return this.__splitPdfListener;
      }
    };
  });
  await t.upload(longImagePdf);
  await t.waitForText('30 page(s)');
  await t.page.getByLabel('Pages per file').fill('1');
  await t.waitForText(/Splitting part \d+ of 30/);
  await t.click('Cancel');
  await t.waitForText('Split cancelled. Your original PDF is still available.');
  await t.page.evaluate(() => {
    window.Worker = window.__splitPdfNativeWorker;
  });
  await t.page.waitForTimeout(1_750);
  t.assert((await t.page.getByText(/file\(s\) ready/).count()) === 0, 'cancelled work exposed late results');
  t.assert((await t.page.getByText('thirty-page-scan.pdf').count()) > 0, 'cancelling discarded the source PDF');

  // The tool can resume, and its dark-mode phone layout does not overflow.
  await t.click('Resume splitting');
  await waitForReady(t, 180_000);
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

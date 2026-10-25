import { PDFDocument } from 'pdf-lib';

async function pageText(pdfBytes) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBytes) });
  try {
    const document = await loadingTask.promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const text = await page.getTextContent();
      pages.push(text.items.map((item) => item.str).join(' '));
      page.cleanup();
    }
    return pages;
  } finally {
    await loadingTask.destroy();
  }
}

/** A report can skip its cover, number only its body, and retain every original PDF page. */
export default async function (t) {
  await t.open('/pdf-page-numbers');
  await t.upload(await t.pdf({ pages: 5, name: 'report.pdf' }));
  await t.waitForText('5 pages');

  await t.click('Skip cover page');
  await t.page.getByLabel('Position').selectOption('top-right');
  const fraction = t.page.getByRole('radio', { name: '1/10' });
  await fraction.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await fraction.getAttribute('aria-checked')) === 'true', 'format did not change with the keyboard');

  const download = await t.download(() => t.click('Add numbers & download'));
  t.assert(download.name === 'report_numbered.pdf', `unexpected download name ${download.name}`);
  const document = await PDFDocument.load(download.bytes);
  t.assert(document.getPageCount() === 5, `expected 5 pages, got ${document.getPageCount()}`);

  const text = await pageText(download.bytes);
  t.assert(!text[0].includes('1/4'), 'cover page unexpectedly has a page number');
  for (const [index, label] of ['1/4', '2/4', '3/4', '4/4'].entries()) {
    t.assert(text[index + 1].includes(label), `page ${index + 2} is missing ${label}`);
  }

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

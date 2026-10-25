import { PDFDocument, StandardFonts } from 'pdf-lib';

async function textPdf() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const text of ['Quarterly report: revenue increased.', 'Appendix: regional totals.']) {
    const page = pdf.addPage([612, 792]);
    page.drawText(text, { x: 72, y: 700, size: 14, font });
  }
  return Buffer.from(await pdf.save());
}

/** Extracts a real multi-page PDF locally, supports keyboard page selection, and downloads clean TXT. */
export default async function (t) {
  await t.open('/pdf-to-text');
  await t.upload({ name: 'quarterly-report.pdf', mimeType: 'application/pdf', buffer: await textPdf() });
  const firstPage = t.page.getByLabel('Text from page 1');
  await firstPage.waitFor();
  t.assert(
    (await firstPage.inputValue()).includes('Quarterly report: revenue increased.'),
    'first page text is missing',
  );
  await t.waitForText('2 page(s)');

  const next = t.page.getByRole('button', { name: 'Next page' });
  await next.focus();
  await t.page.keyboard.press('Enter');
  const secondPage = t.page.getByLabel('Text from page 2');
  await t.page.waitForFunction(() => document.querySelector('textarea')?.value.includes('Appendix: regional totals.'));
  t.assert((await secondPage.inputValue()).includes('Appendix: regional totals.'), 'second page text is missing');

  const download = await t.download(() => t.click('Download all as TXT'));
  const downloadedText = new TextDecoder().decode(download.bytes);
  t.assert(download.name === 'quarterly-report.txt', `unexpected TXT filename ${download.name}`);
  t.assert(downloadedText.includes('Quarterly report: revenue increased.'), 'first page is missing from TXT');
  t.assert(downloadedText.includes('Appendix: regional totals.'), 'second page is missing from TXT');

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

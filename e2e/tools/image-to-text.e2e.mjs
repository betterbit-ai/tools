/** Runs self-hosted OCR on a realistic 12 MP photo-sized image, then verifies editable TXT output. */
async function textPhoto(page, { width = 4000, height = 3000, title, detail } = {}) {
  const b64 = await page.evaluate(
    async ({ width, height, title, detail }) => {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      context.fillStyle = '#f8f6f0';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#111111';
      context.font = 'bold 180px Arial';
      context.fillText(title, 260, 700);
      context.font = '112px Arial';
      context.fillText(detail, 260, 980);
      context.fillText('Review text before using it.', 260, 1210);
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      }
      return btoa(binary);
    },
    { width, height, title: title ?? 'Betterbit OCR 2026', detail: detail ?? 'Quarterly total: $12,400' },
  );
  return { name: 'phone-photo-12mp.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(b64, 'base64') };
}

export default async function (t) {
  const externalRequests = [];
  t.page.on('request', (request) => {
    if (!request.url().startsWith(t.base) && !request.url().startsWith(`blob:${t.base}`)) {
      externalRequests.push(request.url());
    }
  });

  await t.open('/image-to-text');
  await t.upload(await textPhoto(t.page));
  const output = t.page.getByLabel('Extracted text');
  await output.waitFor({ timeout: 90_000 });
  await t.page.waitForFunction(
    () => document.querySelector('textarea')?.value.includes('Betterbit OCR 2026'),
    undefined,
    { timeout: 90_000 },
  );
  const text = await output.inputValue();
  t.assert(text.includes('Quarterly total: $12,400'), 'OCR result is missing the total from the uploaded image');
  t.assert(externalRequests.length === 0, `OCR fetched outside the site origin: ${externalRequests.join(', ')}`);

  await output.focus();
  await t.page.keyboard.press('End');
  await t.page.keyboard.type('\nChecked locally.');
  const download = await t.download(() => t.click('Download TXT'), 90_000);
  const downloadedText = new TextDecoder().decode(download.bytes);
  t.assert(download.name === 'phone-photo-12mp.txt', `unexpected TXT filename ${download.name}`);
  t.assert(downloadedText.endsWith('Checked locally.'), 'TXT download did not preserve the edited result');

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

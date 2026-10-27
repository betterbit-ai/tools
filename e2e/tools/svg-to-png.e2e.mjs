const PNG_SIGNATURE = '89504e470d0a1a0a';

function pngInfo(bytes) {
  if (bytes.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) throw new Error('download is not a PNG');
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    hasAlpha: bytes[25] === 4 || bytes[25] === 6,
  };
}

async function alphaAt(t, bytes, x, y) {
  return t.page.evaluate(
    async ({ base64, x, y }) => {
      const data = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([data], { type: 'image/png' }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return context.getImageData(x, y, 1, 1).data[3];
    },
    { base64: bytes.toString('base64'), x, y },
  );
}

/** A logo SVG renders locally at exact dimensions, retains alpha, and remains usable on mobile. */
export default async function (t) {
  await t.open('/svg-to-png');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect x="50" y="40" width="200" height="120" rx="20" fill="#3b6"/>
  <text x="150" y="115" text-anchor="middle" font-size="32">로고 😀</text>
</svg>`;
  await t.upload({ name: '브랜드 로고 😀.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) });
  await t.page.getByRole('button', { name: 'Download PNG' }).waitFor({ timeout: 30_000 });
  t.assert(await t.page.getByText('PNG size', { exact: true }).isVisible(), 'output dimensions were not shown');

  await t.page.getByRole('radio', { name: '2×' }).click();
  await t.page.waitForFunction(() => document.body.innerText.includes('600 × 400'));
  const transparent = await t.download(() => t.click('Download PNG'));
  const transparentInfo = pngInfo(transparent.bytes);
  t.assert(transparent.name === '브랜드 로고 😀.png', `Unicode SVG filename changed to ${transparent.name}`);
  t.assert(transparentInfo.width === 600 && transparentInfo.height === 400, '2× output dimensions were incorrect');
  t.assert(transparentInfo.hasAlpha, 'PNG did not retain an alpha-capable colour type');
  t.assert((await alphaAt(t, transparent.bytes, 10, 10)) === 0, 'transparent SVG background became opaque');

  await t.page.getByRole('radio', { name: 'Width' }).click();
  await t.page.getByLabel('Output width (px)').fill('1200');
  await t.page.waitForFunction(() => document.body.innerText.includes('1200 × 800'));
  await t.page.getByRole('radio', { name: 'White', exact: true }).click();
  await t.page.waitForFunction(() => {
    const preview = document.querySelector('img[alt="PNG preview"]');
    return preview instanceof HTMLImageElement && preview.naturalWidth === 1200;
  });
  const white = await t.download(() => t.click('Download PNG'));
  const whiteInfo = pngInfo(white.bytes);
  t.assert(whiteInfo.width === 1200 && whiteInfo.height === 800, 'exact-width output dimensions were incorrect');
  t.assert((await alphaAt(t, white.bytes, 10, 10)) === 255, 'white background did not make transparent pixels opaque');

  // Pasted SVG code is accepted and external assets are not fetched or silently used.
  await t.click('Clear');
  await t.page
    .getByLabel('SVG code')
    .fill(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><image href="https://example.com/client-art.png" width="40" height="20"/></svg>',
    );
  await t.waitForText('External images, fonts and styles were omitted');
  t.assert(
    !(await t.page.evaluate(() =>
      performance.getEntriesByType('resource').some((entry) => entry.name.includes('client-art.png')),
    )),
    'an external SVG image was requested',
  );

  await t.open('/ko/svg-to-png');
  await t.waitForText('SVG PNG 변환');
  await t.page
    .getByLabel('SVG 코드')
    .fill(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><rect width="80" height="40" fill="#36c"/></svg>',
    );
  await t.page.getByRole('button', { name: 'PNG 다운로드' }).waitFor({ timeout: 30_000 });
  t.assert(
    await t.page.getByText('PNG 크기', { exact: true }).isVisible(),
    'Korean output dimensions were not rendered',
  );

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(await t.page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches), 'dark mode was not active');
}

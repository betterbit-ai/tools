/** Image color picking must retain native-pixel precision and stay usable for phone photos. */

async function testPaletteImage(page) {
  const base64 = await page.evaluate(async () => {
    const canvas = new OffscreenCanvas(400, 200);
    const context = canvas.getContext('2d');
    context.fillStyle = '#f00';
    context.fillRect(0, 0, 200, 200);
    context.fillStyle = '#00f';
    context.fillRect(200, 0, 200, 200);
    context.fillStyle = '#0f0';
    context.fillRect(0, 0, 20, 20);
    const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer());
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000)
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(binary);
  });
  return { name: 'palette-테스트.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') };
}

export default async function (t) {
  await t.open('/color-picker');
  const exact = await testPaletteImage(t.page);
  await t.upload(exact);
  await t.waitForText('palette-테스트.png · 400 × 200 px');

  const preview = t.page.getByRole('button', { name: /Click or tap a pixel/ });
  const image = t.page.getByRole('img', { name: 'Image color picker' });
  const box = await image.boundingBox();
  t.assert(box, 'image picker preview was not rendered');
  await image.click({ position: { x: box.width * 0.25, y: box.height * 0.5 } });
  await t.waitForText('#FF0000');
  await preview.press('ArrowRight');
  t.assert(
    (await t.page.locator('main').innerText()).includes('Source pixel 101, 100'),
    'arrow key did not nudge the source pixel',
  );
  await image.click({ position: { x: box.width * 0.75, y: box.height * 0.5 } });
  await t.waitForText('#0000FF');
  t.assert(
    (await t.page.locator('main').innerText()).includes('Dominant palette'),
    'palette did not appear with the exact picker',
  );
  t.assert(
    await t.page.getByRole('button', { name: 'Copy CSS variables' }).isVisible(),
    'CSS variable copy was unavailable',
  );

  // A 12 MP phone-sized image exercises compact palette sampling without sending a file away.
  await t.click('Remove image');
  await t.upload(await t.image({ width: 4032, height: 3024, type: 'image/jpeg', name: 'IMG_12MP.JPG' }));
  await t.waitForText('IMG_12MP.JPG · 4032 × 3024 px', 120_000);

  // Decode errors are visible rather than silently leaving a stale image selected.
  await t.click('Remove image');
  await t.upload({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') });
  await t.waitForText('This image could not be read by this browser.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'broken-image error was not exposed as an alert');

  // The localized tool stays within a phone viewport in dark mode.
  await t.open('/ko/color-picker');
  await t.upload(exact);
  await t.waitForText('palette-테스트.png · 400 × 200 px');
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
}

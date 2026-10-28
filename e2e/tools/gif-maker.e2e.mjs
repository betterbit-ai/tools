function gifInfo(bytes) {
  if (bytes.subarray(0, 6).toString('ascii') !== 'GIF89a') throw new Error('download is not a GIF89a file');
  let offset = 13;
  if (bytes[10] & 0x80) offset += 3 * (1 << ((bytes[10] & 0x07) + 1));
  let frames = 0;
  while (offset < bytes.length && bytes[offset] !== 0x3b) {
    const marker = bytes[offset++];
    if (marker === 0x21) {
      offset += 1;
    } else if (marker === 0x2c) {
      frames++;
      const packed = bytes[offset + 8];
      offset += 9;
      if (packed & 0x80) offset += 3 * (1 << ((packed & 0x07) + 1));
      offset += 1;
    } else {
      throw new Error(`unexpected GIF block marker 0x${marker.toString(16)}`);
    }
    while (offset < bytes.length) {
      const size = bytes[offset++];
      if (!size) break;
      offset += size;
    }
  }
  return {
    width: bytes.readUInt16LE(6),
    height: bytes.readUInt16LE(8),
    frames,
  };
}

/** Two ordinary photos produce a playable local GIF, including after keyboard changes to its settings. */
export default async function (t) {
  await t.open('/gif-maker');
  const first = await t.image({ width: 1200, height: 800, name: '여름 여행 📷.jpg' });
  const second = await t.image({ width: 800, height: 1200, type: 'image/png', name: 'second-photo.png' });
  await t.upload([first, second]);
  await t.waitForText('GIF ready', 60_000);

  const quick = t.page.getByRole('radio', { name: 'Quick · 250 ms' });
  await quick.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await quick.getAttribute('aria-checked')) === 'true', 'GIF speed was not keyboard-operable');
  await t.waitForText('GIF ready', 60_000);

  const preview = t.page.getByRole('img', { name: 'GIF ready' });
  await preview.waitFor({ state: 'visible' });
  const decoded = await preview.evaluate(
    (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
  );
  t.assert(decoded, 'the generated GIF did not decode in the browser');

  const download = await t.download(() => t.click('Download GIF'), 60_000);
  const gif = gifInfo(download.bytes);
  t.assert(download.name === '여름 여행 📷-animation.gif', `unexpected download name ${download.name}`);
  t.assert(gif.width === 480 && gif.height === 320, `GIF dimensions are ${gif.width}x${gif.height}, expected 480x320`);
  t.assert(gif.frames === 2, `GIF has ${gif.frames} frames, expected 2`);

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await t.page.evaluate(() => ({
    dark: matchMedia('(prefers-color-scheme: dark)').matches,
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.dark, 'dark scheme was not active');
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);

  await t.open('/ko/gif-maker');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('사진은 이 브라우저에서만 처리'), 'Korean local-processing guidance is missing');
}

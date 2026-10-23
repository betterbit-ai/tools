function gifInfo(bytes) {
  if (bytes.subarray(0, 6).toString('ascii') !== 'GIF89a') throw new Error('download is not a GIF89a file');
  return {
    width: bytes.readUInt16LE(6),
    height: bytes.readUInt16LE(8),
    frames: [...bytes].filter((byte) => byte === 0x2c).length,
  };
}

async function movingWebm(t) {
  const base64 = await t.page.evaluate(async () => {
    if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) throw new Error('VP8 WebM recording is unavailable');
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const context = canvas.getContext('2d');
    const recorder = new MediaRecorder(canvas.captureStream(30), { mimeType: 'video/webm;codecs=vp8' });
    const chunks = [];
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    const stopped = new Promise((resolve) => (recorder.onstop = resolve));
    recorder.start();
    for (let frame = 0; frame < 42; frame++) {
      context.fillStyle = `hsl(${(frame * 11) % 360} 70% 45%)`;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'white';
      context.fillRect((frame * 4) % 140, 28, 20, 34);
      await new Promise(requestAnimationFrame);
    }
    recorder.stop();
    await stopped;
    const bytes = new Uint8Array(await new Blob(chunks, { type: 'video/webm' }).arrayBuffer());
    let text = '';
    for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(text);
  });
  return { name: 'moving-demo.webm', mimeType: 'video/webm', buffer: Buffer.from(base64, 'base64') };
}

/** A playable video becomes a decodable, multi-frame local GIF with usable mobile controls. */
export default async function (t) {
  await t.open('/video-to-gif');
  const source = await movingWebm(t);
  t.assert(source.buffer.length > 1_000, `WebM fixture is unrealistically small (${source.buffer.length} bytes)`);
  await t.upload(source);
  await t.waitForText('moving-demo.webm', 30_000);
  await t.page.getByRole('button', { name: 'Make GIF', exact: true }).waitFor({ state: 'visible' });

  const smoothness = t.page.getByRole('radio', { name: 'Balanced · 10 fps' });
  await smoothness.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await smoothness.getAttribute('aria-checked')) === 'true', 'GIF smoothness was not keyboard-operable');

  await t.click('Make GIF');
  await t.waitForText('GIF ready', 60_000);
  const preview = t.page.getByRole('img', { name: 'GIF ready' });
  await preview.waitFor({ state: 'visible' });
  const decoded = await preview.evaluate(
    (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
  );
  t.assert(decoded, 'the generated GIF did not decode in the browser');

  const download = await t.download(() => t.click('Download GIF'), 60_000);
  const gif = gifInfo(download.bytes);
  t.assert(download.name === 'moving-demo-gif.gif', `unexpected download name ${download.name}`);
  t.assert(gif.width === 320 && gif.height === 180, `GIF dimensions are ${gif.width}x${gif.height}, expected 320x180`);
  t.assert(gif.frames >= 8, `GIF has only ${gif.frames} frames`);

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await t.page.evaluate(() => ({
    dark: matchMedia('(prefers-color-scheme: dark)').matches,
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.dark, 'dark scheme was not active');
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);

  await t.open('/ko/video-to-gif');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('최대 10초'), 'Korean bounded-clip guidance is missing');
}

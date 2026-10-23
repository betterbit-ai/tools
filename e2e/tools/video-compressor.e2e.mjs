async function movingWebm(t) {
  const base64 = await t.page.evaluate(async () => {
    if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) throw new Error('VP8 WebM recording is unavailable');
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext('2d');
    const recorder = new MediaRecorder(canvas.captureStream(30), {
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 4_000_000,
    });
    const chunks = [];
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    const stopped = new Promise((resolve) => (recorder.onstop = resolve));
    recorder.start();
    for (let frame = 0; frame < 54; frame++) {
      context.fillStyle = `hsl(${(frame * 13) % 360} 75% 42%)`;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'white';
      context.fillRect((frame * 23) % 1120, 220, 160, 280);
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

/** A browser-playable video is re-encoded locally to a smaller, decodable WebM. */
export default async function (t) {
  await t.open('/video-compressor');
  const source = await movingWebm(t);
  t.assert(source.buffer.length > 1_000, `WebM fixture is unrealistically small (${source.buffer.length} bytes)`);
  await t.upload(source);
  await t.waitForText('Source dimensions', 30_000);

  const smallest = t.page.getByRole('radio', { name: 'Smallest', exact: true });
  await smallest.focus();
  await t.page.keyboard.press('Enter');
  t.assert((await smallest.getAttribute('aria-checked')) === 'true', 'compression level was not keyboard-operable');
  await t.page.getByRole('radio', { name: '480p', exact: true }).click();

  await t.click('Compress video');
  await t.waitForText('Compressed video ready', 60_000);
  const preview = t.page.getByLabel('Compressed video preview');
  const dimensions = await preview.evaluate((video) => ({
    ready: video.readyState >= 2,
    width: video.videoWidth,
    height: video.videoHeight,
  }));
  t.assert(dimensions.ready, 'the compressed video did not decode in the browser');
  t.assert(
    dimensions.width === 854 && dimensions.height === 480,
    `compressed dimensions are ${dimensions.width}x${dimensions.height}, expected 854x480`,
  );

  const download = await t.download(() => t.click('Download WebM'), 60_000);
  t.assert(download.name === 'moving-demo-compressed.webm', `unexpected download name ${download.name}`);
  t.assert(download.bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])), 'download is not a WebM file');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await t.page.evaluate(() => ({
    dark: matchMedia('(prefers-color-scheme: dark)').matches,
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.dark, 'dark scheme was not active');
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);

  await t.open('/ko/video-compressor');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('짧은 변'), 'Korean resolution guidance is missing');
}

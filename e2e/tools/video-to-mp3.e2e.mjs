async function videoWithAudio(t) {
  const base64 = await t.page.evaluate(async () => {
    const mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error(`${mimeType} recording is unavailable`);
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const drawing = canvas.getContext('2d');
    const audio = new AudioContext();
    const destination = audio.createMediaStreamDestination();
    const oscillator = audio.createOscillator();
    oscillator.frequency.value = 440;
    oscillator.connect(destination);
    await audio.resume();
    oscillator.start();
    const stream = new MediaStream([
      ...canvas.captureStream(24).getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ]);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 800_000, audioBitsPerSecond: 96_000 });
    const chunks = [];
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    const stopped = new Promise((resolve) => (recorder.onstop = resolve));
    recorder.start();
    for (let frame = 0; frame < 360; frame++) {
      drawing.fillStyle = `hsl(${(frame * 17) % 360} 75% 42%)`;
      drawing.fillRect(0, 0, canvas.width, canvas.height);
      drawing.fillStyle = 'white';
      drawing.fillRect((frame * 37) % 1100, 220, 180, 280);
      await new Promise((resolve) => setTimeout(resolve, 35));
    }
    recorder.stop();
    await stopped;
    oscillator.stop();
    await audio.close();
    stream.getTracks().forEach((track) => track.stop());
    const bytes = new Uint8Array(await new Blob(chunks, { type: 'video/webm' }).arrayBuffer());
    let text = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000)
      text += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    return btoa(text);
  });
  return { name: 'conference-clip.webm', mimeType: 'video/webm', buffer: Buffer.from(base64, 'base64') };
}

/** A browser-recorded video with an Opus audio track becomes a downloadable MP3 locally. */
export default async function (t) {
  await t.open('/video-to-mp3');
  const source = await videoWithAudio(t);
  t.assert(source.buffer.length > 100_000, `video fixture is unrealistically small (${source.buffer.length} bytes)`);
  await t.upload(source);
  await t.page.locator('input[type=number]').first().waitFor({ state: 'visible', timeout: 30_000 });

  const numbers = t.page.locator('input[type=number]');
  const sourceDuration = Number(await numbers.nth(1).getAttribute('max'));
  t.assert(sourceDuration >= 2, `source video duration is ${sourceDuration}, expected at least 2 seconds`);
  const selectedEnd = Math.min(3, sourceDuration - 0.1);
  await numbers.nth(0).fill('0.5');
  await numbers.nth(1).fill(String(selectedEnd));
  const qualityOptions = t.page.locator('[role=radio]');
  t.assert(
    (await qualityOptions.count()) === 3,
    `expected three MP3 quality options, found ${await qualityOptions.count()}`,
  );
  await qualityOptions.first().click();
  await t.click('Extract MP3');
  await t.waitForText('Your MP3 is ready', 60_000);

  const preview = t.page.getByLabel('MP3 preview');
  const result = await preview.evaluate(async (audio) => {
    const response = await fetch(audio.src);
    const blob = await response.blob();
    const bytes = await blob.arrayBuffer();
    const context = new AudioContext();
    const decoded = await context.decodeAudioData(bytes.slice(0));
    await context.close();
    return {
      size: blob.size,
      type: blob.type,
      duration: decoded.duration,
      bytes: Array.from(new Uint8Array(bytes.slice(0, 3))),
    };
  });
  t.assert(result.size > 1_000, `MP3 output was unexpectedly small (${result.size} bytes)`);
  t.assert(result.type === 'audio/mpeg', `unexpected MP3 MIME type ${result.type}`);
  t.assert(result.bytes[0] === 0xff && (result.bytes[1] & 0xe0) === 0xe0, 'MP3 output has no MPEG frame header');
  const expectedDuration = selectedEnd - 0.5;
  t.assert(
    result.duration > expectedDuration - 0.2 && result.duration < expectedDuration + 0.35,
    `selected MP3 duration is ${result.duration}, expected about ${expectedDuration} seconds`,
  );

  const download = await t.download(() => t.click('Download MP3'));
  t.assert(download.name === 'conference-clip-audio.mp3', `unexpected download name ${download.name}`);
  t.assert(download.size === result.size, 'download differs from the local MP3 preview');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );

  await t.open('/ko/video-to-mp3');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('필요한 소리 구간'), 'Korean video-to-mp3 page did not render');
}

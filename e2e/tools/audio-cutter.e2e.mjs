// A generated, one-second 440 Hz MP3 (44.1 kHz mono, 32 kbps). Keeping the
// fixture inline makes this browser test independent of ffmpeg or a network download.
const TONE_MP3_BASE64 =
  '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';

function mp3Frames(bytes) {
  let frames = 0;
  for (let offset = 0; offset + 1 < bytes.length; offset++) {
    if (bytes[offset] === 0xff && (bytes[offset + 1] & 0xe0) === 0xe0) frames++;
  }
  return frames;
}

/** A real browser decodes a local MP3 waveform and downloads a smaller frame-copy clip. */
export default async function (t) {
  await t.open('/audio-cutter');
  const source = { name: '회의 🎵.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from(TONE_MP3_BASE64, 'base64') };
  t.assert(source.buffer.length > 4_000, 'the MP3 fixture is unexpectedly small');
  await t.upload(source);
  await t.waitForText('회의 🎵.mp3', 30_000);

  const waveform = t.page.getByRole('img', { name: /Audio waveform/ });
  await waveform.waitFor({ state: 'visible' });
  t.assert(await waveform.evaluate((canvas) => canvas.width > 100), 'the decoded waveform was not painted');

  await t.page.getByRole('spinbutton', { name: 'Start (seconds)' }).fill('0.2');
  await t.page.getByRole('spinbutton', { name: 'End (seconds)' }).fill('0.7');
  const download = await t.download(() => t.click('Cut and download MP3'));
  t.assert(download.name === '회의 🎵-clip.mp3', `unexpected download name ${download.name}`);
  t.assert(download.bytes.subarray(0, 3).toString('ascii') === 'ID3', 'the copied ID3 metadata is missing');
  t.assert(download.size < source.buffer.length, 'the selected clip is not smaller than the source MP3');
  t.assert(mp3Frames(download.bytes) > 4, 'the downloaded clip does not contain MP3 frames');

  const ringtone = t.page.getByRole('button', { name: 'Select 30-second ringtone' });
  await ringtone.focus();
  await t.page.keyboard.press('Enter');
  t.assert(await ringtone.isVisible(), 'the ringtone preset is not keyboard-operable');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await t.page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);

  await t.open('/ko/audio-cutter');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('재인코딩 없이'), 'Korean lossless MP3 guidance is missing');
}

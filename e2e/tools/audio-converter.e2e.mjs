// Real-browser audit for audio-converter: a real WAV goes in, an MP3 and a WAV come out.
/** A 16-bit PCM WAV with a sine tone, built here so the test needs no fixture file. */
function makeWav({ seconds = 1, sampleRate = 44_100, channels = 1, frequency = 440, amplitude = 0.5 } = {}) {
  const frames = Math.round(seconds * sampleRate);
  const dataBytes = frames * channels * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write('WAVE', 8, 'ascii');
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * 2, 28);
  buffer.writeUInt16LE(channels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataBytes, 40);
  let offset = 44;
  for (let frame = 0; frame < frames; frame++) {
    const value = Math.round(amplitude * 0x7fff * Math.sin((2 * Math.PI * frequency * frame) / sampleRate));
    for (let channel = 0; channel < channels; channel++) {
      buffer.writeInt16LE(value, offset);
      offset += 2;
    }
  }
  return buffer;
}

function readWav(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (offset) => String.fromCharCode(...bytes.subarray(offset, offset + 4));
  return {
    riff: tag(0),
    wave: tag(8),
    format: view.getUint16(20, true),
    channels: view.getUint16(22, true),
    sampleRate: view.getUint32(24, true),
    bits: view.getUint16(34, true),
    dataBytes: view.getUint32(40, true),
    declaredSize: view.getUint32(4, true),
  };
}

const BITRATES_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const SAMPLE_RATES = [44_100, 48_000, 32_000];

/**
 * Walks the MPEG-1 Layer III frames and checks each header, rather than counting 0xFF bytes —
 * frame payloads contain 0xFF too, so a naive byte scan over-counts ten times over.
 */
function mp3Frames(bytes) {
  let offset = 0;
  let frames = 0;
  let bitrate = 0;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff || (bytes[offset + 1] & 0xe0) !== 0xe0) break;
    const version = (bytes[offset + 1] >> 3) & 3; // 3 = MPEG-1
    const layer = (bytes[offset + 1] >> 1) & 3; // 1 = Layer III
    const bitrateIndex = (bytes[offset + 2] >> 4) & 0x0f;
    const sampleRateIndex = (bytes[offset + 2] >> 2) & 3;
    if (version !== 3 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) break;
    bitrate = BITRATES_V1_L3[bitrateIndex];
    const sampleRate = SAMPLE_RATES[sampleRateIndex];
    const padding = (bytes[offset + 2] >> 1) & 1;
    const length = Math.floor((144 * bitrate * 1000) / sampleRate) + padding;
    offset += length;
    frames++;
  }
  return { frames, bitrate, consumed: offset, remaining: bytes.length - offset };
}

export default async function (t) {
  const page = t.page;
  await t.open('/audio-converter');
  const mono = makeWav();
  await t.upload({ name: '회의 녹음 🎙️.wav', mimeType: 'audio/wav', buffer: mono });
  await t.waitForText('회의 녹음 🎙️.wav', 20_000);

  // 1) The file is described without any conversion step.
  const info = await t.waitForText('mono · 44.1 kHz · 0:01.0', 20_000);
  t.assert(info.length > 0, 'the decoded file details are missing');

  // 2) The default MP3 conversion finishes on its own and downloads real MPEG frames.
  const mp3 = await t.download(() => t.click('Download'), 60_000);
  t.assert(mp3.name === '회의 녹음 🎙️.mp3', `unexpected MP3 name ${mp3.name}`);
  const walk = mp3Frames(mp3.bytes);
  t.assert(walk.bitrate === 192, `the MP3 header says ${walk.bitrate} kbps, not 192`);
  // 44,100 samples are 38.28 frames of 1152; the encoder additionally flushes its last frame.
  t.assert(walk.frames >= 38 && walk.frames <= 40, `1 s at 44.1 kHz should be about 39 frames, got ${walk.frames}`);
  t.assert(walk.remaining <= 4, `${walk.remaining} bytes after the last MPEG frame are not frames`);
  const expected = (192_000 / 8) * 1;
  t.assert(
    Math.abs(mp3.size - expected) / expected < 0.08,
    `192 kbps for 1 s should be about ${expected} bytes, got ${mp3.size}`,
  );

  // 3) Higher bitrate means a bigger file for the same audio.
  await page.getByRole('radio', { name: '320' }).click();
  await page.waitForTimeout(200);
  const higher = await t.download(() => t.click('Download'), 60_000);
  t.assert(higher.size > mp3.size * 1.5, '320 kbps was not bigger than 192 kbps');

  // 4) WAV output is a real 16-bit PCM file with the same tone.
  await page.getByRole('radio', { name: 'WAV' }).click();
  await page.waitForTimeout(200);
  const wav = await t.download(() => t.click('Download'), 60_000);
  t.assert(wav.name === '회의 녹음 🎙️.wav', `unexpected WAV name ${wav.name}`);
  const header = readWav(wav.bytes);
  t.assert(header.riff === 'RIFF' && header.wave === 'WAVE', 'the download is not a WAV file');
  t.assert(header.format === 1 && header.bits === 16, 'the WAV is not 16-bit PCM');
  t.assert(header.channels === 1, `the mono source became ${header.channels} channels`);
  t.assert(header.sampleRate === 44_100, `unexpected sample rate ${header.sampleRate}`);
  t.assert(header.declaredSize === wav.size - 8, 'the RIFF size field does not match the file');
  t.assert(Math.abs(header.dataBytes - 44_100 * 2) < 4, `unexpected data size ${header.dataBytes}`);
  const samples = new Int16Array(wav.bytes.buffer, wav.bytes.byteOffset + 44, header.dataBytes / 2);
  const peak = samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
  t.assert(Math.abs(peak - 0.5 * 0x7fff) < 200, `the tone's peak is ${peak}, expected about 16383`);
  t.assert(samples[0] === 0 && samples[1] > 1000, 'the waveform does not start like a sine tone');

  // 5) A stereo file keeps both channels.
  await page.getByRole('button', { name: 'Choose another file' }).click();
  const stereo = makeWav({ channels: 2, seconds: 0.5 });
  await t.upload({ name: 'stereo.wav', mimeType: 'audio/wav', buffer: stereo });
  await t.waitForText('stereo · 44.1 kHz', 20_000);
  await page.getByRole('radio', { name: 'WAV' }).click();
  await page.waitForTimeout(200);
  const stereoWav = await t.download(() => t.click('Download'), 60_000);
  const stereoHeader = readWav(stereoWav.bytes);
  t.assert(stereoHeader.channels === 2, 'the stereo file was downmixed');
  t.assert(Math.abs(stereoHeader.dataBytes - 22_050 * 4) < 8, `unexpected stereo data size ${stereoHeader.dataBytes}`);

  // 6) A file the browser cannot decode is explained instead of failing silently.
  await page.getByRole('button', { name: 'Choose another file' }).click();
  await t.upload({ name: 'broken.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('not really audio at all') });
  await t.waitForText('could not decode', 20_000);

  // 7) Keyboard and mobile.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  const viewport = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  t.assert(viewport.scroll <= viewport.width, `mobile page overflowed by ${viewport.scroll - viewport.width}px`);

  // 8) Korean page.
  await t.open('/ko/audio-converter');
  const korean = await page.locator('main').innerText();
  t.assert(korean.includes('오디오 변환기'), 'the Korean page is missing its heading');
  t.assert(/20분/.test(korean), 'the Korean page omits the duration limit');
}

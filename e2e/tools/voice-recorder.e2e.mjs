/** Record from Chromium's fake microphone, encode locally, and download a real MP3. */

export default async function (t) {
  await t.open('/voice-recorder');
  await t.click('Start recording');
  await t.waitForText('Recording locally.');
  await t.page.waitForTimeout(750);

  await t.click('Pause');
  await t.waitForText('Paused.');
  const pausedTime = await t.page.locator('main').innerText();
  await t.page.waitForTimeout(500);
  t.assert(
    (await t.page.locator('main').innerText()).includes(pausedTime.match(/\d\d:\d\d/)?.[0]),
    'timer advanced while paused',
  );

  await t.click('Resume');
  await t.waitForText('Recording locally.');
  await t.page.waitForTimeout(500);
  await t.click('Stop and make MP3');
  await t.waitForText('Your MP3 is ready.', 30_000);

  const player = t.page.locator('audio[controls]');
  await player.waitFor({ state: 'visible' });
  const result = await player.evaluate(async (audio) => {
    const response = await fetch(audio.src);
    const blob = await response.blob();
    return {
      size: blob.size,
      type: blob.type,
      bytes: Array.from(new Uint8Array(await blob.slice(0, 3).arrayBuffer())),
    };
  });
  t.assert(result.size > 500, `MP3 output was unexpectedly small (${result.size} bytes)`);
  t.assert(result.type === 'audio/mpeg', `unexpected MP3 MIME type ${result.type}`);
  t.assert(result.bytes[0] === 0xff && (result.bytes[1] & 0xe0) === 0xe0, 'MP3 output has no MPEG frame header');

  const download = await t.download(() => t.click('Download MP3'));
  t.assert(
    /voice-recording-\d{4}-\d{2}-\d{2}-\d{4}\.mp3/.test(download.name),
    `unexpected download name ${download.name}`,
  );
  t.assert(download.size === result.size, 'download differs from preview MP3');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );

  await t.open('/ko/voice-recorder');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('온라인 녹음기'), 'Korean voice-recorder page did not render');
}

/** Record a real browser canvas stream, preview the local WebM and download the result. */

export default async function (t) {
  await t.open('/screen-recorder');
  await t.page.evaluate(() => {
    Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
      configurable: true,
      value: async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const context = canvas.getContext('2d');
        let frame = 0;
        const paint = () => {
          context.fillStyle = frame % 2 ? '#124' : '#365';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = '#fff';
          context.font = '48px sans-serif';
          context.fillText(`Betterbit ${frame++}`, 48, 180);
        };
        paint();
        const interval = window.setInterval(paint, 100);
        const stream = canvas.captureStream(10);
        stream.getTracks()[0].addEventListener('ended', () => window.clearInterval(interval));
        return stream;
      },
    });
  });

  await t.click('Start recording');
  await t.waitForText('Recording on this device.');
  await t.page.waitForTimeout(1_100);
  await t.click('Pause');
  await t.waitForText('Paused.');
  const pausedTime = await t.page.locator('main').innerText();
  await t.page.waitForTimeout(500);
  t.assert(
    (await t.page.locator('main').innerText()).includes(pausedTime.match(/\d\d:\d\d/)?.[0]),
    'recording timer advanced while paused',
  );

  await t.click('Resume');
  await t.waitForText('Recording on this device.');
  await t.page.waitForTimeout(500);
  await t.click('Stop recording');
  await t.waitForText('Your recording is ready.');

  const player = t.page.locator('video[controls]');
  await player.waitFor({ state: 'visible' });
  const result = await player.evaluate(async (video) => {
    const response = await fetch(video.src);
    const blob = await response.blob();
    return { size: blob.size, type: blob.type };
  });
  t.assert(result.size > 100, `screen recording was unexpectedly small (${result.size} bytes)`);
  t.assert(result.type.startsWith('video/'), `unexpected recording MIME type ${result.type}`);

  const download = await t.download(() => t.click('Download recording'));
  t.assert(
    /screen-recording-\d{4}-\d{2}-\d{2}-\d{4}\.(webm|mp4)/.test(download.name),
    `unexpected download name ${download.name}`,
  );
  t.assert(download.size === result.size, 'download differs from preview video');

  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );

  await t.open('/ko/screen-recorder');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('온라인 화면 녹화'), 'Korean screen-recorder page did not render');
}

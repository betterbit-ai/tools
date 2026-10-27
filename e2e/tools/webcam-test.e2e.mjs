/** Exercise a real fake-camera stream, local PNG capture, and visible browser fallbacks. */

export default async function (t) {
  const context = t.page.context();

  // Denial must be explained. Clearing the harness grant before opening also verifies that the
  // page does not assume permission has already been granted when it hydrates.
  await context.clearPermissions();
  await t.open('/webcam-test');
  t.assert(
    await t.page.evaluate(
      () =>
        typeof navigator.mediaDevices?.getUserMedia === 'function' &&
        typeof navigator.mediaDevices?.enumerateDevices === 'function' &&
        typeof HTMLVideoElement.prototype.requestVideoFrameCallback === 'function',
    ),
    'current Chromium did not expose the camera APIs detected by the tool',
  );
  await t.page.evaluate(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => {
        throw new DOMException('Permission denied for e2e', 'NotAllowedError');
      },
    });
  });
  await t.click('Start camera');
  await t.waitForText('Camera access was blocked.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'permission denial was not exposed as an alert');

  // Restore Chromium's fake camera and run the complete preview and snapshot flow.
  await context.grantPermissions(['camera']);
  await t.open('/webcam-test');
  await t.page.evaluate(() => {
    const makeCamera = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const context = canvas.getContext('2d');
      let frame = 0;
      const paint = () => {
        const hue = (frame++ * 7) % 360;
        context.fillStyle = `hsl(${hue} 45% 32%)`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#fff';
        context.font = '64px sans-serif';
        context.fillText(`Betterbit camera ${frame}`, 80, 360);
      };
      paint();
      const interval = window.setInterval(paint, 50);
      const stream = canvas.captureStream(20);
      const track = stream.getVideoTracks()[0];
      const stop = track.stop.bind(track);
      track.stop = () => {
        window.clearInterval(interval);
        stop();
      };
      return stream;
    };
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async (constraints) => {
        if (constraints.audio !== false) throw new Error('webcam test requested audio');
        const video = constraints.video;
        if (video !== true && typeof video?.deviceId?.exact !== 'string') {
          throw new Error('webcam test used unsupported video constraints');
        }
        window.__lastCameraConstraints = constraints;
        const stream = makeCamera();
        window.__activeCameraStream = stream;
        return stream;
      },
    });
    Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
      configurable: true,
      value: async () => [
        { kind: 'videoinput', deviceId: 'built-in-camera', label: 'Built-in test camera', groupId: 'built-in' },
        { kind: 'videoinput', deviceId: 'external-camera', label: 'External test camera', groupId: 'external' },
      ],
    });
  });
  await t.click('Start camera');
  await t.waitForText('Camera is active.');
  await t.page.waitForFunction(() => {
    const video = document.querySelector('video[aria-label="Live camera preview"]');
    return video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
  });

  const video = await t.page.getByLabel('Live camera preview').evaluate((element) => ({
    width: element.videoWidth,
    height: element.videoHeight,
    muted: element.muted,
    tracks: element.srcObject?.getVideoTracks().length ?? 0,
    audioTracks: element.srcObject?.getAudioTracks().length ?? 0,
  }));
  t.assert(video.width >= 320 && video.height >= 240, `fake camera negotiated only ${video.width}x${video.height}`);
  t.assert(video.muted, 'autoplay preview was not muted');
  t.assert(video.tracks === 1 && video.audioTracks === 0, 'camera test requested an unexpected media track');
  await t.page.waitForFunction(() => {
    const label = [...document.querySelectorAll('div')].find((element) => element.textContent === 'Frame rate');
    return label && /[1-9]\d*(?:\.\d+)? FPS/.test(label.parentElement?.innerText ?? '');
  });
  t.assert(
    (await t.page.getByRole('combobox').locator('option').count()) === 3,
    'camera list did not refresh after permission was granted',
  );
  await t.page.getByRole('combobox').selectOption('external-camera');
  await t.page.waitForFunction(() => window.__lastCameraConstraints?.video?.deviceId?.exact === 'external-camera');
  await t.page.getByRole('button', { name: 'Stop camera' }).waitFor();

  const foreground = await context.newPage();
  await foreground.goto(t.base, { waitUntil: 'load' });
  await foreground.bringToFront();
  await t.page.waitForTimeout(1_000);
  await t.page.bringToFront();
  t.assert(
    await t.page.evaluate(() => window.__activeCameraStream.getVideoTracks()[0].readyState === 'live'),
    'camera stream stopped while the tab was in the background',
  );
  await foreground.close();

  const snapshot = await t.download(() => t.click('Download PNG snapshot'));
  t.assert(/^webcam-snapshot-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/.test(snapshot.name), 'bad PNG name');
  t.assert(snapshot.size > 1_000, `snapshot was unexpectedly small (${snapshot.size} bytes)`);
  t.assert(snapshot.bytes.subarray(1, 4).toString('ascii') === 'PNG', 'snapshot was not a PNG');
  t.assert(snapshot.bytes.readUInt32BE(16) === video.width, 'snapshot width differs from the live video');
  t.assert(snapshot.bytes.readUInt32BE(20) === video.height, 'snapshot height differs from the live video');

  // The framing controls and keyboard stop path must work without touching the device stream.
  await t.page.getByLabel('Show framing grid').focus();
  await t.page.keyboard.press('Space');
  t.assert(await t.page.getByLabel('Show framing grid').isChecked(), 'framing grid did not turn on');
  await t.page.evaluate(() => document.activeElement?.blur());
  await t.page.keyboard.press('m');
  t.assert(!(await t.page.getByLabel('Mirror preview and snapshot').isChecked()), 'mirror shortcut did not toggle');
  await t.page.keyboard.press('s');
  await t.waitForText('Ready — start the test');
  t.assert(
    await t.page.evaluate(() => window.__activeCameraStream.getTracks().every((track) => track.readyState === 'ended')),
    'stopping did not release the camera track',
  );

  // A camera-list refresh failure must not kill the preview, but it must not be swallowed either.
  await t.page.evaluate(() => {
    Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
      configurable: true,
      value: async () => {
        throw new DOMException('Enumeration failed for e2e', 'NotReadableError');
      },
    });
  });
  await t.click('Start camera');
  await t.waitForText('Camera is active.');
  await t.waitForText('The browser could not load the camera list.');

  // Hardware disconnects must leave the active state and tell the user what happened.
  await t.page.evaluate(() => window.__activeCameraStream.getVideoTracks()[0].dispatchEvent(new Event('ended')));
  await t.waitForText('The camera disconnected.');
  t.assert(
    await t.page.getByRole('button', { name: 'Start camera' }).isVisible(),
    'disconnect left stop control active',
  );
  t.assert(await t.page.getByRole('button', { name: 'Download PNG snapshot' }).isDisabled(), 'snapshot stayed enabled');

  // A permission request can remain pending indefinitely. The UI must show progress and let the
  // user cancel immediately; a track that opens but never yields a frame must time out visibly.
  await t.page.evaluate(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: () => new Promise(() => undefined),
    });
  });
  await t.click('Start camera');
  await t.waitForText('Starting the camera and waiting for the first video frame…');
  await t.click('Cancel');
  await t.waitForText('Ready — start the test');

  await t.page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const stream = canvas.captureStream(1);
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => stream,
    });
    const video = document.querySelector('video[aria-label="Live camera preview"]');
    video.play = () => new Promise(() => undefined);
  });
  await t.click('Start camera');
  await t.waitForText('Starting the camera and waiting for the first video frame…');
  await t.waitForText('The camera opened but did not supply a video frame.', 15_000);
  t.assert(await t.page.getByRole('alert').isVisible(), 'stalled preview timeout was not exposed as an alert');

  // Current Chrome, Safari, and Firefox expose mediaDevices.getUserMedia and enumerateDevices.
  // If capture itself is absent, detect it before prompting and disable controls that cannot work.
  await t.page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
  });
  await t.open('/webcam-test');
  await t.waitForText('This browser cannot access a camera for this test.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'missing camera API was not exposed as an alert');
  t.assert(await t.page.getByRole('button', { name: 'Start camera' }).isDisabled(), 'unsupported start stayed enabled');
  t.assert(await t.page.getByRole('combobox').isDisabled(), 'unsupported camera selector stayed enabled');

  // Final rendered state remains usable at the supported mobile width and in dark mode.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  t.assert(
    (await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
    'dark mode has no rendered page background',
  );

  await t.open('/ko/webcam-test');
  const korean = await t.page.locator('main').innerText();
  t.assert(korean.includes('웹캠 테스트'), 'Korean webcam-test page did not render');
  t.assert(korean.includes('이 브라우저에서는 카메라를 사용할 수 없습니다.'), 'Korean unsupported copy did not render');
}

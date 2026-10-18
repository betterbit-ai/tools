/** Exercise real microphone capture, recording/playback, and visible browser fallbacks. */

export default async function (t) {
  const context = t.page.context();

  // A browser-level denied request must be explained. Clearing the harness grant before opening
  // also proves the page does not rely on a permission already being present at hydration time.
  await context.clearPermissions();
  await t.open('/mic-test');
  await t.page.evaluate(() => {
    window.__realGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => {
        throw new DOMException('Permission denied for e2e', 'NotAllowedError');
      },
    });
  });
  await t.click('Start test');
  await t.waitForText('Microphone access was blocked.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'permission denial was not exposed as an alert');

  // Restore the real fake-device stream and run the complete user flow.
  await context.grantPermissions(['microphone']);
  await t.page.evaluate(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async (...args) => {
        const stream = await window.__realGetUserMedia(...args);
        window.__activeMicrophoneStream = stream;
        return stream;
      },
    });
  });
  await t.click('Start test');
  await t.waitForText('Listening now.');
  await t.page.waitForFunction(
    () => Number(document.querySelector('[role="meter"]')?.getAttribute('aria-valuenow')) > 0,
  );
  t.assert(
    /\d+ Hz/.test(await t.page.locator('main').innerText()),
    'the active stream did not expose its actual sample rate',
  );
  t.assert(
    (await t.page.getByLabel('Microphone').locator('option').count()) > 1,
    'microphone list did not refresh after permission was granted',
  );

  // The ten-second cap must complete even while this tab is in the background, and the result
  // must be a real non-empty browser recording rather than a success message alone.
  await t.click('Record 10 seconds');
  await t.waitForText('0:00 / 0:10');
  const foreground = await context.newPage();
  await foreground.goto(t.base, { waitUntil: 'load' });
  await foreground.bringToFront();
  await t.page.waitForTimeout(11_000);
  await t.page.bringToFront();
  await t.waitForText('Recording ready to play', 5_000);
  const recording = await t.page.getByLabel('Recording playback').evaluate(async (audio) => {
    const response = await fetch(audio.src);
    const blob = await response.blob();
    return { size: blob.size, type: blob.type };
  });
  t.assert(recording.size > 100, `recording was unexpectedly empty (${recording.size} bytes)`);
  t.assert(recording.type.startsWith('audio/'), `unexpected recording type ${recording.type}`);
  await foreground.close();

  // Manual stop is a second complete path and replacing a sample must remain usable.
  await t.click('Record 10 seconds');
  await t.page.waitForTimeout(1_000);
  await t.click('Stop recording');
  await t.waitForText('Recording ready to play');

  // Device-list refresh is optional to capture, but a failure must be visible and must not freeze
  // the level analyser. A disconnected active track must also leave the listening state visibly.
  await t.click('Stop test');
  await t.page.evaluate(() => {
    window.__realEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
      configurable: true,
      value: async () => {
        throw new DOMException('Enumeration failed for e2e', 'NotReadableError');
      },
    });
  });
  await t.click('Start test');
  await t.waitForText('The test is running, but the browser could not refresh the microphone list.');
  await t.page.waitForFunction(
    () => Number(document.querySelector('[role="meter"]')?.getAttribute('aria-valuenow')) > 0,
  );
  await t.page.evaluate(() => window.__activeMicrophoneStream.getAudioTracks()[0].dispatchEvent(new Event('ended')));
  await t.waitForText('The microphone disconnected.');
  t.assert(await t.page.getByRole('button', { name: 'Record 10 seconds' }).isDisabled(), 'recording stayed enabled');
  t.assert(
    (await t.page.locator('[role="meter"]').getAttribute('aria-valuenow')) === '0',
    'stopping did not reset the live meter',
  );

  // Current Chrome, Safari, and Firefox expose mediaDevices/getUserMedia, AudioContext, and
  // MediaRecorder. Recording is detected separately so a browser missing only MediaRecorder can
  // still run the meter without offering a button that cannot work.
  await t.page.addInitScript(() => {
    Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: undefined });
  });
  await t.open('/mic-test');
  await t.waitForText('This browser can test the microphone but cannot make a local recording.');
  t.assert(
    await t.page.getByRole('button', { name: 'Start test' }).isEnabled(),
    'live test was disabled with recorder',
  );
  t.assert(
    await t.page.getByRole('button', { name: 'Record 10 seconds' }).isDisabled(),
    'unsupported recorder control stayed enabled',
  );

  // If capture or analysis is absent, detect it before prompting and say that this browser cannot
  // run the test instead of reporting a busy microphone.
  await t.page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
  });
  await t.open('/mic-test');
  await t.waitForText('This browser cannot access a microphone for this test.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'missing microphone API was not exposed as an alert');
  t.assert(await t.page.getByRole('button', { name: 'Start test' }).isDisabled(), 'unsupported start stayed enabled');

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
}

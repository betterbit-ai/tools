/** Exercise real Web Audio playback, background behavior, settings, and visible fallbacks. */

export default async function (t) {
  const context = t.page.context();

  // Web Audio does not request microphone/camera permission. Starting after the harness grants
  // are cleared proves the tool depends only on a user gesture, as current Chrome/Safari/Firefox do.
  await context.clearPermissions();
  await t.page.addInitScript(() => {
    window.__metronomeContexts = [];
    window.__metronomeSources = [];
    const RealAudioContext = window.AudioContext;
    window.AudioContext = new Proxy(RealAudioContext, {
      construct(target, argumentsList) {
        const audioContext = Reflect.construct(target, argumentsList);
        window.__metronomeContexts.push(audioContext);
        return audioContext;
      },
    });
    const realCreateBufferSource = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      const source = realCreateBufferSource.call(this);
      const record = { source, starts: 0, stops: 0 };
      window.__metronomeSources.push(record);
      const realStart = source.start.bind(source);
      const realStop = source.stop.bind(source);
      source.start = (...args) => {
        record.starts += 1;
        return realStart(...args);
      };
      source.stop = (...args) => {
        record.stops += 1;
        return realStop(...args);
      };
      return source;
    };
  });
  await t.open('/metronome');

  t.assert(
    await t.page.evaluate(
      () =>
        typeof window.AudioContext === 'function' &&
        typeof AudioContext.prototype.createBufferSource === 'function' &&
        typeof AudioBufferSourceNode.prototype.start === 'function',
    ),
    'current Chromium did not expose the standard Web Audio surface used by Safari and Firefox',
  );

  // A realistic practice setup must create one bounded, looping bar without any permission prompt.
  const tempo = t.page.getByRole('spinbutton', { name: 'Tempo (BPM)', exact: true });
  const volume = t.page.getByRole('spinbutton', { name: 'Volume (%)', exact: true });
  await tempo.fill('96');
  await volume.fill('55');
  await t.page.getByRole('radio', { name: '3/4', exact: true }).click();
  await t.click('Start');
  await t.waitForText('Playing');
  const started = await t.page.evaluate(() => {
    const context = window.__metronomeContexts[0];
    const record = window.__metronomeSources[0];
    const buffer = record?.source.buffer;
    const samples = buffer?.getChannelData(0);
    const beatFrames = Math.round(0.625 * (buffer?.sampleRate ?? 0));
    const peak = (from, to) => {
      let value = 0;
      for (let index = from; samples && index < Math.min(samples.length, to); index += 1) {
        value = Math.max(value, Math.abs(samples[index]));
      }
      return value;
    };
    return {
      contextState: context?.state,
      duration: buffer?.duration,
      firstPeak: peak(0, beatFrames),
      secondPeak: peak(beatFrames, beatFrames * 2),
      loop: record?.source.loop,
      starts: record?.starts,
      stops: record?.stops,
    };
  });
  t.assert(started.contextState === 'running', `audio context stayed ${started.contextState}`);
  t.assert(started.loop === true && started.starts === 1, 'the metronome did not start one looping source');
  t.assert(
    Math.abs(started.duration - 1.875) < 0.01,
    `96 BPM in 3/4 produced a ${started.duration}-second buffer instead of one 1.875-second bar`,
  );
  t.assert(started.secondPeak > 0.1, `the generated click waveform was silent (${started.secondPeak})`);
  t.assert(
    started.firstPeak > started.secondPeak,
    `first-beat peak ${started.firstPeak} did not exceed regular-beat peak ${started.secondPeak}`,
  );

  // Headless Chromium has no real output device and stalls its audio clock after startup. The
  // native loop must nevertheless stay allocated and unstopped across a real tab switch, with no
  // timer-created sources or missed-beat queue.
  const foreground = await context.newPage();
  await foreground.goto(t.base, { waitUntil: 'load' });
  await foreground.bringToFront();
  await t.page.waitForTimeout(2_500);
  const background = await t.page.evaluate(() => ({
    sourceCount: window.__metronomeSources.length,
    stops: window.__metronomeSources[0]?.stops,
  }));
  t.assert(background.sourceCount === 1, `background playback allocated ${background.sourceCount} sources`);
  t.assert(background.stops === 0, 'the looping source stopped while the tab was in the background');
  await t.page.bringToFront();
  await foreground.close();
  await t.page.waitForTimeout(500);
  t.assert(
    (await t.page.evaluate(() => window.__metronomeContexts[0]?.state)) === 'running',
    'audio context no longer reported running after the background tab returned',
  );
  t.assert(
    (await t.page.evaluate(() => window.__metronomeSources.length)) === 1,
    'returning to the page allocated a catch-up source',
  );

  // Live tempo changes replace one bounded loop, while volume changes reuse it.
  await tempo.fill('132');
  await t.page.waitForFunction(() => window.__metronomeSources.length === 2);
  await volume.fill('40');
  const changed = await t.page.evaluate(() => ({
    sourceCount: window.__metronomeSources.length,
    firstStops: window.__metronomeSources[0].stops,
    secondLoop: window.__metronomeSources[1].source.loop,
  }));
  t.assert(changed.sourceCount === 2, 'volume-only update allocated another audio loop');
  t.assert(changed.firstStops === 1 && changed.secondLoop, 'tempo update did not replace the previous loop cleanly');

  // Stop is immediate, tap tempo accepts an ordinary steady pulse, and keyboard control works.
  await t.click('Stop');
  t.assert(
    (await t.page.evaluate(() => window.__metronomeSources[1].stops)) === 1,
    'Stop left the active audio source running',
  );
  await t.click('Reset settings');
  await t.page.evaluate(() => {
    window.__realDateNow = Date.now;
    window.__metronomeNow = Date.now();
    Date.now = () => window.__metronomeNow;
  });
  await t.click('Tap tempo');
  await t.page.evaluate(() => {
    window.__metronomeNow += 500;
  });
  await t.click('Tap tempo');
  const tappedBpm = Number(await tempo.inputValue());
  t.assert(tappedBpm === 120, `two 500 ms taps produced ${tappedBpm} BPM`);
  await t.page.evaluate(() => {
    Date.now = window.__realDateNow;
  });
  await t.page.keyboard.press('Space');
  t.assert(
    (await t.page.getByText('Ready to play', { exact: true }).count()) === 1,
    'Space on the focused Tap tempo button also started playback',
  );
  await t.page.evaluate(() => document.activeElement?.blur());
  await t.page.keyboard.press('Space');
  await t.waitForText('Playing');
  await t.page.keyboard.press('Space');
  await t.waitForText('Ready to play');

  // Settings survive a reload, but sound never autostarts without another user gesture.
  await tempo.fill('135');
  await t.page.getByRole('radio', { name: '6/8', exact: true }).click();
  await t.page.waitForTimeout(50);
  await t.page.reload({ waitUntil: 'load' });
  await t.page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await t.page.waitForFunction(() => document.querySelector('[aria-label="Tempo (BPM)"]')?.value === '135');
  t.assert((await tempo.inputValue()) === '135', 'saved tempo was not restored after reload');
  t.assert(
    (await t.page.getByRole('radio', { name: '6/8', exact: true }).getAttribute('aria-checked')) === 'true',
    'saved time signature was not restored after reload',
  );
  t.assert((await t.page.getByText('Ready to play', { exact: true }).count()) === 1, 'reload autostarted audio');

  // A rejected activation is visible and retryable; Web Audio has no separate sound permission.
  await t.page.addInitScript(() => {
    Object.defineProperty(AudioContext.prototype, 'resume', {
      configurable: true,
      value: () => Promise.reject(new Error('audio activation blocked for e2e')),
    });
  });
  await t.open('/metronome');
  await t.click('Start');
  await t.waitForText('The browser could not start audio. Check the device output, then press Start again.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'rejected audio activation was not exposed as an alert');
  t.assert(
    await t.page.getByRole('button', { name: 'Start', exact: true }).isEnabled(),
    'failed start was not retryable',
  );

  // Safari can leave resume pending; the three-second guard must turn that silent wait into an error.
  await t.page.addInitScript(() => {
    Object.defineProperty(AudioContext.prototype, 'resume', {
      configurable: true,
      value: () => new Promise(() => {}),
    });
  });
  await t.open('/metronome');
  await t.click('Start');
  await t.waitForText('The browser could not start audio. Check the device output, then press Start again.', 5_000);

  // Missing Web Audio is detected before construction and accurately described in both locales.
  await t.page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined });
  });
  await t.open('/metronome');
  await t.click('Start');
  await t.waitForText('This browser does not support the Web Audio features this metronome needs.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'missing Web Audio was not exposed as an alert');
  await t.open('/ko/metronome');
  await t.click('시작');
  await t.waitForText('이 브라우저는 메트로놈에 필요한 Web Audio 기능을 지원하지 않습니다.');

  // The rendered fallback remains keyboard-accessible at the supported mobile width in dark mode.
  await t.page.getByRole('button', { name: '시작', exact: true }).focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.textContent?.trim())) === '탭 템포',
    'keyboard focus did not advance through the primary controls',
  );
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

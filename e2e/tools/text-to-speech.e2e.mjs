/** Exercise native feature detection, long local playback, controls, and visible fallbacks. */

export default async function (t) {
  const context = t.page.context();

  // Text-to-speech does not need microphone permission. Start without the harness grant and
  // inspect the actual Chromium surface before replacing audio output with a deterministic fake.
  await context.clearPermissions();
  await t.open('/text-to-speech');
  const browserSurface = await t.page.evaluate(async () => ({
    speechSynthesis: typeof window.speechSynthesis,
    utterance: typeof window.SpeechSynthesisUtterance,
    getVoices: typeof window.speechSynthesis?.getVoices,
    speak: typeof window.speechSynthesis?.speak,
    pause: typeof window.speechSynthesis?.pause,
    resume: typeof window.speechSynthesis?.resume,
    cancel: typeof window.speechSynthesis?.cancel,
    microphonePermission: await navigator.permissions
      ?.query({ name: 'microphone' })
      .then((permission) => permission.state)
      .catch(() => 'unavailable'),
  }));
  t.assert(browserSurface.speechSynthesis === 'object', 'current Chromium has no speechSynthesis controller');
  t.assert(browserSurface.utterance === 'function', 'current Chromium has no SpeechSynthesisUtterance constructor');
  for (const method of ['getVoices', 'speak', 'pause', 'resume', 'cancel']) {
    t.assert(browserSurface[method] === 'function', `current Chromium has no speechSynthesis.${method}()`);
  }
  t.assert(
    browserSurface.microphonePermission !== 'granted',
    `text-to-speech unexpectedly required a granted microphone (${browserSurface.microphonePermission})`,
  );

  // Headless Chromium has no OS voice output. This browser-shaped implementation retains the
  // real page, DOM, event loop, and tab lifecycle while making utterance completion observable.
  await t.page.addInitScript(() => {
    const mode = new URL(location.href).searchParams.get('e2e-speech');
    if (!mode) return;
    if (mode === 'missing') {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: undefined });
      return;
    }

    const localEnglish = {
      name: 'Device English',
      lang: 'en-US',
      voiceURI: 'local-en',
      default: true,
      localService: true,
    };
    const localKorean = {
      name: '기기 한국어',
      lang: 'ko-KR',
      voiceURI: 'local-ko',
      default: false,
      localService: true,
    };
    const remote = {
      name: 'Vendor Online',
      lang: 'en-US',
      voiceURI: 'remote-en',
      default: false,
      localService: false,
    };
    let voices = mode === 'remote-only' ? [remote] : [localEnglish, localKorean, remote];

    class FakeUtterance extends EventTarget {
      constructor(text) {
        super();
        this.text = text;
        this.lang = '';
        this.voice = null;
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.onend = null;
        this.onerror = null;
      }
    }

    const controller = new EventTarget();
    Object.assign(controller, {
      utterances: [],
      active: null,
      pauseCount: 0,
      resumeCount: 0,
      cancelCount: 0,
      cancelThrows: false,
      autoComplete: false,
      getVoices() {
        if (mode === 'broken-list') throw new Error('Voice list unavailable for e2e');
        return voices;
      },
      speak(utterance) {
        this.utterances.push(utterance);
        this.active = utterance;
        if (this.autoComplete) queueMicrotask(() => this.finish());
      },
      pause() {
        this.pauseCount += 1;
      },
      resume() {
        this.resumeCount += 1;
      },
      cancel() {
        this.cancelCount += 1;
        if (this.cancelThrows) throw new Error('Cancel failed for e2e');
        this.active = null;
      },
      finish() {
        const utterance = this.active;
        this.active = null;
        queueMicrotask(() => utterance?.onend?.(new Event('end')));
      },
      fail(error) {
        const utterance = this.active;
        this.active = null;
        queueMicrotask(() => utterance?.onerror?.({ error }));
      },
      setVoices(next) {
        voices = next;
        this.dispatchEvent(new Event('voiceschanged'));
      },
    });
    window.__speechE2E = controller;
    window.__speechE2EVoices = { localEnglish, localKorean, remote };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: controller });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance });
  });

  await context.clearPermissions();
  await t.open('/text-to-speech?e2e-speech=mock');
  const voiceSelect = t.page.getByLabel('Local device voice');
  await t.page.waitForFunction(() => document.querySelectorAll('select option').length === 2);
  t.assert((await voiceSelect.locator('option').count()) === 2, 'remote voice was offered as a private local voice');
  t.assert((await voiceSelect.inputValue()) === 'local-en', 'page locale did not select the matching local voice');

  // A realistic long note must be chunked rather than rejected or handed to the engine as one
  // fragile utterance. Settings and every Unicode character remain represented in the queue.
  const sentence =
    'Please read the quarterly project notes, including café names, family emoji 👨‍👩‍👧‍👦, and the Friday deadline. ';
  const longText = sentence.repeat(120).trim();
  const editor = t.page.getByLabel('Text to read aloud');
  await editor.fill(longText);
  await t.page.getByRole('spinbutton', { name: 'Speed', exact: true }).fill('1.4');
  await t.page.getByRole('spinbutton', { name: 'Pitch', exact: true }).fill('0.8');
  await t.page.getByRole('spinbutton', { name: 'Volume', exact: true }).fill('0.7');
  await t.click('Play');
  await t.waitForText(/Reading part 1 of \d+/);
  const firstUtterance = await t.page.evaluate(() => {
    const utterance = window.__speechE2E.utterances[0];
    return {
      text: utterance.text,
      lang: utterance.lang,
      voiceURI: utterance.voice?.voiceURI,
      rate: utterance.rate,
      pitch: utterance.pitch,
      volume: utterance.volume,
      microphonePermissionCalls: window.__microphonePermissionCalls ?? 0,
    };
  });
  t.assert([...firstUtterance.text].length <= 220, 'long text was not divided into safe utterances');
  t.assert(firstUtterance.lang === 'en-US' && firstUtterance.voiceURI === 'local-en', 'wrong voice was spoken');
  t.assert(
    firstUtterance.rate === 1.4 && firstUtterance.pitch === 0.8 && firstUtterance.volume === 0.7,
    `speech settings were not applied: ${JSON.stringify(firstUtterance)}`,
  );

  await t.click('Pause');
  t.assert((await t.page.evaluate(() => window.__speechE2E.pauseCount)) === 1, 'Pause did not reach the browser');
  await t.click('Resume');
  t.assert((await t.page.evaluate(() => window.__speechE2E.resumeCount)) === 1, 'Resume did not reach the browser');

  // Complete all remaining parts while another tab is foregrounded. MessageChannel yielding is
  // not timer-throttled in background tabs, and the UI must return to a usable ready state.
  const foreground = await context.newPage();
  await foreground.goto(t.base, { waitUntil: 'load' });
  await foreground.bringToFront();
  await t.page.evaluate(() => {
    window.__speechE2E.autoComplete = true;
    window.__speechE2E.finish();
  });
  await t.page.waitForFunction(() =>
    [...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Pause' && button.disabled),
  );
  const completed = await t.page.evaluate(() => ({
    utterances: window.__speechE2E.utterances.map((utterance) => utterance.text),
    active: window.__speechE2E.active,
  }));
  t.assert(completed.utterances.length > 20, `long input used only ${completed.utterances.length} utterances`);
  t.assert(completed.utterances.join(' ') === longText, 'chunked playback dropped or reordered text');
  t.assert(completed.active === null, 'speech remained active after the final part');
  await t.page.bringToFront();
  await foreground.close();

  // Stop must cancel immediately and stale native completion must not restart the queue.
  await t.page.evaluate(() => {
    window.__speechE2E.autoComplete = false;
  });
  await t.click('Play');
  const beforeStop = await t.page.evaluate(() => window.__speechE2E.utterances.length);
  const stoppedUtterance = await t.page.evaluateHandle(() => window.__speechE2E.active);
  await t.click('Stop');
  await stoppedUtterance.evaluate((utterance) => utterance?.onend?.(new Event('end')));
  await t.page.waitForTimeout(50);
  t.assert(
    (await t.page.evaluate(() => window.__speechE2E.utterances.length)) === beforeStop,
    'a stopped session started another part',
  );

  // Native policy failures and failed cancellation must replace optimistic playback state with
  // an actionable message instead of claiming sound stopped or started.
  await t.click('Play');
  await t.page.evaluate(() => window.__speechE2E.fail('not-allowed'));
  await t.waitForText('The browser blocked speech playback. Select Play again to allow sound.');
  await t.click('Play');
  await t.page.evaluate(() => {
    window.__speechE2E.cancelThrows = true;
  });
  await t.click('Stop');
  await t.waitForText('The browser did not confirm that speech stopped.');
  await t.page.evaluate(() => {
    window.__speechE2E.cancelThrows = false;
  });

  // Losing the selected local voice between parts must fail visibly. Falling back to a browser
  // default could silently route private text to an online voice.
  await t.click('Play');
  await t.page.evaluate(() => {
    const { remote } = window.__speechE2EVoices;
    window.__speechE2E.setVoices([remote]);
    window.__speechE2E.finish();
  });
  await t.waitForText('The selected local voice is no longer available. Choose another local voice and try again.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'lost local voice was not exposed as an alert');

  // A supported browser with no local voices needs an explanation on load, not inert controls.
  await t.open('/text-to-speech?e2e-speech=remote-only');
  await t.waitForText('No local device voice is available.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'empty local voice list was silent');
  t.assert(
    await t.page.getByRole('button', { name: 'Play', exact: true }).isDisabled(),
    'voice-less play stayed enabled',
  );

  // A voice-list exception is different from an empty list and must not be mislabeled as a
  // missing operating-system voice.
  await t.open('/text-to-speech?e2e-speech=broken-list');
  await t.waitForText('The browser could not load its voice list. Reload the page, then try again.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'voice-list failure was not exposed as an alert');

  // Feature detection checks usable values and methods. Chrome, Safari, and Firefox currently
  // expose the unprefixed synthesis API; a missing or partially disabled API is explained.
  await t.open('/text-to-speech?e2e-speech=missing');
  await t.waitForText('Speech synthesis is not available in this browser.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'missing synthesis API was not exposed as an alert');
  t.assert(
    await t.page.getByRole('button', { name: 'Play', exact: true }).isDisabled(),
    'unsupported play stayed enabled',
  );

  // Korean fallback copy, keyboard focus, mobile width, and dark rendering remain usable.
  await t.open('/ko/text-to-speech?e2e-speech=remote-only');
  await t.waitForText('사용할 수 있는 로컬 기기 음성이 없습니다.');
  await t.page.getByLabel('읽을 텍스트').focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.innerText.trim())) === '예시 넣기',
    'keyboard focus did not move to the first text action',
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

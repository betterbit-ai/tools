/** Exercise local-only recognition, setup cancellation, and visible browser failures. */

export default async function (t) {
  const context = t.page.context();

  // Permission is not assumed at hydration time. Playwright's Chromium 141 has the same
  // unprefixed local-recognition surface that shipped in Chrome 139; Safari lacks these local
  // methods and Firefox exposes them only in preview builds, so the tool must detect every member.
  await context.clearPermissions();
  await t.open('/speech-to-text');
  const browserSurface = await t.page.evaluate(() => {
    const Recognition = Reflect.get(window, 'SpeechRecognition');
    return {
      recognition: typeof Recognition,
      available: typeof Recognition?.available,
      install: typeof Recognition?.install,
      processLocally: 'processLocally' in (Recognition?.prototype ?? {}),
    };
  });
  t.assert(browserSurface.recognition === 'function', 'current Chromium has no SpeechRecognition constructor');
  t.assert(browserSurface.available === 'function', 'current Chromium has no on-device availability check');
  t.assert(browserSurface.install === 'function', 'current Chromium has no on-device language-pack installer');
  t.assert(browserSurface.processLocally, 'current Chromium has no processLocally recognition property');

  // A browser-level microphone denial arrives as a recognition error event. It must replace the
  // preparing state with an actionable alert rather than looking like an unsupported language.
  await t.page.evaluate(() => {
    class PermissionDeniedRecognition {
      static async available() {
        return 'available';
      }
      static async install() {
        return true;
      }
      start() {
        queueMicrotask(() => {
          this.onerror?.({ error: 'not-allowed' });
          this.onend?.();
        });
      }
      stop() {
        this.onend?.();
      }
    }
    Object.defineProperty(window, 'SpeechRecognition', {
      configurable: true,
      value: PermissionDeniedRecognition,
    });
  });
  await t.click('Start dictation');
  await t.waitForText('Microphone permission was blocked.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'permission denial was not exposed as an alert');

  // Browser language-pack checks can take a long time or fail to settle. Preparation must remain
  // cancellable, and cancellation must not later start a stale recognition session.
  await t.page.evaluate(() => {
    class StalledRecognition {
      static available() {
        return new Promise(() => {});
      }
      static async install() {
        return true;
      }
      start() {
        window.__staleSpeechSessionStarted = true;
      }
      stop() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: StalledRecognition });
  });
  await t.click('Start dictation');
  await t.waitForText('Checking or downloading the on-device language pack…');
  await t.click('Cancel setup');
  await t.page.getByRole('button', { name: 'Start dictation', exact: true }).waitFor();
  t.assert(!(await t.page.evaluate(() => window.__staleSpeechSessionStarted)), 'cancelled setup started later');

  // Run a Chrome-shaped main flow. The fake recognizer supplies deterministic realistic speech
  // because headless Chrome's fake microphone emits a tone and cannot download OS language packs.
  await t.page.evaluate(() => {
    window.__speechAvailableCalls = [];
    window.__speechInstallCalls = [];
    window.__speechInstances = [];
    class LocalRecognition {
      static async available(options) {
        window.__speechAvailableCalls.push(structuredClone(options));
        if ('quality' in options) throw new Error('quality is not supported before Chrome 150');
        return 'downloadable';
      }
      static async install(options) {
        window.__speechInstallCalls.push(structuredClone(options));
        return true;
      }
      constructor() {
        window.__speechInstances.push(this);
      }
      start() {
        window.__activeSpeechRecognition = this;
        queueMicrotask(() => Reflect.get(this, 'onstart')?.());
      }
      stop() {
        queueMicrotask(() => this.onend?.());
      }
    }
    LocalRecognition.prototype.processLocally = false;
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: LocalRecognition });
    window.__emitSpeech = (parts) => {
      const results = parts.map(({ text, final }) => ({ 0: { transcript: text }, isFinal: final }));
      window.__activeSpeechRecognition?.onresult?.({ resultIndex: 0, results });
    };
  });
  await t.click('Start dictation');
  await t.page.getByRole('button', { name: 'Stop dictation', exact: true }).waitFor();
  const setup = await t.page.evaluate(() => {
    const instance = window.__speechInstances[0];
    return {
      availableCalls: window.__speechAvailableCalls,
      installCalls: window.__speechInstallCalls,
      lang: instance?.lang,
      continuous: instance?.continuous,
      interimResults: instance?.interimResults,
      maxAlternatives: instance?.maxAlternatives,
      processLocally: instance?.processLocally,
    };
  });
  t.assert(setup.availableCalls.length === 1, `availability was probed ${setup.availableCalls.length} times`);
  t.assert(
    JSON.stringify(setup.availableCalls[0]) === JSON.stringify({ langs: ['en-US'], processLocally: true }),
    `unsupported availability options were sent: ${JSON.stringify(setup.availableCalls[0])}`,
  );
  t.assert(
    JSON.stringify(setup.installCalls) === JSON.stringify([{ langs: ['en-US'], processLocally: true }]),
    `language-pack install options differed: ${JSON.stringify(setup.installCalls)}`,
  );
  t.assert(
    setup.lang === 'en-US' && setup.continuous && setup.interimResults && setup.maxAlternatives === 1,
    `recognizer was misconfigured: ${JSON.stringify(setup)}`,
  );
  t.assert(setup.processLocally === true, 'recognizer did not require local processing');

  await t.page.evaluate(() => window.__emitSpeech([{ text: 'Schedule the dentist appointment', final: false }]));
  await t.waitForText('Hearing: Schedule the dentist appointment');

  // Native recognition events continue without a JavaScript polling loop. Deliver a finalized
  // result while another page is foregrounded and verify it is retained when this tab returns.
  const foreground = await context.newPage();
  await foreground.goto(t.base, { waitUntil: 'load' });
  await foreground.bringToFront();
  await t.page.evaluate(() =>
    window.__emitSpeech([
      { text: 'Schedule the dentist appointment for Friday morning.', final: true },
      { text: 'Bring the insurance card', final: false },
    ]),
  );
  await t.page.bringToFront();
  await foreground.close();
  const transcript = 'Schedule the dentist appointment for Friday morning.';
  await t.page.getByLabel('Transcript').waitFor();
  t.assert((await t.page.getByLabel('Transcript').inputValue()) === transcript, 'final speech was not transcribed');
  await t.waitForText('Hearing: Bring the insurance card');

  const download = await t.download(() => t.click('Download .txt'));
  t.assert(download.name === 'dictation.txt', `unexpected transcript filename ${download.name}`);
  t.assert(download.bytes.toString('utf8') === transcript, 'downloaded transcript differed from the editor');
  await t.click('Stop dictation');
  await t.page.getByRole('button', { name: 'Start dictation', exact: true }).waitFor();

  // A failed pack download is a setup problem, not an unsupported-browser claim.
  await t.page.evaluate(() => {
    class InstallFailureRecognition {
      static async available() {
        return 'downloadable';
      }
      static async install() {
        return false;
      }
    }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: InstallFailureRecognition });
  });
  await t.click('Start dictation');
  await t.waitForText('The browser could not prepare on-device dictation.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'language-pack failure was not exposed as an alert');

  // Safari's prefixed recognition lacks the local-pack contract and Firefox stable lacks the
  // on-device surface. Neither may silently fall back to cloud-backed recognition.
  await t.page.evaluate(() => {
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: undefined });
    Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: class {} });
  });
  await t.click('Start dictation');
  await t.waitForText('Private on-device dictation is not available');
  t.assert(await t.page.getByRole('alert').isVisible(), 'missing local API was not exposed as an alert');

  // Korean failure copy and the final mobile/dark layout remain usable.
  await t.page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: undefined });
    Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: class {} });
  });
  await t.open('/ko/speech-to-text');
  await t.click('받아쓰기 시작');
  await t.waitForText('기기 내 받아쓰기를 사용할 수 없습니다.');
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

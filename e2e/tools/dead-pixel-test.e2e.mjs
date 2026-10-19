/** Exercise the real full-screen colour flow and both visible browser fallbacks. */

export default async function (t) {
  const context = t.page.context();

  // Fullscreen is user-activated rather than permission-granted. Clearing the harness grants
  // proves the main flow does not accidentally depend on the camera/microphone setup.
  await context.clearPermissions();
  await t.open('/dead-pixel-test');

  await t.click('Blue');
  const preview = t.page.getByRole('img', { name: 'Blue · 5 of 9' });
  t.assert(await preview.isVisible(), 'choosing blue did not update the labelled preview');
  t.assert(
    (await preview.locator('.screen-test-surface').evaluate((element) => getComputedStyle(element).backgroundColor)) ===
      'rgb(0, 0, 255)',
    'the blue diagnostic field did not render as an exact display primary',
  );

  // Current Chrome, Safari, and Firefox expose the standard requestFullscreen method. Run it
  // instead of stubbing success so the actual browser event and exit paths are covered.
  await t.click('Start full-screen test');
  await t.page.waitForFunction(() => document.fullscreenElement !== null);
  const testSurface = t.page.locator('.screen-test-surface.fixed.inset-0');
  t.assert(await testSurface.isVisible(), 'the full-screen colour field was not visible');
  t.assert((await testSurface.innerText()).includes('Blue · 5 of 9'), 'the full-screen field lost the selected colour');

  // A tap/click must work for phones, which have no arrow keys once the field fills the window.
  await testSurface.click({ position: { x: 20, y: 100 } });
  await t.page.waitForTimeout(100);
  t.assert(
    (await testSurface.innerText()).includes('Gray · 6 of 9'),
    `clicking did not advance the field: ${await testSurface.innerText()}`,
  );

  // Headless Chromium handles physical keys at the browser layer while native fullscreen is
  // active, so dispatch page key events here and exercise physical keyboard input in fallback
  // mode below. This still covers the production listener while keeping real fullscreen active.
  await t.page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })));
  await t.page.waitForTimeout(100);
  t.assert((await testSurface.innerText()).includes('Cyan · 7 of 9'), 'Right Arrow did not advance the field');
  await t.page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })));
  await t.page.waitForTimeout(100);
  t.assert((await testSurface.innerText()).includes('Magenta · 8 of 9'), 'Space did not advance the field');
  await t.page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })));
  await t.page.waitForTimeout(100);
  t.assert((await testSurface.innerText()).includes('Cyan · 7 of 9'), 'Left Arrow did not return to the prior field');

  await t.page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })));
  await t.page.waitForTimeout(3_500);
  t.assert(
    (await testSurface.innerText()).includes('Magenta · 8 of 9'),
    `automatic cycling did not advance the colour: ${await testSurface.innerText()}`,
  );
  await t.page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })));
  await t.click('Exit test');
  await t.page.waitForFunction(() => document.fullscreenElement === null);
  t.assert((await testSurface.count()) === 0, 'exiting left the test field over the page');

  // Rejection is how a policy-disabled or denied Fullscreen API reports failure. The fallback
  // must keep working and explain the degradation inside the field the user can actually see.
  await t.page.evaluate(() => {
    Object.defineProperty(Element.prototype, 'requestFullscreen', {
      configurable: true,
      value: async () => {
        throw new DOMException('Fullscreen denied for e2e', 'NotAllowedError');
      },
    });
  });
  await t.click('Start full-screen test');
  await t.waitForText('Full screen is unavailable, so the test is filling this browser window instead.');
  t.assert(
    (await testSurface.innerText()).includes('Full screen is unavailable'),
    'fullscreen rejection was hidden behind the fallback field',
  );
  t.assert(
    (await t.page.evaluate(() => document.fullscreenElement)) === null,
    'rejected fullscreen unexpectedly activated',
  );
  await t.page.waitForTimeout(100);
  await t.page.keyboard.press('ArrowRight');
  await t.page.waitForTimeout(100);
  t.assert((await testSurface.innerText()).includes('Yellow · 9 of 9'), 'fallback ignored physical keyboard input');
  await testSurface.click({ position: { x: 20, y: 100 } });
  await t.page.waitForTimeout(100);
  t.assert((await testSurface.innerText()).includes('White · 1 of 9'), 'fallback ignored click input');
  await t.click('Exit test');

  // Browsers without the standard API (notably some mobile/in-app browsers) must use the same
  // complete window-filling test without exposing a control that silently does nothing.
  await t.page.evaluate(() => {
    Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined });
  });
  await t.click('Start full-screen test');
  await t.waitForText('Full screen is unavailable, so the test is filling this browser window instead.');
  t.assert(await testSurface.isVisible(), 'missing Fullscreen API did not start the window fallback');
  t.assert(
    (await testSurface.innerText()).includes('Full screen is unavailable'),
    'missing Fullscreen API was not explained inside the fallback field',
  );
  await t.click('Exit test');
  await t.page.waitForFunction(() => !document.querySelector('.screen-test-surface.fixed.inset-0'));
  t.assert((await testSurface.count()) === 0, 'exit did not close the non-fullscreen fallback');

  // Korean failure copy, keyboard focus, mobile width, and dark rendering remain usable.
  await t.page.addInitScript(() => {
    Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined });
  });
  await t.open('/ko/dead-pixel-test');
  await t.click('전체화면 테스트 시작');
  await t.waitForText('전체화면을 사용할 수 없어 이 브라우저 창을 채워 검사합니다.');
  t.assert(
    (await testSurface.innerText()).includes('전체화면을 사용할 수 없어'),
    'Korean fallback explanation was hidden behind the test field',
  );
  await t.click('검사 종료');
  await t.page.getByRole('button', { name: '흰색', exact: true }).focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.textContent?.trim())) === '검정',
    'keyboard focus did not move through the colour controls',
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

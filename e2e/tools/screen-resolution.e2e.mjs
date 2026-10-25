/** Exercise live browser metrics, resize/refresh/copy flows, and honest API fallbacks. */

export default async function (t) {
  const context = t.page.context();
  const statText = async (label) => t.page.getByText(label, { exact: true }).locator('..').innerText();

  // This tool uses no protected device API. Clearing the harness microphone/camera grants before
  // opening proves its main flow is independent of permissions and still reads the real browser.
  await context.clearPermissions();
  await t.open('/screen-resolution');

  const browserMetrics = await t.page.evaluate(() => ({
    screen: `${screen.width} × ${screen.height}`,
    layout: `${innerWidth} × ${innerHeight}`,
    visual: visualViewport ? `${Math.floor(visualViewport.width)} × ${Math.floor(visualViewport.height)}` : null,
    dpr: devicePixelRatio,
    scale: visualViewport?.scale ?? null,
    colorDepth: screen.colorDepth,
  }));
  t.assert(browserMetrics.visual !== null, 'current Chromium did not expose the standard Visual Viewport API');
  t.assert(
    (await statText('Screen (browser-reported CSS px)')).includes(browserMetrics.screen),
    'screen card did not match the real Screen API',
  );
  t.assert(
    (await statText('Layout viewport (CSS px)')).includes(browserMetrics.layout),
    'layout card did not match window.innerWidth/innerHeight',
  );
  t.assert(
    (await statText('Visual viewport (CSS px)')).includes(browserMetrics.visual),
    'visual card did not match window.visualViewport',
  );
  t.assert(
    (await statText('Device pixel ratio (DPR)')).includes(String(browserMetrics.dpr)),
    'DPR card did not match window.devicePixelRatio',
  );
  t.assert(
    (await statText('Visual viewport scale')).includes(`${browserMetrics.scale * 100}%`),
    'scale card did not match window.visualViewport.scale',
  );
  t.assert(
    (await statText('Color depth')).includes(`${browserMetrics.colorDepth} bit`),
    'color-depth card did not match the Screen API',
  );

  // Real browser resize events must update both viewport cards and the active CSS range without
  // requiring a manual refresh.
  await t.page.setViewportSize({ width: 768, height: 700 });
  await t.waitForText('768 × 700');
  t.assert(
    (await statText('Layout viewport (CSS px)')).includes('768 × 700'),
    'window resize did not update the layout viewport',
  );
  t.assert(
    (await statText('Active CSS breakpoint')).includes('md · 768–1023 CSS px'),
    'window resize did not update the active CSS breakpoint',
  );

  // The visible control and documented R shortcut both perform fresh browser reads. Replacing
  // this spec-defined, replaceable property distinguishes each refresh from stale state.
  await t.page.evaluate(() => Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 }));
  await t.click('Refresh');
  await t.page.waitForTimeout(100);
  const refreshedDpr = await statText('Device pixel ratio (DPR)');
  t.assert(refreshedDpr.includes('2'), `Refresh kept stale DPR data: ${refreshedDpr}`);
  await t.page.evaluate(() => Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 }));
  await t.page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' })));
  await t.page.waitForTimeout(100);
  const shortcutDpr = await statText('Device pixel ratio (DPR)');
  t.assert(shortcutDpr.includes('3'), `R shortcut kept stale DPR data: ${shortcutDpr}`);

  // Complete the normal copy flow with the browser clipboard implementation and inspect exactly
  // what another app would receive.
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await t.click('Copy report and CSS query');
  await t.waitForText('Copied');
  const copied = await t.page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes('Layout viewport: 768 × 700 CSS px'), 'copied report lost the live layout viewport');
  t.assert(copied.includes('Device pixel ratio (DPR): 3'), 'copied report retained stale DPR data');
  t.assert(
    copied.includes('@media (min-width: 768px) and (max-width: 1023.98px)'),
    'copied report did not include the current bounded media query',
  );

  // A blocked or missing clipboard must be explained instead of causing an unhandled rejection.
  await t.page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: async () => {
        throw new DOMException('Clipboard denied for e2e', 'NotAllowedError');
      },
    });
  });
  await t.click('Copy report and CSS query');
  await t.waitForText('Could not copy the report. Allow clipboard access or select and copy the values manually.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'clipboard failure was not exposed as an alert');

  // Current Chrome, Safari, and Firefox expose visualViewport, scale, and its resize event. The
  // standard still permits null, and embedded/privacy-restricted browsers may omit the API. That
  // branch must show unavailable values rather than silently claiming the layout viewport and 100%.
  await t.page.addInitScript(() => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: null });
  });
  await t.open('/screen-resolution');
  await t.waitForText(
    'This browser does not expose the Visual Viewport API. Visual viewport size and scale are unavailable.',
  );
  t.assert(
    (await statText('Visual viewport (CSS px)')).includes('Unavailable'),
    'missing Visual Viewport API was presented as a measured size',
  );
  t.assert(
    (await statText('Visual viewport scale')).includes('Unavailable'),
    'missing Visual Viewport API was presented as 100% scale',
  );

  // Localized fallback copy, keyboard navigation, narrow layout, and dark rendering remain usable.
  await t.open('/ko/screen-resolution');
  await t.waitForText('이 브라우저는 시각 뷰포트 API를 제공하지 않아 시각 뷰포트 크기와 배율을 확인할 수 없습니다.');
  await t.page.getByRole('button', { name: '새로 고침', exact: true }).focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    (await t.page.evaluate(() => document.activeElement?.textContent?.trim())).includes('보고서와 CSS 쿼리 복사'),
    'keyboard focus did not reach the copy action',
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

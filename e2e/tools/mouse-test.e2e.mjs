/** Exercise real mouse input, the bounded guided screen, resets, and browser fallbacks. */

export default async function (t) {
  const context = t.page.context();
  const statText = async (label, index = 0) =>
    t.page.getByText(label, { exact: true }).nth(index).locator('..').innerText();

  // Mouse input needs no protected permission. Clearing the harness grants proves that the
  // complete test does not accidentally depend on its microphone/camera setup.
  await context.clearPermissions();
  await t.open('/mouse-test');
  t.assert(
    await t.page.evaluate(
      () =>
        typeof PointerEvent === 'function' &&
        'pointerType' in PointerEvent.prototype &&
        typeof Element.prototype.setPointerCapture === 'function' &&
        'onwheel' in document.createElement('div'),
    ),
    'current Chromium did not expose the Pointer Events and wheel features used by the tool',
  );

  const diagnostic = t.page.getByRole('region', { name: 'Button and wheel check', exact: true });
  const diagnosticBox = await diagnostic.boundingBox();
  t.assert(diagnosticBox, 'button and wheel test area was not rendered');
  const point = { x: diagnosticBox.x + diagnosticBox.width / 2, y: diagnosticBox.y + diagnosticBox.height / 2 };

  await t.page.mouse.move(point.x, point.y);
  await t.page.mouse.down({ button: 'left' });
  t.assert((await statText('Left button')).startsWith('1\n'), 'left press was not counted on pointerdown');
  t.assert(
    await t.page.getByText('Left button', { exact: true }).locator('..').locator('.text-3xl').isVisible(),
    'held left button was not visibly emphasized',
  );
  await t.page.evaluate(() => window.dispatchEvent(new Event('blur')));
  t.assert(
    !(await t.page.getByText('Left button', { exact: true }).locator('..').locator('.text-3xl').isVisible()),
    'held emphasis stayed stuck after the browser window lost focus',
  );
  await t.page.mouse.up({ button: 'left' });
  await t.page.mouse.click(point.x, point.y, { button: 'middle' });
  await t.page.mouse.click(point.x, point.y, { button: 'right' });
  await t.page.mouse.wheel(0, -120);
  await t.page.mouse.wheel(0, 120);
  t.assert((await statText('Middle button')).startsWith('1\n'), 'middle press was not counted');
  t.assert((await statText('Right button')).startsWith('1\n'), 'right press was not counted');
  t.assert((await statText('Wheel up')).startsWith('1\n'), 'upward wheel input was not counted');
  t.assert((await statText('Wheel down')).startsWith('1\n'), 'downward wheel input was not counted');

  // A normal diagnostic session can exceed the old 100-event buffer. Totals must remain honest
  // while the implementation keeps only bounded summary state.
  await t.click('Reset check');
  for (let press = 0; press < 105; press += 1) await t.page.mouse.click(point.x, point.y);
  t.assert(
    (await statText('Left button')).startsWith('105\n'),
    `the lifetime press count was capped or lost: ${await statText('Left button')}`,
  );
  await t.click('Reset check');
  t.assert((await statText('Left button')).startsWith('0\n'), 'reset did not clear the button total');
  t.assert((await statText('Wheel up')).startsWith('0\n'), 'reset did not clear the wheel total');
  await t.page.getByRole('button', { name: 'Reset check', exact: true }).focus();
  await t.page.keyboard.press('Tab');
  t.assert(
    await diagnostic.evaluate((element) => element === document.activeElement),
    'the diagnostic test area was not keyboard focusable',
  );

  // Run the guided end-to-end flow with actual browser mouse input. The short test delays stay
  // above the documented 80 ms screening boundary while avoiding a 20-second test fixture.
  const guided = t.page.getByRole('region', { name: 'Guided double-click screen', exact: true });
  for (let press = 0; press < 20; press += 1) {
    await guided.click();
    if (press < 19) await t.page.waitForTimeout(90);
  }
  await t.waitForText('No sub-80 ms repeats appeared in this 20-press browser sample.');
  t.assert((await statText('Sample presses')).startsWith('20 / 20\n'), 'guided sample did not complete at 20');
  t.assert((await statText('Screened repeats', 1)).startsWith('0\n'), 'clean sample reported a repeat');
  await guided.click();
  t.assert((await statText('Sample presses')).startsWith('20 / 20\n'), 'complete sample accepted extra presses');

  await t.click('Restart sample');
  await guided.evaluate((element) => {
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 }));
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 }));
  });
  await t.waitForText('A sub-80 ms repeat appeared.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'candidate repeat was not exposed as an alert');

  // Selecting another standard button resets the sample and actual right-button presses work
  // without opening the browser context menu over the test target.
  await t.page.getByRole('radio', { name: 'Right button', exact: true }).click();
  t.assert((await statText('Sample presses')).startsWith('0 / 20\n'), 'button switch did not reset the sample');
  await guided.click({ button: 'right' });
  t.assert((await statText('Sample presses')).startsWith('1 / 20\n'), 'guided right press was not counted');

  // Current Chrome, Safari, and Firefox expose Pointer Events. A browser that does not expose
  // that standard must be detected before presenting test surfaces that silently ignore input.
  await t.page.addInitScript(() => {
    Object.defineProperty(window, 'PointerEvent', { configurable: true, value: undefined });
  });
  await t.open('/mouse-test');
  await t.waitForText('This browser does not expose Pointer Events, so it cannot run the mouse test.');
  t.assert(await t.page.getByRole('alert').isVisible(), 'missing Pointer Events was not exposed as an alert');
  t.assert(
    (await t.page
      .getByRole('region', { name: 'Button and wheel check', exact: true })
      .getAttribute('aria-disabled')) === 'true',
    'unsupported diagnostic area remained enabled',
  );

  await t.open('/ko/mouse-test');
  await t.waitForText('이 브라우저는 포인터 이벤트를 제공하지 않아 마우스 테스트를 실행할 수 없습니다.');

  // Localized failure copy and the controls remain usable at the supported phone width in dark
  // mode, with no page-level horizontal overflow.
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

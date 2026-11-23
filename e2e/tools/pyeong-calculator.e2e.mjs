/**
 * Pyeong calculator: what a Korean renter actually does — type 59.9㎡ from a listing, paste
 * "84㎡", compare a listing's 84㎡ exclusive with its 112㎡ supply, read the ratio.
 *
 * Covers the defects this audit fixed:
 *  - typing a decimal scrambled the digits ("84.5" left 584, "59.9" left 959), because the
 *    controlled number field re-rendered "84.5" as "84" mid-typing and the caret moved;
 *  - a value pasted with its unit ("84㎡", "34평") was rejected and emptied the field.
 */

const SQM_PER_PYEONG = 400 / 121;

/** The value in the stat whose label is `label`. */
async function stat(page, label) {
  return page.evaluate((wanted) => {
    // The Stat primitive: a bg-surface-2 box holding a tabular value over its label.
    for (const element of document.querySelectorAll('main div[class*="bg-surface-2"]')) {
      if (element.children.length !== 2) continue;
      const [value, name] = [element.children[0], element.children[1]];
      if (!value.className.includes('tabular')) continue;
      if (name.textContent?.trim() !== wanted) continue;
      return value.textContent?.trim() ?? null;
    }
    return null;
  }, label);
}

/** A number as the page prints it: grouped, at most two decimals. */
const shown = (value) => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(value);

async function alerts(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main [role=alert]')].map((element) => element.textContent?.trim() ?? ''),
  );
}

export default async function (t) {
  const page = t.page;
  await t.open('/ko/pyeong-calculator');
  await page.waitForTimeout(400);

  const area = page.getByLabel(/환산할 면적/);
  const exclusive = page.getByLabel(/전용면적 \(㎡\)/);
  const supply = page.getByLabel(/공급면적 \(㎡\)/);
  const sqmUnit = page.getByRole('radio', { name: '제곱미터 (㎡)', exact: true });
  const pyeongUnit = page.getByRole('radio', { name: '평', exact: true });

  // ── 1. The default 84㎡ converts both ways with the exact 400/121 factor.
  t.assert((await area.inputValue()) === '84', `the page does not open on 84㎡: ${await area.inputValue()}`);
  t.assert((await stat(page, '제곱미터')) === '84㎡', `84㎡ in square metres: ${await stat(page, '제곱미터')}`);
  t.assert((await stat(page, '평')) === '25.41평', `84㎡ in pyeong: ${await stat(page, '평')}`);
  const panelText = await page.locator('main').innerText();
  t.assert(
    panelText.includes('84㎡ × 121 ÷ 400 = 25.41평'),
    'the exact formula line does not show the conversion it made',
  );

  // ── 2. Typing a decimal keeps every digit, in the field and in the result.
  await area.click();
  await area.press('Control+a');
  await page.keyboard.type('59.9', { delay: 90 });
  await page.waitForTimeout(250);
  t.assert((await area.inputValue()) === '59.9', `typing 59.9 left "${await area.inputValue()}" in the field`);
  t.assert(
    (await stat(page, '평')) === `${shown((59.9 * 121) / 400)}평`,
    `59.9㎡ in pyeong: expected ${shown((59.9 * 121) / 400)}, got ${await stat(page, '평')}`,
  );

  await area.click();
  await area.press('Control+a');
  await page.keyboard.type('84.5', { delay: 90 });
  await page.waitForTimeout(250);
  t.assert((await area.inputValue()) === '84.5', `typing 84.5 left "${await area.inputValue()}" in the field`);
  t.assert(
    (await stat(page, '평')) === `${shown((84.5 * 121) / 400)}평`,
    `84.5㎡ in pyeong: ${await stat(page, '평')}`,
  );

  // Backspacing through the decimal point still parses, and does not leave a broken state.
  await area.press('Backspace');
  await page.waitForTimeout(200);
  t.assert((await area.inputValue()) === '84.', `backspacing past the decimal left "${await area.inputValue()}"`);
  t.assert(
    (await stat(page, '제곱미터')) === '84㎡',
    `"84." should still read as 84㎡: ${await stat(page, '제곱미터')}`,
  );

  // ── 3. A value pasted with its unit is read in that unit, not rejected.
  await area.fill('84㎡');
  await page.waitForTimeout(250);
  t.assert(
    (await sqmUnit.getAttribute('aria-checked')) === 'true',
    'pasting "84㎡" did not keep the square-metre unit selected',
  );
  t.assert((await stat(page, '평')) === '25.41평', `"84㎡" pasted: ${await stat(page, '평')}`);
  t.assert((await alerts(page)).length === 0, `"84㎡" raised ${(await alerts(page)).join(' | ')}`);

  await area.fill('34평');
  await page.waitForTimeout(250);
  t.assert(
    (await pyeongUnit.getAttribute('aria-checked')) === 'true',
    'pasting "34평" did not switch the unit to pyeong',
  );
  t.assert(
    (await stat(page, '제곱미터')) === `${shown(34 * SQM_PER_PYEONG)}㎡`,
    `34평 in square metres: expected ${shown(34 * SQM_PER_PYEONG)}, got ${await stat(page, '제곱미터')}`,
  );
  t.assert((await stat(page, '평')) === '34평', `34평 in pyeong: ${await stat(page, '평')}`);

  // A grouped Korean number in the pyeong unit.
  await area.fill('1,000평');
  await page.waitForTimeout(250);
  t.assert(
    (await stat(page, '제곱미터')) === `${shown(1000 * SQM_PER_PYEONG)}㎡`,
    `1,000평 in square metres: ${await stat(page, '제곱미터')}`,
  );

  // ── 4. The unit buttons reinterpret the same number.
  await area.fill('30');
  await page.waitForTimeout(150);
  await sqmUnit.click();
  await page.waitForTimeout(250);
  t.assert((await stat(page, '제곱미터')) === '30㎡', `30 switched to ㎡: ${await stat(page, '제곱미터')}`);
  await pyeongUnit.click();
  await page.waitForTimeout(250);
  t.assert(
    (await stat(page, '제곱미터')) === `${shown(30 * SQM_PER_PYEONG)}㎡`,
    `30평 in square metres: expected ${shown(30 * SQM_PER_PYEONG)}, got ${await stat(page, '제곱미터')}`,
  );

  // ── 5. Exclusive and supply area compare on the numbers a listing prints.
  await exclusive.fill('84');
  await supply.fill('112');
  await page.waitForTimeout(250);
  t.assert((await stat(page, '전용면적 (평)')) === '25.41평', `exclusive pyeong: ${await stat(page, '전용면적 (평)')}`);
  t.assert((await stat(page, '공급면적 (평)')) === '33.88평', `supply pyeong: ${await stat(page, '공급면적 (평)')}`);
  t.assert((await stat(page, '전용률')) === '75%', `exclusive ratio: ${await stat(page, '전용률')}`);
  t.assert((await stat(page, '주거공용면적')) === '28㎡', `shared area: ${await stat(page, '주거공용면적')}`);

  // Decimals in the comparison fields too (112.4㎡ is a real supply figure).
  await supply.fill('112.4');
  await page.waitForTimeout(250);
  t.assert(
    (await stat(page, '공급면적 (평)')) === `${shown((112.4 * 121) / 400)}평`,
    `112.4㎡ supply in pyeong: ${await stat(page, '공급면적 (평)')}`,
  );
  t.assert(
    (await stat(page, '전용률')) === `${shown((84 / 112.4) * 100)}%`,
    `exclusive ratio for 84/112.4: ${await stat(page, '전용률')}`,
  );

  // A pyeong figure pasted into a square-metre comparison field is converted, not refused.
  await supply.fill('34평');
  await page.waitForTimeout(250);
  t.assert(
    (await stat(page, '공급면적 (평)')) === '34평',
    `34평 pasted as supply area: ${await stat(page, '공급면적 (평)')}`,
  );
  t.assert((await alerts(page)).length === 0, `34평 in the supply field raised ${(await alerts(page)).join(' | ')}`);

  // ── 6. Bad input names the field it is about.
  await supply.fill('80');
  await page.waitForTimeout(250);
  t.assert(
    (await alerts(page)).some((text) => /공급면적은 전용면적보다 크거나 같아야/.test(text)),
    `supply below exclusive shows no explanation: ${(await alerts(page)).join(' | ')}`,
  );
  await supply.fill('전용');
  await page.waitForTimeout(250);
  t.assert(
    (await alerts(page)).some((text) => /두 면적을 숫자로 입력하세요/.test(text)),
    `unreadable supply area shows the ordering message instead of an input message: ${(await alerts(page)).join(' | ')}`,
  );
  await supply.fill('112');
  await page.waitForTimeout(200);

  await area.fill('');
  await page.waitForTimeout(250);
  t.assert((await alerts(page)).length >= 1, 'an empty area field shows no explanation');
  await area.fill('-5');
  await page.waitForTimeout(250);
  t.assert((await alerts(page)).length >= 1, 'a negative area shows no explanation');
  await area.fill('전용 84');
  await page.waitForTimeout(250);
  t.assert((await alerts(page)).length >= 1, 'prose in the area field shows no explanation');

  // ── 7. Copy carries both figures and the ratio.
  await area.fill('84');
  await supply.fill('112');
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: '결과 복사', exact: true }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(clipboard.includes('25.41'), `copied text has no pyeong figure: ${clipboard}`);
  t.assert(clipboard.includes('33.88'), `copied text has no supply figure: ${clipboard}`);
  t.assert(clipboard.includes('75'), `copied text has no exclusive ratio: ${clipboard}`);

  // ── 8. The basis buttons change what the result claims to describe.
  await page.getByRole('radio', { name: '공급면적', exact: true }).click();
  await page.waitForTimeout(250);
  t.assert((await stat(page, '적용한 기준')) === '공급면적', `basis stat: ${await stat(page, '적용한 기준')}`);
  t.assert(
    (await page.getByText(/공급면적을 환산한 결과입니다/).count()) === 1,
    'the supply-area notice did not replace the exclusive-area notice',
  );
  await page.getByRole('radio', { name: '전용면적', exact: true }).click();
  await page.waitForTimeout(200);

  // ── 9. A reload keeps what was typed, including the unit.
  await sqmUnit.click();
  await area.fill('59.9');
  await exclusive.fill('59');
  await supply.fill('74');
  await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForTimeout(400);
  t.assert((await area.inputValue()) === '59.9', `reload lost the area: ${await area.inputValue()}`);
  t.assert((await exclusive.inputValue()) === '59', `reload lost the exclusive area: ${await exclusive.inputValue()}`);
  t.assert((await stat(page, '평')) === '18.12평', `after reload 59.9㎡ is ${await stat(page, '평')}`);

  // ── 10. Reset returns to the default 84㎡ comparison.
  await page.getByRole('button', { name: '초기화', exact: true }).click();
  await page.waitForTimeout(300);
  t.assert((await area.inputValue()) === '84', `reset left ${await area.inputValue()} in the area field`);
  t.assert((await stat(page, '전용률')) === '75%', `reset ratio: ${await stat(page, '전용률')}`);

  // ── 11. The landing pages open on their own area, in the right unit.
  await t.open('/ko/pyeong-calculator/84-square-meters');
  await page.waitForTimeout(400);
  t.assert((await area.inputValue()) === '84', `84㎡ landing page opens on "${await area.inputValue()}"`);
  t.assert((await sqmUnit.getAttribute('aria-checked')) === 'true', '84㎡ landing page is not in square metres');
  t.assert((await stat(page, '평')) === '25.41평', `84㎡ landing page pyeong: ${await stat(page, '평')}`);

  await t.open('/ko/pyeong-calculator/30-pyeong');
  await page.waitForTimeout(400);
  t.assert((await pyeongUnit.getAttribute('aria-checked')) === 'true', '30평 landing page is not in pyeong');
  t.assert(
    (await stat(page, '제곱미터')) === '99.17㎡',
    `30평 landing page square metres: ${await stat(page, '제곱미터')}`,
  );

  // ── 12. The English page converts the same way.
  await t.open('/pyeong-calculator/84-square-meters');
  await page.waitForTimeout(400);
  t.assert((await stat(page, 'Pyeong')) === '25.41평', `English page pyeong: ${await stat(page, 'Pyeong')}`);

  // ── 13. 375px: nothing scrolls sideways and the inputs stay usable.
  await page.setViewportSize({ width: 375, height: 812 });
  await t.open('/ko/pyeong-calculator');
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t.assert(wide <= 1, `the page scrolls sideways by ${wide}px at 375px`);
  const areaBox = await area.boundingBox();
  t.assert(areaBox && areaBox.width > 100, 'the area field is not visible at 375px');
}

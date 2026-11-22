/**
 * Signature generator: a typed name and a hand-drawn stroke both become a tightly cropped
 * transparent PNG. Covers what this audit fixed and must not come back:
 *  - the downloaded ink followed the visitor's screen theme (dark mode exported a near-white
 *    signature) instead of the black or blue the page offers;
 *  - a long Korean name was drawn past both canvas edges, so the PNG lost its first and last
 *    characters;
 *  - Cmd/Ctrl+D, the browser's own bookmark shortcut, also started a download.
 */

import { readFileSync } from 'node:fs';

const INK = { black: [24, 24, 27], blue: [47, 91, 234] };

async function tap(locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await locator.click();
}

/** Decode a downloaded PNG in the page and describe its size, ink colour and transparency. */
async function describePng(page, bytes) {
  return page.evaluate(async (base64) => {
    const data = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([data], { type: 'image/png' }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    let transparent = 0;
    let ink = null;
    let inkPixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] === 0) {
        transparent += 1;
        continue;
      }
      inkPixels += 1;
      if (pixels[index + 3] > 200) ink = [pixels[index], pixels[index + 1], pixels[index + 2]];
    }
    return {
      width: bitmap.width,
      height: bitmap.height,
      ink,
      inkPixels,
      transparentRatio: transparent / (bitmap.width * bitmap.height),
    };
  }, bytes.toString('base64'));
}

/** Visible ink bounds inside the working canvas, to prove nothing is clipped at an edge. */
async function canvasInkBounds(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let left = canvas.width;
    let right = -1;
    let top = canvas.height;
    let bottom = -1;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (pixels[(y * canvas.width + x) * 4 + 3] === 0) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    return { left, right, top, bottom, width: canvas.width, height: canvas.height };
  });
}

function closeTo(t, actual, expected, message) {
  t.assert(
    Array.isArray(actual) && actual.every((value, index) => Math.abs(value - expected[index]) <= 3),
    `${message}: expected rgb(${expected.join(', ')}), exported rgb(${actual?.join(', ')})`,
  );
}

export default async function (t) {
  const page = t.page;
  await t.open('/signature-generator');
  await page.evaluate(() => localStorage.removeItem('tools:signature-generator:settings'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  t.assert(!t.errors.page.length, `the signature tool failed to hydrate: ${t.errors.page[0]}`);

  const name = page.getByLabel(/Name or initials/);
  const canvas = page.locator('canvas');
  const download = page.getByRole('button', { name: 'Download transparent PNG', exact: true });
  const save = async () => {
    const [file] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), tap(download)]);
    return { name: file.suggestedFilename(), bytes: readFileSync(await file.path()) };
  };

  // --- The default typed name is ready to download, cropped with the documented 36 px margin.
  t.assert(
    (await name.inputValue()) === 'Alex Morgan',
    `the field did not open on the sample name (${await name.inputValue()})`,
  );
  const first = await save();
  t.assert(first.name === 'signature.png', `the file was named ${first.name}`);
  const bluePng = await describePng(page, first.bytes);
  t.assert(bluePng.inkPixels > 500, 'the exported PNG has almost no ink');
  t.assert(bluePng.width < 1_200 && bluePng.height < 400, 'the PNG was not cropped to the ink');
  t.assert(bluePng.transparentRatio > 0.5, 'the PNG is not mostly transparent');
  closeTo(t, bluePng.ink, INK.blue, 'the default blue ink');

  // --- Black ink is black, even when the visitor's system is in dark mode.
  await page.getByRole('radio', { name: 'Black', exact: true }).click();
  const lightBlack = await describePng(page, (await save()).bytes);
  closeTo(t, lightBlack.ink, INK.black, 'black ink in light mode');
  await page.emulateMedia({ colorScheme: 'dark' });
  const darkBlack = await describePng(page, (await save()).bytes);
  closeTo(t, darkBlack.ink, INK.black, 'black ink in dark mode');
  await page.getByRole('radio', { name: 'Blue', exact: true }).click();
  const darkBlue = await describePng(page, (await save()).bytes);
  closeTo(t, darkBlue.ink, INK.blue, 'blue ink in dark mode');
  await page.emulateMedia({ colorScheme: 'light' });

  // --- A long Korean name stays inside the canvas: nothing may be clipped at either edge.
  const longName = '김'.repeat(80);
  await name.fill(longName);
  t.assert(
    Array.from(await name.inputValue()).length === 80,
    `the 80-character Korean name was cut to ${Array.from(await name.inputValue()).length}`,
  );
  const longBounds = await canvasInkBounds(page);
  t.assert(longBounds.left > 0 && longBounds.right < longBounds.width - 1, 'the long name is clipped at a canvas edge');
  t.assert(
    longBounds.top > 0 && longBounds.bottom < longBounds.height - 1,
    'the long name runs off the canvas vertically',
  );
  const longPng = await describePng(page, (await save()).bytes);
  t.assert(longPng.width < longBounds.width, 'the exported long name filled the whole canvas, so it was clipped');

  // --- The limit is 80 characters, counted the way people count emoji.
  await name.fill('😀'.repeat(100));
  t.assert(
    Array.from(await name.inputValue()).length === 80,
    `100 pasted emoji became ${Array.from(await name.inputValue()).length} characters instead of 80`,
  );
  // A pasted paragraph is cut to the same limit without hanging the page.
  await name.fill('서명 '.repeat(20_000));
  t.assert(Array.from(await name.inputValue()).length === 80, 'a huge paste was not cut to 80 characters');

  // --- A blank name cannot be downloaded, and the page says why.
  await name.fill('');
  t.assert(await download.isDisabled(), 'a blank signature could still be downloaded');
  await t.waitForText('Add a name or draw a signature to download it.');

  // --- Drawing: a stroke is captured, undo removes exactly one, clear removes all.
  await page.getByRole('radio', { name: 'Draw by hand', exact: true }).click();
  t.assert(await download.isDisabled(), 'the empty drawing area was downloadable');
  await t.waitForText('Draw your signature here');

  const box = await canvas.boundingBox();
  const strokeAt = async (offset) => {
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * (0.4 + offset));
    await page.mouse.down();
    for (let step = 1; step <= 12; step += 1) {
      await page.mouse.move(box.x + box.width * (0.2 + step * 0.05), box.y + box.height * (0.4 + offset + step * 0.01));
    }
    await page.mouse.up();
    await page.waitForTimeout(120);
  };
  const strokes = page.getByRole('button', { name: 'Undo stroke', exact: true });
  await strokeAt(0);
  t.assert(!(await download.isDisabled()), 'a drawn stroke did not make the signature downloadable');
  const oneStroke = await canvasInkBounds(page);
  t.assert(oneStroke.right > oneStroke.left, 'the drawn stroke left no ink on the canvas');

  await strokeAt(0.1);
  const twoStrokes = await canvasInkBounds(page);
  t.assert(twoStrokes.bottom > oneStroke.bottom, 'the second stroke was not drawn');
  await tap(strokes);
  await page.waitForTimeout(150);
  const afterUndo = await canvasInkBounds(page);
  t.assert(afterUndo.bottom < twoStrokes.bottom, 'undo did not remove the last stroke');
  const drawn = await describePng(page, (await save()).bytes);
  t.assert(drawn.inkPixels > 100, 'the drawn signature exported no ink');
  closeTo(t, drawn.ink, INK.blue, 'drawn ink colour');
  await page.getByRole('radio', { name: 'Bold', exact: true }).click();
  await strokeAt(0.2);
  const bold = await describePng(page, (await save()).bytes);
  t.assert(bold.inkPixels > drawn.inkPixels / 2, 'a bold pen drew almost nothing');

  await tap(page.getByRole('button', { name: 'Clear', exact: true }));
  await page.waitForTimeout(150);
  t.assert(await download.isDisabled(), 'clear left a downloadable signature');
  t.assert((await canvasInkBounds(page)).right === -1, 'clear left ink on the canvas');

  // --- The keyboard shortcut downloads with D, but not with the browser's Cmd/Ctrl+D.
  await page.getByRole('radio', { name: 'Type name', exact: true }).click();
  await name.fill('Alex Morgan');
  await page.locator('h1').click();
  const pressAndWatch = async (key) => {
    const downloadStarted = page
      .waitForEvent('download', { timeout: 1_500 })
      .then(() => true)
      .catch(() => false);
    await page.keyboard.press(key);
    return downloadStarted;
  };
  t.assert(await pressAndWatch('d'), 'pressing D started no download');
  t.assert(!(await pressAndWatch('Control+d')), 'Ctrl+D also triggered a download');

  // --- The typed signature survives a reload.
  await name.fill('홍길동');
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('tools:signature-generator:settings') ?? '{}').text === '홍길동',
  );
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 });
  await page.waitForFunction(() => document.querySelector('main input[type="text"]')?.value === '홍길동');

  // --- 375 px in dark mode: no sideways scroll, and the ink is still the ink.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px viewport has horizontal overflow',
  );
  const korean = await describePng(page, (await save()).bytes);
  closeTo(t, korean.ink, INK.blue, 'the Korean name at 375 px in dark mode');
}

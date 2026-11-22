/**
 * Text compare: the diff must be exact for ordinary edits in every mode, must survive a real
 * multi-page paste, and must degrade visibly (never freeze) when two long texts share almost
 * nothing. Expected counts are computed here independently with a plain LCS table.
 */

const WORD_SEG = new Intl.Segmenter('ko', { granularity: 'word' });
const CHAR_SEG = new Intl.Segmenter('ko', { granularity: 'grapheme' });

/** Independent reference implementation: longest common subsequence length of two token lists. */
function lcsLength(a, b) {
  const row = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let previousDiagonal = 0;
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j];
      row[j] = a[i - 1] === b[j - 1] ? previousDiagonal + 1 : Math.max(row[j], row[j - 1]);
      previousDiagonal = saved;
    }
  }
  return row[b.length];
}

function tokens(text, mode) {
  const normalized = text.normalize('NFC');
  if (mode === 'line') return normalized.split(/(?<=\r\n|\r|\n)/);
  const segmenter = mode === 'word' ? WORD_SEG : CHAR_SEG;
  return [...segmenter.segment(normalized)].map((entry) => entry.segment);
}

/** The figures the page must show, worked out from the token lists alone. */
function expected(a, b, mode) {
  const ta = tokens(a, mode);
  const tb = tokens(b, mode);
  const common = lcsLength(ta, tb);
  return {
    added: tb.length - common,
    removed: ta.length - common,
    similarity: Math.round(((2 * common) / (ta.length + tb.length)) * 100),
  };
}

/** Reads the +added / -removed / similarity stats from the page. */
async function stats(t) {
  const text = await t.page.locator('main').innerText();
  const added = text.match(/\+(\d+)/);
  const removed = text.match(/-(\d+)/);
  const similarity = text.match(/(\d+)%/);
  t.assert(added && removed && similarity, `result statistics are missing from the page: ${text.slice(0, 400)}`);
  return { added: Number(added[1]), removed: Number(removed[1]), similarity: Number(similarity[1]) };
}

export default async function (t) {
  const page = t.page;
  await page.goto(t.base + '/text-diff');
  await page.evaluate(() => localStorage.clear());
  await t.open('/text-diff');

  const original = page.getByLabel('Original text', { exact: true });
  const changed = page.getByLabel('Changed text', { exact: true });

  // A realistic Korean revision: one word replaced in a two-sentence note.
  const before = '오늘은 서울에 비가 내렸다. 우산을 챙겨서 나갔다.';
  const after = '오늘은 서울에 눈이 내렸다. 우산을 챙겨서 나갔다.';
  await original.fill(before);
  await changed.fill(after);
  await t.waitForText(/\+\d+\s*Added\s*-\d+\s*Removed/);

  // Every mode must agree with an independently computed LCS diff.
  for (const [label, mode] of [
    ['Line', 'line'],
    ['Word', 'word'],
    ['Character', 'char'],
  ]) {
    await page.getByRole('radio', { name: label, exact: true }).click();
    const want = expected(before, after, mode);
    let got = await stats(t);
    for (let waited = 0; waited < 4_000; waited += 100) {
      if (got.added === want.added && got.removed === want.removed && got.similarity === want.similarity) break;
      await page.waitForTimeout(100);
      got = await stats(t);
    }
    t.assert(
      got.added === want.added && got.removed === want.removed && got.similarity === want.similarity,
      `${mode} mode: page showed +${got.added}/-${got.removed}/${got.similarity}%, expected +${want.added}/-${want.removed}/${want.similarity}%`,
    );
  }

  // Character mode must mark exactly the two syllables that changed, not the surrounding word.
  const deleted = await page.locator('main span.bg-danger-soft').allInnerTexts();
  t.assert(
    deleted.join('') === '비가',
    `character mode highlighted ${JSON.stringify(deleted)} instead of the changed syllables`,
  );

  // Word mode highlights only the edited word.
  await page.getByRole('radio', { name: 'Word', exact: true }).click();
  await page.waitForTimeout(500);
  const wordDeleted = await page.locator('main span.bg-danger-soft').allInnerTexts();
  t.assert(wordDeleted.join('') === '비가', `word mode highlighted ${JSON.stringify(wordDeleted)}`);

  // Swap must exchange the two boxes and reverse the direction of the diff.
  await t.click('Swap');
  t.assert((await original.inputValue()) === after, 'Swap did not move the changed text into the original box');
  t.assert((await changed.inputValue()) === before, 'Swap did not move the original text into the changed box');
  await page.waitForTimeout(500);
  const swappedDeleted = await page.locator('main span.bg-danger-soft').allInnerTexts();
  t.assert(swappedDeleted.join('') === '눈이', `after Swap the removed side showed ${JSON.stringify(swappedDeleted)}`);

  // Clear empties both boxes and returns to the hint.
  await t.click('Clear');
  t.assert((await original.inputValue()) === '' && (await changed.inputValue()) === '', 'Clear left text behind');
  t.assert(
    await page.getByText('Enter text in both boxes to see what changed.', { exact: true }).isVisible(),
    'the empty hint did not return',
  );

  // Same text, different Unicode normalization (macOS NFD) must read as identical.
  await page.getByRole('radio', { name: 'Character', exact: true }).click();
  const nfc = '한글 텍스트 비교';
  await original.fill(nfc);
  await changed.fill(nfc.normalize('NFD'));
  await t.waitForText('These texts are identical.');
  t.assert((await stats(t)).similarity === 100, 'NFD-normalized Korean was not reported as a 100% match');

  // Korean page: the same flow, localized, and identical text reported in Korean.
  await t.open('/ko/text-diff');
  await page.getByLabel('원본 텍스트', { exact: true }).fill('가나다라 마바사');
  await page.getByLabel('수정된 텍스트', { exact: true }).fill('가나다라 마바사');
  await t.waitForText('두 텍스트가 완전히 같습니다.');
  await page.getByLabel('수정된 텍스트', { exact: true }).fill('가나다라 마바아');
  await page.getByRole('radio', { name: '글자', exact: true }).click();
  const koreanWant = expected('가나다라 마바사', '가나다라 마바아', 'char');
  let korean = await stats(t);
  for (let waited = 0; waited < 4_000; waited += 100) {
    if (korean.added === koreanWant.added && korean.removed === koreanWant.removed) break;
    await page.waitForTimeout(100);
    korean = await stats(t);
  }
  t.assert(
    korean.added === koreanWant.added && korean.removed === koreanWant.removed,
    `Korean page showed +${korean.added}/-${korean.removed}, expected +${koreanWant.added}/-${koreanWant.removed}`,
  );

  // Two long texts sharing almost nothing: must finish quickly, say it fell back, and keep text intact.
  const longA = Array.from({ length: 300 }, (_, i) => `원본 ${i}번째 줄: 서울의 봄 날씨와 시장 풍경을 적어 둔다.`).join(
    '\n',
  );
  const longB = Array.from(
    { length: 300 },
    (_, i) => `Other ${i}: a completely different line about shipping logs.`,
  ).join('\n');
  await t.open('/text-diff');
  await page.getByRole('radio', { name: 'Character', exact: true }).click();
  await page.getByLabel('Original text', { exact: true }).fill(longA);
  await page.getByLabel('Changed text', { exact: true }).fill(longB);
  const fallbackNotice = page.getByText(/too different for a Character comparison/);
  await fallbackNotice.waitFor({ timeout: 20_000 });
  await t.waitForText(/\+\d+/);
  t.assert(
    (await page.locator('main span.bg-danger-soft').allInnerTexts()).join('').includes('원본 0'),
    'the line-level fallback did not show the original lines',
  );
  const shown = await page.locator('main').innerText();
  t.assert(shown.includes('shown line by line'), 'the fallback did not explain the coarser granularity');

  // Results must not be computed synchronously per keystroke: typing stays responsive on a long paste.
  const keystrokeStart = Date.now();
  await page.getByLabel('Changed text', { exact: true }).press('End');
  await page.getByLabel('Changed text', { exact: true }).type('x', { delay: 0 });
  await page.waitForTimeout(400);
  t.assert(Date.now() - keystrokeStart < 5_000, 'a keystroke on a long document took more than five seconds');

  // Browser storage refusal must be told, not silently swallowed.
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('QuotaExceededError');
    };
  });
  await t.open('/text-diff');
  await page.getByLabel('Original text', { exact: true }).fill('저장할 수 없는 짧은 텍스트');
  await page.getByText(/will not survive a refresh/).waitFor({ timeout: 5_000 });

  // 375 px, dark mode, Korean: no horizontal overflow.
  await t.open('/ko/text-diff');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px dark-mode page has horizontal overflow',
  );
}

/** Landing pages apply their own limit and counting rule, then calculate the advertised totals. */
export default async function (t) {
  await t.page.addInitScript(() => {
    localStorage.setItem('tools:word-counter:limit', '77');
    localStorage.setItem('tools:word-counter:limit-metric', 'charactersNoSpaces');
  });

  await t.open('/ko/word-counter/jasoseo-1000-characters');
  await t.waitForText('1,000 남음');
  t.assert(
    (await t.page.getByRole('combobox', { name: '계산 기준' }).inputValue()) === 'characters',
    'cover-letter preset did not override the saved metric',
  );
  const input = t.page.getByLabel('입력할 글');
  await input.fill('가'.repeat(1001));
  await t.waitForText('1 초과');
  await t.waitForText('1,000 중 1,001 사용');

  await t.open('/ko/word-counter/sms-80-bytes');
  await t.waitForText('80바이트에 한글 40자');
  await t.page.getByLabel('입력할 글').fill('가'.repeat(41));
  await t.waitForText('80 중 82 사용');
  await t.waitForText('2 초과');
  t.assert(
    (await t.page.getByRole('combobox', { name: '계산 기준' }).inputValue()) === 'bytesLegacy',
    'Korean SMS page did not select the byte rule',
  );

  await t.open('/ko/word-counter/x-post-280');
  await t.page.getByLabel('입력할 글').fill(`${'가'.repeat(140)}a`);
  await t.waitForText('280 중 281 사용');
  await t.waitForText('1 초과');
  await t.waitForText('웹 주소 23점');
  t.assert(
    (await t.page.getByRole('link', { name: 'X twitter-text v3' }).getAttribute('href'))?.includes(
      'twitter/twitter-text',
    ),
    'X rule did not expose its official source',
  );

  await t.open('/ko/word-counter/youtube-description-5000-bytes');
  await t.page.getByLabel('입력할 글').fill('가'.repeat(1667));
  await t.waitForText('5,000 중 5,001 사용');
  await t.waitForText('1 초과');

  await t.open('/word-counter/sms-160-characters');
  await t.waitForText('160 remaining');
  await t.waitForText('160 GSM-7 characters or 70 characters');

  /* ── The plain tool with the text a real searcher pastes ─────────────────────────────── */

  // Independent counts, computed here with the same published rules as the tool.
  const graphemes = (text) => [...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(text)].length;
  const legacyBytes = (text) => {
    let total = 0;
    for (const ch of text) total += ch === '\n' ? 2 : ch.codePointAt(0) < 0x80 ? 1 : 2;
    return total;
  };
  const ko = (n) => n.toLocaleString('ko-KR');
  /** Each number tile shows its value above its label. */
  const statValue = async (label) => {
    const lines = (await t.page.locator('div[aria-busy]').first().innerText())
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const index = lines.indexOf(label);
    return index > 0 ? lines[index - 1] : '';
  };
  const waitForStat = async (label, expected, timeoutMs = 20_000) => {
    const started = Date.now();
    let value = '—';
    while (Date.now() - started < timeoutMs) {
      value = await statValue(label);
      if (value === expected) return;
      await t.page.waitForTimeout(100);
    }
    t.fail(`${label}: expected "${expected}", showed "${value}"`);
  };

  await t.page.evaluate(() => localStorage.clear());
  await t.open('/ko/word-counter');

  const english = 'The quick brown fox jumps over the lazy dog. It barks twice, then naps.';
  await t.page.getByLabel('입력할 글').fill(english);
  await waitForStat('단어수', String(english.split(/\s+/).length));
  await waitForStat('문장', '2');
  await waitForStat('글자수 (공백 포함)', String([...english].length));

  // A Korean cover-letter paragraph: characters, no-space characters, both byte rules and lines.
  const korean = [
    '지원 동기는 두 가지입니다. 첫째, 고객의 목소리를 제품 개선으로 연결하는 일을 해 왔습니다.',
    '둘째, 데이터로 근거를 만들면서도 문장으로 설명하는 습관을 지켰습니다.',
    '',
    '입사 후에는 결제 실패율을 낮추는 일부터 시작하고 싶습니다.',
  ].join('\n');
  const noSpaces = [...korean].filter((ch) => !/\s/.test(ch)).length;
  await t.page.getByLabel('입력할 글').fill(korean);
  await waitForStat('글자수 (공백 포함)', ko(graphemes(korean)));
  await waitForStat('글자수 (공백 제외)', ko(noSpaces));
  await waitForStat('바이트 (2byte)', ko(legacyBytes(korean)));
  await waitForStat('바이트 (UTF-8)', ko(Buffer.byteLength(korean, 'utf8')));
  await waitForStat('문단', '3');

  // The limit compares whichever total the chosen rule names — every option must reach it.
  const metric = t.page.getByRole('combobox', { name: '계산 기준' });
  await metric.selectOption('characters');
  await t.page.getByLabel('글자수 제한').fill('1000');
  await t.waitForText(`${ko(graphemes(korean))} 사용`);
  const usedWith = async (value, expected) => {
    await metric.selectOption(value);
    await t.waitForText(`${ko(expected)} 사용`, 5_000);
  };
  await usedWith('charactersNoSpaces', noSpaces);
  await usedWith('bytesLegacy', legacyBytes(korean));
  await usedWith('bytesUtf8', Buffer.byteLength(korean, 'utf8'));
  await usedWith('characters', graphemes(korean));

  // A long paste (about 60,000 characters) is counted, not refused.
  const long = '가나다라마바사아자차카타파하 '.repeat(3500);
  await t.page.getByLabel('입력할 글').fill(long);
  await waitForStat('글자수 (공백 포함)', ko(graphemes(long)), 40_000);
  await waitForStat('바이트 (UTF-8)', ko(Buffer.byteLength(long, 'utf8')), 20_000);

  // A phone-sized dark layout must not scroll sideways.
  await t.page.setViewportSize({ width: 375, height: 812 });
  await t.page.emulateMedia({ colorScheme: 'dark' });
  t.assert(
    await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    '375 px word counter page has horizontal overflow',
  );

  /* ── Failures have to be visible: a blocked worker chunk and a full local store ───────── */

  await t.page.route('**/analysis.worker-*.js', (route) => route.abort());
  await t.open('/ko/word-counter');
  await t.page.getByLabel('입력할 글').fill(korean);
  await t.waitForText('이 화면에서 직접 셉니다', 15_000);
  await waitForStat('글자수 (공백 포함)', ko(graphemes(korean)));
  await waitForStat('바이트 (2byte)', ko(legacyBytes(korean)));
  await t.page.unroute('**/analysis.worker-*.js');

  await t.page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded');
    };
  });
  await t.open('/ko/word-counter');
  await t.page.getByLabel('입력할 글').fill('저장되지 않는 글');
  await t.waitForText('저장 안 됨', 5_000);
}

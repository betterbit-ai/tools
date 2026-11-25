/**
 * JWT decoder: what a developer does with it — paste a token from a config or a log, read the header
 * and claims, see whether it is still valid, and copy the decoded parts.
 *
 * Tokens are built here from known JSON so the expected claims come from the input, not from the
 * page. The clock is frozen so "expired" and "in 2 days" mean the same thing every run.
 */

const NOW = new Date('2026-11-25T09:00:00Z');

function base64url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function token(header, payload, signature = 'sig') {
  return `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}.${signature}`;
}

/** Independent relative-time wording: seconds under a minute, then minutes, hours, days. */
function relative(seconds, locale = 'en') {
  // Chromium's ICU and Node's can differ on the space character in a localized phrase; the page
  // text is read with whitespace collapsed, so the expectation is compared the same way.
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
    ['second', 1],
  ];
  const [unit, size] = units.find(([, size]) => Math.abs(seconds) >= size) ?? ['second', 1];
  const value = Math.round(seconds / size);
  return new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(value, unit).replace(/\s+/g, ' ');
}

export default async function (t) {
  const page = t.page;
  await page.clock.install({ time: NOW });
  await t.open('/jwt-decoder');
  await page.waitForSelector('main textarea', { timeout: 15_000 });

  const area = page.locator('main textarea');
  const panel = async () => (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  const put = async (value) => {
    await area.fill(value);
    await page.waitForTimeout(120);
  };

  // ── 1. The empty page asks for a token instead of claiming a result.
  t.assert(/JWT|token/i.test(await panel()), 'the page does not mention a token');

  // ── 2. The example decodes into header, claims, and a live validity status.
  await page.getByRole('button', { name: /Load example|예시/ }).click();
  await page.waitForTimeout(200);
  let text = await panel();
  t.assert(text.includes('HS256'), 'the example header algorithm is missing');
  t.assert(text.includes('JWT'), 'the example header type is missing');
  t.assert(text.includes('user-123'), 'the example subject is missing');
  t.assert(
    /Within the exp and nbf|exp와 nbf 사이/.test(text),
    `the example token is not shown as active: ${text.slice(0, 400)}`,
  );

  // ── 3. An expired token says expired, with a readable relative time (not "in 172,800 seconds").
  const expiredAt = Math.floor(NOW.getTime() / 1000) - 3 * 86_400;
  await put(token({ alg: 'HS256', typ: 'JWT' }, { sub: 'seven', exp: expiredAt, iat: expiredAt - 60 }));
  text = await panel();
  t.assert(
    /Expired according to exp|exp 기준으로 만료/.test(text),
    `an expired token is not called expired: ${text.slice(0, 400)}`,
  );
  t.assert(text.includes(String(expiredAt)), 'the exp claim value is not shown');
  t.assert(
    text.includes(relative(-3 * 86_400)),
    `the expired time is not written as a human interval (${relative(-3 * 86_400)}): ${text.slice(0, 500)}`,
  );
  t.assert(
    !/\d{4,}(,\d{3})* seconds/.test(text),
    'the relative time is still counted in hundreds of thousands of seconds',
  );

  // ── 4. A token that is not valid yet says so.
  const future = Math.floor(NOW.getTime() / 1000) + 3_600;
  await put(token({ alg: 'HS256' }, { sub: 'early', nbf: future, exp: future + 86_400 }));
  text = await panel();
  t.assert(
    /Not active yet|아직 사용할 수 없/.test(text),
    `an nbf in the future is not called out: ${text.slice(0, 400)}`,
  );
  t.assert(text.includes(relative(3_600)), `the nbf time is not human: ${text.slice(0, 500)}`);

  // ── 5. A token with no exp is honest about it.
  await put(token({ alg: 'none' }, { sub: 'forever' }));
  text = await panel();
  t.assert(
    /No valid exp claim|유효한 exp 클레임이 없/.test(text),
    `a token without exp is not described: ${text.slice(0, 400)}`,
  );

  // ── 6. Everyday pasted forms work: an Authorization header, and a token wrapped over lines.
  const live = token({ alg: 'HS256', typ: 'JWT', kid: 'k1' }, { sub: 'wrapped', role: 'editor', exp: future });
  await put(`Bearer ${live}`);
  t.assert((await panel()).includes('wrapped'), 'a "Bearer " prefix was not understood');
  const wrapped = `Bearer ${live.slice(0, 40)}\n  ${live.slice(40, 90)}\n${live.slice(90)}`;
  await put(wrapped);
  text = await panel();
  t.assert(text.includes('wrapped'), `a token pasted over three lines was rejected: ${text.slice(0, 400)}`);
  t.assert(text.includes('k1'), 'the wrapped token lost its header claims');

  // ── 7. Unusual tokens are named, not mis-decoded.
  for (const [value, pattern] of [
    ['abc.def.ghi', /base64|디코딩/i],
    ['a.b', /exactly three|세 부분/i],
    ['a.b.c.d.e', /JWE|암호화/],
    ['', /Paste a|붙여넣/],
  ]) {
    await put(value);
    const shown = await panel();
    t.assert(pattern.test(shown), `${JSON.stringify(value)} was not explained: ${shown.slice(0, 300)}`);
  }

  // ── 8. "/" jumps to the token field without a page error.
  await page.locator('h1').click();
  await page.keyboard.press('/');
  await page.waitForTimeout(150);
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  t.assert(focused === 'TEXTAREA', `"/" focused ${focused} instead of the token field`);

  // ── 9. Copy all yields the header, payload and signature a ticket needs.
  await put(live);
  await page.getByRole('button', { name: /Copy decoded data|디코딩 데이터 복사/ }).click();
  await page.waitForTimeout(150);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  t.assert(copied.includes('"kid": "k1"'), `the copied header is missing its claims: ${copied.slice(0, 200)}`);
  t.assert(copied.includes('"role": "editor"'), 'the copied payload is missing its claims');
  t.assert(copied.includes('sig'), 'the copied text is missing the signature');

  // ── 10. The Korean page reads Korean and keeps the same decoding.
  await t.open('/ko/jwt-decoder');
  await page.waitForSelector('main textarea', { timeout: 15_000 });
  const koExp = Math.floor(NOW.getTime() / 1000) + 2 * 86_400;
  await page.locator('main textarea').fill(token({ alg: 'RS256' }, { sub: '한글', exp: koExp }));
  await page.waitForTimeout(150);
  text = await panel();
  t.assert(text.includes('한글'), `the Korean page did not decode the payload: ${text.slice(0, 300)}`);
  t.assert(text.includes(String(koExp)), 'the Korean page did not show the exp claim');
  t.assert(
    !/\d{4,}(,\d{3})*초/.test(text),
    'the Korean relative time is still counted in hundreds of thousands of seconds',
  );
  t.assert(
    text.includes(relative(2 * 86_400, 'ko')),
    `the Korean relative time is not localized (expected ${JSON.stringify(relative(2 * 86_400, 'ko'))}): ${text.slice(-400)}`,
  );

  // ── 11. SEO: canonical, hreflang pair, one h1.
  const seo = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
    alternates: [...document.querySelectorAll('link[rel=alternate]')].map((node) => node.getAttribute('href')),
  }));
  t.assert(seo.h1 === 1, `h1 count: ${seo.h1}`);
  t.assert(seo.canonical === 'https://betterbit.org/ko/jwt-decoder', `canonical: ${seo.canonical}`);
  t.assert(
    seo.alternates.includes('https://betterbit.org/jwt-decoder'),
    `hreflang pair: ${JSON.stringify(seo.alternates)}`,
  );

  // ── 12. 375 px in dark mode: nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  t.assert(overflow <= 1, `the page scrolls sideways by ${overflow}px at 375px`);

  t.assert(t.errors.page.length === 0, `page errors: ${t.errors.page.join(' | ')}`);
}

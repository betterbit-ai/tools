/**
 * Read this browser's own user agent, then read strings a user would actually paste: a
 * KakaoTalk in-app request, a crawler, and nonsense. The copied report must match the page.
 */

const KAKAO =
  'Mozilla/5.0 (Linux; Android 13; SM-S918N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Mobile Safari/537.36 KAKAOTALK 10.4.5';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default async function (t) {
  const context = t.page.context();
  const mainText = () => t.page.locator('main').innerText();
  /** A value card is rendered as its value with the label underneath, so match that pair. */
  const expectCard = async (value, label, message) => {
    for (let i = 0; i < 40; i += 1) {
      if (new RegExp(`${escape(value)}\\s*\\n\\s*${escape(label)}`).test(await mainText())) return;
      await t.page.waitForTimeout(100);
    }
    t.fail(`${message} (looking for “${value}” above “${label}”)`);
  };

  await t.open('/user-agent');

  const live = await t.page.evaluate(() => navigator.userAgent);
  t.assert((await mainText()).includes(live), 'the page did not show the exact navigator.userAgent string');

  const major = live.match(/Chrome\/(\d+)/)?.[1];
  await expectCard(`Chrome ${major}`, 'Browser', 'browser card did not name Chromium Chrome');
  await expectCard('Blink', 'Engine', 'engine card did not report Blink for Chromium');
  await expectCard('desktop', 'Device', 'device card did not report a desktop');

  // Client Hints are available in Chromium; the table must show the brands row.
  t.assert((await mainText()).includes('Client Hints brands'), 'Client Hints section missing in a Chromium browser');

  // A pasted in-app string must be identified as KakaoTalk, not as plain Chrome.
  await t.page.getByRole('radio', { name: 'Check another string', exact: true }).click();
  const textarea = t.page.locator('#ua-input');
  await textarea.fill(KAKAO);
  await expectCard('KakaoTalk', 'In-app browser', 'KakaoTalk string was not identified');
  await expectCard('Android 13', 'Operating system', 'Android version was not read');
  await expectCard('SM-S918N', 'Model', 'device model was not read');
  await expectCard('mobile', 'Device', 'KakaoTalk string was not treated as a mobile device');

  // The same string copied into a support report must carry every key value.
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await t.click('Copy browser report');
  await t.waitForText('Copied');
  const report = await t.page.evaluate(() => navigator.clipboard.readText());
  t.assert(report.includes('In-app browser: KakaoTalk'), 'report lost the in-app browser');
  t.assert(report.includes('Model: SM-S918N'), 'report lost the device model');
  t.assert(report.includes(`User-Agent: ${KAKAO}`), 'report lost the raw string');

  // A crawler must not be presented as a browser.
  await textarea.fill(GOOGLEBOT);
  await expectCard('Googlebot', 'Crawler or tool', 'Googlebot was not flagged as a crawler');
  await expectCard('Unknown', 'Browser', 'Googlebot was presented as a browser');

  // Nonsense must be labelled unknown, with an explanation rather than a guess.
  await textarea.fill('SomethingCustom/1.0');
  await t.waitForText('Nothing in this string matches');
  await expectCard('unknown', 'Device', 'an unrecognised string produced a device type');

  // Korean page, mobile width and dark mode.
  await t.open('/ko/user-agent');
  await t.waitForText('이 브라우저가 보내는 유저 에이전트');
  t.assert((await mainText()).includes('렌더링 엔진'), 'Korean page is not translated');
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

import { describe, expect, it } from 'vitest';
import {
  clientReport,
  detectEngine,
  majorVersion,
  parseUserAgent,
  pickClientHintBrand,
  shortIdentity,
  type ReportLabels,
} from './logic';

const CHROME_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const EDGE_WINDOWS = `${CHROME_WINDOWS} Edg/131.0.0.0`;
const FIREFOX_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0';
const SAFARI_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const SAFARI_IPAD =
  'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const CHROME_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1';
const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
const SAMSUNG_TABLET =
  'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Safari/537.36';
const OPERA_WINDOWS = `${CHROME_WINDOWS} OPR/115.0.0.0`;
const WHALE_WINDOWS = `${CHROME_WINDOWS} Whale/3.27.254.15`;
const KAKAO_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; SM-S918N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Mobile Safari/537.36 KAKAOTALK 10.4.5';
const NAVER_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; SM-G991N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.193 Mobile Safari/537.36 NAVER(inapp; search; 1020; 12.4.1)';
const IPAD_DESKTOP_MODE = `${SAFARI_MAC} Mobile/15E148`;
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const CLAUDEBOT = 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)';
const CURL = 'curl/8.7.1';
const PYTHON = 'python-requests/2.32.3';

const LABELS: ReportLabels = {
  browser: 'Browser',
  version: 'Version',
  engine: 'Engine',
  os: 'Operating system',
  device: 'Device',
  model: 'Model',
  inApp: 'In-app browser',
  bot: 'Bot',
  none: 'Unknown',
  rawString: 'User-Agent',
  deviceDesktop: 'desktop',
  deviceMobile: 'mobile',
  deviceTablet: 'tablet',
  deviceTv: 'TV',
  deviceBot: 'bot / crawler',
  deviceTool: 'command-line client',
  deviceUnknown: 'unknown',
};

describe('parseUserAgent — browsers', () => {
  it('reads Chrome on Windows without being fooled by the Safari token', () => {
    const info = parseUserAgent(CHROME_WINDOWS);
    expect(info.browser).toBe('Chrome');
    expect(info.browserVersion).toBe('131.0.0.0');
    expect(info.engine).toBe('Blink');
    expect(info.os).toBe('Windows');
    expect(info.osVersion).toBe('10.0');
    expect(info.device).toBe('desktop');
    expect(info.kind).toBe('browser');
    expect(info.reduced).toBe(true);
  });

  it('names Edge before Chrome', () => {
    const info = parseUserAgent(EDGE_WINDOWS);
    expect(info.browser).toBe('Edge');
    expect(info.browserVersion).toBe('131.0.0.0');
    expect(info.engine).toBe('Blink');
  });

  it('names Opera and Whale before Chrome', () => {
    expect(parseUserAgent(OPERA_WINDOWS).browser).toBe('Opera');
    expect(parseUserAgent(WHALE_WINDOWS).browser).toBe('Whale');
  });

  it('reads Firefox and its Gecko engine', () => {
    const info = parseUserAgent(FIREFOX_WINDOWS);
    expect(info.browser).toBe('Firefox');
    expect(info.browserVersion).toBe('133.0');
    expect(info.engine).toBe('Gecko');
    expect(info.reduced).toBe(false);
  });

  it('reads Safari on macOS with the Version/ token, not the frozen OS build', () => {
    const info = parseUserAgent(SAFARI_MAC);
    expect(info.browser).toBe('Safari');
    expect(info.browserVersion).toBe('17.5');
    expect(info.engine).toBe('WebKit');
    expect(info.os).toBe('macOS');
    expect(info.osVersion).toBe('10.15.7');
    expect(info.device).toBe('desktop');
  });

  it('reports Safari on an iPhone as WebKit and mobile', () => {
    const info = parseUserAgent(SAFARI_IPHONE);
    expect(info.browser).toBe('Safari');
    expect(info.os).toBe('iOS');
    expect(info.osVersion).toBe('17.5');
    expect(info.device).toBe('mobile');
    expect(info.deviceModel).toBe('iPhone');
    expect(info.engine).toBe('WebKit');
  });

  it('keeps Safari on an iPad apart from macOS', () => {
    const info = parseUserAgent(SAFARI_IPAD);
    expect(info.os).toBe('iPadOS');
    expect(info.device).toBe('tablet');
    expect(info.deviceModel).toBe('iPad');
  });

  it('reports Chrome on iOS as Chrome with WebKit, Apple’s required engine', () => {
    const info = parseUserAgent(CHROME_IOS);
    expect(info.browser).toBe('Chrome');
    expect(info.browserVersion).toBe('131.0.6778.73');
    expect(info.engine).toBe('WebKit');
    expect(info.os).toBe('iOS');
  });

  it('reads Chrome on an Android phone and its model', () => {
    const info = parseUserAgent(CHROME_ANDROID);
    expect(info.browser).toBe('Chrome');
    expect(info.os).toBe('Android');
    expect(info.osVersion).toBe('14');
    expect(info.device).toBe('mobile');
    expect(info.deviceModel).toBe('Pixel 8');
  });

  it('treats an Android build without a Mobile token as a tablet', () => {
    const info = parseUserAgent(SAMSUNG_TABLET);
    expect(info.browser).toBe('Samsung Internet');
    expect(info.device).toBe('tablet');
    expect(info.deviceModel).toBe('SM-X700');
  });

  it('leaves an iPad in desktop mode as macOS from the string alone', () => {
    const info = parseUserAgent(IPAD_DESKTOP_MODE);
    expect(info.os).toBe('macOS');
    expect(info.device).toBe('desktop');
    // The page corrects this with navigator.maxTouchPoints; the parser stays honest about the string.
    expect(info.deviceModel).toBe(null);
  });
});

describe('parseUserAgent — in-app browsers', () => {
  it('identifies KakaoTalk’s embedded browser', () => {
    const info = parseUserAgent(KAKAO_ANDROID);
    expect(info.kind).toBe('in-app');
    expect(info.inApp).toBe('KakaoTalk');
    expect(info.browser).toBe('Chrome');
    expect(info.os).toBe('Android');
    expect(info.device).toBe('mobile');
  });

  it('identifies the Naver app’s embedded browser', () => {
    const info = parseUserAgent(NAVER_ANDROID);
    expect(info.inApp).toBe('Naver app');
    expect(info.kind).toBe('in-app');
  });
});

describe('parseUserAgent — bots and tools', () => {
  it('identifies Googlebot as a crawler, not a browser', () => {
    const info = parseUserAgent(GOOGLEBOT);
    expect(info.kind).toBe('bot');
    expect(info.bot).toBe('Googlebot');
    expect(info.browser).toBe(null);
    expect(info.engine).toBe(null);
    expect(info.device).toBe('bot');
  });

  it('identifies ClaudeBot', () => {
    expect(parseUserAgent(CLAUDEBOT).bot).toBe('ClaudeBot');
  });

  it('identifies curl and python-requests as command-line clients', () => {
    expect(parseUserAgent(CURL)).toMatchObject({ kind: 'tool', device: 'tool', browser: null });
    expect(parseUserAgent(PYTHON)).toMatchObject({ kind: 'tool', device: 'tool' });
  });
});

describe('parseUserAgent — boundaries', () => {
  it('returns an unknown client for an empty string', () => {
    const info = parseUserAgent('');
    expect(info.kind).toBe('unknown');
    expect(info.device).toBe('unknown');
    expect(info.browser).toBe(null);
  });

  it('returns an unknown client for a string it does not recognise', () => {
    const info = parseUserAgent('SomethingCustom/1.0 (Weird)');
    expect(info.kind).toBe('unknown');
    expect(info.browser).toBe(null);
    expect(info.os).toBe(null);
  });

  it('ignores surrounding whitespace and non-string input', () => {
    expect(parseUserAgent(`  ${CURL}  `).bot).toBe(null);
    expect(parseUserAgent(undefined as unknown as string).kind).toBe('unknown');
  });

  it('does not mistake a Korean-language product name for a browser token', () => {
    const info = parseUserAgent('Mozilla/5.0 (Windows NT 10.0) 카카오톡/10.0');
    expect(info.browser).toBe(null);
    expect(info.kind).toBe('unknown');
  });

  it('keeps a long, realistic string intact', () => {
    const long = `${CHROME_WINDOWS} ${'x'.repeat(400)}`;
    expect(parseUserAgent(long).browser).toBe('Chrome');
  });
});

describe('detectEngine', () => {
  it('reads Trident from Internet Explorer', () => {
    expect(detectEngine('Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko')).toBe('Trident');
  });

  it('returns null for bots and empty strings', () => {
    expect(detectEngine(GOOGLEBOT, true)).toBe(null);
    expect(detectEngine('')).toBe(null);
  });
});

describe('pickClientHintBrand', () => {
  it('skips the GREASE entries Chromium adds', () => {
    const brand = pickClientHintBrand([
      { brand: 'Chromium', version: '131' },
      { brand: 'Not)A;Brand', version: '24' },
      { brand: 'Google Chrome', version: '131' },
    ]);
    expect(brand).toEqual({ brand: 'Google Chrome', version: '131' });
  });

  it('falls back to Chromium when it is the only real brand', () => {
    expect(
      pickClientHintBrand([
        { brand: 'Not_A Brand', version: '24' },
        { brand: 'Chromium', version: '131' },
      ]),
    ).toEqual({
      brand: 'Chromium',
      version: '131',
    });
  });

  it('returns null for an empty or missing list', () => {
    expect(pickClientHintBrand([])).toBe(null);
    expect(pickClientHintBrand(null)).toBe(null);
    expect(pickClientHintBrand(undefined)).toBe(null);
  });
});

describe('majorVersion', () => {
  it('takes the leading number', () => {
    expect(majorVersion('131.0.6778.86')).toBe('131');
    expect(majorVersion('17.5')).toBe('17');
    expect(majorVersion('')).toBe(null);
    expect(majorVersion(null)).toBe(null);
  });
});

describe('reports', () => {
  it('writes a short identity a person can read', () => {
    expect(shortIdentity(parseUserAgent(CHROME_WINDOWS), LABELS)).toBe('Chrome 131 · Windows · desktop');
    expect(shortIdentity(parseUserAgent(SAFARI_IPHONE), LABELS)).toBe('Safari 17 · iOS · mobile');
  });

  it('writes the full copyable report with the raw string last', () => {
    const report = clientReport(parseUserAgent(KAKAO_ANDROID), KAKAO_ANDROID, LABELS);
    expect(report).toContain('Browser: Chrome 119.0.6045.193');
    expect(report).toContain('Engine: Blink');
    expect(report).toContain('Operating system: Android 13');
    expect(report).toContain('Device: mobile');
    expect(report).toContain('Model: SM-S918N');
    expect(report).toContain('In-app browser: KakaoTalk');
    expect(report.trim().endsWith(`User-Agent: ${KAKAO_ANDROID}`)).toBe(true);
  });

  it('marks absent values as unknown instead of leaving a blank', () => {
    const report = clientReport(parseUserAgent(''), '', LABELS);
    expect(report).toContain('Browser: Unknown');
    expect(report).toContain('User-Agent: Unknown');
  });
});

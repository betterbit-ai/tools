/**
 * Pure user-agent parsing for the user-agent tool — no DOM, no Preact.
 * Tool.tsx collects the browser's own values (navigator.*, Client Hints) and passes the string
 * here, so the parser can be tested against strings recorded from real browsers and logs.
 */

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'tv' | 'bot' | 'tool' | 'unknown';
export type ClientKind = 'browser' | 'in-app' | 'bot' | 'tool' | 'unknown';

export interface ClientInfo {
  kind: ClientKind;
  /** Canonical product name, e.g. "Chrome", "Safari", "Edge". */
  browser: string | null;
  browserVersion: string | null;
  /** Rendering engine: Blink, Gecko, WebKit, Trident. */
  engine: string | null;
  os: string | null;
  osVersion: string | null;
  device: DeviceType;
  deviceModel: string | null;
  /** App that embeds the browser, e.g. "KakaoTalk", "Instagram". */
  inApp: string | null;
  bot: string | null;
  /** True when the string uses Chromium's reduced form (major version only, frozen OS version). */
  reduced: boolean;
}

interface Rule {
  /** Token to find, case-sensitive unless the rule says otherwise. */
  token: string;
  name: string;
  /** Version capture group applied to the matched token's tail. */
  pattern: RegExp;
}

const BOT_TOKENS: { token: string; name: string }[] = [
  { token: 'Googlebot', name: 'Googlebot' },
  { token: 'Google-InspectionTool', name: 'Google-InspectionTool' },
  { token: 'bingbot', name: 'Bingbot' },
  { token: 'DuckDuckBot', name: 'DuckDuckBot' },
  { token: 'Baiduspider', name: 'Baiduspider' },
  { token: 'YandexBot', name: 'YandexBot' },
  { token: 'Yeti', name: 'Naver Yeti' },
  { token: 'Applebot', name: 'Applebot' },
  { token: 'GPTBot', name: 'GPTBot' },
  { token: 'OAI-SearchBot', name: 'OAI-SearchBot' },
  { token: 'ClaudeBot', name: 'ClaudeBot' },
  { token: 'Claude-Web', name: 'Claude-Web' },
  { token: 'PerplexityBot', name: 'PerplexityBot' },
  { token: 'AhrefsBot', name: 'AhrefsBot' },
  { token: 'SemrushBot', name: 'SemrushBot' },
  { token: 'facebookexternalhit', name: 'facebookexternalhit' },
  { token: 'Twitterbot', name: 'Twitterbot' },
  { token: 'Slackbot', name: 'Slackbot' },
  { token: 'Discordbot', name: 'Discordbot' },
  { token: 'TelegramBot', name: 'TelegramBot' },
];

const TOOL_TOKENS: { token: string; name: string }[] = [
  { token: 'curl/', name: 'curl' },
  { token: 'Wget/', name: 'Wget' },
  { token: 'python-requests/', name: 'python-requests' },
  { token: 'python-urllib/', name: 'python-urllib' },
  { token: 'Go-http-client/', name: 'Go-http-client' },
  { token: 'okhttp/', name: 'OkHttp' },
  { token: 'axios/', name: 'axios' },
  { token: 'node-fetch/', name: 'node-fetch' },
  { token: 'PostmanRuntime/', name: 'Postman' },
  { token: 'HTTPie/', name: 'HTTPie' },
];

const IN_APP_TOKENS: { token: string; name: string }[] = [
  { token: 'KAKAOTALK', name: 'KakaoTalk' },
  { token: 'KAKAOSTORY', name: 'KakaoStory' },
  { token: 'NAVER(inapp', name: 'Naver app' },
  { token: 'DaumApps', name: 'Daum app' },
  { token: 'Instagram', name: 'Instagram' },
  { token: 'FBAN/', name: 'Facebook' },
  { token: 'FBAV/', name: 'Facebook' },
  { token: 'Line/', name: 'LINE' },
  { token: 'TikTok', name: 'TikTok' },
  { token: 'Snapchat', name: 'Snapchat' },
  { token: 'WhatsApp', name: 'WhatsApp' },
  { token: 'Twitter for', name: 'X (Twitter)' },
  { token: 'musical_ly', name: 'TikTok' },
];

/**
 * Browser tokens in matching order: every derivative has to be tested before the base browser,
 * because Edge, Opera and Samsung Internet all carry "Chrome" and "Safari" in their strings.
 */
const BROWSER_RULES: Rule[] = [
  { token: 'Edg/', name: 'Edge', pattern: /Edg\/([\d.]+)/ },
  { token: 'EdgA/', name: 'Edge', pattern: /EdgA\/([\d.]+)/ },
  { token: 'EdgiOS/', name: 'Edge', pattern: /EdgiOS\/([\d.]+)/ },
  { token: 'OPR/', name: 'Opera', pattern: /OPR\/([\d.]+)/ },
  { token: 'SamsungBrowser/', name: 'Samsung Internet', pattern: /SamsungBrowser\/([\d.]+)/ },
  { token: 'Whale/', name: 'Whale', pattern: /Whale\/([\d.]+)/ },
  { token: 'YaBrowser/', name: 'Yandex Browser', pattern: /YaBrowser\/([\d.]+)/ },
  { token: 'Vivaldi/', name: 'Vivaldi', pattern: /Vivaldi\/([\d.]+)/ },
  { token: 'DuckDuckGo/', name: 'DuckDuckGo', pattern: /DuckDuckGo\/([\d.]+)/ },
  { token: 'Firefox/', name: 'Firefox', pattern: /Firefox\/([\d.]+)/ },
  { token: 'FxiOS/', name: 'Firefox', pattern: /FxiOS\/([\d.]+)/ },
  { token: 'CriOS/', name: 'Chrome', pattern: /CriOS\/([\d.]+)/ },
  { token: 'Chrome/', name: 'Chrome', pattern: /Chrome\/([\d.]+)/ },
  { token: 'Chromium/', name: 'Chromium', pattern: /Chromium\/([\d.]+)/ },
  { token: 'MSIE ', name: 'Internet Explorer', pattern: /MSIE ([\d.]+)/ },
  { token: 'Trident/', name: 'Internet Explorer', pattern: /rv:([\d.]+)/ },
  { token: 'Safari/', name: 'Safari', pattern: /Version\/([\d.]+)/ },
];

const OS_RULES: { token: string; name: string; pattern: RegExp }[] = [
  { token: 'Windows NT 10.0', name: 'Windows', pattern: /Windows NT (10\.0)/ },
  { token: 'Windows NT 6.3', name: 'Windows', pattern: /Windows NT (6\.3)/ },
  { token: 'Windows NT 6.2', name: 'Windows', pattern: /Windows NT (6\.2)/ },
  { token: 'Windows NT 6.1', name: 'Windows', pattern: /Windows NT (6\.1)/ },
  { token: 'Windows', name: 'Windows', pattern: /Windows NT ([\d.]+)/ },
  { token: 'Android', name: 'Android', pattern: /Android ([\d.]+)/ },
  { token: 'iPhone', name: 'iOS', pattern: /iPhone OS ([\d_]+)/ },
  { token: 'iPad', name: 'iPadOS', pattern: /CPU OS ([\d_]+)/ },
  { token: 'iPod', name: 'iOS', pattern: /iPod touch; CPU iPhone OS ([\d_]+)/ },
  { token: 'CrOS', name: 'ChromeOS', pattern: /CrOS [^ ]+ ([\d.]+)/ },
  { token: 'Mac OS X', name: 'macOS', pattern: /Mac OS X ([\d_.]+)/ },
  { token: 'Ubuntu', name: 'Ubuntu', pattern: /Ubuntu/ },
  { token: 'Linux', name: 'Linux', pattern: /Linux/ },
  { token: 'FreeBSD', name: 'FreeBSD', pattern: /FreeBSD/ },
];

const TV_TOKENS = ['SMART-TV', 'SmartTV', 'BRAVIA', 'Tizen', 'Web0S', 'NetCast', 'AppleTV', 'CrKey', 'AFTT', 'AFTB'];

function versionFrom(ua: string, pattern: RegExp): string | null {
  const match = ua.match(pattern);
  return match?.[1] ? match[1].replace(/_/g, '.') : null;
}

function findToken(ua: string, rules: { token: string; name: string }[]): { token: string; name: string } | null {
  // Longest token first so "EdgiOS/" is not shadowed by a shorter overlapping token.
  const sorted = [...rules].sort((a, b) => b.token.length - a.token.length);
  for (const rule of sorted) if (ua.includes(rule.token)) return rule;
  return null;
}

function androidModel(ua: string): string | null {
  const match = ua.match(/Android [\d.]+;\s*([^;)]+?)(?:\s+Build\/[^;)]*)?[;)]/);
  if (!match) return null;
  const model = match[1].trim();
  if (!model || model === 'K' || model === 'wv' || model.startsWith('wv;')) return null;
  return model;
}

/** Parses a user-agent string into the client it claims to be. Unknown strings stay unknown. */
export function parseUserAgent(input: string): ClientInfo {
  const ua = (input ?? '').trim();
  const empty: ClientInfo = {
    kind: 'unknown',
    browser: null,
    browserVersion: null,
    engine: null,
    os: null,
    osVersion: null,
    device: 'unknown',
    deviceModel: null,
    inApp: null,
    bot: null,
    reduced: false,
  };
  if (!ua) return empty;

  const bot = findToken(ua, BOT_TOKENS);
  const tool = findToken(ua, TOOL_TOKENS);
  const inApp = findToken(ua, IN_APP_TOKENS);
  const browserRule = BROWSER_RULES.find((rule) => ua.includes(rule.token)) ?? null;
  const osRule = OS_RULES.find((rule) => ua.includes(rule.token)) ?? null;
  const browser = bot ? null : (browserRule?.name ?? null);
  const browserVersion = bot || !browserRule ? null : versionFrom(ua, browserRule.pattern);
  const osVersion = osRule ? versionFrom(ua, osRule.pattern) : null;

  const isTv = TV_TOKENS.some((token) => ua.includes(token));
  const isTablet = ua.includes('iPad') || (ua.includes('Android') && !ua.includes('Mobile'));
  const isMobile =
    ua.includes('iPhone') ||
    ua.includes('iPod') ||
    (ua.includes('Android') && ua.includes('Mobile')) ||
    ua.includes('Mobile Safari');
  const device: DeviceType = bot
    ? 'bot'
    : tool
      ? 'tool'
      : isTv
        ? 'tv'
        : isTablet
          ? 'tablet'
          : isMobile
            ? 'mobile'
            : osRule
              ? 'desktop'
              : 'unknown';

  return {
    kind: bot ? 'bot' : tool ? 'tool' : inApp ? 'in-app' : browser ? 'browser' : 'unknown',
    browser,
    browserVersion,
    engine: detectEngine(ua, Boolean(bot)),
    os: bot ? null : (osRule?.name ?? null),
    osVersion: bot ? null : osVersion,
    device,
    deviceModel: bot
      ? null
      : (androidModel(ua) ?? (ua.includes('iPhone') ? 'iPhone' : ua.includes('iPad') ? 'iPad' : null)),
    inApp: bot ? null : (inApp?.name ?? null),
    bot: bot?.name ?? null,
    reduced: /(?:Chrome|CriOS|Chromium)\/\d+\.0\.0\.0/.test(ua),
  };
}

/** Engine implied by the tokens a string carries, honouring the iOS rule that all browsers there use WebKit. */
export function detectEngine(ua: string, isBot = false): string | null {
  if (isBot || !ua) return null;
  if (/Trident\/|MSIE /.test(ua)) return 'Trident';
  if (/EdgiOS\/|CriOS\/|FxiOS\//.test(ua) || (/AppleWebKit\//.test(ua) && /iPhone|iPad|iPod/.test(ua))) return 'WebKit';
  if (/Firefox\/|FxiOS\//.test(ua) && !/Chrome\/|Chromium\//.test(ua)) return 'Gecko';
  if (/Chrome\/|Chromium\/|Edg\/|OPR\/|SamsungBrowser\/|Whale\/|EdgA\//.test(ua)) return 'Blink';
  if (/AppleWebKit\//.test(ua) && /Safari\//.test(ua)) return 'WebKit';
  return null;
}

export interface BrandVersion {
  brand: string;
  version: string;
}

/**
 * Picks the meaningful browser from a User-Agent Client Hints brand list.
 * Chromium adds GREASE entries ("Not)A;Brand", "Not_A Brand") to stop sites from matching one brand,
 * so they are ignored; "Chromium" is used only when no branded entry is present.
 */
export function pickClientHintBrand(brands: readonly BrandVersion[] | null | undefined): BrandVersion | null {
  if (!brands || brands.length === 0) return null;
  const usable = brands.filter(
    (item) => item && typeof item.brand === 'string' && !/^Not.?A.?Brand$/i.test(item.brand.trim()),
  );
  const branded = usable.find((item) => item.brand !== 'Chromium');
  return branded ?? usable[0] ?? null;
}

/** Major version of a dotted version string, e.g. "131.0.6778.86" → "131". */
export function majorVersion(version: string | null): string | null {
  if (!version) return null;
  const major = version.match(/^(\d+)/);
  return major ? major[1] : null;
}

export interface ReportLabels {
  browser: string;
  version: string;
  engine: string;
  os: string;
  device: string;
  model: string;
  inApp: string;
  bot: string;
  none: string;
  rawString: string;
  deviceDesktop: string;
  deviceMobile: string;
  deviceTablet: string;
  deviceTv: string;
  deviceBot: string;
  deviceTool: string;
  deviceUnknown: string;
  clientHints: string;
  platform: string;
}

const DEVICE_LABEL: Record<DeviceType, keyof ReportLabels> = {
  desktop: 'deviceDesktop',
  mobile: 'deviceMobile',
  tablet: 'deviceTablet',
  tv: 'deviceTv',
  bot: 'deviceBot',
  tool: 'deviceTool',
  unknown: 'deviceUnknown',
};

/** One-line identity, e.g. "Chrome 131 on Windows (desktop)". */
export function shortIdentity(info: ClientInfo, labels: ReportLabels): string {
  const name = info.bot ?? info.inApp ?? info.browser ?? labels.none;
  const version = info.browserVersion ? ` ${majorVersion(info.browserVersion) ?? info.browserVersion}` : '';
  const platform = info.os ?? labels.none;
  return `${name}${version} · ${platform} · ${labels[DEVICE_LABEL[info.device]]}`;
}

/** Copyable plain-text report for a bug report or a support form. */
export function clientReport(info: ClientInfo, raw: string, labels: ReportLabels): string {
  const lines = [
    `${labels.browser}: ${info.browser ?? labels.none}${info.browserVersion ? ` ${info.browserVersion}` : ''}`,
    `${labels.version}: ${info.browserVersion ?? labels.none}`,
    `${labels.engine}: ${info.engine ?? labels.none}`,
    `${labels.os}: ${info.os ?? labels.none}${info.osVersion ? ` ${info.osVersion}` : ''}`,
    `${labels.device}: ${labels[DEVICE_LABEL[info.device]]}`,
    `${labels.model}: ${info.deviceModel ?? labels.none}`,
  ];
  if (info.inApp) lines.push(`${labels.inApp}: ${info.inApp}`);
  if (info.bot) lines.push(`${labels.bot}: ${info.bot}`);
  lines.push(`${labels.rawString}: ${raw || labels.none}`);
  return lines.join('\n');
}

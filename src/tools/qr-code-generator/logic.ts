/** Pure QR payload and validation logic — no DOM or Preact. */

export const ERROR_CORRECTION_LEVELS = ['L', 'M', 'Q', 'H'] as const;
export type ErrorCorrectionLevel = (typeof ERROR_CORRECTION_LEVELS)[number];
export type ContentType = 'url' | 'text' | 'wifi';
export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
export const LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'] as const;

/** QR Code Model 2 byte-mode capacities for versions 40 at each EC level. */
export const MAX_BYTES: Record<ErrorCorrectionLevel, number> = { L: 2953, M: 2331, Q: 1663, H: 1273 };

export interface QrSettings {
  type: ContentType;
  value: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiSecurity: WifiSecurity;
  wifiHidden: boolean;
  errorCorrection: ErrorCorrectionLevel;
  foreground: string;
  background: string;
}

export type ValidationError = 'empty' | 'missing-wifi-name' | 'too-long' | 'low-contrast';
export type LogoValidationError = 'invalid-type' | 'too-large';

/** Escapes the characters reserved by the widely-supported WIFI: QR payload format. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/** Adds https:// for ordinary hostnames so phone cameras recognize a clickable website URL. */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z\d+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function buildPayload(
  settings: Pick<QrSettings, 'type' | 'value' | 'wifiSsid' | 'wifiPassword' | 'wifiSecurity' | 'wifiHidden'>,
): string {
  if (settings.type === 'url') return normalizeUrl(settings.value);
  if (settings.type === 'text') return settings.value;
  const password = settings.wifiSecurity === 'nopass' ? '' : `P:${escapeWifi(settings.wifiPassword)};`;
  const hidden = settings.wifiHidden ? 'H:true;' : '';
  return `WIFI:T:${settings.wifiSecurity};S:${escapeWifi(settings.wifiSsid)};${password}${hidden};`;
}

/** Converts a JavaScript string to standard UTF-8 bytes, replacing unpaired surrogates with U+FFFD. */
export function utf8Bytes(value: string, limit = Number.POSITIVE_INFINITY): number[] {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        const point = 0x10000 + ((code & 0x3ff) << 10) + (next & 0x3ff);
        bytes.push(
          0xf0 | (point >> 18),
          0x80 | ((point >> 12) & 0x3f),
          0x80 | ((point >> 6) & 0x3f),
          0x80 | (point & 0x3f),
        );
        index += 1;
      } else bytes.push(0xef, 0xbf, 0xbd);
    } else if (code >= 0xdc00 && code <= 0xdfff) bytes.push(0xef, 0xbf, 0xbd);
    else bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    if (bytes.length > limit) return bytes;
  }
  return bytes;
}

/** Returns UTF-8 byte length, including U+FFFD replacement for unpaired UTF-16 surrogates. */
export function utf8ByteLength(value: string): number {
  return utf8Bytes(value).length;
}

function isTooLongToEncode(settings: QrSettings): boolean {
  const limit = MAX_BYTES[settings.errorCorrection];
  if (utf8Bytes(settings.value, limit).length > limit) return true;
  if (settings.type !== 'wifi') return false;
  return utf8Bytes(settings.wifiSsid, limit).length > limit || utf8Bytes(settings.wifiPassword, limit).length > limit;
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** QR codes are most reliable with a dark foreground, a light background, and clear contrast. */
export function hasReadableQrColors(foreground: string, background: string): boolean {
  if (!isHexColor(foreground) || !isHexColor(background)) return false;
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const contrast =
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
  return foregroundLuminance < backgroundLuminance && contrast >= 4.5;
}

export function validateLogo(file: { size: number; type: string }): LogoValidationError | null {
  if (!LOGO_MIME_TYPES.includes(file.type as (typeof LOGO_MIME_TYPES)[number])) return 'invalid-type';
  return file.size > MAX_LOGO_BYTES ? 'too-large' : null;
}

export function validateSettings(settings: QrSettings): ValidationError | null {
  if (settings.type === 'wifi' && !settings.wifiSsid.trim()) return 'missing-wifi-name';
  if (!hasReadableQrColors(settings.foreground, settings.background)) return 'low-contrast';
  // Stop after a few KB for an oversized paste rather than copying it into a Wi-Fi payload or rendering it.
  if (isTooLongToEncode(settings)) return 'too-long';
  const payload = buildPayload(settings);
  if (!payload) return 'empty';
  return utf8ByteLength(payload) > MAX_BYTES[settings.errorCorrection] ? 'too-long' : null;
}

export function isHexColor(value: string): boolean {
  return /^#[\da-f]{6}$/i.test(value);
}

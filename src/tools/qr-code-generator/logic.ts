/** Pure QR payload and validation logic — no DOM or Preact. */

export const ERROR_CORRECTION_LEVELS = ['L', 'M', 'Q', 'H'] as const;
export type ErrorCorrectionLevel = (typeof ERROR_CORRECTION_LEVELS)[number];
export type ContentType = 'url' | 'text' | 'wifi';
export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

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
}

export type ValidationError = 'empty' | 'missing-wifi-name' | 'too-long';

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

/** Returns UTF-8 byte length, including U+FFFD replacement for unpaired UTF-16 surrogates. */
export function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        index += 1;
      } else bytes += 3;
    } else bytes += 3;
  }
  return bytes;
}

export function validateSettings(settings: QrSettings): ValidationError | null {
  if (settings.type === 'wifi' && !settings.wifiSsid.trim()) return 'missing-wifi-name';
  const payload = buildPayload(settings);
  if (!payload) return 'empty';
  return utf8ByteLength(payload) > MAX_BYTES[settings.errorCorrection] ? 'too-long' : null;
}

export function isHexColor(value: string): boolean {
  return /^#[\da-f]{6}$/i.test(value);
}

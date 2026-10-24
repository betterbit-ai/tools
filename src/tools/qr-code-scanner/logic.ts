/** Pure QR-result parsing and image safety limits — no DOM or Preact. */

export const MAX_IMAGE_SIDE = 8192;
export const MAX_IMAGE_PIXELS = 32_000_000;
export const MAX_SCAN_SIDE = 1600;
export const MAX_SCAN_PIXELS = MAX_SCAN_SIDE * MAX_SCAN_SIDE;

export type ScanKind = 'url' | 'wifi' | 'text';

export interface WifiPayload {
  ssid: string;
  password: string;
  security: string;
  hidden: boolean;
}

export interface ScanResult {
  raw: string;
  kind: ScanKind;
  url?: string;
  wifi?: WifiPayload;
}

export type ImageLimitError = 'image-too-large' | null;

export interface ScanRegion {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
}

/** Rejects unsafe canvas allocations before an image is decoded into pixels. */
export function validateImageDimensions(width: number, height: number): ImageLimitError {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 1 ||
    height < 1 ||
    width > MAX_IMAGE_SIDE ||
    height > MAX_IMAGE_SIDE ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    return 'image-too-large';
  }
  return null;
}

/** Fits one decode pass inside a bounded RGBA allocation while preserving the source aspect ratio. */
export function fitScanDimensions(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(
    1,
    MAX_SCAN_SIDE / width,
    MAX_SCAN_SIDE / height,
    Math.sqrt(MAX_SCAN_PIXELS / (width * height)),
  );
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function region(sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number): ScanRegion {
  const target = fitScanDimensions(sourceWidth, sourceHeight);
  return { sourceX, sourceY, sourceWidth, sourceHeight, targetWidth: target.width, targetHeight: target.height };
}

/**
 * Starts with a fast whole-image pass, then scans overlapping quadrants so a small code in a
 * phone photo stays legible. Every pass has a bounded working canvas.
 */
export function createScanRegions(width: number, height: number): ScanRegion[] {
  const regions = [region(0, 0, width, height)];
  const fitted = fitScanDimensions(width, height);
  if (fitted.width === width && fitted.height === height) return regions;

  const overlapX = Math.round(width * 0.05);
  const overlapY = Math.round(height * 0.05);
  const halfWidth = Math.ceil(width / 2);
  const halfHeight = Math.ceil(height / 2);
  for (let row = 0; row < 2; row++) {
    for (let column = 0; column < 2; column++) {
      const startX = Math.max(0, column * halfWidth - overlapX);
      const startY = Math.max(0, row * halfHeight - overlapY);
      const endX = Math.min(width, (column + 1) * halfWidth + overlapX);
      const endY = Math.min(height, (row + 1) * halfHeight + overlapY);
      regions.push(region(startX, startY, endX - startX, endY - startY));
    }
  }
  return regions;
}

function splitEscapedFields(value: string): string[] {
  const fields: string[] = [];
  let field = '';
  let escaped = false;
  for (const character of value) {
    if (escaped) {
      field += character;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === ';') {
      fields.push(field);
      field = '';
    } else {
      field += character;
    }
  }
  if (escaped) field += '\\';
  if (field) fields.push(field);
  return fields;
}

/** Parses the common WIFI:T:…;S:…;P:…;; QR payload without losing escaped Unicode text. */
export function parseWifiPayload(value: string): WifiPayload | null {
  if (!value.startsWith('WIFI:')) return null;
  const fields = splitEscapedFields(value.slice(5));
  const values = new Map<string, string>();
  for (const field of fields) {
    const separator = field.indexOf(':');
    if (separator > 0) values.set(field.slice(0, separator), field.slice(separator + 1));
  }
  const ssid = values.get('S');
  if (!ssid) return null;
  return {
    ssid,
    password: values.get('P') ?? '',
    security: values.get('T') ?? '',
    hidden: values.get('H')?.toLowerCase() === 'true',
  };
}

/** Returns only HTTP(S) URLs for an explicit "open" action; other decoded text stays inert. */
export function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

/** Classifies a decoded value so the UI can show Wi-Fi fields or a deliberate link action. */
export function classifyScan(value: string): ScanResult {
  const wifi = parseWifiPayload(value);
  if (wifi) return { raw: value, kind: 'wifi', wifi };
  const url = safeHttpUrl(value.trim());
  if (url) return { raw: value, kind: 'url', url };
  return { raw: value, kind: 'text' };
}

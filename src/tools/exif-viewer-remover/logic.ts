/**
 * Byte-level metadata inspection and removal. These functions deliberately have
 * no browser dependencies, so format boundaries can be tested independently.
 */

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'unknown';

export interface ExifSummary {
  format: ImageFormat;
  hasMetadata: boolean;
  tags: { label: string; value: string }[];
  gps?: { latitude: number; longitude: number };
}

const JPEG_SOI = [0xff, 0xd8];
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

export function detectImageFormat(bytes: Uint8Array): ImageFormat {
  if (bytes[0] === JPEG_SOI[0] && bytes[1] === JPEG_SOI[1]) return 'jpeg';
  if (PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) return 'png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  return 'unknown';
}

export function inspectMetadata(bytes: Uint8Array): ExifSummary {
  const format = detectImageFormat(bytes);
  if (format === 'jpeg') return inspectJpeg(bytes);
  if (format === 'png') return inspectPng(bytes);
  if (format === 'webp') return inspectWebp(bytes);
  return { format, hasMetadata: false, tags: [] };
}

/** Removes EXIF/XMP/IPTC/comments and textual time chunks without touching image pixels. */
export function stripMetadata(bytes: Uint8Array): Uint8Array {
  switch (detectImageFormat(bytes)) {
    case 'jpeg':
      return stripJpeg(bytes);
    case 'png':
      return stripPng(bytes);
    case 'webp':
      return stripWebp(bytes);
    default:
      return bytes.slice();
  }
}

export function cleanedName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'image';
  const extension = name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || 'jpg';
  return `${base}-clean.${extension}`;
}

function inspectJpeg(bytes: Uint8Array): ExifSummary {
  const tags: ExifSummary['tags'] = [];
  let gps: ExifSummary['gps'];
  let offset = 2;
  let hasMetadata = false;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = readU16(bytes, offset + 2, false);
    if (length < 2 || offset + 2 + length > bytes.length) break;
    const dataStart = offset + 4;
    const dataEnd = offset + 2 + length;
    if (marker === 0xe1 && ascii(bytes, dataStart, 6) === 'Exif\0\0') {
      hasMetadata = true;
      const parsed = parseTiff(bytes.subarray(dataStart + 6, dataEnd));
      tags.push(...parsed.tags);
      gps = parsed.gps;
    } else if (marker === 0xe1 || marker === 0xed || marker === 0xfe) {
      hasMetadata = true;
    }
    offset = dataEnd;
  }
  return { format: 'jpeg', hasMetadata, tags, gps };
}

function inspectPng(bytes: Uint8Array): ExifSummary {
  const tags: ExifSummary['tags'] = [];
  let offset = 8;
  let hasMetadata = false;
  while (offset + 12 <= bytes.length) {
    const length = readU32(bytes, offset, false);
    const type = ascii(bytes, offset + 4, 4);
    if (offset + 12 + length > bytes.length) break;
    if (['eXIf', 'iTXt', 'tEXt', 'zTXt', 'tIME'].includes(type)) {
      hasMetadata = true;
      tags.push({ label: type, value: type === 'eXIf' ? 'EXIF metadata' : 'Text metadata' });
    }
    if (type === 'IEND') break;
    offset += length + 12;
  }
  return { format: 'png', hasMetadata, tags };
}

function inspectWebp(bytes: Uint8Array): ExifSummary {
  const tags: ExifSummary['tags'] = [];
  let offset = 12;
  let hasMetadata = false;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const length = readU32(bytes, offset + 4, true);
    if (offset + 8 + length > bytes.length) break;
    if (type === 'EXIF' || type === 'XMP ') {
      hasMetadata = true;
      tags.push({ label: type.trim(), value: type === 'EXIF' ? 'EXIF metadata' : 'XMP metadata' });
    }
    offset += 8 + length + (length % 2);
  }
  return { format: 'webp', hasMetadata, tags };
}

function stripJpeg(bytes: Uint8Array): Uint8Array {
  const kept: number[] = [0xff, 0xd8];
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      append(kept, bytes.subarray(offset));
      return new Uint8Array(kept);
    }
    const length = readU16(bytes, offset + 2, false);
    if (length < 2 || offset + 2 + length > bytes.length) break;
    // APP1: EXIF/XMP, APP13: IPTC, COM: comments. Other APP blocks can contain
    // colour/display data, so retain them.
    if (marker !== 0xe1 && marker !== 0xed && marker !== 0xfe)
      append(kept, bytes.subarray(offset, offset + 2 + length));
    offset += 2 + length;
  }
  return bytes.slice();
}

function stripPng(bytes: Uint8Array): Uint8Array {
  const kept = Array.from(bytes.subarray(0, 8));
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = readU32(bytes, offset, false);
    const type = ascii(bytes, offset + 4, 4);
    if (offset + 12 + length > bytes.length) return bytes.slice();
    if (!['eXIf', 'iTXt', 'tEXt', 'zTXt', 'tIME'].includes(type))
      append(kept, bytes.subarray(offset, offset + length + 12));
    offset += length + 12;
    if (type === 'IEND') return new Uint8Array(kept);
  }
  return bytes.slice();
}

function stripWebp(bytes: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const length = readU32(bytes, offset + 4, true);
    if (offset + 8 + length > bytes.length) return bytes.slice();
    if (!['EXIF', 'XMP '].includes(ascii(bytes, offset, 4)))
      chunks.push(bytes.subarray(offset, offset + 8 + length + (length % 2)));
    offset += 8 + length + (length % 2);
  }
  const bodyLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const output = new Uint8Array(12 + bodyLength);
  output.set(bytes.subarray(0, 12));
  output.set(writeU32(bodyLength + 4), 4);
  let cursor = 12;
  for (const chunk of chunks) {
    output.set(chunk, cursor);
    cursor += chunk.length;
  }
  return output;
}

function parseTiff(bytes: Uint8Array): Pick<ExifSummary, 'tags' | 'gps'> {
  if (bytes.length < 8) return { tags: [] };
  const little = ascii(bytes, 0, 2) === 'II';
  if (!little && ascii(bytes, 0, 2) !== 'MM') return { tags: [] };
  const firstIfd = readU32(bytes, 4, little);
  const tags: ExifSummary['tags'] = [];
  const root = readIfd(bytes, firstIfd, little);
  for (const entry of root) addKnownTag(tags, entry, bytes, little);
  const exif = root.find((entry) => entry.tag === 0x8769);
  if (exif)
    for (const entry of readIfd(bytes, entryNumber(exif, bytes, little), little))
      addKnownTag(tags, entry, bytes, little);
  const gpsIfd = root.find((entry) => entry.tag === 0x8825);
  const gps = gpsIfd ? parseGps(bytes, entryNumber(gpsIfd, bytes, little), little) : undefined;
  if (gps) tags.push({ label: 'GPS', value: `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}` });
  return { tags, gps };
}

interface IfdEntry {
  tag: number;
  type: number;
  count: number;
  valueOffset: number;
}

function readIfd(bytes: Uint8Array, offset: number, little: boolean): IfdEntry[] {
  if (offset + 2 > bytes.length) return [];
  const count = readU16(bytes, offset, little);
  const entries: IfdEntry[] = [];
  for (let index = 0; index < count; index++) {
    const at = offset + 2 + index * 12;
    if (at + 12 > bytes.length) break;
    entries.push({
      tag: readU16(bytes, at, little),
      type: readU16(bytes, at + 2, little),
      count: readU32(bytes, at + 4, little),
      valueOffset: at + 8,
    });
  }
  return entries;
}

function addKnownTag(tags: ExifSummary['tags'], entry: IfdEntry, bytes: Uint8Array, little: boolean) {
  const label = (
    {
      0x010f: 'Camera make',
      0x0110: 'Camera model',
      0x0132: 'Modified',
      0x9003: 'Taken',
      0x9004: 'Digitized',
    } as Record<number, string>
  )[entry.tag];
  if (!label) return;
  const value = readEntry(entry, bytes, little);
  if (typeof value === 'string' && value) tags.push({ label, value });
}

function parseGps(
  bytes: Uint8Array,
  offset: number,
  little: boolean,
): { latitude: number; longitude: number } | undefined {
  const entries = readIfd(bytes, offset, little);
  const value = (tag: number) => entries.find((entry) => entry.tag === tag);
  const lat = value(2),
    lon = value(4),
    latRef = value(1),
    lonRef = value(3);
  if (!lat || !lon || !latRef || !lonRef) return undefined;
  const latitude = dms(readEntry(lat, bytes, little));
  const longitude = dms(readEntry(lon, bytes, little));
  const latitudeRef = readEntry(latRef, bytes, little);
  const longitudeRef = readEntry(lonRef, bytes, little);
  if (
    latitude === undefined ||
    longitude === undefined ||
    typeof latitudeRef !== 'string' ||
    typeof longitudeRef !== 'string'
  )
    return undefined;
  return {
    latitude: latitudeRef === 'S' ? -latitude : latitude,
    longitude: longitudeRef === 'W' ? -longitude : longitude,
  };
}

function dms(value: string | number | number[]): number | undefined {
  return Array.isArray(value) && value.length >= 3 ? value[0] + value[1] / 60 + value[2] / 3600 : undefined;
}
function entryNumber(entry: IfdEntry, bytes: Uint8Array, little: boolean): number {
  const value = readEntry(entry, bytes, little);
  return typeof value === 'number' ? value : 0;
}

function readEntry(entry: IfdEntry, bytes: Uint8Array, little: boolean): string | number | number[] {
  const sizes: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 };
  const size = sizes[entry.type];
  if (!size || entry.count > 1000) return '';
  const total = size * entry.count;
  const offset = total <= 4 ? entry.valueOffset : readU32(bytes, entry.valueOffset, little);
  if (offset + total > bytes.length) return '';
  if (entry.type === 2) return ascii(bytes, offset, entry.count).replace(/\0.*$/, '').trim();
  if (entry.type === 3) return readU16(bytes, offset, little);
  if (entry.type === 4) return readU32(bytes, offset, little);
  if (entry.type === 5) {
    const values: number[] = [];
    for (let index = 0; index < entry.count; index++) {
      const at = offset + index * 8,
        den = readU32(bytes, at + 4, little);
      if (!den) return [];
      values.push(readU32(bytes, at, little) / den);
    }
    return values;
  }
  return '';
}

function readU16(bytes: Uint8Array, offset: number, little: boolean): number {
  if (offset + 2 > bytes.length) return 0;
  return little ? bytes[offset] | (bytes[offset + 1] << 8) : (bytes[offset] << 8) | bytes[offset + 1];
}
function readU32(bytes: Uint8Array, offset: number, little: boolean): number {
  if (offset + 4 > bytes.length) return 0;
  return little
    ? bytes[offset] + bytes[offset + 1] * 2 ** 8 + bytes[offset + 2] * 2 ** 16 + bytes[offset + 3] * 2 ** 24
    : bytes[offset] * 2 ** 24 + bytes[offset + 1] * 2 ** 16 + bytes[offset + 2] * 2 ** 8 + bytes[offset + 3];
}
function writeU32(value: number): Uint8Array {
  return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
}
function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}
function append(target: number[], source: Uint8Array) {
  for (const value of source) target.push(value);
}

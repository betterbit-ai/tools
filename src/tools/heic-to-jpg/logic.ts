/**
 * HEIC container reading and EXIF/JPEG byte surgery — pure functions, no DOM.
 * The libheif/Canvas decoding lives in convert.ts.
 *
 * Why this file exists: a HEIC photo from an iPhone carries its capture date,
 * camera and (usually) GPS coordinates in an `Exif` item inside the ISOBMFF
 * container. Canvas can only hand us pixels, so converting through Canvas alone
 * produces a JPG with no metadata at all — the "my converted photos lost their
 * date" complaint. We therefore read the Exif item out of the HEIC ourselves
 * (ISO/IEC 23008-12 Annex A.2.1) and write it back into the JPG as an APP1
 * segment (Exif 3.0 / JEITA CP-3451), optionally without the GPS IFD.
 */

/* ───────────── File identification ───────────── */

/** Extensions Apple and Android devices actually produce for HEIF stills. */
export const HEIC_EXTENSIONS = ['.heic', '.heif', '.hif'] as const;

/** `accept` for the Dropzone. Chrome leaves `file.type` empty for HEIC, so extensions matter. */
export const HEIC_ACCEPT = '.heic,.heif,.hif,image/heic,image/heif,image/heic-sequence,image/heif-sequence';

/** HEIF `ftyp` major brands that hold still images we can decode. */
const HEIF_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs', 'mif1', 'msf1', 'heif']);

export function isHeicFile(file: { name: string; type: string }): boolean {
  const name = file.name.toLowerCase();
  if (HEIC_EXTENSIONS.some((ext) => name.endsWith(ext))) return true;
  return file.type === 'image/heic' || file.type === 'image/heif';
}

/** "IMG_4821.HEIC" → "IMG_4821.jpg" (and a name with no extension still gets one). */
export function outputName(name: string): string {
  const base = name.replace(/\.[^.\\/]+$/, '');
  return `${base || 'image'}.jpg`;
}

/** Appends "-2", "-3"… before the extension until the name is unused. */
export function uniqueName(name: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(name)) return name;
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}${ext}`;
    if (!used.has(candidate)) return candidate;
  }
}

/* ───────────── ISOBMFF (HEIF container) ───────────── */

const u16 = (b: Uint8Array, p: number) => (b[p] << 8) | b[p + 1];
const u32 = (b: Uint8Array, p: number) => ((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]) >>> 0;
const u64 = (b: Uint8Array, p: number) => u32(b, p) * 2 ** 32 + u32(b, p + 4);
const fourcc = (b: Uint8Array, p: number) => String.fromCharCode(b[p], b[p + 1], b[p + 2], b[p + 3]);

interface Box {
  type: string;
  /** First byte of the payload (after the size + type header). */
  start: number;
  /** One past the last byte of the box. */
  end: number;
}

/** Walks sibling boxes in [start, end). Stops silently on a truncated or absurd box. */
function* boxes(bytes: Uint8Array, start: number, end: number): Generator<Box> {
  let p = start;
  while (p + 8 <= end) {
    let size = u32(bytes, p);
    const type = fourcc(bytes, p + 4);
    let header = 8;
    if (size === 1) {
      if (p + 16 > end) return;
      size = u64(bytes, p + 8);
      header = 16;
    } else if (size === 0) {
      size = end - p; // "to end of file"
    }
    if (size < header || p + size > end) return;
    yield { type, start: p + header, end: p + size };
    p += size;
  }
}

function findBox(bytes: Uint8Array, start: number, end: number, type: string): Box | null {
  for (const box of boxes(bytes, start, end)) if (box.type === type) return box;
  return null;
}

/** Major brand from the leading `ftyp` box, or null if the file does not start with one. */
export function heicBrand(bytes: Uint8Array): string | null {
  for (const box of boxes(bytes, 0, bytes.length)) {
    if (box.type !== 'ftyp') return null; // ftyp is required to be the first box
    return box.end - box.start >= 4 ? fourcc(bytes, box.start) : null;
  }
  return null;
}

/** True when the bytes really are a HEIF still image, whatever the file name says. */
export function isHeicBytes(bytes: Uint8Array): boolean {
  const brand = heicBrand(bytes);
  return brand !== null && HEIF_BRANDS.has(brand);
}

function readUint(bytes: Uint8Array, p: number, size: number): number {
  let v = 0;
  for (let i = 0; i < size; i++) v = v * 256 + bytes[p + i];
  return v;
}

/** Item ID of the `Exif` item, from the `iinf` box. Needs `infe` version ≥ 2 (which carries item_type). */
function findExifItemId(bytes: Uint8Array, iinf: Box): number | null {
  const version = bytes[iinf.start];
  let p = iinf.start + 4; // version + flags
  p += version === 0 ? 2 : 4; // entry_count
  for (const box of boxes(bytes, p, iinf.end)) {
    if (box.type !== 'infe') continue;
    const v = bytes[box.start];
    if (v < 2) continue; // no item_type field, so the item cannot be identified
    let q = box.start + 4;
    let id: number;
    if (v === 2) {
      id = u16(bytes, q);
      q += 2;
    } else {
      id = u32(bytes, q);
      q += 4;
    }
    q += 2; // item_protection_index
    if (q + 4 > box.end) continue;
    if (fourcc(bytes, q) === 'Exif') return id;
  }
  return null;
}

interface Extent {
  offset: number;
  length: number;
  /** 0 = offset into the file, 1 = offset into the `idat` box. */
  constructionMethod: number;
}

/** First extent of `itemId` from the `iloc` box. Exif items are always single-extent in practice. */
function findItemExtent(bytes: Uint8Array, iloc: Box, itemId: number): Extent | null {
  const version = bytes[iloc.start];
  let p = iloc.start + 4; // version + flags
  const packedA = bytes[p];
  const packedB = bytes[p + 1];
  const offsetSize = packedA >> 4;
  const lengthSize = packedA & 0x0f;
  const baseOffsetSize = packedB >> 4;
  // The low nibble is index_size only in versions 1 and 2; in version 0 it is reserved.
  const indexSize = version === 1 || version === 2 ? packedB & 0x0f : 0;
  p += 2;
  let itemCount: number;
  if (version < 2) {
    itemCount = u16(bytes, p);
    p += 2;
  } else {
    itemCount = u32(bytes, p);
    p += 4;
  }

  for (let i = 0; i < itemCount; i++) {
    if (p + 2 > iloc.end) return null;
    let id: number;
    if (version < 2) {
      id = u16(bytes, p);
      p += 2;
    } else {
      id = u32(bytes, p);
      p += 4;
    }
    let constructionMethod = 0;
    if (version === 1 || version === 2) {
      constructionMethod = u16(bytes, p) & 0x0f;
      p += 2;
    }
    p += 2; // data_reference_index
    const baseOffset = readUint(bytes, p, baseOffsetSize);
    p += baseOffsetSize;
    const extentCount = u16(bytes, p);
    p += 2;
    let found: Extent | null = null;
    for (let e = 0; e < extentCount; e++) {
      p += indexSize;
      const offset = readUint(bytes, p, offsetSize);
      p += offsetSize;
      const length = readUint(bytes, p, lengthSize);
      p += lengthSize;
      if (p > iloc.end) return null;
      if (id === itemId && e === 0) found = { offset: baseOffset + offset, length, constructionMethod };
    }
    if (found) return found;
  }
  return null;
}

/**
 * Extracts the raw TIFF block of the HEIC's Exif item, ready to be wrapped in a
 * JPEG APP1 segment. Returns null when the file carries no Exif item.
 */
export function findExifTiff(bytes: Uint8Array): Uint8Array | null {
  const meta = findBox(bytes, 0, bytes.length, 'meta');
  if (!meta) return null;
  const metaStart = meta.start + 4; // `meta` is a FullBox: version + flags first
  const iinf = findBox(bytes, metaStart, meta.end, 'iinf');
  const iloc = findBox(bytes, metaStart, meta.end, 'iloc');
  if (!iinf || !iloc) return null;

  const itemId = findExifItemId(bytes, iinf);
  if (itemId === null) return null;
  const extent = findItemExtent(bytes, iloc, itemId);
  if (!extent || extent.length < 8) return null;

  let base = bytes;
  if (extent.constructionMethod === 1) {
    const idat = findBox(bytes, metaStart, meta.end, 'idat');
    if (!idat) return null;
    base = bytes.subarray(idat.start, idat.end);
  } else if (extent.constructionMethod !== 0) {
    return null; // item_reference construction is not used for Exif
  }
  if (extent.offset + extent.length > base.length) return null;

  const payload = base.subarray(extent.offset, extent.offset + extent.length);
  // ISO/IEC 23008-12 A.2.1: the item starts with a 4-byte exif_tiff_header_offset,
  // then that many bytes of padding, then the TIFF header itself.
  const tiffStart = 4 + u32(payload, 0);
  if (tiffStart + 8 > payload.length) return null;
  return payload.subarray(tiffStart);
}

/* ───────────── EXIF (TIFF) ───────────── */

/** Byte size of each TIFF field type (13 = IFD pointer). Unlisted types are skipped, not guessed. */
const TYPE_SIZE: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  6: 1,
  7: 1,
  8: 2,
  9: 4,
  10: 8,
  11: 4,
  12: 8,
  13: 4,
};

const TAG_STRIP_OFFSETS = 0x0111;
const TAG_STRIP_BYTE_COUNTS = 0x0117;
const TAG_ORIENTATION = 0x0112;
const TAG_MAKE = 0x010f;
const TAG_MODEL = 0x0110;
const TAG_DATE_TIME = 0x0132;
const TAG_JPEG_INTERCHANGE = 0x0201;
const TAG_JPEG_INTERCHANGE_LENGTH = 0x0202;
const TAG_EXIF_IFD = 0x8769;
const TAG_GPS_IFD = 0x8825;
const TAG_MAKER_NOTE = 0x927c;
const TAG_DATE_TIME_ORIGINAL = 0x9003;
const TAG_INTEROP_IFD = 0xa005;

const SUB_IFD_TAGS = new Set([TAG_EXIF_IFD, TAG_GPS_IFD, TAG_INTEROP_IFD]);
/**
 * Tags that must not survive the rewrite:
 * - strip/thumbnail pointers reference pixel data we do not copy;
 * - MakerNote uses offsets relative to the original TIFF header, so moving it
 *   produces a corrupt block (ExifTool documents the same hazard).
 */
const DROP_TAGS = new Set([
  TAG_STRIP_OFFSETS,
  TAG_STRIP_BYTE_COUNTS,
  TAG_JPEG_INTERCHANGE,
  TAG_JPEG_INTERCHANGE_LENGTH,
  TAG_MAKER_NOTE,
]);

interface Entry {
  tag: number;
  type: number;
  count: number;
  /** Raw value bytes in the source byte order; empty for sub-IFD pointers. */
  data: Uint8Array;
  sub?: Ifd;
}
interface Ifd {
  entries: Entry[];
}

const EMPTY = new Uint8Array(0);

interface TiffHeader {
  little: boolean;
  ifd0: number;
  dv: DataView;
}

function readTiffHeader(tiff: Uint8Array): TiffHeader | null {
  if (tiff.length < 8) return null;
  let little: boolean;
  if (tiff[0] === 0x49 && tiff[1] === 0x49) little = true;
  else if (tiff[0] === 0x4d && tiff[1] === 0x4d) little = false;
  else return null;
  const dv = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  if (dv.getUint16(2, little) !== 42) return null;
  return { little, ifd0: dv.getUint32(4, little), dv };
}

function parseIfd(tiff: Uint8Array, h: TiffHeader, at: number, depth: number): Ifd | null {
  if (depth > 3 || at < 8 || at + 2 > tiff.length) return null;
  const n = h.dv.getUint16(at, h.little);
  if (n > 512 || at + 2 + n * 12 + 4 > tiff.length) return null;
  const entries: Entry[] = [];
  for (let i = 0; i < n; i++) {
    const p = at + 2 + i * 12;
    const tag = h.dv.getUint16(p, h.little);
    const type = h.dv.getUint16(p + 2, h.little);
    const count = h.dv.getUint32(p + 4, h.little);
    const size = TYPE_SIZE[type];
    if (!size) continue;
    if (SUB_IFD_TAGS.has(tag) && (type === 4 || type === 13) && count === 1) {
      const sub = parseIfd(tiff, h, h.dv.getUint32(p + 8, h.little), depth + 1);
      // A pointer we cannot follow is dropped rather than left dangling at a stale offset.
      if (sub) entries.push({ tag, type: 4, count: 1, data: EMPTY, sub });
      continue;
    }
    const length = size * count;
    if (length > tiff.length) continue;
    if (length <= 4) {
      entries.push({ tag, type, count, data: tiff.subarray(p + 8, p + 8 + length) });
    } else {
      const offset = h.dv.getUint32(p + 8, h.little);
      if (offset < 8 || offset + length > tiff.length) continue;
      entries.push({ tag, type, count, data: tiff.subarray(offset, offset + length) });
    }
  }
  return { entries };
}

/* ── Serialisation ── */

const pad2 = (n: number) => n + (n % 2);
const tableSize = (ifd: Ifd) => 2 + 12 * ifd.entries.length + 4;

function overflowSize(ifd: Ifd): number {
  let size = 0;
  for (const e of ifd.entries) if (!e.sub && e.data.length > 4) size += pad2(e.data.length);
  return size;
}

function totalSize(ifd: Ifd): number {
  let size = tableSize(ifd) + overflowSize(ifd);
  for (const e of ifd.entries) if (e.sub) size += totalSize(e.sub);
  return size;
}

function writeIfd(out: Uint8Array, dv: DataView, ifd: Ifd, at: number, little: boolean): void {
  let dataAt = at + tableSize(ifd);
  let subAt = dataAt + overflowSize(ifd);
  dv.setUint16(at, ifd.entries.length, little);
  let p = at + 2;
  for (const e of ifd.entries) {
    dv.setUint16(p, e.tag, little);
    dv.setUint16(p + 2, e.type, little);
    dv.setUint32(p + 4, e.count, little);
    if (e.sub) {
      dv.setUint32(p + 8, subAt, little);
      writeIfd(out, dv, e.sub, subAt, little);
      subAt += totalSize(e.sub);
    } else if (e.data.length <= 4) {
      out.set(e.data, p + 8); // values of 4 bytes or fewer sit inline, left-justified
    } else {
      dv.setUint32(p + 8, dataAt, little);
      out.set(e.data, dataAt);
      dataAt += pad2(e.data.length);
    }
    p += 12;
  }
  dv.setUint32(p, 0, little); // no IFD1: the embedded thumbnail is not carried over
}

function sortIfd(ifd: Ifd): void {
  ifd.entries.sort((a, b) => a.tag - b.tag); // TIFF requires entries in ascending tag order
  for (const e of ifd.entries) if (e.sub) sortIfd(e.sub);
}

function serializeTiff(ifd0: Ifd, little: boolean): Uint8Array {
  sortIfd(ifd0);
  const out = new Uint8Array(8 + totalSize(ifd0));
  const dv = new DataView(out.buffer);
  out[0] = out[1] = little ? 0x49 : 0x4d;
  dv.setUint16(2, 42, little);
  dv.setUint32(4, 8, little);
  writeIfd(out, dv, ifd0, 8, little);
  return out;
}

function prune(ifd: Ifd, dropGps: boolean): void {
  ifd.entries = ifd.entries.filter((e) => !DROP_TAGS.has(e.tag) && !(dropGps && e.tag === TAG_GPS_IFD));
  for (const e of ifd.entries) if (e.sub) prune(e.sub, dropGps);
}

function setUprightOrientation(ifd0: Ifd, little: boolean): void {
  // libheif and Safari both apply the container's rotation/mirror properties while
  // decoding, so the pixels we encode are already upright. Copying the original
  // Orientation value over would make viewers rotate the JPG a second time.
  const data = new Uint8Array(2);
  new DataView(data.buffer).setUint16(0, 1, little);
  const existing = ifd0.entries.find((e) => e.tag === TAG_ORIENTATION);
  if (existing) {
    existing.type = 3;
    existing.count = 1;
    existing.data = data;
  } else {
    ifd0.entries.push({ tag: TAG_ORIENTATION, type: 3, count: 1, data });
  }
}

/**
 * Re-serialises an EXIF TIFF block so it can be embedded in a JPG:
 * drops the thumbnail, maker notes and (optionally) the GPS IFD, and forces
 * Orientation to 1. Returns null when the block is not valid TIFF.
 */
export function rewriteExifTiff(tiff: Uint8Array, opts: { dropGps: boolean }): Uint8Array | null {
  const h = readTiffHeader(tiff);
  if (!h) return null;
  const ifd0 = parseIfd(tiff, h, h.ifd0, 0);
  if (!ifd0 || ifd0.entries.length === 0) return null;
  prune(ifd0, opts.dropGps);
  setUprightOrientation(ifd0, h.little);
  return serializeTiff(ifd0, h.little);
}

/* ── Reading for display ── */

export interface ExifSummary {
  /** "2026:03:14 09:21:07" as stored, or null. */
  dateTaken: string | null;
  /** Make + Model, de-duplicated (Apple stores "Apple" + "iPhone 15 Pro"). */
  camera: string | null;
  hasGps: boolean;
}

function ascii(data: Uint8Array | undefined): string | null {
  if (!data) return null;
  let s = '';
  for (const b of data) {
    if (b === 0) break;
    s += String.fromCharCode(b);
  }
  return s.trim() || null;
}

/** What a viewer would show for this EXIF block. Used to make the result visible in the UI. */
export function readExifSummary(tiff: Uint8Array): ExifSummary | null {
  const h = readTiffHeader(tiff);
  if (!h) return null;
  const ifd0 = parseIfd(tiff, h, h.ifd0, 0);
  if (!ifd0) return null;
  const get = (ifd: Ifd | undefined, tag: number) => ifd?.entries.find((e) => e.tag === tag)?.data;
  const exifIfd = ifd0.entries.find((e) => e.tag === TAG_EXIF_IFD)?.sub;

  const make = ascii(get(ifd0, TAG_MAKE));
  const model = ascii(get(ifd0, TAG_MODEL));
  const camera = model ? (make && !model.startsWith(make) ? `${make} ${model}` : model) : make;

  return {
    dateTaken: ascii(get(exifIfd, TAG_DATE_TIME_ORIGINAL)) ?? ascii(get(ifd0, TAG_DATE_TIME)),
    camera,
    hasGps: ifd0.entries.some((e) => e.tag === TAG_GPS_IFD),
  };
}

/** "2026:03:14 09:21:07" → "2026-03-14 09:21". Returns null for anything else. */
export function formatExifDate(value: string | null): string | null {
  const m = value?.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return null;
  if (m[1] === '0000') return null; // some cameras write an all-zero placeholder
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}`;
}

/* ───────────── JPEG APP1 ───────────── */

/** "Exif\0\0" — the APP1 identifier required by JEITA CP-3451. */
const EXIF_ID = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];

/**
 * Wraps a TIFF block in an APP1 segment. Returns null when it would not fit:
 * the segment's 2-byte length field covers itself, so the TIFF block can be at
 * most 65535 − 2 − 6 = 65527 bytes.
 */
export function buildExifApp1(tiff: Uint8Array): Uint8Array | null {
  const length = 2 + EXIF_ID.length + tiff.length;
  if (length > 0xffff) return null;
  const out = new Uint8Array(2 + length);
  out[0] = 0xff;
  out[1] = 0xe1;
  out[2] = length >> 8;
  out[3] = length & 0xff;
  out.set(EXIF_ID, 4);
  out.set(tiff, 4 + EXIF_ID.length);
  return out;
}

function hasExifId(jpeg: Uint8Array, at: number): boolean {
  return EXIF_ID.every((b, i) => jpeg[at + i] === b);
}

/**
 * Inserts an APP1 segment into a JPEG, right after SOI (or after a JFIF APP0,
 * which must stay first). An existing Exif APP1 is replaced, never duplicated.
 * Non-JPEG input is returned untouched.
 */
export function insertExifIntoJpeg(jpeg: Uint8Array, app1: Uint8Array): Uint8Array {
  if (jpeg.length < 4 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return jpeg;

  let insertAt = 2;
  let existing: [number, number] | null = null;
  let p = 2;
  while (p + 4 <= jpeg.length && jpeg[p] === 0xff && jpeg[p + 1] >= 0xe0 && jpeg[p + 1] <= 0xef) {
    const segLength = u16(jpeg, p + 2);
    if (segLength < 2 || p + 2 + segLength > jpeg.length) break;
    const next = p + 2 + segLength;
    if (jpeg[p + 1] === 0xe1 && hasExifId(jpeg, p + 4)) {
      existing = [p, next];
      break;
    }
    if (jpeg[p + 1] === 0xe0) insertAt = next;
    p = next;
  }

  const [cutStart, cutEnd] = existing ?? [insertAt, insertAt];
  const out = new Uint8Array(jpeg.length - (cutEnd - cutStart) + app1.length);
  out.set(jpeg.subarray(0, cutStart), 0);
  out.set(app1, cutStart);
  out.set(jpeg.subarray(cutEnd), cutStart + app1.length);
  return out;
}

import { describe, expect, it } from 'vitest';
import {
  buildExifApp1,
  findExifTiff,
  formatExifDate,
  heicBrand,
  insertExifIntoJpeg,
  isHeicBytes,
  isHeicFile,
  outputName,
  readExifSummary,
  rewriteExifTiff,
  uniqueName,
} from './logic';

/* ───────────── Builders (test fixtures) ───────────── */

const bytes = (...v: number[]) => new Uint8Array(v);
const ascii = (s: string) => new TextEncoder().encode(s);

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const be32 = (n: number) => bytes((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
const be16 = (n: number) => bytes((n >> 8) & 0xff, n & 0xff);

/** ISOBMFF box with a 32-bit size header. */
function box(type: string, ...payload: Uint8Array[]): Uint8Array {
  const body = concat(...payload);
  return concat(be32(body.length + 8), ascii(type), body);
}

/** FullBox: a box whose payload starts with a version byte and 3 flag bytes. */
function fullBox(type: string, version: number, ...payload: Uint8Array[]): Uint8Array {
  return box(type, bytes(version, 0, 0, 0), ...payload);
}

interface HeicOptions {
  brand?: string;
  /** 0 = Exif bytes live in `mdat` at a file offset, 1 = inside the `idat` box. */
  construction?: 0 | 1;
  ilocVersion?: 0 | 1;
  /** Use an `infe` version 1 entry, which has no item_type field. */
  legacyInfe?: boolean;
  omitExifItem?: boolean;
}

/**
 * A HEIF container holding nothing but an `Exif` item, which is all
 * findExifTiff looks at. `exifPayload` is the item payload, i.e. the 4-byte
 * exif_tiff_header_offset followed by the TIFF block.
 */
function buildHeic(exifPayload: Uint8Array, opts: HeicOptions = {}): Uint8Array {
  const { brand = 'heic', construction = 0, ilocVersion = 0, legacyInfe = false, omitExifItem = false } = opts;
  const EXIF_ID = 2;

  const infe = legacyInfe
    ? fullBox('infe', 1, be16(EXIF_ID), be16(0), ascii('exif\0'))
    : fullBox('infe', 2, be16(EXIF_ID), be16(0), ascii('Exif'), ascii('\0'));
  const iinf = fullBox('iinf', 0, be16(omitExifItem ? 0 : 1), ...(omitExifItem ? [] : [infe]));

  const makeIloc = (offset: number) =>
    fullBox(
      'iloc',
      ilocVersion,
      bytes(0x44, 0x00), // offset_size = 4, length_size = 4, base_offset_size = 0, index_size/reserved = 0
      be16(1), // item_count
      be16(EXIF_ID),
      ...(ilocVersion === 1 ? [be16(construction)] : []),
      be16(0), // data_reference_index
      be16(1), // extent_count
      be32(offset),
      be32(exifPayload.length),
    );

  if (construction === 1) {
    // Offsets are relative to the start of the idat payload.
    const meta = fullBox('meta', 0, box('hdlr'), iinf, makeIloc(0), box('idat', exifPayload));
    return concat(box('ftyp', ascii(brand), be32(0), ascii(brand)), meta);
  }

  const build = (offset: number) =>
    concat(
      box('ftyp', ascii(brand), be32(0), ascii(brand)),
      fullBox('meta', 0, box('hdlr'), iinf, makeIloc(offset)),
      box('mdat', exifPayload),
    );
  // The payload sits right after the mdat header, so its file offset is everything before it.
  const prefix = build(0).length - exifPayload.length;
  return build(prefix);
}

/* ── TIFF builder ── */

interface TEntry {
  tag: number;
  type: number;
  count: number;
  data?: Uint8Array;
  sub?: TIfd;
  /** Assigned during layout. */
  at?: number;
}
interface TIfd {
  entries: TEntry[];
}

/**
 * Serialises a TIFF block with every IFD table first and every overflow value
 * afterwards — deliberately the opposite order from the production writer, and
 * with IFD0 at offset 32 rather than 8, so a round trip proves the reader
 * follows stored offsets instead of assuming a layout.
 */
function buildTiff(ifd0: TIfd, opts: { little?: boolean; ifd1?: TIfd } = {}): Uint8Array {
  const little = opts.little ?? true;
  const tables: { ifd: TIfd; at: number }[] = [];
  let cursor = 32;

  const place = (ifd: TIfd) => {
    tables.push({ ifd, at: cursor });
    cursor += 2 + 12 * ifd.entries.length + 4;
    for (const e of ifd.entries) if (e.sub) place(e.sub);
  };
  place(ifd0);
  if (opts.ifd1) place(opts.ifd1);
  const ifd1At = opts.ifd1 ? tables[tables.length - 1].at : 0;

  for (const { ifd } of tables) {
    for (const e of ifd.entries) {
      if (e.data && e.data.length > 4) {
        e.at = cursor;
        cursor += e.data.length;
      }
    }
  }

  const out = new Uint8Array(cursor).fill(0xaa, 8, 32); // filler between header and IFD0
  const dv = new DataView(out.buffer);
  out[0] = out[1] = little ? 0x49 : 0x4d;
  dv.setUint16(2, 42, little);
  dv.setUint32(4, tables[0].at, little);

  for (const { ifd, at } of tables) {
    dv.setUint16(at, ifd.entries.length, little);
    let p = at + 2;
    for (const e of ifd.entries) {
      dv.setUint16(p, e.tag, little);
      dv.setUint16(p + 2, e.type, little);
      dv.setUint32(p + 4, e.count, little);
      if (e.sub) dv.setUint32(p + 8, tables.find((t) => t.ifd === e.sub)!.at, little);
      else if (e.data && e.data.length > 4) {
        dv.setUint32(p + 8, e.at!, little);
        out.set(e.data, e.at!);
      } else if (e.data) out.set(e.data, p + 8);
      p += 12;
    }
    dv.setUint32(p, ifd === ifd0 ? ifd1At : 0, little);
  }
  return out;
}

const shortValue = (n: number, little = true) => {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, little);
  return b;
};
const longValue = (n: number, little = true) => {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, little);
  return b;
};
const rationals = (n: number) => new Uint8Array(8 * n).fill(1);

const TAG = {
  make: 0x010f,
  model: 0x0110,
  orientation: 0x0112,
  dateTime: 0x0132,
  thumbOffset: 0x0201,
  exifIfd: 0x8769,
  gpsIfd: 0x8825,
  makerNote: 0x927c,
  dateTimeOriginal: 0x9003,
};

/** A photo-like EXIF block: Apple camera, capture date, maker note, GPS and a thumbnail IFD. */
function photoTiff(little = true): Uint8Array {
  const gps: TIfd = {
    entries: [
      { tag: 0x0001, type: 2, count: 2, data: ascii('N\0') },
      { tag: 0x0002, type: 5, count: 3, data: rationals(3) },
    ],
  };
  const exif: TIfd = {
    entries: [
      { tag: TAG.dateTimeOriginal, type: 2, count: 20, data: ascii('2026:03:14 09:21:07\0') },
      { tag: TAG.makerNote, type: 7, count: 12, data: new Uint8Array(12).fill(0x5a) },
    ],
  };
  const ifd0: TIfd = {
    entries: [
      { tag: TAG.make, type: 2, count: 6, data: ascii('Apple\0') },
      { tag: TAG.model, type: 2, count: 14, data: ascii('iPhone 15 Pro\0') },
      { tag: TAG.orientation, type: 3, count: 1, data: shortValue(6, little) },
      { tag: TAG.exifIfd, type: 4, count: 1, sub: exif },
      { tag: TAG.gpsIfd, type: 4, count: 1, sub: gps },
    ],
  };
  const ifd1: TIfd = { entries: [{ tag: TAG.thumbOffset, type: 4, count: 1, data: longValue(900, little) }] };
  return buildTiff(ifd0, { little, ifd1 });
}

/** Reads IFD0's tag list and next-IFD pointer back out, for assertions. */
function inspect(tiff: Uint8Array): { tags: number[]; nextIfd: number; orientation: number | null } {
  const little = tiff[0] === 0x49;
  const dv = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const at = dv.getUint32(4, little);
  const n = dv.getUint16(at, little);
  const tags: number[] = [];
  let orientation: number | null = null;
  for (let i = 0; i < n; i++) {
    const p = at + 2 + i * 12;
    const tag = dv.getUint16(p, little);
    tags.push(tag);
    if (tag === TAG.orientation) orientation = dv.getUint16(p + 8, little);
  }
  return { tags, nextIfd: dv.getUint32(at + 2 + n * 12, little), orientation };
}

/* ───────────── Tests ───────────── */

describe('isHeicFile', () => {
  it('accepts the extensions phones produce, in any case', () => {
    for (const name of ['IMG_4821.HEIC', 'img.heic', 'photo.heif', 'DSC.HIF', '사진 1.heic'])
      expect(isHeicFile({ name, type: '' }), name).toBe(true);
  });

  it('accepts a declared HEIC mime type even with an unhelpful name', () => {
    expect(isHeicFile({ name: 'image', type: 'image/heic' })).toBe(true);
    expect(isHeicFile({ name: 'image', type: 'image/heif' })).toBe(true);
  });

  it('rejects other image files', () => {
    expect(isHeicFile({ name: 'photo.jpg', type: 'image/jpeg' })).toBe(false);
    expect(isHeicFile({ name: 'heic.png', type: 'image/png' })).toBe(false);
    expect(isHeicFile({ name: '', type: '' })).toBe(false);
  });
});

describe('outputName', () => {
  it('replaces the extension with .jpg', () => {
    expect(outputName('IMG_4821.HEIC')).toBe('IMG_4821.jpg');
    expect(outputName('holiday.photo.heif')).toBe('holiday.photo.jpg');
  });

  it('keeps unicode names intact', () => {
    expect(outputName('제주도 사진.HEIC')).toBe('제주도 사진.jpg');
    expect(outputName('📷 2026.heic')).toBe('📷 2026.jpg');
  });

  it('handles names with no extension and dotfiles', () => {
    expect(outputName('photo')).toBe('photo.jpg');
    // Nothing is left of the base name, so the download gets a usable fallback
    // instead of a hidden ".jpg" file.
    expect(outputName('')).toBe('image.jpg');
    expect(outputName('.heic')).toBe('image.jpg');
  });
});

describe('uniqueName', () => {
  it('returns the name untouched when it is free', () => {
    expect(uniqueName('a.jpg', [])).toBe('a.jpg');
  });

  it('numbers collisions before the extension', () => {
    expect(uniqueName('a.jpg', ['a.jpg'])).toBe('a-2.jpg');
    expect(uniqueName('a.jpg', ['a.jpg', 'a-2.jpg', 'a-3.jpg'])).toBe('a-4.jpg');
  });
});

describe('heicBrand / isHeicBytes', () => {
  it('reads the major brand from the ftyp box', () => {
    expect(heicBrand(buildHeic(bytes(0, 0, 0, 0, 0x49, 0x49, 42, 0)))).toBe('heic');
    expect(heicBrand(buildHeic(bytes(0, 0, 0, 0, 0x49, 0x49, 42, 0), { brand: 'mif1' }))).toBe('mif1');
  });

  it('rejects files that do not start with ftyp', () => {
    expect(heicBrand(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0))).toBe(null);
    expect(heicBrand(new Uint8Array(0))).toBe(null);
    expect(isHeicBytes(bytes(0xff, 0xd8, 0xff, 0xdb))).toBe(false);
  });

  it('rejects a HEIF-shaped file with an unrelated brand', () => {
    expect(isHeicBytes(buildHeic(bytes(0, 0, 0, 0, 0x49, 0x49, 42, 0), { brand: 'avif' }))).toBe(false);
    expect(isHeicBytes(buildHeic(bytes(0, 0, 0, 0, 0x49, 0x49, 42, 0), { brand: 'heix' }))).toBe(true);
  });
});

describe('findExifTiff', () => {
  const payload = (tiff: Uint8Array, padding = 0) => concat(be32(padding), new Uint8Array(padding).fill(0xff), tiff);

  it('finds the Exif item through iinf + iloc', () => {
    const tiff = photoTiff();
    const found = findExifTiff(buildHeic(payload(tiff)));
    expect(found).not.toBe(null);
    expect(Array.from(found!)).toEqual(Array.from(tiff));
  });

  it('honours exif_tiff_header_offset padding (ISO/IEC 23008-12 A.2.1)', () => {
    const tiff = photoTiff();
    const found = findExifTiff(buildHeic(payload(tiff, 6)));
    expect(Array.from(found!)).toEqual(Array.from(tiff));
  });

  it('reads items stored in the idat box (construction_method 1)', () => {
    const tiff = photoTiff();
    const found = findExifTiff(buildHeic(payload(tiff), { construction: 1, ilocVersion: 1 }));
    expect(Array.from(found!)).toEqual(Array.from(tiff));
  });

  it('returns null when there is no Exif item', () => {
    expect(findExifTiff(buildHeic(payload(photoTiff()), { omitExifItem: true }))).toBe(null);
  });

  it('returns null for an infe version without item_type', () => {
    expect(findExifTiff(buildHeic(payload(photoTiff()), { legacyInfe: true }))).toBe(null);
  });

  it('returns null for truncated or non-HEIC input', () => {
    const file = buildHeic(payload(photoTiff()));
    expect(findExifTiff(file.subarray(0, 40))).toBe(null);
    expect(findExifTiff(file.subarray(0, file.length - 20))).toBe(null);
    expect(findExifTiff(bytes(0xff, 0xd8, 0xff, 0xdb))).toBe(null);
    expect(findExifTiff(new Uint8Array(0))).toBe(null);
  });
});

describe('readExifSummary', () => {
  it('reads capture date, camera and GPS presence', () => {
    expect(readExifSummary(photoTiff())).toEqual({
      dateTaken: '2026:03:14 09:21:07',
      camera: 'Apple iPhone 15 Pro',
      hasGps: true,
    });
  });

  it('works for big-endian EXIF too', () => {
    expect(readExifSummary(photoTiff(false))?.camera).toBe('Apple iPhone 15 Pro');
  });

  it('does not repeat the maker when the model already contains it', () => {
    const tiff = buildTiff({
      entries: [
        { tag: TAG.make, type: 2, count: 7, data: ascii('Canon\0\0') },
        { tag: TAG.model, type: 2, count: 16, data: ascii('Canon EOS R6\0\0\0\0') },
      ],
    });
    expect(readExifSummary(tiff)?.camera).toBe('Canon EOS R6');
  });

  it('falls back to IFD0 DateTime when DateTimeOriginal is missing', () => {
    const tiff = buildTiff({
      entries: [{ tag: TAG.dateTime, type: 2, count: 20, data: ascii('2019:01:02 03:04:05\0') }],
    });
    expect(readExifSummary(tiff)?.dateTaken).toBe('2019:01:02 03:04:05');
  });

  it('returns null for a block that is not TIFF', () => {
    expect(readExifSummary(bytes(1, 2, 3, 4, 5, 6, 7, 8))).toBe(null);
    expect(readExifSummary(new Uint8Array(4))).toBe(null);
  });
});

describe('rewriteExifTiff', () => {
  it('keeps the capture date and camera', () => {
    const out = rewriteExifTiff(photoTiff(), { dropGps: true })!;
    const summary = readExifSummary(out)!;
    expect(summary.dateTaken).toBe('2026:03:14 09:21:07');
    expect(summary.camera).toBe('Apple iPhone 15 Pro');
  });

  it('drops the GPS IFD when asked and keeps it otherwise', () => {
    expect(readExifSummary(rewriteExifTiff(photoTiff(), { dropGps: true })!)!.hasGps).toBe(false);
    expect(readExifSummary(rewriteExifTiff(photoTiff(), { dropGps: false })!)!.hasGps).toBe(true);
  });

  it('forces Orientation to 1 because the decoder already rotated the pixels', () => {
    expect(inspect(photoTiff()).orientation).toBe(6);
    expect(inspect(rewriteExifTiff(photoTiff(), { dropGps: true })!).orientation).toBe(1);
  });

  it('adds Orientation even when the source had none', () => {
    const tiff = buildTiff({ entries: [{ tag: TAG.make, type: 2, count: 6, data: ascii('Apple\0') }] });
    expect(inspect(rewriteExifTiff(tiff, { dropGps: true })!).orientation).toBe(1);
  });

  it('drops the thumbnail IFD and the maker note, which would both be stale', () => {
    const out = rewriteExifTiff(photoTiff(), { dropGps: true })!;
    expect(inspect(out).nextIfd).toBe(0);
    expect(Array.from(out).join(',')).not.toContain([0x5a, 0x5a, 0x5a, 0x5a].join(','));
  });

  it('writes IFD0 entries in ascending tag order', () => {
    const { tags } = inspect(rewriteExifTiff(photoTiff(), { dropGps: false })!);
    expect(tags).toEqual([...tags].sort((a, b) => a - b));
    expect(tags).toContain(TAG.gpsIfd);
  });

  it('round-trips big-endian EXIF without changing its byte order', () => {
    const out = rewriteExifTiff(photoTiff(false), { dropGps: true })!;
    expect([out[0], out[1]]).toEqual([0x4d, 0x4d]);
    expect(readExifSummary(out)!.dateTaken).toBe('2026:03:14 09:21:07');
    expect(inspect(out).orientation).toBe(1);
  });

  it('produces a block small enough for an APP1 segment', () => {
    expect(rewriteExifTiff(photoTiff(), { dropGps: true })!.length).toBeLessThan(1024);
  });

  it('returns null for input that is not a valid TIFF block', () => {
    expect(rewriteExifTiff(new Uint8Array(0), { dropGps: true })).toBe(null);
    expect(rewriteExifTiff(bytes(0x49, 0x49, 0, 0, 0, 0, 0, 8), { dropGps: true })).toBe(null);
    expect(rewriteExifTiff(bytes(0x49, 0x49, 42, 0, 99, 0, 0, 0), { dropGps: true })).toBe(null);
  });
});

describe('formatExifDate', () => {
  it('turns EXIF date syntax into something readable', () => {
    expect(formatExifDate('2026:03:14 09:21:07')).toBe('2026-03-14 09:21');
    expect(formatExifDate('2026:03:14T09:21:07')).toBe('2026-03-14 09:21');
  });

  it('rejects placeholders and junk', () => {
    expect(formatExifDate('0000:00:00 00:00:00')).toBe(null);
    expect(formatExifDate('2026-03-14')).toBe(null);
    expect(formatExifDate('')).toBe(null);
    expect(formatExifDate(null)).toBe(null);
  });
});

describe('buildExifApp1', () => {
  it('writes the APP1 marker, self-inclusive length and "Exif\\0\\0" identifier', () => {
    const tiff = new Uint8Array(10).fill(7);
    const app1 = buildExifApp1(tiff)!;
    expect([app1[0], app1[1]]).toEqual([0xff, 0xe1]);
    expect((app1[2] << 8) | app1[3]).toBe(2 + 6 + 10);
    expect(app1.length).toBe(2 + 2 + 6 + 10);
    expect(Array.from(app1.subarray(4, 10))).toEqual([0x45, 0x78, 0x69, 0x66, 0, 0]);
  });

  it('refuses a TIFF block that cannot fit in the 2-byte length field', () => {
    expect(buildExifApp1(new Uint8Array(65527))).not.toBe(null);
    expect(buildExifApp1(new Uint8Array(65528))).toBe(null);
  });
});

describe('insertExifIntoJpeg', () => {
  const app1 = buildExifApp1(new Uint8Array(4).fill(9))!;
  const soi = bytes(0xff, 0xd8);
  const scan = bytes(0xff, 0xda, 0x00, 0x02, 0xff, 0xd9);
  const app0 = concat(bytes(0xff, 0xe0), be16(16), ascii('JFIF\0'), new Uint8Array(9));

  it('inserts directly after SOI when there is no APP0', () => {
    const out = insertExifIntoJpeg(concat(soi, scan), app1);
    expect(Array.from(out.subarray(0, 2))).toEqual([0xff, 0xd8]);
    expect(Array.from(out.subarray(2, 2 + app1.length))).toEqual(Array.from(app1));
    expect(Array.from(out.subarray(2 + app1.length))).toEqual(Array.from(scan));
  });

  it('keeps a JFIF APP0 first and inserts after it', () => {
    const out = insertExifIntoJpeg(concat(soi, app0, scan), app1);
    expect(Array.from(out.subarray(2, 2 + app0.length))).toEqual(Array.from(app0));
    expect(Array.from(out.subarray(2 + app0.length, 2 + app0.length + app1.length))).toEqual(Array.from(app1));
    expect(out.length).toBe(soi.length + app0.length + app1.length + scan.length);
  });

  it('replaces an existing Exif APP1 instead of duplicating it', () => {
    const stale = buildExifApp1(new Uint8Array(40).fill(3))!;
    const out = insertExifIntoJpeg(concat(soi, stale, scan), app1);
    expect(out.length).toBe(soi.length + app1.length + scan.length);
    expect(Array.from(out.subarray(2, 2 + app1.length))).toEqual(Array.from(app1));
  });

  it('leaves non-JPEG input untouched', () => {
    const notJpeg = bytes(0x89, 0x50, 0x4e, 0x47);
    expect(insertExifIntoJpeg(notJpeg, app1)).toBe(notJpeg);
    expect(insertExifIntoJpeg(new Uint8Array(0), app1).length).toBe(0);
  });

  it('stops at a malformed segment length rather than corrupting the file', () => {
    const broken = concat(soi, bytes(0xff, 0xe2, 0xff, 0xff), scan);
    const out = insertExifIntoJpeg(broken, app1);
    expect(Array.from(out.subarray(2, 2 + app1.length))).toEqual(Array.from(app1));
    expect(out.length).toBe(broken.length + app1.length);
  });
});

describe('the whole pipeline a converted photo goes through', () => {
  /** Pulls the TIFF block back out of a JPEG's Exif APP1 segment. */
  function extractApp1Tiff(jpeg: Uint8Array): Uint8Array | null {
    let p = 2;
    while (p + 4 <= jpeg.length && jpeg[p] === 0xff && jpeg[p + 1] >= 0xe0 && jpeg[p + 1] <= 0xef) {
      const segLength = (jpeg[p + 2] << 8) | jpeg[p + 3];
      const next = p + 2 + segLength;
      if (jpeg[p + 1] === 0xe1) return jpeg.subarray(p + 4 + 6, next);
      p = next;
    }
    return null;
  }

  const heic = concat(be32(0), photoTiff());
  const canvasJpeg = concat(bytes(0xff, 0xd8), bytes(0xff, 0xdb, 0x00, 0x02), bytes(0xff, 0xd9));

  it('carries the capture date from a HEIC container into the JPG, without the GPS', () => {
    const tiff = findExifTiff(buildHeic(heic))!;
    const app1 = buildExifApp1(rewriteExifTiff(tiff, { dropGps: true })!)!;
    const jpg = insertExifIntoJpeg(canvasJpeg, app1);

    const embedded = readExifSummary(extractApp1Tiff(jpg)!)!;
    expect(formatExifDate(embedded.dateTaken)).toBe('2026-03-14 09:21');
    expect(embedded.camera).toBe('Apple iPhone 15 Pro');
    expect(embedded.hasGps).toBe(false);
    expect(jpg.length).toBe(canvasJpeg.length + app1.length);
  });

  it('carries the GPS through when the user asks to keep everything', () => {
    const tiff = findExifTiff(buildHeic(heic))!;
    const app1 = buildExifApp1(rewriteExifTiff(tiff, { dropGps: false })!)!;
    const jpg = insertExifIntoJpeg(canvasJpeg, app1);
    expect(readExifSummary(extractApp1Tiff(jpg)!)!.hasGps).toBe(true);
  });
});

/**
 * Pure logic for html-entities — no DOM, no Preact.
 *
 * Entity data comes from the WHATWG named character reference table (entities.ts), so decoding
 * accepts the same 2,125 names a browser does, including the 93 names that stand for more than
 * one code point.
 */
import { ENCODE_TABLE, LEGACY_TABLE, NAMED_TABLE } from './entities';

export type EncodeMode = 'minimal' | 'non-ascii' | 'all';
export type EntityFormat = 'named' | 'decimal' | 'hex';

export interface EncodeOptions {
  mode: EncodeMode;
  format: EntityFormat;
  /** Write line breaks as &#10; so the text survives a single-line field. */
  lineBreaks?: boolean;
}

export interface DecodeResult {
  text: string;
  /** References that look like an entity but are not in the HTML 5 table, in first-seen order. */
  unknown: string[];
  /** Numeric references that fell outside Unicode and came back as U+FFFD. */
  invalid: number;
  /** References still present in the result, e.g. after one pass over double-encoded text. */
  remaining: number;
  /** How many references were replaced. */
  replaced: number;
}

interface Entry {
  codePoints: number[];
}

const parseTable = (table: string): Map<string, Entry> => {
  const map = new Map<string, Entry>();
  for (const pair of table.split(';')) {
    if (!pair) continue;
    const at = pair.indexOf(':');
    const name = pair.slice(0, at);
    map.set(name, {
      codePoints: pair
        .slice(at + 1)
        .split(',')
        .map((h) => parseInt(h, 16)),
    });
  }
  return map;
};

const NAMED = parseTable(NAMED_TABLE);
const LEGACY = parseTable(LEGACY_TABLE);

/** Character (as a code point key) → name used for named encoding. */
const ENCODE = new Map<string, string>();
for (const pair of ENCODE_TABLE.split(';')) {
  if (!pair) continue;
  const at = pair.lastIndexOf(':');
  const key = pair
    .slice(0, at)
    .split(',')
    .map((h) => parseInt(h, 16))
    .join(',');
  if (!ENCODE.has(key)) ENCODE.set(key, pair.slice(at + 1));
}

const NAMED_COUNT = NAMED.size;

export function namedEntityCount(): number {
  return NAMED_COUNT;
}

/** The five characters that change meaning in HTML, in the order browsers care about them. */
const MINIMAL = new Set(['&', '<', '>', '"', "'"]);

const isAlphanumeric = (cp: number): boolean => {
  return (
    (cp >= 0x30 && cp <= 0x39) || // 0-9
    (cp >= 0x41 && cp <= 0x5a) || // A-Z
    (cp >= 0x61 && cp <= 0x7a) // a-z
  );
};

const referenceFor = (cp: number, format: EntityFormat): string => {
  if (format === 'named') {
    const name = ENCODE.get(String(cp));
    if (name) return `&${name};`;
    // No HTML 4 name: decimal for Latin-1 ("&#39;" reads better than "&#x27;"), hex above it.
    return cp < 0x100 ? `&#${cp};` : `&#x${cp.toString(16).toUpperCase()};`;
  }
  if (format === 'hex') return `&#x${cp.toString(16).toUpperCase()};`;
  return `&#${cp};`;
};

export function encodeHtml(input: string, options: EncodeOptions): string {
  const { mode, format, lineBreaks = false } = options;
  let out = '';
  for (const ch of input) {
    const cp = ch.codePointAt(0)!;
    if (lineBreaks && ch === '\n') {
      out += referenceFor(10, format);
      continue;
    }
    let encode = MINIMAL.has(ch);
    if (!encode && mode !== 'minimal') {
      const keepLineBreak = ch === '\n' || ch === '\r' || ch === '\t';
      if (!keepLineBreak) {
        if (mode === 'non-ascii') encode = cp > 0x7e;
        // "all": everything that is not a letter, a digit or a space.
        else encode = cp !== 0x20 && !isAlphanumeric(cp);
      }
    }
    out += encode ? referenceFor(cp, format) : ch;
  }
  return out;
}

/**
 * Decode named, decimal and hexadecimal references the way a browser does in body text:
 * a semicolon is required for the 2,125 HTML 5 names, but the 106 legacy names also work
 * without one, and numeric references work without it.
 */
export function decodeHtml(input: string): DecodeResult {
  const unknown: string[] = [];
  let invalid = 0;
  let replaced = 0;

  const text = input.replace(
    /&(?:#[xX]([0-9a-fA-F]{1,6})|#([0-9]{1,7})|([A-Za-z][A-Za-z0-9]{1,31}))(;?)/g,
    (match, hex: string | undefined, dec: string | undefined, name: string | undefined, semi: string) => {
      if (name !== undefined) {
        const entry = semi === ';' ? NAMED.get(name) : LEGACY.get(name);
        if (entry) {
          replaced++;
          return String.fromCodePoint(...entry.codePoints);
        }
        if (semi === ';') {
          // A browser keeps the longest legacy prefix it knows: "&notit;" reads as "¬it;".
          for (let len = name.length - 1; len >= 2; len--) {
            const legacy = LEGACY.get(name.slice(0, len));
            if (legacy) {
              replaced++;
              return String.fromCodePoint(...legacy.codePoints) + name.slice(len) + ';';
            }
          }
          if (unknown.length < 20 && !unknown.includes(match)) unknown.push(match);
          return match;
        }
        return match;
      }

      const cp = hex !== undefined ? parseInt(hex, 16) : parseInt(dec!, 10);
      replaced++;
      if (cp === 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) {
        invalid++;
        return '\ufffd';
      }
      return String.fromCodePoint(cp);
    },
  );

  const remaining = countReferences(text);
  return { text, unknown, invalid, remaining, replaced };
}

/** How many references the text still contains — used to offer a second decode pass. */
export function countReferences(text: string): number {
  let count = 0;
  for (const _ of text.matchAll(/&(?:#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[A-Za-z][A-Za-z0-9]{1,31});/g)) count++;
  return count;
}

/**
 * Turn a code point into the character, for the reference table shown under the tool.
 * Kept here so the table and the encoder cannot drift apart.
 */
export function describeCodePoint(cp: number): { char: string; hex: string; decimal: string } {
  const safe = cp === 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff) ? 0xfffd : cp;
  return {
    char: String.fromCodePoint(safe),
    hex: `U+${safe.toString(16).toUpperCase().padStart(4, '0')}`,
    decimal: `&#${safe};`,
  };
}

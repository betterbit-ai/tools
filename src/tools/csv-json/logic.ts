/** Pure CSV ↔ JSON conversion helpers. No DOM or Preact. */

export type Direction = 'csv-to-json' | 'json-to-csv';
export type DelimiterChoice = 'auto' | 'comma' | 'semicolon' | 'tab' | 'pipe';
export type Indent = 2 | 4;

export type ConvertOptions = {
  delimiter: DelimiterChoice;
  hasHeader: boolean;
  inferTypes: boolean;
  indent: Indent;
};

export type Preview = { headers: string[]; rows: string[][] };

export type ConversionErrorCode =
  | 'empty-input'
  | 'unclosed-quote'
  | 'unexpected-quote'
  | 'unexpected-character-after-quote'
  | 'duplicate-header'
  | 'inconsistent-columns'
  | 'invalid-json'
  | 'json-must-be-records';

export type ConversionError = {
  code: ConversionErrorCode;
  index?: number;
  row?: number;
  expected?: number;
  actual?: number;
  header?: string;
};

export type ConversionResult =
  | { ok: true; output: string; preview: Preview; rows: number; columns: number; delimiter: string }
  | { ok: false; error: ConversionError };

const DELIMITERS: Record<Exclude<DelimiterChoice, 'auto'>, string> = {
  comma: ',',
  semicolon: ';',
  tab: '\t',
  pipe: '|',
};

const INTEGER = /^-?(?:0|[1-9]\d*)$/;
const NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

export function delimiterCharacter(choice: DelimiterChoice, input: string): string {
  return choice === 'auto' ? detectDelimiter(input) : DELIMITERS[choice];
}

/** Detect separators outside RFC 4180 quoted fields. Comma is the safe fallback. */
export function detectDelimiter(input: string): string {
  const counts = new Map<string, number>([
    [',', 0],
    [';', 0],
    ['\t', 0],
    ['|', 0],
  ]);
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') index += 1;
      else quoted = !quoted;
      continue;
    }
    if (!quoted && counts.has(char)) counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  let delimiter = ',';
  let largest = 0;
  for (const [candidate, count] of counts) {
    if (count > largest) {
      delimiter = candidate;
      largest = count;
    }
  }
  return delimiter;
}

/** Parse RFC 4180-style CSV, including CRLF, escaped quotes and quoted line breaks. */
export function parseCsv(
  input: string,
  delimiter: string,
): { ok: true; rows: string[][] } | { ok: false; error: ConversionError } {
  const source = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  if (source === '') return { ok: false, error: { code: 'empty-input' } };

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let afterQuote = false;
  let index = 0;
  const completeField = () => {
    row.push(field);
    field = '';
    afterQuote = false;
  };
  const completeRow = () => {
    completeField();
    rows.push(row);
    row = [];
  };
  const consumeNewline = () => {
    if (source[index] === '\r' && source[index + 1] === '\n') index += 2;
    else index += 1;
  };

  while (index < source.length) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 2;
        } else {
          quoted = false;
          afterQuote = true;
          index += 1;
        }
      } else {
        field += char;
        index += 1;
      }
      continue;
    }
    if (afterQuote) {
      if (char === delimiter) {
        completeField();
        index += 1;
      } else if (char === '\r' || char === '\n') {
        completeRow();
        consumeNewline();
      } else {
        return { ok: false, error: { code: 'unexpected-character-after-quote', index } };
      }
      continue;
    }
    if (char === '"') {
      if (field === '') {
        quoted = true;
        index += 1;
      } else {
        return { ok: false, error: { code: 'unexpected-quote', index } };
      }
    } else if (char === delimiter) {
      completeField();
      index += 1;
    } else if (char === '\r' || char === '\n') {
      completeRow();
      consumeNewline();
    } else {
      field += char;
      index += 1;
    }
  }

  if (quoted) return { ok: false, error: { code: 'unclosed-quote', index: source.length } };
  if (field !== '' || row.length > 0 || afterQuote) completeRow();
  return { ok: true, rows };
}

export function convert(input: string, direction: Direction, options: ConvertOptions): ConversionResult {
  if (input.trim() === '') return { ok: false, error: { code: 'empty-input' } };
  return direction === 'csv-to-json' ? csvToJson(input, options) : jsonToCsv(input, options);
}

function csvToJson(input: string, options: ConvertOptions): ConversionResult {
  const delimiter = delimiterCharacter(options.delimiter, input);
  const parsed = parseCsv(input, delimiter);
  if (!parsed.ok) return parsed;
  const rows = parsed.rows;
  if (rows.length === 0) return { ok: false, error: { code: 'empty-input' } };
  const headers = options.hasHeader ? rows[0] : rows[0].map((_, index) => String(index + 1));
  const records = options.hasHeader ? rows.slice(1) : rows;
  const seen = new Set<string>();
  for (const header of headers) {
    if (seen.has(header)) return { ok: false, error: { code: 'duplicate-header', header } };
    seen.add(header);
  }
  for (let index = 0; index < records.length; index += 1) {
    if (records[index].length !== headers.length) {
      return {
        ok: false,
        error: {
          code: 'inconsistent-columns',
          row: index + (options.hasHeader ? 2 : 1),
          expected: headers.length,
          actual: records[index].length,
        },
      };
    }
  }
  const value = options.hasHeader
    ? records.map((record) => {
        const object: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
        headers.forEach((header, index) => {
          object[header] = options.inferTypes ? inferCell(record[index]) : record[index];
        });
        return object;
      })
    : records.map((record) => record.map((cell) => (options.inferTypes ? inferCell(cell) : cell)));
  return {
    ok: true,
    output: JSON.stringify(value, null, options.indent),
    preview: { headers, rows: records },
    rows: records.length,
    columns: headers.length,
    delimiter,
  };
}

function jsonToCsv(input: string, options: ConvertOptions): ConversionResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input.charCodeAt(0) === 0xfeff ? input.slice(1) : input);
  } catch {
    return { ok: false, error: { code: 'invalid-json' } };
  }
  const records = Array.isArray(parsed) ? parsed : [parsed];
  if (!records.every(isRecord)) return { ok: false, error: { code: 'json-must-be-records' } };
  const headers: string[] = [];
  const known = new Set<string>();
  for (const record of records)
    for (const key of Object.keys(record))
      if (!known.has(key)) {
        known.add(key);
        headers.push(key);
      }
  // JSON punctuation is not a delimiter hint. In this direction, Auto means
  // conventional comma-separated output, not a count of JSON commas.
  const delimiter = options.delimiter === 'auto' ? ',' : delimiterCharacter(options.delimiter, input);
  const previewRows = records.map((record) => headers.map((header) => cellText(record[header])));
  const csvRows = [headers, ...previewRows].map((row) => row.map((cell) => quoteCsv(cell, delimiter)).join(delimiter));
  return {
    ok: true,
    output: csvRows.join('\r\n'),
    preview: { headers, rows: previewRows },
    rows: records.length,
    columns: headers.length,
    delimiter,
  };
}

function inferCell(cell: string): unknown {
  if (cell === 'true') return true;
  if (cell === 'false') return false;
  if (cell === 'null') return null;
  if (!NUMBER.test(cell)) return cell;
  const numeric = Number(cell);
  if (!Number.isFinite(numeric) || (INTEGER.test(cell) && !Number.isSafeInteger(numeric))) return cell;
  return numeric;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export function quoteCsv(value: string, delimiter = ','): string {
  return /["\r\n]/.test(value) || value.includes(delimiter) ? `"${value.replaceAll('"', '""')}"` : value;
}

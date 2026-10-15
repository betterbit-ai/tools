import { describe, expect, it } from 'vitest';
import { convert, detectDelimiter, parseCsv, quoteCsv, type ConvertOptions } from './logic';

const csvOptions: ConvertOptions = { delimiter: 'auto', hasHeader: true, inferTypes: false, indent: 2 };

describe('CSV parsing', () => {
  it('parses RFC 4180 quotes, CRLF, embedded commas, line breaks and escaped quotes', () => {
    expect(parseCsv('name,note\r\nAda,"Hello,\r\n""world"""', ',')).toEqual({
      ok: true,
      rows: [
        ['name', 'note'],
        ['Ada', 'Hello,\r\n"world"'],
      ],
    });
  });

  it('keeps Korean and emoji text intact and removes a UTF-8 BOM', () => {
    const result = convert('\uFEFF이름,인사\n민수,안녕하세요 👋', 'csv-to-json', csvOptions);
    expect(result.ok).toBe(true);
    if (result.ok) expect(JSON.parse(result.output)).toEqual([{ 이름: '민수', 인사: '안녕하세요 👋' }]);
  });

  it('detects separators outside quoted cells', () => {
    expect(detectDelimiter('name;note\nAda;"comma, stays text"')).toBe(';');
    expect(detectDelimiter('a\tb\n1\t2')).toBe('\t');
  });

  it('does not add a row for a trailing newline but keeps a trailing empty cell', () => {
    expect(parseCsv('a,b\n1,\n', ',')).toEqual({
      ok: true,
      rows: [
        ['a', 'b'],
        ['1', ''],
      ],
    });
  });

  it('rejects malformed quotes rather than silently shifting columns', () => {
    expect(parseCsv('a,b\n"unclosed,1', ',')).toMatchObject({ ok: false, error: { code: 'unclosed-quote' } });
    expect(parseCsv('a,b\nAda"x,1', ',')).toMatchObject({ ok: false, error: { code: 'unexpected-quote' } });
    expect(parseCsv('a,b\n"Ada"x,1', ',')).toMatchObject({
      ok: false,
      error: { code: 'unexpected-character-after-quote' },
    });
  });
});

describe('CSV to JSON', () => {
  it('outputs objects from headers and preserves leading zeros by default', () => {
    const result = convert('id,active\n007,true', 'csv-to-json', csvOptions);
    expect(result.ok).toBe(true);
    if (result.ok) expect(JSON.parse(result.output)).toEqual([{ id: '007', active: 'true' }]);
  });

  it('infers only safe JSON values when requested', () => {
    const result = convert('id,count,enabled,empty,huge\n007,1e3,true,null,9007199254740993', 'csv-to-json', {
      ...csvOptions,
      inferTypes: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(JSON.parse(result.output)).toEqual([
        { id: '007', count: 1000, enabled: true, empty: null, huge: '9007199254740993' },
      ]);
  });

  it('supports headerless CSV as an array of arrays', () => {
    const result = convert('서울,37\n부산,22', 'csv-to-json', { ...csvOptions, hasHeader: false });
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(JSON.parse(result.output)).toEqual([
        ['서울', '37'],
        ['부산', '22'],
      ]);
  });

  it('reports duplicate headers and inconsistent row widths', () => {
    expect(convert('id,id\n1,2', 'csv-to-json', csvOptions)).toMatchObject({
      ok: false,
      error: { code: 'duplicate-header', header: 'id' },
    });
    expect(convert('id,name\n1', 'csv-to-json', csvOptions)).toMatchObject({
      ok: false,
      error: { code: 'inconsistent-columns', row: 2, expected: 2, actual: 1 },
    });
  });
});

describe('JSON to CSV', () => {
  it('collects keys that first appear in later rows and serializes nested values in one cell', () => {
    const result = convert('[{"id":"001","name":"Ada"},{"id":"002","tags":["ko","en"]}]', 'json-to-csv', csvOptions);
    expect(result).toMatchObject({
      ok: true,
      output: 'id,name,tags\r\n001,Ada,\r\n002,,"[""ko"",""en""]"',
      preview: {
        headers: ['id', 'name', 'tags'],
        rows: [
          ['001', 'Ada', ''],
          ['002', '', '["ko","en"]'],
        ],
      },
    });
  });

  it('accepts one object, quotes delimiter/newline cells, and keeps unicode text', () => {
    const result = convert('{"도시":"서울, 대한민국","note":"첫 줄\\n😀"}', 'json-to-csv', csvOptions);
    expect(result).toMatchObject({ ok: true, output: '도시,note\r\n"서울, 대한민국","첫 줄\n😀"' });
    expect(quoteCsv('a;b', ';')).toBe('"a;b"');
  });

  it('uses comma for automatic JSON output instead of detecting punctuation inside JSON', () => {
    const result = convert('[{"note":"a,b,c"}]', 'json-to-csv', csvOptions);
    expect(result).toMatchObject({ ok: true, output: 'note\r\n"a,b,c"', delimiter: ',' });
  });

  it('rejects invalid JSON and arrays with primitive entries', () => {
    expect(convert('{broken', 'json-to-csv', csvOptions)).toMatchObject({ ok: false, error: { code: 'invalid-json' } });
    expect(convert('[{"id":1}, 2]', 'json-to-csv', csvOptions)).toMatchObject({
      ok: false,
      error: { code: 'json-must-be-records' },
    });
  });

  it('handles many rows without partial conversion', () => {
    const input = JSON.stringify(Array.from({ length: 20_000 }, (_, index) => ({ id: index, text: `행 ${index}` })));
    expect(convert(input, 'json-to-csv', csvOptions)).toMatchObject({ ok: true, rows: 20_000, columns: 2 });
  });
});

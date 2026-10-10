import { describe, expect, it } from 'vitest';
import { diffText, tokenize } from './logic';

/** Reconstructs the "after" text by concatenating equal + insert chunks (should equal b, normalized). */
function rebuildAfter(chunks: { op: string; value: string }[]): string {
  return chunks
    .filter((c) => c.op !== 'delete')
    .map((c) => c.value)
    .join('');
}

/** Reconstructs the "before" text by concatenating equal + delete chunks (should equal a, normalized). */
function rebuildBefore(chunks: { op: string; value: string }[]): string {
  return chunks
    .filter((c) => c.op !== 'insert')
    .map((c) => c.value)
    .join('');
}

describe('tokenize', () => {
  it('returns no tokens for empty text', () => {
    expect(tokenize('', 'line')).toEqual([]);
    expect(tokenize('', 'word')).toEqual([]);
    expect(tokenize('', 'char')).toEqual([]);
  });

  it('splits lines keeping their line break so tokens rejoin losslessly', () => {
    expect(tokenize('a\nb\nc', 'line')).toEqual(['a\n', 'b\n', 'c']);
    expect(tokenize('a\nb\n', 'line')).toEqual(['a\n', 'b\n']);
  });

  it('keeps whitespace as its own word token so words rejoin losslessly', () => {
    const tokens = tokenize('hello world', 'word');
    expect(tokens.join('')).toBe('hello world');
    expect(tokens).toContain(' ');
  });

  it('segments graphemes, not raw UTF-16 code units (surrogate pairs stay intact)', () => {
    const familyEmoji = '👨‍👩‍👧'; // ZWJ sequence: many UTF-16 code units, one grapheme
    const tokens = tokenize(`a${familyEmoji}b`, 'char');
    expect(tokens).toEqual(['a', familyEmoji, 'b']);
  });

  it('normalizes to NFC, so NFD-decomposed Hangul tokenizes the same as precomposed', () => {
    const nfc = '한글'.normalize('NFC');
    const nfd = '한글'.normalize('NFD');
    expect(tokenize(nfc, 'char')).toEqual(tokenize(nfd, 'char'));
  });
});

describe('diffText', () => {
  it('reports identical for equal strings', () => {
    const result = diffText('hello', 'hello', 'char');
    expect(result.identical).toBe(true);
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
    expect(result.similarity).toBe(100);
  });

  it('treats two empty strings as identical', () => {
    const result = diffText('', '', 'line');
    expect(result.identical).toBe(true);
    expect(result.chunks).toEqual([]);
    expect(result.similarity).toBe(100);
  });

  it('diffs an insertion-only change', () => {
    const result = diffText('abc', 'abXc', 'char');
    expect(result.identical).toBe(false);
    expect(result.added).toBe(1);
    expect(result.removed).toBe(0);
    expect(rebuildBefore(result.chunks)).toBe('abc');
    expect(rebuildAfter(result.chunks)).toBe('abXc');
  });

  it('diffs a deletion-only change', () => {
    const result = diffText('abXc', 'abc', 'char');
    expect(result.added).toBe(0);
    expect(result.removed).toBe(1);
  });

  it('diffs a full replacement with no common tokens', () => {
    const result = diffText('abc', 'xyz', 'char');
    expect(result.unchanged).toBe(0);
    expect(result.removed).toBe(3);
    expect(result.added).toBe(3);
    expect(result.similarity).toBe(0);
  });

  it('word mode changes only the edited word, not the whole line', () => {
    const result = diffText('the quick brown fox', 'the quick red fox', 'word');
    const changed = result.chunks.filter((c) => c.op !== 'equal').map((c) => c.value);
    expect(changed).toEqual(['brown', 'red']);
  });

  it('char mode highlights a single changed character inside a word', () => {
    const result = diffText('color', 'colour', 'char');
    expect(result.added).toBe(1);
    expect(result.removed).toBe(0);
    expect(rebuildAfter(result.chunks)).toBe('colour');
  });

  it('line mode isolates a single changed line in a multi-line text', () => {
    const a = 'line one\nline two\nline three';
    const b = 'line one\nline TWO\nline three';
    const result = diffText(a, b, 'line');
    const removedLines = result.chunks.filter((c) => c.op === 'delete').map((c) => c.value);
    const addedLines = result.chunks.filter((c) => c.op === 'insert').map((c) => c.value);
    expect(removedLines).toEqual(['line two\n']);
    expect(addedLines).toEqual(['line TWO\n']);
  });

  it('is accurate for Korean word-level diff: only the changed eojeol is flagged', () => {
    const result = diffText('나는 학교에 간다', '나는 집에 간다', 'word');
    expect(rebuildBefore(result.chunks)).toBe('나는 학교에 간다');
    expect(rebuildAfter(result.chunks)).toBe('나는 집에 간다');
    expect(result.removed).toBeGreaterThan(0);
    expect(result.added).toBeGreaterThan(0);
  });

  it('treats NFC and NFD Korean input as identical (jamo-decomposition-safe)', () => {
    const composed = '안녕하세요'.normalize('NFC');
    const decomposed = '안녕하세요'.normalize('NFD');
    const result = diffText(composed, decomposed, 'char');
    expect(result.identical).toBe(true);
  });

  it('flags only the single Hangul syllable that actually differs, not the whole word', () => {
    // '갔다' vs '간다' differ in exactly one syllable (갔 vs 간); '다' is unchanged.
    const result = diffText('어제 갔다', '어제 간다', 'char');
    expect(result.removed).toBe(1);
    expect(result.added).toBe(1);
  });

  it('computes similarity as a percentage between 0 and 100', () => {
    const result = diffText('abcdefgh', 'abcdXYZh', 'char');
    expect(result.similarity).toBeGreaterThan(0);
    expect(result.similarity).toBeLessThan(100);
  });

  it('handles one side empty', () => {
    const result = diffText('', 'new text', 'word');
    expect(result.removed).toBe(0);
    expect(result.added).toBeGreaterThan(0);
    expect(result.identical).toBe(false);
  });

  it('handles large repeated input without mismatched lengths', () => {
    const a = 'line\n'.repeat(500) + 'tail';
    const b = 'line\n'.repeat(500) + 'TAIL';
    const result = diffText(a, b, 'line');
    expect(rebuildBefore(result.chunks)).toBe(a);
    expect(rebuildAfter(result.chunks)).toBe(b);
  });
});

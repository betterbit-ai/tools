/**
 * Pure diff logic for text-diff — no DOM, no Preact. Everything testable lives here.
 *
 * Tokens are produced so that `tokens.join('')` reconstructs the (NFC-normalized) input
 * exactly — whitespace and punctuation are kept as tokens, not discarded. That lets the
 * diff be rendered by simply concatenating chunks, with no separator logic.
 */

export type DiffMode = 'line' | 'word' | 'char';
export type DiffOp = 'equal' | 'insert' | 'delete';

export interface DiffChunk {
  op: DiffOp;
  value: string;
}

export interface DiffResult {
  chunks: DiffChunk[];
  /** Token counts (line/word/grapheme, depending on mode). */
  added: number;
  removed: number;
  unchanged: number;
  identical: boolean;
  /** 0–100. 2 × unchanged ÷ (lenA + lenB), the usual "percent similar" measure. */
  similarity: number;
}

const graphemeSeg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const wordSeg = new Intl.Segmenter(undefined, { granularity: 'word' });

/**
 * Splits text into tokens for the given granularity, after Unicode-normalizing to NFC.
 * Normalizing first means visually identical Korean text compares as identical even when
 * one side has jamo decomposed into separate combining characters (NFD) — e.g. text pasted
 * from macOS, which historically normalizes Hangul filenames and clipboard text to NFD.
 * Grapheme segmentation (not raw UTF-16 indexing) keeps combining jamo, emoji and surrogate
 * pairs intact as single units instead of splitting them mid-character.
 */
export function tokenize(text: string, mode: DiffMode): string[] {
  const normalized = text.normalize('NFC');
  if (normalized === '') return [];
  if (mode === 'line') return normalized.split(/(?<=\r\n|\r|\n)/);
  if (mode === 'word') return [...wordSeg.segment(normalized)].map((s) => s.segment);
  return [...graphemeSeg.segment(normalized)].map((s) => s.segment);
}

/**
 * Myers' O(ND) shortest-edit-script diff over generic tokens. Linear in input size when
 * the two token arrays are mostly similar (the common case for comparing text revisions),
 * unlike an O(N×M) table which would need gigabytes for two long, very different inputs.
 */
interface TokenDiff {
  chunks: DiffChunk[];
  added: number;
  removed: number;
  unchanged: number;
}

function diffTokens(a: string[], b: string[]): TokenDiff {
  const n = a.length;
  const m = b.length;
  if (n === 0 && m === 0) return { chunks: [], added: 0, removed: 0, unchanged: 0 };

  const max = n + m;
  const v = new Map<number, number>([[1, 0]]);
  const trace: Map<number, number>[] = [];
  let found = false;

  for (let d = 0; d <= max && !found; d++) {
    for (let k = -d; k <= d; k += 2) {
      const vkm1 = v.get(k - 1);
      const vkp1 = v.get(k + 1);
      let x: number;
      if (k === -d || (k !== d && (vkm1 ?? -1) < (vkp1 ?? -1))) {
        x = vkp1 ?? 0;
      } else {
        x = (vkm1 ?? 0) + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v.set(k, x);
      if (x >= n && y >= m) found = true;
    }
    trace.push(new Map(v));
    if (found) break;
  }

  // Backtrack through the recorded "frontiers" to recover the edit script.
  const edits: { op: DiffOp; a?: number; b?: number }[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const frontier = trace[d];
    const k = x - y;
    const vkm1 = frontier.get(k - 1);
    const vkp1 = frontier.get(k + 1);
    const prevK = k === -d || (k !== d && (vkm1 ?? -1) < (vkp1 ?? -1)) ? k + 1 : k - 1;
    const prevX = frontier.get(prevK) ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      edits.push({ op: 'equal', a: x - 1, b: y - 1 });
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) edits.push({ op: 'insert', b: y - 1 });
      else edits.push({ op: 'delete', a: x - 1 });
    }
    x = prevX;
    y = prevY;
  }
  edits.reverse();

  // Merge consecutive same-op tokens into chunks for display, counting tokens as we go.
  const chunks: DiffChunk[] = [];
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const e of edits) {
    const value = e.op === 'insert' ? b[e.b!] : a[e.a!];
    if (e.op === 'insert') added++;
    else if (e.op === 'delete') removed++;
    else unchanged++;

    const last = chunks[chunks.length - 1];
    if (last && last.op === e.op) last.value += value;
    else chunks.push({ op: e.op, value });
  }
  return { chunks, added, removed, unchanged };
}

export function diffText(a: string, b: string, mode: DiffMode): DiffResult {
  const tokensA = tokenize(a, mode);
  const tokensB = tokenize(b, mode);
  const { chunks, added, removed, unchanged } = diffTokens(tokensA, tokensB);

  const identical = added === 0 && removed === 0;
  const totalLen = tokensA.length + tokensB.length;
  const similarity = totalLen === 0 ? 100 : Math.round(((2 * unchanged) / totalLen) * 100);

  return { chunks, added, removed, unchanged, identical, similarity };
}

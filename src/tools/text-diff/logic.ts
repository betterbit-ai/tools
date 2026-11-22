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

/**
 * How much of the edit-script search one comparison may do, measured in recorded frontier
 * entries (the diff's working set). Two long, almost entirely different inputs need
 * O((n+m)²) of them — gigabytes for a 30,000-character compare — so the search stops at a
 * budget the page can afford and the caller falls back to a coarser granularity. Comparisons
 * of the same document with real edits stay far below this (a rewritten 500-line page needs
 * a few hundred entries).
 */
export const DIFF_WORK_BUDGET = 1_000_000;

/**
 * Myers' O(ND) diff as a generator: it yields the fraction of `budget` used after each
 * frontier round, so a caller can repaint progress and let the browser breathe between rounds.
 * Returns null when the budget runs out first.
 */
function* diffTokensSteps(a: string[], b: string[], budget: number): Generator<number, TokenDiff | null> {
  const n = a.length;
  const m = b.length;
  if (n === 0 && m === 0) return { chunks: [], added: 0, removed: 0, unchanged: 0 };

  const max = n + m;
  const v = new Map<number, number>([[1, 0]]);
  const trace: Map<number, number>[] = [];
  let found = false;
  let work = 0;

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
    work += v.size;
    // A round that finished the search keeps its exact result even past the budget: the memory is
    // already spent, and downgrading a comparison that succeeded would be a lie about the output.
    if (!found && work > budget) return null;
    yield Math.min(1, work / budget);
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

function toResult(diff: TokenDiff, lengthA: number, lengthB: number): DiffResult {
  const { chunks, added, removed, unchanged } = diff;
  const identical = added === 0 && removed === 0;
  const totalLen = lengthA + lengthB;
  const similarity = totalLen === 0 ? 100 : Math.round(((2 * unchanged) / totalLen) * 100);
  return { chunks, added, removed, unchanged, identical, similarity };
}

export interface DiffRun {
  result: DiffResult;
  /**
   * The granularity the chunks were really computed in. Equal to the requested mode unless that
   * comparison would have needed more memory than the budget allows, in which case the texts were
   * compared line by line — the caller must say so rather than present it as the requested mode.
   */
  computedIn: DiffMode;
}

/**
 * Asynchronous diff: yields progress and can be abandoned between rounds. When the requested
 * granularity would exceed `budget`, it falls back to line granularity and reports `computedIn`,
 * so a very large comparison degrades visibly instead of freezing or crashing the page.
 * Returns null only when even a line-level comparison exceeds the budget.
 */
export function* diffTextSteps(
  a: string,
  b: string,
  mode: DiffMode,
  budget: number = DIFF_WORK_BUDGET,
): Generator<number, DiffRun | null> {
  const tokensA = tokenize(a, mode);
  const tokensB = tokenize(b, mode);
  const fine = yield* diffTokensSteps(tokensA, tokensB, budget);
  if (fine) return { result: toResult(fine, tokensA.length, tokensB.length), computedIn: mode };

  if (mode === 'line') return null;
  const linesA = tokenize(a, 'line');
  const linesB = tokenize(b, 'line');
  const coarse = yield* diffTokensSteps(linesA, linesB, budget);
  if (!coarse) return null;
  return { result: toResult(coarse, linesA.length, linesB.length), computedIn: 'line' };
}

/** Synchronous diff for small inputs and unit tests — never degrades, so it can be slow. */
export function diffText(a: string, b: string, mode: DiffMode): DiffResult {
  const run = diffTextSteps(a, b, mode, Number.POSITIVE_INFINITY);
  let step = run.next();
  while (!step.done) step = run.next();
  const result = step.value;
  if (!result) throw new RangeError('diff budget exhausted');
  return result.result;
}

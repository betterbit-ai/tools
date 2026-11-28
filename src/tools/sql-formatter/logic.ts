/**
 * Pure logic for sql-formatter — no DOM, no Preact.
 *
 * The formatter only moves whitespace and changes the case of reserved words. Everything else,
 * including string literals, quoted identifiers and comments, is copied token for token, and the
 * result is checked against the input before it is shown: if any token other than a keyword's
 * case would change, the tool hands back the original SQL with the reason.
 */
import type { Locale } from '../../i18n/locales';

export type Dialect = 'standard' | 'postgres' | 'mysql' | 'tsql' | 'sqlite' | 'bigquery';
export type KeywordCase = 'upper' | 'lower' | 'preserve';
export type IndentChoice = '2' | '4' | 'tab';

export interface FormatOptions {
  dialect: Dialect;
  keywordCase: KeywordCase;
  indent: IndentChoice;
}

export type TokenKind = 'word' | 'string' | 'ident' | 'number' | 'punct' | 'comment' | 'param';

export interface Token {
  kind: TokenKind;
  value: string;
}

export type FormatProblem = 'unterminated-string' | 'unbalanced-parens' | 'verification-failed';

export interface FormatResult {
  ok: boolean;
  text: string;
  problem?: FormatProblem;
  /** Byte-size saving, used by the summary line. */
  inputLength: number;
  outputLength: number;
}

const WORD_START = /[A-Za-z_\u00aa-\uffff]/;
const WORD_PART = /[A-Za-z0-9_$\u00aa-\uffff]/;

const OPERATORS = ['->>', '->', '::', '||', '>=', '<=', '<>', '!=', '=>', ':=', '~~', '!~', '..'];
const SINGLE_PUNCT = new Set([
  '(',
  ')',
  ',',
  '.',
  ';',
  '=',
  '<',
  '>',
  '+',
  '-',
  '*',
  '/',
  '%',
  '~',
  '^',
  '&',
  '|',
  '?',
  '[',
  ']',
  '{',
  '}',
  ':',
]);

const isDigit = (c: string) => c >= '0' && c <= '9';

/**
 * Split SQL into tokens. Comments and whitespace are kept as tokens (whitespace is dropped)
 * so that formatting can put them back deliberately instead of guessing.
 */
export function tokenize(sql: string, dialect: Dialect): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const backslashEscapes = dialect === 'mysql' || dialect === 'bigquery';
  const hashComments = dialect === 'mysql' || dialect === 'bigquery';
  const bracketIdents = dialect === 'tsql' || dialect === 'sqlite';
  const dollarQuotes = dialect === 'postgres';
  const backtickIdents = dialect === 'mysql' || dialect === 'bigquery';

  while (i < sql.length) {
    const c = sql[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    // -- line comment
    if (c === '-' && sql[i + 1] === '-') {
      const end = sql.indexOf('\n', i);
      const stop = end === -1 ? sql.length : end;
      tokens.push({ kind: 'comment', value: sql.slice(i, stop) });
      i = stop;
      continue;
    }
    if (hashComments && c === '#') {
      const end = sql.indexOf('\n', i);
      const stop = end === -1 ? sql.length : end;
      tokens.push({ kind: 'comment', value: sql.slice(i, stop) });
      i = stop;
      continue;
    }
    if (c === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      const stop = end === -1 ? sql.length : end + 2;
      tokens.push({ kind: 'comment', value: sql.slice(i, stop) });
      i = stop;
      continue;
    }
    if (c === "'") {
      let j = i + 1;
      let closed = false;
      while (j < sql.length) {
        if (sql[j] === '\\' && backslashEscapes) {
          j += 2;
          continue;
        }
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") {
            j += 2;
            continue;
          }
          j++;
          closed = true;
          break;
        }
        j++;
      }
      tokens.push({ kind: 'string', value: sql.slice(i, closed ? j : sql.length) });
      i = closed ? j : sql.length;
      continue;
    }
    if (dollarQuotes && c === '$' && /^\$[A-Za-z_]*\$/.test(sql.slice(i))) {
      const tag = /^\$[A-Za-z_]*\$/.exec(sql.slice(i))![0];
      const end = sql.indexOf(tag, i + tag.length);
      const stop = end === -1 ? sql.length : end + tag.length;
      tokens.push({ kind: 'string', value: sql.slice(i, stop) });
      i = stop;
      continue;
    }
    if (c === '"' || (backtickIdents && c === '`') || (bracketIdents && c === '[')) {
      const close = c === '[' ? ']' : c;
      let j = i + 1;
      let closed = false;
      while (j < sql.length) {
        if (sql[j] === close && sql[j + 1] === close) {
          j += 2;
          continue;
        }
        if (sql[j] === close) {
          j++;
          closed = true;
          break;
        }
        j++;
      }
      tokens.push({ kind: 'ident', value: sql.slice(i, closed ? j : sql.length) });
      i = closed ? j : sql.length;
      continue;
    }
    if (c === ':' && WORD_START.test(sql[i + 1] ?? '')) {
      let j = i + 1;
      while (j < sql.length && WORD_PART.test(sql[j])) j++;
      tokens.push({ kind: 'param', value: sql.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '@' && WORD_PART.test(sql[i + 1] ?? '')) {
      let j = i + 1;
      while (j < sql.length && WORD_PART.test(sql[j])) j++;
      tokens.push({ kind: 'param', value: sql.slice(i, j) });
      i = j;
      continue;
    }
    if (isDigit(c) || (c === '.' && isDigit(sql[i + 1] ?? ''))) {
      const match = /^(?:0[xX][0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?)/.exec(sql.slice(i))!;
      tokens.push({ kind: 'number', value: match[0] });
      i += match[0].length;
      continue;
    }
    if (WORD_START.test(c)) {
      let j = i + 1;
      while (j < sql.length && WORD_PART.test(sql[j])) j++;
      tokens.push({ kind: 'word', value: sql.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '$' && isDigit(sql[i + 1] ?? '')) {
      let j = i + 1;
      while (j < sql.length && isDigit(sql[j])) j++;
      tokens.push({ kind: 'param', value: sql.slice(i, j) });
      i = j;
      continue;
    }
    const operator = OPERATORS.find((op) => sql.startsWith(op, i));
    if (operator) {
      tokens.push({ kind: 'punct', value: operator });
      i += operator.length;
      continue;
    }
    if (SINGLE_PUNCT.has(c)) {
      tokens.push({ kind: 'punct', value: c });
      i++;
      continue;
    }
    // Anything else is copied unchanged as a one-character token so nothing is ever dropped.
    tokens.push({ kind: 'punct', value: c });
    i++;
  }
  return tokens;
}

/** Reserved words whose case the formatter may change. Column and table names are never in here. */
const KEYWORDS = new Set(
  `SELECT FROM WHERE GROUP BY ORDER HAVING LIMIT OFFSET FETCH NEXT ROWS ONLY UNION ALL INTERSECT EXCEPT
  DISTINCT AS ON USING JOIN INNER LEFT RIGHT FULL OUTER CROSS NATURAL APPLY INSERT INTO VALUES UPDATE SET
  DELETE RETURNING WITH RECURSIVE CASE WHEN THEN ELSE END AND OR NOT IS NULL IN EXISTS BETWEEN LIKE ILIKE
  ASC DESC NULLS FIRST LAST CREATE TABLE VIEW INDEX ALTER DROP ADD COLUMN PRIMARY KEY FOREIGN REFERENCES
  UNIQUE DEFAULT CHECK CONSTRAINT BEGIN COMMIT ROLLBACK TRANSACTION GRANT REVOKE IF REPLACE CONFLICT DO
  NOTHING LATERAL OVER PARTITION WINDOW TRUE FALSE TOP GO CONFLICT MATERIALIZED CASCADE RESTRICT`
    .split(/\s+/)
    .filter(Boolean),
);

const MULTI_WORD: string[][] = [
  ['GROUP', 'BY'],
  ['ORDER', 'BY'],
  ['INSERT', 'INTO'],
  ['DELETE', 'FROM'],
  ['UNION', 'ALL'],
  ['ON', 'CONFLICT'],
  ['LEFT', 'OUTER', 'JOIN'],
  ['RIGHT', 'OUTER', 'JOIN'],
  ['FULL', 'OUTER', 'JOIN'],
  ['LEFT', 'JOIN'],
  ['RIGHT', 'JOIN'],
  ['FULL', 'JOIN'],
  ['INNER', 'JOIN'],
  ['CROSS', 'JOIN'],
  ['NATURAL', 'JOIN'],
  ['PARTITION', 'BY'],
];

/** Join multi-word keywords ("GROUP" "BY") into one token so a line never breaks between them. */
export function combineKeywords(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.kind !== 'word') {
      out.push(token);
      continue;
    }
    const upper = token.value.toUpperCase();
    let matched = false;
    for (const phrase of MULTI_WORD) {
      if (phrase[0] !== upper) continue;
      const window = tokens.slice(i, i + phrase.length);
      if (window.length !== phrase.length) continue;
      if (!window.every((t, idx) => t.kind === 'word' && t.value.toUpperCase() === phrase[idx])) continue;
      out.push({ kind: 'word', value: window.map((t) => t.value).join(' ') });
      i += phrase.length - 1;
      matched = true;
      break;
    }
    if (!matched) out.push(token);
  }
  return out;
}

const CLAUSE_STARTERS = new Set([
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'FETCH',
  'UNION',
  'UNION ALL',
  'INTERSECT',
  'EXCEPT',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'RETURNING',
  'WITH',
  'ON CONFLICT',
  'WINDOW',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'NATURAL JOIN',
  'LEFT OUTER JOIN',
  'RIGHT OUTER JOIN',
  'FULL OUTER JOIN',
  'ON',
  'USING',
]);

const CONDITION_CLAUSES = new Set(['WHERE', 'ON', 'HAVING', 'ON CONFLICT']);

const keywordCaseOf = (value: string, mode: KeywordCase): string => {
  if (mode === 'upper') return value.toUpperCase();
  if (mode === 'lower') return value.toLowerCase();
  return value;
};

const isKeyword = (token: Token): boolean =>
  token.kind === 'word' && token.value.split(' ').every((part) => KEYWORDS.has(part.toUpperCase()));

/** Tokens that matter for the safety check: comments can be removed on purpose, whitespace never was a token. */
const comparable = (tokens: Token[]): Token[] => tokens.filter((t) => t.kind !== 'comment');

function sameTokens(a: Token[], b: Token[], keywordCase: KeywordCase): boolean {
  const left = comparable(a);
  const right = comparable(b);
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i++) {
    const x = left[i];
    const y = right[i];
    const bothWords = x.kind === 'word' && y.kind === 'word';
    if (bothWords) {
      const keyword = x.value.split(' ').every((part) => KEYWORDS.has(part.toUpperCase()));
      if (keyword && keywordCase !== 'preserve') continue;
      if (x.value !== y.value) return false;
      continue;
    }
    if (x.kind !== y.kind || x.value !== y.value) return false;
  }
  return true;
}

const indentUnit = (choice: IndentChoice): string => (choice === 'tab' ? '\t' : ' '.repeat(Number(choice)));

interface RenderState {
  lines: string[];
  line: string;
  lineIndent: number;
  depth: number;
  clause: string;
  clauseDepth: number;
  /** Bracket nesting, used to tell a list item from a comma inside a function call. */
  parenDepth: number;
  clauseParen: number;
  caseIndents: number[];
  subqueryDepths: Set<number>;
  /** Clause context saved when a subquery opens, restored when it closes. */
  savedClauses: { clause: string; clauseDepth: number; clauseParen: number }[];
  /** True when the previous token was a word that names a table, so a following ( needs a space. */
  prevWasTable: boolean;
  prevWasKeyword: boolean;
  afterTableKeyword: boolean;
}

const TABLE_KEYWORDS = new Set([
  'FROM',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'NATURAL JOIN',
  'LEFT OUTER JOIN',
  'RIGHT OUTER JOIN',
  'FULL OUTER JOIN',
  'INSERT INTO',
  'INTO',
  'TABLE',
  'UPDATE',
  'DELETE FROM',
  'REFERENCES',
]);

/** Does the select list that starts at `start` hold more than one item? */
function selectListHasSeveralItems(tokens: Token[], start: number): boolean {
  let depth = 0;
  for (let i = start + 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.kind === 'punct' && token.value === '(') depth++;
    else if (token.kind === 'punct' && token.value === ')') {
      if (depth === 0) return false;
      depth--;
    } else if (depth === 0 && token.kind === 'punct' && token.value === ',') return true;
    else if (depth === 0 && token.kind === 'word' && CLAUSE_STARTERS.has(token.value.toUpperCase())) return false;
  }
  return false;
}

/**
 * Format SQL: one clause per line, select lists and conditions indented, subqueries in their own
 * block. The output is verified token by token afterwards.
 */
export function formatSql(sql: string, options: FormatOptions): FormatResult {
  const raw = tokenize(sql, options.dialect);
  const inputLength = new TextEncoder().encode(sql).length;
  if (!raw.length) return { ok: true, text: '', inputLength, outputLength: 0 };

  if (raw.some((t) => t.kind === 'string' && !isClosedString(t.value))) {
    return { ok: false, text: sql, problem: 'unterminated-string', inputLength, outputLength: inputLength };
  }

  const tokens = combineKeywords(raw);
  const unit = indentUnit(options.indent);
  const state: RenderState = {
    lines: [],
    line: '',
    lineIndent: 0,
    depth: 0,
    clause: '',
    clauseDepth: 0,
    parenDepth: 0,
    clauseParen: 0,
    caseIndents: [],
    subqueryDepths: new Set(),
    savedClauses: [],
    prevWasTable: false,
    prevWasKeyword: false,
    afterTableKeyword: false,
  };

  const pad = (level: number) => unit.repeat(Math.max(0, level));
  const flush = () => {
    const text = state.line.trim();
    if (text) state.lines.push(pad(state.lineIndent) + text);
    state.line = '';
  };
  const startLine = (level: number) => {
    flush();
    state.lineIndent = Math.max(0, level);
  };
  const add = (text: string, spaceBefore = true) => {
    if (!state.line) {
      state.line = text;
      return;
    }
    const needsSpace = spaceBefore && !state.line.endsWith('(') && !state.line.endsWith('.');
    state.line += (needsSpace ? ' ' : '') + text;
  };

  const upper = (t: Token) => t.value.toUpperCase();

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const next = tokens[index + 1];

    if (token.kind === 'comment') {
      if (state.line.trim()) {
        add(token.value);
        if (token.value.startsWith('--') || token.value.startsWith('#')) flush();
      } else {
        startLine(token.value.startsWith('/*') ? state.depth : state.depth);
        add(token.value);
        flush();
      }
      continue;
    }

    if (token.kind === 'punct') {
      if (token.value === '(') {
        const rest = next && next.kind === 'word' ? upper(next) : '';
        const subquery = rest === 'SELECT' || rest === 'WITH';
        // A function call keeps its bracket tight (count(*)); a table definition or IN (…) does not.
        add('(', state.prevWasTable || state.prevWasKeyword);
        state.prevWasTable = false;
        state.prevWasKeyword = false;
        if (subquery) {
          state.savedClauses.push({
            clause: state.clause,
            clauseDepth: state.clauseDepth,
            clauseParen: state.clauseParen,
          });
          state.depth++;
          state.parenDepth++;
          state.subqueryDepths.add(state.parenDepth);
          state.clause = '';
          flush();
          state.lineIndent = state.depth;
        } else {
          state.parenDepth++;
        }
        continue;
      }
      if (token.value === ')') {
        if (state.subqueryDepths.has(state.parenDepth)) {
          flush();
          state.subqueryDepths.delete(state.parenDepth);
          state.parenDepth--;
          state.depth--;
          const saved = state.savedClauses.pop();
          state.clause = saved?.clause ?? '';
          state.clauseDepth = saved?.clauseDepth ?? 0;
          state.clauseParen = saved?.clauseParen ?? 0;
          state.lineIndent = state.depth;
          add(')', false);
        } else {
          add(')', false);
          state.parenDepth = Math.max(0, state.parenDepth - 1);
        }
        continue;
      }
      if (token.value === ',') {
        add(',', false);
        if (state.clause === 'SELECT' && state.parenDepth === state.clauseParen) {
          startLine(state.clauseDepth + 1);
        }
        continue;
      }
      if (token.value === ';') {
        add(';', false);
        flush();
        state.clause = '';
        continue;
      }
      if (token.value === '.') {
        add('.', false);
        continue;
      }
      add(token.value, true);
      continue;
    }

    if (token.kind === 'word') {
      const keyword = isKeyword(token);
      const phrase = keyword ? upper(token) : '';

      if (keyword && phrase === 'CASE') {
        add(keywordCaseOf(token.value, options.keywordCase), true);
        state.caseIndents.push(state.lineIndent);
        state.prevWasKeyword = true;
        continue;
      }
      if (keyword && (phrase === 'WHEN' || phrase === 'ELSE')) {
        const level = (state.caseIndents.at(-1) ?? state.lineIndent) + 1;
        startLine(level);
        add(keywordCaseOf(token.value, options.keywordCase), false);
        state.prevWasKeyword = true;
        continue;
      }
      if (keyword && phrase === 'END') {
        const level = state.caseIndents.pop() ?? state.lineIndent;
        startLine(level);
        add(keywordCaseOf(token.value, options.keywordCase), false);
        state.prevWasKeyword = true;
        continue;
      }
      if (
        keyword &&
        (phrase === 'AND' || phrase === 'OR') &&
        CONDITION_CLAUSES.has(state.clause) &&
        state.parenDepth === state.clauseParen
      ) {
        startLine(state.clauseDepth + 1);
        add(keywordCaseOf(token.value, options.keywordCase), false);
        state.prevWasKeyword = true;
        continue;
      }
      if (keyword && CLAUSE_STARTERS.has(phrase)) {
        let level = state.depth;
        if (phrase === 'ON' || phrase === 'USING') level = state.depth + 1;
        startLine(level);
        add(keywordCaseOf(token.value, options.keywordCase), false);
        state.clause = phrase;
        state.clauseDepth = level;
        state.clauseParen = state.parenDepth;
        state.afterTableKeyword = TABLE_KEYWORDS.has(phrase);
        state.prevWasTable = false;
        state.prevWasKeyword = true;
        if (phrase === 'SELECT') {
          const keepsFirstItem = next && next.kind === 'word' && ['DISTINCT', 'ALL'].includes(upper(next));
          if (!keepsFirstItem && selectListHasSeveralItems(tokens, index)) {
            flush();
            state.lineIndent = level + 1;
          }
        }
        continue;
      }
      // A clause ends at its terminating keyword even when it does not start a line of its own.
      add(keyword ? keywordCaseOf(token.value, options.keywordCase) : token.value, true);
      state.prevWasTable = !keyword && state.afterTableKeyword;
      state.afterTableKeyword = keyword ? TABLE_KEYWORDS.has(phrase) : false;
      state.prevWasKeyword = keyword;
      continue;
    }

    add(token.value, true);
    state.prevWasTable = false;
    state.prevWasKeyword = false;
  }

  flush();
  const output = state.lines.join('\n');
  const outputLength = new TextEncoder().encode(output).length;
  const reparsed = tokenize(output, options.dialect);
  if (!sameTokens(raw, reparsed, options.keywordCase)) {
    return { ok: false, text: sql, problem: 'verification-failed', inputLength, outputLength };
  }
  if (state.depth !== 0) {
    return { ok: false, text: sql, problem: 'unbalanced-parens', inputLength, outputLength };
  }
  return { ok: true, text: output, inputLength, outputLength };
}

function isClosedString(value: string): boolean {
  if (value.length < 2) return false;
  if (value.startsWith('$')) {
    const tag = /^\$[A-Za-z_]*\$/.exec(value)![0];
    return value.length >= tag.length * 2 && value.endsWith(tag);
  }
  if (value.startsWith("'")) return value.endsWith("'") && value.length > 1;
  return true;
}

/**
 * Collapse the query to one line. Comments are dropped here on purpose (the alternative is a
 * query that still spans a log line); string literals and quoted names are never touched.
 */
export function minifySql(sql: string, options: FormatOptions): FormatResult {
  const raw = tokenize(sql, options.dialect);
  const inputLength = new TextEncoder().encode(sql).length;
  if (!raw.length) return { ok: true, text: '', inputLength, outputLength: 0 };
  const tokens = combineKeywords(raw);
  let out = '';

  const needsSpace = (prev: Token, token: Token): boolean => {
    if (!prev) return false;
    const wordishKinds = ['word', 'number', 'param', 'ident', 'string'];
    const prevWordish = wordishKinds.includes(prev.kind);
    const wordish = wordishKinds.includes(token.kind);
    if (prevWordish && wordish) return true;
    if (prev.kind === 'punct' && token.kind === 'punct') {
      // Keep a space where two operators would otherwise join into a different one.
      return (
        (prev.value === '-' && token.value === '-') ||
        (prev.value === '/' && token.value === '*') ||
        (prev.value === '~' && (token.value === '~' || token.value === '!'))
      );
    }
    if (prev.kind === 'punct' && prev.value === ')' && wordish) return true;
    if (prevWordish && token.kind === 'punct' && token.value === '(') return false;
    return false;
  };

  let prev: Token | undefined;
  for (const token of tokens) {
    if (token.kind === 'comment') continue;
    const value =
      token.kind === 'word' && isKeyword(token) ? keywordCaseOf(token.value, options.keywordCase) : token.value;
    if (needsSpace(prev!, token)) out += ' ';
    out += value;
    prev = token;
  }

  const outputLength = new TextEncoder().encode(out).length;
  if (!sameTokens(raw, tokenize(out, options.dialect), options.keywordCase)) {
    return { ok: false, text: sql, problem: 'verification-failed', inputLength, outputLength };
  }
  return { ok: true, text: out, inputLength, outputLength };
}

export interface DialectNote {
  id: Dialect;
  labelKey: string;
}

export const DIALECTS: DialectNote[] = [
  { id: 'standard', labelKey: 'dialectStandard' },
  { id: 'postgres', labelKey: 'dialectPostgres' },
  { id: 'mysql', labelKey: 'dialectMysql' },
  { id: 'tsql', labelKey: 'dialectTsql' },
  { id: 'sqlite', labelKey: 'dialectSqlite' },
  { id: 'bigquery', labelKey: 'dialectBigquery' },
];

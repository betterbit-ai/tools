import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'sql-formatter',
  category: 'developer',
  icon: 'code',
  added: '2026-11-28',
  updated: '2026-11-28',
  edges: ['privacy', 'features', 'usability'],
  competitors: [
    {
      name: 'SQLFormat (sqlformat.org)',
      url: 'https://sqlformat.org/',
      weakness:
        'It runs the sqlparse module on Pyodide, so the page has to download a WebAssembly Python runtime before the first format, and every format still needs the Format button or Ctrl+Enter. Betterbit tokenizes in the tab with no runtime download and formats as you type. (Strength: the well-known sqlparse engine and a familiar keyboard shortcut.)',
    },
    {
      name: 'SQL Toolkit Formatter',
      url: 'https://sqltoolkit.dev/',
      weakness:
        'Formatting waits for the Format SQL button, and the page loads its code editor from cdn.jsdelivr.net, so an editor request goes out before you paste anything. Betterbit formats on input with no external asset. (Strength: it also verifies its output token by token and refuses SQL it cannot check safely.)',
    },
    {
      name: 'everyapp.pro SQL 포맷터',
      url: 'https://everyapp.pro/ko/sql-formatter',
      weakness:
        'Every conversion needs a click on 정리 or 압축, opening a file is capped at 10 MB, and the Korean page makes no claim that the output is checked against the input. Betterbit updates live and compares the two token streams before showing a result. (Strength: a Korean walkthrough and a file-open option for .sql files.)',
    },
    {
      name: 'mecanik.dev SQL 포맷터',
      url: 'https://mecanik.dev/ko/tools/sql-formatter/',
      weakness:
        'It supports eight dialects but still reformats after a click on 포맷, and its FAQ promises only that whitespace and keyword case change, without a visible check that they did. Betterbit shows the refusal when its check fails. (Strength: a short, clear Korean explanation of what formatting changes.)',
    },
  ],
  related: ['json-formatter', 'yaml-json', 'regex-tester'],
};

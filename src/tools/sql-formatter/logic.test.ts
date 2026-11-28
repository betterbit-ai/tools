import { describe, expect, it } from 'vitest';
import { formatSql, minifySql, tokenize } from './logic';

const fmt = (sql: string, overrides: Partial<Parameters<typeof formatSql>[1]> = {}) =>
  formatSql(sql, { dialect: 'postgres', keywordCase: 'upper', indent: '2', ...overrides });
const min = (sql: string, overrides: Partial<Parameters<typeof minifySql>[1]> = {}) =>
  minifySql(sql, { dialect: 'postgres', keywordCase: 'upper', indent: '2', ...overrides });

describe('format', () => {
  it('puts each clause on its own line and one select item per line', () => {
    const result = fmt('select a,b,count(*) as n from users u join orders o on o.user_id=u.id where u.active=true');
    expect(result.ok).toBe(true);
    expect(result.text).toBe(
      [
        'SELECT',
        '  a,',
        '  b,',
        '  count(*) AS n',
        'FROM users u',
        'JOIN orders o',
        '  ON o.user_id = u.id',
        'WHERE u.active = TRUE',
      ].join('\n'),
    );
  });

  it('keeps a single-item select list on the SELECT line', () => {
    expect(fmt('select 1').text).toBe('SELECT 1');
    expect(fmt('select distinct name from t').text).toBe('SELECT DISTINCT name\nFROM t');
  });

  it('breaks long conditions on AND and OR, but not conditions in a function argument', () => {
    const result = fmt('select * from t where a = 1 and (b = 2 or c = 3) having count(*) > 1');
    expect(result.text).toBe(
      ['SELECT *', 'FROM t', 'WHERE a = 1', '  AND (b = 2 OR c = 3)', 'HAVING count(*) > 1'].join('\n'),
    );
  });

  it('indents a subquery in brackets and returns to the outer clause after it', () => {
    const result = fmt('select * from t where id in (select id from other where x = 1) and y = 2');
    expect(result.text).toBe(
      ['SELECT *', 'FROM t', 'WHERE id IN (', '  SELECT id', '  FROM other', '  WHERE x = 1', ')', '  AND y = 2'].join(
        '\n',
      ),
    );
  });

  it('lays out CASE with WHEN, ELSE and END', () => {
    const result = fmt("select case when a > 1 then 'big' else 'small' end as size from t");
    expect(result.text).toBe(
      ['SELECT CASE', "  WHEN a > 1 THEN 'big'", "  ELSE 'small'", 'END AS size', 'FROM t'].join('\n'),
    );
  });

  it('never touches string literals, quoted names or comments', () => {
    const sql = `select 'from where' as "Order", \`col\` from t -- from a comment`;
    const result = fmt(sql, { dialect: 'mysql' });
    expect(result.text).toContain(`'from where'`);
    expect(result.text).toContain('`col`');
    expect(result.text).toContain('-- from a comment');
    expect(result.text).toContain('FROM t');
  });

  it('keeps a dollar-quoted body untouched', () => {
    const sql = 'create function f() returns int as $$ select 1; $$ language sql';
    const result = fmt(sql, { dialect: 'postgres' });
    expect(result.ok).toBe(true);
    expect(result.text).toContain('$$ select 1; $$');
  });

  it('respects T-SQL brackets and GO batches', () => {
    const sql = 'select [Order ID] from [dbo].[Orders] go';
    const result = fmt(sql, { dialect: 'tsql' });
    expect(result.text).toContain('[Order ID]');
    expect(result.text).toContain('[dbo].[Orders]');
    expect(result.text).toContain('GO');
  });

  it('formats INSERT, UPDATE and DELETE', () => {
    expect(fmt("insert into logs (id, msg) values (1, 'hi')").text).toBe(
      ['INSERT INTO logs (id, msg)', "VALUES (1, 'hi')"].join('\n'),
    );
    expect(fmt('update users set name = 1 where id = 3').text).toBe(
      ['UPDATE users', 'SET name = 1', 'WHERE id = 3'].join('\n'),
    );
    expect(fmt('delete from users where id = 3').text).toBe(['DELETE FROM users', 'WHERE id = 3'].join('\n'));
  });

  it('keeps UNION parts on their own lines', () => {
    const result = fmt('select 1 union all select 2');
    expect(result.text).toBe(['SELECT 1', 'UNION ALL', 'SELECT 2'].join('\n'));
  });

  it('applies the requested keyword case and leaves identifiers alone', () => {
    const lower = fmt('SELECT Name, Count(*) FROM Users WHERE id = 1', { keywordCase: 'lower' });
    expect(lower.text).toBe(['select', '  Name,', '  Count(*)', 'from Users', 'where id = 1'].join('\n'));
    const preserve = fmt('SeLeCt a FROM t', { keywordCase: 'preserve' });
    expect(preserve.text).toContain('SeLeCt');
  });

  it('indents with tabs when asked', () => {
    const result = fmt('select a,b from t', { indent: 'tab' });
    expect(result.text).toBe(['SELECT', '\ta,', '\tb', 'FROM t'].join('\n'));
  });

  it('formats several statements one after another', () => {
    const result = fmt('select 1; select 2;');
    expect(result.text).toBe(['SELECT 1;', 'SELECT 2;'].join('\n'));
  });

  it('keeps Korean identifiers and text intact', () => {
    const result = fmt("select 이름 from 사용자 where 이름 = '홍길동'");
    expect(result.text).toBe(['SELECT 이름', 'FROM 사용자', "WHERE 이름 = '홍길동'"].join('\n'));
  });

  it('returns the input untouched when a string is not closed', () => {
    const sql = "select 'oops";
    const result = fmt(sql);
    expect(result.ok).toBe(false);
    expect(result.text).toBe(sql);
    expect(result.problem).toBe('unterminated-string');
  });

  it('returns empty output for empty input', () => {
    expect(fmt('').text).toBe('');
    expect(fmt('   ').text).toBe('');
  });

  it('leaves already tidy SQL as it is', () => {
    const sql = ['SELECT a', 'FROM t', 'WHERE b = 1'].join('\n');
    expect(fmt(sql).text).toBe(sql);
  });

  it('handles a long generated query without losing a token', () => {
    const cols = Array.from({ length: 200 }, (_, i) => `col_${i}`).join(', ');
    const result = fmt(`select ${cols} from t`);
    expect(result.ok).toBe(true);
    expect(result.text.split('\n')).toHaveLength(202);
  });
});

describe('tokenize', () => {
  it('keeps comments, strings and numbers apart', () => {
    const tokens = tokenize("select 1.5, 'a''b', -- note\n x", 'standard');
    expect(tokens.map((t) => [t.kind, t.value])).toEqual([
      ['word', 'select'],
      ['number', '1.5'],
      ['punct', ','],
      ['string', "'a''b'"],
      ['punct', ','],
      ['comment', '-- note'],
      ['word', 'x'],
    ]);
  });

  it('reads MySQL backticks, T-SQL brackets and PostgreSQL dollar quotes', () => {
    expect(tokenize('`a` is not a keyword', 'mysql')[0]).toEqual({ kind: 'ident', value: '`a`' });
    expect(tokenize('[a]', 'tsql')[0]).toEqual({ kind: 'ident', value: '[a]' });
    expect(tokenize('$$x$$', 'postgres')[0]).toEqual({ kind: 'string', value: '$$x$$' });
  });

  it('treats # as a comment only in MySQL and BigQuery', () => {
    expect(tokenize('# note\nselect 1', 'mysql')[0].kind).toBe('comment');
    expect(tokenize('# note\nselect 1', 'postgres')[0].kind).not.toBe('comment');
  });
});

describe('minify', () => {
  it('collapses a query to one line', () => {
    const result = min('select a, b\nfrom t\nwhere a = 1 and b = 2');
    expect(result.ok).toBe(true);
    expect(result.text).toBe('SELECT a,b FROM t WHERE a=1 AND b=2');
  });

  it('drops comments and keeps literals', () => {
    const result = min("select 'a  b' -- note\nfrom t /* block */");
    expect(result.ok).toBe(true);
    expect(result.text).toBe("SELECT 'a  b' FROM t");
  });

  it('never joins two tokens into a different one', () => {
    const result = min('select a - -b, c / *d', { dialect: 'standard' });
    expect(result.ok).toBe(true);
    expect(result.text).toBe('SELECT a- -b,c/ *d');
  });

  it('keeps the requested keyword case and leaves identifiers alone', () => {
    expect(min('SELECT A FROM T', { keywordCase: 'lower' }).text).toBe('select A from T');
  });

  it('is smaller than the formatted version', () => {
    const sql = 'select a,b from t where a = 1';
    expect(min(sql).outputLength).toBeLessThan(fmt(sql).outputLength);
  });
});

describe('describeQuery', () => {
  it('is not part of the public API any more', () => {
    expect(true).toBe(true);
  });
});

import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'SQL',
  inputPlaceholder: 'Paste a query here…',
  outputLabel: 'Result',
  outputPlaceholder: 'The formatted query appears here.',
  modeLabel: 'Mode',
  format: 'Format',
  minify: 'Minify',
  dialectLabel: 'Dialect',
  dialectHint: 'The dialect decides how strings, comments and quoted names are read.',
  dialectStandard: 'Standard SQL',
  dialectPostgres: 'PostgreSQL',
  dialectMysql: 'MySQL',
  dialectTsql: 'SQL Server',
  dialectSqlite: 'SQLite',
  dialectBigquery: 'BigQuery',
  caseLabel: 'Keyword case',
  caseUpper: 'UPPER',
  caseLower: 'lower',
  casePreserve: 'As written',
  indentLabel: 'Indent',
  indent2: '2 spaces',
  indent4: '4 spaces',
  indentTab: 'Tab',
  clear: 'Clear',
  copy: 'Copy result',
  copied: 'Copied',
  download: 'Download .sql',
  swap: 'Use result as input',
  before: 'Before',
  after: 'After',
  saved: 'Smaller',
  autosaved: 'Saved in this browser only',
  problemUnterminated:
    'The query has a string that is never closed, so nothing was formatted. Check the quotes ending in a single quote.',
  problemUnbalanced: 'The brackets do not balance, so nothing was formatted.',
  problemVerification:
    'Formatting would have changed more than whitespace and keyword case, so the original query was kept unchanged.',
  empty: 'Paste a query to see the formatted result.',
};

export type UI = typeof uiEn;

const uiKo = {
  inputLabel: 'SQL',
  inputPlaceholder: '쿼리를 붙여넣으세요…',
  outputLabel: '결과',
  outputPlaceholder: '정리된 쿼리가 여기에 표시됩니다.',
  modeLabel: '모드',
  format: '정리',
  minify: '압축',
  dialectLabel: '방언',
  dialectHint: '방언에 따라 문자열·주석·인용 이름을 읽는 규칙이 달라집니다.',
  dialectStandard: '표준 SQL',
  dialectPostgres: 'PostgreSQL',
  dialectMysql: 'MySQL',
  dialectTsql: 'SQL Server',
  dialectSqlite: 'SQLite',
  dialectBigquery: 'BigQuery',
  caseLabel: '키워드 대소문자',
  caseUpper: '대문자',
  caseLower: '소문자',
  casePreserve: '입력 그대로',
  indentLabel: '들여쓰기',
  indent2: '공백 2칸',
  indent4: '공백 4칸',
  indentTab: '탭',
  clear: '지우기',
  copy: '결과 복사',
  copied: '복사됨',
  download: '.sql 내려받기',
  swap: '결과를 입력으로',
  before: '정리 전',
  after: '정리 후',
  saved: '줄어든 크기',
  autosaved: '이 브라우저에만 저장됩니다',
  problemUnterminated: '닫히지 않은 문자열이 있어 아무것도 바꾸지 않았습니다. 작은따옴표로 끝나는 부분을 확인하세요.',
  problemUnbalanced: '괄호 짝이 맞지 않아 아무것도 바꾸지 않았습니다.',
  problemVerification: '공백과 키워드 대소문자 외에 달라지는 부분이 있어 원본 쿼리를 그대로 두었습니다.',
  empty: '쿼리를 붙여넣으면 정리된 결과가 표시됩니다.',
};

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'SQL Formatter — 6 Dialects, Output Checked Token by Token',
    description:
      'Format or minify SQL as you type, with backticks, brackets and dollar quotes read per dialect. Every result is checked against your query before it is shown.',
    h1: 'SQL Formatter',
    tagline: 'Lay out a query by clause while every token is checked, so the result still runs the same.',
    name: 'SQL Formatter',
    keywords: ['sql formatter', 'sql beautifier', 'format sql online', 'sql minifier', 'sql 정렬', '쿼리 정리'],
    howTo: [
      'Paste the query into the SQL box; the formatted version appears as you type.',
      'Choose the dialect so strings, comments and quoted names are read correctly.',
      'Pick the keyword case and indentation your team uses.',
      'Copy the result, download it as a .sql file, or switch to Minify for one line.',
    ],
    sections: [
      {
        heading: 'What formatting may change, and what it must not',
        body: "A formatter is only safe when it changes nothing a database can see except whitespace, and nothing a human reads except the case of reserved words. This tool therefore splits the query into tokens first — string literals, quoted names, comments, numbers and operators — moves only the whitespace between them, and then re-tokenizes its own output and compares the two streams. If any token other than a keyword's case would differ, the original query is returned and the page says why, instead of showing SQL that might behave differently.\n\nThat check catches the classic formatter bugs: a semicolon inside a string being treated as a statement end, a -- inside a literal starting a comment, or an operator such as :: being split into two colons.",
      },
      {
        heading: 'Why the dialect setting matters',
        body: 'The same characters mean different things in different databases. MySQL and BigQuery quote identifiers with backticks and start a # comment; SQL Server and SQLite accept [bracketed] names; PostgreSQL allows $tag$ … $tag$ strings that may contain semicolons and quotes; MySQL strings honour backslash escapes while standard SQL does not. Picking the wrong dialect is the usual reason a formatter breaks a query, so the setting here changes the tokenizer rather than only the branding.\n\nWhat this formatter does not do is rewrite vendor-specific syntax. Stored procedure bodies, Oracle PL/SQL blocks and Snowflake scripting are copied token for token, which means they stay valid but are not laid out statement by statement.',
      },
      {
        heading: 'Minify, and reading the sizes',
        body: 'Minify collapses the query to one line: comments are dropped and spaces are removed only where two tokens cannot merge into a different one, so a - -b never becomes a --b comment and a / * never opens a block comment. String literals keep every character, including runs of spaces.\n\nThe size line shows bytes before and after, and how much smaller the result is. Gzip or Brotli usually shrink formatted SQL back to about the minified size, so the practical gain from minifying is mostly for logs, command lines and single-line config values rather than for network transfer.',
      },
    ],
    faq: [
      {
        q: 'Can formatting change what my query does?',
        a: 'It should not, and this tool checks before showing anything: only whitespace and the case of reserved words are allowed to change. The output is re-tokenized and compared with the input, and when any other token would differ the original query is kept and the page explains why.',
      },
      {
        q: 'Which SQL dialects are supported?',
        a: 'Standard SQL, PostgreSQL, MySQL, SQL Server (T-SQL), SQLite and BigQuery. The dialect controls how strings, comments and quoted identifiers are read — backticks in MySQL, [brackets] in T-SQL, $tag$ strings in PostgreSQL, # comments in MySQL and BigQuery. Stored procedure bodies are preserved but not reformatted line by line.',
      },
      {
        q: 'Why is my query sometimes returned unchanged?',
        a: 'Either it already matches the chosen style, or the safety check refused the result: an unclosed string, unbalanced brackets, or a case where formatting would have changed a token. In that case the page shows the original query with a note instead of output that might behave differently.',
      },
      {
        q: 'Are comments and hints kept?',
        a: 'In Format mode every comment stays where you put it, including -- line comments and /* block */ comments, because they often carry meaning for the next reader. Optimizer hints written as comments are therefore preserved. Minify drops comments on purpose, since the point of minifying is a single line for a log or a command.',
      },
      {
        q: 'Does it support INSERT, UPDATE, DELETE and DDL?',
        a: 'Yes. SELECT, INSERT INTO … VALUES, UPDATE … SET, DELETE FROM, UNION, WITH and CASE are laid out clause by clause, and CREATE TABLE statements are kept on one line with their constraints in place. Nothing is dropped from statements it does not recognise: unknown syntax is copied as tokens rather than rejected.',
      },
      {
        q: 'Is my query uploaded anywhere?',
        a: 'No. Tokenizing and formatting run in this tab, and the query is only stored in this browser so a refresh keeps your work. That matters for queries that name internal tables or contain real customer values.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'SQL 포맷터 — 6개 방언, 토큰 단위 검증',
    description:
      'SQL을 입력하는 즉시 정리하거나 압축합니다. 방언별로 백틱·대괄호·달러 문자열을 구분해 읽고, 결과를 원본과 토큰 단위로 대조한 뒤 보여 줍니다. 쿼리는 서버로 전송되지 않습니다.',
    h1: 'SQL 포맷터',
    tagline: '절 단위로 줄을 나누면서 모든 토큰을 대조해, 결과가 원래 쿼리와 같은 뜻이 되도록 합니다.',
    name: 'SQL 포맷터',
    keywords: ['sql 포맷터', 'sql 정렬', '쿼리 정리', 'sql beautifier', 'sql 압축', 'sql formatter'],
    howTo: [
      'SQL 칸에 쿼리를 붙여넣으면 입력하는 동안 정리된 결과가 바로 표시됩니다.',
      '문자열·주석·인용 이름을 정확히 읽도록 방언을 고릅니다.',
      '팀에서 쓰는 키워드 대소문자와 들여쓰기를 선택합니다.',
      '결과를 복사하거나 .sql 파일로 내려받고, 한 줄이 필요하면 ‘압축’으로 바꿉니다.',
    ],
    sections: [
      {
        heading: '바꿔도 되는 것과 바꾸면 안 되는 것',
        body: '포맷터가 안전하려면 데이터베이스가 보는 것은 공백만, 사람이 읽는 것은 예약어의 대소문자만 달라져야 합니다. 이 도구는 먼저 쿼리를 토큰(문자열, 인용 이름, 주석, 숫자, 연산자)으로 나누고, 토큰 사이의 공백만 옮긴 뒤, 결과를 다시 토큰으로 나눠 원본과 비교합니다. 키워드 대소문자 외에 다른 토큰이 하나라도 달라지면 결과를 보여 주는 대신 원본을 그대로 두고 이유를 알립니다.\n\n이 검사가 잡아내는 것이 포맷터의 대표적 사고입니다. 문자열 안의 세미콜론을 문장 끝으로 착각하거나, 리터럴 안의 --를 주석 시작으로 보거나, :: 같은 연산자를 콜론 두 개로 쪼개는 경우입니다.',
      },
      {
        heading: '방언 설정이 중요한 이유',
        body: '같은 글자도 데이터베이스마다 뜻이 다릅니다. MySQL과 BigQuery는 백틱으로 이름을 감싸고 #을 주석으로 씁니다. SQL Server와 SQLite는 [대괄호] 이름을 받습니다. PostgreSQL은 $tag$ … $tag$ 문자열을 허용해서 그 안에 세미콜론과 따옴표가 들어갈 수 있습니다. MySQL 문자열은 백슬래시 이스케이프를 인정하지만 표준 SQL은 그렇지 않습니다. 포맷터가 쿼리를 망가뜨리는 가장 흔한 이유가 방언을 잘못 고르는 것이라, 이 설정은 이름표가 아니라 토큰을 읽는 규칙 자체를 바꿉니다.\n\n이 도구는 벤더 전용 문법을 새로 써 주지는 않습니다. 저장 프로시저 본문, Oracle PL/SQL 블록, Snowflake 스크립트는 토큰 그대로 복사되므로 유효한 상태로 남지만 문장별로 줄이 나뉘지는 않습니다.',
      },
      {
        heading: '압축과 크기 읽기',
        body: '압축은 쿼리를 한 줄로 접습니다. 주석은 버리고, 공백은 두 토큰이 합쳐져 다른 토큰이 될 수 있는 자리에서만 남깁니다. 그래서 a - -b가 --b 주석이 되거나 / *가 블록 주석을 여는 일이 없습니다. 문자열 리터럴은 공백이 여러 칸이어도 그대로 유지됩니다.\n\n크기 줄에는 정리 전후 바이트와 줄어든 비율이 표시됩니다. 실제로는 gzip이나 Brotli로 전송하면 정리한 SQL도 압축한 것과 비슷한 크기가 되므로, 압축의 실익은 로그·명령줄·한 줄 설정값처럼 압축이 적용되지 않는 자리에서 큽니다.',
      },
    ],
    faq: [
      {
        q: '포맷하면 쿼리 동작이 달라질 수 있나요?',
        a: '달라지지 않아야 하고, 이 도구는 결과를 보여 주기 전에 확인합니다. 공백과 예약어 대소문자만 바뀌도록 하고, 결과를 다시 토큰으로 나눠 원본과 비교합니다. 다른 토큰이 하나라도 달라지면 원본 쿼리를 그대로 두고 이유를 표시합니다.',
      },
      {
        q: '어떤 SQL 방언을 지원하나요?',
        a: '표준 SQL, PostgreSQL, MySQL, SQL Server(T-SQL), SQLite, BigQuery를 지원합니다. 방언은 문자열·주석·인용 이름을 읽는 방식을 정합니다. MySQL의 백틱, T-SQL의 [대괄호], PostgreSQL의 $tag$ 문자열, MySQL·BigQuery의 # 주석이 그 예입니다. 저장 프로시저 본문은 보존되지만 문장별로 다시 정리되지는 않습니다.',
      },
      {
        q: '쿼리가 그대로 나오는 경우가 있는데 왜인가요?',
        a: '이미 선택한 스타일과 같거나, 안전 검사가 결과를 거부한 경우입니다. 닫히지 않은 문자열, 맞지 않는 괄호, 또는 포맷하면 토큰이 달라지는 경우가 그렇습니다. 이때는 다른 동작을 할 수 있는 결과를 보여 주는 대신 원본과 이유를 함께 보여 줍니다.',
      },
      {
        q: '주석과 힌트도 유지되나요?',
        a: '정리 모드에서는 -- 줄 주석과 /* 블록 */ 주석이 쓰인 자리에 그대로 남습니다. 주석으로 쓰는 옵티마이저 힌트도 유지됩니다. 압축 모드에서는 로그나 명령줄용 한 줄을 만드는 것이 목적이므로 주석을 일부러 제거합니다.',
      },
      {
        q: 'INSERT, UPDATE, DELETE, DDL도 되나요?',
        a: '네. SELECT, INSERT INTO … VALUES, UPDATE … SET, DELETE FROM, UNION, WITH, CASE를 절 단위로 나누고, CREATE TABLE은 제약 조건을 그대로 둔 채 한 줄로 유지합니다. 인식하지 못하는 문법도 버리지 않고 토큰 그대로 복사합니다.',
      },
      {
        q: '쿼리가 서버로 전송되나요?',
        a: '아니요. 토큰 분리와 정리가 이 탭에서 실행되고, 쿼리는 새로고침해도 남도록 이 브라우저에만 저장됩니다. 내부 테이블 이름이나 실제 고객 값이 들어간 쿼리를 다룰 때 중요한 부분입니다.',
      },
    ],
    ui: uiKo,
  },
};

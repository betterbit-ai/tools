import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, FieldGroup, Notice, Panel, Segmented, Select, Stat, Textarea } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { type Dialect, type FormatResult, type IndentChoice, type KeywordCase, formatSql, minifySql } from './logic';

const INPUT_KEY = 'tools:sql-formatter:input';
const OPTIONS_KEY = 'tools:sql-formatter:options';

type Mode = 'format' | 'minify';
interface Options {
  mode: Mode;
  dialect: Dialect;
  keywordCase: KeywordCase;
  indent: IndentChoice;
}

const DEFAULTS: Options = { mode: 'format', dialect: 'postgres', keywordCase: 'upper', indent: '2' };
const SAMPLE =
  'select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true and o.total > 100 group by u.id, u.name order by orders desc limit 20';

export default function SqlFormatter({ locale, ui }: ToolProps<UI>) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Options>(DEFAULTS);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setInput(safeStorage.get(INPUT_KEY) ?? SAMPLE);
    const saved = safeStorage.get(OPTIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        setOptions({
          mode: parsed.mode === 'minify' ? 'minify' : 'format',
          dialect: isDialect(parsed.dialect) ? parsed.dialect : DEFAULTS.dialect,
          keywordCase: isCase(parsed.keywordCase) ? parsed.keywordCase : DEFAULTS.keywordCase,
          indent: parsed.indent === '4' || parsed.indent === 'tab' ? parsed.indent : '2',
        });
      } catch {
        setOptions(DEFAULTS);
      }
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!input) {
        safeStorage.remove(INPUT_KEY);
        setSaveFailed(false);
        return;
      }
      setSaveFailed(!safeStorage.trySet(INPUT_KEY, input));
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  useEffect(() => safeStorage.set(OPTIONS_KEY, JSON.stringify(options)), [options]);

  const result: FormatResult = useMemo(() => {
    const { mode, ...rest } = options;
    return mode === 'minify' ? minifySql(input, rest) : formatSql(input, rest);
  }, [input, options]);

  const n = (v: number) => formatNumber(v, locale);
  const text = result.text;
  const smaller = result.inputLength > 0 ? Math.round((1 - result.outputLength / result.inputLength) * 100) : 0;
  const set = <K extends keyof Options>(key: K, value: Options[K]) => setOptions((o) => ({ ...o, [key]: value }));

  const problemText =
    result.problem === 'unterminated-string'
      ? ui.problemUnterminated
      : result.problem === 'unbalanced-parens'
        ? ui.problemUnbalanced
        : result.problem === 'verification-failed'
          ? ui.problemVerification
          : null;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="flex min-w-0 flex-col">
          <label for="sql-input" class="mb-1.5 text-sm font-medium text-fg">
            {ui.inputLabel}
          </label>
          <Textarea
            id="sql-input"
            value={input}
            onInput={(e) => setInput((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.inputPlaceholder}
            spellcheck={false}
            class="min-h-64 flex-1 font-mono text-sm lg:min-h-[380px]"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{saveFailed ? '' : ui.autosaved}</span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <FieldGroup label={ui.modeLabel}>
            <Segmented
              value={options.mode}
              onValue={(v) => set('mode', v)}
              label={ui.modeLabel}
              options={[
                { value: 'format', label: ui.format },
                { value: 'minify', label: ui.minify },
              ]}
            />
          </FieldGroup>

          <FieldGroup label={ui.dialectLabel} hint={ui.dialectHint}>
            <Select
              value={options.dialect}
              onValue={(v) => set('dialect', v)}
              ariaLabel={ui.dialectLabel}
              options={[
                { value: 'standard', label: ui.dialectStandard },
                { value: 'postgres', label: ui.dialectPostgres },
                { value: 'mysql', label: ui.dialectMysql },
                { value: 'tsql', label: ui.dialectTsql },
                { value: 'sqlite', label: ui.dialectSqlite },
                { value: 'bigquery', label: ui.dialectBigquery },
              ]}
            />
          </FieldGroup>

          <FieldGroup label={ui.caseLabel}>
            <Segmented
              value={options.keywordCase}
              onValue={(v) => set('keywordCase', v)}
              label={ui.caseLabel}
              options={[
                { value: 'upper', label: ui.caseUpper },
                { value: 'lower', label: ui.caseLower },
                { value: 'preserve', label: ui.casePreserve },
              ]}
            />
          </FieldGroup>

          <FieldGroup label={ui.indentLabel}>
            <Segmented
              value={options.indent}
              onValue={(v) => set('indent', v)}
              label={ui.indentLabel}
              options={[
                { value: '2', label: ui.indent2 },
                { value: '4', label: ui.indent4 },
                { value: 'tab', label: ui.indentTab },
              ]}
            />
          </FieldGroup>

          <div>
            <label for="sql-output" class="mb-1.5 block text-sm font-medium text-fg">
              {ui.outputLabel}
            </label>
            <Textarea
              id="sql-output"
              value={text}
              readOnly
              placeholder={ui.outputPlaceholder}
              spellcheck={false}
              class="min-h-56 bg-surface-2 font-mono text-sm lg:min-h-[300px]"
            />
            <div class="mt-3 flex flex-wrap gap-2">
              <CopyButton text={result.ok ? text : ''} label={ui.copy} copiedLabel={ui.copied} />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => downloadBlob(new Blob([text], { type: 'application/sql' }), 'query.sql')}
                disabled={!result.ok || !text}
              >
                {ui.download}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setInput(text)} disabled={!text}>
                {ui.swap}
              </Button>
            </div>
          </div>

          {problemText ? <Notice tone="danger">{problemText}</Notice> : null}

          <div class="grid grid-cols-3 gap-2">
            <Stat label={ui.before} value={`${n(result.inputLength)} B`} />
            <Stat label={ui.after} value={`${n(result.outputLength)} B`} />
            <Stat label={ui.saved} value={`${n(Math.max(0, smaller))}%`} />
          </div>

          {!input.trim() ? <p class="text-sm text-subtle">{ui.empty}</p> : null}
        </div>
      </div>
    </Panel>
  );
}

const isDialect = (value: unknown): value is Dialect =>
  typeof value === 'string' && ['standard', 'postgres', 'mysql', 'tsql', 'sqlite', 'bigquery'].includes(value);
const isCase = (value: unknown): value is KeywordCase => value === 'upper' || value === 'lower' || value === 'preserve';

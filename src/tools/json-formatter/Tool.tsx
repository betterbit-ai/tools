import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Dropzone, Notice, Panel, Segmented, Stat, Toggle } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  type IndentOption,
  type JsonErrorCode,
  computeStats,
  formatJson,
  minifyJson,
  parseJsonSafe,
  sortKeysDeep,
} from './logic';

const STORAGE_KEY = 'tools:json-formatter:text';
const INDENT_KEY = 'tools:json-formatter:indent';
const SORT_KEY = 'tools:json-formatter:sort';
const INITIAL_ITEMS = 50;
const SHOW_MORE_STEP = 200;

const SAMPLE = `{
  "name": "Betterbit Tools",
  "openSource": true,
  "stars": 3,
  "tags": ["privacy", "no-ads", "fast"],
  "nested": { "ok": true }
}`;

type ViewMode = 'pretty' | 'minified' | 'tree';
type IndentChoice = '2' | '4' | 'tab';

const toIndentOption = (choice: IndentChoice): IndentOption => (choice === 'tab' ? 'tab' : (Number(choice) as 2 | 4));

const ERROR_UI_KEY: Record<JsonErrorCode, keyof UI> = {
  empty: 'errorEmpty',
  'unexpected-end': 'errorUnexpectedEnd',
  'unexpected-token': 'errorUnexpectedToken',
  'expected-key': 'errorExpectedKey',
  'expected-colon': 'errorExpectedColon',
  'expected-comma-or-brace': 'errorExpectedCommaOrBrace',
  'expected-comma-or-bracket': 'errorExpectedCommaOrBracket',
  'trailing-comma': 'errorTrailingComma',
  'unterminated-string': 'errorUnterminatedString',
  'invalid-escape': 'errorInvalidEscape',
  'invalid-unicode-escape': 'errorInvalidUnicodeEscape',
  'control-character': 'errorControlCharacter',
  'invalid-number': 'errorInvalidNumber',
  'trailing-data': 'errorTrailingData',
};

function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), template);
}

export default function JsonFormatter({ locale, ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [indent, setIndent] = useState<IndentChoice>('2');
  const [sortKeys, setSortKeys] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('pretty');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(safeStorage.get(STORAGE_KEY) ?? SAMPLE);
    const savedIndent = safeStorage.get(INDENT_KEY);
    if (savedIndent === '2' || savedIndent === '4' || savedIndent === 'tab') setIndent(savedIndent);
    setSortKeys(safeStorage.get(SORT_KEY) === '1');
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (text) safeStorage.set(STORAGE_KEY, text);
      else safeStorage.remove(STORAGE_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => safeStorage.set(INDENT_KEY, indent), [indent]);
  useEffect(() => safeStorage.set(SORT_KEY, sortKeys ? '1' : '0'), [sortKeys]);

  const parsed = useMemo(() => parseJsonSafe(text), [text]);
  const n = (v: number) => formatNumber(v, locale);

  const sorted = useMemo(() => {
    if (!parsed.ok) return undefined;
    return sortKeys ? sortKeysDeep(parsed.value) : parsed.value;
  }, [parsed, sortKeys]);

  // Tree view has no text form of its own, so copy/download fall back to the formatted text.
  const resultText = useMemo(() => {
    if (sorted === undefined) return '';
    return viewMode === 'minified' ? minifyJson(sorted) : formatJson(sorted, toIndentOption(indent));
  }, [sorted, viewMode, indent]);

  const stats = useMemo(() => (parsed.ok ? computeStats(parsed.value, text) : null), [parsed, text]);

  const jumpToError = () => {
    if (parsed.ok) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const idx = Math.max(0, Math.min(parsed.error.index, text.length));
    ta.focus();
    ta.setSelectionRange(idx, Math.min(idx + 1, text.length));
    const before = text.slice(0, idx);
    const lineHeight = 24;
    ta.scrollTop = Math.max(0, (before.split('\n').length - 3) * lineHeight);
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="flex flex-col gap-3">
          <label for="json-input" class="sr-only">
            {ui.inputLabel}
          </label>
          <Dropzone
            compact
            accept=".json,application/json"
            onFiles={(files) => {
              const file = files[0];
              if (file) void file.text().then(setText);
            }}
            title={ui.openFile}
            hint={ui.openFileHint}
          />
          <textarea
            id="json-input"
            ref={textareaRef}
            value={text}
            onInput={(e) => setText((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.placeholder}
            spellcheck={false}
            class="min-h-[280px] lg:min-h-[400px] flex-1 w-full resize-y rounded-lg border border-line bg-bg p-4 font-mono text-sm leading-6 text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
          />
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
          {parsed.ok ? (
            <Notice tone="success">{ui.valid}</Notice>
          ) : (
            <Notice tone="danger">
              <span class="font-medium">{ui.errorLabel}: </span>
              {fillTemplate(ui[ERROR_UI_KEY[parsed.error.code]], { token: parsed.error.detail ?? '' })}
              {parsed.error.code !== 'empty' && (
                <>
                  {' '}
                  <span class="tabular">
                    ({fillTemplate(ui.position, { line: parsed.error.line, column: parsed.error.column })})
                  </span>{' '}
                  <button type="button" class="underline font-medium hover:no-underline" onClick={jumpToError}>
                    {ui.jumpToError}
                  </button>
                </>
              )}
            </Notice>
          )}
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <Segmented<ViewMode>
              label={ui.viewLabel}
              value={viewMode}
              onValue={setViewMode}
              options={[
                { value: 'pretty', label: ui.viewPretty },
                { value: 'minified', label: ui.viewMinified },
                { value: 'tree', label: ui.viewTree },
              ]}
            />
            {viewMode === 'pretty' && (
              <Segmented<IndentChoice>
                label={ui.indentLabel}
                value={indent}
                onValue={setIndent}
                options={[
                  { value: '2', label: ui.indent2 },
                  { value: '4', label: ui.indent4 },
                  { value: 'tab', label: ui.indentTab },
                ]}
              />
            )}
            <div class="ml-auto flex items-center gap-2">
              <CopyButton text={resultText} label={ui.copy} copiedLabel={ui.copied} />
              <Button
                size="sm"
                disabled={!parsed.ok}
                onClick={() => downloadBlob(new Blob([resultText], { type: 'application/json' }), 'formatted.json')}
              >
                {ui.download}
              </Button>
            </div>
          </div>
          <Toggle checked={sortKeys} onChecked={setSortKeys} label={ui.sortKeys} />
          <div
            class="min-h-[280px] lg:min-h-[400px] flex-1 overflow-auto rounded-lg border border-line bg-bg p-4"
            aria-live="polite"
          >
            {viewMode === 'tree' && parsed.ok ? (
              <JsonTree value={sorted} ui={ui} />
            ) : (
              <pre class="whitespace-pre-wrap break-all font-mono text-sm leading-6 text-fg">
                {resultText || <span class="text-subtle">{ui.emptyOutput}</span>}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-live="polite">
        <Stat label={ui.statBytes} value={stats ? n(stats.bytes) : '—'} emphasis />
        <Stat label={ui.statCharacters} value={stats ? n(stats.characters) : '—'} />
        <Stat label={ui.statDepth} value={stats ? n(stats.depth) : '—'} />
        <Stat label={ui.statKeys} value={stats ? n(stats.keys) : '—'} />
        <Stat label={ui.statValues} value={stats ? n(stats.values) : '—'} />
      </div>
    </Panel>
  );
}

function JsonTree(props: { value: unknown; ui: UI }) {
  return (
    <div class="font-mono text-sm leading-6">
      <JsonTreeNode value={props.value} ui={props.ui} />
    </div>
  );
}

function JsonTreeNode(props: { keyName?: string; index?: number; value: unknown; ui: UI }) {
  const { value, ui } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [shown, setShown] = useState(INITIAL_ITEMS);

  const keyPrefix =
    props.keyName !== undefined ? (
      <>
        <span class="text-accent">&quot;{props.keyName}&quot;</span>
        <span class="text-muted">: </span>
      </>
    ) : props.index !== undefined ? (
      <>
        <span class="text-subtle">{props.index}</span>
        <span class="text-muted">: </span>
      </>
    ) : null;

  if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
    const isArray = Array.isArray(value);
    const entries: [string | number, unknown][] = isArray
      ? value.map((v, i) => [i, v])
      : Object.entries(value as Record<string, unknown>);
    const open = isArray ? '[' : '{';
    const close = isArray ? ']' : '}';
    const visible = entries.slice(0, shown);
    const isEmpty = entries.length === 0;

    return (
      <div>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded py-0.5 hover:bg-surface-2"
          onClick={() => setCollapsed((c) => !c)}
          disabled={isEmpty}
          aria-expanded={!collapsed}
          aria-label={collapsed ? ui.expand : ui.collapse}
        >
          <span class="inline-block w-3 text-subtle">{isEmpty ? '' : collapsed ? '▸' : '▾'}</span>
          {keyPrefix}
          <span class="text-muted">
            {open}
            {collapsed && !isEmpty ? ' … ' : ''}
            {collapsed || isEmpty ? close : ''}
          </span>
        </button>
        {!collapsed && !isEmpty && (
          <div class="ml-3 border-l border-line pl-3">
            {visible.map(([k, v]) =>
              isArray ? (
                <JsonTreeNode index={k as number} value={v} ui={ui} />
              ) : (
                <JsonTreeNode keyName={k as string} value={v} ui={ui} />
              ),
            )}
            {entries.length > shown && (
              <button
                type="button"
                class="py-1 text-xs text-accent hover:underline"
                onClick={() => setShown((s) => s + SHOW_MORE_STEP)}
              >
                {fillTemplate(ui.showMore, { n: entries.length - shown })}
              </button>
            )}
          </div>
        )}
        {!collapsed && !isEmpty && <div class="text-muted">{close}</div>}
      </div>
    );
  }

  return (
    <div class="py-0.5">
      {keyPrefix}
      <ScalarValue value={value} />
    </div>
  );
}

function ScalarValue(props: { value: unknown }) {
  const { value } = props;
  if (value === null) return <span class="text-subtle">null</span>;
  if (typeof value === 'string') return <span class="text-success">&quot;{value}&quot;</span>;
  if (typeof value === 'number') return <span class="text-accent">{value}</span>;
  if (typeof value === 'boolean') return <span class="text-accent">{String(value)}</span>;
  return <span>{String(value)}</span>;
}

import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Dropzone,
  Field,
  Notice,
  Panel,
  Segmented,
  Select,
  Stat,
  Textarea,
  Toggle,
} from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { convert, type ConversionError, type DelimiterChoice, type Direction, type Indent } from './logic';

const INPUT_KEY = 'tools:csv-json:input';
const DIRECTION_KEY = 'tools:csv-json:direction';
const DELIMITER_KEY = 'tools:csv-json:delimiter';
const HEADER_KEY = 'tools:csv-json:header';
const TYPES_KEY = 'tools:csv-json:types';
const INDENT_KEY = 'tools:csv-json:indent';
const PREVIEW_ROWS = 10;

const errorKey: Record<ConversionError['code'], keyof UI> = {
  'empty-input': 'errorEmpty',
  'unclosed-quote': 'errorUnclosedQuote',
  'unexpected-quote': 'errorUnexpectedQuote',
  'unexpected-character-after-quote': 'errorAfterQuote',
  'duplicate-header': 'errorDuplicateHeader',
  'inconsistent-columns': 'errorColumns',
  'invalid-json': 'errorJson',
  'json-must-be-records': 'errorRecords',
};

function fill(template: string, values: Record<string, string | number | undefined>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value ?? '')),
    template,
  );
}

export default function CsvJson({ locale, ui }: ToolProps<UI>) {
  const [direction, setDirection] = useState<Direction>('csv-to-json');
  const [input, setInput] = useState(ui.sampleCsv);
  const [delimiter, setDelimiter] = useState<DelimiterChoice>('auto');
  const [hasHeader, setHasHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(false);
  const [indent, setIndent] = useState<Indent>(2);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    const savedDirection = safeStorage.get(DIRECTION_KEY);
    if (savedDirection === 'csv-to-json' || savedDirection === 'json-to-csv') setDirection(savedDirection);
    const savedInput = safeStorage.get(INPUT_KEY);
    if (savedInput !== null) setInput(savedInput);
    const savedDelimiter = safeStorage.get(DELIMITER_KEY);
    if (
      savedDelimiter === 'auto' ||
      savedDelimiter === 'comma' ||
      savedDelimiter === 'semicolon' ||
      savedDelimiter === 'tab' ||
      savedDelimiter === 'pipe'
    )
      setDelimiter(savedDelimiter);
    setHasHeader(safeStorage.get(HEADER_KEY) !== '0');
    setInferTypes(safeStorage.get(TYPES_KEY) === '1');
    if (safeStorage.get(INDENT_KEY) === '4') setIndent(4);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (input) safeStorage.set(INPUT_KEY, input);
      else safeStorage.remove(INPUT_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [input]);
  useEffect(() => safeStorage.set(DIRECTION_KEY, direction), [direction]);
  useEffect(() => safeStorage.set(DELIMITER_KEY, delimiter), [delimiter]);
  useEffect(() => safeStorage.set(HEADER_KEY, hasHeader ? '1' : '0'), [hasHeader]);
  useEffect(() => safeStorage.set(TYPES_KEY, inferTypes ? '1' : '0'), [inferTypes]);
  useEffect(() => safeStorage.set(INDENT_KEY, String(indent)), [indent]);

  const result = useMemo(
    () => convert(input, direction, { delimiter, hasHeader, inferTypes, indent }),
    [direction, hasHeader, indent, inferTypes, input, delimiter],
  );
  const output = result.ok ? result.output : '';
  const error = result.ok ? null : fill(ui[errorKey[result.error.code]], result.error);
  const inputLabel = direction === 'csv-to-json' ? ui.inputCsv : ui.inputJson;
  const inputHint = direction === 'csv-to-json' ? ui.inputHintCsv : ui.inputHintJson;
  const outputLabel = direction === 'csv-to-json' ? ui.outputJson : ui.outputCsv;
  const n = (value: number) => formatNumber(value, locale);

  const useResult = () => {
    if (!result.ok) return;
    setInput(result.output);
    setDirection(direction === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json');
    setFileError(null);
  };

  return (
    <Panel>
      <div class="flex flex-col gap-5">
        <Segmented<Direction>
          label={ui.directionLabel}
          value={direction}
          onValue={(value) => {
            setDirection(value);
            setFileError(null);
          }}
          options={[
            { value: 'csv-to-json', label: ui.csvToJson },
            { value: 'json-to-csv', label: ui.jsonToCsv },
          ]}
        />

        <div class="grid gap-4 lg:grid-cols-2">
          <div class="flex min-w-0 flex-col gap-3">
            <Dropzone
              compact
              accept=".csv,.tsv,.json,.txt,text/csv,text/tab-separated-values,application/json,text/plain"
              title={ui.fileTitle}
              hint={ui.fileHint}
              onFiles={(files) => {
                const file = files[0];
                if (!file) return;
                void file.text().then(
                  (contents) => {
                    setInput(contents);
                    if (/\.json$/i.test(file.name)) setDirection('json-to-csv');
                    else if (/\.(csv|tsv)$/i.test(file.name)) setDirection('csv-to-json');
                    setFileError(null);
                  },
                  () => setFileError(ui.fileReadError),
                );
              }}
            />
            {fileError && <Notice tone="danger">{fileError}</Notice>}
            <Field label={inputLabel} hint={inputHint}>
              <Textarea
                value={input}
                onInput={(event) => setInput((event.currentTarget as HTMLTextAreaElement).value)}
                placeholder={direction === 'csv-to-json' ? ui.placeholderCsv : ui.placeholderJson}
                spellcheck={false}
                class="min-h-[280px] font-mono text-sm"
              />
            </Field>
          </div>

          <div class="flex min-w-0 flex-col gap-3">
            <Field label={outputLabel} hint={ui.outputHint}>
              <Textarea
                value={output}
                readOnly
                spellcheck={false}
                class="min-h-[280px] font-mono text-sm"
                aria-live="polite"
              />
            </Field>
            {error && <Notice tone="danger">{error}</Notice>}
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-4 border-t border-line pt-5">
          <Field label={ui.delimiterLabel} class="min-w-44">
            <Select<DelimiterChoice>
              value={delimiter}
              onValue={setDelimiter}
              options={[
                { value: 'auto', label: ui.delimiterAuto },
                { value: 'comma', label: ui.delimiterComma },
                { value: 'semicolon', label: ui.delimiterSemicolon },
                { value: 'tab', label: ui.delimiterTab },
                { value: 'pipe', label: ui.delimiterPipe },
              ]}
            />
          </Field>
          {direction === 'csv-to-json' && (
            <>
              <Toggle checked={hasHeader} onChecked={setHasHeader} label={ui.headerRow} />
              <Toggle checked={inferTypes} onChecked={setInferTypes} label={ui.inferTypes} />
              <Field label={ui.indentLabel} class="min-w-32">
                <Select<'2' | '4'>
                  value={String(indent) as '2' | '4'}
                  onValue={(value) => setIndent(Number(value) as Indent)}
                  options={[
                    { value: '2', label: ui.indent2 },
                    { value: '4', label: ui.indent4 },
                  ]}
                />
              </Field>
            </>
          )}
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <CopyButton text={output} label={ui.copy} copiedLabel={ui.copied} />
          <Button
            size="sm"
            disabled={!result.ok || !output}
            onClick={() =>
              downloadBlob(
                new Blob([output], {
                  type: direction === 'csv-to-json' ? 'application/json' : 'text/csv;charset=utf-8',
                }),
                direction === 'csv-to-json' ? 'converted.json' : 'converted.csv',
              )
            }
          >
            {ui.download}
          </Button>
          <Button size="sm" onClick={useResult} disabled={!result.ok || !output}>
            {ui.useResult}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setInput(direction === 'csv-to-json' ? ui.sampleCsv : ui.sampleJson)}
          >
            {ui.loadSample}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            {ui.clear}
          </Button>
          <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
        </div>

        {result.ok && (
          <>
            <div class="grid grid-cols-2 gap-2 sm:max-w-xs" aria-live="polite">
              <Stat label={ui.rows} value={n(result.rows)} emphasis />
              <Stat label={ui.columns} value={n(result.columns)} />
            </div>
            <section class="border-t border-line pt-5" aria-live="polite">
              <h3 class="text-sm font-medium text-fg">{ui.previewLabel}</h3>
              <p class="mt-1 text-xs text-subtle">{fill(ui.previewHint, { count: PREVIEW_ROWS })}</p>
              {result.preview.rows.length === 0 ? (
                <p class="mt-3 text-sm text-subtle">{ui.previewEmpty}</p>
              ) : (
                <div class="mt-3 overflow-auto rounded-lg border border-line">
                  <table class="w-full min-w-max border-collapse text-left text-sm">
                    <thead class="bg-surface-2 text-fg">
                      <tr>
                        {result.preview.headers.map((header, index) => (
                          <th scope="col" class="border-b border-line px-3 py-2 font-medium" key={`${header}-${index}`}>
                            {header || fill(ui.columnLabel, { number: index + 1 })}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody class="text-muted">
                      {result.preview.rows.slice(0, PREVIEW_ROWS).map((row, rowIndex) => (
                        <tr class="border-b border-line last:border-b-0" key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td class="max-w-64 whitespace-pre-wrap break-words px-3 py-2 align-top" key={cellIndex}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Panel>
  );
}

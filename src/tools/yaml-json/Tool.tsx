import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  FieldGroup,
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
import { type ConvertNote, type ConvertResult, type Direction, convert } from './logic';

const INPUT_KEY = 'tools:yaml-json:input';
const OPTIONS_KEY = 'tools:yaml-json:options';

interface Options {
  direction: Direction;
  indent: 2 | 4;
  sortKeys: boolean;
}

const DEFAULTS: Options = { direction: 'yaml-to-json', indent: 2, sortKeys: false };
const SAMPLE = `# Deployment for the API
service: api
replicas: 3
release: 2026-03-01
tls:
  enabled: true
  minVersion: "1.3"
routes:
  - path: /v1/users
    rateLimit: 120
  - path: /v1/health
    rateLimit: 600
`;

export default function YamlJson({ locale, ui }: ToolProps<UI>) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Options>(DEFAULTS);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setInput(safeStorage.get(INPUT_KEY) ?? SAMPLE);
    const saved = safeStorage.get(OPTIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        setOptions({
          direction: parsed.direction === 'json-to-yaml' ? 'json-to-yaml' : 'yaml-to-json',
          indent: parsed.indent === 4 ? 4 : 2,
          sortKeys: parsed.sortKeys === true,
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

  useEffect(() => {
    let live = true;
    setBusy(true);
    const id = setTimeout(async () => {
      const next = await convert(input, options);
      if (!live) return;
      setResult(next);
      setBusy(false);
    }, 120);
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [input, options]);

  const n = (v: number) => formatNumber(v, locale);
  const text = result?.ok ? result.text : '';
  const set = <K extends keyof Options>(key: K, value: Options[K]) => setOptions((o) => ({ ...o, [key]: value }));

  const notes = useMemo(() => {
    const fmt = (v: number) => formatNumber(v, locale);
    const noteToText = (note: ConvertNote): string | null => {
      switch (note.kind) {
        case 'comments-dropped':
          return ui.noteComments.replace('{count}', fmt(note.count ?? 0));
        case 'merge-applied':
          return ui.noteMerge.replace('{count}', fmt(note.count ?? 0));
        case 'multi-document':
          return ui.noteMultiDocument.replace('{count}', fmt(note.count ?? 0));
        case 'binary':
          return ui.noteBinary;
        case 'unsafe-integer':
          return note.line && note.count
            ? ui.noteUnsafeInteger.replace('{line}', fmt(note.line))
            : ui.noteUnsafeIntegerPlain;
        default:
          return null;
      }
    };
    return {
      info: (result?.notes ?? [])
        .filter((note) => note.kind !== 'unsafe-integer')
        .map(noteToText)
        .filter((t): t is string => !!t),
      caution: (result?.notes ?? [])
        .filter((note) => note.kind === 'unsafe-integer')
        .map(noteToText)
        .filter((t): t is string => !!t),
    };
  }, [result, ui, locale]);

  const outputName = options.direction === 'yaml-to-json' ? 'converted.json' : 'converted.yaml';
  const outputType = options.direction === 'yaml-to-json' ? 'application/json' : 'text/yaml';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="flex min-w-0 flex-col">
          <label for="yaml-json-input" class="mb-1.5 text-sm font-medium text-fg">
            {ui.inputLabel}
          </label>
          <Textarea
            id="yaml-json-input"
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
            <span class="ml-auto text-xs text-subtle" role="status">
              {busy ? ui.converting : saveFailed ? '' : ui.autosaved}
            </span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <FieldGroup label={ui.directionLabel}>
            <Segmented
              value={options.direction}
              onValue={(v) => set('direction', v)}
              label={ui.directionLabel}
              options={[
                { value: 'yaml-to-json', label: ui.toJson },
                { value: 'json-to-yaml', label: ui.toYaml },
              ]}
            />
          </FieldGroup>

          <div class="flex flex-wrap items-end gap-4">
            <FieldGroup label={ui.indentLabel}>
              <Select
                value={String(options.indent) as '2' | '4'}
                onValue={(v) => set('indent', v === '4' ? 4 : 2)}
                ariaLabel={ui.indentLabel}
                options={[
                  { value: '2', label: ui.indent2 },
                  { value: '4', label: ui.indent4 },
                ]}
              />
            </FieldGroup>
            <div class="pb-2">
              <Toggle checked={options.sortKeys} onChecked={(v) => set('sortKeys', v)} label={ui.sortKeys} />
            </div>
          </div>

          <div>
            <label for="yaml-json-output" class="mb-1.5 block text-sm font-medium text-fg">
              {ui.outputLabel}
            </label>
            <Textarea
              id="yaml-json-output"
              value={text}
              readOnly
              placeholder={ui.outputPlaceholder}
              spellcheck={false}
              aria-busy={busy}
              class="min-h-56 bg-surface-2 font-mono text-sm lg:min-h-[300px]"
            />
            <div class="mt-3 flex flex-wrap gap-2">
              <CopyButton text={text} label={ui.copy} copiedLabel={ui.copied} />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => downloadBlob(new Blob([text], { type: outputType }), outputName)}
                disabled={!text}
              >
                {ui.download}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setInput(text);
                  set('direction', options.direction === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json');
                }}
                disabled={!text}
              >
                {ui.swap}
              </Button>
            </div>
          </div>

          {result && !result.ok && result.error ? (
            <Notice tone="danger">
              {result.error.line
                ? ui.errorTitle
                    .replace('{line}', n(result.error.line))
                    .replace('{column}', n(result.error.column ?? 0))
                    .replace('{message}', result.error.message)
                : ui.errorTitleNoLine.replace('{message}', result.error.message)}
            </Notice>
          ) : null}

          {result?.ok ? (
            <div class="grid grid-cols-3 gap-2">
              <Stat label={ui.documents} value={n(result.stats.documents)} />
              <Stat label={ui.keys} value={n(result.stats.keys)} />
              <Stat label={ui.depth} value={n(result.stats.depth)} />
            </div>
          ) : null}

          {notes.info.map((note) => (
            <Notice tone="info">{note}</Notice>
          ))}
          {notes.caution.map((note) => (
            <Notice tone="danger">{note}</Notice>
          ))}
        </div>
      </div>
    </Panel>
  );
}

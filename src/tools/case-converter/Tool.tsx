import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Panel, Segmented } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { type CaseFormat, convertCase } from './logic';

const TEXT_KEY = 'tools:case-converter:text';
const FORMAT_KEY = 'tools:case-converter:format';
const LARGE_TEXT_THRESHOLD = 100_000;
const WORKER_DELAY = 200;
const formats: CaseFormat[] = [
  'upper',
  'lower',
  'sentence',
  'title-ap',
  'title-chicago',
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
];

function isCaseFormat(value: string | null): value is CaseFormat {
  return value !== null && formats.includes(value as CaseFormat);
}

function isDeveloperFormat(value: CaseFormat): value is 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' {
  return value === 'camel' || value === 'pascal' || value === 'snake' || value === 'kebab' || value === 'constant';
}

export default function CaseConverter({ ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<CaseFormat>('title-ap');
  const [largeResult, setLargeResult] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? '');
    const savedFormat = safeStorage.get(FORMAT_KEY);
    if (isCaseFormat(savedFormat)) setFormat(savedFormat);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (text) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => safeStorage.set(FORMAT_KEY, format), [format]);

  const inlineResult = useMemo(
    () => (text.length <= LARGE_TEXT_THRESHOLD ? convertCase(text, format) : null),
    [text, format],
  );

  useEffect(() => {
    const id = ++requestId.current;
    if (inlineResult !== null) {
      setIsConverting(false);
      return;
    }

    setIsConverting(true);
    let worker: Worker | undefined;
    const timeout = setTimeout(() => {
      try {
        worker = new Worker(new URL('./case.worker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (event: MessageEvent<{ id: number; result: string }>) => {
          if (event.data.id !== requestId.current) return;
          setLargeResult(event.data.result);
          setIsConverting(false);
        };
        worker.onerror = () => {
          if (id !== requestId.current) return;
          setLargeResult(convertCase(text, format));
          setIsConverting(false);
        };
        worker.postMessage({ id, text, format });
      } catch {
        // Module workers are supported by current browsers. Keep a working fallback for older ones.
        if (id === requestId.current) {
          setLargeResult(convertCase(text, format));
          setIsConverting(false);
        }
      }
    }, WORKER_DELAY);

    return () => {
      clearTimeout(timeout);
      worker?.terminate();
    };
  }, [text, format, inlineResult]);

  const result = inlineResult ?? largeResult ?? '';
  const titleStyle = format === 'title-chicago' ? 'chicago' : 'ap';
  const updateText = (value: string) => {
    setLargeResult(null);
    setText(value);
  };
  const updateFormat = (value: CaseFormat) => {
    setLargeResult(null);
    setFormat(value);
  };
  const clearText = () => {
    safeStorage.remove(TEXT_KEY);
    updateText('');
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex min-w-0 flex-col">
          <label for="case-input" class="mb-1.5 text-sm font-medium text-fg">
            {ui.inputLabel}
          </label>
          <textarea
            id="case-input"
            value={text}
            onInput={(event) => updateText((event.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.inputPlaceholder}
            spellcheck={false}
            class="min-h-52 w-full flex-1 resize-y rounded-lg border border-line bg-bg p-4 text-base leading-7 text-fg placeholder:text-subtle focus:border-accent lg:min-h-[360px]"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={clearText} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <Field label={ui.writingLabel}>
            <Segmented
              value={format === 'title-chicago' ? 'title-ap' : format}
              onValue={updateFormat}
              label={ui.writingLabel}
              options={[
                { value: 'upper', label: ui.upper },
                { value: 'lower', label: ui.lower },
                { value: 'sentence', label: ui.sentence },
                { value: 'title-ap', label: ui.title },
              ]}
            />
          </Field>

          {format === 'title-ap' || format === 'title-chicago' ? (
            <Field label={ui.titleStyleLabel} hint={ui.titleStyleHint}>
              <Segmented
                value={titleStyle}
                onValue={(style) => updateFormat(style === 'chicago' ? 'title-chicago' : 'title-ap')}
                label={ui.titleStyleLabel}
                options={[
                  { value: 'ap', label: ui.apStyle },
                  { value: 'chicago', label: ui.chicagoStyle },
                ]}
              />
            </Field>
          ) : null}

          <Field label={ui.developerLabel} hint={ui.developerHint}>
            <Segmented
              value={isDeveloperFormat(format) ? format : null}
              onValue={updateFormat}
              label={ui.developerLabel}
              options={[
                { value: 'camel', label: ui.camel },
                { value: 'pascal', label: ui.pascal },
                { value: 'snake', label: ui.snake },
                { value: 'kebab', label: ui.kebab },
                { value: 'constant', label: ui.constant },
              ]}
            />
          </Field>

          <div>
            <label for="case-output" class="mb-1.5 block text-sm font-medium text-fg">
              {ui.outputLabel}
            </label>
            <textarea
              id="case-output"
              value={result}
              readOnly
              aria-busy={isConverting}
              placeholder={ui.outputPlaceholder}
              class="min-h-40 w-full resize-y rounded-lg border border-line bg-surface-2 p-3 text-sm leading-6 text-fg placeholder:text-subtle focus:border-accent"
            />
            <p class="mt-1 min-h-5 text-xs text-subtle" role="status">
              {isConverting ? ui.converting : ''}
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <CopyButton text={result} label={ui.copy} copiedLabel={ui.copied} />
              <Button size="sm" variant="secondary" onClick={() => updateText(result)} disabled={!result}>
                {ui.useResult}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

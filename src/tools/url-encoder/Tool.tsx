import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Segmented, Stat, Textarea, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  buildQuery,
  convert,
  parseQuery,
  type ConversionDirection,
  type QueryParameter,
  type UrlEncodingMode,
} from './logic';

const INPUT_KEY = 'tools:url-encoder:input';
const DIRECTION_KEY = 'tools:url-encoder:direction';
const MODE_KEY = 'tools:url-encoder:mode';

export default function UrlEncoder({ ui }: ToolProps<UI>) {
  const [direction, setDirection] = useState<ConversionDirection>('encode');
  const [mode, setMode] = useState<UrlEncodingMode>('component');
  const [input, setInput] = useState(ui.sampleInput);

  useEffect(() => {
    setInput(safeStorage.get(INPUT_KEY) ?? ui.sampleInput);
    const savedDirection = safeStorage.get(DIRECTION_KEY);
    if (savedDirection === 'encode' || savedDirection === 'decode') setDirection(savedDirection);
    const savedMode = safeStorage.get(MODE_KEY);
    if (savedMode === 'component' || savedMode === 'url' || savedMode === 'form') setMode(savedMode);
  }, [ui.sampleInput]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (input) safeStorage.set(INPUT_KEY, input);
      else safeStorage.remove(INPUT_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  useEffect(() => safeStorage.set(DIRECTION_KEY, direction), [direction]);
  useEffect(() => safeStorage.set(MODE_KEY, mode), [mode]);

  const result = useMemo(() => convert(input, direction, mode), [input, direction, mode]);
  const output = result.ok ? result.value : '';
  const query = useMemo(() => parseQuery(input), [input]);

  const updateQuery = (index: number, key: 'name' | 'value', value: string) => {
    if (!query) return;
    const parameters = query.parameters.map((parameter, parameterIndex) =>
      parameterIndex === index
        ? { ...parameter, [key]: value, hasEquals: key === 'value' ? true : parameter.hasEquals }
        : parameter,
    );
    setInput(buildQuery(query, parameters));
  };

  const removeQuery = (index: number) => {
    if (!query) return;
    setInput(
      buildQuery(
        query,
        query.parameters.filter((_, parameterIndex) => parameterIndex !== index),
      ),
    );
  };

  const addQuery = () => {
    if (!query) return;
    const parameter: QueryParameter = { name: '', value: '', hasEquals: true };
    setInput(buildQuery(query, [...query.parameters, parameter]));
  };

  const swap = () => {
    if (!result.ok) return;
    setInput(result.value);
    setDirection(direction === 'encode' ? 'decode' : 'encode');
  };

  const error = !result.ok
    ? result.error.code === 'invalid-percent-encoding'
      ? ui.errorInvalidPercent.replace('{index}', String((result.error.index ?? 0) + 1))
      : ui.errorInvalidUtf8
    : null;

  return (
    <Panel>
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap gap-3">
          <div>
            <span class="mb-1.5 block text-sm font-medium text-fg">{ui.directionLabel}</span>
            <Segmented<ConversionDirection>
              label={ui.directionLabel}
              value={direction}
              onValue={setDirection}
              options={[
                { value: 'encode', label: ui.encode },
                { value: 'decode', label: ui.decode },
              ]}
            />
          </div>
          <div>
            <span class="mb-1.5 block text-sm font-medium text-fg">{ui.scopeLabel}</span>
            <Segmented<UrlEncodingMode>
              label={ui.scopeLabel}
              value={mode}
              onValue={setMode}
              options={[
                { value: 'component', label: ui.scopeComponent },
                { value: 'url', label: ui.scopeUrl },
                { value: 'form', label: ui.scopeForm },
              ]}
            />
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <Field label={ui.inputLabel} hint={ui.inputHint}>
            <Textarea
              value={input}
              onInput={(event) => setInput((event.currentTarget as HTMLTextAreaElement).value)}
              placeholder={ui.inputPlaceholder}
              spellcheck={false}
              class="min-h-56 font-mono text-sm"
            />
          </Field>
          <Field label={ui.outputLabel} hint={error ? undefined : ui.outputHint}>
            <Textarea value={output} readOnly spellcheck={false} class="min-h-56 font-mono text-sm" />
          </Field>
        </div>

        {error && <Notice tone="danger">{error}</Notice>}

        <div class="flex flex-wrap items-center gap-2">
          <CopyButton text={output} label={ui.copy} copiedLabel={ui.copied} />
          <Button size="sm" onClick={swap} disabled={!result.ok || !output}>
            {ui.swap}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            {ui.clear}
          </Button>
          <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:max-w-sm" aria-live="polite">
          <Stat label={ui.inputCharacters} value={[...input].length} />
          <Stat label={ui.outputCharacters} value={[...output].length} />
        </div>

        {query && (
          <section class="border-t border-line pt-5">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-medium text-fg">{ui.queryTableLabel}</h3>
                <p class="mt-1 text-xs text-subtle">{ui.queryTableHint}</p>
              </div>
              <Button size="sm" onClick={addQuery}>
                {ui.addParameter}
              </Button>
            </div>
            {query.parameters.length === 0 ? (
              <p class="text-sm text-subtle">{ui.queryEmpty}</p>
            ) : (
              <div class="flex flex-col gap-2">
                {query.parameters.map((parameter, index) => (
                  <div
                    class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"
                    key={`${index}-${parameter.name}`}
                  >
                    <TextInput
                      value={parameter.name}
                      onInput={(event) => updateQuery(index, 'name', (event.currentTarget as HTMLInputElement).value)}
                      aria-label={ui.parameterName}
                      placeholder={ui.parameterName}
                    />
                    <TextInput
                      value={parameter.value}
                      onInput={(event) => updateQuery(index, 'value', (event.currentTarget as HTMLInputElement).value)}
                      aria-label={ui.parameterValue}
                      placeholder={ui.parameterValue}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeQuery(index)}
                      aria-label={ui.removeParameter}
                    >
                      {ui.removeParameter}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </Panel>
  );
}

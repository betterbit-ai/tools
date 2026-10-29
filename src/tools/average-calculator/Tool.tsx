import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Segmented, Stat, Textarea } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateStatistics, parseNumbers, type DeviationKind } from './logic';

const VALUES_KEY = 'tools:average-calculator:values';
const DEVIATION_KEY = 'tools:average-calculator:deviation';

function isDeviationKind(value: string | null): value is DeviationKind {
  return value === 'population' || value === 'sample';
}

export default function AverageCalculator({ locale, ui }: ToolProps<UI>) {
  const [input, setInput] = useState(ui.defaultValues);
  const [deviation, setDeviation] = useState<DeviationKind>('sample');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setInput(safeStorage.get(VALUES_KEY) ?? ui.defaultValues);
    const savedDeviation = safeStorage.get(DEVIATION_KEY);
    setDeviation(isDeviationKind(savedDeviation) ? savedDeviation : 'sample');
    setReady(true);
  }, [ui.defaultValues]);

  useEffect(() => {
    if (!ready) return;
    if (input) safeStorage.set(VALUES_KEY, input);
    else safeStorage.remove(VALUES_KEY);
  }, [input, ready]);

  useEffect(() => {
    if (ready) safeStorage.set(DEVIATION_KEY, deviation);
  }, [deviation, ready]);

  const parsed = useMemo(() => parseNumbers(input), [input]);
  const result = useMemo(() => calculateStatistics(parsed.values, deviation), [parsed.values, deviation]);
  const n = (value: number) => formatNumber(value, locale, 8);
  const valueOrDash = (value: number | null) => (value === null ? '—' : n(value));
  const mode = result ? (result.modes.length ? result.modes.map(n).join(', ') : ui.noMode) : '—';
  const copyText = result
    ? ui.copySummary
        .replace('{mean}', n(result.mean))
        .replace('{median}', n(result.median))
        .replace('{mode}', mode)
        .replace('{standardDeviation}', valueOrDash(result.standardDeviation))
        .replace('{count}', n(result.count))
        .replace('{sum}', n(result.sum))
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Field label={ui.inputLabel} hint={ui.inputHint}>
            <Textarea
              value={input}
              onInput={(event) => setInput(event.currentTarget.value)}
              placeholder={ui.inputPlaceholder}
              spellcheck={false}
              aria-label={ui.inputLabel}
              aria-describedby="average-autosaved"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setInput(ui.defaultValues)}>
              {ui.example}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {ui.clear}
            </Button>
            <span id="average-autosaved" class="ml-auto text-xs text-subtle">
              {ui.autosaved}
            </span>
          </div>
          {parsed.invalid.length > 0 && (
            <div class="mt-3">
              <Notice tone="danger">{ui.invalidValues.replace('{n}', n(parsed.invalid.length))}</Notice>
            </div>
          )}
        </div>

        <div class="flex flex-col gap-4">
          <Field label={ui.deviationLabel} hint={ui.deviationHint}>
            <Segmented<DeviationKind>
              value={deviation}
              onValue={setDeviation}
              label={ui.deviationLabel}
              options={[
                { value: 'sample', label: ui.sample },
                { value: 'population', label: ui.population },
              ]}
            />
          </Field>
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
            <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          </div>
          {!result ? (
            <Notice tone="info">{ui.emptyInput}</Notice>
          ) : (
            <div class="grid grid-cols-2 gap-2" aria-live="polite">
              <Stat label={ui.mean} value={n(result.mean)} emphasis />
              <Stat label={ui.median} value={n(result.median)} emphasis />
              <Stat label={ui.mode} value={mode} />
              <Stat label={ui.standardDeviation} value={valueOrDash(result.standardDeviation)} />
              <Stat label={ui.count} value={n(result.count)} />
              <Stat label={ui.sum} value={n(result.sum)} />
              <Stat label={ui.min} value={n(result.min)} />
              <Stat label={ui.max} value={n(result.max)} />
              <Stat label={ui.range} value={n(result.range)} />
              <Stat label={ui.variance} value={valueOrDash(result.variance)} />
            </div>
          )}
          {result && (
            <p class="font-mono text-xs leading-5 text-subtle">
              {deviation === 'sample' ? ui.sampleFormula : ui.populationFormula}
            </p>
          )}
        </div>
      </div>
      <div class="mt-5">
        <Notice>{ui.privacyNotice}</Notice>
      </div>
    </Panel>
  );
}

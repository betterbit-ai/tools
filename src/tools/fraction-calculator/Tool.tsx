import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  calculate,
  formatDecimal,
  formatFraction,
  formatMixedNumber,
  formatRawFraction,
  parseFraction,
  type Calculation,
  type FractionInputError,
  type Operation,
} from './logic';

const STORAGE_KEY = 'tools:fraction-calculator:state';

interface SavedState {
  first: string;
  second: string;
  operation: Operation;
}

const DEFAULT_STATE: SavedState = { first: '1/2', second: '1/3', operation: 'add' };
const operators: Record<Operation, string> = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

export default function FractionCalculator({ ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<SavedState>(DEFAULT_STATE);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (saved && typeof saved === 'object') setState({ ...DEFAULT_STATE, ...saved });
    } catch {
      /* Ignore malformed local state. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const first = useMemo(() => parseFraction(state.first), [state.first]);
  const second = useMemo(() => parseFraction(state.second), [state.second]);
  const calculation = useMemo(
    () => ('value' in first && 'value' in second ? calculate(first.value, state.operation, second.value) : null),
    [first, second, state.operation],
  );
  const setValue = (key: 'first' | 'second', value: string) => setState((current) => ({ ...current, [key]: value }));
  const error =
    'error' in first
      ? first.error
      : 'error' in second
        ? second.error
        : calculation?.divisorIsZero
          ? 'divide-by-zero'
          : null;

  return (
    <Panel>
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <Field label={ui.firstLabel} hint={ui.inputHint}>
              <TextInput
                value={state.first}
                inputMode="text"
                onInput={(event) => setValue('first', (event.currentTarget as HTMLInputElement).value)}
              />
            </Field>
            <Field label={ui.secondLabel} hint={ui.inputHint}>
              <TextInput
                value={state.second}
                inputMode="text"
                onInput={(event) => setValue('second', (event.currentTarget as HTMLInputElement).value)}
              />
            </Field>
          </div>
          <div>
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.operationLabel}</p>
            <Segmented
              label={ui.operationLabel}
              value={state.operation}
              onValue={(operation) => setState((current) => ({ ...current, operation }))}
              options={[
                { value: 'add', label: `+ ${ui.add}` },
                { value: 'subtract', label: `− ${ui.subtract}` },
                { value: 'multiply', label: `× ${ui.multiply}` },
                { value: 'divide', label: `÷ ${ui.divide}` },
              ]}
            />
          </div>
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
          {error || !calculation ? (
            <div class="mt-3">
              <Notice tone="danger">{errorMessage(error, ui)}</Notice>
            </div>
          ) : (
            <Answer calculation={calculation} ui={ui} />
          )}
        </div>
      </div>

      {!error && calculation && <Working calculation={calculation} operation={state.operation} ui={ui} />}
      <div class="mt-5">
        <Notice>{ui.privacyNotice}</Notice>
      </div>
    </Panel>
  );
}

function Answer(props: { calculation: Calculation; ui: UI }) {
  const fraction = formatFraction(props.calculation.result);
  const mixed = formatMixedNumber(props.calculation.result);
  const decimal = formatDecimal(props.calculation.result);
  return (
    <div aria-live="polite" class="mt-3 space-y-2">
      <div class="grid grid-cols-2 gap-2">
        <Stat label={props.ui.simplifiedLabel} value={fraction} emphasis />
        <Stat label={props.ui.mixedLabel} value={mixed} />
      </div>
      <Stat label={props.ui.decimalLabel} value={decimal} />
      <p class="text-xs text-subtle">{props.ui.decimalHint}</p>
      <CopyButton text={fraction} label={props.ui.copy} copiedLabel={props.ui.copied} />
    </div>
  );
}

function Working(props: { calculation: Calculation; operation: Operation; ui: UI }) {
  const { calculation, operation, ui } = props;
  const first = formatFraction(calculation.first);
  const second = formatFraction(calculation.second);
  const result = formatFraction(calculation.result);
  const raw = formatRawFraction(calculation.rawResult);
  const operator = operators[operation];
  const isSimplified = raw === result;
  let lines: string[];

  if (operation === 'add' || operation === 'subtract') {
    const denominator = calculation.commonDenominator!;
    const convertedFirst = formatRawFraction({
      numerator: calculation.first.numerator * (denominator / calculation.first.denominator),
      denominator,
    });
    const convertedSecond = formatRawFraction({
      numerator: calculation.second.numerator * (denominator / calculation.second.denominator),
      denominator,
    });
    lines = [
      replace(ui.commonDenominator, {
        denominator: denominator.toString(),
        first: convertedFirst,
        operator,
        second: convertedSecond,
      }),
      replace(ui.combine, { first: convertedFirst, operator, second: convertedSecond, raw }),
    ];
  } else if (operation === 'multiply') {
    lines = [replace(ui.multiplyStep, { first, second, raw })];
  } else {
    const reciprocal = formatFraction(calculation.reciprocal!);
    lines = [
      replace(ui.divideStep, { first, second, reciprocal }),
      replace(ui.multiplyStep, { first, second: reciprocal, raw }),
    ];
  }

  lines.push(isSimplified ? replace(ui.alreadySimplified, { result }) : replace(ui.simplifyStep, { raw, result }));
  const copyText = [result, ...lines].join('\n');
  return (
    <div class="mt-5 border-t border-line pt-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm font-medium text-fg">{ui.workHeading}</p>
        <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
      </div>
      <ol class="mt-3 space-y-2 text-sm leading-6 text-muted">
        {lines.map((line) => (
          <li class="rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-xs text-fg">{line}</li>
        ))}
      </ol>
    </div>
  );
}

function errorMessage(error: FractionInputError | 'divide-by-zero' | null, ui: UI): string {
  if (error === 'empty') return ui.inputEmpty;
  if (error === 'zero-denominator') return ui.inputZeroDenominator;
  if (error === 'too-large') return ui.inputTooLarge;
  if (error === 'divide-by-zero') return ui.divideByZero;
  return ui.inputInvalid;
}

function replace(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { applyDiscounts, findDiscountRate, findOriginalPrice, isValidRate, parsePrice } from './logic';

const STORAGE_KEY = 'tools:discount-calculator:state';

type Mode = 'apply' | 'rate' | 'original';

interface PersistedState {
  mode: Mode;
  original: string;
  final: string;
  first: string;
  second: string;
  third: string;
}

const DEFAULT_STATE: PersistedState = {
  mode: 'apply',
  original: '100',
  final: '72',
  first: '20',
  second: '10',
  third: '',
};

const rateKeys = ['first', 'second', 'third'] as const;

export default function DiscountCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);

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

  const update = (patch: Partial<PersistedState>) => setState((current) => ({ ...current, ...patch }));
  const money = (value: number) => formatNumber(value, locale, 2);
  const percent = (value: number) => formatNumber(value, locale, 4);

  const rates = useMemo(() => {
    const parsed = rateKeys.map((key) => (state[key] === '' ? null : parsePrice(state[key])));
    if (parsed.some((value, index) => state[rateKeys[index]] !== '' && value === null)) return null;
    const values = parsed.filter((value): value is number => value !== null);
    return values.every(isValidRate) ? values : null;
  }, [state.first, state.second, state.third]);

  const rateError = rates === null || rates.length === 0;
  const original = useMemo(() => parsePrice(state.original), [state.original]);
  const final = useMemo(() => parsePrice(state.final), [state.final]);
  const applyResult = useMemo(
    () => (original !== null && rates ? applyDiscounts(original, rates) : null),
    [original, rates],
  );
  const discountRate = useMemo(
    () => (original !== null && final !== null ? findDiscountRate(original, final) : null),
    [original, final],
  );
  const recoveredOriginal = useMemo(
    () => (final !== null && rates ? findOriginalPrice(final, rates) : null),
    [final, rates],
  );

  const rateProduct = rates?.reduce((product, rate) => product * (1 - rate / 100), 1) ?? 0;
  const remaining = `${percent(rateProduct * 100)}%`;
  const input = (key: Exclude<keyof PersistedState, 'mode'>, label: string, hint: string) => (
    <Field label={label} hint={hint}>
      <TextInput
        value={state[key]}
        inputMode="decimal"
        placeholder={key === 'original' || key === 'final' ? ui.pricePlaceholder : ui.ratePlaceholder}
        onInput={(event) => update({ [key]: (event.currentTarget as HTMLInputElement).value })}
      />
    </Field>
  );

  const applyCopy = applyResult
    ? ui.copyApply
        .replaceAll('{original}', money(original!))
        .replaceAll('{final}', money(applyResult.finalPrice))
        .replaceAll('{saved}', money(applyResult.saved))
        .replaceAll('{rate}', percent(applyResult.effectivePercent))
    : '';
  const rateCopy =
    discountRate !== null
      ? ui.copyRate
          .replaceAll('{original}', money(original!))
          .replaceAll('{final}', money(final!))
          .replaceAll('{rate}', percent(discountRate))
      : '';
  const originalCopy =
    recoveredOriginal !== null
      ? ui.copyOriginal
          .replaceAll('{final}', money(final!))
          .replaceAll('{original}', money(recoveredOriginal))
          .replaceAll('{rate}', percent((1 - rateProduct) * 100))
      : '';

  return (
    <Panel>
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-4">
        <p class="mb-1.5 text-sm font-medium text-fg">{ui.modeLabel}</p>
        <Segmented
          label={ui.modeLabel}
          value={state.mode}
          onValue={(mode) => update({ mode })}
          options={[
            { value: 'apply', label: ui.modeApply },
            { value: 'rate', label: ui.modeRate },
            { value: 'original', label: ui.modeOriginal },
          ]}
        />
      </div>

      <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div class="space-y-4">
          {state.mode === 'apply' && input('original', ui.originalLabel, ui.originalHint)}
          {state.mode === 'rate' && (
            <div class="grid gap-4 sm:grid-cols-2">
              {input('original', ui.originalLabel, ui.originalHint)}
              {input('final', ui.finalLabel, ui.finalHint)}
            </div>
          )}
          {state.mode === 'original' && input('final', ui.finalLabel, ui.finalHint)}

          {state.mode !== 'rate' && (
            <div class="grid gap-4 sm:grid-cols-3">
              {input('first', ui.firstDiscountLabel, ui.firstDiscountHint)}
              {input('second', ui.secondDiscountLabel, ui.laterDiscountHint)}
              {input('third', ui.thirdDiscountLabel, ui.laterDiscountHint)}
            </div>
          )}
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
          <div class="mt-3">
            {state.mode === 'apply' && (
              <ApplyResult
                result={applyResult}
                original={original}
                rateError={rateError}
                money={money}
                percent={percent}
                ui={ui}
              />
            )}
            {state.mode === 'rate' && (
              <RateResult
                rate={discountRate}
                original={original}
                final={final}
                money={money}
                percent={percent}
                ui={ui}
              />
            )}
            {state.mode === 'original' && (
              <OriginalResult
                original={recoveredOriginal}
                final={final}
                rates={rates}
                remaining={remaining}
                money={money}
                percent={percent}
                ui={ui}
              />
            )}
          </div>

          {(applyCopy || rateCopy || originalCopy) && (
            <div class="mt-3">
              <CopyButton text={applyCopy || rateCopy || originalCopy} label={ui.copy} copiedLabel={ui.copied} />
            </div>
          )}
        </div>
      </div>

      <div class="mt-5">
        <Notice>{ui.privacyNotice}</Notice>
      </div>
    </Panel>
  );
}

function ApplyResult(props: {
  result: ReturnType<typeof applyDiscounts>;
  original: number | null;
  rateError: boolean;
  money: (value: number) => string;
  percent: (value: number) => string;
  ui: UI;
}) {
  if (props.original === null) return <Notice tone="danger">{props.ui.invalidPrice}</Notice>;
  if (props.rateError || !props.result) return <Notice tone="danger">{props.ui.invalidRate}</Notice>;
  const result = props.result;
  const remaining = result.finalPrice / props.original;
  return (
    <div aria-live="polite" class="space-y-2">
      <div class="grid grid-cols-2 gap-2">
        <Stat label={props.ui.finalPriceLabel} value={props.money(result.finalPrice)} emphasis />
        <Stat label={props.ui.savedLabel} value={props.money(result.saved)} />
      </div>
      <Stat label={props.ui.effectiveRateLabel} value={`${props.percent(result.effectivePercent)}%`} />
      <div class="border-t border-line pt-3 text-xs text-muted">
        {result.prices.map((price, index) => (
          <p class="flex justify-between gap-3 py-0.5">
            <span>
              {props.ui.afterDiscount.replace(
                '{rate}',
                props.percent((1 - price / (index === 0 ? props.original! : result.prices[index - 1])) * 100),
              )}
            </span>
            <span class="tabular text-fg">{props.money(price)}</span>
          </p>
        ))}
      </div>
      <p class="font-mono text-xs text-subtle">
        {props.ui.formulaApply
          .replaceAll('{original}', props.money(props.original))
          .replaceAll('{remaining}', props.percent(remaining))
          .replaceAll('{final}', props.money(result.finalPrice))}
      </p>
    </div>
  );
}

function RateResult(props: {
  rate: number | null;
  original: number | null;
  final: number | null;
  money: (value: number) => string;
  percent: (value: number) => string;
  ui: UI;
}) {
  if (props.original === null || props.final === null) return <Notice tone="danger">{props.ui.invalidPrice}</Notice>;
  if (props.rate === null) return <Notice tone="danger">{props.ui.rateImpossible}</Notice>;
  return (
    <div aria-live="polite" class="space-y-3">
      <Stat label={props.ui.discountRateLabel} value={`${props.percent(props.rate)}%`} emphasis />
      <Stat label={props.ui.savedLabel} value={props.money(props.original - props.final)} />
      <p class="font-mono text-xs text-subtle">
        {props.ui.formulaRate
          .replaceAll('{original}', props.money(props.original))
          .replaceAll('{final}', props.money(props.final))
          .replaceAll('{rate}', props.percent(props.rate))}
      </p>
    </div>
  );
}

function OriginalResult(props: {
  original: number | null;
  final: number | null;
  rates: number[] | null;
  remaining: string;
  money: (value: number) => string;
  percent: (value: number) => string;
  ui: UI;
}) {
  if (props.final === null) return <Notice tone="danger">{props.ui.invalidPrice}</Notice>;
  if (!props.rates || props.rates.length === 0) return <Notice tone="danger">{props.ui.invalidRate}</Notice>;
  if (props.original === null) return <Notice tone="danger">{props.ui.originalImpossible}</Notice>;
  const effective = props.rates.reduce((product, rate) => product * (1 - rate / 100), 1);
  return (
    <div aria-live="polite" class="space-y-3">
      <Stat label={props.ui.originalPriceLabel} value={props.money(props.original)} emphasis />
      <Stat label={props.ui.effectiveRateLabel} value={`${props.percent((1 - effective) * 100)}%`} />
      <p class="font-mono text-xs text-subtle">
        {props.ui.formulaOriginal
          .replaceAll('{final}', props.money(props.final))
          .replaceAll('{remaining}', props.remaining)
          .replaceAll('{original}', props.money(props.original))}
      </p>
    </div>
  );
}

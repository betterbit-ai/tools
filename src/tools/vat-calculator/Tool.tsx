import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  FieldGroup,
  Notice,
  Panel,
  Segmented,
  Select,
  Stat,
  TextInput,
  cx,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { MAX_AMOUNT, MAX_RATE, calculateVat, displayVat, readVatNumber, type VatMode } from './logic';

const STORAGE_KEY = 'tools:vat-calculator:state';

type RatePreset = 'kr' | 'uk' | 'de' | 'fr' | 'ie' | 'dk' | 'custom';

interface State {
  amount: number | '';
  rate: number | '';
  mode: VatMode;
  preset: RatePreset;
}

function defaultState(locale: ToolProps<UI>['locale']): State {
  return {
    amount: locale === 'ko' ? 100_000 : 100,
    rate: locale === 'ko' ? 10 : 20,
    mode: 'add',
    preset: locale === 'ko' ? 'kr' : 'uk',
  };
}

function isMode(value: unknown): value is VatMode {
  return value === 'add' || value === 'remove';
}

function isPreset(value: unknown): value is RatePreset {
  return (
    value === 'kr' ||
    value === 'uk' ||
    value === 'de' ||
    value === 'fr' ||
    value === 'ie' ||
    value === 'dk' ||
    value === 'custom'
  );
}

function isFiniteValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(fallback: State): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallback;
    return {
      amount: isFiniteValue(saved.amount) ? saved.amount : fallback.amount,
      rate: isFiniteValue(saved.rate) ? saved.rate : fallback.rate,
      mode: isMode(saved.mode) ? saved.mode : fallback.mode,
      preset: isPreset(saved.preset) ? saved.preset : fallback.preset,
    };
  } catch {
    return fallback;
  }
}

const asText = (value: number | '') => (value === '' ? '' : String(value));

export default function VatCalculator({ locale, ui }: ToolProps<UI>) {
  const initialState = defaultState(locale);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(initialState);
  /** The fields keep exactly what was typed, so "1,234.56" and "7.5" are never rewritten mid-entry. */
  const [amountText, setAmountText] = useState(() => asText(initialState.amount));
  const [rateText, setRateText] = useState(() => asText(initialState.rate));
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    const restored = restoreState(initialState);
    setState(restored);
    setAmountText(asText(restored.amount));
    setRateText(asText(restored.rate));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // The page says the settings stay in this browser; blocked storage has to say otherwise.
    setSaveFailed(!safeStorage.trySet(STORAGE_KEY, JSON.stringify(state)));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const amountReading = readVatNumber(amountText);
  const rateReading = readVatNumber(rateText);
  const amountValue = amountReading.status === 'valid' ? amountReading.value : null;
  const rateValue = rateReading.status === 'valid' ? rateReading.value : null;

  const amountIssue =
    amountReading.status === 'empty'
      ? 'empty'
      : amountValue === null || amountValue < 0 || amountValue > MAX_AMOUNT
        ? 'invalid-amount'
        : null;
  const rateIssue =
    rateReading.status === 'empty'
      ? 'empty'
      : rateValue === null || rateValue < 0 || rateValue > MAX_RATE
        ? 'invalid-rate'
        : null;

  const result = useMemo(
    () =>
      amountValue === null || rateValue === null
        ? null
        : calculateVat({ amount: amountValue, rate: rateValue, mode: state.mode }),
    [amountValue, rateValue, state.mode],
  );
  const shown = result ? displayVat(result) : null;
  const money = (value: number) => formatNumber(value, locale, 2);
  const rate = rateValue ?? 0;
  const amount = amountValue ?? 0;
  const inputLabel = state.mode === 'add' ? ui.netInputLabel : ui.grossInputLabel;

  const formula =
    shown &&
    (state.mode === 'add'
      ? ui.addFormula
          .replaceAll('{amount}', money(amount))
          .replaceAll('{rate}', money(rate))
          .replaceAll('{tax}', money(shown.tax))
          .replaceAll('{gross}', money(shown.gross))
      : ui.removeFormula
          .replaceAll('{amount}', money(amount))
          .replaceAll('{rate}', money(rate))
          .replaceAll('{net}', money(shown.net))
          .replaceAll('{tax}', money(shown.tax)));
  const copyText = shown
    ? `${ui.netLabel}: ${money(shown.net)}\n${ui.taxLabel}: ${money(shown.tax)}\n${ui.grossLabel}: ${money(
        shown.gross,
      )}\n${ui.rateLabel}: ${money(rate)}%`
    : '';

  const message =
    amountIssue === 'invalid-amount'
      ? ui.invalidAmount.replace('{max}', new Intl.NumberFormat(locale).format(MAX_AMOUNT))
      : amountIssue === 'empty'
        ? ui.amountRequired
        : ui.invalidRate;

  const selectPreset = (preset: RatePreset) => {
    const rates: Record<Exclude<RatePreset, 'custom'>, number> = { kr: 10, uk: 20, de: 19, fr: 20, ie: 23, dk: 25 };
    if (preset === 'custom') {
      update({ preset });
      return;
    }
    update({ preset, rate: rates[preset] });
    setRateText(String(rates[preset]));
  };

  const reset = () => {
    const fresh = defaultState(locale);
    setState(fresh);
    setAmountText(asText(fresh.amount));
    setRateText(asText(fresh.rate));
  };

  const onAmountText = (next: string) => {
    setAmountText(next);
    const reading = readVatNumber(next);
    update({ amount: reading.status === 'valid' ? reading.value : '' });
  };

  const onRateText = (next: string) => {
    setRateText(next);
    const reading = readVatNumber(next);
    update({ rate: reading.status === 'valid' ? reading.value : '', preset: 'custom' });
  };

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class={cx('shrink-0 text-xs', saveFailed ? 'text-danger' : 'text-subtle')}>
          {saveFailed ? ui.saveFailed : ui.autosaved}
        </span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex flex-col gap-4">
          <FieldGroup label={ui.modeLabel} hint={ui.modeHint}>
            <Segmented<VatMode>
              label={ui.modeLabel}
              value={state.mode}
              onValue={(mode) => update({ mode })}
              options={[
                { value: 'add', label: ui.addMode },
                { value: 'remove', label: ui.removeMode },
              ]}
            />
          </FieldGroup>

          <FieldGroup label={ui.presetLabel} hint={ui.presetHint}>
            <Select<RatePreset>
              value={state.preset}
              onValue={selectPreset}
              ariaLabel={ui.presetLabel}
              options={[
                { value: 'kr', label: ui.krRate },
                { value: 'uk', label: ui.ukRate },
                { value: 'de', label: ui.deRate },
                { value: 'fr', label: ui.frRate },
                { value: 'ie', label: ui.ieRate },
                { value: 'dk', label: ui.dkRate },
                { value: 'custom', label: ui.customRate },
              ]}
            />
          </FieldGroup>

          <div class="grid grid-cols-2 gap-3">
            <Field label={inputLabel} hint={ui.amountHint}>
              <TextInput
                inputMode="decimal"
                autoComplete="off"
                spellcheck={false}
                value={amountText}
                placeholder="100000"
                onInput={(event) => onAmountText(event.currentTarget.value)}
              />
            </Field>
            <Field label={ui.rateLabel} hint={ui.rateHint}>
              <TextInput
                inputMode="decimal"
                autoComplete="off"
                spellcheck={false}
                value={rateText}
                placeholder="10"
                onInput={(event) => onRateText(event.currentTarget.value)}
              />
            </Field>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
          {!shown ? (
            <Notice tone="danger">{message}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.netLabel} value={money(shown.net)} emphasis />
                <Stat label={ui.taxLabel} value={money(shown.tax)} emphasis />
                <Stat label={ui.grossLabel} value={money(shown.gross)} />
                <Stat label={ui.rateResultLabel} value={`${money(rate)}%`} />
              </div>
              <div class="rounded-md border border-line bg-surface-2 p-3">
                <p class="text-xs font-medium text-muted">{ui.formulaHeading}</p>
                <p class="mt-1 font-mono text-xs leading-5 text-fg">{formula}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
                <Button size="sm" variant="ghost" onClick={reset}>
                  {ui.reset}
                </Button>
              </div>
            </>
          )}
          <Notice tone="info">{ui.taxNotice}</Notice>
        </div>
      </div>
    </Panel>
  );
}

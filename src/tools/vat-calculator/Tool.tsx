import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Segmented, Select, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateVat, type VatMode } from './logic';

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

export default function VatCalculator({ locale, ui }: ToolProps<UI>) {
  const initialState = defaultState(locale);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    setState(restoreState(initialState));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateVat(state), [state]);
  const money = (value: number) => formatNumber(value, locale, 2);
  const rate = typeof state.rate === 'number' && Number.isFinite(state.rate) ? state.rate : 0;
  const amount = typeof state.amount === 'number' && Number.isFinite(state.amount) ? state.amount : 0;
  const inputLabel = state.mode === 'add' ? ui.netInputLabel : ui.grossInputLabel;
  const formula =
    result &&
    (state.mode === 'add'
      ? ui.addFormula
          .replaceAll('{amount}', money(amount))
          .replaceAll('{rate}', money(rate))
          .replaceAll('{tax}', money(result.tax))
          .replaceAll('{gross}', money(result.gross))
      : ui.removeFormula
          .replaceAll('{amount}', money(amount))
          .replaceAll('{rate}', money(rate))
          .replaceAll('{net}', money(result.net))
          .replaceAll('{tax}', money(result.tax)));
  const copyText = result
    ? `${ui.netLabel}: ${money(result.net)}\n${ui.taxLabel}: ${money(result.tax)}\n${ui.grossLabel}: ${money(result.gross)}\n${ui.rateLabel}: ${money(rate)}%`
    : '';

  const selectPreset = (preset: RatePreset) => {
    const rates: Record<Exclude<RatePreset, 'custom'>, number> = { kr: 10, uk: 20, de: 19, fr: 20, ie: 23, dk: 25 };
    update({ preset, ...(preset === 'custom' ? {} : { rate: rates[preset] }) });
  };

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex flex-col gap-4">
          <Field label={ui.modeLabel} hint={ui.modeHint}>
            <Segmented<VatMode>
              label={ui.modeLabel}
              value={state.mode}
              onValue={(mode) => update({ mode })}
              options={[
                { value: 'add', label: ui.addMode },
                { value: 'remove', label: ui.removeMode },
              ]}
            />
          </Field>

          <Field label={ui.presetLabel} hint={ui.presetHint}>
            <Select<RatePreset>
              value={state.preset}
              onValue={selectPreset}
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
          </Field>

          <div class="grid grid-cols-2 gap-3">
            <Field label={inputLabel} hint={ui.amountHint}>
              <NumberInput
                value={state.amount}
                min="0"
                max="1000000000000000"
                step="any"
                onValue={(amount) => update({ amount })}
              />
            </Field>
            <Field label={ui.rateLabel} hint={ui.rateHint}>
              <NumberInput
                value={state.rate}
                min="0"
                max="100"
                step="0.01"
                onValue={(rate) => update({ rate, preset: 'custom' })}
              />
            </Field>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.netLabel} value={money(result.net)} emphasis />
                <Stat label={ui.taxLabel} value={money(result.tax)} emphasis />
                <Stat label={ui.grossLabel} value={money(result.gross)} />
                <Stat label={ui.rateResultLabel} value={`${money(rate)}%`} />
              </div>
              <div class="rounded-md border border-line bg-surface-2 p-3">
                <p class="text-xs font-medium text-muted">{ui.formulaHeading}</p>
                <p class="mt-1 font-mono text-xs leading-5 text-fg">{formula}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
                <Button size="sm" variant="ghost" onClick={() => setState(defaultState(locale))}>
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

import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateExchange, invertRate, parseExchangeNumber } from './logic';

const STORAGE_KEY = 'tools:exchange-rate:state';

interface State {
  source: string;
  target: string;
  amount: string;
  rate: string;
  adjustment: string;
  fixedFee: string;
}

const DEFAULT_STATE: State = {
  source: 'USD',
  target: 'KRW',
  amount: '100',
  rate: '1350',
  adjustment: '0',
  fixedFee: '0',
};

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      source: typeof saved.source === 'string' ? saved.source.slice(0, 12) : DEFAULT_STATE.source,
      target: typeof saved.target === 'string' ? saved.target.slice(0, 12) : DEFAULT_STATE.target,
      amount: typeof saved.amount === 'string' ? saved.amount : DEFAULT_STATE.amount,
      rate: typeof saved.rate === 'string' ? saved.rate : DEFAULT_STATE.rate,
      adjustment: typeof saved.adjustment === 'string' ? saved.adjustment : DEFAULT_STATE.adjustment,
      fixedFee: typeof saved.fixedFee === 'string' ? saved.fixedFee : DEFAULT_STATE.fixedFee,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function shortLabel(value: string, fallback: string): string {
  return value.trim().slice(0, 12) || fallback;
}

export default function ExchangeRate({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(DEFAULT_STATE);

  useEffect(() => {
    setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const source = shortLabel(state.source, ui.sourcePlaceholder);
  const target = shortLabel(state.target, ui.targetPlaceholder);
  const amount = useMemo(() => parseExchangeNumber(state.amount), [state.amount]);
  const rate = useMemo(() => parseExchangeNumber(state.rate), [state.rate]);
  const adjustment = useMemo(() => parseExchangeNumber(state.adjustment, { allowNegative: true }), [state.adjustment]);
  const fixedFee = useMemo(() => parseExchangeNumber(state.fixedFee), [state.fixedFee]);
  const result = useMemo(
    () =>
      amount !== null && rate !== null && adjustment !== null && fixedFee !== null
        ? calculateExchange({ amount, rate, adjustmentPercent: adjustment, fixedFee })
        : null,
    [amount, rate, adjustment, fixedFee],
  );
  const n = (value: number, digits = 4) => formatNumber(value, locale, digits);

  const reverseQuote = () => {
    if (rate === null) return;
    const reversed = invertRate(rate);
    if (reversed === null) return;
    setState((current) => ({
      ...current,
      source: current.target,
      target: current.source,
      rate: String(reversed),
      adjustment: '0',
      fixedFee: '0',
    }));
  };

  const copyText = result
    ? ui.copySummary
        .replaceAll('{amount}', n(amount!))
        .replaceAll('{source}', source)
        .replaceAll('{rate}', n(rate!))
        .replaceAll('{target}', target)
        .replaceAll('{gross}', n(result.gross))
        .replaceAll('{charges}', n(result.totalCharges))
        .replaceAll('{received}', n(result.received))
        .replaceAll('{effective}', result.effectiveRate === null ? ui.noEffectiveRate : n(result.effectiveRate))
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div class="space-y-4">
          <div class="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <Field label={ui.sourceLabel}>
              <TextInput
                value={state.source}
                maxLength={12}
                placeholder={ui.sourcePlaceholder}
                onInput={(event) => update({ source: (event.currentTarget as HTMLInputElement).value })}
              />
            </Field>
            <Button
              variant="secondary"
              class="mb-0.5"
              aria-label={ui.swap}
              onClick={reverseQuote}
              disabled={rate === null}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m17 3 4 4-4 4" />
                <path d="M21 7H3" />
                <path d="m7 21-4-4 4-4" />
                <path d="M3 17h18" />
              </svg>
            </Button>
            <Field label={ui.targetLabel}>
              <TextInput
                value={state.target}
                maxLength={12}
                placeholder={ui.targetPlaceholder}
                onInput={(event) => update({ target: (event.currentTarget as HTMLInputElement).value })}
              />
            </Field>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field label={ui.amountLabel} hint={ui.amountHint}>
              <TextInput
                value={state.amount}
                inputMode="decimal"
                onInput={(event) => update({ amount: (event.currentTarget as HTMLInputElement).value })}
              />
            </Field>
            <Field
              label={ui.rateLabel}
              hint={ui.rateHint.replaceAll('{source}', source).replaceAll('{target}', target)}
            >
              <TextInput
                value={state.rate}
                inputMode="decimal"
                onInput={(event) => update({ rate: (event.currentTarget as HTMLInputElement).value })}
              />
            </Field>
            <Field label={ui.adjustmentLabel} hint={ui.adjustmentHint}>
              <TextInput
                value={state.adjustment}
                inputMode="decimal"
                onInput={(event) => update({ adjustment: (event.currentTarget as HTMLInputElement).value })}
              />
            </Field>
            <Field label={ui.fixedFeeLabel.replaceAll('{target}', target)} hint={ui.fixedFeeHint}>
              <TextInput
                value={state.fixedFee}
                inputMode="decimal"
                onInput={(event) => update({ fixedFee: (event.currentTarget as HTMLInputElement).value })}
              />
            </Field>
          </div>
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
          <div class="mt-3">
            {!result ? (
              <Notice tone="danger">{ui.invalid}</Notice>
            ) : (
              <div aria-live="polite" class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                  <Stat label={ui.receiveLabel} value={`${n(result.received)} ${target}`} emphasis />
                  <Stat
                    label={ui.effectiveRateLabel}
                    value={result.effectiveRate === null ? ui.noEffectiveRate : n(result.effectiveRate)}
                  />
                </div>
                <div class="border-t border-line pt-3 space-y-1.5 text-sm">
                  <p class="flex justify-between gap-3 text-muted">
                    <span>{ui.grossLabel}</span>
                    <span class="tabular text-fg">
                      {n(result.gross)} {target}
                    </span>
                  </p>
                  <p class="flex justify-between gap-3 text-muted">
                    <span>{ui.chargesLabel}</span>
                    <span class="tabular text-fg">
                      {n(result.totalCharges)} {target}
                    </span>
                  </p>
                </div>
                <p class="font-mono text-xs text-subtle">
                  {ui.formula
                    .replaceAll('{amount}', n(amount!))
                    .replaceAll('{source}', source)
                    .replaceAll('{rate}', n(rate!))
                    .replaceAll('{gross}', n(result.gross))
                    .replaceAll('{target}', target)
                    .replaceAll('{charges}', n(result.totalCharges))
                    .replaceAll('{received}', n(result.received))}
                </p>
                <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div class="mt-5">
        <Notice>{ui.privacyNotice}</Notice>
      </div>
    </Panel>
  );
}

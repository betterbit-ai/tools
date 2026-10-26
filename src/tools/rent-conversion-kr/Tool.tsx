import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  calculateRentConversion,
  type ContractContext,
  type JeonseToMonthlyResult,
  type MonthlyToJeonseResult,
  type RentDirection,
} from './logic';

const STORAGE_KEY = 'tools:rent-conversion-kr:state';

interface State {
  direction: RentDirection;
  contractContext: ContractContext;
  jeonseDeposit: string;
  monthlyDeposit: string;
  monthlyRent: string;
  requestedRate: string;
  offeredMonthlyRent: string;
}

const DEFAULT_STATE: State = {
  direction: 'jeonseToMonthly',
  contractContext: 'existing',
  jeonseDeposit: '30000',
  monthlyDeposit: '10000',
  monthlyRent: '100',
  requestedRate: '6',
  offeredMonthlyRent: '100',
};

function restoreState(saved: unknown): State {
  if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
  const values = saved as Record<string, unknown>;
  return {
    direction: values.direction === 'monthlyToJeonse' ? 'monthlyToJeonse' : 'jeonseToMonthly',
    contractContext: values.contractContext === 'new' ? 'new' : 'existing',
    jeonseDeposit: typeof values.jeonseDeposit === 'string' ? values.jeonseDeposit : DEFAULT_STATE.jeonseDeposit,
    monthlyDeposit: typeof values.monthlyDeposit === 'string' ? values.monthlyDeposit : DEFAULT_STATE.monthlyDeposit,
    monthlyRent: typeof values.monthlyRent === 'string' ? values.monthlyRent : DEFAULT_STATE.monthlyRent,
    requestedRate: typeof values.requestedRate === 'string' ? values.requestedRate : DEFAULT_STATE.requestedRate,
    offeredMonthlyRent:
      typeof values.offeredMonthlyRent === 'string' ? values.offeredMonthlyRent : DEFAULT_STATE.offeredMonthlyRent,
  };
}

export default function RentConversionKr({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    try {
      setState(restoreState(JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null')));
    } catch {
      // Ignore corrupt browser state and retain useful defaults.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => {
    setCopyFailed(false);
    setState((current) => ({ ...current, ...patch }));
  };

  const result = useMemo(
    () =>
      calculateRentConversion({
        direction: state.direction,
        contractContext: state.contractContext,
        jeonseDepositTenThousands: state.jeonseDeposit,
        monthlyDepositTenThousands: state.monthlyDeposit,
        monthlyRentTenThousands: state.monthlyRent,
        requestedRatePercent: state.requestedRate,
        offeredMonthlyRentTenThousands: state.offeredMonthlyRent,
      }),
    [state],
  );

  const reset = () => {
    setState(DEFAULT_STATE);
    setCopyFailed(false);
    safeStorage.set(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
  };
  const money = (value: number) => `${formatNumber(value, locale)} ${ui.wonSuffix}`;
  const rate = (value: number) => `${formatNumber(value, locale, 2)}${ui.percentSuffix}`;
  const copyText = result ? buildCopyText(result, ui, money, rate) : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <fieldset class="mt-5">
        <legend class="mb-1.5 block text-sm font-medium text-fg">{ui.directionLabel}</legend>
        <Segmented<RentDirection>
          label={ui.directionLabel}
          value={state.direction}
          onValue={(direction) => update({ direction })}
          options={[
            { value: 'jeonseToMonthly', label: ui.jeonseToMonthly },
            { value: 'monthlyToJeonse', label: ui.monthlyToJeonse },
          ]}
        />
      </fieldset>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div class="flex flex-col gap-4">
          {state.direction === 'jeonseToMonthly' ? (
            <ForwardFields state={state} ui={ui} update={update} />
          ) : (
            <ReverseFields state={state} ui={ui} update={update} />
          )}
        </div>

        <div class="flex min-w-0 flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
            <div class="flex flex-wrap gap-2">
              <CopyButton
                text={copyText}
                label={ui.copyResult}
                copiedLabel={ui.copied}
                onSuccess={() => setCopyFailed(false)}
                onError={() => setCopyFailed(true)}
              />
              <Button size="sm" variant="ghost" onClick={reset}>
                {ui.reset}
              </Button>
            </div>
          </div>

          {copyFailed && <Notice tone="danger">{ui.copyFailed}</Notice>}
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : result.direction === 'jeonseToMonthly' ? (
            <ForwardResult result={result} context={state.contractContext} ui={ui} money={money} rate={rate} />
          ) : (
            <ReverseResult result={result} ui={ui} money={money} rate={rate} />
          )}
        </div>
      </div>
    </Panel>
  );
}

function ForwardFields(props: { state: State; ui: UI; update: (patch: Partial<State>) => void }) {
  const { state, ui, update } = props;
  return (
    <>
      <fieldset>
        <legend class="mb-1.5 block text-sm font-medium text-fg">{ui.contractContextLabel}</legend>
        <Segmented<ContractContext>
          label={ui.contractContextLabel}
          value={state.contractContext}
          onValue={(contractContext) => update({ contractContext })}
          options={[
            { value: 'existing', label: ui.existingContract },
            { value: 'new', label: ui.newContract },
          ]}
        />
        <p class="mt-1 text-xs text-subtle">
          {state.contractContext === 'existing' ? ui.existingContractHint : ui.newContractHint}
        </p>
      </fieldset>
      <Field label={ui.jeonseDepositLabel} hint={ui.jeonseDepositHint}>
        <TextInput
          value={state.jeonseDeposit}
          inputMode="decimal"
          onInput={(event) => update({ jeonseDeposit: event.currentTarget.value })}
        />
      </Field>
      <Field label={ui.monthlyDepositLabel} hint={ui.monthlyDepositHint}>
        <TextInput
          value={state.monthlyDeposit}
          inputMode="decimal"
          onInput={(event) => update({ monthlyDeposit: event.currentTarget.value })}
        />
      </Field>
      <Field label={ui.rateLabel} hint={ui.rateHint}>
        <TextInput
          value={state.requestedRate}
          inputMode="decimal"
          onInput={(event) => update({ requestedRate: event.currentTarget.value })}
        />
      </Field>
      <Field label={ui.offeredRentLabel} hint={ui.offeredRentHint}>
        <TextInput
          value={state.offeredMonthlyRent}
          inputMode="decimal"
          onInput={(event) => update({ offeredMonthlyRent: event.currentTarget.value })}
        />
      </Field>
    </>
  );
}

function ReverseFields(props: { state: State; ui: UI; update: (patch: Partial<State>) => void }) {
  const { state, ui, update } = props;
  return (
    <>
      <Field label={ui.currentMonthlyDepositLabel} hint={ui.currentMonthlyDepositHint}>
        <TextInput
          value={state.monthlyDeposit}
          inputMode="decimal"
          onInput={(event) => update({ monthlyDeposit: event.currentTarget.value })}
        />
      </Field>
      <Field label={ui.monthlyRentLabel} hint={ui.monthlyRentHint}>
        <TextInput
          value={state.monthlyRent}
          inputMode="decimal"
          onInput={(event) => update({ monthlyRent: event.currentTarget.value })}
        />
      </Field>
      <Field label={ui.rateLabel} hint={ui.rateHint}>
        <TextInput
          value={state.requestedRate}
          inputMode="decimal"
          onInput={(event) => update({ requestedRate: event.currentTarget.value })}
        />
      </Field>
    </>
  );
}

function ForwardResult(props: {
  result: JeonseToMonthlyResult;
  context: ContractContext;
  ui: UI;
  money: (value: number) => string;
  rate: (value: number) => string;
}) {
  const { result, context, ui, money, rate } = props;
  const legalNotice =
    context === 'new'
      ? replace(ui.newContractNotice, {
          requested: formatPlainRate(result.requestedRatePercent),
          cap: formatPlainRate(result.legalCapPercent),
        })
      : result.wasCapped
        ? replace(ui.capAppliedNotice, {
            requested: formatPlainRate(result.requestedRatePercent),
            cap: formatPlainRate(result.legalCapPercent),
          })
        : replace(ui.withinCapNotice, {
            requested: formatPlainRate(result.requestedRatePercent),
            cap: formatPlainRate(result.legalCapPercent),
          });
  const formula = replace(ui.forwardFormula, {
    jeonse: money(result.jeonseDepositWon),
    deposit: money(result.monthlyDepositWon),
    rate: formatPlainRate(result.appliedRatePercent),
    result: money(result.monthlyRentWon),
  });

  return (
    <div aria-live="polite" class="flex flex-col gap-3">
      <Stat label={ui.convertedMonthlyRent} value={money(result.monthlyRentWon)} emphasis />
      <div class="grid gap-2 sm:grid-cols-3">
        <Stat label={ui.convertedDeposit} value={money(result.convertedDepositWon)} />
        <Stat label={ui.appliedRate} value={rate(result.appliedRatePercent)} />
        <Stat label={ui.legalCap} value={rate(result.legalCapPercent)} />
      </div>
      <Notice tone={result.wasCapped ? 'danger' : 'info'}>{legalNotice}</Notice>
      <CalculationBasis heading={ui.calculationHeading} formula={formula} basis={ui.ruleBasis} />
      {result.offer && (
        <OfferResult result={result} offer={result.offer} context={context} ui={ui} money={money} rate={rate} />
      )}
    </div>
  );
}

function ReverseResult(props: {
  result: MonthlyToJeonseResult;
  ui: UI;
  money: (value: number) => string;
  rate: (value: number) => string;
}) {
  const { result, ui, money, rate } = props;
  const formula = replace(ui.reverseFormula, {
    deposit: money(result.monthlyDepositWon),
    rent: money(result.monthlyRentWon),
    rate: formatPlainRate(result.appliedRatePercent),
    result: money(result.equivalentJeonseDepositWon),
  });
  return (
    <div aria-live="polite" class="flex flex-col gap-3">
      <Stat label={ui.equivalentJeonseDeposit} value={money(result.equivalentJeonseDepositWon)} emphasis />
      <div class="grid gap-2 sm:grid-cols-2">
        <Stat label={ui.additionalDeposit} value={money(result.additionalDepositWon)} />
        <Stat label={ui.appliedRate} value={rate(result.appliedRatePercent)} />
      </div>
      <Notice tone="info">{ui.reverseNotice}</Notice>
      <CalculationBasis heading={ui.calculationHeading} formula={formula} basis={ui.ruleBasis} />
    </div>
  );
}

function OfferResult(props: {
  result: JeonseToMonthlyResult;
  offer: NonNullable<JeonseToMonthlyResult['offer']>;
  context: ContractContext;
  ui: UI;
  money: (value: number) => string;
  rate: (value: number) => string;
}) {
  const { result, offer, context, ui, money, rate } = props;
  const notice =
    context === 'new'
      ? replace(ui.offerNewContract, { cap: formatPlainRate(result.legalCapPercent) })
      : offer.exceedsLegalCap
        ? replace(ui.offerAboveCap, { excess: money(offer.excessMonthlyRentWon) })
        : ui.offerWithinCap;
  return (
    <div class="mt-1 border-t border-line pt-4">
      <p class="text-sm font-medium text-fg">{ui.offerHeading}</p>
      <div class="mt-3 grid gap-2 sm:grid-cols-3">
        <Stat label={ui.impliedRate} value={rate(offer.impliedRatePercent)} />
        <Stat label={ui.legalMaximumRent} value={money(offer.legalMaximumMonthlyRentWon)} />
        <Stat label={ui.excessMonthlyRent} value={money(offer.excessMonthlyRentWon)} />
      </div>
      <div class="mt-3">
        <Notice tone={context === 'existing' && offer.exceedsLegalCap ? 'danger' : 'success'}>{notice}</Notice>
      </div>
    </div>
  );
}

function CalculationBasis(props: { heading: string; formula: string; basis: string }) {
  return (
    <div class="rounded-md border border-line bg-surface-2 p-3">
      <p class="text-xs font-medium text-fg">{props.heading}</p>
      <p class="mt-1 break-words font-mono text-xs text-muted">{props.formula}</p>
      <p class="mt-2 text-xs leading-5 text-subtle">{props.basis}</p>
    </div>
  );
}

function buildCopyText(
  result: JeonseToMonthlyResult | MonthlyToJeonseResult,
  ui: UI,
  money: (value: number) => string,
  rate: (value: number) => string,
): string {
  if (result.direction === 'jeonseToMonthly') {
    return [
      `${ui.convertedMonthlyRent}: ${money(result.monthlyRentWon)}`,
      `${ui.convertedDeposit}: ${money(result.convertedDepositWon)}`,
      `${ui.appliedRate}: ${rate(result.appliedRatePercent)}`,
      `${ui.legalCap}: ${rate(result.legalCapPercent)}`,
    ].join('\n');
  }
  return [
    `${ui.equivalentJeonseDeposit}: ${money(result.equivalentJeonseDepositWon)}`,
    `${ui.additionalDeposit}: ${money(result.additionalDepositWon)}`,
    `${ui.appliedRate}: ${rate(result.appliedRatePercent)}`,
  ].join('\n');
}

function replace(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function formatPlainRate(value: number): string {
  return Number.isInteger(value) ? value.toFixed(2) : String(value);
}

import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, Panel, Segmented, Select, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateTip, parseAmount } from './logic';

const STORAGE_KEY = 'tools:tip-calculator:state';

type CountryId = 'us' | 'ca' | 'uk' | 'kr' | 'jp';

interface Country {
  currency: string;
  formattingLocale: string;
  fractionDigits: number;
  defaultTip: number;
}

const COUNTRIES: Record<CountryId, Country> = {
  us: { currency: 'USD', formattingLocale: 'en-US', fractionDigits: 2, defaultTip: 20 },
  ca: { currency: 'CAD', formattingLocale: 'en-CA', fractionDigits: 2, defaultTip: 18 },
  uk: { currency: 'GBP', formattingLocale: 'en-GB', fractionDigits: 2, defaultTip: 10 },
  kr: { currency: 'KRW', formattingLocale: 'ko-KR', fractionDigits: 0, defaultTip: 0 },
  jp: { currency: 'JPY', formattingLocale: 'ja-JP', fractionDigits: 0, defaultTip: 0 },
};

interface State {
  country: CountryId;
  bill: string;
  tipPercent: string;
  serviceChargePercent: string;
  people: string;
}

function defaultState(locale: ToolProps<UI>['locale']): State {
  const country: CountryId = locale === 'ko' ? 'kr' : 'us';
  return {
    country,
    bill: locale === 'ko' ? '50000' : '50',
    tipPercent: String(COUNTRIES[country].defaultTip),
    serviceChargePercent: '0',
    people: '1',
  };
}

function isCountryId(value: unknown): value is CountryId {
  return typeof value === 'string' && value in COUNTRIES;
}

function restoreState(fallback: State): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallback;
    return {
      country: isCountryId(saved.country) ? saved.country : fallback.country,
      bill: typeof saved.bill === 'string' ? saved.bill : fallback.bill,
      tipPercent: typeof saved.tipPercent === 'string' ? saved.tipPercent : fallback.tipPercent,
      serviceChargePercent:
        typeof saved.serviceChargePercent === 'string' ? saved.serviceChargePercent : fallback.serviceChargePercent,
      people: typeof saved.people === 'string' ? saved.people : fallback.people,
    };
  } catch {
    return fallback;
  }
}

function formatMoney(minor: number, country: Country): string {
  return new Intl.NumberFormat(country.formattingLocale, {
    style: 'currency',
    currency: country.currency,
    minimumFractionDigits: country.fractionDigits,
    maximumFractionDigits: country.fractionDigits,
  }).format(minor / 10 ** country.fractionDigits);
}

export default function TipCalculator({ locale, ui }: ToolProps<UI>) {
  const fallback = defaultState(locale);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(fallback);

  useEffect(() => {
    setState(restoreState(fallback));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const country = COUNTRIES[state.country];
  const bill = parseAmount(state.bill);
  const tipPercent = parseAmount(state.tipPercent);
  const serviceChargePercent = parseAmount(state.serviceChargePercent);
  const people = parseAmount(state.people);
  const result = useMemo(
    () =>
      bill === null || tipPercent === null || serviceChargePercent === null || people === null
        ? null
        : calculateTip({
            bill,
            tipPercent,
            serviceChargePercent,
            people,
            fractionDigits: country.fractionDigits,
          }),
    [bill, country.fractionDigits, people, serviceChargePercent, tipPercent],
  );

  const selectCountry = (nextCountry: CountryId) => {
    update({ country: nextCountry, tipPercent: String(COUNTRIES[nextCountry].defaultTip) });
  };
  const countryNotes: Record<CountryId, string> = {
    us: ui.countryNoteUs,
    ca: ui.countryNoteCa,
    uk: ui.countryNoteUk,
    kr: ui.countryNoteKr,
    jp: ui.countryNoteJp,
  };
  const copyText = result
    ? ui.copySummary
        .replaceAll('{tip}', formatMoney(result.tipMinor, country))
        .replaceAll('{total}', formatMoney(result.totalMinor, country))
        .replaceAll('{each}', formatMoney(result.split.higherShareMinor, country))
    : '';

  const splitText = result
    ? result.split.higherShareCount === 0
      ? ui.equalSplit.replaceAll('{amount}', formatMoney(result.split.lowerShareMinor, country))
      : ui.unevenSplit
          .replaceAll('{higherCount}', String(result.split.higherShareCount))
          .replaceAll('{higherAmount}', formatMoney(result.split.higherShareMinor, country))
          .replaceAll('{lowerCount}', String(result.split.lowerShareCount))
          .replaceAll('{lowerAmount}', formatMoney(result.split.lowerShareMinor, country))
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div class="flex flex-col gap-4">
          <Field label={ui.countryLabel} hint={countryNotes[state.country]}>
            <Select<CountryId>
              value={state.country}
              onValue={selectCountry}
              options={[
                { value: 'us', label: ui.countryUs },
                { value: 'ca', label: ui.countryCa },
                { value: 'uk', label: ui.countryUk },
                { value: 'kr', label: ui.countryKr },
                { value: 'jp', label: ui.countryJp },
              ]}
            />
          </Field>
          <Field label={ui.billLabel} hint={ui.billHint}>
            <TextInput
              value={state.bill}
              inputMode="decimal"
              placeholder={ui.billPlaceholder}
              onInput={(event) => update({ bill: event.currentTarget.value })}
            />
          </Field>
          <Field label={ui.tipLabel} hint={ui.tipHint}>
            <TextInput
              value={state.tipPercent}
              inputMode="decimal"
              placeholder={ui.percentPlaceholder}
              onInput={(event) => update({ tipPercent: event.currentTarget.value })}
            />
          </Field>
          <Segmented
            label={ui.tipLabel}
            value={
              state.tipPercent === '15' || state.tipPercent === '18' || state.tipPercent === '20'
                ? state.tipPercent
                : null
            }
            onValue={(tipPercent) => update({ tipPercent })}
            options={[
              { value: '15', label: ui.tip15 },
              { value: '18', label: ui.tip18 },
              { value: '20', label: ui.tip20 },
            ]}
          />
          <div class="grid grid-cols-2 gap-3">
            <Field label={ui.serviceChargeLabel} hint={ui.serviceChargeHint}>
              <TextInput
                value={state.serviceChargePercent}
                inputMode="decimal"
                placeholder={ui.percentPlaceholder}
                onInput={(event) => update({ serviceChargePercent: event.currentTarget.value })}
              />
            </Field>
            <Field label={ui.peopleLabel} hint={ui.peopleHint}>
              <TextInput
                value={state.people}
                inputMode="numeric"
                placeholder={ui.peoplePlaceholder}
                onInput={(event) => update({ people: event.currentTarget.value })}
              />
            </Field>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
            <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          </div>
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.tipResultLabel} value={formatMoney(result.tipMinor, country)} />
                <Stat label={ui.serviceChargeResultLabel} value={formatMoney(result.serviceChargeMinor, country)} />
                <Stat label={ui.totalLabel} value={formatMoney(result.totalMinor, country)} emphasis />
                <Stat label={ui.perPersonLabel} value={formatMoney(result.split.higherShareMinor, country)} emphasis />
              </div>
              <Notice tone="info">{splitText}</Notice>
              <p class="font-mono text-xs text-subtle">
                {ui.formula
                  .replaceAll('{bill}', formatMoney(result.billMinor, country))
                  .replaceAll('{tip}', state.tipPercent)
                  .replaceAll('{service}', state.serviceChargePercent)}
              </p>
            </>
          )}
          <Notice tone="info">{ui.serviceChargeNotice}</Notice>
        </div>
      </div>
    </Panel>
  );
}

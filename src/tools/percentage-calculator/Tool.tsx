import { useEffect, useMemo, useState } from 'preact/hooks';
import { Field, Notice, Panel, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  absoluteChange,
  findWhole,
  percentChange,
  percentOf,
  readNumberText,
  restoreNumberText,
  whatPercent,
  type NumberReading,
} from './logic';

const STORAGE_KEY = 'tools:percentage-calculator:state';

interface PersistedState {
  t1Percent: string;
  t1Base: string;
  t2Part: string;
  t2Whole: string;
  t3Part: string;
  t3Percent: string;
  t4From: string;
  t4To: string;
}

const DEFAULT_STATE: PersistedState = {
  t1Percent: '20',
  t1Base: '50',
  t2Part: '10',
  t2Whole: '50',
  t3Part: '10',
  t3Percent: '25',
  t4From: '50',
  t4To: '75',
};

const STATE_KEYS: (keyof PersistedState)[] = [
  't1Percent',
  't1Base',
  't2Part',
  't2Whole',
  't3Part',
  't3Percent',
  't4From',
  't4To',
];

function restoreState(saved: unknown): PersistedState {
  if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
  const values = saved as Record<string, unknown>;
  return STATE_KEYS.reduce<PersistedState>(
    (restored, key) => ({ ...restored, [key]: restoreNumberText(values[key], DEFAULT_STATE[key]) }),
    DEFAULT_STATE,
  );
}

/** A card has a result only when both fields read as numbers; otherwise it says why not. */
type CardStatus = 'ready' | 'empty' | 'invalid';

function cardStatus(readings: [NumberReading, NumberReading]): CardStatus {
  if (readings[0].status === 'invalid' || readings[1].status === 'invalid') return 'invalid';
  if (readings[0].status === 'empty' || readings[1].status === 'empty') return 'empty';
  return 'ready';
}

function bothValid(
  readings: [NumberReading, NumberReading],
): readings is [{ status: 'valid'; value: number }, { status: 'valid'; value: number }] {
  return readings[0].status === 'valid' && readings[1].status === 'valid';
}

export default function PercentageCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      setState(restoreState(saved));
    } catch {
      /* ignore corrupt state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<PersistedState>) => setState((s) => ({ ...s, ...patch }));

  const n = (v: number) => formatNumber(v, locale, 4);
  const signed = (v: number) => `${v > 0 ? '+' : ''}${n(v)}`;

  // Every field keeps the text the visitor typed; only a readable number becomes a result, and a
  // field that cannot be read says so instead of quietly calculating with 0.
  const t1Readings: [NumberReading, NumberReading] = [readNumberText(state.t1Percent), readNumberText(state.t1Base)];
  const t2Readings: [NumberReading, NumberReading] = [readNumberText(state.t2Part), readNumberText(state.t2Whole)];
  const t3Readings: [NumberReading, NumberReading] = [readNumberText(state.t3Part), readNumberText(state.t3Percent)];
  const t4Readings: [NumberReading, NumberReading] = [readNumberText(state.t4From), readNumberText(state.t4To)];

  const t1 = bothValid(t1Readings) ? { percent: t1Readings[0].value, base: t1Readings[1].value } : null;
  const t2 = bothValid(t2Readings) ? { part: t2Readings[0].value, whole: t2Readings[1].value } : null;
  const t3 = bothValid(t3Readings) ? { part: t3Readings[0].value, percent: t3Readings[1].value } : null;
  const t4 = bothValid(t4Readings) ? { from: t4Readings[0].value, to: t4Readings[1].value } : null;

  const t1Result = useMemo(() => (t1 ? percentOf(t1.percent, t1.base) : NaN), [t1?.percent, t1?.base]);
  const t2Result = useMemo(() => (t2 ? whatPercent(t2.part, t2.whole) : NaN), [t2?.part, t2?.whole]);
  const t3Result = useMemo(() => (t3 ? findWhole(t3.part, t3.percent) : NaN), [t3?.part, t3?.percent]);
  const t4Percent = useMemo(() => (t4 ? percentChange(t4.from, t4.to) : NaN), [t4?.from, t4?.to]);
  const t4Absolute = useMemo(() => (t4 ? absoluteChange(t4.from, t4.to) : NaN), [t4?.from, t4?.to]);

  const notice = (status: CardStatus) =>
    status === 'invalid' ? (
      <Notice tone="danger">{ui.invalidNumberError}</Notice>
    ) : status === 'empty' ? (
      <Notice tone="info">{ui.emptyNumberError}</Notice>
    ) : null;

  const field = (label: string, key: keyof PersistedState) => (
    <Field label={label}>
      <TextInput
        inputMode="decimal"
        autoComplete="off"
        spellcheck={false}
        value={state[key]}
        onInput={(event) => update({ [key]: event.currentTarget.value } as Partial<PersistedState>)}
      />
    </Field>
  );

  return (
    <Panel>
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.type1Heading}</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            {field(ui.type1PercentLabel, 't1Percent')}
            {field(ui.type1BaseLabel, 't1Base')}
          </div>
          <div class="mt-3">
            {!t1 ? (
              notice(cardStatus(t1Readings))
            ) : !Number.isFinite(t1Result) ? (
              <Notice tone="danger">{ui.resultTooLargeError}</Notice>
            ) : (
              <div aria-live="polite">
                <Stat label={ui.resultLabel} value={n(t1Result)} emphasis />
              </div>
            )}
          </div>
          {t1 && Number.isFinite(t1Result) && (
            <p class="mt-2 font-mono text-xs text-subtle">
              {ui.type1Formula
                .replaceAll('{percent}', n(t1.percent))
                .replaceAll('{base}', n(t1.base))
                .replaceAll('{result}', n(t1Result))}
            </p>
          )}
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.type2Heading}</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            {field(ui.type2PartLabel, 't2Part')}
            {field(ui.type2WholeLabel, 't2Whole')}
          </div>
          <div class="mt-3">
            {!t2 ? (
              notice(cardStatus(t2Readings))
            ) : Number.isNaN(t2Result) ? (
              <Notice tone="danger">{ui.zeroWholeError}</Notice>
            ) : !Number.isFinite(t2Result) ? (
              <Notice tone="danger">{ui.resultTooLargeError}</Notice>
            ) : (
              <div aria-live="polite">
                <Stat label={ui.resultPercentLabel} value={`${n(t2Result)}%`} emphasis />
              </div>
            )}
          </div>
          {t2 && Number.isFinite(t2Result) && (
            <p class="mt-2 font-mono text-xs text-subtle">
              {ui.type2Formula
                .replaceAll('{part}', n(t2.part))
                .replaceAll('{whole}', n(t2.whole))
                .replaceAll('{result}', n(t2Result))}
            </p>
          )}
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.type3Heading}</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            {field(ui.type3PartLabel, 't3Part')}
            {field(ui.type3PercentLabel, 't3Percent')}
          </div>
          <div class="mt-3">
            {!t3 ? (
              notice(cardStatus(t3Readings))
            ) : Number.isNaN(t3Result) ? (
              <Notice tone="danger">{ui.zeroPercentError}</Notice>
            ) : !Number.isFinite(t3Result) ? (
              <Notice tone="danger">{ui.resultTooLargeError}</Notice>
            ) : (
              <div aria-live="polite">
                <Stat label={ui.resultLabel} value={n(t3Result)} emphasis />
              </div>
            )}
          </div>
          {t3 && Number.isFinite(t3Result) && (
            <p class="mt-2 font-mono text-xs text-subtle">
              {ui.type3Formula
                .replaceAll('{part}', n(t3.part))
                .replaceAll('{percent}', n(t3.percent))
                .replaceAll('{result}', n(t3Result))}
            </p>
          )}
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.type4Heading}</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            {field(ui.type4FromLabel, 't4From')}
            {field(ui.type4ToLabel, 't4To')}
          </div>
          <div class="mt-3">
            {!t4 ? (
              notice(cardStatus(t4Readings))
            ) : Number.isNaN(t4Percent) ? (
              <Notice tone="danger">{ui.zeroFromError}</Notice>
            ) : !Number.isFinite(t4Percent) || !Number.isFinite(t4Absolute) ? (
              <Notice tone="danger">{ui.resultTooLargeError}</Notice>
            ) : (
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.resultChangeLabel} value={`${signed(t4Percent)}%`} emphasis />
                <Stat label={ui.resultAbsoluteLabel} value={signed(t4Absolute)} />
              </div>
            )}
          </div>
          {t4 && Number.isFinite(t4Percent) && Number.isFinite(t4Absolute) && (
            <p class="mt-2 font-mono text-xs text-subtle">
              {ui.type4Formula
                .replaceAll('{from}', n(t4.from))
                .replaceAll('{to}', n(t4.to))
                .replaceAll('{result}', signed(t4Percent))}
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}

import { useEffect, useMemo, useState } from 'preact/hooks';
import { Field, NumberInput, Notice, Panel, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  absoluteChange,
  findWhole,
  isCompleteNumberInput,
  percentChange,
  percentOf,
  restoreNumberInput,
  whatPercent,
} from './logic';

const STORAGE_KEY = 'tools:percentage-calculator:state';

interface PersistedState {
  t1Percent: number | '';
  t1Base: number | '';
  t2Part: number | '';
  t2Whole: number | '';
  t3Part: number | '';
  t3Percent: number | '';
  t4From: number | '';
  t4To: number | '';
}

const DEFAULT_STATE: PersistedState = {
  t1Percent: 20,
  t1Base: 50,
  t2Part: 10,
  t2Whole: 50,
  t3Part: 10,
  t3Percent: 25,
  t4From: 50,
  t4To: 75,
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
    (restored, key) => ({ ...restored, [key]: restoreNumberInput(values[key], DEFAULT_STATE[key]) }),
    DEFAULT_STATE,
  );
}

/** Safe number for arithmetic while a field is incomplete. The incomplete state is never shown as a result. */
const safeNumber = (v: number | ''): number => (v === '' || Number.isNaN(v) ? 0 : v);

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

  const t1Invalid = !isCompleteNumberInput(state.t1Percent) || !isCompleteNumberInput(state.t1Base);
  const t1Percent = safeNumber(state.t1Percent);
  const t1Base = safeNumber(state.t1Base);
  const t1Result = useMemo(() => percentOf(t1Percent, t1Base), [t1Percent, t1Base]);

  const t2Invalid = !isCompleteNumberInput(state.t2Part) || !isCompleteNumberInput(state.t2Whole);
  const t2Part = safeNumber(state.t2Part);
  const t2Whole = safeNumber(state.t2Whole);
  const t2Result = useMemo(() => whatPercent(t2Part, t2Whole), [t2Part, t2Whole]);

  const t3Invalid = !isCompleteNumberInput(state.t3Part) || !isCompleteNumberInput(state.t3Percent);
  const t3Part = safeNumber(state.t3Part);
  const t3Percent = safeNumber(state.t3Percent);
  const t3Result = useMemo(() => findWhole(t3Part, t3Percent), [t3Part, t3Percent]);

  const t4Invalid = !isCompleteNumberInput(state.t4From) || !isCompleteNumberInput(state.t4To);
  const t4From = safeNumber(state.t4From);
  const t4To = safeNumber(state.t4To);
  const t4Percent = useMemo(() => percentChange(t4From, t4To), [t4From, t4To]);
  const t4Absolute = useMemo(() => absoluteChange(t4From, t4To), [t4From, t4To]);

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
            <Field label={ui.type1PercentLabel}>
              <NumberInput value={state.t1Percent} onValue={(v) => update({ t1Percent: v })} />
            </Field>
            <Field label={ui.type1BaseLabel}>
              <NumberInput value={state.t1Base} onValue={(v) => update({ t1Base: v })} />
            </Field>
          </div>
          <div class="mt-3">
            {t1Invalid ? (
              <Notice tone="danger">{ui.invalidNumberError}</Notice>
            ) : !Number.isFinite(t1Result) ? (
              <Notice tone="danger">{ui.resultTooLargeError}</Notice>
            ) : (
              <div aria-live="polite">
                <Stat label={ui.resultLabel} value={n(t1Result)} emphasis />
              </div>
            )}
          </div>
          {!t1Invalid && Number.isFinite(t1Result) && (
            <p class="mt-2 font-mono text-xs text-subtle">
              {ui.type1Formula
                .replaceAll('{percent}', n(t1Percent))
                .replaceAll('{base}', n(t1Base))
                .replaceAll('{result}', n(t1Result))}
            </p>
          )}
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.type2Heading}</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <Field label={ui.type2PartLabel}>
              <NumberInput value={state.t2Part} onValue={(v) => update({ t2Part: v })} />
            </Field>
            <Field label={ui.type2WholeLabel}>
              <NumberInput value={state.t2Whole} onValue={(v) => update({ t2Whole: v })} />
            </Field>
          </div>
          <div class="mt-3">
            {t2Invalid ? (
              <Notice tone="danger">{ui.invalidNumberError}</Notice>
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
          {!t2Invalid && Number.isFinite(t2Result) && (
            <p class="mt-2 font-mono text-xs text-subtle">
              {ui.type2Formula
                .replaceAll('{part}', n(t2Part))
                .replaceAll('{whole}', n(t2Whole))
                .replaceAll('{result}', n(t2Result))}
            </p>
          )}
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.type3Heading}</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <Field label={ui.type3PartLabel}>
              <NumberInput value={state.t3Part} onValue={(v) => update({ t3Part: v })} />
            </Field>
            <Field label={ui.type3PercentLabel}>
              <NumberInput value={state.t3Percent} onValue={(v) => update({ t3Percent: v })} />
            </Field>
          </div>
          <div class="mt-3">
            {t3Invalid ? (
              <Notice tone="danger">{ui.invalidNumberError}</Notice>
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
          {!t3Invalid && Number.isFinite(t3Result) && (
            <p class="mt-2 font-mono text-xs text-subtle">
              {ui.type3Formula
                .replaceAll('{part}', n(t3Part))
                .replaceAll('{percent}', n(t3Percent))
                .replaceAll('{result}', n(t3Result))}
            </p>
          )}
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.type4Heading}</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <Field label={ui.type4FromLabel}>
              <NumberInput value={state.t4From} onValue={(v) => update({ t4From: v })} />
            </Field>
            <Field label={ui.type4ToLabel}>
              <NumberInput value={state.t4To} onValue={(v) => update({ t4To: v })} />
            </Field>
          </div>
          <div class="mt-3">
            {t4Invalid ? (
              <Notice tone="danger">{ui.invalidNumberError}</Notice>
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
          {!t4Invalid && Number.isFinite(t4Percent) && Number.isFinite(t4Absolute) && (
            <p class="mt-2 font-mono text-xs text-subtle">
              {ui.type4Formula
                .replaceAll('{from}', n(t4From))
                .replaceAll('{to}', n(t4To))
                .replaceAll('{result}', signed(t4Percent))}
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}

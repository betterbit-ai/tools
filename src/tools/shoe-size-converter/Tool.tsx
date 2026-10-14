import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, NumberInput, Panel, Select, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { convertShoeSize, formatSizeSummary, isShoeSystem, supportedRange, type ShoeSystem } from './logic';

const STORAGE_KEY = 'tools:shoe-size-converter:state';
type Brand = 'none' | 'nike' | 'adidas' | 'newBalance';

interface State {
  value: number | '';
  system: ShoeSystem;
  brand: Brand;
}

const DEFAULT_STATE: State = { value: 260, system: 'kr', brand: 'none' };

const SYSTEM_LABEL_KEY: Record<ShoeSystem, keyof UI> = {
  kr: 'systemKr',
  jp: 'systemJp',
  usMen: 'systemUsMen',
  usWomen: 'systemUsWomen',
  uk: 'systemUk',
  eu: 'systemEu',
};

const BRAND_LABEL_KEY: Record<Brand, keyof UI> = {
  none: 'brandNone',
  nike: 'brandNike',
  adidas: 'brandAdidas',
  newBalance: 'brandNewBalance',
};

const BRAND_NOTICE_KEY: Record<Exclude<Brand, 'none'>, keyof UI> = {
  nike: 'nikeNotice',
  adidas: 'adidasNotice',
  newBalance: 'newBalanceNotice',
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBrand(value: unknown): value is Brand {
  return value === 'none' || value === 'nike' || value === 'adidas' || value === 'newBalance';
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      value: isFiniteNumber(saved.value) ? saved.value : DEFAULT_STATE.value,
      system: isShoeSystem(saved.system) ? saved.system : DEFAULT_STATE.system,
      brand: isBrand(saved.brand) ? saved.brand : DEFAULT_STATE.brand,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function ShoeSizeConverter({ ui }: ToolProps<UI>) {
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
  const range = supportedRange(state.system);
  const row = useMemo(
    () => (isFiniteNumber(state.value) ? convertShoeSize(state.value, state.system) : null),
    [state.value, state.system],
  );
  const systemOptions = Object.keys(SYSTEM_LABEL_KEY).map((value) => {
    const system = value as ShoeSystem;
    return { value: system, label: ui[SYSTEM_LABEL_KEY[system]] };
  });
  const brandOptions = Object.keys(BRAND_LABEL_KEY).map((value) => {
    const brand = value as Brand;
    return { value: brand, label: ui[BRAND_LABEL_KEY[brand]] };
  });
  const labels = Object.fromEntries(
    Object.entries(SYSTEM_LABEL_KEY).map(([system, key]) => [system, ui[key]]),
  ) as Record<ShoeSystem, string>;
  const resultText = row ? formatSizeSummary(row, labels) : '';

  return (
    <Panel>
      <div class="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <Field label={ui.systemLabel} hint={ui.systemHint}>
              <Select value={state.system} onValue={(system) => update({ system })} options={systemOptions} />
            </Field>
            <Field
              label={ui.sizeLabel}
              hint={ui.sizeHint.replace('{min}', String(range.min)).replace('{max}', String(range.max))}
            >
              <NumberInput
                value={state.value}
                min={String(range.min)}
                max={String(range.max)}
                step="0.5"
                onValue={(value) => update({ value })}
              />
            </Field>
          </div>

          {!row && <Notice tone="danger">{ui.outOfRange}</Notice>}

          <div class="border-t border-line pt-4">
            <Field label={ui.brandLabel} hint={ui.brandHint}>
              <Select value={state.brand} onValue={(brand) => update({ brand })} options={brandOptions} />
            </Field>
            {state.brand !== 'none' && (
              <div class="mt-3">
                <Notice>{ui[BRAND_NOTICE_KEY[state.brand]]}</Notice>
              </div>
            )}
          </div>
        </div>

        <div aria-live="polite" class="space-y-3">
          <h2 class="text-sm font-medium text-fg">{ui.resultsTitle}</h2>
          {row ? (
            <>
              <div class="grid grid-cols-2 gap-2">
                <Stat label={ui.systemKr} value={row.kr} emphasis />
                <Stat label={ui.systemJp} value={row.jp} emphasis />
                <Stat label={ui.systemUsMen} value={row.usMen} />
                <Stat label={ui.systemUsWomen} value={row.usWomen} />
                <Stat label={ui.systemUk} value={row.uk} />
                <Stat label={ui.systemEu} value={row.eu} />
              </div>
              <CopyButton text={resultText} label={ui.copy} copiedLabel={ui.copied} />
            </>
          ) : (
            <Notice>{ui.resultPlaceholder}</Notice>
          )}
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-6">
        <Notice>{ui.baselineNotice}</Notice>
      </div>
    </Panel>
  );
}

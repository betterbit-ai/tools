import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, NumberInput, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { round, scaleRecipe, simplifyRatio, solveProportion, type NumberField } from './logic';

const STORAGE_KEY = 'tools:ratio-calculator:state';
type Mode = 'ratio' | 'proportion' | 'recipe';
type IngredientState = { name: string; amount: NumberField };
interface SavedState {
  mode: Mode;
  width: NumberField;
  height: NumberField;
  targetWidth: NumberField;
  proportion: [NumberField, NumberField, NumberField, NumberField];
  originalServings: NumberField;
  targetServings: NumberField;
  ingredients: [IngredientState, IngredientState, IngredientState];
}

const DEFAULT_STATE: SavedState = {
  mode: 'ratio',
  width: 1920,
  height: 1080,
  targetWidth: 1280,
  proportion: [3, 4, 6, ''],
  originalServings: 4,
  targetServings: 6,
  ingredients: [
    { name: 'Flour', amount: 300 },
    { name: 'Milk', amount: 200 },
    { name: 'Eggs', amount: 2 },
  ],
};

function validNumber(value: unknown, fallback: NumberField): NumberField {
  return value === '' || (typeof value === 'number' && Number.isFinite(value)) ? value : fallback;
}

function restoreState(value: unknown): SavedState {
  if (!value || typeof value !== 'object') return DEFAULT_STATE;
  const saved = value as Record<string, unknown>;
  const proportion = Array.isArray(saved.proportion) ? saved.proportion : [];
  const ingredients = Array.isArray(saved.ingredients) ? saved.ingredients : [];
  return {
    mode: saved.mode === 'proportion' || saved.mode === 'recipe' ? saved.mode : 'ratio',
    width: validNumber(saved.width, DEFAULT_STATE.width),
    height: validNumber(saved.height, DEFAULT_STATE.height),
    targetWidth: validNumber(saved.targetWidth, DEFAULT_STATE.targetWidth),
    proportion: DEFAULT_STATE.proportion.map((fallback, index) =>
      validNumber(proportion[index], fallback),
    ) as SavedState['proportion'],
    originalServings: validNumber(saved.originalServings, DEFAULT_STATE.originalServings),
    targetServings: validNumber(saved.targetServings, DEFAULT_STATE.targetServings),
    ingredients: DEFAULT_STATE.ingredients.map((fallback, index) => {
      const ingredient = ingredients[index];
      return {
        name:
          ingredient && typeof ingredient === 'object' && typeof (ingredient as IngredientState).name === 'string'
            ? (ingredient as IngredientState).name
            : fallback.name,
        amount:
          ingredient && typeof ingredient === 'object'
            ? validNumber((ingredient as IngredientState).amount, fallback.amount)
            : fallback.amount,
      };
    }) as SavedState['ingredients'],
  };
}

function replace(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

export default function RatioCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<SavedState>(DEFAULT_STATE);

  useEffect(() => {
    try {
      setState(restoreState(JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null')));
    } catch {
      /* Ignore corrupt local state. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<SavedState>) => setState((current) => ({ ...current, ...patch }));
  const n = (value: number) => formatNumber(value, locale, 6);

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
            { value: 'ratio', label: ui.ratioMode },
            { value: 'proportion', label: ui.proportionMode },
            { value: 'recipe', label: ui.recipeMode },
          ]}
        />
      </div>

      {state.mode === 'ratio' && <RatioMode state={state} update={update} ui={ui} n={n} />}
      {state.mode === 'proportion' && <ProportionMode state={state} update={update} ui={ui} n={n} />}
      {state.mode === 'recipe' && <RecipeMode state={state} update={update} ui={ui} n={n} />}

      <div class="mt-5">
        <Notice>{ui.privacyNotice}</Notice>
      </div>
    </Panel>
  );
}

function RatioMode(props: {
  state: SavedState;
  update: (patch: Partial<SavedState>) => void;
  ui: UI;
  n: (v: number) => string;
}) {
  const { state, update, ui, n } = props;
  const complete = typeof state.width === 'number' && typeof state.height === 'number';
  const width = typeof state.width === 'number' ? state.width : 0;
  const height = typeof state.height === 'number' ? state.height : 0;
  const result = useMemo(() => (complete ? simplifyRatio(width, height) : null), [complete, height, width]);
  const targetHeight = useMemo(() => {
    if (state.targetWidth === '' || state.width === '' || state.height === '' || state.width === 0) return null;
    const value = round((state.targetWidth * state.height) / state.width);
    return Number.isFinite(value) ? value : null;
  }, [state.targetWidth, state.width, state.height]);
  const error = !complete
    ? ui.ratioInvalid
    : !result?.ok
      ? result?.error === 'both-zero'
        ? ui.ratioBothZero
        : result?.error === 'too-precise'
          ? ui.ratioPrecise
          : ui.ratioInvalid
      : null;

  return (
    <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
      <div class="space-y-4">
        <p class="text-sm font-medium text-fg">{ui.ratioHeading}</p>
        <div class="grid grid-cols-2 gap-3">
          <Field label={ui.widthLabel}>
            <NumberInput min="0" value={state.width} onValue={(width) => update({ width })} />
          </Field>
          <Field label={ui.heightLabel}>
            <NumberInput min="0" value={state.height} onValue={(height) => update({ height })} />
          </Field>
        </div>
        <Field label={ui.targetWidthLabel} hint={ui.targetWidthHint}>
          <NumberInput min="0" value={state.targetWidth} onValue={(targetWidth) => update({ targetWidth })} />
        </Field>
      </div>
      <div class="rounded-lg border border-line bg-surface-2 p-4">
        {error ? (
          <Notice tone="danger">{error}</Notice>
        ) : result?.ok ? (
          <div class="space-y-3" aria-live="polite">
            <div class="grid grid-cols-2 gap-2">
              <Stat label={ui.simplifiedLabel} value={`${n(result.first)} : ${n(result.second)}`} emphasis />
              {height === 0 ? (
                <Notice tone="danger">{ui.decimalZeroHeight}</Notice>
              ) : (
                <Stat label={ui.decimalLabel} value={n(width / height)} />
              )}
            </div>
            <CopyButton text={`${result.first}:${result.second}`} label={ui.copy} copiedLabel={ui.copied} />
            <p class="font-mono text-xs text-subtle">
              {replace(ui.ratioFormula, {
                width: n(width),
                height: n(height),
                first: n(result.first),
                second: n(result.second),
              })}
            </p>
            {state.targetWidth !== '' &&
              (targetHeight === null ? (
                <Notice tone="danger">{ui.targetHeightInvalid}</Notice>
              ) : (
                <Stat label={ui.targetHeightLabel} value={n(targetHeight)} />
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProportionMode(props: {
  state: SavedState;
  update: (patch: Partial<SavedState>) => void;
  ui: UI;
  n: (v: number) => string;
}) {
  const { state, update, ui, n } = props;
  const result = useMemo(() => solveProportion(state.proportion), [state.proportion]);
  const setTerm = (index: number, value: NumberField) =>
    update({ proportion: state.proportion.map((term, i) => (i === index ? value : term)) as SavedState['proportion'] });
  const values = state.proportion.map((value) => (value === '' ? '?' : n(value)));
  const error = result.ok
    ? null
    : result.error === 'need-one-blank'
      ? ui.needOneBlank
      : result.error === 'invalid'
        ? ui.proportionInvalid
        : result.error === 'not-unique'
          ? ui.notUnique
          : result.error === 'impossible'
            ? ui.impossible
            : ui.overflow;

  return (
    <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
      <div>
        <p class="text-sm font-medium text-fg">{ui.proportionHeading}</p>
        <p class="mt-1 text-xs text-subtle">{ui.proportionHint}</p>
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['a', 'b', 'c', 'd'] as const).map((letter, index) => (
            <Field label={letter}>
              <NumberInput value={state.proportion[index]} onValue={(value) => setTerm(index, value)} />
            </Field>
          ))}
        </div>
      </div>
      <div class="rounded-lg border border-line bg-surface-2 p-4">
        {!result.ok ? (
          <Notice tone="danger">{error}</Notice>
        ) : (
          <div aria-live="polite" class="space-y-3">
            <Stat label={ui.proportionResultLabel} value={n(result.value)} emphasis />
            <p class="font-mono text-xs text-subtle">
              {replace(ui.proportionFormula, { a: values[0], b: values[1], c: values[2], d: values[3] })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeMode(props: {
  state: SavedState;
  update: (patch: Partial<SavedState>) => void;
  ui: UI;
  n: (v: number) => string;
}) {
  const { state, update, ui, n } = props;
  const complete =
    typeof state.originalServings === 'number' &&
    typeof state.targetServings === 'number' &&
    state.ingredients.every((ingredient) => typeof ingredient.amount === 'number');
  const result = useMemo(
    () =>
      complete
        ? scaleRecipe(
            state.originalServings as number,
            state.targetServings as number,
            state.ingredients as { name: string; amount: number }[],
          )
        : null,
    [complete, state.ingredients, state.originalServings, state.targetServings],
  );
  const error = !complete
    ? ui.recipeInvalid
    : !result?.ok
      ? result?.error === 'zero-servings'
        ? ui.zeroServings
        : result?.error === 'overflow'
          ? ui.overflow
          : ui.recipeInvalid
      : null;
  const updateIngredient = (index: number, patch: Partial<IngredientState>) =>
    update({
      ingredients: state.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, ...patch } : ingredient,
      ) as SavedState['ingredients'],
    });

  return (
    <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
      <div class="space-y-4">
        <p class="text-sm font-medium text-fg">{ui.recipeHeading}</p>
        <div class="grid grid-cols-2 gap-3">
          <Field label={ui.originalServingsLabel}>
            <NumberInput
              min="0"
              value={state.originalServings}
              onValue={(originalServings) => update({ originalServings })}
            />
          </Field>
          <Field label={ui.targetServingsLabel}>
            <NumberInput
              min="0"
              value={state.targetServings}
              onValue={(targetServings) => update({ targetServings })}
            />
          </Field>
        </div>
        {state.ingredients.map((ingredient, index) => (
          <div class="grid grid-cols-2 gap-3">
            <Field label={replace(ui.ingredientNameLabel, { number: String(index + 1) })}>
              <TextInput
                value={ingredient.name}
                onInput={(event) => updateIngredient(index, { name: event.currentTarget.value })}
              />
            </Field>
            <Field label={ui.amountLabel}>
              <NumberInput
                min="0"
                value={ingredient.amount}
                onValue={(amount) => updateIngredient(index, { amount })}
              />
            </Field>
          </div>
        ))}
      </div>
      <div class="rounded-lg border border-line bg-surface-2 p-4">
        {error ? (
          <Notice tone="danger">{error}</Notice>
        ) : result?.ok ? (
          <div aria-live="polite" class="space-y-3">
            <Stat label={ui.factorLabel} value={`×${n(result.factor)}`} emphasis />
            {result.ingredients.map((ingredient, index) => (
              <Stat
                label={`${ingredient.name || replace(ui.ingredientNameLabel, { number: String(index + 1) })} — ${ui.scaledAmountLabel}`}
                value={n(ingredient.amount)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

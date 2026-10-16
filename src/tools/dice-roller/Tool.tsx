import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { formatExpression, formatRoll, parseDiceExpression, rollDice, type DiceError, type RollResult } from './logic';

const EXPRESSION_KEY = 'tools:dice-roller:expression';
const HISTORY_KEY = 'tools:dice-roller:history';
const HISTORY_LIMIT = 10;
const DEFAULT_EXPRESSION = '2d6';

interface HistoryItem {
  expression: string;
  detail: string;
  total: number;
}

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

export default function DiceRoller({ ui }: ToolProps<UI>) {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [result, setResult] = useState<RollResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<DiceError | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);

  const roll = useCallback(() => {
    const parsed = parseDiceExpression(expression);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      const next = rollDice(parsed.value, cryptoSource);
      const item = { expression: formatExpression(parsed.value), detail: formatRoll(next), total: next.total };
      setResult(next);
      setHistory((current) => [item, ...current].slice(0, HISTORY_LIMIT));
      setError(null);
    } catch {
      setError('crypto');
    }
  }, [expression]);

  useEffect(() => {
    const savedExpression = safeStorage.get(EXPRESSION_KEY);
    if (savedExpression && parseDiceExpression(savedExpression).ok) setExpression(savedExpression);
    try {
      const savedHistory = JSON.parse(safeStorage.get(HISTORY_KEY) ?? '[]');
      if (Array.isArray(savedHistory)) {
        setHistory(
          savedHistory
            .filter(
              (item): item is HistoryItem =>
                item &&
                typeof item.expression === 'string' &&
                typeof item.detail === 'string' &&
                typeof item.total === 'number',
            )
            .slice(0, HISTORY_LIMIT),
        );
      }
    } catch {
      /* Ignore malformed local history. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    safeStorage.set(EXPRESSION_KEY, expression);
  }, [expression, ready]);

  useEffect(() => {
    if (!ready) return;
    safeStorage.set(HISTORY_KEY, JSON.stringify(history));
  }, [history, ready]);

  useEffect(() => {
    if (ready && !result && !error) roll();
  }, [error, ready, result, roll]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        roll();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [roll]);

  const errorText =
    error === 'empty'
      ? ui.errorEmpty
      : error === 'invalid'
        ? ui.errorInvalid
        : error === 'too-many-dice'
          ? ui.errorTooManyDice
          : error === 'too-many-sides'
            ? ui.errorTooManySides
            : error === 'modifier-too-large'
              ? ui.errorModifierTooLarge
              : error === 'invalid-keep'
                ? ui.errorInvalidKeep
                : error === 'crypto'
                  ? ui.errorCrypto
                  : null;
  const resultText = useMemo(() => (result ? formatRoll(result) : ''), [result]);
  const presets = [
    { label: ui.presetD6, expression: 'd6' },
    { label: ui.preset2D6, expression: '2d6' },
    { label: ui.presetD20, expression: 'd20' },
    { label: ui.presetAdvantage, expression: '2d20kh1' },
    { label: ui.presetDisadvantage, expression: '2d20kl1' },
    { label: ui.presetAbility, expression: '4d6kh3' },
  ];

  return (
    <Panel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          roll();
        }}
      >
        <div class="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div>
            <p class="text-sm text-muted">{ui.intro}</p>
            <div class="mt-4">
              <Field label={ui.expressionLabel} hint={ui.expressionHint}>
                <TextInput value={expression} onInput={(event) => setExpression(event.currentTarget.value)} />
              </Field>
            </div>
            <div class="mt-4">
              <p class="text-sm font-medium text-fg">{ui.presetsLabel}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button size="sm" onClick={() => setExpression(preset.expression)}>
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div class="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" type="submit">
                {ui.roll}
              </Button>
              <span class="text-xs text-muted">
                {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd>
              </span>
            </div>
          </div>

          <div class="rounded-lg border border-line bg-surface-2 p-4">
            <div class="flex items-start justify-between gap-3">
              <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
              <CopyButton text={resultText} label={ui.copy} copiedLabel={ui.copied} />
            </div>
            {errorText ? (
              <div class="mt-3">
                <Notice tone="danger">{errorText}</Notice>
              </div>
            ) : result ? (
              <output aria-live="polite" class="mt-3 block">
                <p class="font-mono text-sm text-muted">{formatExpression(result.expression)}</p>
                <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {result.dice.map((die) => (
                    <div class="rounded-md border border-line bg-surface px-3 py-2 text-center">
                      <div class="tabular text-xl font-semibold text-fg">{die.value}</div>
                      <div class="mt-0.5 text-xs text-muted">
                        d{die.sides} · {die.kept ? ui.kept : ui.dropped}
                      </div>
                    </div>
                  ))}
                </div>
                <div class="mt-3 grid grid-cols-3 gap-2">
                  <Stat label={ui.totalLabel} value={result.total} emphasis />
                  <Stat label={ui.diceLabel} value={result.dice.length} />
                  <Stat label={ui.modifierLabel} value={result.expression.modifier} />
                </div>
              </output>
            ) : null}
            <p class="mt-3 text-xs text-subtle">{ui.cryptoNote}</p>
          </div>
        </div>
      </form>

      <div class="mt-5 border-t border-line pt-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm font-medium text-fg">{ui.historyHeading}</p>
          <Button size="sm" onClick={() => setHistory([])} disabled={!history.length}>
            {ui.clearHistory}
          </Button>
        </div>
        {history.length ? (
          <ol class="mt-3 grid gap-2" aria-live="polite">
            {history.map((item) => (
              <li class="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2 text-sm">
                <span class="min-w-0 truncate font-mono text-muted">{item.expression}</span>
                <span class="tabular font-semibold text-fg">{item.total}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p class="mt-3 text-sm text-muted">{ui.noHistory}</p>
        )}
      </div>
    </Panel>
  );
}

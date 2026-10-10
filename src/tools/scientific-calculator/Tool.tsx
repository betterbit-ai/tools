import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Kbd, Notice, Panel, Segmented } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  type AngleMode,
  type EvalErrorKind,
  type HistoryEntry,
  evaluate,
  formatResult,
  pushHistory,
  toPlainString,
} from './logic';

const STORAGE_KEY = 'tools:scientific-calculator:state';

interface PersistedState {
  input: string;
  angleMode: AngleMode;
  memory: number;
  history: HistoryEntry[];
}

const DEFAULT_STATE: PersistedState = { input: '', angleMode: 'deg', memory: 0, history: [] };

/** Keypad rows: label shown on the button, text inserted into the expression. */
const SCIENTIFIC_KEYS: { label: string; insert: string }[][] = [
  [
    { label: 'sin', insert: 'sin(' },
    { label: 'cos', insert: 'cos(' },
    { label: 'tan', insert: 'tan(' },
    { label: 'π', insert: 'π' },
  ],
  [
    { label: 'sin⁻¹', insert: 'asin(' },
    { label: 'cos⁻¹', insert: 'acos(' },
    { label: 'tan⁻¹', insert: 'atan(' },
    { label: 'e', insert: 'e' },
  ],
  [
    { label: 'ln', insert: 'ln(' },
    { label: 'log', insert: 'log(' },
    { label: '√', insert: 'sqrt(' },
    { label: '∛', insert: 'cbrt(' },
  ],
  [
    { label: 'xʸ', insert: '^' },
    { label: 'x²', insert: '^2' },
    { label: '!', insert: '!' },
    { label: '%', insert: '%' },
  ],
];

const DIGIT_KEYS: { label: string; insert: string }[][] = [
  [
    { label: '7', insert: '7' },
    { label: '8', insert: '8' },
    { label: '9', insert: '9' },
    { label: '÷', insert: '÷' },
  ],
  [
    { label: '4', insert: '4' },
    { label: '5', insert: '5' },
    { label: '6', insert: '6' },
    { label: '×', insert: '×' },
  ],
  [
    { label: '1', insert: '1' },
    { label: '2', insert: '2' },
    { label: '3', insert: '3' },
    { label: '−', insert: '−' },
  ],
];

/** After "=", these continue from the shown result (e.g. result "16" + "!" -> "16!"); everything else starts fresh. */
const CONTINUES_AFTER_RESULT = new Set(['+', '−', '×', '÷', '^', '!', '%']);

export default function ScientificCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [submitError, setSubmitError] = useState<EvalErrorKind | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (saved && typeof saved === 'object') setState({ ...DEFAULT_STATE, ...saved });
    } catch {
      /* ignore corrupt state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const preview = useMemo(
    () => (state.input.trim() === '' ? null : evaluate(state.input, state.angleMode)),
    [state.input, state.angleMode],
  );

  const errorMessages: Record<EvalErrorKind, string> = {
    empty: '',
    syntax: ui.errorSyntax,
    domain: ui.errorDomain,
    overflow: ui.errorOverflow,
  };

  const focusInput = () => inputRef.current?.focus();

  const setInput = (input: string) => {
    setSubmitError(null);
    setJustEvaluated(false);
    setState((s) => ({ ...s, input }));
  };

  /** Button presses append at the end; typing on the keyboard edits the field normally. */
  const press = (text: string) => {
    setSubmitError(null);
    setState((s) => {
      if (justEvaluated) {
        const input = CONTINUES_AFTER_RESULT.has(text) ? s.input + text : text;
        return { ...s, input };
      }
      return { ...s, input: s.input + text };
    });
    setJustEvaluated(false);
    focusInput();
  };

  const handleEquals = () => {
    const expr = state.input.trim();
    if (expr === '') return;
    const result = evaluate(expr, state.angleMode);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setSubmitError(null);
    const entry: HistoryEntry = { expr, result: result.value, at: Date.now() };
    setState((s) => ({ ...s, input: toPlainString(result.value), history: pushHistory(s.history, entry) }));
    setJustEvaluated(true);
    focusInput();
  };

  const handleClear = () => {
    setSubmitError(null);
    setState((s) => ({ ...s, input: '' }));
    setJustEvaluated(false);
    focusInput();
  };

  const handleBackspace = () => {
    setSubmitError(null);
    if (justEvaluated) {
      setState((s) => ({ ...s, input: '' }));
    } else {
      setState((s) => ({ ...s, input: s.input.slice(0, -1) }));
    }
    setJustEvaluated(false);
    focusInput();
  };

  const handleSign = () => {
    setSubmitError(null);
    setState((s) => {
      if (s.input === '') return s;
      const input = s.input.startsWith('-') ? s.input.slice(1) : `-${s.input}`;
      return { ...s, input };
    });
    setJustEvaluated(false);
    focusInput();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEquals();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    }
  };

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setSubmitError(null);
    setState((s) => ({ ...s, input: toPlainString(entry.result) }));
    setJustEvaluated(true);
    focusInput();
  };

  const clearHistory = () => setState((s) => ({ ...s, history: [] }));

  const memPlus = () =>
    setState((s) => {
      const r = evaluate(s.input, s.angleMode);
      return r.ok ? { ...s, memory: s.memory + r.value } : s;
    });
  const memMinus = () =>
    setState((s) => {
      const r = evaluate(s.input, s.angleMode);
      return r.ok ? { ...s, memory: s.memory - r.value } : s;
    });
  const memRecall = () => press(toPlainString(state.memory));
  const memClear = () => setState((s) => ({ ...s, memory: 0 }));

  return (
    <Panel>
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <div class="rounded-lg border border-line bg-surface-2 p-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus)]">
            <div class="flex items-center justify-between gap-2">
              <Segmented
                label={ui.angleModeLabel}
                value={state.angleMode}
                onValue={(v) => setState((s) => ({ ...s, angleMode: v }))}
                options={[
                  { value: 'deg', label: ui.degreeLabel },
                  { value: 'rad', label: ui.radianLabel },
                ]}
              />
              <span class="text-xs font-medium text-subtle" aria-hidden={state.memory === 0}>
                {state.memory !== 0 ? ui.memoryIndicator : ''}
              </span>
            </div>

            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autocomplete="off"
              spellcheck={false}
              aria-label={ui.expressionLabel}
              value={state.input}
              placeholder="0"
              onInput={(e) => setInput((e.currentTarget as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => (e.currentTarget as HTMLInputElement).setSelectionRange(9999, 9999)}
              class="mt-3 w-full bg-transparent text-right font-mono text-3xl tabular text-fg outline-none placeholder:text-subtle"
            />
            <div class="mt-1 min-h-5 text-right font-mono text-sm tabular text-subtle" aria-live="polite">
              {preview && preview.ok ? `= ${formatResult(preview.value, locale)}` : ' '}
            </div>

            {submitError && (
              <div class="mt-2">
                <Notice tone="danger">{errorMessages[submitError]}</Notice>
              </div>
            )}
          </div>

          <div class="mt-3 grid grid-cols-4 gap-1.5">
            <Button size="sm" variant="ghost" onClick={memClear}>
              MC
            </Button>
            <Button size="sm" variant="ghost" onClick={memRecall}>
              MR
            </Button>
            <Button size="sm" variant="ghost" onClick={memPlus}>
              M+
            </Button>
            <Button size="sm" variant="ghost" onClick={memMinus}>
              M−
            </Button>

            <Button size="sm" variant="danger" onClick={handleClear}>
              AC
            </Button>
            <Button size="sm" variant="secondary" onClick={handleBackspace}>
              DEL
            </Button>
            <Button size="sm" variant="secondary" onClick={() => press('(')}>
              (
            </Button>
            <Button size="sm" variant="secondary" onClick={() => press(')')}>
              )
            </Button>

            {SCIENTIFIC_KEYS.flat().map((k) => (
              <Button key={k.label} size="sm" variant="secondary" onClick={() => press(k.insert)}>
                {k.label}
              </Button>
            ))}
          </div>

          <div class="mt-1.5 grid grid-cols-4 gap-1.5">
            {DIGIT_KEYS.flat().map((k) => (
              <Button key={k.label} variant="secondary" onClick={() => press(k.insert)}>
                {k.label}
              </Button>
            ))}
            <Button variant="secondary" onClick={handleSign}>
              ±
            </Button>
            <Button variant="secondary" onClick={() => press('0')}>
              0
            </Button>
            <Button variant="secondary" onClick={() => press('.')}>
              .
            </Button>
            <Button variant="secondary" onClick={() => press('+')}>
              +
            </Button>
          </div>
          <Button class="mt-1.5 w-full" variant="primary" size="lg" onClick={handleEquals}>
            =
          </Button>

          <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-subtle">
            <span class="inline-flex items-center gap-1.5">
              <Kbd>Enter</Kbd> {ui.kbdEquals}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <Kbd>Esc</Kbd> {ui.kbdClear}
            </span>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-fg">{ui.historyHeading}</p>
            {state.history.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clearHistory}>
                {ui.clearHistory}
              </Button>
            )}
          </div>
          {state.history.length === 0 ? (
            <p class="mt-2 text-xs text-subtle">{ui.historyEmpty}</p>
          ) : (
            <>
              <p class="mt-1 text-xs text-subtle">{ui.historyHint}</p>
              <ul class="mt-2 max-h-80 space-y-1 overflow-y-auto">
                {state.history.map((h) => (
                  <li key={h.at}>
                    <button
                      type="button"
                      onClick={() => loadHistoryEntry(h)}
                      class="w-full rounded-md px-2 py-1.5 text-right transition-colors hover:bg-surface-2"
                    >
                      <div class="truncate font-mono text-xs text-subtle">{h.expr}</div>
                      <div class="truncate font-mono text-sm tabular text-fg">= {formatResult(h.result, locale)}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

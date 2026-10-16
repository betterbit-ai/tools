import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { addFlip, flipCoin, getStats, initialCoinState, isCoinState, normalizeLabel, type CoinState } from './logic';

const STATE_KEY = 'tools:coin-flip:state';
const LABELS_KEY = 'tools:coin-flip:labels';

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

export default function CoinFlip({ ui }: ToolProps<UI>) {
  const [headsLabel, setHeadsLabel] = useState(ui.headsDefault);
  const [tailsLabel, setTailsLabel] = useState(ui.tailsDefault);
  const [state, setState] = useState<CoinState>(initialCoinState);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  const flip = useCallback(() => {
    try {
      const side = flipCoin(cryptoSource);
      setState((current) => addFlip(current, side));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    try {
      const savedState = JSON.parse(safeStorage.get(STATE_KEY) ?? 'null');
      if (isCoinState(savedState)) setState(savedState);
      const labels = JSON.parse(safeStorage.get(LABELS_KEY) ?? 'null');
      if (labels && typeof labels.heads === 'string' && typeof labels.tails === 'string') {
        setHeadsLabel(labels.heads);
        setTailsLabel(labels.tails);
      }
    } catch {
      /* Ignore malformed local state. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STATE_KEY, JSON.stringify(state));
  }, [ready, state]);

  useEffect(() => {
    if (ready) safeStorage.set(LABELS_KEY, JSON.stringify({ heads: headsLabel, tails: tailsLabel }));
  }, [headsLabel, ready, tailsLabel]);

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
      if (event.key === ' ') {
        event.preventDefault();
        flip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flip]);

  const labels = {
    heads: normalizeLabel(headsLabel, ui.headsDefault),
    tails: normalizeLabel(tailsLabel, ui.tailsDefault),
  };
  const latest = state.history[0];
  const stats = useMemo(() => getStats(state), [state]);

  return (
    <Panel>
      <div class="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          <p class="text-sm text-muted">{ui.intro}</p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={ui.headsLabel} hint={ui.choiceHint}>
              <TextInput
                value={headsLabel}
                maxLength={80}
                onInput={(event) => setHeadsLabel(event.currentTarget.value)}
              />
            </Field>
            <Field label={ui.tailsLabel} hint={ui.choiceHint}>
              <TextInput
                value={tailsLabel}
                maxLength={80}
                onInput={(event) => setTailsLabel(event.currentTarget.value)}
              />
            </Field>
          </div>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" onClick={flip}>
              {ui.flip}
            </Button>
            <span class="text-xs text-muted">
              {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd>
            </span>
          </div>
          <p class="mt-3 text-xs text-subtle">{ui.cryptoNote}</p>
        </div>

        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
          {error ? (
            <div class="mt-3">
              <Notice tone="danger">{ui.cryptoError}</Notice>
            </div>
          ) : (
            <output
              aria-live="polite"
              class="mt-3 block rounded-md border border-line bg-surface px-4 py-5 text-center"
            >
              <span class="text-xs text-muted">{latest ? ui.landed : ui.ready}</span>
              <strong class="mt-1 block break-words text-3xl font-semibold tracking-tight text-fg">
                {latest ? labels[latest] : ui.readyValue}
              </strong>
            </output>
          )}
          <div class="mt-3 grid grid-cols-3 gap-2">
            <Stat label={labels.heads} value={`${stats.heads} (${stats.headsPercent}%)`} />
            <Stat label={labels.tails} value={`${stats.tails} (${stats.tailsPercent}%)`} />
            <Stat label={ui.total} value={stats.total} emphasis />
          </div>
        </div>
      </div>

      <div class="mt-5 border-t border-line pt-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm font-medium text-fg">{ui.historyHeading}</p>
          <Button size="sm" onClick={() => setState(initialCoinState())} disabled={!stats.total}>
            {ui.reset}
          </Button>
        </div>
        {state.history.length ? (
          <ol class="mt-3 flex flex-wrap gap-2" aria-live="polite">
            {state.history.map((side, index) => (
              <li class="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-fg">
                <span class="text-subtle">{state.history.length - index}. </span>
                {labels[side]}
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

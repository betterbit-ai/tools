import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Kbd, Notice, Panel, Stat, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MIN_REACTION_MS,
  ROUND_COUNT,
  addReactionTime,
  formatMilliseconds,
  isBetterAverage,
  isValidReactionTime,
  summariseReactionTimes,
} from './logic';

const BEST_AVERAGE_KEY = 'tools:reaction-time-test:best-average';
type Phase = 'idle' | 'waiting' | 'go' | 'false-start' | 'round-done' | 'complete';

export default function ReactionTimeTest({ ui }: ToolProps<UI>) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<number[]>([]);
  const [bestAverage, setBestAverage] = useState<number | null>(() => readBestAverage());
  const waitTimer = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const signalAt = useRef<number | null>(null);
  const resultsRef = useRef(results);

  resultsRef.current = results;

  const clearPending = useCallback(() => {
    if (waitTimer.current !== null) window.clearTimeout(waitTimer.current);
    if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    waitTimer.current = null;
    frame.current = null;
    signalAt.current = null;
  }, []);

  useEffect(() => () => clearPending(), [clearPending]);

  useEffect(() => {
    if (bestAverage !== null) safeStorage.set(BEST_AVERAGE_KEY, String(bestAverage));
  }, [bestAverage]);

  const beginRound = useCallback(
    (nextResults = resultsRef.current) => {
      clearPending();
      setPhase('waiting');
      const waitMs = 1_500 + Math.floor(Math.random() * 2_501);
      waitTimer.current = window.setTimeout(() => {
        frame.current = window.requestAnimationFrame(() => {
          signalAt.current = performance.now();
          setPhase('go');
          waitTimer.current = null;
          frame.current = null;
        });
      }, waitMs);
      resultsRef.current = nextResults;
    },
    [clearPending],
  );

  const reset = useCallback(() => {
    clearPending();
    resultsRef.current = [];
    setResults([]);
    setPhase('idle');
  }, [clearPending]);

  const respond = useCallback(() => {
    if (phase === 'waiting') {
      clearPending();
      setPhase('false-start');
      return;
    }
    if (phase === 'go') {
      const elapsed = performance.now() - (signalAt.current ?? performance.now());
      clearPending();
      if (!isValidReactionTime(elapsed)) {
        setPhase('false-start');
        return;
      }
      const nextResults = addReactionTime(resultsRef.current, elapsed);
      resultsRef.current = nextResults;
      setResults(nextResults);
      if (nextResults.length === ROUND_COUNT) {
        const summary = summariseReactionTimes(nextResults);
        if (isBetterAverage(summary.average, bestAverage)) setBestAverage(summary.average);
        setPhase('complete');
      } else {
        setPhase('round-done');
      }
      return;
    }
    if (phase === 'complete') {
      const nextResults: number[] = [];
      resultsRef.current = nextResults;
      setResults(nextResults);
      beginRound(nextResults);
      return;
    }
    beginRound();
  }, [beginRound, bestAverage, clearPending, phase]);

  const summary = useMemo(() => summariseReactionTimes(results), [results]);
  const message =
    phase === 'waiting'
      ? ui.waiting
      : phase === 'go'
        ? ui.go
        : phase === 'false-start'
          ? ui.falseStart
          : phase === 'round-done'
            ? ui.roundDone.replace('{round}', String(summary.count + 1))
            : phase === 'complete'
              ? ui.complete
              : ui.ready;
  const padLabel =
    phase === 'waiting'
      ? ui.waiting
      : phase === 'go'
        ? ui.go
        : phase === 'false-start'
          ? ui.tryAgain
          : phase === 'round-done'
            ? ui.nextRound.replace('{round}', String(summary.count + 1))
            : phase === 'complete'
              ? ui.testAgain
              : ui.start;
  const padClass =
    phase === 'waiting'
      ? 'bg-warning-soft text-warning hover:brightness-95'
      : phase === 'go'
        ? 'bg-success-soft text-success hover:brightness-95'
        : phase === 'false-start'
          ? 'bg-danger-soft text-danger hover:brightness-95'
          : 'bg-accent text-on-accent hover:bg-accent-hover';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium text-fg">{ui.testArea}</h2>
              <p id="reaction-time-test-help" class="mt-1 text-sm leading-6 text-muted">
                {ui.testAreaHint}
              </p>
            </div>
            <Button size="sm" onClick={reset} disabled={results.length === 0 && phase === 'idle'}>
              {ui.reset}
            </Button>
          </div>

          <Button
            size="lg"
            class={cx('mt-5 min-h-56 w-full px-6 text-xl sm:min-h-64 sm:text-2xl', padClass)}
            aria-describedby="reaction-time-test-help"
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.preventDefault();
              respond();
            }}
            onKeyDown={(event) => {
              if (event.repeat || ![' ', 'Enter', 'Space'].includes(event.key)) return;
              event.preventDefault();
              respond();
            }}
          >
            {padLabel}
          </Button>

          <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
            <Stat label={ui.average} value={withUnit(summary.average, ui.ms)} emphasis />
            <Stat label={ui.referencePercentile} value={percentileLabel(summary.referencePercentile, ui)} />
            <Stat label={ui.median} value={withUnit(summary.median, ui.ms)} />
            <Stat label={ui.spread} value={withUnit(summary.spread, ui.ms)} />
          </div>

          <div class="mt-3">
            <Notice tone={phase === 'false-start' ? 'danger' : phase === 'complete' ? 'success' : 'info'}>
              {message}
            </Notice>
          </div>
        </section>

        <aside class="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
          <p class="text-sm font-medium text-fg">{ui.rounds}</p>
          <ol class="mt-3 space-y-2" aria-live="polite">
            {Array.from({ length: ROUND_COUNT }, (_, index) => (
              <li class="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-sm" key={index}>
                <span class="text-muted">{ui.roundLabel.replace('{n}', String(index + 1))}</span>
                <span class="tabular font-medium text-fg">{withUnit(results[index], ui.ms)}</span>
              </li>
            ))}
          </ol>

          <div class="mt-6 border-t border-line pt-5">
            <p class="text-sm font-medium text-fg">{ui.personalBest}</p>
            <p class="mt-2 tabular text-3xl font-semibold tracking-tight text-fg">{withUnit(bestAverage, ui.ms)}</p>
            <p class="mt-1 text-xs leading-5 text-subtle">{ui.personalBestHint}</p>
          </div>
        </aside>
      </div>

      <div class="mt-6 border-t border-line pt-5">
        <p class="text-sm font-medium text-fg">{ui.keyboardControls}</p>
        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          <span>
            <Kbd>{ui.tabKey}</Kbd> {ui.focusPad}
          </span>
          <span>
            <Kbd>{ui.spaceKey}</Kbd> / <Kbd>{ui.enterKey}</Kbd> {ui.pressPad}
          </span>
        </div>
      </div>
      <p class="mt-4 text-xs leading-5 text-subtle">{ui.referenceNote.replace('{min}', String(MIN_REACTION_MS))}</p>
      <p class="mt-2 text-xs leading-5 text-subtle">{ui.localOnly}</p>
    </Panel>
  );
}

function readBestAverage(): number | null {
  const raw = safeStorage.get(BEST_AVERAGE_KEY);
  const value = raw === null ? null : Number(raw);
  return isValidReactionTime(value) ? Math.round(value) : null;
}

function withUnit(value: number | null | undefined, unit: string): string {
  const formatted = formatMilliseconds(value);
  return formatted === '—' ? formatted : `${formatted} ${unit}`;
}

function percentileLabel(value: number | null, ui: UI): string {
  return value === null ? '—' : ui.fasterThan.replace('{n}', String(value));
}

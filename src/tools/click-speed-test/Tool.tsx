import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BarChart, Button, Kbd, Notice, Panel, Segmented, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  TEST_DURATIONS,
  addClick,
  createRun,
  formatScore,
  formatTimeLeft,
  isBetterScore,
  summariseRun,
  toTestDuration,
  type ClickRun,
  type TestDuration,
} from './logic';

const BEST_SCORES_KEY = 'tools:click-speed-test:bests';
const DURATION_OPTIONS = TEST_DURATIONS.map((value) => String(value)) as ['1', '5', '10', '30', '60'];
type DurationOption = (typeof DURATION_OPTIONS)[number];
type TestState = 'ready' | 'running' | 'done';

function readBestScores(): Partial<Record<TestDuration, number>> {
  try {
    const parsed: unknown = JSON.parse(safeStorage.get(BEST_SCORES_KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object') return {};
    return TEST_DURATIONS.reduce<Partial<Record<TestDuration, number>>>((scores, duration) => {
      const value = (parsed as Record<string, unknown>)[String(duration)];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) scores[duration] = value;
      return scores;
    }, {});
  } catch {
    return {};
  }
}

export default function ClickSpeedTest({ ui }: ToolProps<UI>) {
  const [duration, setDuration] = useState<TestDuration>(5);
  const [state, setState] = useState<TestState>('ready');
  const [run, setRun] = useState<ClickRun | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestScores, setBestScores] = useState<Partial<Record<TestDuration, number>>>(readBestScores);
  const activeRunRef = useRef<ClickRun | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    safeStorage.set(BEST_SCORES_KEY, JSON.stringify(bestScores));
  }, [bestScores]);

  const finishRun = useCallback(() => {
    const activeRun = activeRunRef.current;
    if (!activeRun) return;
    activeRunRef.current = null;
    setRun(activeRun);
    setElapsedMs(activeRun.durationSeconds * 1000);
    setState('done');
    const score = summariseRun(activeRun).cps;
    setBestScores((current) =>
      isBetterScore(score, current[activeRun.durationSeconds])
        ? { ...current, [activeRun.durationSeconds]: score }
        : current,
    );
  }, []);

  const registerPress = useCallback(() => {
    const activeRun = activeRunRef.current;
    const now = performance.now();
    if (!activeRun) {
      const firstRun = addClick(createRun(duration), 0);
      activeRunRef.current = firstRun;
      startedAtRef.current = now;
      setRun(firstRun);
      setElapsedMs(0);
      setState('running');
      return;
    }

    const elapsed = now - startedAtRef.current;
    const nextRun = addClick(activeRun, elapsed);
    if (nextRun === activeRun) {
      finishRun();
      return;
    }
    activeRunRef.current = nextRun;
    setRun(nextRun);
    setElapsedMs(elapsed);
  }, [duration, finishRun]);

  useEffect(() => {
    if (state !== 'running') return;
    const interval = window.setInterval(() => {
      const activeRun = activeRunRef.current;
      if (!activeRun) return;
      const elapsed = performance.now() - startedAtRef.current;
      if (elapsed >= activeRun.durationSeconds * 1000) finishRun();
      else setElapsedMs(elapsed);
    }, 50);
    return () => window.clearInterval(interval);
  }, [finishRun, state]);

  useEffect(
    () => () => {
      activeRunRef.current = null;
    },
    [],
  );

  const reset = useCallback(() => {
    activeRunRef.current = null;
    setRun(null);
    setElapsedMs(0);
    setState('ready');
  }, []);

  const selectDuration = (value: DurationOption) => {
    reset();
    setDuration(toTestDuration(Number(value)));
  };

  const visibleRun = run ?? createRun(duration);
  const summary = useMemo(() => summariseRun(visibleRun), [visibleRun]);
  const timeLeft = formatTimeLeft(elapsedMs, visibleRun.durationSeconds);
  const bestScore = bestScores[duration];
  const resultFormula = ui.formula
    .replace('{clicks}', String(summary.clicks))
    .replace('{seconds}', String(visibleRun.durationSeconds))
    .replace('{cps}', formatScore(summary.cps));
  const statusMessage =
    state === 'running'
      ? ui.runningHint
      : state === 'done'
        ? ui.resultHint.replace('{formula}', resultFormula)
        : ui.readyHint.replace('{seconds}', String(duration));

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium text-fg">{ui.testArea}</h2>
              <p id="click-speed-test-help" class="mt-1 text-sm leading-6 text-muted">
                {ui.testAreaHint}
              </p>
            </div>
            <Button size="sm" onClick={reset} disabled={state === 'ready'}>
              {ui.reset}
            </Button>
          </div>

          <Button
            variant="primary"
            size="lg"
            class="mt-5 min-h-56 w-full px-6 text-xl sm:min-h-64 sm:text-2xl"
            aria-describedby="click-speed-test-help"
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.preventDefault();
              registerPress();
            }}
            onKeyDown={(event) => {
              if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return;
              event.preventDefault();
              registerPress();
            }}
          >
            {state === 'ready' ? ui.startPad : state === 'running' ? ui.runningPad : ui.donePad}
          </Button>

          <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
            <Stat label={ui.cps} value={formatScore(summary.cps)} emphasis />
            <Stat label={ui.clicks} value={summary.clicks} />
            <Stat label={ui.timeLeft} value={`${timeLeft} ${ui.seconds}`} />
            <Stat label={ui.fastestSecond} value={summary.fastestSecond} />
          </div>

          <div class="mt-3">
            <Notice tone={state === 'done' ? 'success' : 'info'}>{statusMessage}</Notice>
          </div>
        </section>

        <aside class="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
          <Segmented
            label={ui.duration}
            value={String(duration) as DurationOption}
            onValue={selectDuration}
            disabled={state === 'running'}
            options={DURATION_OPTIONS.map((value) => ({ value, label: ui.durationOption.replace('{n}', value) }))}
          />

          <div class="mt-6 border-t border-line pt-5">
            <p class="text-sm font-medium text-fg">{ui.personalBest}</p>
            <p class="mt-2 tabular text-3xl font-semibold tracking-tight text-fg">
              {bestScore === undefined ? ui.unavailable : formatScore(bestScore)}
            </p>
            <p class="mt-1 text-xs leading-5 text-subtle">{ui.personalBestHint}</p>
          </div>

          <div class="mt-6 border-t border-line pt-5">
            <p class="text-sm font-medium text-fg">{ui.pace}</p>
            <div class="mt-3">
              <BarChart
                ariaLabel={ui.paceChart}
                items={summary.buckets.map((value, index) => ({
                  label: ui.secondLabel.replace('{n}', String(index + 1)),
                  value,
                }))}
              />
            </div>
            <p class="mt-2 text-xs leading-5 text-subtle">{ui.paceHint}</p>
          </div>
        </aside>
      </div>

      <div class="mt-6 border-t border-line pt-5">
        <p class="text-sm font-medium text-fg">{ui.keyboardShortcuts}</p>
        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          <span>
            <Kbd>{ui.tabKey}</Kbd> {ui.focusPad}
          </span>
          <span>
            <Kbd>{ui.spaceKey}</Kbd> / <Kbd>{ui.enterKey}</Kbd> {ui.pressPad}
          </span>
        </div>
      </div>
      <p class="mt-4 text-xs leading-5 text-subtle">{ui.localOnly}</p>
    </Panel>
  );
}

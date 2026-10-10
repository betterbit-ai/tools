import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Kbd, Panel, cx } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  addLap,
  elapsed,
  formatStopwatch,
  idle,
  isStopwatchState,
  lapsToCsv,
  pause,
  reset,
  settle,
  start,
  type StopwatchState,
} from './logic';

const STATE_KEY = 'tools:stopwatch:state';

export default function Stopwatch({ ui }: ToolProps<UI>) {
  const [state, setState] = useState<StopwatchState>(idle);
  const [now, setNow] = useState(() => Date.now());
  const panelRef = useRef<HTMLDivElement>(null);

  // An active elapsed timestamp and lap history are restored after refresh.
  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STATE_KEY) ?? 'null');
      if (isStopwatchState(saved)) {
        const current = Date.now();
        setNow(current);
        setState(settle(saved, current));
      }
    } catch {
      /* Ignore corrupt or unavailable local storage. */
    }
  }, []);

  useEffect(() => {
    safeStorage.set(STATE_KEY, JSON.stringify(state));
  }, [state]);

  // The display refreshes often, but elapsed time itself comes from an absolute timestamp.
  useEffect(() => {
    if (state.status !== 'running') return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      setState((previous) => settle(previous, current));
    }, 50);
    return () => clearInterval(interval);
  }, [state.status]);

  const toggle = useCallback(() => {
    const current = Date.now();
    setNow(current);
    setState((previous) => (previous.status === 'running' ? pause(previous, current) : start(previous, current)));
  }, []);

  const lap = useCallback(() => {
    const current = Date.now();
    setNow(current);
    setState((previous) => addLap(previous, current));
  }, []);

  const clear = useCallback(() => {
    setNow(Date.now());
    setState(reset());
  }, []);

  const fullscreen = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void panel.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.code === 'Space') {
        event.preventDefault();
        toggle();
      } else if (event.key === 'l' || event.key === 'L') {
        event.preventDefault();
        lap();
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        clear();
      } else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        fullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clear, fullscreen, lap, toggle]);

  const total = elapsed(state, now);
  const display = formatStopwatch(total);
  const running = state.status === 'running';
  const canReset = state.status !== 'idle' || state.laps.length > 0;
  const toggleLabel = running ? ui.pause : state.status === 'paused' ? ui.resume : ui.start;

  return (
    <Panel class="overflow-hidden">
      <div
        ref={panelRef}
        class="flex flex-col items-center rounded-lg bg-surface py-6 transition-colors [&:fullscreen]:justify-center [&:fullscreen]:bg-bg"
      >
        <p class="text-sm font-medium text-muted">
          {running ? ui.running : state.status === 'paused' ? ui.paused : ui.ready}
        </p>
        <div
          role="timer"
          aria-live="off"
          aria-label={`${ui.elapsedTime}: ${display}`}
          class="mt-3 tabular font-semibold tracking-tight leading-none text-[clamp(2.7rem,12vw,7rem)] text-fg [:fullscreen_&]:text-[min(17vw,30vh)]"
        >
          {display}
        </div>

        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" onClick={toggle} class="min-w-32">
            {toggleLabel}
          </Button>
          <Button size="lg" onClick={lap} disabled={!running}>
            {ui.lap}
          </Button>
          <Button size="lg" onClick={clear} disabled={!canReset}>
            {ui.reset}
          </Button>
          <Button size="lg" variant="ghost" onClick={fullscreen} aria-label={ui.fullscreen}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2 2v-3" />
            </svg>
            <span class="hidden sm:inline">{ui.fullscreen}</span>
          </Button>
        </div>
      </div>

      <section class="mt-6 border-t border-line pt-6" aria-label={ui.laps}>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-medium text-fg">{ui.laps}</h2>
            <p class="mt-1 text-xs text-muted">{ui.lapHint}</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const csv = lapsToCsv(state.laps, [ui.lapNumber, ui.lapTime, ui.totalTime]);
              downloadBlob(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }), 'stopwatch-laps.csv');
            }}
            disabled={state.laps.length === 0}
          >
            {ui.downloadCsv}
          </Button>
        </div>

        {state.laps.length === 0 ? (
          <p class="mt-4 rounded-md bg-surface-2 px-3 py-3 text-sm text-muted">{ui.noLaps}</p>
        ) : (
          <div class="mt-4 max-h-80 overflow-auto rounded-md border border-line">
            <table class="w-full text-left text-sm">
              <caption class="sr-only">{ui.laps}</caption>
              <thead class="sticky top-0 bg-surface-2 text-xs text-muted">
                <tr>
                  <th scope="col" class="px-3 py-2 font-medium">
                    {ui.lapNumber}
                  </th>
                  <th scope="col" class="px-3 py-2 font-medium">
                    {ui.lapTime}
                  </th>
                  <th scope="col" class="px-3 py-2 font-medium">
                    {ui.totalTime}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...state.laps].reverse().map((entry, reverseIndex) => {
                  const index = state.laps.length - reverseIndex;
                  return (
                    <tr class={cx('border-t border-line', index === state.laps.length && 'bg-accent-soft')}>
                      <td class="px-3 py-2 tabular text-fg">{index}</td>
                      <td class="px-3 py-2 tabular text-fg">{formatStopwatch(entry.lapMs)}</td>
                      <td class="px-3 py-2 tabular text-muted">{formatStopwatch(entry.totalMs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div class="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">
        <span>
          <Kbd>Space</Kbd> {ui.startPause}
        </span>
        <span>
          <Kbd>L</Kbd> {ui.lap}
        </span>
        <span>
          <Kbd>R</Kbd> {ui.reset}
        </span>
        <span>
          <Kbd>F</Kbd> {ui.fullscreen}
        </span>
      </div>
    </Panel>
  );
}

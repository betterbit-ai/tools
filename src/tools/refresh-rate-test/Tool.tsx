import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Notice, Panel, Stat } from '../../components/ui';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  analyzeFrames,
  frameBudgetMs,
  matchStandardRate,
  rateReport,
  roundMs,
  roundRate,
  STANDARD_RATES,
  type FrameStats,
} from './logic';

/** How long one measurement runs. Longer than a single page settle, short enough to repeat. */
const MEASURE_MS = 5000;
/** Live figures refresh while the test runs; the finished reading comes from the whole run. */
const LIVE_EVERY_MS = 250;
/** Rates worth showing as a reference table. */
const TABLE_RATES = [30, 60, 75, 90, 120, 144, 165, 240];

type Status = 'measuring' | 'done' | 'interrupted';

export default function RefreshRateTest({ ui }: ToolProps<UI>) {
  const [status, setStatus] = useState<Status>('measuring');
  const [stats, setStats] = useState<FrameStats | null>(null);
  const [runId, setRunId] = useState(0);
  const [fullscreenFailed, setFullscreenFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    let started = 0;
    let lastLive = 0;
    const timestamps: number[] = [];

    setStatus('measuring');
    setStats(null);

    const loop = (now: number) => {
      if (cancelled) return;
      if (!started) started = now;
      timestamps.push(now);

      const elapsed = now - started;
      // Position lives on the DOM node so a 144 Hz loop does not re-render Preact every frame.
      if (barRef.current) {
        const progress = (elapsed / 1600) % 1;
        barRef.current.style.left = `${(progress * 100).toFixed(2)}%`;
      }

      if (elapsed >= MEASURE_MS) {
        const result = analyzeFrames(timestamps);
        setStats(result);
        setStatus(result?.stalled ? 'interrupted' : 'done');
        return;
      }

      if (now - lastLive >= LIVE_EVERY_MS) {
        lastLive = now;
        const preview = analyzeFrames(timestamps);
        if (preview) setStats(preview);
      }

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        // A hidden tab gets no frames, so a run that spanned a tab switch is not a rate.
        cancelAnimationFrame(frame);
        setRunId((value) => value + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [runId]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const match = stats ? matchStandardRate(stats.hz) : null;
  const headline = stats && !stats.stalled ? `${roundRate(stats.hz)}` : '—';
  const standardLabel = match?.withinTolerance
    ? `${match.rate} ${ui.hertz}`
    : match
      ? `${ui.about} ${match.rate} ${ui.hertz} (${ui.outsideTolerance})`
      : ui.none;

  const report = useMemo(
    () =>
      stats
        ? rateReport(stats, {
            rate: ui.reportRate,
            standard: ui.reportStandard,
            none: ui.none,
            frameTime: ui.frameTime,
            averageFrameTime: ui.averageFrameTime,
            jitter: ui.jitter,
            dropped: ui.droppedFrames,
            frames: ui.frames,
            stability: ui.stability,
            sample: ui.sample,
            duration: ui.duration,
            range: ui.rateRange,
            interrupted: ui.interrupted,
            seconds: ui.seconds,
            milliseconds: ui.milliseconds,
            hertz: ui.hertz,
          })
        : '',
    [stats, ui],
  );

  const toggleFullscreen = async () => {
    setFullscreenFailed(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setFullscreenFailed(true);
    }
  };

  return (
    <div class="space-y-4">
      <Panel>
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium tracking-wide text-subtle uppercase">{ui.resultsTitle}</p>
            <p class="mt-1 flex items-baseline gap-2" aria-live="polite">
              <span class="font-mono text-5xl font-semibold text-fg tabular-nums">{headline}</span>
              <span class="text-lg text-muted">{ui.hertz}</span>
            </p>
            <p class="mt-1 text-sm text-muted" aria-live="polite">
              {status === 'measuring' ? ui.measuring : standardLabel}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setRunId((value) => value + 1)}>
              {ui.restart}
            </Button>
            <Button variant="ghost" onClick={toggleFullscreen}>
              {isFullscreen ? ui.exitFullscreen : ui.fullscreen}
            </Button>
          </div>
        </div>

        <div class="mt-5 rounded-md border border-line bg-surface-2 p-3" aria-hidden="true">
          <p class="text-xs text-subtle">{ui.motionLabel}</p>
          <div class="relative mt-2 h-8 overflow-hidden rounded bg-surface">
            <div ref={barRef} class="absolute top-1 bottom-1 w-[12%] rounded bg-accent" style={{ left: '0%' }} />
          </div>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label={ui.standardRate} value={standardLabel} />
          <Stat
            label={ui.frameTime}
            value={stats ? `${roundMs(stats.medianIntervalMs)} ${ui.milliseconds}` : ui.dash}
          />
          <Stat label={ui.jitter} value={stats ? `${roundMs(stats.jitterMs)} ${ui.milliseconds}` : ui.dash} />
          <Stat
            label={ui.droppedFrames}
            value={stats ? `${stats.droppedFrames} / ${stats.sampleCount} ${ui.frames}` : ui.dash}
          />
          <Stat label={ui.stability} value={stats ? `${Math.round(stats.stabilityShare * 100)}%` : ui.dash} />
          <Stat
            label={ui.rateRange}
            value={stats ? `${roundRate(stats.minHz)}–${roundRate(stats.maxHz)} ${ui.hertz}` : ui.dash}
          />
        </div>

        <div class="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs leading-5 text-subtle">
            {status === 'measuring'
              ? ui.measuringHint.replace('{seconds}', String(Math.round(MEASURE_MS / 1000)))
              : ui.doneHint}
          </p>
          <CopyButton text={report} label={ui.copy} copiedLabel={ui.copied} />
        </div>

        <div class="mt-4 space-y-2">
          {status === 'interrupted' && <Notice tone="danger">{ui.interrupted}</Notice>}
          {stats && stats.droppedShare > 0.05 && status !== 'measuring' && <Notice>{ui.manyDropped}</Notice>}
          {fullscreenFailed && <Notice tone="danger">{ui.fullscreenFailed}</Notice>}
          <Notice>{ui.accuracyNotice}</Notice>
        </div>
      </Panel>

      <Panel>
        <h2 class="text-sm font-medium text-fg">{ui.tableTitle}</h2>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-line text-left text-xs text-subtle">
                <th class="py-2 pr-4 font-medium">{ui.hertz}</th>
                <th class="py-2 pr-4 font-medium">{ui.frameTime}</th>
                <th class="py-2 font-medium">{ui.typicalUse}</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_RATES.map((rate) => (
                <tr class="border-b border-line/60 last:border-0">
                  <td class="py-2 pr-4 font-mono tabular-nums text-fg">{rate}</td>
                  <td class="py-2 pr-4 font-mono tabular-nums text-muted">
                    {roundMs(frameBudgetMs(rate))} {ui.milliseconds}
                  </td>
                  <td class="py-2 text-muted">
                    {rate <= 75 ? ui.useOffice : rate <= 144 ? ui.useGaming : ui.useCompetitive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs leading-5 text-subtle">
          {ui.tableNote.replace('{count}', String(STANDARD_RATES.length))}
        </p>
      </Panel>
    </div>
  );
}

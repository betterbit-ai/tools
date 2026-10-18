/** Pure mouse-test logic. Browser pointer events are collected in Tool.tsx. */

export const CLICK_SCREENING_THRESHOLD_MS = 80;
export const GUIDED_SAMPLE_SIZE = 20;

export const MOUSE_BUTTONS = ['left', 'middle', 'right', 'back', 'forward'] as const;
export type MouseButton = (typeof MOUSE_BUTTONS)[number];

export interface MousePress {
  button: MouseButton;
  time: number;
}

export interface ClickInterval {
  button: MouseButton;
  milliseconds: number;
}

export interface ClickAnalysis {
  counts: Record<MouseButton, number>;
  intervals: ClickInterval[];
  suspects: ClickInterval[];
  shortestInterval: number | null;
}

export interface GuidedSample {
  presses: number;
  target: number;
  suspects: number;
  shortestInterval: number | null;
  complete: boolean;
  status: 'ready' | 'collecting' | 'clean' | 'suspect';
}

const emptyCounts = (): Record<MouseButton, number> => ({
  left: 0,
  middle: 0,
  right: 0,
  back: 0,
  forward: 0,
});

/** Maps the standard PointerEvent.button value to a browser-visible mouse button. */
export function mouseButtonFromCode(button: number): MouseButton | null {
  if (button === 0) return 'left';
  if (button === 1) return 'middle';
  if (button === 2) return 'right';
  if (button === 3) return 'back';
  if (button === 4) return 'forward';
  return null;
}

/**
 * Counts browser-observed button presses and compares each button only with
 * its own preceding press. Invalid and backwards timestamps are ignored for
 * interval screening instead of creating a false positive.
 */
export function analysePresses(presses: MousePress[], thresholdMs = CLICK_SCREENING_THRESHOLD_MS): ClickAnalysis {
  const counts = emptyCounts();
  const intervals: ClickInterval[] = [];
  const previous: Partial<Record<MouseButton, number>> = {};
  const threshold = Number.isFinite(thresholdMs) ? Math.max(0, thresholdMs) : CLICK_SCREENING_THRESHOLD_MS;

  for (const press of presses) {
    if (!MOUSE_BUTTONS.includes(press.button) || !Number.isFinite(press.time)) continue;
    counts[press.button] += 1;
    const last = previous[press.button];
    if (last === undefined || press.time >= last) {
      if (last !== undefined) {
        const milliseconds = press.time - last;
        intervals.push({ button: press.button, milliseconds });
      }
      previous[press.button] = press.time;
    }
  }

  const suspects = intervals.filter((interval) => interval.milliseconds < threshold);
  const shortestInterval = intervals.length ? Math.min(...intervals.map((interval) => interval.milliseconds)) : null;
  return { counts, intervals, suspects, shortestInterval };
}

/** Summarises a bounded, single-button sample used by the guided fault screen. */
export function analyseGuidedSample(
  presses: MousePress[],
  button: MouseButton,
  target = GUIDED_SAMPLE_SIZE,
  thresholdMs = CLICK_SCREENING_THRESHOLD_MS,
): GuidedSample {
  const safeTarget = Number.isFinite(target) ? Math.max(1, Math.floor(target)) : GUIDED_SAMPLE_SIZE;
  const selected = presses.filter((press) => press.button === button).slice(0, safeTarget);
  const analysis = analysePresses(selected, thresholdMs);
  const count = selected.length;
  const suspects = analysis.suspects.length;
  const complete = count >= safeTarget;
  const status: GuidedSample['status'] =
    count === 0 ? 'ready' : suspects > 0 ? 'suspect' : complete ? 'clean' : 'collecting';

  return {
    presses: count,
    target: safeTarget,
    suspects,
    shortestInterval: analysis.shortestInterval,
    complete,
    status,
  };
}

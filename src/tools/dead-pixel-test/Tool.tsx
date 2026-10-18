import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Kbd, Notice, Panel, ScreenTestSurface, Segmented, Toggle, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  AUTO_CYCLE_INTERVALS,
  colorPosition,
  moveColor,
  TEST_COLORS,
  toAutoCycleInterval,
  type AutoCycleInterval,
  type TestColor,
} from './logic';

const CYCLE_INTERVAL_STORAGE_KEY = 'tools:dead-pixel-test:cycle-seconds';

export default function DeadPixelTest({ ui }: ToolProps<UI>) {
  const [color, setColor] = useState<TestColor>('white');
  const [autoCycle, setAutoCycle] = useState(false);
  const [cycleSeconds, setCycleSeconds] = useState<AutoCycleInterval>(() =>
    toAutoCycleInterval(Number(safeStorage.get(CYCLE_INTERVAL_STORAGE_KEY))),
  );
  const [testing, setTesting] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const testRef = useRef<HTMLDivElement>(null);

  const nextColor = useCallback(() => setColor((current) => moveColor(current, 1)), []);
  const previousColor = useCallback(() => setColor((current) => moveColor(current, -1)), []);

  useEffect(() => {
    safeStorage.set(CYCLE_INTERVAL_STORAGE_KEY, String(cycleSeconds));
  }, [cycleSeconds]);

  useEffect(() => {
    if (!testing || !autoCycle) return;
    const interval = window.setInterval(nextColor, cycleSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [autoCycle, cycleSeconds, nextColor, testing]);

  const exitTest = useCallback(async () => {
    setAutoCycle(false);
    setTesting(false);
    if (document.fullscreenElement === testRef.current) await document.exitFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement !== testRef.current) {
        setTesting(false);
        setAutoCycle(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!testing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        nextColor();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previousColor();
      } else if (event.key === 'a' || event.key === 'A') {
        event.preventDefault();
        setAutoCycle((current) => !current);
      } else if (event.key === 'Escape' && !document.fullscreenElement) {
        void exitTest();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exitTest, nextColor, previousColor, testing]);

  const startTest = async () => {
    setFullscreenError(false);
    setTesting(true);
    const target = testRef.current;
    if (!target?.requestFullscreen) {
      setFullscreenError(true);
      return;
    }
    try {
      await target.requestFullscreen();
    } catch {
      setFullscreenError(true);
    }
  };

  const position = colorPosition(color);
  const colorLabel = ui[color];
  const positionLabel = ui.colorPosition
    .replace('{current}', String(position.current))
    .replace('{total}', String(position.total));

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium text-fg">{ui.testArea}</h2>
              <p class="mt-1 max-w-2xl text-sm leading-6 text-muted">{ui.previewHint}</p>
            </div>
            <Button variant="primary" onClick={() => void startTest()}>
              {ui.startTest}
            </Button>
          </div>

          <div ref={testRef} class="mt-5">
            <div role="img" aria-label={`${colorLabel} · ${positionLabel}`}>
              <ScreenTestSurface color={color} class="rounded-lg border border-line" />
            </div>
            {testing && (
              <ScreenTestSurface
                color={color}
                class="fixed inset-0 z-50 flex min-h-0 items-start justify-between gap-3 p-3 sm:p-5"
              >
                <div class="rounded-md bg-surface px-3 py-2 text-sm font-medium text-fg shadow-pop" aria-live="polite">
                  {colorLabel} · {positionLabel}
                </div>
                <Button
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    void exitTest();
                  }}
                >
                  {ui.exitTest}
                </Button>
              </ScreenTestSurface>
            )}
          </div>
          {fullscreenError && <Notice tone="info">{ui.fullScreenUnavailable}</Notice>}
        </section>

        <aside class="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
          <p class="text-sm font-medium text-fg">{ui.colors}</p>
          <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {TEST_COLORS.map((testColor) => (
              <Button
                key={testColor}
                size="sm"
                class={cx(color === testColor && 'border-accent text-accent')}
                onClick={() => setColor(testColor)}
              >
                {ui[testColor]}
              </Button>
            ))}
          </div>

          <div class="mt-6 border-t border-line pt-5">
            <Toggle checked={autoCycle} onChecked={setAutoCycle} label={ui.autoCycle} />
            <div class="mt-4">
              <Segmented
                label={ui.secondsPerColor}
                value={String(cycleSeconds)}
                onValue={(value) => setCycleSeconds(toAutoCycleInterval(Number(value)))}
                options={AUTO_CYCLE_INTERVALS.map((seconds) => ({
                  value: String(seconds),
                  label: ui.secondsOption.replace('{n}', String(seconds)),
                }))}
              />
            </div>
          </div>
        </aside>
      </div>

      <div class="mt-6 border-t border-line pt-5">
        <p class="text-sm font-medium text-fg">{ui.keyboardShortcuts}</p>
        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          <span>
            <Kbd>→</Kbd> <Kbd>Space</Kbd> {ui.nextColor}
          </span>
          <span>
            <Kbd>←</Kbd> {ui.previousColor}
          </span>
          <span>
            <Kbd>A</Kbd> {ui.toggleAuto}
          </span>
          <span>
            <Kbd>Esc</Kbd> {ui.exitShortcut}
          </span>
        </div>
      </div>
      <p class="sr-only" aria-live="polite">
        {testing ? `${ui.testActive}: ${colorLabel}, ${positionLabel}` : ''}
      </p>
    </Panel>
  );
}

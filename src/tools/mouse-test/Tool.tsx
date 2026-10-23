import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Notice, Panel, Segmented, Stat } from '../../components/ui';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  addPressToSummary,
  analyseGuidedSample,
  createPressSummary,
  mouseButtonFromCode,
  type MouseButton,
  type MousePress,
} from './logic';

export default function MouseTest({ ui }: ToolProps<UI>) {
  const [diagnostic, setDiagnostic] = useState(createPressSummary);
  const [samplePresses, setSamplePresses] = useState<MousePress[]>([]);
  const [selectedButton, setSelectedButton] = useState<MouseButton>('left');
  const [held, setHeld] = useState<Partial<Record<MouseButton, true>>>({});
  const [wheel, setWheel] = useState({ up: 0, down: 0 });
  const [pointerEventsSupported, setPointerEventsSupported] = useState<boolean | null>(null);

  const sample = useMemo(() => analyseGuidedSample(samplePresses, selectedButton), [samplePresses, selectedButton]);
  const unsupported = pointerEventsSupported === false;

  useEffect(() => {
    setPointerEventsSupported(typeof window.PointerEvent === 'function');

    const releaseButton = (event: PointerEvent) => {
      const mouseButton = mouseButtonFromCode(event.button);
      if (!mouseButton) return;
      setHeld((current) => {
        const next = { ...current };
        delete next[mouseButton];
        return next;
      });
    };
    const releaseAll = () => setHeld({});
    window.addEventListener('pointerup', releaseButton);
    window.addEventListener('pointercancel', releaseAll);
    window.addEventListener('blur', releaseAll);
    return () => {
      window.removeEventListener('pointerup', releaseButton);
      window.removeEventListener('pointercancel', releaseAll);
      window.removeEventListener('blur', releaseAll);
    };
  }, []);

  const buttonLabel = (button: MouseButton) => ui[`button${button[0].toUpperCase()}${button.slice(1)}` as keyof UI];
  const interval = (value: number | null) =>
    value === null ? ui.unavailable : `${Math.round(value)} ${ui.milliseconds}`;

  const resetDiagnostic = () => {
    setDiagnostic(createPressSummary());
    setHeld({});
    setWheel({ up: 0, down: 0 });
  };

  const resetSample = () => setSamplePresses([]);

  const onDiagnosticDown = (button: number, time: number) => {
    const mouseButton = mouseButtonFromCode(button);
    if (!mouseButton) return;
    setDiagnostic((current) => addPressToSummary(current, { button: mouseButton, time }));
    setHeld((current) => ({ ...current, [mouseButton]: true }));
  };

  const onDiagnosticUp = (button: number) => {
    const mouseButton = mouseButtonFromCode(button);
    if (!mouseButton) return;
    setHeld((current) => {
      const next = { ...current };
      delete next[mouseButton];
      return next;
    });
  };

  const onSampleDown = (button: number, time: number) => {
    const mouseButton = mouseButtonFromCode(button);
    if (!mouseButton || mouseButton !== selectedButton || sample.complete) return;
    setSamplePresses((current) => [...current, { button: mouseButton, time }]);
  };

  const selectButton = (button: MouseButton) => {
    setSelectedButton(button);
    setSamplePresses([]);
  };

  const sampleMessage =
    sample.status === 'ready'
      ? ui.sampleReady.replace('{button}', buttonLabel(selectedButton))
      : sample.status === 'clean'
        ? ui.sampleClean
        : sample.status === 'suspect'
          ? ui.sampleSuspect
          : ui.sampleCollecting;

  return (
    <Panel>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-sm font-medium text-fg">{ui.deviceCheck}</h2>
          <p class="mt-1 text-sm leading-6 text-muted">{ui.deviceCheckHint}</p>
        </div>
        <Button size="sm" onClick={resetDiagnostic} disabled={unsupported}>
          {ui.resetCheck}
        </Button>
      </div>

      {unsupported && (
        <div class="mt-4">
          <Notice tone="danger">{ui.browserUnsupported}</Notice>
        </div>
      )}

      <div
        class="mt-4 min-h-44 select-none rounded-lg border-2 border-dashed border-line-strong bg-surface-2 p-4 transition-colors hover:border-accent"
        tabIndex={unsupported ? -1 : 0}
        role="region"
        aria-label={ui.deviceCheck}
        aria-disabled={unsupported || undefined}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (unsupported || event.pointerType !== 'mouse') return;
          if (typeof event.currentTarget.setPointerCapture === 'function') {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          onDiagnosticDown(event.button, event.timeStamp);
        }}
        onPointerUp={(event) => {
          if (unsupported || event.pointerType !== 'mouse') return;
          onDiagnosticUp(event.button);
        }}
        onPointerCancel={() => setHeld({})}
        onWheel={(event) => {
          if (unsupported) return;
          event.preventDefault();
          setWheel((current) =>
            event.deltaY < 0
              ? { ...current, up: current.up + 1 }
              : event.deltaY > 0
                ? { ...current, down: current.down + 1 }
                : current,
          );
        }}
      >
        <div class="flex min-h-32 flex-col items-center justify-center text-center">
          <p class="text-base font-medium text-fg">{ui.deviceCheckPrompt}</p>
          <p class="mt-2 max-w-lg text-sm leading-6 text-muted">{ui.deviceCheckHelp}</p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-live="polite">
        {(['left', 'middle', 'right', 'back', 'forward'] as MouseButton[]).map((button) => (
          <Stat
            key={button}
            label={buttonLabel(button)}
            value={diagnostic.counts[button]}
            emphasis={Boolean(held[button])}
          />
        ))}
      </div>
      <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
        <Stat label={ui.wheelUp} value={wheel.up} />
        <Stat label={ui.wheelDown} value={wheel.down} />
        <Stat label={ui.shortestGap} value={interval(diagnostic.shortestInterval)} />
        <Stat label={ui.screenedRepeats} value={diagnostic.suspects} />
      </div>

      <div class="mt-6 border-t border-line pt-6">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 class="text-sm font-medium text-fg">{ui.guidedTest}</h2>
            <p class="mt-1 text-sm leading-6 text-muted">{ui.guidedTestHint}</p>
          </div>
          <Button size="sm" onClick={resetSample} disabled={unsupported}>
            {ui.restartSample}
          </Button>
        </div>

        <div class="mt-4">
          <Segmented
            label={ui.testButton}
            value={selectedButton}
            onValue={selectButton}
            disabled={unsupported}
            options={(['left', 'middle', 'right'] as MouseButton[]).map((button) => ({
              value: button,
              label: buttonLabel(button),
            }))}
          />
        </div>

        <div
          class="mt-4 min-h-36 select-none rounded-lg border border-line bg-surface p-4 text-center transition-colors hover:border-accent"
          tabIndex={unsupported ? -1 : 0}
          role="region"
          aria-label={ui.guidedTest}
          aria-disabled={unsupported || undefined}
          onContextMenu={(event) => event.preventDefault()}
          onPointerDown={(event) => {
            if (unsupported || event.pointerType !== 'mouse') return;
            onSampleDown(event.button, event.timeStamp);
          }}
        >
          <div class="flex min-h-28 flex-col items-center justify-center">
            <p class="text-base font-medium text-fg">
              {ui.samplePrompt.replace('{button}', buttonLabel(selectedButton))}
            </p>
            <p class="mt-2 max-w-xl text-sm leading-6 text-muted">{ui.sampleHelp}</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
          <Stat label={ui.sampleProgress} value={`${sample.presses} / ${sample.target}`} emphasis />
          <Stat label={ui.screenedRepeats} value={sample.suspects} />
          <Stat label={ui.shortestGap} value={interval(sample.shortestInterval)} />
          <Stat label={ui.sampleStatus} value={sample.complete ? ui.sampleDone : ui.sampleInProgress} />
        </div>
        <div class="mt-3">
          <Notice tone={sample.status === 'suspect' ? 'danger' : sample.status === 'clean' ? 'success' : 'info'}>
            {sampleMessage}
          </Notice>
        </div>
      </div>

      <div class="mt-4 flex items-start gap-2 text-xs leading-5 text-subtle">
        <span class="mt-0.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <p>{ui.localOnly}</p>
      </div>
    </Panel>
  );
}

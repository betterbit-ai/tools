import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, NumberInput, Panel, Stat, Toggle, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_SETTINGS,
  MAX_ROUNDS,
  MAX_SECONDS,
  advance,
  formatClock,
  idle,
  isIntervalTimerState,
  pause,
  remainingMs,
  sanitizeSettings,
  settle,
  start,
  totalSeconds,
  type IntervalSettings,
  type IntervalTimerState,
  type Phase,
} from './logic';

const STATE_KEY = 'tools:interval-timer:state';
const SOUND_KEY = 'tools:interval-timer:sound';
const VOICE_KEY = 'tools:interval-timer:voice';

const PRESETS: { id: string; settings: IntervalSettings }[] = [
  { id: 'tabata', settings: { prepSeconds: 5, workSeconds: 20, restSeconds: 10, rounds: 8 } },
  { id: 'hiit', settings: { prepSeconds: 5, workSeconds: 40, restSeconds: 20, rounds: 8 } },
  { id: 'boxing', settings: { prepSeconds: 5, workSeconds: 180, restSeconds: 60, rounds: 12 } },
];

export default function IntervalTimer({ ui, preset }: ToolProps<UI>) {
  const hasPreset = !!preset && Object.values(preset).some((value) => typeof value === 'number');
  const [state, setState] = useState<IntervalTimerState>(() => idle(settingsFromPreset(preset)));
  const [now, setNow] = useState(() => Date.now());
  const [sound, setSound] = useState(true);
  const [voice, setVoice] = useState(false);
  const [restored, setRestored] = useState(false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const baseTitle = useRef('');
  const announced = useRef('');

  useEffect(() => {
    baseTitle.current = document.title;
    try {
      const saved = JSON.parse(safeStorage.get(STATE_KEY) ?? 'null');
      if (isIntervalTimerState(saved)) {
        if (saved.status === 'running' || saved.status === 'paused') setState(settle(saved, Date.now()));
        else if (!hasPreset) setState(saved);
      }
    } catch {
      /* Ignore corrupted local data. */
    }
    setSound(safeStorage.get(SOUND_KEY) !== 'off');
    setVoice(safeStorage.get(VOICE_KEY) === 'on');
    setRestored(true);
  }, [hasPreset]);

  useEffect(() => {
    if (restored) safeStorage.set(STATE_KEY, JSON.stringify(state));
  }, [restored, state]);

  useEffect(() => {
    if (state.status !== 'running') return;
    const id = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      setState((current) => settle(current, time));
    }, 200);
    return () => window.clearInterval(id);
  }, [state.status]);

  const left = remainingMs(state, now);
  const clock = formatClock(left);
  const phaseLabel = getPhaseLabel(state.phase, ui);
  const activeRound = state.phase === 'ready' ? 1 : state.round;
  const roundLabel = ui.round
    .replace('{current}', String(activeRound))
    .replace('{total}', String(state.settings.rounds));

  useEffect(() => {
    if (!baseTitle.current) return;
    if (state.status === 'running' || state.status === 'paused')
      document.title = `${clock} · ${phaseLabel} · ${baseTitle.current}`;
    else if (state.status === 'done') document.title = `${ui.complete} · ${baseTitle.current}`;
    else document.title = baseTitle.current;
  }, [clock, phaseLabel, state.status, ui.complete]);

  const unlockAudio = useCallback(() => {
    if (!audio.current && typeof AudioContext !== 'undefined') audio.current = new AudioContext();
    void audio.current?.resume();
  }, []);

  const say = useCallback(
    (nextState: IntervalTimerState) => {
      if (!voice) return;
      if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
        setVoiceUnavailable(true);
        return;
      }
      const phrase = voicePhrase(nextState.phase, nextState.round, nextState.settings.rounds, ui);
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(phrase));
    },
    [ui, voice],
  );

  useEffect(() => {
    const key = `${state.status}:${state.phase}:${state.round}`;
    if (announced.current === key || state.status === 'idle' || state.status === 'paused') return;
    announced.current = key;
    if (sound) beep(audio.current, state.phase === 'done' ? 1_175 : 880);
    say(state);
  }, [say, sound, state]);

  const toggle = useCallback(() => {
    unlockAudio();
    const time = Date.now();
    setNow(time);
    setState((current) => (current.status === 'running' ? pause(current, time) : start(current, time)));
  }, [unlockAudio]);

  const reset = useCallback(() => {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    setState((current) => idle(current.settings));
  }, []);

  const skip = useCallback(() => {
    const time = Date.now();
    setNow(time);
    setState((current) => (current.status === 'running' ? settle(advance(current, time), time) : current));
  }, []);

  const applySettings = useCallback((settings: IntervalSettings) => {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    setState(idle(settings));
  }, []);

  const updateSetting = (key: keyof IntervalSettings, value: number | '') => {
    applySettings(sanitizeSettings({ ...state.settings, [key]: value === '' ? 0 : value }));
  };

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
      } else if (event.key === 'r' || event.key === 'R') reset();
      else if (event.key === 's' || event.key === 'S') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reset, skip, toggle]);

  const settingsLocked = state.status === 'running' || state.status === 'paused';
  const selectedPreset =
    PRESETS.find((presetItem) => equalSettings(presetItem.settings, state.settings))?.id ?? 'custom';

  return (
    <Panel class="overflow-hidden">
      <div class="flex flex-col items-center rounded-lg bg-surface py-6">
        <p class="text-sm font-medium text-muted" aria-live="polite">
          {phaseLabel}
        </p>
        <div
          role="timer"
          aria-live="off"
          aria-label={clock}
          class={cx(
            'mt-2 tabular font-semibold tracking-tight leading-none text-[clamp(4rem,18vw,10rem)]',
            state.status === 'done' ? 'text-success' : 'text-fg',
          )}
        >
          {clock}
        </div>
        <p class="mt-3 text-sm text-muted" aria-live="polite">
          {roundLabel}
        </p>
        {state.status === 'done' && <Notice tone="success">{ui.complete}</Notice>}
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" onClick={toggle} class="min-w-32">
            {state.status === 'running'
              ? ui.pause
              : state.status === 'paused'
                ? ui.resume
                : state.status === 'done'
                  ? ui.restart
                  : ui.start}
          </Button>
          <Button size="lg" onClick={reset} disabled={state.status === 'idle'}>
            {ui.reset}
          </Button>
          <Button size="lg" onClick={skip} disabled={state.status !== 'running'}>
            {ui.skip}
          </Button>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section>
          <p class="mb-2 text-sm font-medium text-fg">{ui.presets}</p>
          <div class="flex flex-wrap gap-2">
            {PRESETS.map((presetItem) => (
              <Button
                key={presetItem.id}
                size="sm"
                onClick={() => applySettings(presetItem.settings)}
                class={cx(selectedPreset === presetItem.id && 'border-accent text-accent')}
              >
                {ui[presetItem.id as 'tabata' | 'hiit' | 'boxing']}
              </Button>
            ))}
            <Button
              size="sm"
              onClick={() => applySettings(DEFAULT_SETTINGS)}
              class={cx(selectedPreset === 'custom' && 'border-accent text-accent')}
            >
              {ui.custom}
            </Button>
          </div>
          <fieldset disabled={settingsLocked} class="mt-6 border-t border-line pt-6 disabled:opacity-60">
            <legend class="text-sm font-medium text-fg">{ui.settings}</legend>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label={ui.prepSeconds} hint={ui.secondsHint}>
                <NumberInput
                  value={state.settings.prepSeconds}
                  min={0}
                  max={MAX_SECONDS}
                  onValue={(value) => updateSetting('prepSeconds', value)}
                />
              </Field>
              <Field label={ui.workSeconds} hint={ui.secondsHint}>
                <NumberInput
                  value={state.settings.workSeconds}
                  min={1}
                  max={MAX_SECONDS}
                  onValue={(value) => updateSetting('workSeconds', value)}
                />
              </Field>
              <Field label={ui.restSeconds} hint={ui.secondsHint}>
                <NumberInput
                  value={state.settings.restSeconds}
                  min={0}
                  max={MAX_SECONDS}
                  onValue={(value) => updateSetting('restSeconds', value)}
                />
              </Field>
              <Field label={ui.rounds} hint={ui.roundsHint}>
                <NumberInput
                  value={state.settings.rounds}
                  min={1}
                  max={MAX_ROUNDS}
                  onValue={(value) => updateSetting('rounds', value)}
                />
              </Field>
            </div>
          </fieldset>
        </section>

        <aside class="grid content-start gap-4">
          <div class="grid grid-cols-2 gap-3" aria-live="polite">
            <Stat label={ui.total} value={formatClock(totalSeconds(state.settings) * 1000)} emphasis />
            <Stat label={ui.rounds} value={`${state.settings.rounds}`} />
          </div>
          <Toggle
            checked={sound}
            onChecked={(checked) => {
              setSound(checked);
              safeStorage.set(SOUND_KEY, checked ? 'on' : 'off');
            }}
            label={ui.sound}
          />
          <Toggle
            checked={voice}
            onChecked={(checked) => {
              setVoice(checked);
              safeStorage.set(VOICE_KEY, checked ? 'on' : 'off');
            }}
            label={ui.voice}
          />
          <Button
            size="sm"
            onClick={() => {
              unlockAudio();
              beep(audio.current, 880);
            }}
          >
            {ui.testSound}
          </Button>
          {voiceUnavailable && <Notice tone="danger">{ui.browserVoiceUnavailable}</Notice>}
        </aside>
      </div>

      <div class="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-line pt-6 text-xs text-muted">
        <span>
          <Kbd>{ui.keySpace}</Kbd> {ui.startPause}
        </span>
        <span>
          <Kbd>{ui.keyR}</Kbd> {ui.keyReset}
        </span>
        <span>
          <Kbd>{ui.keyS}</Kbd> {ui.keySkip}
        </span>
      </div>
    </Panel>
  );
}

function settingsFromPreset(preset: Record<string, unknown> | undefined): IntervalSettings {
  return sanitizeSettings({
    prepSeconds: typeof preset?.prepSeconds === 'number' ? preset.prepSeconds : DEFAULT_SETTINGS.prepSeconds,
    workSeconds: typeof preset?.workSeconds === 'number' ? preset.workSeconds : DEFAULT_SETTINGS.workSeconds,
    restSeconds: typeof preset?.restSeconds === 'number' ? preset.restSeconds : DEFAULT_SETTINGS.restSeconds,
    rounds: typeof preset?.rounds === 'number' ? preset.rounds : DEFAULT_SETTINGS.rounds,
  });
}

function equalSettings(left: IntervalSettings, right: IntervalSettings): boolean {
  return (
    left.prepSeconds === right.prepSeconds &&
    left.workSeconds === right.workSeconds &&
    left.restSeconds === right.restSeconds &&
    left.rounds === right.rounds
  );
}

function getPhaseLabel(phase: Phase, ui: UI): string {
  if (phase === 'ready') return ui.phaseReady;
  if (phase === 'work') return ui.phaseWork;
  if (phase === 'rest') return ui.phaseRest;
  return ui.phaseDone;
}

function voicePhrase(phase: Phase, round: number, rounds: number, ui: UI): string {
  if (phase === 'done') return ui.voiceComplete;
  const label = phase === 'ready' ? ui.voiceReady : phase === 'work' ? ui.voiceWork : ui.voiceRest;
  return `${label}. ${ui.round.replace('{current}', String(phase === 'ready' ? 1 : round)).replace('{total}', String(rounds))}`;
}

function beep(context: AudioContext | null, frequency: number) {
  if (!context) return;
  const time = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.25, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.2);
}

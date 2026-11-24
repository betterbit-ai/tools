import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Segmented, Stat, TextInput, Toggle, cx } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_MINUTES,
  MAX_ROUNDS,
  MAX_TASKS,
  addTask,
  choosePhase,
  countToday,
  formatClock,
  idle,
  isPomodoroState,
  pause,
  remaining,
  removeTask,
  reset,
  selectTask,
  settle,
  skip,
  start,
  toggleTask,
  updateSettings,
  type Phase,
  type PomodoroState,
} from './logic';

const STATE_KEY = 'tools:pomodoro-timer:state';
const NOTIFICATIONS_KEY = 'tools:pomodoro-timer:notifications';
const MAX_STORED_STATE_BYTES = 128 * 1024;

/**
 * A minute/round field that keeps the text the visitor is typing instead of snapping a cleared
 * field back to the minimum, which turned "50" typed after Ctrl+A into "150".
 */
function NumberSetting(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(String(props.value));
  useEffect(() => {
    setText(String(props.value));
  }, [props.value]);
  return (
    <Field label={props.label}>
      <TextInput
        inputMode="numeric"
        value={text}
        onInput={(event) => {
          const digits = (event.currentTarget as HTMLInputElement).value.replace(/[^\d]/g, '');
          setText(digits);
          if (digits === '') return; // An empty field keeps the current setting; blur restores the number.
          const parsed = Number(digits);
          if (!Number.isFinite(parsed)) return;
          const clamped = Math.min(props.max, Math.max(props.min, Math.trunc(parsed)));
          props.onChange(clamped);
          setText(String(clamped));
        }}
        onBlur={() => setText(String(props.value))}
      />
    </Field>
  );
}

export default function PomodoroTimer({ ui }: ToolProps<UI>) {
  const [state, setState] = useState<PomodoroState>(idle);
  const [now, setNow] = useState(() => Date.now());
  const [taskDraft, setTaskDraft] = useState('');
  const [notifications, setNotifications] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const baseTitle = useRef('');
  const lastCompletion = useRef<number | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: 'info' | 'danger' } | null>(null);

  useEffect(() => {
    baseTitle.current = document.title;
    try {
      const serialized = safeStorage.get(STATE_KEY);
      const saved = serialized && serialized.length <= MAX_STORED_STATE_BYTES ? JSON.parse(serialized) : null;
      if (isPomodoroState(saved)) {
        const current = Date.now();
        const restored = settle(saved, current);
        // A phase that ended while the page was closed is shown, not announced again on load.
        lastCompletion.current = restored.lastCompletedAt ?? null;
        setNow(current);
        setState(restored);
      }
    } catch {
      /* Storage is optional and corrupt data is ignored. */
    }
    setNotifications(
      'Notification' in window && safeStorage.get(NOTIFICATIONS_KEY) === 'on' && Notification.permission === 'granted',
    );
  }, []);

  useEffect(() => {
    safeStorage.set(STATE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.status !== 'running') return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      setState((previous) => settle(previous, current));
    }, 250);
    return () => clearInterval(interval);
  }, [state.status]);

  const unlockAudio = () => {
    if (typeof AudioContext === 'undefined') {
      setNotice({ text: ui.soundUnavailable, tone: 'danger' });
      return;
    }
    try {
      if (!audio.current) audio.current = new AudioContext();
      void audio.current.resume().catch(() => setNotice({ text: ui.soundUnavailable, tone: 'danger' }));
    } catch {
      setNotice({ text: ui.soundUnavailable, tone: 'danger' });
    }
  };

  useEffect(() => {
    const completedAt = state.lastCompletedAt ?? null;
    if (completedAt === null || !state.lastCompletedPhase || lastCompletion.current === completedAt) return;
    lastCompletion.current = completedAt;
    beep(audio.current);
    if (notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(ui.notificationTitle, { body: ui.notificationBody.replace('{phase}', ui[state.phase]) });
    }
  }, [notifications, state.lastCompletedAt, state.lastCompletedPhase, state.phase, ui]);

  const left = remaining(state, now);
  const display = formatClock(left);
  const running = state.status === 'running';
  const toggle = useCallback(() => {
    unlockAudio();
    const current = Date.now();
    setNow(current);
    setState((previous) => (previous.status === 'running' ? pause(previous, current) : start(previous, current)));
  }, []);

  useEffect(() => {
    if (!baseTitle.current) return;
    document.title = running ? `${display} · ${baseTitle.current}` : baseTitle.current;
  }, [display, running]);

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
        // A focused button or radio keeps its own Space activation; otherwise the shortcut would
        // press Start/Pause instead of the control the visitor tabbed to.
        if (target.closest('button, a[href], summary, [role="button"]')) return;
        event.preventDefault();
        toggle();
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        setState((previous) => reset(previous));
      } else if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        setState((previous) => skip(previous));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const updateNotification = async (enabled: boolean) => {
    if (!enabled) {
      setNotifications(false);
      safeStorage.set(NOTIFICATIONS_KEY, 'off');
      setNotice(null);
      return;
    }
    if (!('Notification' in window)) {
      setNotifications(false);
      safeStorage.set(NOTIFICATIONS_KEY, 'off');
      setNotice({ text: ui.notificationsUnsupported, tone: 'danger' });
      return;
    }
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setNotifications(granted);
    safeStorage.set(NOTIFICATIONS_KEY, granted ? 'on' : 'off');
    // A denied request used to leave the switch off again with no explanation.
    setNotice(granted ? null : { text: ui.notificationsBlocked, tone: 'info' });
  };

  const addDraft = () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setState((previous) => addTask(previous, id, taskDraft));
    setTaskDraft('');
  };
  const downloadData = () => {
    const backup = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
    downloadBlob(new Blob([backup], { type: 'application/json' }), 'pomodoro-timer-data.json');
  };
  const phaseOptions: { value: Phase; label: string }[] = [
    { value: 'focus', label: ui.focus },
    { value: 'shortBreak', label: ui.shortBreak },
    { value: 'longBreak', label: ui.longBreak },
  ];
  const toggleLabel = running ? ui.pause : state.status === 'paused' ? ui.resume : ui.start;

  return (
    <Panel>
      <div class="flex flex-col items-center rounded-lg bg-surface py-6">
        <p class="text-sm font-medium text-muted">{ui[state.phase]}</p>
        <div
          role="timer"
          aria-live="off"
          aria-label={`${ui[state.phase]}: ${display}`}
          class="mt-3 tabular font-semibold tracking-tight leading-none text-[clamp(4rem,18vw,9rem)] text-fg"
        >
          {display}
        </div>
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" onClick={toggle} class="min-w-32">
            {toggleLabel}
          </Button>
          <Button size="lg" onClick={() => setState((previous) => reset(previous))} disabled={state.status === 'idle'}>
            {ui.reset}
          </Button>
          <Button size="lg" onClick={() => setState((previous) => skip(previous))}>
            {ui.skip}
          </Button>
        </div>
        {state.lastCompletedPhase && <p class="mt-4 text-sm font-medium text-success">{ui.completed}</p>}
      </div>

      <div class="mt-6 flex justify-center">
        <Segmented
          label={ui.phase}
          value={state.phase}
          options={phaseOptions}
          onValue={(phase) => setState((previous) => choosePhase(previous, phase))}
        />
      </div>

      <div class="mt-6 grid gap-6 border-t border-line pt-6 lg:grid-cols-[1fr_300px]">
        <section aria-label={ui.tasks}>
          <div class="flex items-baseline justify-between gap-3">
            <h2 class="text-sm font-medium text-fg">{ui.tasks}</h2>
            <p class="text-xs text-subtle">{ui.tasksHint}</p>
          </div>
          <div class="mt-3 flex gap-2">
            <TextInput
              value={taskDraft}
              maxLength={120}
              placeholder={ui.taskPlaceholder}
              aria-label={ui.taskPlaceholder}
              onInput={(event) => setTaskDraft((event.currentTarget as HTMLInputElement).value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addDraft();
              }}
            />
            <Button onClick={addDraft} disabled={!taskDraft.trim() || state.tasks.length >= MAX_TASKS}>
              {ui.addTask}
            </Button>
          </div>
          {state.tasks.length >= MAX_TASKS && (
            <div class="mt-3">
              <Notice tone="info">{ui.taskLimit}</Notice>
            </div>
          )}
          {state.tasks.length === 0 ? (
            <p class="mt-3 rounded-md bg-surface-2 px-3 py-3 text-sm text-muted">{ui.noTasks}</p>
          ) : (
            <ul class="mt-3 space-y-2">
              {state.tasks.map((task) => (
                <li
                  key={task.id}
                  class={cx(
                    'flex flex-wrap items-center gap-2 rounded-md border border-line px-3 py-2',
                    task.id === state.selectedTaskId && 'border-accent',
                  )}
                >
                  <span class={cx('min-w-32 flex-1 text-sm text-fg', task.done && 'text-muted line-through')}>
                    {task.title}
                  </span>
                  <Button
                    size="sm"
                    variant={task.id === state.selectedTaskId ? 'primary' : 'secondary'}
                    aria-label={ui.selectTask.replace('{task}', task.title)}
                    onClick={() => setState((previous) => selectTask(previous, task.id))}
                  >
                    {task.id === state.selectedTaskId ? ui.selected : ui.select}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setState((previous) => toggleTask(previous, task.id))}
                  >
                    {task.done ? ui.reopen : ui.done}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={ui.removeTask.replace('{task}', task.title)}
                    onClick={() => setState((previous) => removeTask(previous, task.id))}
                  >
                    {ui.remove}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside class="grid content-start gap-4">
          <div class="grid grid-cols-2 gap-3" aria-live="polite">
            <Stat label={ui.today} value={countToday(state.sessions, now)} emphasis />
            <Stat
              label={ui.round}
              value={`${(state.completedFocus % state.settings.rounds) + 1}/${state.settings.rounds}`}
            />
          </div>
          <Toggle checked={notifications} onChecked={updateNotification} label={ui.notifications} />
          <p class="text-xs text-subtle">{ui.notificationHint}</p>
          {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
        </aside>
      </div>

      <fieldset disabled={running} class="mt-6 border-t border-line pt-6 disabled:opacity-60">
        <legend class="text-sm font-medium text-fg">{ui.settings}</legend>
        <p class="mt-1 text-xs text-subtle">{ui.settingsHint}</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NumberSetting
            label={ui.focusMinutes}
            value={state.settings.focusMinutes}
            min={1}
            max={MAX_MINUTES}
            onChange={(focusMinutes) => setState((previous) => updateSettings(previous, { focusMinutes }))}
          />
          <NumberSetting
            label={ui.shortBreakMinutes}
            value={state.settings.shortBreakMinutes}
            min={1}
            max={MAX_MINUTES}
            onChange={(shortBreakMinutes) => setState((previous) => updateSettings(previous, { shortBreakMinutes }))}
          />
          <NumberSetting
            label={ui.longBreakMinutes}
            value={state.settings.longBreakMinutes}
            min={1}
            max={MAX_MINUTES}
            onChange={(longBreakMinutes) => setState((previous) => updateSettings(previous, { longBreakMinutes }))}
          />
          <NumberSetting
            label={ui.rounds}
            value={state.settings.rounds}
            min={1}
            max={MAX_ROUNDS}
            onChange={(rounds) => setState((previous) => updateSettings(previous, { rounds }))}
          />
        </div>
      </fieldset>

      <section class="mt-6 border-t border-line pt-6" aria-label={ui.sessionLog}>
        <div class="flex items-baseline justify-between gap-3">
          <div>
            <h2 class="text-sm font-medium text-fg">{ui.sessionLog}</h2>
            <p class="mt-1 text-xs text-muted">{ui.sessionLogHint}</p>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="tabular text-sm text-muted">{state.sessions.length}</span>
            <Button size="sm" onClick={downloadData}>
              {ui.downloadData}
            </Button>
          </div>
        </div>
        {state.sessions.length === 0 ? (
          <p class="mt-3 rounded-md bg-surface-2 px-3 py-3 text-sm text-muted">{ui.noSessions}</p>
        ) : (
          <ul class="mt-3 max-h-56 space-y-2 overflow-auto">
            {[...state.sessions].reverse().map((session) => (
              <li
                key={session.id}
                class="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2 text-sm"
              >
                <span class="min-w-0 truncate text-fg">{session.task || ui.untitledTask}</span>
                <time class="shrink-0 tabular text-muted" dateTime={new Date(session.completedAt).toISOString()}>
                  {new Date(session.completedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div class="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">
        <span>
          <Kbd>Space</Kbd> {ui.startPause}
        </span>
        <span>
          <Kbd>R</Kbd> {ui.reset}
        </span>
        <span>
          <Kbd>S</Kbd> {ui.skip}
        </span>
      </div>
    </Panel>
  );
}

function beep(context: AudioContext | null) {
  if (!context) return;
  const time = context.currentTime;
  for (const [offset, frequency] of [
    [0, 880],
    [0.18, 1175],
  ] as const) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, time + offset);
    gain.gain.exponentialRampToValueAtTime(0.25, time + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + offset + 0.15);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(time + offset);
    oscillator.stop(time + offset + 0.16);
  }
}

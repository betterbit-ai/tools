import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, TextInput, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_ALARMS,
  formatAlarmTime,
  isAlarm,
  isDueBetween,
  isValidAlarmTime,
  nextAlarmAt,
  normalizeAlarmLabel,
  timeFromNow,
  type Alarm,
} from './logic';

const STATE_KEY = 'tools:alarm-clock:alarms';
const QUICK_MINUTES = [5, 10, 30] as const;
type AudioIssue = 'unavailable' | 'blocked' | null;

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatCurrentTime(now: number, locale: 'en' | 'ko'): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: locale === 'en',
  }).format(now);
}

function playTone(audio: AudioContext | null): boolean {
  if (!audio || audio.state !== 'running') return false;
  try {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.32);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.34);
    return true;
  } catch {
    return false;
  }
}

export default function AlarmClock({ locale, ui }: ToolProps<UI>) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [time, setTime] = useState(() => timeFromNow(Date.now(), 5));
  const [label, setLabel] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [ringing, setRinging] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [audioIssue, setAudioIssue] = useState<AudioIssue>(null);
  const alarmsRef = useRef<Alarm[]>([]);
  const lastCheck = useRef(Date.now());
  const audio = useRef<AudioContext | null>(null);
  const baseTitle = useRef('');
  const timeInput = useRef<HTMLInputElement>(null);

  const unlockAudio = useCallback(async (): Promise<AudioContext | null> => {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      setAudioIssue('unavailable');
      return null;
    }
    try {
      const context = (audio.current ??= new AudioContextConstructor());
      await context.resume();
      if (context.state !== 'running') {
        setAudioIssue('blocked');
        return null;
      }
      setAudioIssue(null);
      return context;
    } catch {
      setAudioIssue('blocked');
      return null;
    }
  }, []);

  useEffect(() => {
    baseTitle.current = document.title;
    try {
      const saved = JSON.parse(safeStorage.get(STATE_KEY) ?? 'null');
      if (Array.isArray(saved)) setAlarms(saved.filter(isAlarm).slice(0, MAX_ALARMS));
    } catch {
      /* Ignore unavailable or malformed local storage. */
    }
    return () => {
      if (baseTitle.current) document.title = baseTitle.current;
      void audio.current?.close();
    };
  }, []);

  useEffect(() => {
    alarmsRef.current = alarms;
    safeStorage.set(STATE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const tick = () => {
      const checkedAt = Date.now();
      const due = alarmsRef.current.filter(
        (alarm) => alarm.enabled && isDueBetween(alarm.time, lastCheck.current, checkedAt),
      );
      lastCheck.current = checkedAt;
      setNow(checkedAt);
      if (due.length) {
        setRinging((active) => Array.from(new Set([...active, ...due.map((alarm) => alarm.id)])));
      }
    };
    const id = window.setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ringing.length) return;
    if (!playTone(audio.current)) {
      setAudioIssue(typeof window.AudioContext === 'undefined' ? 'unavailable' : 'blocked');
      return;
    }
    const id = window.setInterval(() => {
      if (!playTone(audio.current))
        setAudioIssue(typeof window.AudioContext === 'undefined' ? 'unavailable' : 'blocked');
    }, 1_000);
    return () => clearInterval(id);
  }, [ringing.length]);

  const activeAlarms = alarms.filter((alarm) => alarm.enabled);
  const nextAlarm = useMemo(() => {
    return activeAlarms
      .map((alarm) => ({ alarm, at: nextAlarmAt(alarm.time, now) }))
      .filter((entry): entry is { alarm: Alarm; at: number } => entry.at !== null)
      .sort((a, b) => a.at - b.at)[0];
  }, [activeAlarms, now]);
  const ringingAlarms = ringing
    .map((id) => alarms.find((alarm) => alarm.id === id))
    .filter((alarm): alarm is Alarm => Boolean(alarm));
  const alarmName = (alarm: Alarm) => alarm.label || ui.defaultLabel;

  useEffect(() => {
    if (!baseTitle.current) return;
    if (ringingAlarms.length) {
      document.title = ui.titleRinging.replace('{label}', alarmName(ringingAlarms[0]));
    } else if (nextAlarm) {
      document.title = ui.titleNext.replace('{time}', formatAlarmTime(nextAlarm.alarm.time, locale));
    } else {
      document.title = baseTitle.current;
    }
  }, [locale, nextAlarm, ringingAlarms, ui.titleNext, ui.titleRinging]);

  const addAlarm = useCallback(async () => {
    if (!isValidAlarmTime(time)) {
      setError(ui.invalidTime);
      return;
    }
    if (alarms.length >= MAX_ALARMS) {
      setError(ui.limitReached.replace('{count}', String(MAX_ALARMS)));
      return;
    }
    await unlockAudio();
    setAlarms((current) => [...current, { id: createId(), time, label: normalizeAlarmLabel(label), enabled: true }]);
    setLabel('');
    setError('');
  }, [alarms.length, label, time, ui.invalidTime, ui.limitReached, unlockAudio]);

  const chooseQuickTime = useCallback((minutes: number) => {
    setTime(timeFromNow(Date.now(), minutes));
    setError('');
    timeInput.current?.focus();
  }, []);

  const dismiss = useCallback(() => setRinging([]), []);

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
      if (event.key === 'a' || event.key === 'A') {
        event.preventDefault();
        timeInput.current?.focus();
      } else if (event.key === 'Escape' && ringing.length) {
        event.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismiss, ringing.length]);

  return (
    <Panel>
      <div class="text-center">
        <p class="text-sm font-medium text-muted">{ui.currentTime}</p>
        <time aria-live="off" class="mt-1 block tabular text-5xl font-semibold tracking-tight text-fg sm:text-6xl">
          {formatCurrentTime(now, locale)}
        </time>
        {nextAlarm && (
          <p class="mt-3 text-sm text-muted">
            {ui.nextAlarm.replace('{time}', formatAlarmTime(nextAlarm.alarm.time, locale))}
          </p>
        )}
      </div>

      {ringingAlarms.length > 0 && (
        <div class="mt-6">
          <Notice tone="danger">{ui.alarmRinging.replace('{label}', ringingAlarms.map(alarmName).join(', '))}</Notice>
          <Button class="mt-3" variant="danger" size="lg" onClick={dismiss}>
            {ui.dismiss}
          </Button>
        </div>
      )}

      <div class="mt-6 grid gap-6 border-t border-line pt-6 lg:grid-cols-[1fr_320px]">
        <section aria-label={ui.setAlarm}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void addAlarm();
            }}
          >
            <div class="grid gap-4 sm:grid-cols-2">
              <Field label={ui.time}>
                <TextInput
                  ref={timeInput}
                  type="time"
                  value={time}
                  onInput={(event) => {
                    setTime(event.currentTarget.value);
                    setError('');
                  }}
                />
              </Field>
              <Field label={ui.label} hint={ui.labelHint}>
                <TextInput
                  value={label}
                  maxLength={60}
                  placeholder={ui.labelPlaceholder}
                  onInput={(event) => setLabel(normalizeAlarmLabel(event.currentTarget.value))}
                />
              </Field>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" size="lg" type="submit">
                {ui.addAlarm}
              </Button>
              <Button
                size="lg"
                onClick={async () => {
                  const context = await unlockAudio();
                  if (context && !playTone(context)) setAudioIssue('blocked');
                }}
              >
                {ui.testSound}
              </Button>
            </div>
          </form>

          {error && (
            <div class="mt-4">
              <Notice tone="danger">{error}</Notice>
            </div>
          )}

          {audioIssue && (
            <div class="mt-4">
              <Notice tone="danger">{audioIssue === 'unavailable' ? ui.soundUnavailable : ui.soundBlocked}</Notice>
            </div>
          )}

          <div class="mt-5 border-t border-line pt-5">
            <p class="text-sm font-medium text-fg">{ui.quickSet}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              {QUICK_MINUTES.map((minutes) => (
                <Button size="sm" onClick={() => chooseQuickTime(minutes)}>
                  {ui.quickMinutes.replace('{n}', String(minutes))}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section aria-label={ui.alarms} class="rounded-lg bg-surface-2 p-4 sm:p-5">
          <h2 class="text-sm font-medium text-fg">{ui.alarms}</h2>
          {!alarms.length ? (
            <div class="mt-3">
              <Notice>{ui.noAlarms}</Notice>
            </div>
          ) : (
            <ul class="mt-3 space-y-3">
              {alarms.map((alarm) => (
                <li class="rounded-md border border-line bg-surface p-3">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="tabular text-xl font-semibold text-fg">{formatAlarmTime(alarm.time, locale)}</p>
                      <p class="mt-0.5 text-sm text-muted">{alarmName(alarm)}</p>
                    </div>
                    <Button
                      aria-label={`${ui.remove}: ${formatAlarmTime(alarm.time, locale)}`}
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setAlarms((current) => current.filter((item) => item.id !== alarm.id));
                        setRinging((current) => current.filter((id) => id !== alarm.id));
                      }}
                    >
                      {ui.remove}
                    </Button>
                  </div>
                  <div class="mt-3 border-t border-line pt-3">
                    <Toggle
                      checked={alarm.enabled}
                      onChecked={(enabled) =>
                        setAlarms((current) =>
                          current.map((item) => (item.id === alarm.id ? { ...item, enabled } : item)),
                        )
                      }
                      label={ui.enabled}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5 text-xs text-muted">
        <span>
          <Kbd>A</Kbd> {ui.keyboardAdd}
        </span>
        <span>
          <Kbd>Esc</Kbd> {ui.keyboardDismiss}
        </span>
      </div>
      <div class="mt-4">
        <Notice>{ui.browserNotice}</Notice>
      </div>
    </Panel>
  );
}

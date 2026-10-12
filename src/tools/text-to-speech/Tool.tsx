import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  Kbd,
  Notice,
  NumberInput,
  Panel,
  Select,
  Stat,
  Textarea,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import {
  DEFAULT_SETTINGS,
  estimatedSpeechSeconds,
  isEditableElement,
  normalizeSettings,
  normalizeSpeechText,
  type SpeechSettings,
} from './logic';
import { getLocalVoices, isSupported, SpeechSession, type LocalVoice } from './speech';
import type { UI } from './content';

const TEXT_KEY = 'tools:text-to-speech:text';
const SETTINGS_KEY = 'tools:text-to-speech:settings';
type PlaybackState = 'ready' | 'playing' | 'paused' | 'unsupported' | 'no-voices' | 'error';

export default function TextToSpeech({ locale, ui }: ToolProps<UI>) {
  const [text, setText] = useState(ui.sampleText);
  const [settings, setSettings] = useState<SpeechSettings>(DEFAULT_SETTINGS);
  const [voices, setVoices] = useState<LocalVoice[]>([]);
  const [state, setState] = useState<PlaybackState>('ready');
  const [progress, setProgress] = useState({ index: 0, total: 0 });
  const session = useRef<SpeechSession | null>(null);
  const action = useRef<() => void>(() => undefined);

  const refreshVoices = () => {
    const next = getLocalVoices();
    setVoices(next);
    setSettings((current) => {
      if (next.some((voice) => voice.voiceURI === current.voiceURI)) return current;
      const preferred = next.find((voice) => voice.lang.toLowerCase().startsWith(locale)) ?? next[0];
      return { ...current, voiceURI: preferred?.voiceURI ?? '' };
    });
  };

  useEffect(() => {
    if (!isSupported()) {
      setState('unsupported');
      return;
    }
    setText(safeStorage.get(TEXT_KEY) ?? ui.sampleText);
    try {
      setSettings(normalizeSettings(JSON.parse(safeStorage.get(SETTINGS_KEY) ?? '{}')));
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
    refreshVoices();
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
      session.current?.stop();
    };
  }, [locale, ui.sampleText]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (text) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => {
    safeStorage.set(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const voiceOptions = useMemo(
    () => voices.map((voice) => ({ value: voice.voiceURI, label: `${voice.name} (${voice.lang})` })),
    [voices],
  );
  const seconds = estimatedSpeechSeconds(text, settings.rate);
  const selectedVoice = voices.find((voice) => voice.voiceURI === settings.voiceURI);

  const stop = () => {
    session.current?.stop();
    session.current = null;
    setProgress({ index: 0, total: 0 });
    setState('ready');
  };

  const play = () => {
    if (!isSupported()) {
      setState('unsupported');
      return;
    }
    if (!voices.length) {
      setState('no-voices');
      return;
    }
    if (!normalizeSpeechText(text) || !selectedVoice) return;
    if (state === 'paused') {
      session.current?.resume();
      setState('playing');
      return;
    }
    session.current?.stop();
    const next = new SpeechSession(text, settings, voices, {
      onProgress: (index, total) => setProgress({ index, total }),
      onEnd: () => {
        session.current = null;
        setState('ready');
      },
      onError: () => {
        session.current = null;
        setState('error');
      },
    });
    session.current = next;
    setState('playing');
    next.start();
  };

  const pause = () => {
    session.current?.pause();
    setState('paused');
  };
  action.current = () => (state === 'playing' ? pause() : play());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (isEditableElement(target?.tagName ?? '', target?.isContentEditable ?? false)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.code === 'Space') {
        event.preventDefault();
        action.current();
      } else if (event.key === 'Escape') {
        stop();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state, text, settings, voices, selectedVoice]);

  const message =
    state === 'unsupported'
      ? ui.unsupported
      : state === 'no-voices'
        ? ui.noLocalVoices
        : state === 'error'
          ? ui.playbackError
          : null;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex min-w-0 flex-col gap-3">
          <Field label={ui.textLabel} hint={ui.textHint}>
            <Textarea
              value={text}
              onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
              placeholder={ui.placeholder}
              class="min-h-[320px]"
            />
          </Field>
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setText(ui.sampleText)}>
              {ui.sample}
            </Button>
            <CopyButton text={text} label={ui.copy} copiedLabel={ui.copied} />
            <Button size="sm" variant="ghost" disabled={!text} onClick={() => setText('')}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.saved}</span>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <Field label={ui.voiceLabel} hint={ui.voiceHint}>
            <Select
              value={settings.voiceURI}
              onValue={(voiceURI) => setSettings((current) => ({ ...current, voiceURI }))}
              options={voiceOptions}
            />
          </Field>
          <div class="grid grid-cols-3 gap-2">
            <Field label={ui.rateLabel}>
              <NumberInput
                value={settings.rate}
                min={0.5}
                max={2}
                step={0.1}
                onValue={(rate) =>
                  setSettings((current) => normalizeSettings({ ...current, rate: rate === '' ? 1 : rate }))
                }
              />
            </Field>
            <Field label={ui.pitchLabel}>
              <NumberInput
                value={settings.pitch}
                min={0.5}
                max={2}
                step={0.1}
                onValue={(pitch) =>
                  setSettings((current) => normalizeSettings({ ...current, pitch: pitch === '' ? 1 : pitch }))
                }
              />
            </Field>
            <Field label={ui.volumeLabel}>
              <NumberInput
                value={settings.volume}
                min={0}
                max={1}
                step={0.1}
                onValue={(volume) =>
                  setSettings((current) => normalizeSettings({ ...current, volume: volume === '' ? 1 : volume }))
                }
              />
            </Field>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button size="lg" variant="primary" disabled={!text || !voices.length || !selectedVoice} onClick={play}>
              {state === 'paused' ? ui.resume : ui.play}
            </Button>
            <Button size="lg" disabled={state !== 'playing'} onClick={pause}>
              {ui.pause}
            </Button>
            <Button size="lg" variant="ghost" disabled={state === 'ready'} onClick={stop}>
              {ui.stop}
            </Button>
          </div>
          <p class="text-xs text-subtle">
            {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd> · <Kbd>{ui.stopKey}</Kbd> {ui.stop}
          </p>
          {message && <Notice tone="danger">{message}</Notice>}
          <Notice tone="info">{ui.privacyNotice}</Notice>
          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.characters} value={String([...text].length)} emphasis />
            <Stat label={ui.estimatedTime} value={formatDuration(seconds, ui)} emphasis />
          </div>
          {state !== 'ready' && progress.total > 0 && (
            <p class="text-xs text-subtle" aria-live="polite">
              {ui.progress
                .replace('{current}', String(Math.min(progress.index + 1, progress.total)))
                .replace('{total}', String(progress.total))}
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function formatDuration(seconds: number, ui: UI): string {
  if (!seconds) return ui.noTime;
  if (seconds < 60) return ui.seconds.replace('{n}', String(Math.ceil(seconds)));
  return ui.minutes.replace('{n}', String(Math.ceil(seconds / 6) / 10));
}

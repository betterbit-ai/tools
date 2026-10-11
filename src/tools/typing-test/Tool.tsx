import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Kbd, Notice, Panel, Segmented, Stat, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  buildSample,
  diff,
  englishTier,
  koreanTier,
  sampleWordCount,
  score,
  type EnTier,
  type KoTier,
  type TypingLanguage,
} from './logic';

const DURATIONS = [15, 30, 60] as const;
const LANGUAGE_KEY = 'tools:typing-test:language';
const DURATION_KEY = 'tools:typing-test:duration';
const bestKey = (language: TypingLanguage, duration: number) => `tools:typing-test:best:${language}:${duration}`;

const EN_TIER_KEY: Record<EnTier, keyof UI> = {
  beginner: 'tierEnBeginner',
  average: 'tierEnAverage',
  good: 'tierEnGood',
  fast: 'tierEnFast',
};
const KO_TIER_KEY: Record<KoTier, keyof UI> = {
  beginner: 'tierKoBeginner',
  average: 'tierKoAverage',
  fast: 'tierKoFast',
  expert: 'tierKoExpert',
  master: 'tierKoMaster',
};

export default function TypingTest({ locale, ui }: ToolProps<UI>) {
  const defaultLanguage: TypingLanguage = locale === 'ko' ? 'ko' : 'en';
  const [language, setLanguageState] = useState<TypingLanguage>(defaultLanguage);
  const [duration, setDurationState] = useState<number>(30);
  // A fixed seed for the very first render so the server-rendered markup and the
  // initial client hydration pass produce identical text; a real random sample
  // replaces it right after mount (see the restore effect below).
  const [sample, setSample] = useState(() => buildSample(defaultLanguage, sampleWordCount(30), () => 0));
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [now, setNow] = useState(() => Date.now());
  const [best, setBest] = useState<number | null>(null);
  const [justBeatBest, setJustBeatBest] = useState(false);
  const startRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore saved language/duration after hydration (server render has no storage).
  useEffect(() => {
    const savedLang = safeStorage.get(LANGUAGE_KEY);
    const savedDur = Number(safeStorage.get(DURATION_KEY));
    const lang: TypingLanguage = savedLang === 'ko' ? 'ko' : savedLang === 'en' ? 'en' : defaultLanguage;
    const dur = (DURATIONS as readonly number[]).includes(savedDur) ? savedDur : 30;
    setLanguageState(lang);
    setDurationState(dur);
    setSample(buildSample(lang, sampleWordCount(dur)));
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const saved = Number(safeStorage.get(bestKey(language, duration)));
    setBest(saved > 0 ? saved : null);
  }, [language, duration]);

  const restart = useCallback((lang: TypingLanguage, dur: number) => {
    startRef.current = null;
    finishedRef.current = false;
    setJustBeatBest(false);
    setStatus('idle');
    setTyped('');
    setSample(buildSample(lang, sampleWordCount(dur)));
    inputRef.current?.focus();
  }, []);

  const setLanguage = (lang: TypingLanguage) => {
    setLanguageState(lang);
    safeStorage.set(LANGUAGE_KEY, lang);
    restart(lang, duration);
  };

  const setDuration = (dur: number) => {
    setDurationState(dur);
    safeStorage.set(DURATION_KEY, String(dur));
    restart(language, dur);
  };

  // Tick the clock while running so the countdown and live stats stay current.
  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [status]);

  const elapsedMs =
    status === 'idle' || startRef.current === null ? 0 : Math.min(now - startRef.current, duration * 1000);
  const remainingSeconds = Math.max(0, duration - Math.floor(elapsedMs / 1000));

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStatus('done');
  }, []);

  useEffect(() => {
    if (status === 'running' && remainingSeconds <= 0) finish();
  }, [status, remainingSeconds, finish]);

  const liveScore = useMemo(() => score(language, sample, typed, elapsedMs), [language, sample, typed, elapsedMs]);

  // Save a new personal best once the test is scored.
  useEffect(() => {
    if (status !== 'done') return;
    const key = bestKey(language, duration);
    const prev = Number(safeStorage.get(key)) || 0;
    if (liveScore.speed > prev) {
      safeStorage.set(key, String(liveScore.speed));
      setBest(liveScore.speed);
      setJustBeatBest(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onInput = (e: Event) => {
    if (status === 'done') return;
    const raw = (e.currentTarget as HTMLInputElement).value;
    const sampleLength = Array.from(sample).length;
    const clamped = Array.from(raw).slice(0, sampleLength).join('');
    if (status === 'idle' && clamped.length > 0) {
      startRef.current = Date.now();
      setNow(Date.now());
      setStatus('running');
    }
    setTyped(clamped);
    if (clamped.length >= sampleLength) {
      setNow(Date.now());
      finish();
    }
  };

  // Typing the sample is the point — pasting it defeats the test.
  const onPaste = (e: ClipboardEvent) => e.preventDefault();

  // Esc restarts the test at any time, without hijacking Tab navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        restart(language, duration);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [restart, language, duration]);

  const results = useMemo(() => diff(sample, typed), [sample, typed]);
  const tier = language === 'en' ? englishTier(liveScore.speed) : koreanTier(liveScore.speed);
  const tierLabel = language === 'en' ? ui[EN_TIER_KEY[tier as EnTier]] : ui[KO_TIER_KEY[tier as KoTier]];
  const speedLabel = language === 'en' ? ui.speedWpm : ui.speedCpm;

  return (
    <Panel>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <Segmented
          label={ui.language}
          value={language}
          onValue={setLanguage}
          options={[
            { value: 'en', label: ui.languageEn },
            { value: 'ko', label: ui.languageKo },
          ]}
        />
        <Segmented
          label={ui.duration}
          value={String(duration)}
          onValue={(v) => setDuration(Number(v))}
          options={DURATIONS.map((d) => ({ value: String(d), label: ui.secondsShort.replace('{n}', String(d)) }))}
        />
      </div>

      <div
        class="mt-5 cursor-text rounded-lg border border-line bg-surface p-4 font-mono text-lg leading-8 tracking-wide sm:text-xl"
        onClick={() => inputRef.current?.focus()}
      >
        <p class="whitespace-pre-wrap break-words" aria-hidden="true">
          {results.map((r, i) => (
            <span
              key={i}
              class={cx(
                r.status === 'pending' && 'text-subtle',
                r.status === 'correct' && 'text-fg',
                (r.status === 'incorrect' || r.status === 'extra') &&
                  'text-danger underline decoration-2 underline-offset-4',
                i === typed.length && status !== 'done' && 'bg-accent-soft rounded-sm',
              )}
            >
              {r.expected || ' '}
            </span>
          ))}
        </p>
      </div>

      <label for="tt-input" class="sr-only">
        {ui.inputLabel}
      </label>
      <p id="tt-sample-sr" class="sr-only">
        {sample}
      </p>
      <input
        id="tt-input"
        ref={inputRef}
        value={typed}
        onInput={onInput}
        onPaste={onPaste}
        disabled={status === 'done'}
        aria-describedby="tt-sample-sr"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck={false}
        placeholder={ui.inputPlaceholder}
        class="mt-3 w-full rounded-lg border border-line bg-bg p-3 font-mono text-lg text-fg placeholder:text-subtle focus:border-accent focus:outline-none disabled:opacity-60"
      />

      <div class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
        <Stat label={ui.timeLeft} value={`${remainingSeconds}s`} emphasis />
        <Stat label={speedLabel} value={liveScore.speed} emphasis />
        <Stat label={ui.accuracyLabel} value={`${liveScore.accuracy}%`} />
        <Stat label={ui.personalBest} value={best ?? '—'} />
      </div>

      {status === 'done' && (
        <div class="mt-4 space-y-3">
          <Notice tone={justBeatBest ? 'success' : 'info'}>{justBeatBest ? ui.newBest : tierLabel}</Notice>
          <div class="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => restart(language, duration)}>
              {ui.restart}
            </Button>
          </div>
        </div>
      )}

      {status !== 'done' && (
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <Button size="sm" onClick={() => restart(language, duration)}>
            {ui.restart}
          </Button>
          <span>
            <Kbd>Esc</Kbd> {ui.restartHint}
          </span>
        </div>
      )}

      <p class="mt-4 text-xs text-subtle">{ui.privacyHint}</p>
    </Panel>
  );
}

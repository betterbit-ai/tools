import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Select, Stat, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { analyze, splitDuration, topKeywords, type LimitMetric } from './logic';

const STORAGE_KEY = 'tools:word-counter:text';
const LIMIT_KEY = 'tools:word-counter:limit';
const METRIC_KEY = 'tools:word-counter:limit-metric';
const ANALYSIS_DELAY = 200;
/** Above this length a synchronous count would freeze the page, so a broken worker is reported instead. */
const MAX_DIRECT_CHARS = 400_000;
/** A worker that never answers is treated as broken rather than leaving the page "counting" forever. */
const WORKER_TIMEOUT = 20_000;

type LimitRule =
  | 'selfIntroduction'
  | 'koreanSms'
  | 'koreanLms'
  | 'instagramCaption'
  | 'xPost'
  | 'youtubeTitle'
  | 'youtubeDescription'
  | 'naverBlogTitle'
  | 'globalSms';

interface PresetSource {
  label: string;
  url: string;
}

const isMetric = (value: unknown): value is LimitMetric =>
  value === 'characters' ||
  value === 'charactersNoSpaces' ||
  value === 'bytesLegacy' ||
  value === 'bytesUtf8' ||
  value === 'xWeightedLength';

const isRule = (value: unknown): value is LimitRule =>
  value === 'selfIntroduction' ||
  value === 'koreanSms' ||
  value === 'koreanLms' ||
  value === 'instagramCaption' ||
  value === 'xPost' ||
  value === 'youtubeTitle' ||
  value === 'youtubeDescription' ||
  value === 'naverBlogTitle' ||
  value === 'globalSms';

const isSource = (value: unknown): value is PresetSource => {
  if (!value || typeof value !== 'object') return false;
  const source = value as Partial<PresetSource>;
  return typeof source.label === 'string' && typeof source.url === 'string' && source.url.startsWith('https://');
};

interface TextAnalysis {
  stats: ReturnType<typeof analyze>;
  keywords: ReturnType<typeof topKeywords>;
}

const emptyAnalysis: TextAnalysis = { stats: analyze(''), keywords: [] };

interface AnalysisResult extends TextAnalysis {
  id: number;
}

export default function WordCounter({ locale, ui, preset }: ToolProps<UI>) {
  const presetLimit = typeof preset?.limit === 'number' && preset.limit > 0 ? preset.limit : null;
  const presetMetric = isMetric(preset?.metric) ? preset.metric : null;
  const presetRule = isRule(preset?.rule) ? preset.rule : null;
  const presetSources = Array.isArray(preset?.sources) ? preset.sources.filter(isSource) : [];
  const [text, setText] = useState('');
  const [limit, setLimit] = useState<number | ''>(presetLimit ?? '');
  const [metric, setMetric] = useState<LimitMetric>(presetMetric ?? 'characters');
  const [analysis, setAnalysis] = useState(emptyAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  /** The worker could not be used, so the page is counting directly. */
  const [directMode, setDirectMode] = useState(false);
  /** Nothing can count this text: the worker is gone and the text is too long for this page. */
  const [countFailed, setCountFailed] = useState(false);
  /** The browser refused to store the text (quota, private mode) although the page says it is saved. */
  const [saveFailed, setSaveFailed] = useState(false);
  const requestId = useRef(0);
  const latestText = useRef('');
  const workerRef = useRef<Worker | null>(null);
  const workerFailed = useRef(false);

  // Restore after hydration (server render has no storage).
  useEffect(() => {
    setText(safeStorage.get(STORAGE_KEY) ?? '');
    const savedLimit = Number(safeStorage.get(LIMIT_KEY));
    setLimit(presetLimit ?? (savedLimit > 0 ? savedLimit : ''));
    const savedMetric = safeStorage.get(METRIC_KEY);
    setMetric(presetMetric ?? (isMetric(savedMetric) ? savedMetric : 'characters'));
  }, []);

  useEffect(() => {
    latestText.current = text;
    const id = setTimeout(() => {
      if (text) setSaveFailed(!safeStorage.trySet(STORAGE_KEY, text));
      else {
        safeStorage.remove(STORAGE_KEY);
        setSaveFailed(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => {
    if (limit) safeStorage.set(LIMIT_KEY, String(limit));
    else safeStorage.remove(LIMIT_KEY);
  }, [limit]);

  useEffect(() => {
    safeStorage.set(METRIC_KEY, metric);
  }, [metric]);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    [],
  );

  /** Counts on this page. Used when no worker is available, and reported to the reader. */
  const runDirect = (id: number, value: string) => {
    if (id !== requestId.current) return;
    if (value.length > MAX_DIRECT_CHARS) {
      setCountFailed(true);
      setIsAnalyzing(false);
      return;
    }
    try {
      setAnalysis({ stats: analyze(value), keywords: topKeywords(value) });
      setCountFailed(false);
      setDirectMode(true);
    } catch {
      setCountFailed(true);
    }
    setIsAnalyzing(false);
  };

  const dropWorker = () => {
    workerFailed.current = true;
    workerRef.current?.terminate();
    workerRef.current = null;
  };

  const ensureWorker = (): Worker | null => {
    if (workerFailed.current) return null;
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL('./analysis.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (event: MessageEvent<AnalysisResult>) => {
        if (event.data.id !== requestId.current) return;
        setAnalysis({ stats: event.data.stats, keywords: event.data.keywords });
        setIsAnalyzing(false);
        setCountFailed(false);
      };
      // A chunk that cannot load (blocked request, strict CSP, stale cached page) fires here.
      // Without this the counters stayed at 0 with "Counting…" on screen forever.
      worker.onerror = () => {
        dropWorker();
        runDirect(requestId.current, latestText.current);
      };
      workerRef.current = worker;
      return worker;
    } catch {
      workerFailed.current = true;
      return null;
    }
  };

  useEffect(() => {
    const id = ++requestId.current;
    if (!text) {
      setAnalysis(emptyAnalysis);
      setIsAnalyzing(false);
      setCountFailed(false);
      return;
    }

    setIsAnalyzing(true);
    let watchdog: number | undefined;
    const delay = window.setTimeout(() => {
      const worker = ensureWorker();
      if (worker) {
        worker.postMessage({ id, text });
        watchdog = window.setTimeout(() => {
          if (requestId.current !== id) return;
          dropWorker();
          runDirect(id, text);
        }, WORKER_TIMEOUT);
        return;
      }
      runDirect(id, text);
    }, ANALYSIS_DELAY);

    return () => {
      window.clearTimeout(delay);
      if (watchdog !== undefined) window.clearTimeout(watchdog);
    };
  }, [text]);

  const { stats, keywords } = analysis;
  const n = (v: number) => formatNumber(v, locale);
  const duration = (secs: number) => {
    const { m, s } = splitDuration(secs);
    return m > 0 ? ui.minSec.replace('{m}', n(m)).replace('{s}', String(s)) : ui.sec.replace('{s}', String(s));
  };

  const current = stats[metric];
  const remaining = limit ? limit - current : 0;
  const pct = limit ? Math.min(100, (current / limit) * 100) : 0;
  const ruleText =
    presetRule === 'selfIntroduction'
      ? ui.ruleSelfIntroduction
      : presetRule === 'koreanSms'
        ? ui.ruleKoreanSms
        : presetRule === 'koreanLms'
          ? ui.ruleKoreanLms
          : presetRule === 'instagramCaption'
            ? ui.ruleInstagramCaption
            : presetRule === 'xPost'
              ? ui.ruleXPost
              : presetRule === 'youtubeTitle'
                ? ui.ruleYoutubeTitle
                : presetRule === 'youtubeDescription'
                  ? ui.ruleYoutubeDescription
                  : presetRule === 'naverBlogTitle'
                    ? ui.ruleNaverBlogTitle
                    : presetRule === 'globalSms'
                      ? ui.ruleGlobalSms
                      : ui.ruleDefault;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex flex-col">
          <label for="wc-input" class="sr-only">
            {ui.inputLabel}
          </label>
          <textarea
            id="wc-input"
            value={text}
            onInput={(e) => setText((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.placeholder}
            spellcheck={false}
            class="min-h-[320px] lg:min-h-[440px] flex-1 w-full resize-y rounded-lg border border-line bg-bg p-4 text-base leading-7 text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton text={text} label={ui.copy} copiedLabel={ui.copied} />
            <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
              {ui.clear}
            </Button>
            <span class={cx('ml-auto text-xs', saveFailed ? 'text-danger' : 'text-subtle')}>
              {saveFailed ? ui.saveFailed : ui.autosaved}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-2 gap-2" aria-live="polite" aria-busy={isAnalyzing}>
            <Stat label={ui.characters} value={n(stats.characters)} emphasis />
            <Stat label={ui.words} value={n(stats.words)} emphasis />
            <Stat label={ui.charactersNoSpaces} value={n(stats.charactersNoSpaces)} />
            <Stat label={ui.charactersNoLineBreaks} value={n(stats.charactersNoLineBreaks)} />
            <Stat label={ui.sentences} value={n(stats.sentences)} />
            <Stat label={ui.paragraphs} value={n(stats.paragraphs)} />
            <Stat label={ui.bytesLegacy} value={n(stats.bytesLegacy)} />
            <Stat label={ui.bytesUtf8} value={n(stats.bytesUtf8)} />
            <Stat label={ui.readingTime} value={duration(stats.readingSeconds)} />
            <Stat label={ui.speakingTime} value={duration(stats.speakingSeconds)} />
          </div>
          <p class="min-h-5 text-xs text-subtle" role="status">
            {isAnalyzing ? ui.analyzing : ''}
          </p>
          {(countFailed || directMode) && (
            <Notice tone={countFailed ? 'danger' : 'info'}>{countFailed ? ui.countFailed : ui.directMode}</Notice>
          )}

          <div>
            <Field label={ui.limitLabel} hint={ui.limitHint}>
              <NumberInput
                value={limit}
                onValue={(v) => setLimit(v === '' ? '' : Math.max(0, v))}
                min={0}
                placeholder="500"
              />
            </Field>
            <Field label={ui.limitMetricLabel} class="mt-3">
              <Select<LimitMetric>
                value={metric}
                onValue={setMetric}
                ariaLabel={ui.limitMetricLabel}
                options={[
                  { value: 'characters', label: ui.metricCharacters },
                  { value: 'charactersNoSpaces', label: ui.metricCharactersNoSpaces },
                  { value: 'bytesLegacy', label: ui.metricBytesLegacy },
                  { value: 'bytesUtf8', label: ui.metricBytesUtf8 },
                  { value: 'xWeightedLength', label: ui.metricXWeighted },
                ]}
              />
            </Field>
            {limit !== '' && limit > 0 && (
              <div class="mt-3" aria-live="polite">
                <div class="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    class={cx('h-full transition-[width]', remaining < 0 ? 'bg-danger' : 'bg-accent')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p class="mt-1.5 text-xs tabular text-subtle">
                  {ui.limitUsed.replace('{n}', n(current)).replace('{limit}', n(limit))}
                </p>
                <p class={cx('mt-1.5 text-sm tabular', remaining < 0 ? 'text-danger' : 'text-muted')}>
                  {remaining < 0
                    ? ui.limitOver.replace('{n}', n(-remaining))
                    : ui.limitRemaining.replace('{n}', n(remaining))}
                </p>
              </div>
            )}
            <div class="mt-3">
              <Notice tone="info">
                {ruleText}
                {presetSources.length > 0 && (
                  <span class="mt-1 block text-xs">
                    {ui.sourcesLabel}{' '}
                    {presetSources.map((source, index) => (
                      <span>
                        {index > 0 && ' · '}
                        <a class="underline" href={source.url} target="_blank" rel="noreferrer">
                          {source.label}
                        </a>
                      </span>
                    ))}
                  </span>
                )}
              </Notice>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-fg mb-2">{ui.keywords}</h3>
            {keywords.length === 0 ? (
              <p class="text-sm text-subtle">{ui.keywordsEmpty}</p>
            ) : (
              <ul class="flex flex-wrap gap-1.5">
                {keywords.map((k) => (
                  <li class="rounded-md bg-surface-2 px-2 py-1 text-sm text-fg">
                    {k.word} <span class="text-subtle tabular">×{k.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

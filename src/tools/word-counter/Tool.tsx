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
  const requestId = useRef(0);

  // Restore after hydration (server render has no storage).
  useEffect(() => {
    setText(safeStorage.get(STORAGE_KEY) ?? '');
    const savedLimit = Number(safeStorage.get(LIMIT_KEY));
    setLimit(presetLimit ?? (savedLimit > 0 ? savedLimit : ''));
    const savedMetric = safeStorage.get(METRIC_KEY);
    setMetric(presetMetric ?? (isMetric(savedMetric) ? savedMetric : 'characters'));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (text) safeStorage.set(STORAGE_KEY, text);
      else safeStorage.remove(STORAGE_KEY);
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

  useEffect(() => {
    const id = ++requestId.current;
    if (!text) {
      setAnalysis(emptyAnalysis);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    let worker: Worker | undefined;
    const timeout = setTimeout(() => {
      try {
        worker = new Worker(new URL('./analysis.worker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (event: MessageEvent<AnalysisResult>) => {
          if (event.data.id !== requestId.current) return;
          setAnalysis({ stats: event.data.stats, keywords: event.data.keywords });
          setIsAnalyzing(false);
        };
        worker.postMessage({ id, text });
      } catch {
        // Very old browsers without module workers retain the previous synchronous behavior.
        if (id === requestId.current) {
          setAnalysis({ stats: analyze(text), keywords: topKeywords(text) });
          setIsAnalyzing(false);
        }
      }
    }, ANALYSIS_DELAY);

    return () => {
      clearTimeout(timeout);
      worker?.terminate();
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
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
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

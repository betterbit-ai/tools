import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  Notice,
  NumberInput,
  Panel,
  Segmented,
  Select,
  TextInput,
  Toggle,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  applyPlatform,
  checkSuggestion,
  DEFAULT_OPTIONS,
  generateUsernames,
  keywordFitsStyle,
  maxLengthFor,
  mulberry32,
  normalizeKeyword,
  separatorsFor,
  type PlatformId,
  type Separator,
  type Style,
  type UsernameOptions,
} from './logic';

const STORAGE_KEY = 'tools:username-generator:favorites';

export default function UsernameGenerator({ ui }: ToolProps<UI>) {
  const [style, setStyle] = useState<Style>('adjective-noun');
  const [platform, setPlatform] = useState<PlatformId>('any');
  const [count, setCount] = useState(12);
  const [maxLength, setMaxLength] = useState(20);
  const [separator, setSeparator] = useState<Separator>('');
  const [digits, setDigits] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [avoidLookalike, setAvoidLookalike] = useState(false);
  const [seed, setSeed] = useState(20261128);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [favoriteFailed, setFavoriteFailed] = useState(false);

  useEffect(() => {
    try {
      const stored = safeStorage.get(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setFavorites(parsed.filter((item): item is string => typeof item === 'string'));
      }
    } catch {
      /* a corrupt value just means no saved names */
    }
  }, []);

  const baseOptions: UsernameOptions = {
    style,
    count,
    maxLength,
    separator,
    digits,
    keyword,
    avoidLookalike,
  };
  const effective = useMemo(
    () => applyPlatform(baseOptions, platform),
    [platform, style, count, maxLength, separator, digits, keyword, avoidLookalike],
  );
  const names = useMemo(() => generateUsernames(effective, mulberry32(seed)), [effective, seed]);

  const keywordWarning = keyword.trim().length > 0 && !keywordFitsStyle(normalizeKeyword(keyword), style);
  const allowedSeparators = separatorsFor(platform);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied((current) => (current === value ? null : current)), 1500);
    } catch {
      setCopied(null);
    }
  };

  const toggleFavorite = (value: string) => {
    const next = favorites.includes(value)
      ? favorites.filter((item) => item !== value)
      : [value, ...favorites].slice(0, 24);
    const stored = safeStorage.trySet(STORAGE_KEY, JSON.stringify(next));
    setFavoriteFailed(!stored);
    setFavorites(next);
  };

  const platformLimit = maxLengthFor(platform);

  return (
    <div class="space-y-4">
      <Panel>
        <div class="grid gap-4 sm:grid-cols-2">
          <Field label={ui.styleLabel} hint={ui.styleHint}>
            <Select<Style>
              value={style}
              onValue={setStyle}
              ariaLabel={ui.styleLabel}
              options={[
                { value: 'adjective-noun', label: ui.styleAdjectiveNoun },
                { value: 'word-number', label: ui.styleWordNumber },
                { value: 'ko-modifier-noun', label: ui.styleKoModifierNoun },
                { value: 'ko-noun-tail', label: ui.styleKoNounTail },
              ]}
            />
          </Field>
          <Field
            label={ui.platformLabel}
            hint={platformLimit ? ui.platformHint.replace('{limit}', String(platformLimit)) : ui.platformAnyHint}
          >
            <Select<PlatformId>
              value={platform}
              onValue={setPlatform}
              ariaLabel={ui.platformLabel}
              options={[
                { value: 'any', label: ui.platformAny },
                { value: 'instagram', label: 'Instagram' },
                { value: 'x', label: 'X (Twitter)' },
                { value: 'tiktok', label: 'TikTok' },
                { value: 'discord', label: 'Discord' },
                { value: 'github', label: 'GitHub' },
              ]}
            />
          </Field>
          <Field label={ui.keywordLabel} hint={ui.keywordHint}>
            <TextInput
              value={keyword}
              maxLength={20}
              placeholder={ui.keywordPlaceholder}
              onInput={(event) => setKeyword((event.currentTarget as HTMLInputElement).value)}
            />
          </Field>
          <div class="grid grid-cols-2 gap-3">
            <Field label={ui.countLabel}>
              <NumberInput value={count} min={1} max={60} onValue={(value) => setCount(value === '' ? 1 : value)} />
            </Field>
            <Field
              label={platformLimit ? ui.maxLengthFixed.replace('{limit}', String(platformLimit)) : ui.maxLengthLabel}
            >
              <NumberInput
                value={maxLength}
                min={2}
                max={40}
                disabled={Boolean(platformLimit)}
                onValue={(value) => setMaxLength(value === '' ? 20 : value)}
              />
            </Field>
          </div>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={ui.separatorLabel} hint={platform === 'any' ? undefined : ui.separatorHint}>
            <Segmented<Separator>
              value={separator}
              onValue={setSeparator}
              label={ui.separatorLabel}
              options={
                [
                  { value: '', label: ui.separatorNone },
                  { value: '_', label: '_' },
                  { value: '.', label: '.' },
                  { value: '-', label: '-' },
                ].filter((option) => allowedSeparators.includes(option.value as Separator)) as {
                  value: Separator;
                  label: string;
                }[]
              }
            />
          </Field>
          <Field label={ui.digitsLabel} hint={ui.digitsHint}>
            <Select<string>
              value={String(digits)}
              onValue={(value) => setDigits(Number(value))}
              ariaLabel={ui.digitsLabel}
              options={[
                { value: '0', label: ui.digitsNone },
                { value: '2', label: ui.digitsTwo },
                { value: '3', label: ui.digitsThree },
                { value: '4', label: ui.digitsFour },
              ]}
            />
          </Field>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <Toggle checked={avoidLookalike} onChecked={setAvoidLookalike} label={ui.avoidLookalike} />
          <div class="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setSeed((value) => value + 1)}>
              {ui.generateMore}
            </Button>
            <CopyButton text={names.join('\n')} label={ui.copyAll} copiedLabel={ui.copied} />
          </div>
        </div>

        <div class="mt-3 space-y-2">
          {keywordWarning && <Notice tone="danger">{ui.keywordScriptNotice}</Notice>}
          {names.length === 0 && <Notice tone="danger">{ui.noResults}</Notice>}
          {favoriteFailed && <Notice tone="danger">{ui.favoriteFailed}</Notice>}
        </div>
      </Panel>

      <Panel>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-sm font-medium text-fg">{ui.resultsTitle}</h2>
          <p class="text-xs text-subtle">{ui.resultsHint.replace('{count}', String(names.length))}</p>
        </div>
        {names.length > 0 && (
          <ul class="mt-3 divide-y divide-line/60" aria-label={ui.resultsTitle} aria-live="polite">
            {names.map((name) => {
              const check = checkSuggestion(name, maxLength);
              return (
                <li class="flex items-center gap-2 py-2">
                  <button
                    type="button"
                    onClick={() => copy(name)}
                    class="min-w-0 flex-1 rounded px-1 py-0.5 text-left text-[15px] font-medium break-all text-fg hover:text-accent"
                    aria-label={`${ui.copyOne}: ${name}`}
                  >
                    {name}
                  </button>
                  <span class="tabular shrink-0 font-mono text-xs text-subtle">
                    {check.length}
                    {maxLength > 0 ? `/${maxLength}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(name)}
                    aria-pressed={favorites.includes(name)}
                    aria-label={favorites.includes(name) ? ui.unfavorite : ui.favorite}
                    class={`shrink-0 rounded px-1.5 py-0.5 text-xs ${favorites.includes(name) ? 'text-accent' : 'text-muted hover:text-fg'}`}
                  >
                    {favorites.includes(name) ? '★' : '☆'}
                  </button>
                  <span class="w-14 shrink-0 text-right text-xs text-subtle">{copied === name ? ui.copied : ''}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel>
        <h2 class="text-sm font-medium text-fg">{ui.favoritesTitle}</h2>
        <p class="mt-1 text-xs text-subtle">{ui.favoritesHint}</p>
        {favorites.length === 0 ? (
          <p class="mt-3 text-sm text-muted">{ui.favoritesEmpty}</p>
        ) : (
          <div class="mt-3 flex flex-wrap gap-2" role="list" aria-label={ui.favoritesTitle}>
            {favorites.map((name) => (
              <button
                type="button"
                onClick={() => copy(name)}
                class="rounded-full border border-line bg-surface-2 px-3 py-1 text-sm text-fg hover:border-line-strong"
              >
                {name}
                <span class="ml-1.5 text-xs text-subtle">{copied === name ? ui.copied : ui.copyOne}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

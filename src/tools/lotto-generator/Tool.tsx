import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Segmented, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_SETTINGS,
  LOTTO_MAX,
  LOTTO_MIN,
  cycleNumber,
  formatLottoGames,
  formatLottoNumber,
  generateLottoGames,
  possibleCombinationCount,
  settingsFromSaved,
  type LottoError,
  type LottoSettings,
} from './logic';

const STORAGE_KEY = 'tools:lotto-generator:settings';
const gameCountOptions = [1, 2, 3, 4, 5] as const;

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

export default function LottoGenerator({ locale, ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<LottoSettings>(DEFAULT_SETTINGS);
  const [games, setGames] = useState<number[][]>([]);
  const [error, setError] = useState<LottoError | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);
  const generatedInitialResult = useRef(false);

  const generate = useCallback(() => {
    try {
      const result = generateLottoGames(settings, cryptoSource);
      if (!result.ok) {
        setGames([]);
        setError(result.error);
        return;
      }
      setGames(result.games);
      setError(null);
    } catch {
      setGames([]);
      setError('crypto');
    }
  }, [settings]);

  useEffect(() => {
    try {
      setSettings(settingsFromSaved(JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null')));
    } catch {
      // Ignore malformed local settings.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(settings));
  }, [ready, settings]);

  useEffect(() => {
    if (!ready || generatedInitialResult.current) return;
    generatedInitialResult.current = true;
    generate();
  }, [generate, ready]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key.toLowerCase() === 'g') {
        event.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [generate]);

  const resultText = useMemo(
    () => formatLottoGames(games, (index) => ui.gameLabel.replace('{n}', String(index))),
    [games, ui.gameLabel],
  );
  const possibleCombinations = possibleCombinationCount(settings);
  const errorText =
    error === 'invalid-selection'
      ? ui.errorInvalidSelection
      : error === 'invalid-game-count'
        ? ui.errorGameCount
        : error === 'too-many-fixed'
          ? ui.errorTooManyFixed
          : error === 'not-enough-available'
            ? ui.errorNotEnoughAvailable
            : error === 'crypto'
              ? ui.errorCrypto
              : null;

  const chooseNumber = (number: number) => {
    setSettings((current) => cycleNumber(current, number));
    setError(null);
  };

  return (
    <Panel>
      <div class="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section>
          <p class="text-sm text-muted">{ui.intro}</p>
          <div class="mt-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="lotto-number-selection" class="text-sm font-medium text-fg">
                  {ui.selectionHeading}
                </h2>
                <p class="mt-1 text-xs text-subtle">{ui.selectionHint}</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setSettings((current) => ({ ...current, fixed: [], excluded: [] }));
                  setError(null);
                }}
                disabled={!settings.fixed.length && !settings.excluded.length}
              >
                {ui.clearSelections}
              </Button>
            </div>
            <div aria-labelledby="lotto-number-selection" class="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-9">
              {Array.from({ length: LOTTO_MAX - LOTTO_MIN + 1 }, (_, index) => index + LOTTO_MIN).map((number) => {
                const fixed = settings.fixed.includes(number);
                const excluded = settings.excluded.includes(number);
                const status = fixed ? ui.fixed : excluded ? ui.excluded : ui.unselected;
                return (
                  <Button
                    size="sm"
                    variant={fixed ? 'primary' : excluded ? 'danger' : 'secondary'}
                    class="px-1 tabular"
                    aria-pressed={fixed || excluded}
                    aria-label={`${formatLottoNumber(number)}: ${status}`}
                    onClick={() => chooseNumber(number)}
                  >
                    {formatLottoNumber(number)}
                  </Button>
                );
              })}
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2 sm:max-w-sm">
              <Stat label={ui.fixedCount} value={settings.fixed.length} />
              <Stat label={ui.excludedCount} value={settings.excluded.length} />
            </div>
          </div>

          <div class="mt-5 border-t border-line pt-4">
            <Field label={ui.gameCountLabel} hint={ui.gameCountHint}>
              <Segmented
                label={ui.gameCountLabel}
                value={String(settings.gameCount)}
                onValue={(gameCount) => {
                  setSettings((current) => ({ ...current, gameCount: Number(gameCount) }));
                  setError(null);
                }}
                options={gameCountOptions.map((count) => ({ value: String(count), label: String(count) }))}
              />
            </Field>
            <div class="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" onClick={generate}>
                {ui.generate}
              </Button>
              <span class="text-xs text-muted">
                {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd>
              </span>
            </div>
          </div>
        </section>

        <section class="rounded-lg border border-line bg-surface-2 p-4" aria-labelledby="lotto-result-heading">
          <div class="flex items-start justify-between gap-3">
            <h2 id="lotto-result-heading" class="text-sm font-medium text-fg">
              {ui.resultHeading}
            </h2>
            <CopyButton text={resultText} label={ui.copy} copiedLabel={ui.copied} />
          </div>
          {errorText ? (
            <div class="mt-3">
              <Notice tone="danger">{errorText}</Notice>
            </div>
          ) : (
            <output aria-live="polite" class="mt-3 grid gap-2">
              {games.map((game, index) => (
                <div class="rounded-md border border-line bg-surface px-3 py-3">
                  <p class="text-xs text-muted">{ui.gameLabel.replace('{n}', String(index + 1))}</p>
                  <ol class="mt-2 grid grid-cols-6 gap-1.5" aria-label={ui.gameLabel.replace('{n}', String(index + 1))}>
                    {game.map((number) => (
                      <li class="rounded-sm bg-accent-soft py-1.5 text-center font-mono text-sm font-semibold text-fg">
                        {formatLottoNumber(number)}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </output>
          )}
          <div class="mt-3 grid grid-cols-2 gap-2">
            <Stat label={ui.lineCountLabel} value={games.length} />
            <Stat label={ui.possibleLabel} value={formatNumber(possibleCombinations, locale)} />
          </div>
          <p class="mt-3 text-xs text-subtle">{ui.cryptoNote}</p>
          <p class="mt-2 text-xs text-subtle">{ui.probabilityNote}</p>
        </section>
      </div>
    </Panel>
  );
}

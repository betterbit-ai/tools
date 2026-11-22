import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  Kbd,
  Notice,
  Panel,
  Stat,
  TextInput,
  Textarea,
  Toggle,
  cx,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { DEFAULT_REGEX_STATE, explainPattern, testRegex, type ExplanationKind, type RegexResult } from './logic';

const STORAGE_KEY = 'tools:regex-tester:state';
const FLAG_ORDER = 'gimsuy';
/** How long one match run may take before the page stops waiting for it. */
const MATCH_TIMEOUT_MS = 1_500;
/** Typing delay, so a pattern is not re-run on every keystroke. */
const MATCH_DELAY_MS = 80;
/** Longest text run on the page itself when a worker cannot be created. */
const MAX_DIRECT_CHARS = 20_000;
const EMPTY_RESULT: RegexResult = { matches: [], hasMoreMatches: false };

interface RegexState {
  pattern: string;
  flags: string;
  text: string;
  replacement: string;
}

function stateFromUnknown(value: unknown): RegexState | null {
  if (!value || typeof value !== 'object') return null;
  const state = value as Partial<RegexState>;
  if (
    typeof state.pattern !== 'string' ||
    typeof state.flags !== 'string' ||
    typeof state.text !== 'string' ||
    typeof state.replacement !== 'string' ||
    [...state.flags].some((flag) => !FLAG_ORDER.includes(flag)) ||
    new Set(state.flags).size !== state.flags.length
  ) {
    return null;
  }
  return state as RegexState;
}

function highlightSegments(text: string, matches: ReturnType<typeof testRegex>['matches']) {
  const segments: Array<{ value: string; matched: boolean; key: string }> = [];
  let cursor = 0;
  matches.forEach((match, index) => {
    if (match.index > cursor)
      segments.push({ value: text.slice(cursor, match.index), matched: false, key: `text-${cursor}` });
    if (match.value) segments.push({ value: match.value, matched: true, key: `match-${index}-${match.index}` });
    cursor = Math.max(cursor, match.end);
  });
  if (cursor < text.length) segments.push({ value: text.slice(cursor), matched: false, key: `text-${cursor}` });
  return segments;
}

export default function RegexTester({ locale, ui }: ToolProps<UI>) {
  const [state, setState] = useState<RegexState>({ ...DEFAULT_REGEX_STATE });
  const [ready, setReady] = useState(false);
  const patternRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<RegexResult>(EMPTY_RESULT);
  // A run that outlived MATCH_TIMEOUT_MS: the pattern is exponential on this text.
  const [slow, setSlow] = useState(false);
  const [noWorker, setNoWorker] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const workerFailed = useRef(false);
  const requestId = useRef(0);

  useEffect(() => {
    try {
      const saved = stateFromUnknown(JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null'));
      if (saved) setState(saved);
    } catch {
      // An old or manually edited local value should not prevent the tool from opening.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        patternRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Match off the page: a pattern such as (a+)+$ takes seconds on 30 characters and cannot be
  // cancelled once it starts, so on the page it froze every script on the tab, typing included.
  useEffect(() => {
    const id = ++requestId.current;
    if (!state.pattern) {
      setResult(EMPTY_RESULT);
      setSlow(false);
      return;
    }

    /** The worker is created once per page, so its reply is matched by request id, not by closure. */
    const accept = (finishedId: number, next: RegexResult) => {
      if (finishedId !== requestId.current) return;
      setResult(next);
      setSlow(false);
    };
    const giveUp = () => {
      if (id !== requestId.current) return;
      workerRef.current?.terminate();
      workerRef.current = null;
      setResult(EMPTY_RESULT);
      setSlow(true);
    };
    const ensureWorker = (): Worker | null => {
      if (workerRef.current) return workerRef.current;
      if (workerFailed.current) return null;
      try {
        const worker = new Worker(new URL('./match.worker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (event: MessageEvent<{ id: number; result: RegexResult }>) =>
          accept(event.data.id, event.data.result);
        // A chunk that cannot load (blocked request, strict CSP, stale cached page) fires here.
        worker.onerror = () => {
          workerFailed.current = true;
          workerRef.current?.terminate();
          workerRef.current = null;
          setNoWorker(true);
        };
        workerRef.current = worker;
        return worker;
      } catch {
        workerFailed.current = true;
        setNoWorker(true);
        return null;
      }
    };

    let watchdog: number | undefined;
    const delay = window.setTimeout(() => {
      const request = {
        id,
        pattern: state.pattern,
        flags: state.flags,
        text: state.text,
        replacement: state.replacement || undefined,
      };
      const worker = ensureWorker();
      if (worker) {
        worker.postMessage(request);
        watchdog = window.setTimeout(giveUp, MATCH_TIMEOUT_MS);
        return;
      }
      // No worker (rare: it was blocked and could not load). A short text is still checked here,
      // and a long one is refused out loud rather than risking a frozen page.
      if (state.text.length > MAX_DIRECT_CHARS) {
        setSlow(true);
        return;
      }
      accept(id, testRegex(request.pattern, request.flags, request.text, request.replacement));
    }, MATCH_DELAY_MS);

    return () => {
      window.clearTimeout(delay);
      window.clearTimeout(watchdog);
    };
  }, [state]);

  useEffect(() => () => workerRef.current?.terminate(), []);

  const explanation = useMemo(() => explainPattern(state.pattern), [state.pattern]);
  const segments = useMemo(() => highlightSegments(state.text, result.matches), [state.text, result.matches]);
  const n = (value: number) => formatNumber(value, locale);
  const labelForKind: Record<ExplanationKind, string> = {
    anchor: ui.anchor,
    characterClass: ui.characterClass,
    escape: ui.escape,
    group: ui.group,
    lookaround: ui.lookaround,
    quantifier: ui.quantifier,
    alternation: ui.alternation,
    literal: ui.literal,
  };
  const update = (change: Partial<RegexState>) => setState((current) => ({ ...current, ...change }));
  const toggleFlag = (flag: string, checked: boolean) => {
    const flags = checked ? `${state.flags}${flag}` : state.flags.replace(flag, '');
    update({ flags: [...FLAG_ORDER].filter((item) => flags.includes(item)).join('') });
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="flex flex-col gap-5">
          <Field label={ui.patternLabel} hint={ui.patternHint}>
            <div class="flex items-center gap-1 rounded-md border border-line bg-bg px-3 focus-within:border-accent">
              <span class="font-mono text-muted" aria-hidden="true">
                /
              </span>
              <TextInput
                ref={patternRef}
                value={state.pattern}
                onInput={(event) => update({ pattern: (event.currentTarget as HTMLInputElement).value })}
                placeholder={ui.patternPlaceholder}
                spellcheck={false}
                class="border-0 bg-transparent px-0 font-mono focus:border-0"
              />
              <span class="font-mono text-muted" aria-hidden="true">
                /{state.flags}
              </span>
            </div>
          </Field>

          <div>
            <h3 class="mb-2 text-sm font-medium text-fg">{ui.flagsLabel}</h3>
            <div class="flex flex-wrap gap-x-4 gap-y-2">
              {[
                ['g', ui.flagG],
                ['i', ui.flagI],
                ['m', ui.flagM],
                ['s', ui.flagS],
                ['u', ui.flagU],
                ['y', ui.flagY],
              ].map(([flag, label]) => (
                <Toggle
                  checked={state.flags.includes(flag)}
                  onChecked={(checked) => toggleFlag(flag, checked)}
                  label={label}
                />
              ))}
            </div>
          </div>

          <Field label={ui.textLabel}>
            <Textarea
              value={state.text}
              onInput={(event) => update({ text: (event.currentTarget as HTMLTextAreaElement).value })}
              placeholder={ui.textPlaceholder}
              spellcheck={false}
              class="min-h-56 font-mono"
            />
          </Field>

          <Field label={ui.replacementLabel} hint={ui.replacementHint}>
            <TextInput
              value={state.replacement}
              onInput={(event) => update({ replacement: (event.currentTarget as HTMLInputElement).value })}
              placeholder={ui.replacementPlaceholder}
              spellcheck={false}
              class="font-mono"
            />
          </Field>

          <div class="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => update({ text: '', replacement: '' })}
              disabled={!state.text && !state.replacement}
            >
              {ui.clear}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setState({ ...DEFAULT_REGEX_STATE })}>
              {ui.reset}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.saved}</span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.matchCount} value={slow ? '—' : n(result.matches.length)} emphasis />
            <Stat label={ui.characterCount} value={n(state.text.length)} />
          </div>

          {slow ? <Notice tone="danger">{noWorker ? ui.noWorkerLong : ui.slowPattern}</Notice> : null}
          {noWorker && !slow ? <Notice tone="danger">{ui.workerBlocked}</Notice> : null}
          {result.error ? (
            <Notice tone="danger">
              {ui.errorLabel}: {result.error}
            </Notice>
          ) : null}
          {result.hasMoreMatches ? <Notice>{ui.tooManyMatches}</Notice> : null}

          <div>
            <h3 class="mb-2 text-sm font-medium text-fg">{ui.highlightedLabel}</h3>
            <pre class="min-h-32 overflow-auto whitespace-pre-wrap break-words rounded-md border border-line bg-bg p-3 font-mono text-sm leading-6 text-fg">
              {!state.pattern
                ? ui.noPattern
                : slow
                  ? ui.slowResult
                  : result.error
                    ? ui.noMatches
                    : result.matches.length === 0
                      ? ui.noMatches
                      : segments.map((segment) => (
                          <span class={cx(segment.matched && 'rounded-sm bg-accent-soft text-fg')} key={segment.key}>
                            {segment.value}
                          </span>
                        ))}
            </pre>
          </div>

          {state.replacement && !result.error ? (
            <div>
              <h3 class="mb-2 text-sm font-medium text-fg">{ui.replacementPreviewLabel}</h3>
              <div class="rounded-md border border-line bg-bg p-3">
                <pre class="overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-fg">
                  {result.replacement}
                </pre>
                <div class="mt-3">
                  <CopyButton text={result.replacement ?? ''} label={ui.copy} copiedLabel={ui.copied} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div class="mt-6 grid gap-6 border-t border-line pt-6 lg:grid-cols-2">
        <div>
          <h3 class="mb-3 text-sm font-medium text-fg">{ui.matchListLabel}</h3>
          {result.matches.length === 0 ? (
            <p class="text-sm text-subtle">
              {slow ? ui.slowResult : state.pattern && !result.error ? ui.noMatches : ui.noPattern}
            </p>
          ) : (
            <ol class="max-h-96 space-y-2 overflow-auto pr-1">
              {result.matches.map((match, index) => {
                const namedEntries = Object.entries(match.groups);
                return (
                  <li class="rounded-md border border-line bg-surface-2 p-3 text-sm">
                    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span class="font-medium text-fg">{ui.matchLabel.replace('{n}', n(index + 1))}</span>
                      <span class="font-mono text-xs text-subtle">
                        {ui.indexLabel.replace('{start}', n(match.index)).replace('{end}', n(match.end))}
                      </span>
                    </div>
                    <pre class="mt-2 overflow-auto whitespace-pre-wrap break-words font-mono text-sm text-fg">
                      {match.value || ui.emptyValue}
                    </pre>
                    <div class="mt-2 text-xs text-muted">{ui.capturesLabel}</div>
                    {match.captures.length === 0 ? (
                      <p class="mt-1 text-xs text-subtle">{ui.noCaptures}</p>
                    ) : (
                      <div class="mt-1 flex flex-wrap gap-1.5">
                        {match.captures.map((capture, captureIndex) => (
                          <span class="rounded-sm border border-line bg-surface px-1.5 py-1 font-mono text-xs text-fg">
                            ${captureIndex + 1}: {capture ?? ui.emptyValue}
                          </span>
                        ))}
                      </div>
                    )}
                    {namedEntries.length > 0 ? (
                      <div class="mt-2">
                        <div class="text-xs text-muted">{ui.namedGroupsLabel}</div>
                        <div class="mt-1 flex flex-wrap gap-1.5">
                          {namedEntries.map(([name, value]) => (
                            <span class="rounded-sm border border-line bg-surface px-1.5 py-1 font-mono text-xs text-fg">
                              {name}: {value ?? ui.emptyValue}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div>
          <h3 class="mb-3 text-sm font-medium text-fg">{ui.explanationLabel}</h3>
          {explanation.length === 0 ? (
            <p class="text-sm text-subtle">{ui.explanationEmpty}</p>
          ) : (
            <ul class="flex flex-wrap gap-2">
              {explanation.map((token, index) => (
                <li
                  class="rounded-md border border-line bg-surface-2 px-2 py-1.5 text-xs text-muted"
                  key={`${token.value}-${index}`}
                >
                  <code class="font-mono text-fg">{token.value}</code>{' '}
                  <span>
                    {ui.explanationDivider} {labelForKind[token.kind]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p class="mt-4 text-xs text-subtle">
            <Kbd>{ui.shortcutModifier}</Kbd> <Kbd>{ui.shortcutShift}</Kbd> <Kbd>L</Kbd> {ui.focusPattern}
          </p>
        </div>
      </div>
    </Panel>
  );
}

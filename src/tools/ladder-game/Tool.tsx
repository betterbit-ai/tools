import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Stat, TextInput, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { MAX_LABEL_LENGTH, MAX_PLAYERS, MIN_PLAYERS, createLadder, type Ladder, type LadderError } from './logic';

const STORAGE_KEY = 'tools:ladder-game:settings';
const LANE_WIDTH = 104;
const SIDE_PADDING = 56;
const TOP_PADDING = 52;
const BOTTOM_PADDING = 52;
const ROW_HEIGHT = 30;

interface SavedSettings {
  participants: string[];
  outcomes: string[];
}

function defaultLabels(value: string): string[] {
  return value.split('\n');
}

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

function labelFor(pattern: string, index: number): string {
  return pattern.replace('{n}', String(index + 1));
}

function validSavedSettings(value: unknown): value is SavedSettings {
  if (!value || typeof value !== 'object') return false;
  const { participants, outcomes } = value as Partial<SavedSettings>;
  return (
    Array.isArray(participants) &&
    Array.isArray(outcomes) &&
    participants.length === outcomes.length &&
    participants.length >= MIN_PLAYERS &&
    participants.length <= MAX_PLAYERS &&
    participants.every((label) => typeof label === 'string') &&
    outcomes.every((label) => typeof label === 'string')
  );
}

function ladderPath(ladder: Ladder, participant: number, height: number): string {
  const laneX = (index: number) => SIDE_PADDING + index * LANE_WIDTH;
  const usableHeight = height - TOP_PADDING - BOTTOM_PADDING;
  const rungY = (row: number) => TOP_PADDING + ((row + 1) / (ladder.rowCount + 1)) * usableHeight;
  let column = participant;
  const points = [`M ${laneX(column)} ${TOP_PADDING}`];
  for (const rung of [...ladder.rungs].sort((a, b) => a.row - b.row || a.left - b.left)) {
    const y = rungY(rung.row);
    points.push(`L ${laneX(column)} ${y}`);
    if (rung.left === column) {
      column += 1;
      points.push(`L ${laneX(column)} ${y}`);
    } else if (rung.left + 1 === column) {
      column -= 1;
      points.push(`L ${laneX(column)} ${y}`);
    }
  }
  points.push(`L ${laneX(column)} ${height - BOTTOM_PADDING}`);
  return points.join(' ');
}

function labelText(value: string): string {
  const characters = Array.from(value.trim());
  return characters.length > 13 ? `${characters.slice(0, 12).join('')}…` : value.trim();
}

function clampLabel(value: string): string {
  return Array.from(value).slice(0, MAX_LABEL_LENGTH).join('');
}

export default function LadderGame({ ui }: ToolProps<UI>) {
  const [participants, setParticipants] = useState(() => defaultLabels(ui.defaultParticipants));
  const [outcomes, setOutcomes] = useState(() => defaultLabels(ui.defaultOutcomes));
  const [ladder, setLadder] = useState<Ladder | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<LadderError | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);
  const activePath = useRef<SVGPathElement>(null);

  const validationError = useMemo(() => {
    if (
      participants.length !== outcomes.length ||
      participants.length < MIN_PLAYERS ||
      participants.length > MAX_PLAYERS
    ) {
      return 'invalid-player-count' as const;
    }
    if ([...participants, ...outcomes].some((label) => !label.trim())) return 'empty-label' as const;
    if ([...participants, ...outcomes].some((label) => Array.from(label.trim()).length > MAX_LABEL_LENGTH)) {
      return 'label-too-long' as const;
    }
    return null;
  }, [outcomes, participants]);

  const errorText =
    (error ?? validationError) === 'invalid-player-count'
      ? ui.invalidPlayerCount
      : (error ?? validationError) === 'empty-label'
        ? ui.emptyLabel
        : (error ?? validationError) === 'label-too-long'
          ? ui.labelTooLong
          : error === 'crypto'
            ? ui.cryptoError
            : null;

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (validSavedSettings(saved)) {
        setParticipants(saved.participants);
        setOutcomes(saved.outcomes);
      }
    } catch {
      /* Ignore malformed local data. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify({ participants, outcomes } satisfies SavedSettings));
  }, [outcomes, participants, ready]);

  useEffect(() => {
    const path = activePath.current;
    if (!path || selected === null) return;
    const length = path.getTotalLength();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);
    const animation = path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
      duration: reduceMotion ? 0 : 900,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      fill: 'forwards',
    });
    animation.onfinish = () => {
      path.style.strokeDashoffset = '0';
    };
    return () => animation.cancel();
  }, [ladder, selected]);

  const resetLadder = () => {
    setLadder(null);
    setSelected(null);
    setShowAll(false);
    setError(null);
  };

  const updateLabel = (kind: 'participants' | 'outcomes', index: number, value: string) => {
    const setter = kind === 'participants' ? setParticipants : setOutcomes;
    setter((current) => current.map((label, position) => (position === index ? clampLabel(value) : label)));
    resetLadder();
  };

  const changePlayerCount = (direction: -1 | 1) => {
    const count = participants.length + direction;
    if (count < MIN_PLAYERS || count > MAX_PLAYERS) return;
    if (direction === 1) {
      setParticipants((current) => [...current, labelFor(ui.participantPlaceholder, current.length)]);
      setOutcomes((current) => [...current, labelFor(ui.outcomePlaceholder, current.length)]);
    } else {
      setParticipants((current) => current.slice(0, -1));
      setOutcomes((current) => current.slice(0, -1));
    }
    resetLadder();
  };

  const buildLadder = useCallback(() => {
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setLadder(createLadder(participants.length, cryptoSource));
      setSelected(null);
      setShowAll(false);
      setError(null);
    } catch {
      setError('crypto');
    }
  }, [participants.length, validationError]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }
      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        buildLadder();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [buildLadder]);

  const chooseParticipant = (index: number) => {
    if (!ladder) return;
    setShowAll(false);
    setSelected(index);
  };

  const resultFor = (index: number) => (ladder ? outcomes[ladder.mapping[index] ?? 0]?.trim() : '');
  const resultText = ladder
    ? participants
        .map((participant, index) => `${participant.trim()} ${ui.resultSeparator} ${resultFor(index)}`)
        .join('\n')
    : '';
  const width = Math.max(360, SIDE_PADDING * 2 + Math.max(1, participants.length - 1) * LANE_WIDTH);
  const height = TOP_PADDING + BOTTOM_PADDING + ROW_HEIGHT * (ladder?.rowCount ?? 5);
  const activeResult = selected === null ? '' : resultFor(selected);

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-fg">{ui.setupHeading}</p>
              <p class="mt-1 text-xs text-subtle">{ui.setupHint}</p>
            </div>
            <div class="flex items-center gap-2">
              <Button size="sm" onClick={() => changePlayerCount(-1)} disabled={participants.length <= MIN_PLAYERS}>
                {ui.removePlayer}
              </Button>
              <span class="min-w-14 text-center text-sm font-medium tabular text-fg">
                {ui.playerCount.replace('{n}', String(participants.length))}
              </span>
              <Button size="sm" onClick={() => changePlayerCount(1)} disabled={participants.length >= MAX_PLAYERS}>
                {ui.addPlayer}
              </Button>
            </div>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            {participants.map((participant, index) => (
              <div class="grid grid-cols-2 gap-2">
                <Field label={labelFor(ui.participantLabel, index)}>
                  <TextInput
                    value={participant}
                    placeholder={labelFor(ui.participantPlaceholder, index)}
                    onInput={(event) => updateLabel('participants', index, event.currentTarget.value)}
                  />
                </Field>
                <Field label={labelFor(ui.outcomeLabel, index)}>
                  <TextInput
                    value={outcomes[index] ?? ''}
                    placeholder={labelFor(ui.outcomePlaceholder, index)}
                    onInput={(event) => updateLabel('outcomes', index, event.currentTarget.value)}
                  />
                </Field>
              </div>
            ))}
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" onClick={buildLadder} disabled={!!validationError}>
              {ladder ? ui.rebuild : ui.build}
            </Button>
            <span class="text-xs text-muted">
              {ui.shortcut} <Kbd>L</Kbd>
            </span>
          </div>
          {errorText && (
            <div class="mt-4">
              <Notice tone="danger">{errorText}</Notice>
            </div>
          )}
        </section>

        <section class="rounded-lg border border-line bg-surface-2 p-4" aria-label={ui.fairnessHeading}>
          <p class="text-sm font-medium text-fg">{ui.fairnessHeading}</p>
          <p class="mt-2 text-sm leading-6 text-muted">{ui.fairnessText}</p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <Stat label={ui.playerStat} value={participants.length} />
            <Stat label={ui.outcomeStat} value={outcomes.length} />
          </div>
          <p class="mt-3 text-xs leading-5 text-subtle">{ui.cryptoNote}</p>
        </section>
      </div>

      <div class="mt-6 border-t border-line pt-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-fg">{ui.ladderHeading}</p>
            <p class="mt-1 text-xs text-subtle">{ladder ? ui.ladderHint : ui.waitingLadder}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setShowAll(true)} disabled={!ladder}>
              {ui.revealAll}
            </Button>
            <CopyButton text={resultText} label={ui.copyResults} copiedLabel={ui.copied} />
          </div>
        </div>

        {ladder ? (
          <>
            <div class="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                width={width}
                height={height}
                class="block min-w-full"
                role="img"
                aria-label={ui.ladderGraphicLabel}
              >
                {participants.map((participant, index) => {
                  const x = SIDE_PADDING + index * LANE_WIDTH;
                  return (
                    <g>
                      <text x={x} y="20" text-anchor="middle" class="fill-fg text-[13px] font-medium">
                        {labelText(participant)}
                      </text>
                      <line
                        x1={x}
                        x2={x}
                        y1={TOP_PADDING}
                        y2={height - BOTTOM_PADDING}
                        class="stroke-line-strong"
                        stroke-width="2"
                      />
                      <text x={x} y={height - 16} text-anchor="middle" class="fill-muted text-[13px]">
                        {showAll ? labelText(outcomes[index] ?? '') : ui.hiddenOutcome}
                      </text>
                    </g>
                  );
                })}
                {ladder.rungs.map((rung) => {
                  const y =
                    TOP_PADDING + ((rung.row + 1) / (ladder.rowCount + 1)) * (height - TOP_PADDING - BOTTOM_PADDING);
                  const x = SIDE_PADDING + rung.left * LANE_WIDTH;
                  return <line x1={x} x2={x + LANE_WIDTH} y1={y} y2={y} class="stroke-line-strong" stroke-width="2" />;
                })}
                {showAll &&
                  participants.map((_, index) => (
                    <path d={ladderPath(ladder, index, height)} class="fill-none stroke-accent" stroke-width="3" />
                  ))}
                {selected !== null && !showAll && (
                  <path
                    ref={activePath}
                    d={ladderPath(ladder, selected, height)}
                    class="fill-none stroke-accent"
                    stroke-width="3"
                  />
                )}
              </svg>
            </div>

            <div class="mt-4 flex flex-wrap gap-2" aria-label={ui.participantsToReveal}>
              {participants.map((participant, index) => (
                <Button
                  size="sm"
                  onClick={() => chooseParticipant(index)}
                  class={cx(selected === index && !showAll && 'border-accent bg-accent-soft text-fg')}
                >
                  {participant.trim() || labelFor(ui.participantPlaceholder, index)}
                </Button>
              ))}
            </div>

            <output
              aria-live="polite"
              class="mt-4 block rounded-md border border-line bg-surface-2 px-4 py-3 text-sm text-fg"
            >
              {showAll
                ? ui.allRevealed
                : activeResult
                  ? `${participants[selected ?? 0]?.trim()} ${ui.resultSeparator} ${activeResult}`
                  : ui.selectParticipant}
            </output>
            {showAll && (
              <ol class="mt-3 grid gap-2 sm:grid-cols-2" aria-label={ui.allResultsLabel}>
                {participants.map((participant, index) => (
                  <li class="flex min-w-0 items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2 text-sm">
                    <span class="min-w-0 truncate text-fg">{participant.trim()}</span>
                    <span class="min-w-0 truncate text-muted">
                      {ui.resultSeparator} {resultFor(index)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <p class="mt-4 rounded-md border border-line bg-surface-2 px-4 py-8 text-center text-sm text-muted">
            {ui.waitingLadder}
          </p>
        )}
      </div>
    </Panel>
  );
}

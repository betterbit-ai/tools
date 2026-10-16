import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  Kbd,
  Notice,
  NumberInput,
  Panel,
  Segmented,
  Stat,
  Textarea,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import {
  formatTeams,
  generateTeams,
  parseParticipants,
  scoreRange,
  validateSettings,
  type Team,
  type TeamError,
  type TeamMode,
} from './logic';
import type { UI } from './content';

const STORAGE_KEY = 'tools:team-generator:settings';
const UINT32_RANGE = 0x1_0000_0000;

interface SavedSettings {
  roster: string;
  teamCount: number;
  mode: TeamMode;
}

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return (globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) / UINT32_RANGE;
}

export default function TeamGenerator({ ui }: ToolProps<UI>) {
  const [roster, setRoster] = useState(ui.defaultRoster);
  const [teamCount, setTeamCount] = useState<number | ''>(2);
  const [mode, setMode] = useState<TeamMode>('random');
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<TeamError | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);
  const hasGeneratedInitialTeams = useRef(false);

  const participants = useMemo(() => parseParticipants(roster), [roster]);
  const currentTeamCount = teamCount === '' ? Number.NaN : teamCount;
  const validationError = validateSettings(participants, currentTeamCount, mode);
  const errorText = errorMessage(error ?? validationError, ui);
  const range = teams ? scoreRange(teams) : null;
  const output = teams ? formatTeams(teams, ui.teamLabel, mode === 'balanced' ? ui.skillLabel : undefined) : '';

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<SavedSettings> | null;
      if (
        saved &&
        typeof saved.roster === 'string' &&
        typeof saved.teamCount === 'number' &&
        (saved.mode === 'random' || saved.mode === 'balanced')
      ) {
        setRoster(saved.roster);
        setTeamCount(saved.teamCount);
        setMode(saved.mode);
      }
    } catch {
      /* Ignore malformed local settings. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && teamCount !== '')
      safeStorage.set(STORAGE_KEY, JSON.stringify({ roster, teamCount, mode } satisfies SavedSettings));
  }, [mode, ready, roster, teamCount]);

  const generate = useCallback(() => {
    const nextParticipants = parseParticipants(roster);
    const nextTeamCount = teamCount === '' ? Number.NaN : teamCount;
    const nextError = validateSettings(nextParticipants, nextTeamCount, mode);
    if (nextError) {
      setError(nextError);
      return;
    }
    try {
      setTeams(generateTeams(nextParticipants, nextTeamCount, mode, cryptoSource));
      setError(null);
    } catch {
      setError('crypto');
    }
  }, [mode, roster, teamCount]);

  useEffect(() => {
    if (ready && !hasGeneratedInitialTeams.current && !validationError) {
      hasGeneratedInitialTeams.current = true;
      generate();
    }
  }, [generate, ready, validationError]);

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
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [generate]);

  const resetResult = () => {
    setTeams(null);
    setError(null);
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <Field label={ui.rosterLabel} hint={ui.rosterHint}>
            <Textarea
              value={roster}
              onInput={(event) => {
                setRoster((event.currentTarget as HTMLTextAreaElement).value);
                resetResult();
              }}
              maxLength={25_000}
              spellcheck={false}
              aria-describedby="team-generator-participant-count"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span id="team-generator-participant-count" class="text-xs text-muted">
              {ui.participantCount.replace('{n}', String(participants.length)).replace('{max}', ui.maxParticipants)}
            </span>
            <div class="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setRoster(ui.defaultRoster);
                  resetResult();
                }}
              >
                {ui.restoreSample}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setRoster('');
                  resetResult();
                }}
                disabled={!roster}
              >
                {ui.clearRoster}
              </Button>
            </div>
          </div>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label={ui.teamCountLabel} hint={ui.teamCountHint}>
              <NumberInput
                value={teamCount}
                onValue={(value) => {
                  setTeamCount(value);
                  resetResult();
                }}
                min={2}
                max={participants.length || undefined}
                step={1}
              />
            </Field>
            <Field label={ui.modeLabel} hint={mode === 'balanced' ? ui.balancedHint : ui.randomHint}>
              <Segmented
                value={mode}
                onValue={(value) => {
                  setMode(value);
                  resetResult();
                }}
                label={ui.modeLabel}
                options={[
                  { value: 'random', label: ui.randomMode },
                  { value: 'balanced', label: ui.balancedMode },
                ]}
              />
            </Field>
          </div>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" onClick={generate} disabled={!!validationError}>
              {teams ? ui.reshuffle : ui.generate}
            </Button>
            <span class="text-xs text-muted">
              {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd>
            </span>
          </div>
          {errorText && (
            <div class="mt-4">
              <Notice tone="danger">{errorText}</Notice>
            </div>
          )}
          <div class="mt-4">
            <Notice>{ui.localOnlyNote}</Notice>
          </div>
        </div>
        <div class="rounded-lg border border-line bg-surface-2 p-4">
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
            <CopyButton text={output} label={ui.copyResults} copiedLabel={ui.copied} />
          </div>
          <div aria-live="polite" class="mt-4 grid gap-3">
            {teams ? (
              teams.map((team, index) => (
                <section class="rounded-md border border-line bg-surface p-3">
                  <div class="flex items-center justify-between gap-3">
                    <p class="font-medium text-fg">
                      {ui.teamLabel} {index + 1}
                    </p>
                    <span class="text-xs text-muted">{ui.memberCount.replace('{n}', String(team.members.length))}</span>
                  </div>
                  {team.score !== null && (
                    <p class="mt-1 text-xs text-muted">
                      {ui.skillLabel}: {team.score}
                    </p>
                  )}
                  <ul class="mt-2 grid gap-1 text-sm text-fg">
                    {team.members.map((member) => (
                      <li>{member.name}</li>
                    ))}
                  </ul>
                </section>
              ))
            ) : (
              <p class="rounded-md border border-line bg-surface px-3 py-6 text-center text-sm text-muted">
                {ui.waitingResult}
              </p>
            )}
          </div>
          {range !== null && (
            <div class="mt-3">
              <Stat label={ui.skillSpreadLabel} value={range} />
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function errorMessage(error: TeamError | 'crypto' | null, ui: UI): string | null {
  if (error === 'not-enough-participants') return ui.notEnoughParticipantsError;
  if (error === 'too-many-participants') return ui.tooManyParticipantsError;
  if (error === 'name-too-long') return ui.nameTooLongError;
  if (error === 'invalid-team-count') return ui.invalidTeamCountError;
  if (error === 'missing-scores') return ui.missingScoresError;
  if (error === 'crypto') return ui.cryptoError;
  return null;
}

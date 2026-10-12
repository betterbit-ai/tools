import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Select, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { codePointOf, filterCharacters, KEYBOARD_GROUP_IDS, rememberRecent, type CharacterGroupId } from './logic';

const STORAGE_KEY = 'tools:character-map:settings';
const GROUP_IDS: CharacterGroupId[] = ['all', 'popular', ...KEYBOARD_GROUP_IDS];

function isGroupId(value: unknown): value is CharacterGroupId {
  return typeof value === 'string' && GROUP_IDS.includes(value as CharacterGroupId);
}

export default function CharacterMap({ locale, ui }: ToolProps<UI>) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<CharacterGroupId>('popular');
  const [recent, setRecent] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [ready, setReady] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? '{}') as { group?: unknown; recent?: unknown };
      if (isGroupId(saved.group)) setGroup(saved.group);
      if (Array.isArray(saved.recent))
        setRecent(saved.recent.filter((item): item is string => typeof item === 'string').slice(0, 24));
    } catch {
      safeStorage.remove(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify({ group, recent }));
  }, [group, recent, ready]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
      if (event.key === '/' && !isEditable) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const results = useMemo(() => filterCharacters(query, group), [query, group]);
  const recentEntries = useMemo(
    () => recent.map((character) => filterCharacters(character, 'all')[0]).filter(Boolean),
    [recent],
  );
  const groupOptions = GROUP_IDS.map((value) => ({ value, label: ui[value] }));
  const n = (value: number) => formatNumber(value, locale);

  const copy = async (character: string) => {
    try {
      await navigator.clipboard.writeText(character);
      setRecent((current) => rememberRecent(current, character));
      setStatus(ui.copied.replace('{character}', character));
    } catch {
      setStatus(ui.copyFailed);
    }
  };

  const characterButton = (character: string, code: string) => (
    <Button
      key={character}
      size="md"
      variant="secondary"
      class="h-auto min-h-16 flex-col gap-1 px-2 py-2 font-normal"
      aria-label={ui.copyCharacter.replace('{character}', character).replace('{code}', code)}
      title={`${character} ${code}`}
      onClick={() => copy(character)}
    >
      <span class="text-2xl leading-none text-fg">{character}</span>
      <span class="font-mono text-[11px] text-subtle">{code}</span>
    </Button>
  );

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div class="min-w-0 space-y-5">
          <Field label={ui.searchLabel} hint={ui.searchHint}>
            <TextInput
              ref={searchRef}
              value={query}
              onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
              placeholder={ui.searchPlaceholder}
              autoComplete="off"
            />
          </Field>

          {recentEntries.length > 0 && (
            <section aria-labelledby="cm-recent">
              <h2 id="cm-recent" class="text-sm font-medium text-fg mb-2">
                {ui.recent}
              </h2>
              <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {recentEntries.map((entry) => characterButton(entry.character, codePointOf(entry.character)))}
              </div>
            </section>
          )}

          <section aria-labelledby="cm-results">
            <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 id="cm-results" class="text-sm font-medium text-fg">
                {ui.results}
              </h2>
              <span class="text-xs tabular text-subtle">{ui.resultCount.replace('{n}', n(results.length))}</span>
            </div>
            {results.length > 0 ? (
              <div class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8" aria-live="polite">
                {results.map((entry) => characterButton(entry.character, codePointOf(entry.character)))}
              </div>
            ) : (
              <Notice>{ui.noResults}</Notice>
            )}
          </section>

          {status && <Notice tone={status === ui.copyFailed ? 'danger' : 'success'}>{status}</Notice>}
        </div>

        <aside class="space-y-5">
          <Field label={ui.groupLabel}>
            <Select value={group} onValue={setGroup} options={groupOptions} />
          </Field>
          <p class="text-sm leading-6 text-muted">{ui.copyHint}</p>
          <p class="text-xs text-subtle">
            {ui.shortcutStart} <Kbd>/</Kbd> {ui.shortcutEnd}
          </p>
        </aside>
      </div>
    </Panel>
  );
}

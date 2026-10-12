import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Segmented, Stat, Textarea } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { STYLES, type StyleGroup, changesText, characterCount, transformText } from './logic';

const TEXT_KEY = 'tools:fancy-text:text';

export default function FancyText({ ui }: ToolProps<UI>) {
  const [text, setText] = useState(ui.example);
  const [group, setGroup] = useState<StyleGroup | 'all'>('all');

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? ui.example);
  }, [ui.example]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (text && text !== ui.example) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [text, ui.example]);

  const results = useMemo(
    () =>
      STYLES.filter((style) => (group === 'all' || style.group === group) && changesText(text, style.id)).map(
        (style) => ({
          ...style,
          text: transformText(text, style.id),
        }),
      ),
    [group, text],
  );

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0">
          <Field label={ui.inputLabel}>
            <Textarea
              value={text}
              onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
              placeholder={ui.inputPlaceholder}
              spellcheck={false}
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <Stat label={ui.characters} value={characterCount(text)} emphasis />
          <Field label={ui.styleGroup}>
            <Segmented
              value={group}
              onValue={setGroup}
              label={ui.styleGroup}
              options={[
                { value: 'all', label: ui.allStyles },
                { value: 'clean', label: ui.cleanStyles },
                { value: 'decorate', label: ui.decorateStyles },
              ]}
            />
          </Field>
          <Notice>{ui.compatibilityNote}</Notice>
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-5">
        <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="text-sm font-medium text-fg">{ui.resultLabel}</h2>
          <span class="text-xs tabular text-subtle">{ui.changedCount.replace('{n}', String(results.length))}</span>
        </div>
        {results.length === 0 ? (
          <Notice>{ui.noResults}</Notice>
        ) : (
          <div class="grid gap-3 sm:grid-cols-2" aria-live="polite">
            {results.map((result) => (
              <article class="min-w-0 rounded-lg border border-line bg-surface-2 p-3">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-sm font-medium text-fg">{ui[result.id]}</h3>
                  <CopyButton text={result.text} label={ui.copy} copiedLabel={ui.copied} />
                </div>
                <p class="mt-3 overflow-hidden text-ellipsis whitespace-pre-wrap break-words text-[15px] leading-6 text-fg">
                  {result.text}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

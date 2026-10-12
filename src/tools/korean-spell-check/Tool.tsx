import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Stat, Textarea } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { applyIssues, checkText, type RuleId, type SpellIssue } from './logic';

const TEXT_KEY = 'tools:korean-spell-check:text';

export default function KoreanSpellCheck({ ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [appliedCount, setAppliedCount] = useState(0);
  const result = useMemo(() => checkText(text), [text]);
  const reasons: Record<RuleId, string> = {
    'doe-yo': ui.reasonDoeYo,
    myeochil: ui.reasonMyeochil,
    waenji: ui.reasonWaenji,
    eoui: ui.reasonEoui,
    geumsae: ui.reasonGeumsae,
    mweyoyo: ui.reasonMweyoyo,
    eotteokhae: ui.reasonEotteokhae,
    seollem: ui.reasonSeollem,
    yeokhal: ui.reasonYeokhal,
    message: ui.reasonMessage,
    contents: ui.reasonContents,
    accessory: ui.reasonAccessory,
    'spacing-halsu': ui.reasonSpacingHalsu,
    'spacing-geotgat': ui.reasonSpacingGeotgat,
    'punctuation-space': ui.reasonPunctuationSpace,
  };

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? '');
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (text) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => window.clearTimeout(id);
  }, [text]);

  const applyAll = () => {
    if (!result.issues.length) return;
    setAppliedCount(result.issues.length);
    setText(result.correctedText);
  };

  const applyOne = (issue: SpellIssue) => {
    setAppliedCount(1);
    setText((current) => applyIssues(current, [issue]));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey) || !result.issues.length) return;
      event.preventDefault();
      applyAll();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [result]);

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex min-w-0 flex-col">
          <Field label={ui.inputLabel} hint={ui.inputHint}>
            <Textarea
              value={text}
              onInput={(event) => {
                setAppliedCount(0);
                setText((event.currentTarget as HTMLTextAreaElement).value);
              }}
              placeholder={ui.placeholder}
              spellcheck={false}
              class="min-h-[260px] lg:min-h-[360px]"
            />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setText(ui.sampleText)}>
              {ui.sample}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setText('')} disabled={!text}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>

          <div class="mt-5 border-t border-line pt-5">
            <Field label={ui.outputLabel} hint={ui.outputHint}>
              <Textarea value={result.correctedText} readOnly placeholder={ui.emptyOutput} class="min-h-[180px]" />
            </Field>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={result.correctedText} label={ui.copy} copiedLabel={ui.copied} />
              <Button size="sm" variant="primary" onClick={applyAll} disabled={!result.issues.length}>
                {ui.applyAll}
              </Button>
              <span class="text-xs text-subtle">
                <Kbd>{ui.shortcutModifier}</Kbd> + <Kbd>{ui.shortcutEnter}</Kbd> {ui.shortcutHint}
              </span>
            </div>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.issues} value={result.issues.length} emphasis />
            <Stat label={ui.characters} value={Array.from(text).length} />
          </div>

          {!text ? (
            <Notice>{ui.emptyNotice}</Notice>
          ) : result.issues.length ? (
            <Notice>{ui.reviewNotice}</Notice>
          ) : (
            <Notice tone="success">{ui.cleanNotice}</Notice>
          )}

          {appliedCount > 0 && <Notice tone="success">{ui.applied.replace('{n}', String(appliedCount))}</Notice>}

          {result.issues.length > 0 && (
            <div>
              <h2 class="mb-2 text-sm font-medium text-fg">{ui.suggestions}</h2>
              <ul class="max-h-[390px] space-y-2 overflow-auto" aria-label={ui.suggestions}>
                {result.issues.map((issue) => (
                  <li key={`${issue.start}-${issue.rule}`} class="rounded-md border border-line bg-surface-2 p-3">
                    <p class="break-words text-sm font-medium text-fg">
                      {issue.original} <span class="text-muted">→</span> {issue.replacement}
                    </p>
                    <p class="mt-1 text-xs leading-5 text-muted">{reasons[issue.rule]}</p>
                    <Button size="sm" variant="ghost" class="mt-2" onClick={() => applyOne(issue)}>
                      {ui.applyOne}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

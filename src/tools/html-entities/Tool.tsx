import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, FieldGroup, Notice, Panel, Segmented, Stat, Textarea, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  type EncodeMode,
  type EntityFormat,
  decodeHtml,
  describeCodePoint,
  encodeHtml,
  namedEntityCount,
} from './logic';

const INPUT_KEY = 'tools:html-entities:input';
const OPTIONS_KEY = 'tools:html-entities:options';

type Direction = 'encode' | 'decode';
interface Options {
  direction: Direction;
  level: EncodeMode;
  format: EntityFormat;
  lineBreaks: boolean;
}

const DEFAULTS: Options = { direction: 'encode', level: 'minimal', format: 'named', lineBreaks: false };
const SAMPLE = 'Tom & Jerry said "Hi" — Café 한글 😀';

/** Characters shown in the reference table, encoded the way the encoder would write them. */
const TABLE = [0x26, 0x3c, 0x3e, 0x22, 0x27, 0xa0, 0xa9, 0xae, 0x2122, 0x2014, 0x20ac, 0xac00];

const isDirection = (v: string | null): v is Direction => v === 'encode' || v === 'decode';
const isLevel = (v: string | null): v is EncodeMode => v === 'minimal' || v === 'non-ascii' || v === 'all';
const isFormat = (v: string | null): v is EntityFormat => v === 'named' || v === 'decimal' || v === 'hex';

export default function HtmlEntities({ locale, ui }: ToolProps<UI>) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Options>(DEFAULTS);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setInput(safeStorage.get(INPUT_KEY) ?? SAMPLE);
    const saved = safeStorage.get(OPTIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        setOptions({
          direction: isDirection(parsed.direction as string) ? (parsed.direction as Direction) : DEFAULTS.direction,
          level: isLevel(parsed.level as string) ? (parsed.level as EncodeMode) : DEFAULTS.level,
          format: isFormat(parsed.format as string) ? (parsed.format as EntityFormat) : DEFAULTS.format,
          lineBreaks: parsed.lineBreaks === true,
        });
      } catch {
        setOptions(DEFAULTS);
      }
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!input) {
        safeStorage.remove(INPUT_KEY);
        setSaveFailed(false);
        return;
      }
      setSaveFailed(!safeStorage.trySet(INPUT_KEY, input));
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  useEffect(() => safeStorage.set(OPTIONS_KEY, JSON.stringify(options)), [options]);

  const decoded = useMemo(() => decodeHtml(input), [input]);
  const encoded = useMemo(
    () => encodeHtml(input, { mode: options.level, format: options.format, lineBreaks: options.lineBreaks }),
    [input, options.level, options.format, options.lineBreaks],
  );

  const encoding = options.direction === 'encode';
  const result = encoding ? encoded : decoded.text;
  const n = (v: number) => formatNumber(v, locale);

  const set = <K extends keyof Options>(key: K, value: Options[K]) => setOptions((o) => ({ ...o, [key]: value }));

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div class="flex min-w-0 flex-col">
          <label for="entities-input" class="mb-1.5 text-sm font-medium text-fg">
            {ui.inputLabel}
          </label>
          <Textarea
            id="entities-input"
            value={input}
            onInput={(e) => setInput((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.inputPlaceholder}
            spellcheck={false}
            class="min-h-56 flex-1 font-mono text-sm lg:min-h-[320px]"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {ui.clear}
            </Button>
            <span class="text-xs text-subtle">
              {ui.characters}: {n([...input].length)}
            </span>
            <span class="ml-auto text-xs text-subtle">{saveFailed ? '' : ui.autosaved}</span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <FieldGroup label={ui.directionLabel}>
            <Segmented
              value={options.direction}
              onValue={(v) => set('direction', v)}
              label={ui.directionLabel}
              options={[
                { value: 'encode', label: ui.encode },
                { value: 'decode', label: ui.decode },
              ]}
            />
          </FieldGroup>

          {encoding ? (
            <>
              <FieldGroup label={ui.levelLabel} hint={ui.levelHint}>
                <Segmented
                  value={options.level}
                  onValue={(v) => set('level', v)}
                  label={ui.levelLabel}
                  options={[
                    { value: 'minimal', label: ui.levelMinimal },
                    { value: 'non-ascii', label: ui.levelNonAscii },
                    { value: 'all', label: ui.levelAll },
                  ]}
                />
              </FieldGroup>
              <FieldGroup label={ui.formatLabel}>
                <Segmented
                  value={options.format}
                  onValue={(v) => set('format', v)}
                  label={ui.formatLabel}
                  options={[
                    { value: 'named', label: ui.formatNamed },
                    { value: 'decimal', label: ui.formatDecimal },
                    { value: 'hex', label: ui.formatHex },
                  ]}
                />
                <div class="mt-3">
                  <Toggle checked={options.lineBreaks} onChecked={(v) => set('lineBreaks', v)} label={ui.lineBreaks} />
                </div>
              </FieldGroup>
            </>
          ) : null}

          <div>
            <label for="entities-output" class="mb-1.5 block text-sm font-medium text-fg">
              {ui.outputLabel}
            </label>
            <Textarea
              id="entities-output"
              value={result}
              readOnly
              placeholder={ui.outputPlaceholder}
              spellcheck={false}
              class="min-h-40 bg-surface-2 font-mono text-sm"
            />
            <div class="mt-3 flex flex-wrap gap-2">
              <CopyButton text={result} label={ui.copy} copiedLabel={ui.copied} />
              <Button size="sm" variant="secondary" onClick={() => setInput(result)} disabled={!result}>
                {ui.swap}
              </Button>
              {!encoding && decoded.remaining > 0 ? (
                <Button size="sm" variant="secondary" onClick={() => setInput(decoded.text)}>
                  {ui.decodeAgain}
                </Button>
              ) : null}
            </div>
          </div>

          <div class="grid gap-2">
            {encoding ? null : (
              <>
                <div class="grid grid-cols-2 gap-2">
                  <Stat label={ui.replaced} value={n(decoded.replaced)} />
                  <Stat label={ui.characters} value={n([...decoded.text].length)} />
                </div>
                {decoded.remaining > 0 ? (
                  <Notice tone="info">{ui.remainingNotice.replace('{count}', n(decoded.remaining))}</Notice>
                ) : null}
                {decoded.invalid > 0 ? (
                  <Notice tone="danger">{ui.invalidNotice.replace('{count}', n(decoded.invalid))}</Notice>
                ) : null}
                {decoded.unknown.length > 0 ? (
                  <Notice tone="danger">
                    {ui.unknownNotice
                      .replace('{count}', n(decoded.unknown.length))
                      .replace('{list}', decoded.unknown.join(' '))}
                  </Notice>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <div class="mt-8 border-t border-line pt-6">
        <h2 class="mb-3 text-sm font-semibold text-fg">{ui.tableTitle}</h2>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[420px] text-left text-sm">
            <thead class="text-xs text-muted">
              <tr>
                <th class="py-1.5 pr-4 font-medium">{ui.tableChar}</th>
                <th class="py-1.5 pr-4 font-medium">{ui.tableNamed}</th>
                <th class="py-1.5 font-medium">{ui.tableDecimal}</th>
              </tr>
            </thead>
            <tbody class="font-mono">
              {TABLE.map((cp) => {
                const info = describeCodePoint(cp);
                return (
                  <tr class="border-t border-line">
                    <td class="py-1.5 pr-4">{info.char === '\u00a0' ? '␣' : info.char}</td>
                    <td class="py-1.5 pr-4">{encodeHtml(info.char, { mode: 'non-ascii', format: 'named' })}</td>
                    <td class="py-1.5">{info.decimal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-subtle">{ui.namedCount.replace('{count}', n(namedEntityCount()))}</p>
      </div>
    </Panel>
  );
}

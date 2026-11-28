import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Field, FieldGroup, Notice, Panel, Segmented, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  type CronError,
  type FieldName,
  type ParsedCron,
  type Zone,
  describeCron,
  formatRun,
  localZoneName,
  nextRuns,
  parseCron,
} from './logic';

const EXPRESSION_KEY = 'tools:cron-parser:expression';
const ZONE_KEY = 'tools:cron-parser:zone';
const RUN_COUNT = 10;
const SAMPLE = '0 9 * * 1-5';

const PRESETS: { expression: string; label: keyof UI }[] = [
  { expression: '* * * * *', label: 'presetEveryMinute' },
  { expression: '*/15 * * * *', label: 'presetQuarter' },
  { expression: '0 9 * * 1-5', label: 'presetWeekdays' },
  { expression: '0 0 1 * *', label: 'presetMonthly' },
  { expression: '0 */6 * * *', label: 'presetEverySixHours' },
];

const fieldKey: Record<FieldName, keyof UI> = {
  second: 'fieldSecond',
  minute: 'fieldMinute',
  hour: 'fieldHour',
  dayOfMonth: 'fieldDayOfMonth',
  month: 'fieldMonth',
  dayOfWeek: 'fieldDayOfWeek',
};

export default function CronParser({ locale, ui }: ToolProps<UI>) {
  const [expression, setExpression] = useState('');
  const [zone, setZone] = useState<Zone>('local');
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setExpression(safeStorage.get(EXPRESSION_KEY) ?? SAMPLE);
    setZone(safeStorage.get(ZONE_KEY) === 'utc' ? 'utc' : 'local');
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!expression) {
        safeStorage.remove(EXPRESSION_KEY);
        setSaveFailed(false);
        return;
      }
      setSaveFailed(!safeStorage.trySet(EXPRESSION_KEY, expression));
    }, 300);
    return () => clearTimeout(id);
  }, [expression]);

  useEffect(() => safeStorage.set(ZONE_KEY, zone), [zone]);

  const parsed: ParsedCron = useMemo(() => parseCron(expression), [expression]);
  const description = useMemo(() => describeCron(parsed, locale), [parsed, locale]);
  const runs = useMemo(() => nextRuns(parsed, RUN_COUNT, new Date(), zone), [parsed, zone]);
  const zoneLabel = zone === 'utc' ? 'UTC' : localZoneName();

  const errorText = (): string | null => {
    if (parsed.ok || !parsed.error) return null;
    const { code, field, value } = parsed.error;
    const fieldName = ui[fieldKey[field]] as string;
    const withField = (template: string) => template.replace('{field}', fieldName).replace('{value}', value);
    const map: Record<CronError, string> = {
      'too-few-fields': ui.errorTooFew,
      'too-many-fields': ui.errorTooMany,
      'out-of-range': withField(ui.errorOutOfRange),
      'bad-value': withField(ui.errorBadValue),
      'bad-range': withField(ui.errorBadRange),
      'step-zero': withField(ui.errorStepZero),
      'unknown-macro': ui.errorUnknownMacro.replace('{value}', value),
      reboot: ui.errorReboot,
    };
    return map[code];
  };

  const table: { label: string; values: number[] }[] = [];
  if (parsed.hasSeconds) table.push({ label: ui.fieldSecond, values: parsed.fields.second.values });
  table.push(
    { label: ui.fieldMinute, values: parsed.fields.minute.values },
    { label: ui.fieldHour, values: parsed.fields.hour.values },
    { label: ui.fieldDayOfMonth, values: parsed.fields.dayOfMonth.values },
    { label: ui.fieldMonth, values: parsed.fields.month.values },
    { label: ui.fieldDayOfWeek, values: parsed.fields.dayOfWeek.values },
  );

  return (
    <Panel>
      <div class="flex flex-col gap-6">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Field label={ui.expressionLabel}>
            <TextInput
              id="cron-input"
              value={expression}
              onInput={(e) => setExpression((e.currentTarget as HTMLInputElement).value)}
              placeholder={ui.expressionPlaceholder}
              spellcheck={false}
              autocomplete="off"
              aria-invalid={parsed.ok ? undefined : true}
              class="font-mono text-lg"
            />
          </Field>
          <FieldGroup label={ui.zoneLabel}>
            <Segmented
              value={zone}
              onValue={(v) => setZone(v)}
              label={ui.zoneLabel}
              options={[
                { value: 'local', label: ui.zoneLocal },
                { value: 'utc', label: ui.zoneUtc },
              ]}
            />
          </FieldGroup>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-subtle">{ui.presetsLabel}</span>
          {PRESETS.map((preset) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setExpression(preset.expression)}
              aria-pressed={expression === preset.expression}
            >
              {ui[preset.label] as string}
            </Button>
          ))}
        </div>

        {errorText() ? <Notice tone="danger">{errorText()}</Notice> : null}

        {parsed.ok ? (
          <div class="rounded-lg bg-surface-2 p-4">
            <p id="cron-description" class="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
              {description}
            </p>
            {parsed.hasSeconds ? <p class="mt-1 text-xs text-muted">{ui.secondsNote}</p> : null}
          </div>
        ) : null}

        <div class="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 class="mb-2 text-sm font-semibold text-fg">{ui.nextTitle}</h2>
            {runs.length ? (
              <ol id="cron-runs" class="divide-y divide-line rounded-md border border-line">
                {runs.map((run, index) => (
                  <li class="flex items-baseline gap-3 px-3 py-2 text-sm">
                    <span class="tabular w-6 text-right text-subtle">{index + 1}</span>
                    <span class="tabular text-fg">{formatRun(run, locale, zone)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <Notice tone="info">{ui.noRuns}</Notice>
            )}
            <p class="mt-2 text-xs text-subtle">{ui.nextInZone.replace('{zone}', zoneLabel)}</p>
          </div>

          <div class="min-w-0">
            <h2 class="mb-2 text-sm font-semibold text-fg">{ui.breakdownTitle}</h2>
            <table class="w-full text-left text-sm">
              <thead class="text-xs text-muted">
                <tr>
                  <th class="py-1.5 pr-4 font-medium">{ui.fieldLabel}</th>
                  <th class="py-1.5 font-medium">{ui.valueLabel}</th>
                </tr>
              </thead>
              <tbody class="font-mono">
                {table.map((row) => (
                  <tr class="border-t border-line">
                    <td class="whitespace-nowrap py-1.5 pr-4 font-sans text-muted">{row.label}</td>
                    <td class="break-all py-1.5 text-fg">{summarize(row.values)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p class="mt-3 text-xs text-subtle">{ui.ruleNote}</p>
            <p class="mt-2 text-xs text-subtle">{saveFailed ? '' : ui.autosaved}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/** Show a short range for a wide field instead of sixty numbers. */
function summarize(values: number[]): string {
  if (values.length > 8) {
    const step = values[1] - values[0];
    const evenStep = step > 1 && values.every((v, i) => i === 0 || v - values[i - 1] === step);
    const contiguous = values.every((v, i) => i === 0 || v === values[i - 1] + 1);
    if (contiguous) return `${values[0]}–${values.at(-1)}`;
    if (evenStep) return `${values[0]}–${values.at(-1)}/${step}`;
  }
  return values.join(', ');
}

import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateShift, calculateWeek, formatDecimalHours, formatMinutes, type ShiftInput } from './logic';

const STORAGE_KEY = 'tools:hours-calculator:week';

function standardWeek(): ShiftInput[] {
  return Array.from({ length: 7 }, (_, index) =>
    index < 5 ? { start: '09:00', end: '18:00', breakMinutes: 60 } : { start: '', end: '', breakMinutes: 0 },
  );
}

function emptyWeek(): ShiftInput[] {
  return Array.from({ length: 7 }, () => ({ start: '', end: '', breakMinutes: 0 }));
}

function isSavedWeek(value: unknown): value is ShiftInput[] {
  return (
    Array.isArray(value) &&
    value.length === 7 &&
    value.every(
      (shift) =>
        typeof shift?.start === 'string' && typeof shift?.end === 'string' && typeof shift?.breakMinutes === 'number',
    )
  );
}

export default function HoursCalculator({ ui }: ToolProps<UI>) {
  const [shifts, setShifts] = useState<ShiftInput[]>(standardWeek);
  const [restored, setRestored] = useState(false);
  const days = [ui.monday, ui.tuesday, ui.wednesday, ui.thursday, ui.friday, ui.saturday, ui.sunday];

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (isSavedWeek(saved)) setShifts(saved);
    } catch {
      // Ignore corrupted browser-local data and retain the useful standard week.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (restored) safeStorage.set(STORAGE_KEY, JSON.stringify(shifts));
  }, [restored, shifts]);

  const total = useMemo(() => calculateWeek(shifts), [shifts]);
  const updateShift = (index: number, update: Partial<ShiftInput>) => {
    setShifts((current) => current.map((shift, i) => (i === index ? { ...shift, ...update } : shift)));
  };
  const copyText = ui.copyTemplate
    .replace('{net}', formatMinutes(total.netMinutes))
    .replace('{decimal}', formatDecimalHours(total.netMinutes))
    .replace('{gross}', formatMinutes(total.grossMinutes))
    .replace('{break}', formatMinutes(total.breakMinutes));

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p class="text-sm text-muted">{ui.intro}</p>
        <div class="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShifts(standardWeek())}>
            {ui.standardWeek}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShifts(emptyWeek())}>
            {ui.clearWeek}
          </Button>
        </div>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="min-w-0">
          <div class="hidden sm:grid sm:grid-cols-[minmax(4rem,1fr)_minmax(5.5rem,1fr)_minmax(5.5rem,1fr)_minmax(4.5rem,0.8fr)_minmax(5rem,1fr)] gap-2 px-1 pb-2 text-xs text-subtle">
            <span>{ui.day}</span>
            <span>{ui.start}</span>
            <span>{ui.end}</span>
            <span>{ui.break}</span>
            <span>{ui.dailyTotal}</span>
          </div>
          <div class="space-y-2">
            {shifts.map((shift, index) => {
              const result = calculateShift(shift);
              const hasInput = shift.start !== '' || shift.end !== '' || shift.breakMinutes !== 0;
              const dayName = days[index];
              return (
                <div class="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[minmax(4rem,1fr)_minmax(5.5rem,1fr)_minmax(5.5rem,1fr)_minmax(4.5rem,0.8fr)_minmax(5rem,1fr)] items-center gap-2 rounded-md bg-surface-2 p-2">
                  <span class="row-span-2 sm:row-auto truncate text-sm font-medium text-fg">{dayName}</span>
                  <div>
                    <span class="mb-1 block text-[11px] text-subtle sm:hidden">{ui.start}</span>
                    <TextInput
                      type="time"
                      value={shift.start}
                      aria-label={ui.inputLabel.replace('{day}', dayName).replace('{field}', ui.start)}
                      onInput={(event) => updateShift(index, { start: event.currentTarget.value })}
                    />
                  </div>
                  <div>
                    <span class="mb-1 block text-[11px] text-subtle sm:hidden">{ui.end}</span>
                    <TextInput
                      type="time"
                      value={shift.end}
                      aria-label={ui.inputLabel.replace('{day}', dayName).replace('{field}', ui.end)}
                      onInput={(event) => updateShift(index, { end: event.currentTarget.value })}
                    />
                  </div>
                  <div class="col-start-2 sm:col-auto">
                    <span class="mb-1 block text-[11px] text-subtle sm:hidden">{ui.break}</span>
                    <NumberInput
                      value={shift.breakMinutes}
                      min={0}
                      max={1440}
                      step={1}
                      aria-label={ui.inputLabel.replace('{day}', dayName).replace('{field}', ui.break)}
                      onValue={(value) =>
                        updateShift(index, { breakMinutes: value === '' ? 0 : Math.max(0, Math.trunc(value)) })
                      }
                    />
                  </div>
                  <div class="min-w-0 text-right sm:text-left">
                    <span class="mb-1 block text-left text-[11px] text-subtle sm:hidden">{ui.dailyTotal}</span>
                    <span class="block truncate text-sm tabular text-fg">
                      {result ? formatMinutes(result.netMinutes) : hasInput ? ui.invalid : ui.empty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p class="mt-3 text-xs text-subtle">{ui.overnightHint}</p>
          {total.invalidDays > 0 && (
            <Notice tone="danger">{ui.invalidNotice.replace('{n}', String(total.invalidDays))}</Notice>
          )}
        </div>

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.netHours} value={formatMinutes(total.netMinutes)} emphasis />
            <Stat label={ui.decimalHours} value={formatDecimalHours(total.netMinutes)} emphasis />
            <Stat label={ui.grossHours} value={formatMinutes(total.grossMinutes)} />
            <Stat label={ui.breakTotal} value={formatMinutes(total.breakMinutes)} />
          </div>
          <div class="rounded-md border border-line bg-surface-2 px-3 py-2.5">
            <span class="block text-sm font-medium tabular text-fg">{total.workedDays}</span>
            <span class="text-xs text-muted">{ui.workedDays}</span>
          </div>
          <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          <Field label={ui.calculationLabel} hint={ui.calculationHint}>
            <span class="block text-sm text-fg">{ui.formula}</span>
          </Field>
          <p class="text-xs text-subtle">{ui.saved}</p>
        </div>
      </div>
    </Panel>
  );
}

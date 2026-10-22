import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, NumberInput, Panel, Segmented, Stat, TextInput, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  CALENDAR_LIMITS,
  convertLunarToSolar,
  convertSolarToLunar,
  lunarBirthdayOccurrences,
  type ConversionError,
  type ConversionValue,
  type ZodiacAnimal,
} from './logic';

type Direction = 'solar-to-lunar' | 'lunar-to-solar';

const STORAGE_KEY = 'tools:lunar-converter:input';
const DEFAULT_SOLAR_DATE = '2026-10-22';

interface StoredInput {
  direction: Direction;
  solarDate: string;
  lunarYear: number | '';
  lunarMonth: number | '';
  lunarDay: number | '';
  isLeapMonth: boolean;
}

function currentSolarDate(now: Date): string {
  const local = `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (local < CALENDAR_LIMITS.solarMin) return CALENDAR_LIMITS.solarMin;
  if (local > CALENDAR_LIMITS.solarMax) return CALENDAR_LIMITS.solarMax;
  return local;
}

export default function LunarConverter({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [direction, setDirection] = useState<Direction>('solar-to-lunar');
  const [solarDate, setSolarDate] = useState(DEFAULT_SOLAR_DATE);
  const [lunarYear, setLunarYear] = useState<number | ''>(2026);
  const [lunarMonth, setLunarMonth] = useState<number | ''>(8);
  const [lunarDay, setLunarDay] = useState<number | ''>(15);
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  useEffect(() => {
    const saved = safeStorage.get(STORAGE_KEY);
    let restored = false;
    if (saved) {
      try {
        const value = JSON.parse(saved) as Partial<StoredInput>;
        restored = true;
        if (value.direction === 'solar-to-lunar' || value.direction === 'lunar-to-solar') {
          setDirection(value.direction);
        }
        if (typeof value.solarDate === 'string') setSolarDate(value.solarDate);
        if (typeof value.lunarYear === 'number' || value.lunarYear === '') setLunarYear(value.lunarYear);
        if (typeof value.lunarMonth === 'number' || value.lunarMonth === '') setLunarMonth(value.lunarMonth);
        if (typeof value.lunarDay === 'number' || value.lunarDay === '') setLunarDay(value.lunarDay);
        if (typeof value.isLeapMonth === 'boolean') setIsLeapMonth(value.isLeapMonth);
      } catch {
        safeStorage.remove(STORAGE_KEY);
      }
    }
    if (!restored) setSolarDate(currentSolarDate(new Date()));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    safeStorage.set(
      STORAGE_KEY,
      JSON.stringify({ direction, solarDate, lunarYear, lunarMonth, lunarDay, isLeapMonth } satisfies StoredInput),
    );
  }, [ready, direction, solarDate, lunarYear, lunarMonth, lunarDay, isLeapMonth]);

  const result = useMemo(
    () =>
      direction === 'solar-to-lunar'
        ? convertSolarToLunar(solarDate)
        : convertLunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth),
    [direction, solarDate, lunarYear, lunarMonth, lunarDay, isLeapMonth],
  );

  const formatSolar = (iso: string) =>
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(
      new Date(`${iso}T12:00:00`),
    );

  const formatLunar = (value: ConversionValue) =>
    ui.lunarDateTemplate
      .replace('{year}', String(value.lunar.year))
      .replace('{month}', String(value.lunar.month))
      .replace('{day}', String(value.lunar.day))
      .replace('{leap}', value.lunar.isLeapMonth ? ui.leapPrefix : '')
      .replace('{monthType}', value.lunar.isLeapMonth ? ui.leapMonthShort : ui.regularMonth);

  const zodiacLabels: Record<ZodiacAnimal, string> = {
    rat: ui.animalRat,
    ox: ui.animalOx,
    tiger: ui.animalTiger,
    rabbit: ui.animalRabbit,
    dragon: ui.animalDragon,
    snake: ui.animalSnake,
    horse: ui.animalHorse,
    goat: ui.animalGoat,
    monkey: ui.animalMonkey,
    rooster: ui.animalRooster,
    dog: ui.animalDog,
    pig: ui.animalPig,
  };

  const errorText = (error: ConversionError) => {
    if (error === 'empty') return ui.invalidEmpty;
    if (error === 'format') return ui.invalidFormat;
    if (error === 'out-of-range') return ui.invalidRange;
    return ui.invalidDate;
  };

  const changeDirection = (next: Direction) => {
    if (next === direction) return;
    if (result.ok) {
      if (next === 'lunar-to-solar') {
        setLunarYear(result.value.lunar.year);
        setLunarMonth(result.value.lunar.month);
        setLunarDay(result.value.lunar.day);
        setIsLeapMonth(result.value.lunar.isLeapMonth);
      } else {
        setSolarDate(result.value.solarIso);
      }
    }
    setDirection(next);
  };

  const why = result.ok
    ? (direction === 'solar-to-lunar'
        ? result.value.lunar.isLeapMonth
          ? ui.whyLeap
          : ui.whyRegular
        : ui.whyLunarInput
      )
        .replace('{year}', String(result.value.lunar.year))
        .replace('{month}', String(result.value.lunar.month))
        .replace('{day}', String(result.value.lunar.day))
        .replace('{monthType}', result.value.lunar.isLeapMonth ? ui.leapMonthShort : ui.regularMonth)
    : '';

  const birthdays = result.ok
    ? lunarBirthdayOccurrences(result.value.lunar.month, result.value.lunar.day, result.value.lunar.isLeapMonth)
    : [];

  const copyText = result.ok
    ? ui.copyTemplate
        .replace('{solar}', formatSolar(result.value.solarIso))
        .replace('{lunar}', formatLunar(result.value))
        .replace('{ganji}', `${result.value.koreanGanji} · ${result.value.hanjaGanji}`)
        .replace('{zodiac}', zodiacLabels[result.value.zodiac])
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div class="flex flex-col gap-4">
          <Segmented
            value={direction}
            onValue={changeDirection}
            label={ui.directionLabel}
            options={[
              { value: 'solar-to-lunar', label: ui.solarToLunar },
              { value: 'lunar-to-solar', label: ui.lunarToSolar },
            ]}
          />

          {direction === 'solar-to-lunar' ? (
            <Field label={ui.solarDate} hint={ui.solarDateHint}>
              <TextInput
                type="date"
                min={CALENDAR_LIMITS.solarMin}
                max={CALENDAR_LIMITS.solarMax}
                value={solarDate}
                onInput={(event) => setSolarDate((event.currentTarget as HTMLInputElement).value)}
              />
            </Field>
          ) : (
            <>
              <div class="grid grid-cols-3 gap-2">
                <Field label={ui.lunarYear}>
                  <NumberInput
                    min={CALENDAR_LIMITS.lunarMinYear}
                    max={CALENDAR_LIMITS.lunarMaxYear}
                    step={1}
                    value={lunarYear}
                    onValue={setLunarYear}
                  />
                </Field>
                <Field label={ui.lunarMonth}>
                  <NumberInput min={1} max={12} step={1} value={lunarMonth} onValue={setLunarMonth} />
                </Field>
                <Field label={ui.lunarDay}>
                  <NumberInput min={1} max={30} step={1} value={lunarDay} onValue={setLunarDay} />
                </Field>
              </div>
              <p class="text-xs text-subtle">{ui.lunarDateHint}</p>
              <Toggle checked={isLeapMonth} onChecked={setIsLeapMonth} label={ui.leapMonth} />
            </>
          )}

          <p class="text-xs text-subtle">{ui.saved}</p>
        </div>

        <div class="flex flex-col gap-3" aria-live="polite">
          <h2 class="text-sm font-medium text-fg">{ui.resultHeading}</h2>
          {result.ok ? (
            <>
              <div class="grid grid-cols-2 gap-2">
                <Stat label={ui.solarResult} value={formatSolar(result.value.solarIso)} emphasis />
                <Stat label={ui.lunarResult} value={formatLunar(result.value)} emphasis />
                <Stat
                  label={ui.weekday}
                  value={new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
                    new Date(`${result.value.solarIso}T12:00:00`),
                  )}
                />
                <Stat label={ui.zodiac} value={zodiacLabels[result.value.zodiac]} />
              </div>
              <Stat label={ui.ganji} value={`${result.value.koreanGanji} · ${result.value.hanjaGanji}`} />
              <div>
                <h3 class="text-sm font-medium text-fg">{ui.whyHeading}</h3>
                <p class="mt-1 text-sm leading-6 text-muted">{why}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
                <span class="text-xs text-subtle">{ui.rangeChecked}</span>
              </div>
            </>
          ) : (
            <Notice tone="danger">{errorText(result.error)}</Notice>
          )}
        </div>
      </div>

      {result.ok && birthdays.length > 0 && (
        <div class="mt-6 border-t border-line pt-5">
          <h2 class="text-sm font-medium text-fg">{ui.birthdayHeading}</h2>
          <p class="mt-1 text-sm text-muted">{ui.birthdayIntro}</p>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            {birthdays.map((occurrence) => {
              const reasons = [
                occurrence.usedLeapMonth
                  ? ui.birthdayReasonLeap
                  : occurrence.leapFallback
                    ? ui.birthdayReasonLeapFallback
                    : ui.birthdayReasonExact,
                occurrence.shortMonthFallback ? ui.birthdayReasonShortMonth : '',
              ].filter(Boolean);
              return (
                <div class="rounded-lg border border-line bg-surface-2 p-3">
                  <Stat
                    label={ui.birthdayYear.replace('{year}', String(occurrence.lunarYear))}
                    value={formatSolar(occurrence.solarIso)}
                  />
                  <p class="mt-2 text-xs leading-5 text-muted">{reasons.join(' ')}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Panel>
  );
}

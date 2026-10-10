import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  ageBreakdown,
  daysLived,
  isValidDate,
  isZodiacBoundaryBirth,
  koreanCountingAge,
  koreanYearAge,
  nextBirthday,
  ordinalSuffix,
  starSign,
  todayIso,
  zodiacAnimal,
  type StarSign,
  type ZodiacAnimal,
} from './logic';

const STORAGE_KEY = 'tools:age-calculator:birthDate';
const DEFAULT_BIRTH_DATE = '2000-01-01';

export default function AgeCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [referenceDate, setReferenceDate] = useState(DEFAULT_BIRTH_DATE);

  useEffect(() => {
    const today = todayIso(Date.now());
    const saved = safeStorage.get(STORAGE_KEY);
    setBirthDate(saved && isValidDate(saved) ? saved : DEFAULT_BIRTH_DATE);
    setReferenceDate(today);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (isValidDate(birthDate)) safeStorage.set(STORAGE_KEY, birthDate);
  }, [ready, birthDate]);

  const n = (v: number) => formatNumber(v, locale);
  const formatLong = (iso: string) =>
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(
      new Date(`${iso}T00:00:00`),
    );
  const weekdayLong = (iso: string) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(`${iso}T00:00:00`));
  const ageLabel = (count: number) => `${n(count)}${count === 1 ? ui.ageUnitSingular : ui.ageUnitPlural}`;

  const valid = isValidDate(birthDate) && isValidDate(referenceDate);
  const futureBirth = valid && birthDate > referenceDate;

  const result = useMemo(() => {
    if (!valid || futureBirth) return null;
    const animalLabel: Record<ZodiacAnimal, string> = {
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
    const signLabel: Record<StarSign, string> = {
      aries: ui.signAries,
      taurus: ui.signTaurus,
      gemini: ui.signGemini,
      cancer: ui.signCancer,
      leo: ui.signLeo,
      virgo: ui.signVirgo,
      libra: ui.signLibra,
      scorpio: ui.signScorpio,
      sagittarius: ui.signSagittarius,
      capricorn: ui.signCapricorn,
      aquarius: ui.signAquarius,
      pisces: ui.signPisces,
    };
    const birthMonth = Number(birthDate.slice(5, 7));
    const birthDay = Number(birthDate.slice(8, 10));
    const birthYear = Number(birthDate.slice(0, 4));
    const referenceYear = Number(referenceDate.slice(0, 4));
    return {
      age: ageBreakdown(birthDate, referenceDate),
      countingAge: koreanCountingAge(birthYear, referenceYear),
      yearAge: koreanYearAge(birthYear, referenceYear),
      animal: animalLabel[zodiacAnimal(birthYear)],
      sign: signLabel[starSign(birthMonth, birthDay)],
      zodiacBoundary: isZodiacBoundaryBirth(birthMonth, birthDay),
      daysLived: daysLived(birthDate, referenceDate),
      next: nextBirthday(birthDate, referenceDate),
    };
  }, [valid, futureBirth, birthDate, referenceDate, ui]);

  const summary = result
    ? ui.summary
        .replace('{birth}', formatLong(birthDate))
        .replace('{weekday}', weekdayLong(birthDate))
        .replace('{reference}', formatLong(referenceDate))
        .replace('{intlAge}', n(result.age.years))
        .replace('{countingAge}', n(result.countingAge))
        .replace('{yearAge}', n(result.yearAge))
        .replace('{animal}', result.animal)
        .replace('{sign}', result.sign)
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div class="flex flex-col gap-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <Field label={ui.birthDate}>
              <TextInput
                type="date"
                value={birthDate}
                onInput={(e) => setBirthDate((e.currentTarget as HTMLInputElement).value)}
              />
            </Field>
            <Field label={ui.referenceDate} hint={ui.referenceHint}>
              <TextInput
                type="date"
                value={referenceDate}
                onInput={(e) => setReferenceDate((e.currentTarget as HTMLInputElement).value)}
              />
            </Field>
          </div>
          <div class="flex items-center justify-between gap-3">
            <Button size="sm" variant="secondary" onClick={() => setReferenceDate(todayIso(Date.now()))}>
              {ui.resetToday}
            </Button>
            <span class="text-xs text-subtle">{ui.autosaved}</span>
          </div>
          {!valid && <Notice tone="danger">{ui.invalidDate}</Notice>}
          {valid && futureBirth && <Notice tone="danger">{ui.futureBirth}</Notice>}
        </div>

        <div class="flex flex-col gap-3">
          {!result ? (
            <Notice tone="danger">{valid ? ui.futureBirth : ui.invalidDate}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.internationalAge} value={ageLabel(result.age.years)} emphasis />
                <Stat
                  label={ui.exactAge}
                  value={`${n(result.age.years)}${ui.yearUnit} ${n(result.age.months)}${ui.monthUnit} ${n(result.age.days)}${ui.dayUnit}`}
                />
                <Stat label={ui.countingAge} value={ageLabel(result.countingAge)} />
                <Stat label={ui.yearAge} value={ageLabel(result.yearAge)} />
                <Stat label={ui.zodiacAnimal} value={result.animal} />
                <Stat label={ui.starSign} value={result.sign} />
                <Stat
                  label={ui.daysLived}
                  value={`${n(result.daysLived)}${locale === 'en' ? ordinalSuffix(result.daysLived) : ''}${ui.daysLivedUnit}`}
                />
                <Stat
                  label={ui.nextBirthday}
                  value={
                    result.next.daysUntil === 0
                      ? ui.nextBirthdayToday
                      : (result.next.daysUntil === 1 ? ui.inDaySingular : ui.inDaysPlural).replace(
                          '{n}',
                          n(result.next.daysUntil),
                        )
                  }
                />
              </div>
              {result.zodiacBoundary && <Notice tone="info">{ui.zodiacBoundaryNotice}</Notice>}
              <div class="mt-1 flex items-center gap-2">
                <CopyButton text={summary} label={ui.copy} copiedLabel={ui.copied} />
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

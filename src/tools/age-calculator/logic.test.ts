import { describe, expect, it } from 'vitest';
import {
  ageBreakdown,
  daysBetween,
  daysLived,
  internationalAge,
  isValidDate,
  isZodiacBoundaryBirth,
  koreanCountingAge,
  koreanYearAge,
  nextBirthday,
  ordinalSuffix,
  starSign,
  todayIso,
  weekdayIndex,
  zodiacAnimal,
} from './logic';

describe('isValidDate', () => {
  it('accepts real calendar dates', () => {
    expect(isValidDate('2000-01-01')).toBe(true);
    expect(isValidDate('2024-02-29')).toBe(true); // leap day
  });

  it('rejects malformed or impossible dates', () => {
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('not-a-date')).toBe(false);
    expect(isValidDate('2023-02-29')).toBe(false); // not a leap year
    expect(isValidDate('2024-13-01')).toBe(false);
    expect(isValidDate('2024-04-31')).toBe(false);
  });
});

describe('ageBreakdown / internationalAge (만 나이)', () => {
  it('is 0 on the birth date itself', () => {
    expect(ageBreakdown('2000-05-15', '2000-05-15')).toEqual({ years: 0, months: 0, days: 0 });
  });

  it('turns a year older the day of the birthday, not before', () => {
    expect(internationalAge('2000-05-15', '2025-05-14')).toBe(24);
    expect(internationalAge('2000-05-15', '2025-05-15')).toBe(25);
  });

  it('clamps a Jan 31 birth span to the last day of a short month', () => {
    // Jan 31 -> Mar 1: adding 1 month lands on Feb 28/29 (no Jan 31 in Feb), so 1 remaining day.
    expect(ageBreakdown('2023-01-31', '2023-03-01')).toEqual({ years: 0, months: 1, days: 1 });
  });

  it('handles a Feb 29 birth measured in a non-leap year', () => {
    // 2000 was a leap year; 2025 is not, so the "birthday" clamps to Feb 28.
    expect(internationalAge('2000-02-29', '2025-02-28')).toBe(25);
    expect(internationalAge('2000-02-29', '2025-03-01')).toBe(25);
  });
});

describe('koreanCountingAge (세는 나이)', () => {
  it('starts at 1 in the birth year', () => {
    expect(koreanCountingAge(2000, 2000)).toBe(1);
  });

  it('becomes 2 the moment the calendar year changes, even a day after birth', () => {
    // A baby born 2000-12-31 is "두 살" on 2001-01-01, the textbook 세는나이 quirk.
    expect(koreanCountingAge(2000, 2001)).toBe(2);
  });
});

describe('koreanYearAge (연 나이)', () => {
  it('changes on January 1st regardless of the birthday', () => {
    expect(koreanYearAge(2005, 2025)).toBe(20);
    expect(koreanYearAge(2005, 2026)).toBe(21);
  });
});

describe('daysLived', () => {
  it('counts the birth date itself as day 1', () => {
    expect(daysLived('2024-01-01', '2024-01-01')).toBe(1);
  });

  it('matches the 백일 (100th day) convention: born Jan 1 -> 100th day is Apr 10 in a common year', () => {
    expect(daysLived('2023-01-01', '2023-04-10')).toBe(100);
  });
});

describe('daysBetween / weekdayIndex', () => {
  it('computes a signed day count', () => {
    expect(daysBetween('2024-01-01', '2024-01-11')).toBe(10);
    expect(daysBetween('2024-01-11', '2024-01-01')).toBe(-10);
  });

  it('matches a known weekday', () => {
    expect(weekdayIndex('2000-01-01')).toBe(6); // Saturday
  });
});

describe('nextBirthday', () => {
  it('is today with 0 days left when reference is the birthday', () => {
    expect(nextBirthday('2000-05-15', '2025-05-15')).toEqual({ date: '2025-05-15', daysUntil: 0 });
  });

  it('rolls over to next year once the birthday has passed', () => {
    expect(nextBirthday('2000-05-15', '2025-05-16').date).toBe('2026-05-15');
  });

  it('observes Feb 28 for a Feb 29 birthday in a non-leap target year', () => {
    expect(nextBirthday('2000-02-29', '2025-01-01').date).toBe('2025-02-28');
    expect(nextBirthday('2000-02-29', '2024-01-01').date).toBe('2024-02-29');
  });
});

describe('zodiacAnimal (띠)', () => {
  it('matches verified recent anchor years', () => {
    expect(zodiacAnimal(2020)).toBe('rat');
    expect(zodiacAnimal(2024)).toBe('dragon');
    expect(zodiacAnimal(2025)).toBe('snake');
    expect(zodiacAnimal(2026)).toBe('horse');
  });

  it('repeats every 12 years in both directions', () => {
    expect(zodiacAnimal(2008)).toBe('rat');
    expect(zodiacAnimal(1900)).toBe(zodiacAnimal(1900 + 12 * 20));
  });
});

describe('starSign (별자리)', () => {
  it('handles ordinary ranges', () => {
    expect(starSign(7, 1)).toBe('cancer');
    expect(starSign(12, 25)).toBe('capricorn');
  });

  it('handles the boundary days exactly', () => {
    expect(starSign(3, 20)).toBe('pisces');
    expect(starSign(3, 21)).toBe('aries');
  });

  it('wraps Capricorn across the new year', () => {
    expect(starSign(1, 1)).toBe('capricorn');
    expect(starSign(1, 19)).toBe('capricorn');
    expect(starSign(1, 20)).toBe('aquarius');
    expect(starSign(12, 22)).toBe('capricorn');
  });
});

describe('ordinalSuffix', () => {
  it('handles the common cases', () => {
    expect(ordinalSuffix(1)).toBe('st');
    expect(ordinalSuffix(2)).toBe('nd');
    expect(ordinalSuffix(3)).toBe('rd');
    expect(ordinalSuffix(4)).toBe('th');
  });

  it('handles the 11/12/13 exception', () => {
    expect(ordinalSuffix(11)).toBe('th');
    expect(ordinalSuffix(12)).toBe('th');
    expect(ordinalSuffix(13)).toBe('th');
  });

  it('handles large numbers by their last two digits', () => {
    expect(ordinalSuffix(21)).toBe('st');
    expect(ordinalSuffix(111)).toBe('th');
    expect(ordinalSuffix(9781)).toBe('st');
  });
});

describe('isZodiacBoundaryBirth', () => {
  it('flags January and early February births', () => {
    expect(isZodiacBoundaryBirth(1, 1)).toBe(true);
    expect(isZodiacBoundaryBirth(1, 31)).toBe(true);
    expect(isZodiacBoundaryBirth(2, 5)).toBe(true);
  });

  it('does not flag the rest of the year', () => {
    expect(isZodiacBoundaryBirth(2, 6)).toBe(false);
    expect(isZodiacBoundaryBirth(12, 31)).toBe(false);
  });
});

describe('todayIso', () => {
  it('formats a timestamp as a local YYYY-MM-DD string', () => {
    expect(todayIso(new Date(2026, 9, 11).getTime())).toBe('2026-10-11');
  });
});

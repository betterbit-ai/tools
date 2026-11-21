import { describe, expect, it } from 'vitest';
import {
  cityFromInput,
  formatOffset,
  isNearOffsetTransition,
  readZoneInput,
  resolveCity,
  resolveLocalTime,
  searchCities,
  zonedParts,
  zoneOffsetMs,
} from './logic';

describe('time-zone-converter', () => {
  it('finds cities by Korean, English, and IANA identifiers', () => {
    expect(searchCities('뉴욕', 'ko').map((city) => city.zone)).toContain('America/New_York');
    expect(searchCities('são', 'en').map((city) => city.zone)).toContain('America/Sao_Paulo');
    expect(searchCities('Asia/Seoul', 'en').map((city) => city.zone)).toContain('Asia/Seoul');
    expect(cityFromInput('America/New_York', 'ko')?.en).toBe('New York');
    expect(searchCities('🕒', 'en')).toEqual([]);
  });

  it('resolves a typed city name or alias, and refuses an ambiguous fragment', () => {
    expect(resolveCity('뉴욕', 'ko')?.zone).toBe('America/New_York');
    expect(resolveCity('Tokyo', 'ko')?.zone).toBe('Asia/Tokyo');
    expect(resolveCity('  nyc ', 'en')?.zone).toBe('America/New_York');
    expect(resolveCity('서울, 대한민국 — Asia/Seoul', 'ko')?.zone).toBe('Asia/Seoul');
    expect(resolveCity('아시아', 'ko')).toBeUndefined();
    expect(resolveCity('미국', 'ko')).toBeUndefined();
    expect(resolveCity('', 'ko')).toBeUndefined();
  });

  it('reads a city field the way people type into it, and returns the label to show', () => {
    expect(readZoneInput('Tokyo', 'en')).toEqual({ zone: 'Asia/Tokyo', label: 'Tokyo, Japan — Asia/Tokyo' });
    expect(readZoneInput('도쿄', 'ko')).toEqual({ zone: 'Asia/Tokyo', label: '도쿄, 일본 — Asia/Tokyo' });
    expect(readZoneInput('  seoul  ', 'en')?.zone).toBe('Asia/Seoul');
    expect(readZoneInput('Europe/London', 'en')).toEqual({
      zone: 'Europe/London',
      label: 'London, United Kingdom — Europe/London',
    });
    expect(readZoneInput('UTC', 'ko')?.zone).toBe('UTC');
    // Partial and ambiguous text stays unresolved instead of jumping to a guess.
    expect(readZoneInput('', 'en')).toBeUndefined();
    expect(readZoneInput('zzz', 'en')).toBeUndefined();
    expect(readZoneInput('미국', 'ko')).toBeUndefined();
    // A fixed offset is not a zone this converter can apply DST rules to.
    expect(readZoneInput('UTC+09:00', 'en')).toBeUndefined();
  });

  it('converts standard-time and fractional UTC offsets', () => {
    const resolved = resolveLocalTime('2026-01-15', '09:00', 'Asia/Seoul');
    expect(resolved.status).toBe('valid');
    expect(zonedParts(resolved.instant!, 'America/New_York')).toMatchObject({
      year: 2026,
      month: 1,
      day: 14,
      hour: 19,
      minute: 0,
    });
    expect(formatOffset(zoneOffsetMs(resolved.instant!, 'Asia/Kathmandu'))).toBe('UTC+05:45');
  });

  it('applies DST and identifies skipped and repeated local wall times', () => {
    const summer = resolveLocalTime('2026-07-15', '09:00', 'America/New_York');
    expect(zonedParts(summer.instant!, 'Asia/Seoul')).toMatchObject({
      year: 2026,
      month: 7,
      day: 15,
      hour: 22,
      minute: 0,
    });
    expect(resolveLocalTime('2026-03-08', '02:30', 'America/New_York').status).toBe('nonexistent');
    const repeated = resolveLocalTime('2026-11-01', '01:30', 'America/New_York');
    expect(repeated.status).toBe('ambiguous');
    expect(repeated.alternatives).toHaveLength(2);
    expect(isNearOffsetTransition(repeated.instant!, 'America/New_York')).toBe(true);
  });

  it('rejects malformed dates, times, and unsupported zones', () => {
    expect(resolveLocalTime('', '', 'Asia/Seoul').status).toBe('invalid');
    expect(resolveLocalTime('2026-02-30', '09:00', 'Asia/Seoul').status).toBe('invalid');
    expect(resolveLocalTime('2026-01-01', '24:00', 'Asia/Seoul').status).toBe('invalid');
    expect(resolveLocalTime('2026-01-01', '09:00', 'EST').status).toBe('invalid');
    expect(resolveLocalTime('2026-01-01', '09:00', 'Not/A_Zone').status).toBe('invalid');
  });
});

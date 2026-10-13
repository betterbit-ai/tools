import { describe, expect, it } from 'vitest';
import { calculateGpa, gradePoint, isValidCourse, MAX_COURSES, MAX_CREDITS_PER_COURSE } from './logic';

describe('calculateGpa', () => {
  it('weights each grade by its credits on all three scales', () => {
    const result = calculateGpa([
      { credits: 3, grade: 'A+' },
      { credits: 3, grade: 'B+' },
      { credits: 2, grade: 'A0' },
    ]);

    expect(result).toMatchObject({
      gpas: { '4.5': 4, '4.3': 3.85, '4.0': 3.7375 },
      qualityPoints: { '4.5': 32, '4.3': 30.8, '4.0': 29.9 },
      gpaCredits: 8,
      passCredits: 0,
      courseCount: 3,
    });
  });

  it('excludes pass grades from GPA while reporting their completed credits', () => {
    const result = calculateGpa([
      { credits: 3, grade: 'A0' },
      { credits: 2, grade: 'P' },
      { credits: 1, grade: 'F' },
    ]);

    expect(result).toMatchObject({
      gpas: { '4.5': 3, '4.3': 3, '4.0': 3 },
      gpaCredits: 4,
      passCredits: 2,
    });
  });

  it('returns no GPA when every course is pass/fail', () => {
    expect(calculateGpa([{ credits: 3, grade: 'P' }])).toMatchObject({
      gpas: { '4.5': null, '4.3': null, '4.0': null },
      gpaCredits: 0,
      passCredits: 3,
    });
  });

  it('rejects empty, zero, oversized, non-finite, and unsupported inputs', () => {
    expect(calculateGpa([])).toBeNull();
    expect(calculateGpa([{ credits: 0, grade: 'A0' }])).toBeNull();
    expect(calculateGpa([{ credits: MAX_CREDITS_PER_COURSE + 0.1, grade: 'A0' }])).toBeNull();
    expect(calculateGpa([{ credits: Infinity, grade: 'A0' }])).toBeNull();
    expect(calculateGpa([{ credits: 3, grade: 'S' as never }])).toBeNull();
    expect(
      calculateGpa(Array.from({ length: MAX_COURSES + 1 }, () => ({ credits: 1, grade: 'A0' as const }))),
    ).toBeNull();
  });
});

describe('grade tables', () => {
  it('handles plus, zero, minus, and fail grade rules without a multiplier conversion', () => {
    expect(gradePoint('4.5', 'A+')).toBe(4.5);
    expect(gradePoint('4.3', 'B+')).toBe(3.3);
    expect(gradePoint('4.0', 'A+')).toBe(4);
    expect(gradePoint('4.0', 'F')).toBe(0);
    expect(gradePoint('4.5', 'P')).toBeNull();
  });

  it('does not let Korean or emoji course names change a course calculation', () => {
    const course = { credits: 3, grade: 'A+' as const, name: '미적분 😀' };
    expect(isValidCourse(course)).toBe(true);
    expect(calculateGpa([course])).toMatchObject({ gpas: { '4.5': 4.5, '4.3': 4.3, '4.0': 4 } });
  });
});

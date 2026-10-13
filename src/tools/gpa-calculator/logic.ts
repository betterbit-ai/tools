/** Pure GPA calculations. Grade points follow common 4.5, 4.3, and 4.0 tables. */

export const SCALES = ['4.5', '4.3', '4.0'] as const;
export type Scale = (typeof SCALES)[number];

export const GRADES = ['A+', 'A0', 'A-', 'B+', 'B0', 'B-', 'C+', 'C0', 'C-', 'D+', 'D0', 'D-', 'F', 'P'] as const;
export type Grade = (typeof GRADES)[number];

export interface GpaCourse {
  credits: number;
  grade: Grade;
}

export interface GpaResult {
  gpas: Record<Scale, number | null>;
  qualityPoints: Record<Scale, number>;
  gpaCredits: number;
  passCredits: number;
  courseCount: number;
}

export const MAX_CREDITS_PER_COURSE = 100;
export const MAX_COURSES = 100;

const POINTS: Record<Scale, Record<Grade, number | null>> = {
  '4.5': {
    'A+': 4.5,
    A0: 4,
    'A-': 3.7,
    'B+': 3.5,
    B0: 3,
    'B-': 2.7,
    'C+': 2.5,
    C0: 2,
    'C-': 1.7,
    'D+': 1.5,
    D0: 1,
    'D-': 0.7,
    F: 0,
    P: null,
  },
  '4.3': {
    'A+': 4.3,
    A0: 4,
    'A-': 3.7,
    'B+': 3.3,
    B0: 3,
    'B-': 2.7,
    'C+': 2.3,
    C0: 2,
    'C-': 1.7,
    'D+': 1.3,
    D0: 1,
    'D-': 0.7,
    F: 0,
    P: null,
  },
  '4.0': {
    'A+': 4,
    A0: 4,
    'A-': 3.7,
    'B+': 3.3,
    B0: 3,
    'B-': 2.7,
    'C+': 2.3,
    C0: 2,
    'C-': 1.7,
    'D+': 1.3,
    D0: 1,
    'D-': 0.7,
    F: 0,
    P: null,
  },
};

/** Returns a scale's point for a letter grade; P has no GPA point. */
export function gradePoint(scale: Scale, grade: Grade): number | null {
  return POINTS[scale][grade];
}

/** Calculates credit-weighted GPA on all three common scales from the same courses. */
export function calculateGpa(courses: GpaCourse[]): GpaResult | null {
  if (!Array.isArray(courses) || courses.length === 0 || courses.length > MAX_COURSES) return null;

  let gpaCredits = 0;
  let passCredits = 0;
  const qualityPoints: Record<Scale, number> = { '4.5': 0, '4.3': 0, '4.0': 0 };

  for (const course of courses) {
    if (!isValidCourse(course)) return null;
    if (course.grade === 'P') {
      passCredits += course.credits;
      continue;
    }

    gpaCredits += course.credits;
    for (const scale of SCALES) qualityPoints[scale] += gradePoint(scale, course.grade)! * course.credits;
  }

  if (!Number.isFinite(gpaCredits) || !Number.isFinite(passCredits)) return null;
  for (const scale of SCALES) qualityPoints[scale] = round(qualityPoints[scale]);
  const gpas = Object.fromEntries(
    SCALES.map((scale) => [scale, gpaCredits === 0 ? null : round(qualityPoints[scale] / gpaCredits)]),
  ) as Record<Scale, number | null>;

  return { gpas, qualityPoints, gpaCredits, passCredits, courseCount: courses.length };
}

/** A course must have a positive, finite credit value and a supported grade. */
export function isValidCourse(course: GpaCourse): boolean {
  return (
    !!course &&
    typeof course.credits === 'number' &&
    Number.isFinite(course.credits) &&
    course.credits > 0 &&
    course.credits <= MAX_CREDITS_PER_COURSE &&
    (GRADES as readonly string[]).includes(course.grade)
  );
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * 1_000_000) / 1_000_000;
}

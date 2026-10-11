/**
 * Curated "Popular" row on the home page — manually chosen, not derived from
 * analytics we don't have yet. Keep at most 12 and spread across categories so
 * the row doesn't read as one-category spam. Order is display order.
 * Validated against the registry in tests/home.test.ts.
 */
export const POPULAR_SLUGS: string[] = [
  'timer',
  'word-counter',
  'image-resizer',
  'qr-code-generator',
  'password-generator',
  'bmi-calculator',
  'percentage-calculator',
  'json-formatter',
  'age-calculator',
  'pomodoro-timer',
  'image-compressor',
  'base64',
];

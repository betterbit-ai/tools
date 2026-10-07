/**
 * Supported locales. Adding a locale here makes TypeScript flag every tool,
 * category and UI string that is missing a translation (`Record<Locale, …>`).
 *
 * The default locale lives at the URL root (`/timer`); others are prefixed (`/ko/timer`).
 */
export const LOCALES = ['en', 'ko'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_META: Record<Locale, { label: string; htmlLang: string; ogLocale: string }> = {
  en: { label: 'English', htmlLang: 'en', ogLocale: 'en_US' },
  ko: { label: '한국어', htmlLang: 'ko', ogLocale: 'ko_KR' },
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

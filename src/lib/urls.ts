import { SITE_URL } from '../config/site';
import { DEFAULT_LOCALE, type Locale } from '../i18n/locales';

/**
 * Build a site-relative path for a locale. `segments` are joined with `/`.
 * localePath('en')               -> '/'
 * localePath('ko')               -> '/ko'
 * localePath('ko', 'timer', '5-minutes') -> '/ko/timer/5-minutes'
 */
export function localePath(locale: Locale, ...segments: string[]): string {
  const parts = locale === DEFAULT_LOCALE ? segments : [locale, ...segments];
  const path = '/' + parts.filter(Boolean).join('/');
  return path;
}

/** Absolute URL for canonical / hreflang / sitemap / JSON-LD. */
export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, '');
  return path === '/' ? base + '/' : base + path;
}

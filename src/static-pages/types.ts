import type { Locale } from '../i18n/locales';

export interface StaticPageSection {
  heading: string;
  /** Paragraphs separated by `\n\n`, rendered the same way as tool `sections`. */
  body: string;
}

export interface StaticPageContent {
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: StaticPageSection[];
  /** ISO date (YYYY-MM-DD). Shown on the page and used as sitemap lastmod. */
  updated: string;
}

export type StaticPageId = 'about' | 'privacy' | 'terms' | 'contact';

export type StaticPageModule = Record<Locale, StaticPageContent>;

import { ORG_NAME, SITE_NAME } from '../config/site';
import { LOCALES, type Locale } from '../i18n/locales';
import { absoluteUrl, localePath } from './urls';
import type { FaqItem } from '../tools/types';

/** Alternate URLs for hreflang. `segments` are the locale-independent path parts. */
export function alternates(segments: string[], locales: readonly Locale[] = LOCALES) {
  return locales.map((locale) => ({ locale, href: absoluteUrl(localePath(locale, ...segments)) }));
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqLd(faq: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function webAppLd(opts: {
  name: string;
  description: string;
  path: string;
  locale: Locale;
  category: string;
  features: string[];
  updated: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    inLanguage: opts.locale,
    applicationCategory: opts.category,
    operatingSystem: 'Any (web browser)',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: opts.features,
    dateModified: opts.updated,
    publisher: { '@type': 'Organization', name: ORG_NAME },
  };
}

export function websiteLd(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description,
    url: absoluteUrl(localePath(locale)),
    inLanguage: locale,
  };
}

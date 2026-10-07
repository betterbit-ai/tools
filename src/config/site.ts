/**
 * Site-wide constants. Canonical URLs, hreflang, sitemap and JSON-LD all derive
 * from SITE_URL. Keep it in sync with the custom domain in wrangler.jsonc.
 */
export const SITE_URL = process.env.SITE_URL ?? 'https://betterbit.org';

export const SITE_NAME = 'Betterbit Tools';

/** Shown in JSON-LD `publisher` / `author`. */
export const ORG_NAME = 'Betterbit';

/**
 * Search-engine ownership verification <meta> tags. Paste only the `content` value.
 * Google: prefer the DNS (domain property) method; use this only for a URL-prefix property.
 */
export const SITE_VERIFICATION = {
  google: '',
  naver: '',
  bing: '',
};

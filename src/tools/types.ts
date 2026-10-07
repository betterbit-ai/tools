import type { Locale } from '../i18n/locales';
import type { CategoryId } from './categories';

/**
 * Every tool must beat existing tools on at least one axis.
 * `edges` is validated by tests/registry.test.ts — an empty list fails CI.
 */
export type EdgeKind =
  | 'privacy' // processes locally, nothing uploaded
  | 'no-ads'
  | 'performance'
  | 'usability'
  | 'design'
  | 'features' // capability competitors lack or paywall
  | 'accuracy'
  | 'offline'
  | 'no-signup';

export interface Competitor {
  name: string;
  url: string;
  /** What is concretely worse there. Be specific: "uploads files to server, 5/day limit". */
  weakness: string;
}

export interface ToolMeta {
  /** URL slug, kebab-case, English, matches folder name. Never change after launch. */
  slug: string;
  category: CategoryId;
  /** Emoji-free icon name from src/components/site/Icon.astro. */
  icon: string;
  /** ISO date first published. */
  added: string;
  /** ISO date of last meaningful change (shown on page, used in sitemap lastmod). */
  updated: string;
  /** Axes where we beat competitors. At least one. */
  edges: EdgeKind[];
  /** Researched competitors and their concrete weaknesses. At least one. */
  competitors: Competitor[];
  /** Slugs of related tools (internal links). Must exist in registry. */
  related: string[];
  /**
   * Preset landing pages for high-volume long-tail queries (e.g. "5 minute timer").
   * Each one must give the tool a meaningfully different starting state.
   */
  variants?: ToolVariant[];
}

export interface ToolVariant {
  /** Sub-slug: /<tool>/<variant>. */
  slug: string;
  /** Passed to the tool component as `preset`. */
  preset: Record<string, unknown>;
  content: Record<Locale, VariantContent>;
}

export interface VariantContent {
  title: string;
  description: string;
  h1: string;
  intro: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ToolContent<UI extends Record<string, string> = Record<string, string>> {
  /** <title>. Lead with the primary keyword. ~30–60 chars. */
  title: string;
  /** <meta description>. Answer the query + state the edge. ~70–160 chars. */
  description: string;
  /** Visible H1. Primary keyword, natural phrasing. */
  h1: string;
  /** One sentence under H1. */
  tagline: string;
  /** Short name for cards, breadcrumbs, related links. */
  name: string;
  /** Extra search phrasings used by on-site search (not meta keywords). */
  keywords: string[];
  /** 3–6 imperative steps. */
  howTo: string[];
  /**
   * Explanatory sections below the tool. Plain text paragraphs, `\n\n` separated.
   * Must contain real, specific information (formulas, limits, tips) — no filler.
   */
  sections: { heading: string; body: string }[];
  /** 3–8 real questions people ask. Answers self-contained (GEO: LLMs quote these). */
  faq: FaqItem[];
  /** Strings used inside the interactive component. */
  ui: UI;
}

export interface ToolProps<UI extends Record<string, string> = Record<string, string>> {
  locale: Locale;
  ui: UI;
  preset?: Record<string, unknown>;
}

export interface ToolModule {
  meta: ToolMeta;
  content: Record<Locale, ToolContent>;
  /** src/tools/<slug>/Island.astro — hydrates Tool.tsx (Astro needs a static import for client:*). */
  Island: (props: ToolProps<any>) => unknown;
}

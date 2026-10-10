import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  // Every string rendered inside Tool.tsx goes here. TODO
  example: 'TODO',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'TODO — primary keyword first, 30–60 chars',
    description: 'TODO — answer the query and state the edge, 90–160 chars.',
    h1: 'TODO',
    tagline: 'TODO',
    name: 'TODO',
    keywords: ['TODO'],
    howTo: ['TODO'],
    sections: [{ heading: 'TODO', body: 'TODO' }],
    faq: [{ q: 'TODO?', a: 'TODO' }],
    ui: uiEn,
  },
  ko: {
    title: 'TODO',
    description: 'TODO',
    h1: 'TODO',
    tagline: 'TODO',
    name: 'TODO',
    keywords: ['TODO'],
    howTo: ['TODO'],
    sections: [{ heading: 'TODO', body: 'TODO' }],
    faq: [{ q: 'TODO?', a: 'TODO' }],
    ui: { example: 'TODO' },
  },
};

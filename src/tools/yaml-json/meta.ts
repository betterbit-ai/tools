import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'yaml-json',
  category: 'developer',
  icon: 'convert',
  added: '2026-11-28',
  updated: '2026-11-28',
  edges: ['privacy', 'features'],
  competitors: [
    {
      name: 'Prettify YAML to JSON',
      url: 'https://prettify.tools/yaml-to-json',
      weakness:
        'Its own notes say the box reads documents up to 512 KB, converts only the first document of a multi-document file, and that an integer past 9007199254740991 loses its last digits with no warning shown. Betterbit reads every document into one array and names the line of an unsafe integer. (Strength: it states its rules for dates, yes/no and numbers very clearly.)',
    },
    {
      name: 'Web Convert YAML → JSON',
      url: 'https://web-convert.com/ko/json/yaml-to-json',
      weakness:
        'Its Korean FAQ answers that only the first document of a --- stream is converted, so a multi-resource Kubernetes file silently loses resources, and every conversion needs a click on the 변환 button. Betterbit converts as you type and keeps all documents. (Strength: a Korean walkthrough and processing that stays in the browser.)',
    },
    {
      name: 'SimpleLocalize YAML to JSON',
      url: 'https://simplelocalize.io/convert/yaml-to-json/',
      weakness:
        'The file is uploaded and converted by their server, in a tool built around translation files with a 5 MB limit and a source-language step. Betterbit parses in the tab, with no language or account step. (Strength: it can flatten nested keys and handle plurals for i18n work.)',
    },
    {
      name: 'Handio YAML을 JSON으로 변환기',
      url: 'https://handio.org/ko/yaml-to-json/',
      weakness:
        'Its FAQ says anchors and custom tags are resolved "when possible" and it says nothing about << merge keys or several documents, so Compose files and multi-document manifests are unverified there. Betterbit applies merge keys and reports how many were applied. (Strength: it names js-yaml as its engine and gives a Korean explanation.)',
    },
  ],
  related: ['json-formatter', 'csv-json', 'text-diff', 'sql-formatter'],
};

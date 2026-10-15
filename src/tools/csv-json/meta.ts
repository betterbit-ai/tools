import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'csv-json',
  category: 'developer',
  icon: 'convert',
  added: '2026-10-15',
  updated: '2026-10-15',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'csvkit.org CSV to JSON',
      url: 'https://csvkit.org/csv-to-json',
      weakness:
        'Its opened CSV-to-JSON page is a one-way converter: it exposes JSON array/JSON Lines and pretty-print controls, but no in-place JSON → CSV direction or table preview to inspect converted columns before copying. Betterbit keeps both directions in one live workspace and shows the first 10 rows as a table. (Strength: it offers JSON Lines output and delimiter auto-detection.)',
    },
    {
      name: 'jsonfmt.dev CSV to JSON Converter',
      url: 'https://jsonfmt.dev/csv-to-json',
      weakness:
        'The opened page directs users to a separate converter and describes getting JSON “in one click”; its visible CSV page has no converted-row table for checking headers, later columns, or blank cells before export. Betterbit updates both directions live and previews 10 converted rows. (Strength: it documents type detection and quoted multiline fields.)',
    },
    {
      name: 'The JSON Converter — CSV to JSON',
      url: 'https://thejsonconverter.com/csv-to-json/',
      weakness:
        'Its current page requires a separate Process click, accepts comma-separated input only, and always treats the first row as headers. Betterbit converts while typing, supports comma/semicolon/tab/pipe choices, and can produce an array of arrays for headerless data. (Strength: it can switch its finished JSON output to a tree view.)',
    },
    {
      name: '툴타다 CSV JSON 변환기',
      url: 'https://tooltada.com/csvjson/',
      weakness:
        'The Korean result presents an explicit “변환” button after its CSV ↔ JSON settings and does not show a converted table in the visible tool controls. Betterbit converts on input and keeps a 10-row table preview alongside copy and download. (Strength: it offers a headerless option and numeric/boolean inference.)',
    },
    {
      name: '세상의 모든 유틸 CSV JSON 변환기',
      url: 'https://every-util.com/csv-json/',
      weakness:
        'Its result area is a text output workflow; the opened Korean search result lists no table preview for validating the converted columns and rows before saving. Betterbit makes that check visible with a 10-row preview in both directions. (Strength: it offers UTF-8 BOM download for Excel.)',
    },
    {
      name: 'Toolevia CSV–JSON 변환기',
      url: 'https://toolevia.com/ko/csv-to-json/',
      weakness:
        'Its Korean page supports live conversion and conservative type handling, but its exposed controls end at text output and do not provide a converted-row table. Betterbit adds the visible 10-row preview without adding a second conversion step. (Strength: it explains the risk of converting 007 and 1e3 to numbers.)',
    },
  ],
  related: ['json-formatter', 'url-encoder', 'base64', 'regex-tester'],
};

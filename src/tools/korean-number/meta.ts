import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'korean-number',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-15',
  updated: '2026-10-15',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'Hangeul Tool — Korean Number Converter',
      url: 'https://hangeul-tool.com/en/tools/korean-number',
      weakness:
        'Its English page gives Sino/native readings and counter forms, but sends visitors to a separate Korean-language converter for a contract amount. Betterbit keeps plain Korean, 금 … 원정, and 일금 … 원정 as immediate copy results in one input view. (Strength: it teaches native-number counters and pronunciation in depth.)',
    },
    {
      name: 'Korean TokTok — Korean Number Converter',
      url: 'https://koreantoktok.com/en/tools/number-converter',
      weakness:
        'Its result shows Sino-Korean, native Korean, and example counters but does not provide a copyable Korean won document string with 원정. Betterbit is focused on a numeric KRW amount and exposes both 금 and 일금 formats beside the everyday result. (Strength: it clearly compares the two Korean number systems.)',
    },
    {
      name: 'FreeSign — Amount to Korean',
      url: 'https://freesign.kr/en/tools/money-korean/',
      weakness:
        'Its English results focus on one formal “일금 … 원정” contract notation and one Korean notation. Betterbit shows four separately copyable outputs, including both 금 and 일금 prefixes, while accepting commas, ₩, 원, and full-width digits. (Strength: it explicitly names contracts, tax invoices, and quotations.)',
    },
    {
      name: 'Tooldeb — 금액 한글 변환기',
      url: 'https://tooldeb.com/number-to-korean-currency/',
      weakness:
        'It documents one ordinary amount and one 일금 contract form, with decimal values discarded. Betterbit rejects a decimal instead of silently changing it, and makes plain, full-amount, 금, and 일금 results independently copyable. (Strength: it concisely explains its truncation behavior.)',
    },
    {
      name: '공무툴즈 — 금액 한글 표기',
      url: 'https://gongmu-tools.kamu.kr/amount-hangul/',
      weakness:
        'Its opening workflow is a multi-line batch converter with several document-style switches and VAT assistance. Betterbit gives one amount a compact live set of four copy forms without requiring a style decision first. (Strength: it supports batch paste, CSV export, amount checking, and administrative-document options.)',
    },
    {
      name: 'KdocTool — 금액 한글 변환기',
      url: 'https://kdoctool.kr/tools/amount-korean-converter/',
      weakness:
        'Its visible result presents one “금 … 원정” document line plus a Korean amount, while its scope excludes decimals and negatives. Betterbit additionally exposes an 일금 form and accepts full-width digits, ₩, and a trailing 원 in pasted input. (Strength: it links directly into invoice and quotation workflows.)',
    },
  ],
  related: ['number-base-converter', 'vat-calculator', 'scientific-calculator'],
};

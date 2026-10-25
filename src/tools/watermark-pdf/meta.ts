import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'watermark-pdf',
  category: 'pdf',
  icon: 'sparkle',
  added: '2026-10-26',
  updated: '2026-10-26',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: '123apps Add Watermark to PDF',
      url: 'https://123apps.dev/pdf/pdf-watermark/',
      weakness:
        'Its opened English page offers text or image, single or tiled layouts, and only a continuous From page/To page interval. This tool also accepts non-contiguous page lists such as 1-3, 5 and odd/even pages. (Strength: it has a first-page live preview and an explicit font picker.)',
    },
    {
      name: 'SortMyPDF Watermark PDF',
      url: 'https://www.sortmypdf.com/watermark-pdf',
      weakness:
        'Its current result page presents a text watermark field with position, font size, and opacity, then an explicit Add Watermark action; it describes applying the mark to every page. It does not show a page-range or odd/even control in that flow. (Strength: it presents a simple focused text-stamp interface and says it processes locally.)',
    },
    {
      name: 'Private PDF Add a Watermark to a PDF',
      url: 'https://private-pdf.com/watermark-pdf',
      weakness:
        'Its current English result page exposes a text overlay with opacity and angle, and describes applying it across every page. It does not offer an image-logo mode, repeat pattern, or selected-page control in the visible workflow. (Strength: it is also browser-local and clearly explains that the original PDF is not uploaded.)',
    },
    {
      name: 'Grepfit PDF 워터마크 넣기',
      url: 'https://grepfit.com/categories/pdf-watermark/',
      weakness:
        'Its opened Korean result describes text/logo modes, color, a preview, page ranges, and center, tiled, or corner placement. Its image-logo description recolors the logo silhouette rather than preserving the source image color. (Strength: it exposes a visual preview and several placement presets.)',
    },
    {
      name: 'iLovePDF PDF에 워터마크 추가',
      url: 'https://www.ilovepdf.com/ko/pdf_add_watermark',
      weakness:
        'Its opened Korean page shows an upload state, upload speed, “uploaded” state, and “adding watermark” processing stage, and its pricing page says free document processing is limited while Premium is unlimited. This tool processes a PDF on-device, so there is no upload wait or third-party document transfer. (Strength: it has Drive/Dropbox import, layer placement, and a broad font list.)',
    },
    {
      name: 'moamoang PDF 워터마크 넣기',
      url: 'https://moamoang.co.kr/pdf-watermark/',
      weakness:
        'Its opened Korean result supports text/logo marks, a preview, whole/odd/even/custom pages, and says Korean text is rasterized. Its logo workflow includes a “make white background transparent” option; this tool instead keeps PNG, JPG, and WebP logo pixels as supplied. (Strength: it offers that white-background cleanup option and detailed page presets.)',
    },
  ],
  related: ['pdf-page-numbers', 'pdf-to-text', 'protect-pdf', 'image-watermark'],
};

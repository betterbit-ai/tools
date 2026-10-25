import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'pdf-to-text',
  category: 'pdf',
  icon: 'text',
  added: '2026-10-25',
  updated: '2026-10-25',
  edges: ['privacy', 'performance', 'usability'],
  competitors: [
    {
      name: 'PDF24 (PDF to Text)',
      url: 'https://tools.pdf24.org/en/pdf-to-text',
      weakness:
        'Its English page says conversion happens on PDF24 servers in Germany and files are deleted only after one hour; the visible flow requires choosing a file, clicking Convert, then downloading. This tool reads the PDF in the browser and makes each extracted page available to copy as soon as it is read. (Strength: PDF24 accepts multiple input files and has a Windows desktop app.)',
    },
    {
      name: 'PDF2Go (Convert PDF to Text)',
      url: 'https://www.pdf2go.com/pdf-to-text',
      weakness:
        'Its converter begins with an upload and Start step, and its page limits anonymous files to 50 MB; it describes TLS and encrypted server processing rather than local-only extraction. This tool accepts one local PDF up to 100 MB and exposes the result page by page. (Strength: PDF2Go accepts cloud and link sources, and also offers OCR.)',
    },
    {
      name: 'OnhaLab (PDF 텍스트 추출)',
      url: 'https://onhalab.com/pdf-text-extract/',
      weakness:
        'Its Korean tool documents limits of 30 MB, 200 pages, and 2 million output characters, and requires an explicit “텍스트 추출” action after selection. This tool starts local extraction after a valid file is chosen and allows 100 MB, 500 pages, and 10 million Unicode characters. (Strength: it provides a direct page-range field before extraction.)',
    },
    {
      name: 'iTextMaster (PDF 텍스트 변환)',
      url: 'https://itextmaster.com/ko/tools/pdf-to-text/',
      weakness:
        'Its Korean page limits one local PDF to 50 MB and asks users to set a page range, layout mode, and page-label option before running text extraction. This tool starts with no settings and puts one-page copy controls directly beside the result. (Strength: it offers page-range selection, reflow choices, and optional page labels.)',
    },
    {
      name: 'WooaOCR (PDF OCR)',
      url: 'https://wooaocr.wooahouse.com/',
      weakness:
        'Its Korean PDF feature is an OCR workflow for scanned documents, rather than a lightweight extractor for a PDF that already has selectable text. This tool reads the existing text layer page by page immediately after selection, avoiding OCR work when recognition is unnecessary. (Strength: WooaOCR can recognize text in scanned PDF images and supports several OCR languages.)',
    },
  ],
  related: ['pdf-to-jpg', 'pdf-page-numbers', 'remove-line-breaks', 'word-counter'],
};

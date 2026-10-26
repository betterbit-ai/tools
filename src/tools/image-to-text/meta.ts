import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-to-text',
  category: 'image',
  icon: 'text',
  added: '2026-10-27',
  updated: '2026-10-27',
  edges: ['privacy', 'performance', 'usability'],
  competitors: [
    {
      name: 'Text Toolbox (Image to Text)',
      url: 'https://www.textoolbox.com/tools/image-to-text/',
      weakness:
        'Its on-device OCR page asks the user to choose an image, select a language, and then press “Extract text”; its FAQ says the engine and language data come from a public CDN. This tool starts recognition as soon as a valid image is selected and self-hosts its worker, engine, and English/Korean language files. (Strength: Text Toolbox offers 14 visible language presets, where this focused tool offers English, Korean, and their mixed mode.)',
    },
    {
      name: 'Pullsy (Image to Text)',
      url: 'https://pullsy.online/tools/image-to-text/',
      weakness:
        'Its page says it loads Tesseract.js from a CDN and presents only a generic language selector; it does not surface a Korean-and-English mixed choice or a recognition-confidence value in the visible flow. This tool serves OCR assets from its own origin and gives a dedicated Korean + English option with progress and confidence. (Strength: Pullsy advertises 13+ languages and includes a bundled sample.)',
    },
    {
      name: 'Screenshot2Text',
      url: 'https://screenshot2text.com/',
      weakness:
        'Its browser-OCR flow correctly keeps files local, but its main drop zone combines images and PDFs and its guidance sends users to separate articles to diagnose stalled first-load downloads. This focused image-only tool validates image format, 20 MB size, and 24-million-pixel boundaries in the interface and names the OCR stage while it runs. (Strength: Screenshot2Text supports several images and scanned PDFs in a batch.)',
    },
    {
      name: 'OCR.ac (온라인 OCR)',
      url: 'https://ocr.ac/ko',
      weakness:
        'Its Korean page describes uploading an image for online conversion, requires a separate “전환하다” action, limits free images to 10 MB and three files at once, and shows a login/upgrade flow. This tool reads one image automatically in the browser, never uploads it for OCR, and accepts up to 20 MB. (Strength: OCR.ac handles PDFs, HEIC/HEIF, URL input, and many more languages.)',
    },
    {
      name: '라미선생님 (사진 글자 추출)',
      url: 'https://ramiteacher.github.io/image-text/',
      weakness:
        'Its Korean browser-local page requires the user to press “글자 추출” after choosing a language and supports a single JPG, PNG, or WebP image. This tool starts after drop, click, or paste and also supports BMP, while showing the model-download and recognition stages. (Strength: it accepts images up to 25 MB, above this tool’s 20 MB browser-safety boundary.)',
    },
    {
      name: 'ImageToText.cc (이미지 텍스트 추출)',
      url: 'https://www.imagetotext.cc/ko/',
      weakness:
        'Its Korean page limits each image to 7 MB and directs the user to upload, crop, and press “변환” before obtaining the result. This tool accepts one 20 MB image, supports paste, and begins local recognition immediately after a valid image is selected. (Strength: ImageToText.cc offers a crop step and DOC/PDF download formats.)',
    },
  ],
  related: ['image-resizer', 'image-converter', 'pdf-to-text', 'word-counter'],
};

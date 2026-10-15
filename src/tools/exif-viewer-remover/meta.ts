import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'exif-viewer-remover',
  category: 'image',
  icon: 'shield',
  added: '2026-10-11',
  updated: '2026-10-15',
  edges: ['privacy', 'no-signup', 'usability', 'accuracy'],
  competitors: [
    {
      name: 'W3Schools Remove EXIF Data',
      url: 'https://www.w3schools.com/tools/tool_exif_remover.php',
      weakness:
        'The opened tool page is surrounded by account, course, and “REMOVE ADS” promotion, and its cleaner re-encodes JPEG at 95% rather than retaining the original encoded pixels. It accepts one image at a time and has no batch ZIP workflow. (Strength: it clearly explains that its canvas path removes metadata locally.)',
    },
    {
      name: 'Spellkit EXIF Remover',
      url: 'https://tool.spellkit.dev/en/exif-remover',
      weakness:
        'Its page says PNG and WebP are redrawn and re-encoded to remove metadata, while this tool copies the encoded JPG, PNG, and WebP image data without recompression. (Strength: it reports the number of JPEG metadata segments removed.)',
    },
    {
      name: 'QiaoKit Remove EXIF',
      url: 'https://qiaokit.com/remove-exif/',
      weakness:
        'Its cleanup screen starts with file selection and settings, while this tool scans each queued file first and shows readable camera, date, and GPS data before removal. (Strength: it supports choosing a folder and offers an ICC-profile setting.)',
    },
    {
      name: 'MetadataRemover.ai',
      url: 'https://metadataremover.ai/',
      weakness:
        'Its page limits each image to 25 MB and a batch to 2–20 files, while this browser-only tool does not impose a fixed per-file or batch cap. (Strength: it offers selectable cleanup policies, C2PA/JUMBF handling, and downloadable reports.)',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'image-rotate-flip', 'image-watermark'],
};

import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'exif-viewer-remover',
  category: 'image',
  icon: 'shield',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'no-ads', 'no-signup', 'usability', 'features'],
  competitors: [
    {
      name: 'W3Schools Remove EXIF Data',
      url: 'https://www.w3schools.com/tools/tool_exif_remover.php',
      weakness:
        'The opened tool page is surrounded by W3Schools account, course, and “REMOVE ADS” promotion, and its cleaning path re-encodes JPEG at 95% rather than retaining the original compressed pixels. It shows no batch queue or one-download-for-many-files action. (Strength: it clearly explains that its canvas path removes metadata locally.)',
    },
    {
      name: 'ExifData.io',
      url: 'https://exifdata.io/',
      weakness:
        'Its image cleaner states that JPEG and WebP are re-encoded at 92% quality, while this tool keeps the encoded image data for its supported JPG, PNG, and WebP formats. (Strength: it supports many non-image formats and has granular cleaning options that this focused image tool does not.)',
    },
    {
      name: 'MetadataViewer.org Remove Metadata',
      url: 'https://metadataviewer.org/remove-metadata-from-photo/',
      weakness:
        'The opened remover is a single-photo flow: choose a file, inspect it, then download one clean copy; it exposes no multi-file queue or ZIP download. (Strength: it also performs byte-level cleaning and documents a broader set of image formats.)',
    },
    {
      name: '툴스모아 이미지 EXIF 삭제기',
      url: 'https://toolsmoa.kr/image/remove-exif/',
      weakness:
        'Its Korean guide describes selecting one JPG, PNG, or WebP image and then pressing a separate create button; it warns that re-encoding and profile removal can change colour, detail, and file size. This tool scans files on drop and removes metadata containers without re-encoding supported formats.',
    },
    {
      name: 'Remove My Metadata EXIF Remover',
      url: 'https://removemymetadata.com/ko/exif-remover',
      weakness:
        'Its opened Korean page allows up to 25 files and does re-scan results (Strength: comparable batch verification), but describes re-encoding supported photos; it also adds an optional image-fingerprint reset that changes pixels, whereas this tool makes a focused byte-level metadata-only copy.',
    },
    {
      name: 'UtilityBox 사진 위치정보(EXIF) 확인 및 삭제',
      url: 'https://uboxtools.com/tools/photo-exif-viewer-remover/',
      weakness:
        'Its page lists JPG, JPEG, and PNG as the supported cleanup formats and presents a single-photo upload flow, so WebP and a batch ZIP workflow are absent. (Strength: it presents a longer Korean guide to its supported fields.)',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'image-converter', 'image-rotate-flip', 'image-watermark'],
};

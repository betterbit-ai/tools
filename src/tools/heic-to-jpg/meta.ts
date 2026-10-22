import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'heic-to-jpg',
  category: 'image',
  icon: 'convert',
  added: '2026-10-08',
  updated: '2026-10-22',
  edges: ['privacy', 'no-signup', 'features'],
  competitors: [
    {
      name: 'FreeConvert (HEIC to JPG)',
      url: 'https://www.freeconvert.com/heic-to-jpg',
      weakness:
        'Uploads every file to its servers and says it deletes them after 8 hours. Its free upload control promotes signing up for files over 1 GB, and the page sells an upgrade to avoid queues and ads. (Strength: it offers resizing, target-size compression, auto-orient and metadata stripping in the same conversion.)',
    },
    {
      name: 'HEIC.online',
      url: 'https://heic.online/',
      weakness:
        'Uploads files to a server, deletes the result link after one hour and says it retains file names and conversion types for internal analysis. It requires an explicit Convert click and offers cloud saving. (Strength: it provides resize, crop, DPI and EXIF-removal controls.)',
    },
    {
      name: 'HEIC.dev',
      url: 'https://heic.dev/',
      weakness:
        'Also processes files locally, supports up to 500 files and offers quality, resize, metadata and ZIP controls. (Strength: it uses Web Workers, supports several output formats and offers filename templates.) Its workflow needs an explicit “Convert all” step; this tool starts automatically and defaults to preserving photo info while removing GPS coordinates.',
    },
    {
      name: 'Adobe Express HEIC → JPG (ko)',
      url: 'https://www.adobe.com/kr/express/feature/image/convert/heic-to-jpg',
      weakness:
        '사진을 업로드해야 하며 페이지는 iOS·macOS에서만 쓸 수 있다고 안내하고 파일 크기도 40MB로 제한합니다. 품질이나 EXIF 보존·GPS 제거 설정도 없습니다. (Strength: 변환 뒤 바로 편집 도구와 템플릿을 쓸 수 있습니다.)',
    },
  ],
  related: ['image-converter', 'image-compressor', 'image-resizer', 'image-cropper'],
};

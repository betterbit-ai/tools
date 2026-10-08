import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'heic-to-jpg',
  category: 'image',
  icon: 'convert',
  added: '2026-10-08',
  updated: '2026-10-08',
  edges: ['privacy', 'no-ads', 'no-signup', 'features'],
  competitors: [
    {
      name: 'heictojpg.com (JPEGmini)',
      url: 'https://heictojpg.com/',
      weakness:
        'The free web version is capped at 200 photos and pushes "Sign up to JPEGmini Cloud for free to convert more files" plus a paid JPEGmini Pro desktop download; there is no quality control and the page says nothing about what happens to EXIF metadata.',
    },
    {
      name: 'Convertio (HEIC to JPG)',
      url: 'https://convertio.co/heic-jpg/',
      weakness:
        'States that "conversion happens entirely on remote servers": every photo is uploaded, and the converted JPGs stay on their machines for up to 24 hours. An account is needed for larger uploads and faster processing. (Strength: it does preserve EXIF including GPS, and accepts files up to 1 GB.)',
    },
    {
      name: 'FreeConvert (HEIC to JPG)',
      url: 'https://www.freeconvert.com/heic-to-jpg',
      weakness:
        'Uploads every file and keeps a copy for 8 hours before deleting it, and sells an upgrade to "convert large files without a queue or Ads" — so the free tier queues and shows ads. (Strength: offers resizing and auto-orient from EXIF in the same step.)',
    },
    {
      name: 'iLoveIMG (HEIC to JPG)',
      url: 'https://www.iloveimg.com/convert-to-jpg/heic-to-jpg',
      weakness:
        'Server-side, with uploads from your computer or Drive/Dropbox. The only option that keeps "the original size in pixels" is labelled "High Quality Premium" — the free "Recommended Quality" path does not, and EXIF handling is not documented anywhere on the page.',
    },
    {
      name: 'CleverPDF HEIC to JPG',
      url: 'https://www.cleverpdf.com/heic-to-jpg',
      weakness:
        'Uploads files and caps them at 20 MB each and 20 files per batch, keeping them on the server for 30 minutes. The only setting is output DPI (36–600); there is no quality control and no mention of preserving EXIF. The page also advertises paid desktop versions.',
    },
    {
      name: 'PDF24 HEIC → JPG (ko)',
      url: 'https://tools.pdf24.org/ko/heic-to-jpg',
      weakness:
        '한국어 검색 상위에 노출되지만 페이지 자체에 "PDF24는 현재 HEIC 형식(.heic)의 파일을 지원하지 않습니다"라는 경고가 있어 실제로 변환이 되지 않습니다. 사이트는 광고로 운영되며, 업로드한 파일은 서버에서 1시간 뒤 삭제된다고 안내합니다.',
    },
    {
      name: 'Adobe Express HEIC → JPG (ko)',
      url: 'https://www.adobe.com/kr/express/feature/image/convert/heic-to-jpg',
      weakness:
        '이미지를 업로드해야 하고 파일당 40MB까지만 받습니다. 화질 설정이 없고 한 장씩 올리는 방식이라 여러 장을 한 번에 변환하거나 ZIP으로 받을 수 없습니다.',
    },
    {
      name: 'HEIC.dev',
      url: 'https://heic.dev/',
      weakness:
        'Also converts fully in-browser with WebAssembly, batches up to 500 files, zips them and exposes EXIF/GPS controls and a quality slider (Strength: the closest match to this tool on both privacy and features) — but it is funded by advertising partnerships, so the page carries ads, and it documents no guarantee about maker notes or HDR gain maps either.',
    },
  ],
  related: ['image-cropper', 'image-converter', 'image-compressor', 'image-resizer', 'image-to-pdf'],
};

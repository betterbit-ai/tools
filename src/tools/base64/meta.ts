import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'base64',
  category: 'developer',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'no-ads', 'features', 'accuracy'],
  competitors: [
    {
      name: 'CodeBeautify Base64 Decode',
      url: 'https://codebeautify.org/base64-decode',
      weakness:
        'Shows an "Ad blocking? It\'s okay, please share on social media" nag plus a login/logout bar, uses separate encode and decode pages, and never mentions URL-safe (-_ ) base64 at all.',
    },
    {
      name: 'Browserling Base64 Decode',
      url: 'https://www.browserling.com/tools/base64-decode',
      weakness:
        'Claims "no ads, nonsense or garbage" but still shows a login/signup popup; only handles plain text (no file in/out), has no URL-safe mode, and gives no detail on what makes an input invalid.',
    },
    {
      name: 'Base64decode.net',
      url: 'https://www.base64decode.net/',
      weakness:
        'Uses cookies for ad personalization and tracking, pushes text over 1MB into a separate "Base64 to File" tool instead of handling it in place, and documents no URL-safe (-_ ) support.',
    },
    {
      name: 'Base64.guru Decoder',
      url: 'https://base64.guru/converter/decode',
      weakness:
        'Splits file, image and URL-safe decoding across dozens of separate single-purpose pages (PNG decoder, JPG decoder, File decoder, a "Base64URL" standard picker) instead of one tool; its default lenient mode silently produces garbled output on invalid input instead of an error, and users report large files (~130MB) failing outright. (Strength: the most feature-complete of the tools checked — genuinely supports files, images and Base64URL.)',
    },
    {
      name: 'ioDraw Base64 디코더',
      url: 'https://www.iodraw.com/ko/tool/base64',
      weakness:
        '바이두·텐센트 클라우드 광고 배너와 "코드 전체화면" 모달이 끼어들고, 잘못된 입력에 대한 구체적인 오류 안내 없이 텍스트만 다룸(URL-safe, 파일 인코딩 언급 없음).',
    },
    {
      name: 'companys.kr Base64 인코더',
      url: 'https://companys.kr/',
      weakness:
        '이미지 파일은 지원하지만 일반 파일(zip, pdf 등) 인코딩/디코딩은 언급이 없고, 잘못된 Base64를 넣었을 때 어느 글자가 문제인지 알려주지 않음. (Strength: 로컬 처리와 URL-safe 설명은 명확함.)',
    },
  ],
  related: ['json-formatter', 'case-converter', 'text-diff'],
};

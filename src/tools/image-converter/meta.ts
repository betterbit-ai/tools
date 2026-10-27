import type { ToolMeta, ToolVariant } from '../types';

interface ComboUse {
  en: string;
  ko: string;
}

const COMBOS: {
  slug: string;
  from: string;
  to: 'image/jpeg' | 'image/png' | 'image/webp';
  accept: string;
  use: ComboUse;
}[] = [
  {
    slug: 'jpg-to-png',
    from: 'JPG',
    to: 'image/png',
    accept: 'image/jpeg',
    use: {
      en: 'Useful when you need a lossless copy to edit further, or a tool that only accepts PNG.',
      ko: '다시 편집해야 할 때 손실 없는 원본이 필요하거나, PNG만 받는 도구에 올려야 할 때 유용합니다.',
    },
  },
  {
    slug: 'png-to-jpg',
    from: 'PNG',
    to: 'image/jpeg',
    accept: 'image/png',
    use: {
      en: 'Shrinks screenshots and graphics for email, forms and uploads that reject PNG or need a small file.',
      ko: '스크린샷이나 그림 파일을 이메일, 지원서 업로드 등 PNG를 안 받거나 용량 제한이 있는 곳에 맞게 줄일 때 씁니다.',
    },
  },
  {
    slug: 'webp-to-jpg',
    from: 'WebP',
    to: 'image/jpeg',
    accept: 'image/webp',
    use: {
      en: 'Converts WebP images saved from the web (common from Chrome and many sites) into JPG for apps and editors that don’t open WebP.',
      ko: '크롬이나 여러 웹사이트에서 저장된 WebP 이미지를, WebP를 열지 못하는 앱이나 포토샵 등 편집기에서 쓸 수 있는 JPG로 바꿀 때 씁니다.',
    },
  },
];

const variants: ToolVariant[] = COMBOS.map((c): ToolVariant => {
  const toLabel = c.to === 'image/png' ? 'PNG' : c.to === 'image/jpeg' ? 'JPG' : 'WebP';
  return {
    slug: c.slug,
    preset: { to: c.to, accept: c.accept },
    content: {
      en: {
        title: `${c.from} to ${toLabel} Converter — Free, No Upload`,
        description: `Convert ${c.from} to ${toLabel} in your browser, one file or a batch. No upload, no sign-up — the file never leaves your device.`,
        h1: `${c.from} to ${toLabel} Converter`,
        intro: `Drop a ${c.from} file (or many) below to convert it to ${toLabel} instantly. ${c.use.en}`,
      },
      ko: {
        title: `${c.from} ${toLabel} 변환 — 무료, 업로드 없음`,
        description: `${c.from} 파일을 브라우저에서 바로 ${toLabel}로 변환하세요. 한 장도, 여러 장도 가능. 업로드·가입 없이 기기 안에서 처리됩니다.`,
        h1: `${c.from} ${toLabel} 변환`,
        intro: `아래에 ${c.from} 파일을 올리면 바로 ${toLabel}로 변환됩니다. ${c.use.ko}`,
      },
    },
  };
});

export const meta: ToolMeta = {
  slug: 'image-converter',
  category: 'image',
  icon: 'convert',
  added: '2026-10-08',
  updated: '2026-10-20',
  edges: ['privacy', 'no-signup', 'performance', 'usability'],
  competitors: [
    {
      name: 'Convertio (JPG to PNG)',
      url: 'https://convertio.co/jpg-png/',
      weakness:
        'Uploads files from a computer, Drive, Dropbox, or a URL, then says the result remains on its servers for up to 24 hours; conversion requires an upload/download round trip. (Strength: it supports more than 200 output formats, far beyond this focused JPG/PNG/WebP tool.)',
    },
    {
      name: 'FreeConvert (JPG to PNG)',
      url: 'https://www.freeconvert.com/jpg-to-png',
      weakness:
        'Uploads files to a server and says they are automatically deleted after 8 hours; the page also shows an upgrade/sign-up prompt after its 1GB limit. (Strength: its conversion page includes resize, metadata-removal, and other advanced settings.)',
    },
    {
      name: 'PicConverter (JPEG to PNG)',
      url: 'https://picconverter.org/jpeg-to-png',
      weakness:
        'Already processes locally with no ads, sign-up, or file-size limit and supports batch ZIP downloads (Strength: it matches most of our privacy and batch workflow). Its page requires a separate Convert action and offers resize and rotate controls that this focused converter leaves to our related tools.',
    },
    {
      name: '이미지 포맷 변환기 (url.kr)',
      url: 'https://url.kr/p/image-converter/',
      weakness:
        '브라우저에서 처리해 업로드가 없는 점은 같지만(Strength: 개인정보 보호 방식이 동일함), 제휴 광고가 표시되고 JPG·PNG·WebP 세 형식만 지원합니다. 변환 시작 버튼을 눌러야 하며 GIF·BMP·AVIF 원본을 읽을 수 없고, 여러 파일을 ZIP으로 받는 기능도 없습니다.',
    },
  ],
  related: [
    'image-resizer',
    'image-compressor',
    'image-upscaler',
    'heic-to-jpg',
    'video-to-gif',
    'image-to-text',
    'image-to-base64',
  ],
  variants,
};

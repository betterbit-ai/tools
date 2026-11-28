import type { ToolMeta, ToolVariant, VariantContent } from '../types';

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

/**
 * Per-pair details for the preset pages. Each variant carries its own section and FAQ so a
 * conversion page is not a copy of the main converter with a different format name.
 */
/** Only the preset-specific fields; title, description, h1 and intro come from the combo. */
type VariantDetails = Pick<VariantContent, 'sections' | 'faq'>;

const DETAILS: Record<string, { en: VariantDetails; ko: VariantDetails }> = {
  'jpg-to-png': {
    en: {
      sections: [
        {
          heading: 'What changing JPG to PNG does to a file',
          body: `A JPG has already thrown away detail during compression, and converting it to PNG does not bring that detail back: the pixels stay exactly as the JPG stored them and the file usually gets larger, because PNG is lossless and cannot compress photographic noise tightly. The conversion is worth doing when a tool or upload form accepts only PNG, or when the image will be edited repeatedly and each JPG save would add loss.

JPG cannot store transparency, so a JPG has none to keep. PNG can, which matters for logos and screenshots with flat colour, where PNG is often sharper and sometimes smaller than the JPG.`,
          table: {
            caption: 'JPG and PNG compared',
            head: ['Property', 'JPG', 'PNG'],
            rows: [
              ['Compression', 'Lossy', 'Lossless'],
              ['Transparency', 'None', 'Supported'],
              ['Typical photo size', 'Smaller', 'Larger'],
              ['Flat graphics', 'Blurry edges', 'Sharp'],
              ['Repeated editing', 'Degrades each save', 'No loss'],
            ],
          },
        },
      ],
      faq: [
        {
          q: 'Does converting JPG to PNG improve quality?',
          a: 'No. It preserves the quality the JPG already has and prevents further loss, but it cannot restore detail the JPG compression removed. Converting back to JPG adds another lossy step.',
        },
        {
          q: 'Why is my PNG bigger than the JPG?',
          a: 'PNG is lossless, so it stores every pixel exactly and photographic detail does not compress well without loss. A 3 MB JPG can become a 12 MB PNG with no visible change.',
        },
        {
          q: 'When should I use PNG instead of JPG?',
          a: 'For screenshots, logos, diagrams and anything with text or transparency. Use JPG for photographs where a small file matters more than perfect pixels.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: 'JPG를 PNG로 바꾸면 파일에 무슨 일이 생기나',
          body: `JPG는 압축 과정에서 이미 세부 정보를 버렸고, PNG로 바꾼다고 그 정보가 돌아오지는 않습니다. 픽셀은 JPG가 저장한 그대로이고, PNG는 무손실이라 사진의 노이즈를 세게 압축하지 못하므로 파일은 보통 더 커집니다. PNG만 받는 도구나 업로드 양식을 통과해야 할 때, 또는 계속 편집하면서 JPG 저장마다 손실이 쌓이는 것을 막고 싶을 때 의미가 있습니다.

JPG는 투명도를 저장할 수 없으므로 JPG에는 지킬 투명도가 없습니다. PNG는 투명도를 지원하며, 단색이 많은 로고나 스크린샷에서는 JPG보다 선명하고 때로는 더 작습니다.`,
          table: {
            caption: 'JPG와 PNG 비교',
            head: ['항목', 'JPG', 'PNG'],
            rows: [
              ['압축', '손실', '무손실'],
              ['투명도', '없음', '지원'],
              ['사진 용량', '작음', '큼'],
              ['단색 그래픽', '경계 흐려짐', '선명'],
              ['반복 편집', '저장마다 손실', '손실 없음'],
            ],
          },
        },
      ],
      faq: [
        {
          q: 'JPG를 PNG로 바꾸면 화질이 좋아지나요?',
          a: '아니요. JPG가 가진 화질을 유지하고 추가 손실을 막을 뿐, 압축으로 사라진 정보는 되살리지 못합니다. 다시 JPG로 바꾸면 손실이 한 번 더 쌓입니다.',
        },
        {
          q: 'PNG가 JPG보다 큰 이유는 무엇인가요?',
          a: 'PNG가 무손실이라 모든 픽셀을 그대로 저장하고, 사진의 세부 정보는 손실 없이 압축되지 않기 때문입니다. 3MB JPG가 눈에 보이는 차이 없이 12MB PNG가 되기도 합니다.',
        },
        {
          q: '언제 PNG를 써야 하나요?',
          a: '스크린샷, 로고, 도표, 글자나 투명도가 있는 이미지에 PNG를 쓰세요. 사진은 용량이 중요하면 JPG가 낫습니다.',
        },
      ],
    },
  },
  'png-to-jpg': {
    en: {
      sections: [
        {
          heading: 'When PNG should become JPG',
          body: `PNG is lossless, so a screenshot or a graphic saved as PNG can be several times larger than the same picture as JPG. Converting to JPG discards some detail but compresses photographic and gradient areas far more efficiently, which is what upload forms with a size limit expect.

Two things change: transparency becomes a flat colour, usually white, and the image becomes lossy, so repeated JPG saves degrade it. Keep the PNG original if you may edit again and use the JPG as the delivery copy.`,
          table: {
            caption: 'How PNG and JPG behave',
            head: ['Property', 'PNG', 'JPG'],
            rows: [
              ['Compression', 'Lossless', 'Lossy'],
              ['Transparency', 'Kept', 'Flattened'],
              ['Screenshots and text', 'Sharp, larger', 'Softer, smaller'],
              ['Repeated saving', 'No loss', 'Degrades each time'],
            ],
          },
        },
      ],
      faq: [
        {
          q: 'Will transparency be lost when converting PNG to JPG?',
          a: 'Yes. JPG has no alpha channel, so transparent pixels become a solid colour, usually white. Composite the image over the colour you want before converting if the background matters.',
        },
        {
          q: 'How much smaller does a PNG get as a JPG?',
          a: 'For screenshots and photos it is often three to ten times smaller at high quality, because JPG discards detail the eye does not notice. Flat graphics compress less well.',
        },
        {
          q: 'Can I convert the JPG back to PNG losslessly?',
          a: 'The PNG will be lossless from that point on, but it cannot recover detail the JPG pass removed. Keep the original PNG if you still need an editable copy.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: 'PNG를 JPG로 바꿔야 할 때',
          body: `PNG는 무손실이라 스크린샷이나 그래픽을 PNG로 저장하면 같은 그림의 JPG보다 몇 배 커질 수 있습니다. JPG로 바꾸면 세부 정보는 일부 버리지만 사진과 그라디언트 영역을 훨씬 효율적으로 압축해, 용량 제한이 있는 업로드 양식에 맞출 수 있습니다.

바뀌는 것은 두 가지입니다. 투명도가 보통 흰색 같은 단색으로 채워지고, 이미지가 손실 압축이 되어 JPG로 반복 저장할수록 화질이 떨어집니다. 다시 편집할 수 있다면 PNG 원본을 남기고, JPG는 전달용 사본으로 쓰세요.`,
          table: {
            caption: 'PNG와 JPG의 동작 차이',
            head: ['항목', 'PNG', 'JPG'],
            rows: [
              ['압축', '무손실', '손실'],
              ['투명도', '유지', '단색으로 채움'],
              ['스크린샷·글자', '선명, 큼', '약간 부드럽고 작음'],
              ['반복 저장', '손실 없음', '매번 열화'],
            ],
          },
        },
      ],
      faq: [
        {
          q: 'PNG를 JPG로 바꾸면 투명도가 사라지나요?',
          a: '네. JPG에는 알파 채널이 없어 투명한 픽셀이 보통 흰색 같은 단색이 됩니다. 배경이 중요하면 원하는 색 위에 합성한 뒤 변환하세요.',
        },
        {
          q: 'PNG가 JPG로 얼마나 작아지나요?',
          a: '스크린샷과 사진은 높은 화질에서 3~10배 작아지는 경우가 많습니다. 눈에 띄지 않는 세부 정보를 JPG가 버리기 때문이며, 단색 그래픽은 효과가 적습니다.',
        },
        {
          q: 'JPG를 다시 PNG로 되돌리면 무손실인가요?',
          a: '그 시점부터는 무손실이지만, JPG 단계에서 사라진 정보는 돌아오지 않습니다. 편집용 사본이 필요하면 원본 PNG를 보관하세요.',
        },
      ],
    },
  },
  'webp-to-jpg': {
    en: {
      sections: [
        {
          heading: 'Why WebP files need converting',
          body: `WebP is what most modern sites send: it is smaller than JPG at similar quality and can carry transparency, which is why images saved from Chrome and many web apps arrive with a .webp extension. Older editors, office programs and upload forms often refuse it, so converting to JPG is the usual way to open the picture again.

Because WebP is already compressed, the JPG is a second lossy pass — expect a slight quality loss and a larger file. If the image has transparency, convert to PNG instead of JPG so the background is preserved, or flatten it deliberately onto the colour you want.`,
          table: {
            caption: 'WebP against JPG',
            head: ['Property', 'WebP', 'JPG'],
            rows: [
              ['Size at equal quality', 'Smaller', 'Larger'],
              ['Transparency', 'Supported', 'None'],
              ['Application support', 'Modern browsers', 'Universal'],
              ['Re-encoding', 'Lossy', 'Lossy'],
            ],
          },
        },
      ],
      faq: [
        {
          q: 'Why did an image download as .webp?',
          a: 'Many sites serve WebP because it is smaller at the same visible quality, and the browser saves that file rather than converting it. Renaming the file to .jpg does not change its format.',
        },
        {
          q: 'Does converting WebP to JPG lose quality?',
          a: 'Slightly. WebP is already compressed, so the JPG is a second lossy step. Use a high quality setting and keep the WebP if you need the best copy.',
        },
        {
          q: 'What if the WebP has a transparent background?',
          a: 'Convert to PNG rather than JPG, because JPG has no alpha channel and fills the transparent area with a solid colour.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: 'WebP를 변환해야 하는 이유',
          body: `WebP는 요즘 웹사이트가 가장 많이 보내는 형식입니다. 비슷한 화질에서 JPG보다 작고 투명도도 담을 수 있어, 크롬이나 여러 웹앱에서 저장한 이미지가 .webp 확장자로 남습니다. 오래된 편집기와 오피스 프로그램, 업로드 양식이 이 형식을 거부하는 경우가 많아 JPG로 바꾸는 것이 보통의 해결책입니다.

WebP는 이미 압축된 상태이므로 JPG는 두 번째 손실 단계입니다. 화질이 조금 떨어지고 파일이 커질 수 있습니다. 투명 배경이 있으면 JPG 대신 PNG로 변환해 배경을 지키거나, 원하는 색 위에 의도적으로 합성하세요.`,
          table: {
            caption: 'WebP와 JPG 비교',
            head: ['항목', 'WebP', 'JPG'],
            rows: [
              ['같은 화질의 용량', '작음', '큼'],
              ['투명도', '지원', '없음'],
              ['프로그램 지원', '최신 브라우저', '거의 모든 곳'],
              ['재인코딩', '손실', '손실'],
            ],
          },
        },
      ],
      faq: [
        {
          q: '이미지가 왜 .webp로 저장되나요?',
          a: '많은 사이트가 같은 화질에서 더 작은 WebP를 제공하고, 브라우저가 변환하지 않고 그 파일을 저장하기 때문입니다. 파일 이름을 .jpg로 바꿔도 형식은 그대로입니다.',
        },
        {
          q: 'WebP를 JPG로 바꾸면 화질이 떨어지나요?',
          a: '조금 떨어집니다. WebP가 이미 압축되어 있어 JPG는 두 번째 손실 단계입니다. 높은 화질로 변환하고, 최상의 사본이 필요하면 WebP를 보관하세요.',
        },
        {
          q: '투명 배경이 있는 WebP라면 어떻게 하나요?',
          a: 'JPG가 아니라 PNG로 변환하세요. JPG에는 알파 채널이 없어 투명 영역이 단색으로 채워집니다.',
        },
      ],
    },
  },
};

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
        ...DETAILS[c.slug]?.en,
      },
      ko: {
        title: `${c.from} ${toLabel} 변환 — 무료, 업로드 없음`,
        description: `${c.from} 파일을 브라우저에서 바로 ${toLabel}로 변환하세요. 한 장도, 여러 장도 가능. 업로드·가입 없이 기기 안에서 처리됩니다.`,
        h1: `${c.from} ${toLabel} 변환`,
        intro: `아래에 ${c.from} 파일을 올리면 바로 ${toLabel}로 변환됩니다. ${c.use.ko}`,
        ...DETAILS[c.slug]?.ko,
      },
    },
  };
});

export const meta: ToolMeta = {
  slug: 'image-converter',
  category: 'image',
  icon: 'convert',
  added: '2026-10-08',
  updated: '2026-11-28',
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
    'gif-maker',
    'image-to-text',
    'image-to-base64',
    'svg-to-png',
    'image-cropper',
  ],
  variants,
};

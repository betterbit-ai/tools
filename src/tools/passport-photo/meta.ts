import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'passport-photo',
  category: 'image',
  icon: 'camera',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'no-ads'],
  competitors: [
    {
      name: 'PassportPhotoMake',
      url: 'https://passportphotomake.com/',
      weakness:
        'The opened page has the useful country presets, crop controls and print sheets that this focused tool does not try to exceed, but explicitly says the free service is funded by ads. Betterbit provides Korean, US and Japan presets with no advertising. (Strength: it offers background removal and a much larger country list.)',
    },
    {
      name: 'PicToPassport',
      url: 'https://pictopassport.com/',
      weakness:
        'The opened flow uses four separate stages—choose size, upload, crop, then download—and presents a “100% Ready” biometric claim. Betterbit updates its single framing preview as settings change and does not overstate what a cropper can validate. (Strength: it offers 30+ country templates and background removal.)',
    },
    {
      name: 'PixConvert Passport Photo',
      url: 'https://www.pixconvert.com/passport-photo',
      weakness:
        'The opened page focuses on 40+ templates, AI background removal and ICAO guides, but its feature-rich editor is broader than a simple crop-and-print task. Betterbit gives a compact local 4×6 layout with exact 300-DPI pixel dimensions and no account. (Strength: it supports more countries and automatic background removal.)',
    },
    {
      name: 'PixMiller 증명사진',
      url: 'https://pixmiller.com/ko/id-photo/',
      weakness:
        'The opened Korean page says previewing is free but a payment is due at download, and it shows sign-up and login links. Betterbit has no payment gate, account or upload path. (Strength: it offers 40+ presets and AI background/appearance editing.)',
    },
    {
      name: 'IDPhotoBy 한국 여권사진',
      url: 'https://idphotoby.ai/ko/korea-passport-photo',
      weakness:
        'Its Korean page includes third-party Google Tag Manager and opens on a country/document selection step before the photo editor. Betterbit has no tracking script and remembers the most recently selected standard. (Strength: its country-specific page gives a more extensive written Korea-passport guide.)',
    },
    {
      name: '증명사진 만들기 (WooaImage)',
      url: 'https://imagekit.wooahouse.com/id-photo.html',
      weakness:
        'The Korean search result presents a separate “증명사진 만들기” action after setting crop position and size. Betterbit continuously refreshes the generated preview and adds a ready-to-print 4×6 sheet without a conversion step. (Strength: it lists additional Korean formats such as 반명함판 and 명함판.)',
    },
  ],
  related: ['image-cropper', 'image-resizer', 'background-remover', 'image-compressor'],
};

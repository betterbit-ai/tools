import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'meme-generator',
  category: 'image',
  icon: 'image',
  added: '2026-10-11',
  updated: '2026-10-19',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'QuickMeme',
      url: 'https://quickmeme.io/',
      weakness:
        'Its current editor is also local, no-signup, and watermark-free. (Strength: it offers 26 original illustrated templates, draggable and coloured caption boxes, automatic text fitting, and an AI caption helper.) Its AI helper sends the typed topic to its server, while this focused static-image editor never sends the photo or captions anywhere.',
    },
    {
      name: 'ToolTea Meme Generator',
      url: 'https://tooltea.com/image/meme-generator',
      weakness:
        'Its opened editor has a photo drop area, three caption fields, and blank layout presets (Strength: comparable local, no-watermark editing and a middle-text field). The page also inserts a post-download email-rating field, desktop-app promotion, and multiple “next steps” blocks around a simple caption workflow; this tool stays on the live preview and download task.',
    },
    {
      name: 'MemeGenerator.dev',
      url: 'https://www.memegenerator.dev/',
      weakness:
        'Its current local editor saves image-free drafts and opens a layer studio with background, text, colour, outline, spacing, opacity, rotation, and shadow controls. (Strength: it has 24 layouts, additional text layers, curated backgrounds, draft saving, and PNG/JPG export.) This tool is deliberately faster to orient in for a classic two-caption image macro: a ready blank canvas, just two labelled fields, and one PNG action.',
    },
    {
      name: 'Toolbase 밈 생성기',
      url: 'https://toolbase.cc/ko/design/image/meme_generator',
      weakness:
        'Its Korean page already processes locally and documents CJK wrapping (Strength: it matches the privacy and basic Korean-text workflow). It starts with an image upload and top/bottom captions only; this tool also provides immediate 1200×675 and 1080×1080 blank canvases for text-first 짤s.',
    },
    {
      name: 'Kapwing 밈 만들기',
      url: 'https://www.kapwing.com/ko/meme-maker',
      weakness:
        'Its opened Korean FAQ states that free-account exports, including memes, receive a watermark and that Pro removes it. (Strength: it has 2,000+ templates and supports video/GIF exports.) This tool exports a watermark-free static PNG without an account or editor-suite setup.',
    },
    {
      name: 'Handytool 밈 생성기',
      url: 'https://www.handytool.io/ko/tool/meme-generator',
      weakness:
        'Its Korean result is likewise local and watermark-free (Strength: it lets users drag captions and adjust outline controls). Its entry point requires choosing an image, whereas this tool is immediately usable with 16:9 and 1:1 blank canvases as well as a photo upload or paste.',
    },
  ],
  related: ['image-cropper', 'image-watermark'],
};

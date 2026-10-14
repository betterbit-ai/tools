import type { ToolMeta } from '../types';

/**
 * Bundled model: Real-ESRGAN General x4v3 (`realesr-general-x4v3`).
 * Source: https://huggingface.co/qualcomm/Real-ESRGAN-General-x4v3
 * Original project: https://github.com/xinntao/Real-ESRGAN
 * License: BSD-3-Clause. Self-hosted as public/models/realesr-general-x4v3.onnx
 * (4,872,481 bytes / 4.87 MB), below Cloudflare's 25 MiB static-asset limit.
 */
export const meta: ToolMeta = {
  slug: 'image-upscaler',
  category: 'image',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-15',
  edges: ['privacy', 'no-ads'],
  competitors: [
    {
      name: 'Adobe Firefly Image Upscaler',
      url: 'https://www.adobe.com/products/photoshop/image-upscaler.html',
      weakness:
        'Requires an Adobe account even for its free daily generations, and the upload flow asks users to agree to Adobe terms before processing. (Strength: its Generative Upscale is integrated with the wider Firefly editor.)',
    },
    {
      name: 'VanceAI Image Enlarger',
      url: 'https://vanceai.com/image-enlarger/',
      weakness:
        'Its online tool starts with an image upload rather than local browser processing and promotes subscriptions and credits. (Strength: it offers specialised image modes, up to 8× online, and a local desktop client.)',
    },
    {
      name: 'ImgUpscaler',
      url: 'https://imgupscaler.ai/',
      weakness:
        'Processes uploaded images on its service and promotes paid credit packs after its free daily allowance. (Strength: it offers specialised enhancement modes and higher target resolutions.)',
    },
    {
      name: 'ImgScale',
      url: 'https://imgscale.net/ko/upscale',
      weakness:
        'Its Korean page says AI upscaling runs on its GPU server, so a photo leaves the browser even though it says it is deleted after processing. (Strength: it supports batch processing and ZIP download.)',
    },
    {
      name: 'Img2Go 화질 개선',
      url: 'https://www.img2go.com/ko/upscale-image',
      weakness:
        'Uploads files to GDPR-compliant European servers, limits the free plan to two conversions per 24 hours, and promotes paid plans for more conversions. (Strength: it supports batch jobs, custom dimensions and more than 10 formats.)',
    },
    {
      name: 'SNSnote AI 업스케일러',
      url: 'https://snsnote.com/ai-upscaler/',
      weakness:
        'Runs in the browser but includes Google Tag Manager on the tool page and does not disclose the model name, licence, self-hosted asset size or a documented input-pixel limit. (Strength: it also handles short video.)',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'image-converter'],
};

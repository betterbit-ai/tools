import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-compressor',
  category: 'image',
  icon: 'compress',
  added: '2026-10-08',
  updated: '2026-10-08',
  edges: ['privacy', 'no-ads', 'no-signup', 'performance', 'features'],
  competitors: [
    {
      name: 'TinyPNG',
      url: 'https://tinypng.com/',
      weakness:
        'Uploads to a server and keeps files for up to 48 hours; free tier caps batches at 20 images, 5MB each, and there is no target-file-size option — only one "smart" compression level. (Strength: very good PNG compression via palette quantization, which canvas-based tools cannot match.)',
    },
    {
      name: 'iLoveIMG Compress Image',
      url: 'https://www.iloveimg.com/compress-image',
      weakness:
        'Uploads files to a server to process; pushes sign-up for larger batches; no option to target an exact KB/MB size.',
    },
    {
      name: 'ResizePixel (Reduce image in KB)',
      url: 'https://www.resizepixel.com/reduce-image-in-kb/',
      weakness:
        'Uploads files to a server and shows ads on the result page. (Strength: it does offer a target-size-in-KB input, same idea we use, but without the privacy or speed of doing it on-device.)',
    },
    {
      name: 'CompressImage.io',
      url: 'https://compressimage.io/',
      weakness:
        'Already compresses on-device with no upload, matching our privacy edge — but its "compress to 1MB/2MB" pages are a manual quality slider: the FAQ tells you to "drag the slider down until the live size readout hits the number you need." There is no automatic search, so hitting an exact KB target is trial and error.',
    },
  ],
  related: ['image-cropper', 'image-resizer', 'image-converter', 'heic-to-jpg', 'image-to-pdf'],
};

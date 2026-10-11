// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { SITE_URL } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
    // ONNX Runtime's default WebGPU export embeds a 26 MB fallback WASM binary.
    // Select its external-WASM export instead; the required runtime files are
    // deliberately self-hosted in public/ort and loaded only when upscaling.
    resolve: {
      conditions: ['onnxruntime-web-use-extern-wasm', 'module', 'browser', 'development|production'],
    },
  },
});

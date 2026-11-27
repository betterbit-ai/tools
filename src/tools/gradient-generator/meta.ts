import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'gradient-generator',
  category: 'color',
  icon: 'image',
  added: '2026-11-27',
  updated: '2026-11-27',
  edges: ['features', 'usability', 'no-signup'],
  competitors: [
    {
      name: 'CSS Gradient — CSS Gradient Generator',
      url: 'https://www.css-gradient.com/',
      weakness:
        'Its opened generator mixes stops in plain sRGB, so a red-to-green or blue-to-yellow gradient keeps the dull midpoint, and its CSS is a single background-image line with no fallback strategy to explain. Betterbit emits OKLCH interpolation plus a 13-stop sRGB line sampled from the same ramp. (Strength: up to 12 stops, PNG export, a share link and a colour-blindness preview.)',
    },
    {
      name: 'csstools.io — CSS Gradient Generator',
      url: 'https://csstools.io/gradient',
      weakness:
        'Its opened page documents gradients in detail but the tool itself writes `linear-gradient(angle, stops)` with no interpolation method, and its examples never mention CSS Color 4 mixing. Betterbit shows the sRGB and OKLCH blends of the same stops side by side so the difference is visible before copying. (Strength: it explains the syntax with many worked examples.)',
    },
    {
      name: 'Gradient Studio — CSS gradient generator',
      url: 'https://gradientstudio.io/',
      weakness:
        'Its opened page is the strongest of the set — it already blends in OKLCH, ships a pre-blended fallback and audits text contrast — but it packs a contrast audit, Tailwind/SVG/PNG export and an import box around the gradient itself, and the first screen is controls rather than a finished value. Betterbit keeps the same OKLCH-plus-fallback output on one screen with 10 stops, presets and a two-line copy. (Strength: contrast audit of the whole gradient and an import-CSS box.)',
    },
    {
      name: '하이퍼툴박스 CSS 그라데이션 생성기',
      url: 'https://hypertoolbox.com/ko/cssGradientGenerator',
      weakness:
        'Its opened Korean page supports only linear and radial gradients with a single start color and a single end color — adding a third stop means editing the copied code by hand. Betterbit edits up to 10 stops, supports conic gradients and keeps every stop in the UI. (Strength: the smallest possible form for a two-color gradient.)',
    },
    {
      name: 'Kanvios 그라데이션 생성기',
      url: 'https://kanvios.com/ko/tools/gradientgenerator/',
      weakness:
        'Its opened Korean page offers linear and radial only (no conic), and it states that nothing is saved, so a refresh returns to the default. Betterbit keeps the working gradient in this browser and blends in OKLCH with a fallback line. (Strength: keyboard shortcuts and a clean stop slider.)',
    },
    {
      name: '가제트AI 그라데이션 생성기',
      url: 'https://gazet.ai/tools/gradient',
      weakness:
        'Its opened Korean page starts and ends with two colors and only adds a third if you tick a checkbox; four or more means editing the CSS by hand. Betterbit hands you a stop editor with positions and up to ten colors. (Strength: it explains conic gradients and hover-angle tips in Korean.)',
    },
  ],
  related: ['palette-generator', 'color-converter', 'contrast-checker', 'color-picker'],
};

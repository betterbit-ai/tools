import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'palette-generator',
  category: 'color',
  icon: 'palette',
  added: '2026-11-27',
  updated: '2026-11-27',
  edges: ['accuracy', 'features', 'no-signup', 'usability'],
  competitors: [
    {
      name: 'PAYATE — Color Palette Generator',
      url: 'https://www.payate.com/color-palette/',
      weakness:
        "Its opened page states that palettes are built with HSL color math, so its lightness steps are not perceptually even — yellow and blue move by very different amounts for the same percentage. Betterbit builds the ladder in OKLCH and prints each swatch's real L value. (Strength: swatch locking and a Space-bar regenerate.)",
    },
    {
      name: 'HexPalette — Color Palette Generator',
      url: 'https://hexpalette.com/generator',
      weakness:
        'Its opened generator composes a full theme from harmony, style and use-case axes, which buries the plain "five shaded colors from my hex" job behind three settings and role names like surface and accent. Betterbit answers that job on one screen and adds the WCAG ratio on white and black under every swatch. (Strength: it previews light and dark themes and exports role-based tokens.)',
    },
    {
      name: 'ColorKit — Color Palette Generator',
      url: 'https://colorkit.co/color-palette-generator/',
      weakness:
        'Its opened page leads with AI palettes, style recipes, locking and a design preview; saving palettes, a share link and Procreate/Adobe swatch files sit behind a free account. Betterbit needs no account and copies CSS, Tailwind, JSON or a HEX list immediately. (Strength: a contrast matrix for every pair and a colour-blindness preview.)',
    },
    {
      name: 'GetColors — palette generator',
      url: 'https://getcolors.so/generate',
      weakness:
        'Its opened page puts harmony, locking, adjustments, accessibility, colour-vision checks and dozens of export formats into one workspace, so the first screen answers the question with a tool palette rather than a result. Betterbit shows the palette, its contrast numbers and copy buttons without opening a panel. (Strength: APCA support and code export for Swift, Android and Flutter.)',
    },
    {
      name: 'Pockit 컬러 팔레트 생성기',
      url: 'https://pockit.tools/ko/color-palette-generator/',
      weakness:
        'Its opened Korean page is built on hue-wheel rules and shows HEX, RGB and HSL, but no perceptual lightness value and no statement of which color space the steps use. Betterbit labels the space (OKLCH), shows the L of every swatch and keeps the fixed 0.12 L step visible. (Strength: it extracts palettes from images and exports SCSS and Tailwind.)',
    },
    {
      name: '지락실 색상 팔레트 생성기',
      url: 'https://www.jiraksil.com/service/palette',
      weakness:
        'Its opened Korean page generates from the hue wheel into five fixed swatches with locking, a random key and image extraction, but the count is fixed and the lightness of each step is not shown. Betterbit lets you choose 3–10 colors and prints the OKLCH L and the white/black contrast ratio for each. (Strength: it explains when to use each harmony in Korean, in detail.)',
    },
  ],
  related: ['color-converter', 'color-picker', 'contrast-checker', 'gradient-generator', 'favicon-generator'],
};

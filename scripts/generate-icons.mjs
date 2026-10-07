#!/usr/bin/env node
/**
 * Generates favicon / app icons / default OG image into public/ from the brand mark.
 * Run manually after changing the mark:  node scripts/generate-icons.mjs
 * Outputs are committed; this script is not part of the build.
 * Needs `sharp` (available via devDependencies' tree; otherwise `npm i --no-save sharp`).
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const ACCENT = '#2f5bea';
const BOLT = 'M17.5 6 9 18h6.5l-1 8L23 14h-6.5z'; // drawn in a 32×32 box
const out = (f) => resolve('public', f);

/** Brand mark: accent square with white bolt. `pad` = safe-zone padding ratio (maskable icons). */
function markSvg(size, { radius = 0.25, pad = 0 } = {}) {
  const inner = size * (1 - pad * 2);
  const scale = inner / 32;
  const offset = size * pad;
  const r = radius * size;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${ACCENT}"/>
  <path d="${BOLT}" fill="#fff" transform="translate(${offset} ${offset}) scale(${scale})"/>
</svg>`);
}

const png = (svg) => sharp(svg).png({ compressionLevel: 9 }).toBuffer();

/** ICO container with embedded PNGs (supported by all modern browsers). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((im) => im.data)]);
}

const icoImages = [];
for (const size of [16, 32, 48]) icoImages.push({ size, data: await png(markSvg(size, { radius: 0.22 })) });
writeFileSync(out('favicon.ico'), ico(icoImages));
writeFileSync(out('apple-touch-icon.png'), await png(markSvg(180, { radius: 0 })));
writeFileSync(out('icon-192.png'), await png(markSvg(192, { radius: 0.22 })));
writeFileSync(out('icon-512.png'), await png(markSvg(512, { radius: 0.22 })));
writeFileSync(out('icon-maskable-512.png'), await png(markSvg(512, { radius: 0, pad: 0.12 })));

// Default Open Graph image (1200×630). Text uses system fonts available to librsvg.
const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fbfbfa"/>
  <rect x="0" y="0" width="1200" height="8" fill="${ACCENT}"/>
  <g transform="translate(96 150)">
    <rect width="112" height="112" rx="26" fill="${ACCENT}"/>
    <path d="${BOLT}" fill="#fff" transform="scale(3.5)"/>
  </g>
  <text x="96" y="370" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="76" font-weight="700" fill="#18181b">Betterbit Tools</text>
  <text x="96" y="440" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="36" fill="#5f5f66">Fast, private, ad-free tools that just work.</text>
  <text x="96" y="540" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="28" fill="${ACCENT}">betterbit.org</text>
</svg>`);
writeFileSync(out('og-default.png'), await sharp(og).png({ compressionLevel: 9 }).toBuffer());

console.log('icons written to public/');

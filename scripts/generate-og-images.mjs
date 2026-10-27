#!/usr/bin/env node
/**
 * Creates localized Open Graph cards for every rendered tool page.
 *
 * This deliberately runs after Astro: generated HTML is the single source of
 * truth for translated H1s and taglines, so a new locale or tool needs no
 * duplicate data-loading path in Node. Noto Sans KR is bundled and passed to
 * Sharp directly; rendering does not depend on CI's installed fonts.
 */
import { cpus, tmpdir } from 'node:os';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
const DIST = resolve(process.argv[2] ?? 'dist');
const TOOLS_DIR = resolve('src/tools');
const FONT_FILE = resolve('scripts/fonts/NotoSansKR-Bold.otf');
const FONT_CONFIG = resolve('scripts/fonts/fonts.conf');
const FONT_CACHE = join(tmpdir(), 'betterbit-og-fontconfig');
const WIDTH = 1200;
const HEIGHT = 630;
const ACCENT = '#2f5bea';
const BOLT = 'M17.5 6 9 18h6.5l-1 8L23 14h-6.5z';
const WORKERS = Math.min(4, Math.max(1, cpus().length));

if (!existsSync(DIST)) throw new Error(`dist not found at ${DIST}. Run Astro before generating OG cards.`);
if (!existsSync(FONT_FILE)) throw new Error(`Bundled Korean font not found: ${FONT_FILE}`);
if (!existsSync(FONT_CONFIG)) throw new Error(`Fontconfig file not found: ${FONT_CONFIG}`);

mkdirSync(FONT_CACHE, { recursive: true });
process.env.FONTCONFIG_FILE = FONT_CONFIG;
process.env.FONTCONFIG_PATH = dirname(FONT_CONFIG);
process.env.XDG_CACHE_HOME = FONT_CACHE;

const { default: sharp } = await import('sharp');
sharp.concurrency(WORKERS);

function toolSlugs() {
  return readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(TOOLS_DIR, entry.name, 'meta.ts')))
    .map((entry) => entry.name)
    .sort();
}

function locales(slugs) {
  const dirs = readdirSync(DIST, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const localized = dirs
    .filter((entry) => slugs.some((slug) => existsSync(join(DIST, entry.name, `${slug}.html`))))
    .map((entry) => ({ locale: entry.name, dir: join(DIST, entry.name) }));
  return [{ locale: 'en', dir: DIST }, ...localized];
}

function decodeHtml(value) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(
      /&(amp|apos|gt|lt|nbsp|quot);/g,
      (_, entity) => ({ amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"' })[entity],
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function escapePango(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function copyFromPage(file) {
  const html = readFileSync(file, 'utf8');
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>\s*<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) throw new Error(`Could not read tool H1 and tagline from ${file}`);
  return { title: decodeHtml(match[1]), tagline: decodeHtml(match[2]) };
}

function markSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112">
  <rect width="112" height="112" rx="26" fill="${ACCENT}"/>
  <path d="${BOLT}" fill="#fff" transform="scale(3.5)"/>
</svg>`);
}

async function textImage(text, { size, height, color }) {
  return sharp({
    text: {
      text: `<span font_desc="Noto Sans KR Bold ${size}px" foreground="${color}">${escapePango(text)}</span>`,
      font: 'Noto Sans KR',
      fontfile: FONT_FILE,
      width: 1008,
      height,
      align: 'left',
      wrap: 'word-char',
      rgba: true,
    },
  })
    .png()
    .toBuffer();
}

const baseCard = await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 4, background: '#fbfbfa' },
})
  .composite([
    {
      input: Buffer.from(
        `<svg width="1200" height="8" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="8" fill="${ACCENT}"/></svg>`,
      ),
      top: 0,
      left: 0,
    },
    { input: markSvg(), top: 150, left: 96 },
    {
      input: Buffer.from(
        `<svg width="1008" height="40" xmlns="http://www.w3.org/2000/svg"><text x="0" y="28" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="${ACCENT}">betterbit.org</text></svg>`,
      ),
      top: 504,
      left: 96,
    },
  ])
  .png()
  .toBuffer();

async function generateCard({ locale, slug, page }) {
  const { title, tagline } = copyFromPage(page);
  const [titleImage, taglineImage] = await Promise.all([
    textImage(title, { size: 68, height: 145, color: '#18181b' }),
    textImage(tagline, { size: 32, height: 70, color: '#5f5f66' }),
  ]);
  const output = join(DIST, 'og', locale, `${slug}.png`);
  mkdirSync(dirname(output), { recursive: true });
  const info = await sharp(baseCard)
    .composite([
      { input: titleImage, top: 322, left: 96 },
      { input: taglineImage, top: 440, left: 96 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(output);
  if (info.width !== WIDTH || info.height !== HEIGHT) {
    throw new Error(`Invalid OG image dimensions for ${locale}/${slug}: ${info.width}×${info.height}`);
  }
}

const slugs = toolSlugs();
const tasks = locales(slugs).flatMap(({ locale, dir }) =>
  slugs.map((slug) => ({ locale, slug, page: join(dir, `${slug}.html`) })),
);

for (const task of tasks) {
  if (!existsSync(task.page)) throw new Error(`Missing built tool page: ${task.page}`);
}

const started = performance.now();
for (let offset = 0; offset < tasks.length; offset += WORKERS) {
  await Promise.all(tasks.slice(offset, offset + WORKERS).map(generateCard));
}
const elapsed = ((performance.now() - started) / 1000).toFixed(1);
console.log(`OG images: ${tasks.length} localized cards in ${elapsed}s (${WORKERS} workers)`);

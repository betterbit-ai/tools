#!/usr/bin/env node
/**
 * Real-browser end-to-end checks for tools: open the built page in headless Chromium, feed it
 * realistic input, and assert on what a user would see and download. Unit tests can't catch a
 * tool that silently falls back to the CPU, rejects ordinary phone photos, or never finishes.
 *
 *   npm run build
 *   npm run e2e -- image-upscaler pdf-to-jpg   # specific tools
 *   npm run e2e                                # every tool with a spec in e2e/tools/
 *   npm run e2e -- --base https://betterbit.org image-upscaler   # against a deployed site
 *
 * A spec is e2e/tools/<slug>.e2e.mjs exporting `default async function (t)`; see helpers below.
 * Uses the Chromium that Playwright has cached on this machine (no download).
 */
import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const SPECS = join(import.meta.dirname, 'tools');

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base');
const remoteBase = baseIndex >= 0 ? args.splice(baseIndex, 2)[1].replace(/\/$/, '') : null;
const slugs = args.filter((a) => !a.startsWith('--'));
const wanted = slugs.length
  ? slugs
  : readdirSync(SPECS)
      .filter((f) => f.endsWith('.e2e.mjs'))
      .map((f) => f.replace('.e2e.mjs', ''));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.onnx': 'application/octet-stream',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

/** Serves dist/ the way Cloudflare does with build.format 'file': /timer → /timer.html. */
function serveDist() {
  if (!existsSync(DIST)) throw new Error('dist/ not found — run `npm run build` first');
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const candidates = path.endsWith('/') ? [join(path, 'index.html')] : [path, `${path}.html`];
    for (const candidate of candidates) {
      const file = join(DIST, candidate);
      if (file.startsWith(DIST) && existsSync(file) && statSync(file).isFile()) {
        res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
        return res.end(readFileSync(file));
      }
    }
    res.statusCode = 404;
    res.end('not found');
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

class Failure extends Error {}

function helpers(page, base, errors) {
  const t = {
    page,
    base,
    /** Open a tool page (e.g. '/image-upscaler' or '/ko/image-upscaler') and wait for its island. */
    async open(path) {
      await page.goto(base + path, { waitUntil: 'load' });
      await page.waitForSelector('astro-island:not([ssr])', { timeout: 15_000 }).catch(() => {});
    },
    /** Put files into the page's first file input (what a user's file picker does). */
    async upload(files, selector = 'input[type=file]') {
      await page.setInputFiles(selector, files);
    },
    /** Click a button by its visible text (string or RegExp). */
    async click(name, options = {}) {
      await page
        .getByRole('button', { name, exact: typeof name === 'string', ...options })
        .first()
        .click();
    },
    /** Wait until the main content shows text matching `pattern`; returns the matching text. */
    async waitForText(pattern, timeoutMs = 30_000) {
      const re = pattern instanceof RegExp ? pattern : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const started = Date.now();
      while (Date.now() - started < timeoutMs) {
        const text = await page.locator('main').innerText();
        const match = text.match(re);
        if (match) return match[0];
        await page.waitForTimeout(250);
      }
      throw new Failure(`timed out after ${timeoutMs} ms waiting for ${re}`);
    },
    /** Run `action` and return the download it triggers: { name, size, bytes }. */
    async download(action, timeoutMs = 60_000) {
      const [download] = await Promise.all([page.waitForEvent('download', { timeout: timeoutMs }), action()]);
      const path = await download.path();
      const bytes = readFileSync(path);
      return { name: download.suggestedFilename(), size: bytes.length, bytes };
    },
    /** A test image made by the browser's canvas: { name, mimeType, buffer } for upload(). */
    async image({ width, height, type = 'image/jpeg', name } = {}) {
      const b64 = await page.evaluate(
        async ({ width, height, type }) => {
          const canvas = new OffscreenCanvas(width, height);
          const ctx = canvas.getContext('2d');
          const g = ctx.createLinearGradient(0, 0, width, height);
          g.addColorStop(0, '#2a6');
          g.addColorStop(1, '#a26');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, width, height);
          for (let i = 0; i < 200; i++) {
            ctx.fillStyle = `hsl(${(i * 37) % 360},70%,50%)`;
            ctx.beginPath();
            ctx.arc((i * 97) % width, (i * 61) % height, 4 + (i % 20) * (width / 1000), 0, 7);
            ctx.fill();
          }
          const blob = await canvas.convertToBlob({ type, quality: 0.9 });
          const bytes = new Uint8Array(await blob.arrayBuffer());
          let s = '';
          for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          return btoa(s);
        },
        { width, height, type },
      );
      const ext = type.split('/')[1].replace('jpeg', 'jpg');
      return { name: name ?? `test-${width}x${height}.${ext}`, mimeType: type, buffer: Buffer.from(b64, 'base64') };
    },
    /** A simple text PDF with `pages` pages: { name, mimeType, buffer }. */
    async pdf({ pages = 3, name = 'test.pdf' } = {}) {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      for (let i = 1; i <= pages; i++) {
        const p = doc.addPage([595, 842]);
        p.drawText(`Betterbit e2e page ${i}`, { x: 60, y: 760, size: 28, font, color: rgb(0.1, 0.2, 0.6) });
        p.drawRectangle({ x: 60, y: 300, width: 300, height: 150, color: rgb(i / (pages + 1), 0.4, 0.5) });
      }
      return { name, mimeType: 'application/pdf', buffer: Buffer.from(await doc.save()) };
    },
    /** Fail the spec with a message. */
    fail(message) {
      throw new Failure(message);
    },
    /** Assert a condition. */
    assert(condition, message) {
      if (!condition) throw new Failure(message);
    },
    /** Uncaught page errors so far (console errors are in `errors.console`). */
    errors,
  };
  return t;
}

// Flags that let Chromium run inside the Codex (seatbelt) sandbox as well as normally.
const LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-gpu-sandbox',
  '--no-zygote',
  '--single-process',
  '--disable-features=MachPortRendezvous',
];

const server = remoteBase ? null : await serveDist();
const base = remoteBase ?? `http://127.0.0.1:${server.address().port}`;
let failed = 0;

for (const slug of wanted) {
  const spec = join(SPECS, `${slug}.e2e.mjs`);
  if (!existsSync(spec)) {
    console.log(`✗ ${slug}: no spec at e2e/tools/${slug}.e2e.mjs`);
    failed++;
    continue;
  }
  // A fresh browser per spec: with --single-process, closing a context ends the browser.
  const browser = await chromium.launch({ headless: true, args: LAUNCH_ARGS });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = { page: [], console: [] };
  page.on('pageerror', (e) => errors.page.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.console.push(m.text()));
  const started = Date.now();
  try {
    const run = (await import(pathToFileURL(spec).href)).default;
    await run(helpers(page, base, errors));
    if (errors.page.length) throw new Failure(`uncaught page error: ${errors.page[0]}`);
    console.log(`✓ ${slug} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
  } catch (e) {
    failed++;
    console.log(`✗ ${slug}: ${e instanceof Failure ? e.message : (e?.stack ?? e)}`);
    if (errors.console.length) console.log(`  console errors: ${errors.console.slice(0, 3).join(' | ')}`);
  } finally {
    await browser.close().catch(() => {});
  }
}

server?.close();
console.log(`\n${wanted.length - failed}/${wanted.length} passed`);
process.exit(failed ? 1 : 0);

#!/usr/bin/env node
/**
 * Post-build SEO / quality audit over every generated HTML page in dist/.
 * Fails (exit 1) on anything that would hurt indexing or look broken to users.
 * Run via `npm run check:dist` (after `npm run build`).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const DIST = resolve(process.argv[2] ?? 'dist');
/** Raw (uncompressed) JS per page. Preact + one tool should be far below this. */
const JS_BUDGET_BYTES = 150 * 1024;

const errors = [];
const warnings = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Resolve a site path to the built file (build.format = 'file'). */
function fileForPath(path) {
  const clean = path.split(/[?#]/)[0];
  if (clean === '/' || clean === '') return join(DIST, 'index.html');
  const direct = join(DIST, clean);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  return join(DIST, clean.replace(/\/$/, '') + '.html');
}

/** Size of a JS module plus everything it statically imports. */
function jsClosure(file, seen = new Set()) {
  if (seen.has(file) || !existsSync(file)) return 0;
  seen.add(file);
  const src = readFileSync(file, 'utf8');
  let size = Buffer.byteLength(src);
  for (const m of src.matchAll(/(?:import|from)\s*["'](\.\/[^"']+\.js)["']/g)) {
    size += jsClosure(join(file, '..', m[1]), seen);
  }
  return size;
}

if (!existsSync(DIST)) {
  console.error(`dist not found at ${DIST}. Run \`npm run build\` first.`);
  process.exit(1);
}

const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const titles = new Map();

for (const file of pages) {
  const page = '/' + relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  const body = html.slice(html.indexOf('<body'));

  if (!/<html[^>]+lang="[a-z-]+"/i.test(html)) fail(page, 'missing <html lang>');

  const h1s = body.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(page, `expected exactly 1 <h1>, found ${h1s.length}`);

  const title = head.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) fail(page, 'missing <title>');
  else {
    if ([...title].length > 90) warn(page, `title is long (${[...title].length} chars)`);
    if (titles.has(title)) fail(page, `duplicate <title> with ${titles.get(title)}`);
    titles.set(title, page);
  }

  const desc = head.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!desc) fail(page, 'missing meta description');
  else if ([...desc].length < 40 || [...desc].length > 200) warn(page, `meta description length ${[...desc].length}`);

  const canonical = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical?.startsWith('https://')) fail(page, 'missing absolute canonical');
  if (!/hreflang="x-default"/.test(head)) fail(page, 'missing hreflang x-default');

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      fail(page, 'invalid JSON-LD');
    }
  }

  // Visible text must not leak template artefacts.
  const text = body
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<astro-island[^>]*>/g, '')
    .replace(/<[^>]+>/g, ' ');
  if (/\bundefined\b|\bNaN\b|\[object Object\]/.test(text)) fail(page, 'visible "undefined"/"NaN"/"[object Object]"');
  if (/\{[a-zA-Z]+\}/.test(text)) fail(page, 'unreplaced {placeholder} in visible text');

  // Internal links must resolve.
  for (const m of body.matchAll(/href="(\/[^"]*)"/g)) {
    if (!existsSync(fileForPath(m[1]))) fail(page, `broken internal link ${m[1]}`);
  }

  // JS budget.
  const jsFiles = new Set();
  for (const m of html.matchAll(/(?:component-url|renderer-url|src)="(\/_astro\/[^"]+\.js)"/g)) jsFiles.add(m[1]);
  const seen = new Set();
  let js = 0;
  for (const f of jsFiles) js += jsClosure(join(DIST, f), seen);
  if (js > JS_BUDGET_BYTES) fail(page, `JS ${Math.round(js / 1024)} KB exceeds budget ${JS_BUDGET_BYTES / 1024} KB`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\ncheck-dist: ${pages.length} pages, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);

#!/usr/bin/env node
/**
 * Tell search engines about new or changed pages via IndexNow (Naver, Bing, Yandex…).
 * Reads the live sitemap and submits its URLs. Ownership is proven by the key file in public/.
 *
 *   node scripts/indexnow.mjs                  # every URL in the sitemap
 *   node scripts/indexnow.mjs /ko/timer /timer # only these paths
 *   node scripts/indexnow.mjs --dry-run
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE = 'https://betterbit.org';
const ENDPOINTS = ['https://searchadvisor.naver.com/indexnow', 'https://api.indexnow.org/indexnow'];

const keyFile = readdirSync(resolve(import.meta.dirname, '../public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file (public/<32 hex>.txt) not found');
const key = keyFile.slice(0, -4);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const paths = args.filter((a) => a.startsWith('/'));

let urls;
if (paths.length) {
  urls = paths.map((p) => SITE + p);
} else {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

console.log(`${urls.length} URL(s), key ${keyFile}`);
if (dryRun) {
  console.log(urls.join('\n'));
  process.exit(0);
}

const body = JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls });
let failed = false;
for (const endpoint of ENDPOINTS) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  // 200 = accepted, 202 = accepted (key validation pending)
  const ok = res.status === 200 || res.status === 202;
  failed ||= !ok;
  console.log(`${endpoint} → ${res.status} ${ok ? 'ok' : (await res.text()).slice(0, 200)}`);
}
process.exit(failed ? 1 : 0);

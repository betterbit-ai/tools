#!/usr/bin/env node
/**
 * Talks to `codex app-server` (JSON-RPC over stdio) for account-level calls the Codex CLI has no
 * command for. Prints the result as JSON on stdout.
 *
 *   node codex-account.mjs limits            # account/rateLimits/read: windows + reset credits
 *   node codex-account.mjs reset <key>       # account/rateLimitResetCredit/consume (spends a credit)
 *
 * Uses CODEX_HOME from the environment, like the factory's Codex sessions.
 */
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const [cmd, key] = process.argv.slice(2);
const METHODS = {
  limits: ['account/rateLimits/read', {}],
  reset: ['account/rateLimitResetCredit/consume', { idempotencyKey: key || randomUUID() }],
};
if (!METHODS[cmd]) {
  console.error('usage: codex-account.mjs limits | reset [idempotency-key]');
  process.exit(2);
}

const server = spawn('codex', ['app-server'], { stdio: ['pipe', 'pipe', 'ignore'] });
const pending = new Map();
let buffer = '';
let nextId = 0;
server.stdout.on('data', (chunk) => {
  buffer += chunk;
  for (let i; (i = buffer.indexOf('\n')) >= 0;) {
    const line = buffer.slice(0, i);
    buffer = buffer.slice(i + 1);
    if (!line.trim()) continue;
    const msg = JSON.parse(line);
    pending.get(msg.id)?.(msg);
  }
});
const send = (msg) => server.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...msg }) + '\n');
const call = (method, params) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    send({ id, method, params });
  });

const timer = setTimeout(() => {
  console.error('codex app-server did not answer in time');
  server.kill();
  process.exit(1);
}, 60_000);

const init = await call('initialize', { clientInfo: { name: 'betterbit-factory', version: '1.0.0' } });
if (init.error) throw new Error(`initialize: ${JSON.stringify(init.error)}`);
send({ method: 'initialized' });
const [method, params] = METHODS[cmd];
const res = await call(method, params);
clearTimeout(timer);
server.kill();
if (res.error) {
  console.error(JSON.stringify(res.error));
  process.exit(1);
}
console.log(JSON.stringify(res.result));

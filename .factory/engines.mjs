/**
 * Coding-agent engines. One factory process runs one engine (FACTORY_ENGINE, default `claude`):
 *
 *   claude  Claude Code CLI (`claude -p`), tool allowlist from config.allowedTools.
 *   codex   OpenAI Codex CLI (`codex exec`) in its workspace-write sandbox, signed in with the
 *           local ChatGPT login (~/.codex/auth.json). Local machines only — never put a ChatGPT
 *           login on a public repo's CI.
 *
 * Both return { ok, timedOut, result, sessionId, limited } and share the usage-limit cooldown.
 */
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { CLAUDE_ENV, CONFIG, DIRS, ENGINE, HOME, log, notify, sh } from './lib.mjs';

const engineConfig = () => CONFIG.engines?.[ENGINE] ?? {};
export const ENGINE_LABEL = [ENGINE, engineConfig().model].filter(Boolean).join(' ');

export function runAgent(promptText, cwd, logFile, opts = {}) {
  if (ENGINE === 'codex') return runCodex(promptText, cwd, logFile, opts);
  if (ENGINE === 'claude') return runClaude(promptText, cwd, logFile, opts);
  throw new Error(`Unknown FACTORY_ENGINE: ${ENGINE}`);
}

/* ───────────── Claude Code ───────────── */

function runClaude(promptText, cwd, logFile, { resume } = {}) {
  const { timeoutMinutes } = CONFIG.session;
  const args = ['-p', promptText];
  if (resume) args.push('--resume', resume);
  args.push('--permission-mode', 'acceptEdits', '--output-format', 'stream-json', '--verbose');
  args.push('--allowedTools', ...CONFIG.allowedTools);
  if (engineConfig().model) args.push('--model', engineConfig().model);
  log(`claude session start (cwd=${cwd}${resume ? `, resume=${resume}` : ''}, log=${logFile})`);
  const res = sh('claude', args, { cwd, allowFail: true, timeoutMs: timeoutMinutes * 60_000, env: CLAUDE_ENV });
  writeFileSync(logFile, res.out + '\n' + res.err);
  let result = '';
  let sessionId = resume ?? null;
  let isError = false;
  for (const line of res.out.split('\n')) {
    try {
      const ev = JSON.parse(line);
      if (ev.session_id) sessionId = ev.session_id;
      if (ev.type === 'result') {
        result = ev.result ?? '';
        isError = !!ev.is_error;
      }
    } catch {
      /* not JSON */
    }
  }
  const limited = isError && LIMIT_RE.test(result);
  if (limited) startCooldown(result);
  log(`claude session end (ok=${res.ok}, timedOut=${res.timedOut}, limited=${limited}, resultChars=${result.length})`);
  return { ok: res.ok, timedOut: res.timedOut, result, sessionId, limited };
}

/* ───────────── Codex ───────────── */

const CODEX_HOME = join(HOME, 'codex-home');
const AUTH_SOURCE = process.env.CODEX_AUTH_SOURCE || join(homedir(), '.codex', 'auth.json');
const AUTH_HASH_FILE = join(CODEX_HOME, '.auth-source-sha256');
const sha = (p) => (existsSync(p) ? createHash('sha256').update(readFileSync(p)).digest('hex') : '');

/**
 * Codex runs with its own CODEX_HOME so the user's personal Codex config, plugins and global
 * AGENTS.md don't leak into factory sessions. The login is copied in from ~/.codex before each
 * run (so switching accounts there takes effect), and a token Codex refreshed during the run is
 * copied back so the personal login stays valid.
 */
function syncAuthIn() {
  mkdirSync(CODEX_HOME, { recursive: true });
  const dst = join(CODEX_HOME, 'auth.json');
  const src = sha(AUTH_SOURCE);
  if (!src) throw new Error(`Codex is not logged in: ${AUTH_SOURCE} is missing (run \`codex login\`)`);
  const last = existsSync(AUTH_HASH_FILE) ? readFileSync(AUTH_HASH_FILE, 'utf8') : '';
  if (src !== last || !existsSync(dst)) {
    copyFileSync(AUTH_SOURCE, dst);
    chmodSync(dst, 0o600);
    writeFileSync(AUTH_HASH_FILE, src);
  }
}

function syncAuthOut() {
  const dst = join(CODEX_HOME, 'auth.json');
  const last = existsSync(AUTH_HASH_FILE) ? readFileSync(AUTH_HASH_FILE, 'utf8') : '';
  const now = sha(dst);
  // Only when Codex refreshed our copy and nobody changed the original meanwhile.
  if (now && now !== last && sha(AUTH_SOURCE) === last) {
    copyFileSync(dst, AUTH_SOURCE);
    writeFileSync(AUTH_HASH_FILE, now);
  }
}

const toml = (value) => JSON.stringify(value);
const tomlTable = (obj) =>
  `{${Object.entries(obj)
    .map(([k, v]) => `${k}=${toml(v)}`)
    .join(',')}}`;

function runCodex(promptText, cwd, logFile, { resume, gitDir } = {}) {
  const c = engineConfig();
  const { timeoutMinutes } = CONFIG.session;
  syncAuthIn();
  const empty = join(HOME, 'empty');
  mkdirSync(empty, { recursive: true });

  // Environment for the commands Codex runs inside its sandbox.
  const shellEnv = {
    PATH: c.path ?? '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    ZDOTDIR: empty, // skip the user's zsh dotfiles (nvm there would shadow the project's Node)
    NODE_OPTIONS: '--use-bundled-ca', // the sandbox blocks the macOS keychain; Node would crash reading it
    GH_CONFIG_DIR: empty, // gh is logged out inside sessions
    GIT_CONFIG_COUNT: '1', // …and git has no credential helper, so the agent can commit but not push
    GIT_CONFIG_KEY_0: 'credential.helper',
    GIT_CONFIG_VALUE_0: '',
  };
  const config = [
    `model=${toml(c.model)}`,
    `model_reasoning_effort=${toml(c.effort ?? 'high')}`,
    `approval_policy="never"`,
    `sandbox_mode="workspace-write"`,
    `sandbox_workspace_write.network_access=true`,
    // A worktree's git metadata lives in the main clone's .git, outside the workspace.
    ...(gitDir ? [`sandbox_workspace_write.writable_roots=${toml([gitDir])}`] : []),
    `shell_environment_policy.set=${tomlTable(shellEnv)}`,
  ];
  const args = ['--search', 'exec', '--json', '--skip-git-repo-check', '--disable', 'shell_snapshot'];
  for (const kv of config) args.push('-c', kv);
  if (resume) args.push('resume', resume);
  args.push(promptText);

  log(`codex session start (${ENGINE_LABEL}, cwd=${cwd}${resume ? `, resume=${resume}` : ''}, log=${logFile})`);
  const res = sh('codex', args, {
    cwd,
    input: '',
    allowFail: true,
    timeoutMs: timeoutMinutes * 60_000,
    env: { ...CLAUDE_ENV, CODEX_HOME },
  });
  writeFileSync(logFile, res.out + '\n' + res.err);
  try {
    syncAuthOut();
  } catch (e) {
    log(`codex auth sync-back failed: ${e.message}`);
  }

  let result = '';
  let sessionId = resume ?? null;
  const errors = [];
  for (const line of res.out.split('\n')) {
    try {
      const ev = JSON.parse(line);
      if (ev.type === 'thread.started' && ev.thread_id) sessionId = ev.thread_id;
      if (ev.type === 'item.completed' && ev.item?.type === 'agent_message') result = ev.item.text ?? result;
      if (ev.type === 'turn.failed' && ev.error?.message) errors.push(ev.error.message);
      if (ev.type === 'error' && ev.message) errors.push(ev.message);
    } catch {
      /* not JSON */
    }
  }
  const errorText = [...errors, res.err.slice(-2000)].join('\n');
  const limited = errors.length > 0 && LIMIT_RE.test(errorText);
  if (limited) startCooldown(errorText);
  const ok = res.ok && errors.length === 0;
  log(`codex session end (ok=${ok}, timedOut=${res.timedOut}, limited=${limited}, resultChars=${result.length})`);
  return { ok, timedOut: res.timedOut, result: result || errors.join('\n'), sessionId, limited };
}

/* ───────────── usage-limit cooldown (per engine) ───────────── */

const LIMIT_RE = /hit your .*limit|usage limit|limit reached|rate limit|try again (in|at) /i;
const COOLDOWN_FILE = join(DIRS.locks, ENGINE === 'claude' ? 'cooldown-until' : `cooldown-until-${ENGINE}`);

/**
 * Claude: "You've hit your session limit · resets 2am (Asia/Seoul)".
 * Codex:  "You've hit your usage limit … try again in 1 hour 12 minutes" / "… try again at 3:05 PM".
 * Unparseable → 60 min. Always +5 min of slack.
 */
export function cooldownUntil(message, now = new Date()) {
  const slack = 5 * 60_000;
  const rel = message.match(/try again in\s+((?:\d+\s*(?:days?|d|hours?|hrs?|h|minutes?|mins?|m)[\s,and]*)+)/i);
  if (rel) {
    const unit = { d: 86_400_000, h: 3_600_000, m: 60_000 };
    let ms = 0;
    for (const [, n, u] of rel[1].matchAll(/(\d+)\s*([dhm])/gi)) ms += Number(n) * unit[u.toLowerCase()];
    if (ms > 0) return now.getTime() + ms + slack;
  }
  const at =
    message.match(/resets\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i) ??
    message.match(/try again at\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (at) {
    let h = Number(at[1]);
    if (at[3]) h = (h % 12) + (at[3].toLowerCase() === 'pm' ? 12 : 0);
    const d = new Date(now);
    d.setHours(h, Number(at[2] ?? 0), 0, 0);
    if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
    return d.getTime() + slack;
  }
  return now.getTime() + 60 * 60_000;
}

export function startCooldown(message) {
  const until = cooldownUntil(message);
  writeFileSync(COOLDOWN_FILE, String(until));
  log(`${ENGINE} usage limit hit → cooling down until ${new Date(until).toLocaleString()}`);
  notify('Factory paused', `${ENGINE} usage limit — resumes ${new Date(until).toLocaleTimeString()}`);
}

export function coolingDown() {
  if (!existsSync(COOLDOWN_FILE)) return false;
  const until = Number(readFileSync(COOLDOWN_FILE, 'utf8'));
  if (Date.now() < until) {
    log(`cooling down (${ENGINE} usage limit) until ${new Date(until).toLocaleString()} — no sessions`);
    return true;
  }
  rmSync(COOLDOWN_FILE, { force: true });
  return false;
}

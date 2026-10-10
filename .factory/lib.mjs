/**
 * Shared helpers for the factory: shell, gh JSON, logging, locking, notifications.
 * Runs on a local machine (launchd) or in GitHub Actions (.github/workflows/factory.yml).
 */
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Code lives next to this file; mutable state (clones, worktrees, logs, locks) under FACTORY_HOME. */
export const ROOT = dirname(fileURLToPath(import.meta.url));
export const HOME = process.env.FACTORY_HOME || ROOT;
export const CI = process.env.GITHUB_ACTIONS === 'true';
export const CONFIG = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));
/** Which coding agent this process drives, and whether it runs the whole loop or only builds. */
export const ENGINE = process.env.FACTORY_ENGINE || 'claude';
export const ROLE = process.env.FACTORY_ROLE || 'full'; // 'full' | 'worker'

export const DIRS = {
  logs: join(HOME, 'logs'),
  clones: join(HOME, 'clones'),
  worktrees: join(HOME, 'worktrees'),
  locks: join(HOME, 'locks'),
};
for (const d of Object.values(DIRS)) mkdirSync(d, { recursive: true });

/** Commits made by the factory (and its Claude sessions) are attributed to the bot account, not the laptop's global git identity. */
if (CONFIG.gitIdentity) {
  const { name, email } = CONFIG.gitIdentity;
  Object.assign(process.env, {
    GIT_AUTHOR_NAME: name,
    GIT_AUTHOR_EMAIL: email,
    GIT_COMMITTER_NAME: name,
    GIT_COMMITTER_EMAIL: email,
  });
}

/** Child processes must not think they're nested inside another Claude Code session. */
const CHILD_ENV = { ...process.env };
delete CHILD_ENV.CLAUDECODE;
delete CHILD_ENV.CLAUDE_CODE_ENTRYPOINT;
// Unset secrets arrive as empty strings in Actions; an empty ANTHROPIC_API_KEY must not shadow the OAuth token.
for (const k of ['ANTHROPIC_API_KEY', 'CLAUDE_CODE_OAUTH_TOKEN']) if (!CHILD_ENV[k]) delete CHILD_ENV[k];

/**
 * Environment for Claude sessions: no GitHub credentials. The agent only commits locally;
 * the dispatcher pushes and opens PRs. This keeps a prompt-injected session from using the token.
 */
export const CLAUDE_ENV = { ...CHILD_ENV };
for (const k of ['GH_TOKEN', 'GITHUB_TOKEN', 'FACTORY_GH_TOKEN']) delete CLAUDE_ENV[k];

export function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(join(DIRS.logs, 'factory.log'), line + '\n');
}

/** Run a command. Throws on non-zero unless allowFail. Returns trimmed stdout. */
export function sh(cmd, args, { cwd, allowFail = false, input, timeoutMs, logFile, env = CHILD_ENV } = {}) {
  const res = spawnSync(cmd, args, {
    cwd,
    input,
    env,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    timeout: timeoutMs,
    killSignal: 'SIGTERM',
  });
  if (logFile) {
    appendFileSync(logFile, `\n$ ${cmd} ${args.join(' ')}\n${res.stdout ?? ''}${res.stderr ?? ''}`);
  }
  if (res.error && !allowFail) throw res.error;
  if (res.status !== 0 && !allowFail) {
    throw new Error(
      `${cmd} ${args.slice(0, 3).join(' ')} failed (${res.status}): ${(res.stderr || res.stdout || '').slice(-2000)}`,
    );
  }
  return {
    ok: res.status === 0 && !res.error,
    out: (res.stdout ?? '').trim(),
    err: (res.stderr ?? '').trim(),
    timedOut: res.error?.code === 'ETIMEDOUT',
  };
}

export function gh(args, opts = {}) {
  return sh('gh', args, opts);
}

export function ghJson(args) {
  const { out } = gh(args);
  return out ? JSON.parse(out) : null;
}

/** Simple directory lock with stale-PID detection. Returns release fn or null if held. */
export function acquireLock(name) {
  const dir = join(DIRS.locks, `${name}.lock`);
  const pidFile = join(dir, 'pid');
  try {
    mkdirSync(dir);
  } catch {
    const pid = Number(existsSync(pidFile) ? readFileSync(pidFile, 'utf8') : 0);
    let alive = false;
    try {
      if (pid) (process.kill(pid, 0), (alive = true));
    } catch {
      /* dead */
    }
    if (alive) return null;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir);
  }
  writeFileSync(pidFile, String(process.pid));
  return () => rmSync(dir, { recursive: true, force: true });
}

export function notify(title, message) {
  if (CI) {
    if (process.env.GITHUB_STEP_SUMMARY)
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- **${title}**: ${message}\n`);
    return;
  }
  sh('osascript', ['-e', `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`], {
    allowFail: true,
  });
}

export function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? '').toString());
}

export function prompt(name, vars) {
  return fill(readFileSync(join(ROOT, 'prompts', `${name}.md`), 'utf8'), vars);
}

/** Where this run happens, for issue/PR comments. WORKER identifies this factory in issue claims. */
export const HOST = CI
  ? `GitHub Actions run ${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : hostname();
export const WORKER = `${ENGINE}@${CI ? 'actions' : hostname().split('.')[0]}`;

export function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

const PRIORITY = { P0: 0, P1: 1, P2: 2 };
export function priorityOf(labels) {
  const names = labels.map((l) => (typeof l === 'string' ? l : l.name));
  return Math.min(...names.map((n) => PRIORITY[n] ?? 9), 9);
}

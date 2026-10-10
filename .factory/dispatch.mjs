#!/usr/bin/env node
/**
 * Factory dispatcher. Run every 30 min by GitHub Actions (.github/workflows/factory.yml), launchd, or manually.
 * Per repo, one step at a time:
 *
 *   1. In-flight PR (branch agent/issue-N, label agent:review)?
 *        CI pending            → wait (exit)
 *        CI green + mergeable  → squash-merge, clean up, continue
 *        CI red / conflict     → run a fix session (max N attempts), push, wait
 *                                 exhausted → label agent:failed
 *   2. Refill the queue from docs/CATALOG.md if it's low (plan.mjs).
 *   3. Take the highest-priority `agent:ready` issue → worktree → Claude session → push → PR.
 *
 * Each engine keeps at most one PR in flight, so changes land in order and rarely conflict.
 *
 * Several factories can share a repo (e.g. Claude in GitHub Actions + Codex on a laptop):
 *   FACTORY_ENGINE=claude|codex  which coding agent this process drives (engines.mjs)
 *   FACTORY_ROLE=full|worker     `full` does everything above; a `worker` only builds new issues
 *                                and leaves merging, fixing and planning to the full factory.
 * Each issue gets a claim comment naming the worker, so factories never take or recover
 * each other's issues.
 * Merging happens only after every check on the PR has passed, and never for PRs that touch
 * the automation itself (PROTECTED_PATHS) — those go to a human.
 *
 *   node dispatch.mjs              # normal run
 *   node dispatch.mjs --issue 42   # work on a specific issue now
 *   node dispatch.mjs --no-work    # only advance in-flight PRs + planner
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ENGINE_LABEL, coolingDown, runAgent } from './engines.mjs';
import {
  CI,
  CONFIG,
  DIRS,
  ENGINE,
  HOST,
  ROLE,
  WORKER,
  acquireLock,
  gh,
  ghJson,
  log,
  notify,
  priorityOf,
  prompt,
  sh,
  stamp,
} from './lib.mjs';
import { planRepo } from './plan.mjs';

const args = process.argv.slice(2);
const ONLY_ISSUE = args.includes('--issue') ? Number(args[args.indexOf('--issue') + 1]) : null;
const NO_WORK = args.includes('--no-work');
const FIX_MARKER = '<!-- factory:fix-attempt -->';
const INTERRUPT_MARKER = '<!-- factory:interrupted -->';
const CLAIM_RE = /<!-- factory:claim worker=(\S+) -->/;
/** A claim older than this is considered abandoned by whoever made it. */
const CLAIM_TTL_MS = 12 * 3_600_000;
/** Agent PRs touching these are never auto-merged: the factory must not rewrite its own rules or CI. */
const PROTECTED_PATHS = ['.factory/', '.github/', '.claude/settings'];
const LOG_HINT = CI ? 'Logs: see the `factory-logs` artifact of the run above.' : '';

function runRepo(repo) {
  let clone = syncClone(repo);
  recoverInterrupted(repo, clone);
  if (ROLE === 'full') {
    advanceInFlight(repo, clone);
    clone = syncClone(repo); // pick up anything merged above
    planRepo(repo);
  }
  if (NO_WORK) return;
  if (hasOpenPr(repo)) return log(`[${repo.name}] ${ENGINE} already has a PR in flight — waiting`);
  startNextIssue(repo, clone);
}

/** The most recent factory claim on an issue: { worker, at } or null. */
function claimOf(comments) {
  for (let i = comments.length - 1; i >= 0; i--) {
    const m = comments[i].body.match(CLAIM_RE);
    if (m) return { worker: m[1], at: Date.parse(comments[i].createdAt) };
  }
  return null;
}

/** Issues another live factory claimed recently are not ours to take or recover. */
function claimedByOther(comments) {
  const c = claimOf(comments);
  return Boolean(c && c.worker !== WORKER && Date.now() - c.at < CLAIM_TTL_MS);
}

/** Open agent PR built by this engine (PRs from before engine labels count as claude). */
function hasOpenPr(repo) {
  const prs = ghJson(['pr', 'list', '-R', repo.slug, '--state', 'open', '--label', 'agent:review', '--json', 'labels']);
  return prs.some((p) => {
    const engine = p.labels.find((l) => l.name.startsWith('engine:'))?.name.slice(7) ?? 'claude';
    return engine === ENGINE;
  });
}

/**
 * We hold this factory's lock, so an issue still `agent:in-progress` under our claim belongs to a
 * dead session (sleep, crash, reboot). Issues claimed by another factory are left alone.
 */
function recoverInterrupted(repo, clone) {
  const stuck = ghJson([
    'issue',
    'list',
    '-R',
    repo.slug,
    '--state',
    'open',
    '--label',
    'agent:in-progress',
    '--json',
    'number,comments',
  ]);
  for (const issue of stuck) {
    const claim = claimOf(issue.comments);
    // Legacy issues without a claim belong to the full factory.
    if (claim ? claimedByOther(issue.comments) : ROLE !== 'full') continue;
    const interruptions = issue.comments.filter((c) => c.body.includes(INTERRUPT_MARKER)).length;
    const next = interruptions + 1 >= 3 ? 'agent:failed' : 'agent:ready';
    log(`[${repo.name}] issue #${issue.number} was interrupted → ${next}`);
    gh(
      [
        'issue',
        'edit',
        String(issue.number),
        '-R',
        repo.slug,
        '--remove-label',
        'agent:in-progress',
        '--add-label',
        next,
      ],
      { allowFail: true },
    );
    gh(
      [
        'issue',
        'comment',
        String(issue.number),
        '-R',
        repo.slug,
        '--body',
        `${INTERRUPT_MARKER}\n🏭 The previous session was interrupted (machine slept or the process died). ${next === 'agent:ready' ? 'Re-queued.' : 'Interrupted 3 times — needs a human.'}`,
      ],
      { allowFail: true },
    );
    removeWorktree(repo, clone, issue.number);
  }
}

/* ───────────── clone / worktrees ───────────── */

function syncClone(repo) {
  const clone = join(DIRS.clones, repo.name);
  if (!existsSync(join(clone, '.git'))) {
    log(`[${repo.name}] cloning ${repo.slug}`);
    gh(['repo', 'clone', repo.slug, clone]);
  }
  sh('git', ['-C', clone, 'fetch', '--prune', 'origin']);
  sh('git', ['-C', clone, 'checkout', '-q', repo.baseBranch]);
  sh('git', ['-C', clone, 'reset', '-q', '--hard', `origin/${repo.baseBranch}`]);
  sh('git', ['-C', clone, 'worktree', 'prune']);
  return clone;
}

function worktreePath(repo, issue) {
  return join(DIRS.worktrees, repo.name, `issue-${issue}`);
}

function freshWorktree(repo, clone, issue, branch) {
  const wt = worktreePath(repo, issue);
  if (existsSync(wt)) sh('git', ['-C', clone, 'worktree', 'remove', '--force', wt], { allowFail: true });
  sh('git', ['-C', clone, 'worktree', 'add', '-q', '-B', branch, wt, `origin/${repo.baseBranch}`]);
  return wt;
}

function prWorktree(repo, clone, issue, branch) {
  const wt = worktreePath(repo, issue);
  sh('git', ['-C', clone, 'fetch', 'origin', branch]);
  if (!existsSync(wt)) sh('git', ['-C', clone, 'worktree', 'add', '-q', '-B', branch, wt, `origin/${branch}`]);
  sh('git', ['-C', wt, 'checkout', '-q', branch]);
  sh('git', ['-C', wt, 'reset', '-q', '--hard', `origin/${branch}`]);
  return wt;
}

/**
 * Push the branch after replaying it on the latest base branch. Without this, a branch cut before
 * main changed a workflow file looks like a workflow edit, which the PAT may not push.
 * A conflicting rebase is aborted; the PR then shows the conflict and gets a fix session.
 */
function pushBranch(repo, wt, branch, { allowFail = false, force = false } = {}) {
  sh('git', ['-C', wt, 'fetch', '-q', 'origin', repo.baseBranch], { allowFail: true });
  if (!sh('git', ['-C', wt, 'rebase', '-q', '--autostash', `origin/${repo.baseBranch}`], { allowFail: true }).ok) {
    sh('git', ['-C', wt, 'rebase', '--abort'], { allowFail: true });
    log(`[${repo.name}] ${branch} conflicts with ${repo.baseBranch}; pushing without rebase`);
  }
  return sh(
    'git',
    ['-C', wt, 'push', '-q', '-u', force ? '--force' : '--force-with-lease', 'origin', `${branch}:${branch}`],
    { allowFail },
  );
}

function removeWorktree(repo, clone, issue) {
  const wt = worktreePath(repo, issue);
  if (existsSync(wt)) sh('git', ['-C', clone, 'worktree', 'remove', '--force', wt], { allowFail: true });
}

function install(repo, wt, logFile) {
  const [cmd, ...rest] = repo.installCommand.split(' ');
  sh(cmd, rest, { cwd: wt, logFile, timeoutMs: 10 * 60_000 });
}

/* ───────────── resumable sessions ───────────── */

const STATE_DIR = join(DIRS.locks, 'resume');
mkdirSync(STATE_DIR, { recursive: true });
const resumeFile = (repo, issue) => join(STATE_DIR, `${repo.name}-${issue}.json`);
function saveResume(repo, issue, data) {
  writeFileSync(resumeFile(repo, issue), JSON.stringify(data));
}
function loadResume(repo, issue) {
  try {
    return JSON.parse(readFileSync(resumeFile(repo, issue), 'utf8'));
  } catch {
    return null;
  }
}
function clearResume(repo, issue) {
  rmSync(resumeFile(repo, issue), { force: true });
}

/* ───────────── in-flight PRs ───────────── */

function advanceInFlight(repo, clone) {
  const prs = ghJson([
    'pr',
    'list',
    '-R',
    repo.slug,
    '--state',
    'open',
    '--label',
    'agent:review',
    '--limit',
    '20',
    '--json',
    'number,headRefName,mergeable,statusCheckRollup,createdAt,comments,title',
  ]).filter((p) => p.headRefName.startsWith('agent/issue-'));

  let waiting = false;
  for (const pr of prs) {
    const issue = Number(pr.headRefName.split('-').pop());
    const checks = pr.statusCheckRollup ?? [];
    const pending = checks.some(
      (c) => (c.status && c.status !== 'COMPLETED') || c.state === 'PENDING' || c.state === 'EXPECTED',
    );
    const failed = checks.filter((c) =>
      ['FAILURE', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE', 'ERROR'].includes(
        c.conclusion || c.state,
      ),
    );
    const ageMin = (Date.now() - new Date(pr.createdAt).getTime()) / 60_000;

    if ((checks.length === 0 && ageMin < 15) || pending || pr.mergeable === 'UNKNOWN') {
      log(
        `[${repo.name}] PR #${pr.number} waiting (checks=${checks.length}, pending=${pending}, mergeable=${pr.mergeable})`,
      );
      waiting = true;
      continue;
    }

    if (failed.length === 0 && pr.mergeable === 'MERGEABLE' && checks.length > 0) {
      const files = gh(['pr', 'diff', String(pr.number), '-R', repo.slug, '--name-only']).out.split('\n');
      const protectedHits = files.filter((f) => PROTECTED_PATHS.some((p) => f.startsWith(p)));
      if (protectedHits.length) {
        log(`[${repo.name}] PR #${pr.number} touches protected paths → agent:human`);
        gh(
          [
            'pr',
            'edit',
            String(pr.number),
            '-R',
            repo.slug,
            '--remove-label',
            'agent:review',
            '--add-label',
            'agent:human',
          ],
          { allowFail: true },
        );
        gh(
          [
            'pr',
            'comment',
            String(pr.number),
            '-R',
            repo.slug,
            '--body',
            `🏭 Not auto-merging: this PR changes automation files (${protectedHits.map((f) => `\`${f}\``).join(', ')}). A human must review and merge it.`,
          ],
          { allowFail: true },
        );
        notify('Factory: needs human', `${repo.name} PR #${pr.number} touches automation files`);
        continue;
      }
      const merged = gh(['pr', 'merge', String(pr.number), '-R', repo.slug, '--squash', '--delete-branch'], {
        allowFail: true,
      });
      if (merged.ok) {
        log(`[${repo.name}] merged PR #${pr.number} (issue #${issue})`);
        gh(['issue', 'edit', String(issue), '-R', repo.slug, '--remove-label', 'agent:review'], { allowFail: true });
        removeWorktree(repo, clone, issue);
        notify('Factory: merged', `${repo.name} #${pr.number} ${pr.title}`.slice(0, 120));
        continue;
      }
      log(`[${repo.name}] merge of PR #${pr.number} failed: ${merged.err}`);
    }

    // Needs a fix: failed checks, conflict, or no checks reported at all.
    const attempts = pr.comments.filter((c) => c.body.includes(FIX_MARKER)).length;
    if (attempts >= CONFIG.session.maxFixAttempts) {
      log(`[${repo.name}] PR #${pr.number} exhausted fix attempts → agent:failed`);
      gh(
        [
          'pr',
          'edit',
          String(pr.number),
          '-R',
          repo.slug,
          '--remove-label',
          'agent:review',
          '--add-label',
          'agent:failed',
        ],
        { allowFail: true },
      );
      gh(
        [
          'issue',
          'edit',
          String(issue),
          '-R',
          repo.slug,
          '--remove-label',
          'agent:review',
          '--add-label',
          'agent:failed',
        ],
        { allowFail: true },
      );
      gh(
        [
          'issue',
          'comment',
          String(issue),
          '-R',
          repo.slug,
          '--body',
          `🏭 Factory gave up on PR #${pr.number} after ${attempts} fix attempts. A human should take a look, then relabel \`agent:ready\` (and close the PR) to retry from scratch.`,
        ],
        { allowFail: true },
      );
      notify('Factory: needs human', `${repo.name} PR #${pr.number}`);
      continue;
    }
    if (!coolingDown()) fixPr(repo, clone, pr, issue, failed, attempts);
    waiting = true;
  }
  return waiting ? 'waiting' : 'idle';
}

function fixPr(repo, clone, pr, issue, failed, attempts) {
  const branch = pr.headRefName;
  const logFile = join(DIRS.logs, `${repo.name}-pr${pr.number}-fix${attempts + 1}-${stamp()}.log`);
  const wt = prWorktree(repo, clone, issue, branch);
  if (!existsSync(join(wt, 'node_modules'))) install(repo, wt, logFile);

  let problem;
  let details = '';
  if (pr.mergeable === 'CONFLICTING') {
    problem = `The PR has merge conflicts with \`${repo.baseBranch}\`.`;
    details = sh('git', ['-C', wt, 'diff', '--stat', `origin/${repo.baseBranch}...HEAD`], { allowFail: true }).out;
  } else if (failed.length === 0) {
    problem =
      'No CI checks reported on this PR, or merging failed. Run `npm run verify` locally and fix anything failing.';
  } else {
    problem = `These checks failed: ${failed.map((c) => c.name || c.context).join(', ')}.`;
    const runs = ghJson([
      'run',
      'list',
      '-R',
      repo.slug,
      '--branch',
      branch,
      '--limit',
      '1',
      '--json',
      'databaseId,conclusion',
    ]);
    if (runs?.[0]) {
      details = gh(['run', 'view', String(runs[0].databaseId), '-R', repo.slug, '--log-failed'], {
        allowFail: true,
      }).out;
      details = details.split('\n').slice(-150).join('\n');
    }
  }

  const before = sh('git', ['-C', wt, 'rev-parse', 'HEAD']).out;
  const text = prompt('fix', {
    PR_NUMBER: pr.number,
    ISSUE_NUMBER: issue,
    REPO_SLUG: repo.slug,
    BRANCH: branch,
    BASE_BRANCH: repo.baseBranch,
    PROBLEM: problem,
    DETAILS: details || '(none)',
  });
  const session = runAgent(text, wt, logFile, { gitDir: join(clone, '.git') });
  if (session.limited) return log(`[${repo.name}] fix for PR #${pr.number} paused by usage limit`);
  const after = sh('git', ['-C', wt, 'rev-parse', 'HEAD']).out;

  if (after !== before) {
    pushBranch(repo, wt, branch);
    log(`[${repo.name}] pushed fix for PR #${pr.number}`);
  }
  const summary = (session.result || '(no summary)').slice(0, 3000);
  gh(
    [
      'pr',
      'comment',
      String(pr.number),
      '-R',
      repo.slug,
      '--body',
      `${FIX_MARKER}\n🏭 Fix attempt ${attempts + 1}/${CONFIG.session.maxFixAttempts}: ${problem}\n\n${summary}`,
    ],
    { allowFail: true },
  );
}

/* ───────────── new work ───────────── */

/**
 * Post a claim comment, then make sure no other factory claimed the issue just before us.
 * The earliest recent claim wins; a loser deletes its comment and backs off.
 */
function claim(repo, n) {
  const body = `<!-- factory:claim worker=${WORKER} -->\n🏭 ${ENGINE_LABEL} started a session (${HOST}) at ${new Date().toISOString()}.`;
  gh(['issue', 'comment', String(n), '-R', repo.slug, '--body', body]);
  const { comments } = ghJson(['issue', 'view', String(n), '-R', repo.slug, '--json', 'comments']);
  const recent = comments.filter((c) => CLAIM_RE.test(c.body) && Date.now() - Date.parse(c.createdAt) < 10 * 60_000);
  const winner = recent[0]?.body.match(CLAIM_RE)[1];
  if (!winner || winner === WORKER) return true;
  log(`[${repo.name}] issue #${n} was just claimed by ${winner} — backing off`);
  const mine = [...recent].reverse().find((c) => c.body.includes(`worker=${WORKER} `));
  const id = mine?.url?.match(/issuecomment-(\d+)/)?.[1];
  if (id) gh(['api', '-X', 'DELETE', `repos/${repo.slug}/issues/comments/${id}`], { allowFail: true });
  return false;
}

function startNextIssue(repo, clone) {
  let issues = ghJson([
    'issue',
    'list',
    '-R',
    repo.slug,
    '--state',
    'open',
    '--label',
    'agent:ready',
    '--limit',
    '200',
    '--json',
    'number,title,body,author,labels,comments',
  ]);
  issues = issues
    .filter((i) => repo.allowedAuthors.includes(i.author.login))
    .filter((i) => !i.labels.some((l) => ['agent:human', 'agent:in-progress', 'agent:review'].includes(l.name)))
    // e.g. paused by another factory's usage limit: that factory resumes it.
    .filter((i) => !claimedByOther(i.comments))
    .filter((i) => !ONLY_ISSUE || i.number === ONLY_ISSUE)
    .sort((a, b) => priorityOf(a.labels) - priorityOf(b.labels) || a.number - b.number);

  const issue = issues[0];
  if (!issue) return log(`[${repo.name}] no ready issues`);
  if (coolingDown()) return;

  const n = issue.number;
  const branch = `agent/issue-${n}`;
  const logFile = join(DIRS.logs, `${repo.name}-issue${n}-${stamp()}.log`);
  if (!claim(repo, n)) return;
  log(`[${repo.name}] starting issue #${n} with ${ENGINE_LABEL}: ${issue.title}`);
  gh([
    'issue',
    'edit',
    String(n),
    '-R',
    repo.slug,
    '--remove-label',
    'agent:ready',
    '--add-label',
    'agent:in-progress',
  ]);

  const fail = (why, detail = '') => {
    log(`[${repo.name}] issue #${n} failed: ${why}`);
    gh(
      [
        'issue',
        'edit',
        String(n),
        '-R',
        repo.slug,
        '--remove-label',
        'agent:in-progress',
        '--add-label',
        'agent:failed',
      ],
      { allowFail: true },
    );
    gh(
      [
        'issue',
        'comment',
        String(n),
        '-R',
        repo.slug,
        '--body',
        `🏭 Factory session did not produce a PR: **${why}**\n\n${detail.slice(0, 3000)}\n\n${LOG_HINT || `Log: \`${logFile}\``}`,
      ],
      { allowFail: true },
    );
    removeWorktree(repo, clone, n);
    notify('Factory: failed', `${repo.name} #${n} ${why}`.slice(0, 120));
  };

  const saved = loadResume(repo, n);
  let wt = worktreePath(repo, n);
  let resuming = Boolean(saved?.sessionId && existsSync(wt));
  if (!resuming && saved?.sessionId && saved.pushed) {
    // Actions runners are fresh: rebuild the worktree from the WIP branch pushed when the limit hit.
    try {
      wt = prWorktree(repo, clone, n, branch);
      install(repo, wt, logFile);
      resuming = true;
    } catch (e) {
      log(`[${repo.name}] could not restore WIP branch for #${n} (${e.message.split('\n')[0]}) — starting fresh`);
    }
  }
  if (!resuming) {
    clearResume(repo, n);
    try {
      wt = freshWorktree(repo, clone, n, branch);
      install(repo, wt, logFile);
    } catch (e) {
      return fail('setup error', String(e.message));
    }
  }

  const text = resuming
    ? 'Your previous session on this issue was cut off by a usage limit. Continue exactly where you left off (any uncommitted edits were saved in a `wip:` commit on this branch), finish the task, run `npm run verify`, commit, and end with the final report in the required format.'
    : prompt('work', {
        ISSUE_NUMBER: n,
        REPO_SLUG: repo.slug,
        BRANCH: branch,
        BASE_BRANCH: repo.baseBranch,
        ISSUE_TITLE: issue.title,
        ISSUE_BODY: issue.body,
        ISSUE_LABELS: issue.labels.map((l) => l.name).join(', '),
      });
  const session = runAgent(text, wt, logFile, {
    resume: resuming ? saved.sessionId : undefined,
    gitDir: join(clone, '.git'),
  });

  if (session.limited) {
    // Not the issue's fault: keep the work, remember the session, re-queue.
    // On a disposable runner the worktree dies with the job, so park the work on the branch.
    let pushed = false;
    if (CI && session.sessionId) {
      sh('git', ['-C', wt, 'add', '-A'], { allowFail: true });
      sh('git', ['-C', wt, 'commit', '-q', '-m', `wip: paused by usage limit (#${n})`], { allowFail: true });
      pushed = pushBranch(repo, wt, branch, { allowFail: true, force: true }).ok;
    }
    if (session.sessionId) saveResume(repo, n, { sessionId: session.sessionId, pushed, at: new Date().toISOString() });
    gh(
      [
        'issue',
        'edit',
        String(n),
        '-R',
        repo.slug,
        '--remove-label',
        'agent:in-progress',
        '--add-label',
        'agent:ready',
      ],
      { allowFail: true },
    );
    gh(
      [
        'issue',
        'comment',
        String(n),
        '-R',
        repo.slug,
        '--body',
        `🏭 Paused by the ${ENGINE} usage limit — this factory resumes the session after the limit resets.`,
      ],
      { allowFail: true },
    );
    return log(`[${repo.name}] issue #${n} paused (usage limit), will resume`);
  }
  clearResume(repo, n);

  if (/^BLOCKED:/m.test(session.result)) return fail('agent reported BLOCKED', session.result);
  const commits = Number(sh('git', ['-C', wt, 'rev-list', '--count', `origin/${repo.baseBranch}..HEAD`]).out);
  if (!commits) return fail(session.timedOut ? 'session timed out without commits' : 'no commits', session.result);

  const pushed = pushBranch(repo, wt, branch, { allowFail: true });
  if (!pushed.ok) return fail('push failed', pushed.err);
  const bodyFile = join(DIRS.logs, `pr-body-${n}-${stamp()}.md`);
  const report = session.result.includes('## Summary')
    ? session.result.slice(session.result.indexOf('## Summary'))
    : session.result;
  writeFileSync(
    bodyFile,
    `${report || '_No summary from the session._'}\n\nCloses #${n}\n\n---\n🏭 Built by the factory with **${ENGINE_LABEL}** (${HOST}). Merges automatically once all checks pass.\n`,
  );
  const pr = gh(
    [
      'pr',
      'create',
      '-R',
      repo.slug,
      '--head',
      branch,
      '--base',
      repo.baseBranch,
      '--title',
      issue.title.replace(/^\[[a-z]+\]\s*/, ''),
      '--body-file',
      bodyFile,
      '--label',
      'agent:review',
      '--label',
      `engine:${ENGINE}`,
    ],
    { allowFail: true },
  );
  if (!pr.ok) return fail('could not open PR', pr.err);

  gh(
    ['issue', 'edit', String(n), '-R', repo.slug, '--remove-label', 'agent:in-progress', '--add-label', 'agent:review'],
    { allowFail: true },
  );
  log(`[${repo.name}] opened ${pr.out} for issue #${n}`);
  notify('Factory: PR opened', `${repo.name} #${n} ${issue.title}`.slice(0, 120));
}

/* ───────────── main (last, so every const above is initialized) ───────────── */

for (const repo of CONFIG.repos) {
  const release = acquireLock(repo.name);
  if (!release) {
    log(`[${repo.name}] another run is active — skipping`);
    continue;
  }
  try {
    runRepo(repo);
  } catch (e) {
    log(`[${repo.name}] ERROR ${e.stack || e}`);
    notify('Factory error', `${repo.name}: ${String(e.message).slice(0, 120)}`);
  } finally {
    release();
  }
}

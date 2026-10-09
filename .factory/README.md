# Factory

An unattended loop that turns GitHub issues into merged PRs with Claude Code.
It runs every 30 minutes in GitHub Actions ([`.github/workflows/factory.yml`](../.github/workflows/factory.yml)).

Each run does one step per repo:

1. **In-flight PR** (`agent/issue-N`, label `agent:review`): squash-merge it once every check is green. If checks are red or the branch conflicts, run a fix session (at most `session.maxFixAttempts`). PRs that touch `.factory/`, `.github/` or `.claude/settings*` are never auto-merged; they get `agent:human`.
2. **Planner** ([`plan.mjs`](plan.mjs)): keeps the `agent:ready` queue filled from `docs/CATALOG.md`. When the catalog runs low it files a `type:catalog` research issue.
3. **Work**: takes the highest-priority `agent:ready` issue (P0 → P2, then oldest), creates a worktree, runs a Claude Code session ([`prompts/work.md`](prompts/work.md)), pushes the branch and opens a PR.

If a session hits the Claude usage limit, its work is pushed as a `wip:` commit, the issue goes back to `agent:ready`, and the next run after the reset resumes the same session.

## Labels

| Label               | Meaning                                                |
| ------------------- | ------------------------------------------------------ |
| `agent:proposed`    | Idea, waiting for a human to approve (→ `agent:ready`) |
| `agent:ready`       | Queued for the factory                                 |
| `agent:in-progress` | A session is working on it                             |
| `agent:review`      | PR open, waiting for checks / merge                    |
| `agent:failed`      | Gave up; relabel `agent:ready` to retry                |
| `agent:human`       | Needs a person (e.g. PR changes automation files)      |
| `P0` `P1` `P2`      | Priority                                               |

Only issues opened by `allowedAuthors` in [`config.json`](config.json) are picked up.

## Setup (one time)

Repository → **Settings → Secrets and variables → Actions**.

**Secrets**

| Name                      | What                                                                                                                                                                                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN` | Run `claude setup-token` on a machine logged in to the Claude subscription and paste the token. It shares that subscription's usage limit. (Alternative: `ANTHROPIC_API_KEY` for pay-as-you-go API billing.)                                                                                               |
| `FACTORY_GH_TOKEN`        | Fine-grained personal access token of the bot account (`betterbit-ai`), repository access: only this repo. Permissions: **Contents**, **Issues**, **Pull requests**: read & write; **Actions**, **Checks**, **Commit statuses**: read. It must not be `GITHUB_TOKEN`: PRs pushed with it don't trigger CI. |

**Variables**

| Name              | Value                                                                |
| ----------------- | -------------------------------------------------------------------- |
| `FACTORY_ENABLED` | `true` turns on the 30-minute schedule. Manual runs work without it. |

Only one factory may run against the repo at a time. Turn off any local copy (launchd) before enabling the schedule.

## Operating

- **Run now**: Actions → Factory → _Run workflow_ (optionally an issue number, or "no work" to only merge/plan).
- **Pause**: set `FACTORY_ENABLED` to `false`.
- **Model**: `session.model` in [`config.json`](config.json) (`sonnet` / `opus`).
- **Logs**: each run's summary shows the tail of the log; full session logs are in the `factory-logs` artifact.
- **Local run** (macOS): `FACTORY_HOME=~/factory node .factory/dispatch.mjs` with `gh` logged in as the bot.

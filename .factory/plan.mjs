#!/usr/bin/env node
/**
 * Planner: keeps the `agent:ready` queue filled from docs/CATALOG.md.
 * Deterministic (no LLM): turns `todo` catalog rows into well-formed issues, highest priority first.
 * When the catalog runs low, it files one `type:catalog` issue so an agent researches more tools.
 *
 *   node plan.mjs            # plan every repo in config.json
 *   node plan.mjs --dry-run  # print what would be created
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG, DIRS, gh, ghJson, log, stamp } from './lib.mjs';

const PRIORITY = { P0: 0, P1: 1, P2: 2 };

/** Parse `## <category>: …` sections and their markdown tables. */
export function parseCatalog(md) {
  const rows = [];
  let category = null;
  for (const line of md.split('\n')) {
    const h = line.match(/^## ([a-z]+):/);
    if (h) {
      category = h[1];
      continue;
    }
    if (!category || !line.startsWith('|') || /^\|\s*-/.test(line) || /^\|\s*slug\s*\|/.test(line)) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 6) continue;
    const [slug, name, keywords, edge, priority, status] = cells;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) continue;
    rows.push({ slug, name, keywords, edge, priority, status, category });
  }
  return rows;
}

function issueBody(row) {
  return `> Filed by the factory planner from \`docs/CATALOG.md\`. Build it with the \`new-tool\` skill.

### Slug
\`${row.slug}\`

### Category
\`${row.category}\`${['device', 'color', 'media'].includes(row.category) ? ' — **new category**: add it to `src/tools/categories.ts` first.' : ''}

### Tool
${row.name}

### Primary search queries
${row.keywords}

Research the real top queries per locale (en, ko) before writing content.

### Edge idea (starting point — confirm with research)
${row.edge}

### Acceptance criteria
- [ ] Competitor research done (top 3 results per locale opened); \`meta.competitors\` has concrete weaknesses
- [ ] \`meta.edges\` lists only true advantages, visible in the UI
- [ ] Logic in \`logic.ts\` with tests (boundaries, unicode, spec details)
- [ ] UI only from \`src/components/ui\` primitives + tokens; mobile, dark mode, keyboard OK
- [ ] All locales written natively; facts/specs verified
- [ ] \`related\` linked both ways with 2–4 existing tools
- [ ] \`docs/CATALOG.md\` row status → \`live\`
- [ ] \`npm run verify\` passes
`;
}

function catalogIssueBody(todoLeft) {
  return `> Filed by the factory planner: only ${todoLeft} \`todo\` rows remain in \`docs/CATALOG.md\`.

### Task
Research and add **at least 60 new tool ideas** to \`docs/CATALOG.md\`, following its existing table format and rules.

- Use WebSearch to find high-demand, client-side-feasible tools that are **not already in the catalog or live** (check \`src/tools/\`).
- Look at what calculator.net, omnicalculator, 123apps, tinywow, smallpdf, it-tools, Korean sites (e.g. 사람인 취업TOOL), and Japanese tool sites offer; also "X online" style long-tail queries.
- Prefer intents with strong search volume in English **and** at least one other locale (ko, ja, es…).
- Each row: slug (permanent, English kebab-case), Korean tool name, en/ko keywords, a concrete edge idea, priority (P0/P1/P2), status \`todo\`.
- Put rows under the right category section; add a new \`## <category>:\` section only if clearly needed (and note it must be added to \`src/tools/categories.ts\` when the first tool is built).
- Do not change code. Run \`npm run verify\` (format check) before committing.

### Acceptance criteria
- [ ] ≥ 60 new, non-duplicate rows with realistic keywords and edges
- [ ] No server-only tools (must run in the browser)
- [ ] \`npm run verify\` passes
`;
}

function auditIssueBody(slug) {
  return `> Filed by the factory planner: periodic quality audit of a live tool. Live slugs never change.

### Tool
\`src/tools/${slug}\` — https://betterbit.org/${slug} (ko: https://betterbit.org/ko/${slug})

### Task
Review this tool as a demanding user and a reviewer would, then fix what you find. Go through every point:

1. **Correctness** — read \`logic.ts\` and the browser code. Look for wrong results, edge cases (empty, huge, unicode/CJK, odd files), unhandled errors, memory blow-ups, work on the main thread that freezes the page. Add regression tests for anything you fix.
2. **The edge is real** — every \`meta.edges\` claim must be visible in the UI and true. Remove claims that aren't. Re-check 2–3 competitors (WebSearch) for a feature they now have that we lack; add it if it's small, or note it as \`(Strength: …)\`.
3. **UX** — clear first step, sensible defaults, keyboard access and visible focus, labels on every control, useful error messages, mobile layout (375px), dark mode via tokens only, no layout jumps.
4. **Content** — facts, numbers and specs correct; en and ko read naturally for real searchers (no machine-translation tone, no filler); title/description match what people search; FAQ answers real questions.
5. **SEO/links** — \`related\` points to 2–4 genuinely related tools (both ways), variants are useful landing pages, nothing that would trip \`npm run check:dist\`.

Keep changes focused on this tool (shared code only if the fix belongs there). Bump \`meta.updated\` when you change behavior or content. Run \`npm run format\` and \`npm run verify\`, then commit.

If the tool is already in good shape and nothing is worth changing, do not commit; reply with a first line \`NO_CHANGES: <one-sentence reason>\` followed by what you checked.

### Acceptance criteria
- [ ] All five areas checked; findings fixed (or explained in the report)
- [ ] Regression tests for fixed bugs
- [ ] \`npm run verify\` passes
`;
}

/** Live tools, oldest first (by meta.added, then slug). */
function liveTools(clone) {
  const dir = join(clone, 'src', 'tools');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'meta.ts')))
    .map((d) => {
      const meta = readFileSync(join(dir, d.name, 'meta.ts'), 'utf8');
      return { slug: d.name, added: meta.match(/added:\s*'([\d-]+)'/)?.[1] ?? '9999' };
    })
    .sort((a, b) => a.added.localeCompare(b.added) || a.slug.localeCompare(b.slug));
}

/**
 * Keep a few quality-audit issues queued for live tools that were never audited (oldest first).
 * The dispatcher alternates them with new tools.
 */
function planAudits(repo, open, allTitles, { dryRun }) {
  const want = repo.planner.auditQueue ?? 0;
  const queued = open.filter((i) => i.labels.some((l) => l.name === 'type:audit')).length;
  if (queued >= want) return;
  const audited = new Set(allTitles.map((t) => t.match(/^\[audit\] ([a-z0-9-]+):/)?.[1]).filter(Boolean));
  const next = liveTools(join(DIRS.clones, repo.name))
    .filter((t) => !audited.has(t.slug))
    .slice(0, want - queued);
  for (const t of next) {
    const title = `[audit] ${t.slug}: quality check`;
    if (dryRun) {
      log(`[${repo.name}] would create: ${title}`);
      continue;
    }
    const bodyFile = join(DIRS.logs, `issue-body-${stamp()}-audit-${t.slug}.md`);
    writeFileSync(bodyFile, auditIssueBody(t.slug));
    const { out } = gh([
      'issue',
      'create',
      '-R',
      repo.slug,
      '--title',
      title,
      '--body-file',
      bodyFile,
      '--label',
      'type:audit',
      '--label',
      'P1',
      '--label',
      'agent:ready',
    ]);
    log(`[${repo.name}] created audit ${out}`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2500);
  }
}

export function planRepo(repo, { dryRun = false } = {}) {
  const p = repo.planner;
  if (!p) return;
  const clone = join(DIRS.clones, repo.name);
  const catalog = parseCatalog(readFileSync(join(clone, p.catalogPath), 'utf8'));

  const open = ghJson([
    'issue',
    'list',
    '-R',
    repo.slug,
    '--state',
    'open',
    '--limit',
    '500',
    '--json',
    'number,title,labels',
  ]);
  const ready = open.filter((i) => i.labels.some((l) => l.name === 'agent:ready')).length;
  const all = ghJson(['issue', 'list', '-R', repo.slug, '--state', 'all', '--limit', '2000', '--json', 'title']);
  const filed = new Set(all.map((i) => i.title.match(/^\[tool\] ([a-z0-9-]+):/)?.[1]).filter(Boolean));
  planAudits(
    repo,
    open,
    all.map((i) => i.title),
    { dryRun },
  );

  const todo = catalog
    .filter((r) => r.status === 'todo' && !filed.has(r.slug))
    .map((r, i) => ({ ...r, order: i }))
    .sort((a, b) => (PRIORITY[a.priority] ?? 9) - (PRIORITY[b.priority] ?? 9) || a.order - b.order);

  log(`[${repo.name}] planner: ready=${ready} todo-unfiled=${todo.length}`);
  let created = 0;
  if (ready < p.queueMin) {
    const n = Math.max(0, p.queueTarget - ready);
    for (const row of todo.slice(0, n)) {
      const title = `[tool] ${row.slug}: ${row.name}`;
      const labels = ['type:new-tool', row.priority, 'agent:ready'].filter((l) => /^(P[0-2]|type:|agent:)/.test(l));
      if (dryRun) {
        created++;
        log(`[${repo.name}] would create: ${title} (${labels.join(', ')})`);
        continue;
      }
      const bodyFile = join(DIRS.logs, `issue-body-${stamp()}-${row.slug}.md`);
      writeFileSync(bodyFile, issueBody(row));
      const { out } = gh([
        'issue',
        'create',
        '-R',
        repo.slug,
        '--title',
        title,
        '--body-file',
        bodyFile,
        ...labels.flatMap((l) => ['--label', l]),
      ]);
      created++;
      log(`[${repo.name}] created ${out}`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2500); // stay under GitHub's content-creation rate limit
    }
  }

  const remaining = todo.length - created;
  const catalogOpen = open.some((i) => i.labels.some((l) => l.name === 'type:catalog'));
  // Expand only when the whole pipeline (unfiled rows + queued new-tool issues) is running low.
  const queuedNewTools = open.filter((i) => i.labels.some((l) => l.name === 'type:new-tool')).length;
  if (remaining + queuedNewTools + created < p.expandCatalogBelow && !catalogOpen) {
    const title = `[catalog] Add 60+ researched tool ideas to CATALOG.md`;
    if (dryRun) return log(`[${repo.name}] would create: ${title}`);
    const bodyFile = join(DIRS.logs, `issue-body-${stamp()}-catalog.md`);
    writeFileSync(bodyFile, catalogIssueBody(remaining));
    const { out } = gh([
      'issue',
      'create',
      '-R',
      repo.slug,
      '--title',
      title,
      '--body-file',
      bodyFile,
      '--label',
      'type:catalog',
      '--label',
      'P0',
      '--label',
      'agent:ready',
    ]);
    log(`[${repo.name}] created catalog issue ${out}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run');
  // --all: file every remaining `todo` row now instead of topping up to queueTarget.
  const all = process.argv.includes('--all');
  for (const repo of CONFIG.repos)
    planRepo(all ? { ...repo, planner: { ...repo.planner, queueMin: Infinity, queueTarget: Infinity } } : repo, {
      dryRun,
    });
}

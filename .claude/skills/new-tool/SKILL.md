---
name: new-tool
description: Build a new tool for the Betterbit Tools site end-to-end — competitor research, edge definition, logic + tests, Preact UI from design-system primitives, localized SEO/GEO content, verification. Use whenever asked to add, create or implement a tool (e.g. "QR 코드 생성기 만들어줘", "add a stopwatch", or a GitHub issue using the new-tool template).
---

# New tool workflow

Follow every step in order. Do not skip research or verification. Standards live in
`CLAUDE.md`, `docs/TOOL_PLAYBOOK.md` and `docs/DESIGN_SYSTEM.md`; read them first if you have not this session.

## 0. Pick and confirm the tool

- If the request names a tool, find its row in `docs/CATALOG.md` (slug, keywords, edge idea, category).
  If it's not there, add a row first.
- If the request is vague ("다음 도구 만들어줘"), pick the highest-priority `todo` row (P0 first).
- Check `src/tools/` — if a similar tool exists, extend it (variant/feature) instead of duplicating.

## 1. Competitor research → edge (mandatory)

1. Web-search the primary keyword in **English and Korean** (and any other active locale in
   `src/i18n/locales.ts`). Open the top 3 tool results for each.
2. For each, note: server upload? ads/popups/wait screens? sign-up or usage limits? clicks to result?
   missing features? accuracy issues? mobile UX? **what they do better than us**.
3. Decide `edges` (see the EdgeKind table in TOOL_PLAYBOOK §2). Only claim what is true.
   If you cannot find a real edge, stop and report back instead of building.
4. Write a short research note in your working summary — you'll put it into `meta.competitors`.

## 2. Scaffold

```bash
npm run new-tool -- <slug> <category>
```

If the category doesn't exist yet (e.g. `device`), add it to `src/tools/categories.ts`
(icon + name + 90–160 char description for every locale) first.

## 3. Logic first

- Put all computation in `logic.ts` (pure, no DOM). Browser-only work (Canvas, File, Audio) goes in a separate module like `image-resizer/resize.ts`.
- Write `logic.test.ts`: normal cases, boundaries (0, empty, max), unicode (Korean, emoji, CJK), and any tricky spec detail.
- `npx vitest run src/tools/<slug>` until green.

## 4. UI

- Copy the closest reference tool's structure:
  - input → results: `word-counter`
  - files in → files out: `image-resizer`
  - big display + controls: `timer`
- Use only `src/components/ui` primitives and token classes. No raw colors, no new one-off styles.
- Every visible string comes from the `ui` prop (`content.ts`). No hard-coded text.
- Sensible defaults so the tool is useful immediately; results update live (debounce heavy work).
- Persist user effort with `safeStorage` (`tools:<slug>:<key>`).
- Heavy dependencies: `await import()` at use time; keep page JS < 150 KB raw.

## 5. Content (every locale)

Fill `content.ts` and `meta.ts` following TOOL_PLAYBOOK §4:

- title starts with the main keyword; description answers the query + states the edge.
- sections contain specific facts (formulas, specs, limits, sources) — no filler.
- FAQ answers must stand alone (LLMs quote them) and include numbers where relevant.
- Localize, don't translate: use each language's real search terms and conventions.
- Verify any spec/number you state (web search) — wrong facts are worse than none.
- `related`: 2–4 existing tools; also add this tool to _their_ `related`.
- Consider `variants` only for proven high-volume sub-queries with a real preset.

## 6. Verify

```bash
npm run format && npm run verify
```

Fix every failure at the source. Never weaken a test to pass. Then open it in the browser
(`npm run dev` / preview tools):

- default state usable immediately
- 375 px mobile, dark mode, keyboard-only
- compare side by side with a competitor — is the edge obvious?

For non-trivial tools, run the `tool-reviewer` agent on the slug and address its findings.

## 7. Finish

- `docs/CATALOG.md`: set status to `live`.
- Commit: `feat(tool): add <slug> — <edge summary>`.
- Report: what was built, the edge, competitor notes, anything left as follow-up.

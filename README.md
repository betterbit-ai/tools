# Betterbit Tools

Fast, private, ad-free online tools — every one better than the alternatives on at least one axis.
Static Astro site; all processing happens in the browser.

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # the definition of done
npm run new-tool -- <slug> <category>
```

| Read                                           | For                                                         |
| ---------------------------------------------- | ----------------------------------------------------------- |
| [CLAUDE.md](CLAUDE.md)                         | Rules, structure, workflow — start here (humans and agents) |
| [docs/VISION.md](docs/VISION.md)               | Strategy, growth model, phases                              |
| [docs/COMPETITORS.md](docs/COMPETITORS.md)     | Reference sites and lessons                                 |
| [docs/TOOL_PLAYBOOK.md](docs/TOOL_PLAYBOOK.md) | How to research, build and write a tool                     |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Tokens, primitives, page anatomy                            |
| [docs/CATALOG.md](docs/CATALOG.md)             | Backlog of every tool to build                              |

## Deploy

Any static host. Recommended: Cloudflare Pages — build `npm run build`, output `dist`.
Set `SITE_URL` (e.g. `https://tools.example.com`) so canonical URLs, hreflang and the sitemap are correct.

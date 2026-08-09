<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/577Industries/.github/main/brand/out/wordmark-dark.svg">
  <img alt="577 Industries" height="44" src="https://raw.githubusercontent.com/577Industries/.github/main/brand/out/wordmark-light.svg">
</picture>

# forge-os-libs

`FORGE OS` · [program overview](https://github.com/577Industries#forge-os--agent-infrastructure)

**The five FORGE OS agent-infrastructure libraries, published independently to npm from one repository.**

[![CI](https://img.shields.io/github/actions/workflow/status/577Industries/forge-os-libs/ci.yml?branch=main&style=flat-square)](https://github.com/577Industries/forge-os-libs/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](LICENSE)
[![npm](https://img.shields.io/badge/npm-@577--industries-cb3837?style=flat-square)](https://www.npmjs.com/search?q=%40577-industries)

## Packages

Each package is versioned, released, and installed independently. The npm names are unchanged from when they lived in separate repositories.

| Package | Install | What it does |
|---|---|---|
| [`agent-memory`](packages/agent-memory) | `npm i @577-industries/agent-memory` | Layered agent memory with recall scoring |
| [`hashchain-audit`](packages/hashchain-audit) | `npm i @577-industries/hashchain-audit` | Tamper-evident hash-chained audit log |
| [`model-router`](packages/model-router) | `npm i @577-industries/model-router` | Multi-provider AI model routing with cost ceilings |
| [`tool-guardrails`](packages/tool-guardrails) | `npm i @577-industries/tool-guardrails` | Policy enforcement for agent tool calls |
| [`workflow-dag`](packages/workflow-dag) | `npm i @577-industries/workflow-dag` | Dependency-ordered workflow execution |

Each package keeps its own `README.md`, `LICENSE`, and `CITATION.cff` in its directory.

## Why one repository

The five libraries share an identical toolchain — the same `tsup` build, the same `vitest` setup, and a `tsconfig.json` that was byte-identical across all five. Splitting them across five repositories meant five copies of every config, five CI workflows, and five dependabot queues for the same dependency bumps.

Consolidating removes that duplication without changing anything a consumer sees: the npm package names, versions, and published file lists are unchanged.

## Development

```bash
npm install          # installs all workspaces
npm run lint         # tsc --noEmit across every package
npm run test         # vitest run across every package
npm run build        # tsup (ESM + CJS + .d.ts) across every package
npm run check        # lint, then test, then build
```

Target a single package with npm's workspace flag:

```bash
npm run test -w @577-industries/model-router
```

## History

This repository was assembled with `git subtree`, so every commit from the five original repositories is preserved in place — `git log packages/model-router` shows that library's full history, not a single import commit.

The original repositories are archived and read-only. Their releases, tags, and issue history remain available:
[forge-agent-memory](https://github.com/577Industries/forge-agent-memory) ·
[forge-hashchain-audit](https://github.com/577Industries/forge-hashchain-audit) ·
[forge-model-router](https://github.com/577Industries/forge-model-router) ·
[forge-tool-guardrails](https://github.com/577Industries/forge-tool-guardrails) ·
[forge-workflow-dag](https://github.com/577Industries/forge-workflow-dag)

## License

Apache-2.0. See [`LICENSE`](LICENSE).

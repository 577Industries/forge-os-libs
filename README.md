<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/577Industries/.github/main/brand/out/wordmark-dark.svg">
  <img alt="577 Industries" height="44" src="https://raw.githubusercontent.com/577Industries/.github/main/brand/out/wordmark-light.svg">
</picture>

# forge-tool-guardrails

`FORGE OS` · [program overview](https://github.com/577Industries#forge-os--agent-infrastructure)

**4-level guardrail middleware (none/log/pause/block) for AI agent tools with human-in-the-loop approval workflow.**

[![release](https://img.shields.io/github/v/release/577Industries/forge-tool-guardrails?style=flat-square)](https://github.com/577Industries/forge-tool-guardrails/releases) [![license](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](./LICENSE) [![npm](https://img.shields.io/npm/v/%40577-industries%2Ftool-guardrails?style=flat-square)](https://www.npmjs.com/package/@577-industries/tool-guardrails)

Wrap any tool with governance controls — from silent passthrough to full blocking. Zero runtime dependencies. Implements the core algorithm described in the **"Governed Autonomy Framework"** patent (January 2026) by 577 Industries.

## How It Works

```
  Tool Call
      │
      ▼
  ┌──────────────────┐
  │  Get Level for   │
  │  this tool       │
  └────────┬─────────┘
           │
     ┌─────┼──────┬──────────┐
     │     │      │          │
   none   log   pause      block
     │     │      │          │
   pass  execute  create   reject
   thru  + emit   pending   + emit
         event    op +      event
                  emit
```

## Quick Start

```bash
npm install @577-industries/tool-guardrails
```

```typescript
import { GuardrailMiddleware } from "@577-industries/tool-guardrails";

const middleware = new GuardrailMiddleware({
  rules: {
    read_data: "none",      // unrestricted
    write_data: "log",      // execute + emit event
    deploy: "pause",        // requires human approval
    delete_prod: "block",   // always rejected
  },
});

// Wrap your tools
const wrappedTool = middleware.wrap({
  name: "deploy",
  execute: async (args) => deployToProduction(args),
});

// Tool call gets paused — returns operation ID
const result = await wrappedTool.execute({ env: "prod" });
// { success: false, paused: true, operationId: "abc123..." }

// Human approves
await middleware.approve(result.operationId, "tech-lead");
```

## API Reference

### `GuardrailMiddleware`

| Method | Description |
|--------|-------------|
| `new GuardrailMiddleware(config)` | Create middleware with rules and options |
| `getLevel(toolName)` | Get effective guardrail level for a tool |
| `wrap(tool)` | Wrap a single tool with guardrail enforcement |
| `wrapAll(tools)` | Wrap multiple tools |
| `approve(opId, by)` | Approve a pending operation |
| `reject(opId, by)` | Reject a pending operation |
| `expireStale()` | Expire all past-due pending operations |
| `getOperationStore()` | Access the underlying operation store |

### Events

| Event | When |
|-------|------|
| `tool:executed` | Tool ran successfully (log level) |
| `tool:blocked` | Tool call was rejected (block level) |
| `tool:paused` | Tool call pending approval (pause level) |
| `operation:approved` | Pending operation was approved |
| `operation:rejected` | Pending operation was rejected |
| `operation:expired` | Pending operation expired |

### `PendingOperationStore` Interface

Implement for custom persistence (database, Redis, etc.):

```typescript
interface PendingOperationStore {
  create(op): Promise<PendingOperation>;
  get(id): Promise<PendingOperation | null>;
  approve(id, by): Promise<PendingOperation>;
  reject(id, by): Promise<PendingOperation>;
  expire(id): Promise<PendingOperation>;
  listPending(): Promise<PendingOperation[]>;
  expireStale(): Promise<PendingOperation[]>;
}
```

Built-in: `InMemoryOperationStore` (default).

## Architecture

The guardrail system resolves levels through a two-tier lookup:

1. **Per-tool rule** — check `rules[toolName]`
2. **Default level** — fall back to `defaultLevel` (default: `"log"`)

Based on the ["Governed Autonomy Framework" patent](https://www.577industries.com/forge) by 577 Industries.

---

Extracted from [FORGE OS](https://www.577industries.com) by **577 Industries**.

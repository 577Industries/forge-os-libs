<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/577Industries/.github/main/brand/out/wordmark-dark.svg">
  <img alt="577 Industries" height="44" src="https://raw.githubusercontent.com/577Industries/.github/main/brand/out/wordmark-light.svg">
</picture>

# forge-agent-memory

`FORGE OS` · [program overview](https://github.com/577Industries#forge-os--agent-infrastructure)

**Bio-inspired memory for AI agents with logarithmic reinforcement, exponential decay, and composite recall scoring.**

[![release](https://img.shields.io/github/v/release/577Industries/forge-agent-memory?style=flat-square)](https://github.com/577Industries/forge-agent-memory/releases) [![license](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](./LICENSE) [![npm](https://img.shields.io/npm/v/%40577-industries%2Fagent-memory?style=flat-square)](https://www.npmjs.com/package/@577-industries/agent-memory)

Implements the core algorithm described in the **"Autonomous Memory Evolution"** patent (December 2025) by 577 Industries.

## How It Works

```
  Input ──► Store ──► [Duplicate?] ──yes──► Reinforce
                          │                    │
                          no             confidence +=
                          │              0.1/ln(count+2)
                          ▼
                    New Memory (0.5)

  Recall ──► Score = similarity × 0.7 + confidence × 0.3 ──► Ranked Results

  Decay  ──► confidence *= 0.95 (per 30d unreinforced) ──► delete if < 0.1
```

## Quick Start

```bash
npm install @577-industries/agent-memory
```

```typescript
import { MemoryStore } from "@577-industries/agent-memory";

const store = new MemoryStore({ agentId: "my-agent" });

// Store memories (auto-deduplicates)
await store.store("pattern", "Users ask about pricing first");
await store.store("preference", "Prefers bullet-point summaries");

// Reinforce when pattern repeats
await store.store("pattern", "Users ask about pricing first");
// → { reinforced: true } — confidence increases logarithmically

// Recall top memories
const memories = await store.recall(undefined, 5);

// Format for LLM system prompt
const prompt = store.format(memories);
// → "## Agent Memory\n- [pattern] Users ask about..."

// Simulate time passing and decay
store.advanceTime(35); // 35 days
store.decay(); // → { decayed: N, deleted: M }
```

## Memory Types

| Type | Purpose |
|------|---------|
| `pattern` | Recurring workflow or behavior |
| `preference` | User preference or style |
| `baseline` | Metric or normal value |
| `entity` | Key entity or relationship |
| `insight` | Strategic observation |

## API Reference

### `MemoryStore`

| Method | Description |
|--------|-------------|
| `new MemoryStore(config)` | Create a store with optional embedding provider |
| `store(type, content)` | Store or reinforce a memory |
| `recall(query?, limit?)` | Recall ranked memories |
| `reinforce(id)` | Manually reinforce a memory |
| `decay()` | Run a decay cycle |
| `format(memories?)` | Format for LLM prompt injection |
| `getAll()` | Get all stored memories |
| `advanceTime(days)` | Simulate time passing |

### Pluggable Embeddings

```typescript
interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}
```

Without an embedding provider, the store falls back to substring matching for deduplication and confidence-only ranking for recall.

### Standalone Functions

| Function | Description |
|----------|-------------|
| `computeReinforcement(confidence, count)` | Logarithmic reinforcement formula |
| `applyDecay(memories, config)` | Exponential decay with cleanup |
| `scoreMemories(memories, embedding?, options?)` | Composite recall scoring |
| `cosineSimilarity(a, b)` | Vector cosine similarity |
| `formatMemoriesForPrompt(memories)` | Format for LLM injection |

## Architecture

Three bio-inspired mechanisms:

1. **Reinforcement** — `confidence += 0.1 / ln(count + 2)` — logarithmic growth with diminishing returns
2. **Decay** — `confidence *= 0.95` per 30-day unreinforced cycle — exponential fade
3. **Recall** — `score = similarity × 0.7 + confidence × 0.3` — composite ranking

Based on the ["Autonomous Memory Evolution" patent](https://www.577industries.com/forge) by 577 Industries.

---

Extracted from [FORGE OS](https://www.577industries.com) by **577 Industries**.

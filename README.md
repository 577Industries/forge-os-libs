# @577-industries/model-router

[![npm version](https://img.shields.io/npm/v/@577-industries/model-router)](https://www.npmjs.com/package/@577-industries/model-router)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

Multi-provider AI model router with 6 strategies, sovereign profile filtering, and composite scoring across 9+ providers. Zero runtime dependencies.

**Patent** "Adaptive Model Routing" (Feb 2026)

## What is this?

A standalone TypeScript library that routes AI requests to the optimal model based on cost, capability, speed, or a composite score. Supports 14 models across 9 providers out of the box, with full support for bring-your-own registry.

## How it works

```
  Strategy       Optimizes for
  -------------- ---------------------------------------------------
  cost           Lowest input cost per 1M tokens
  capability     Most capabilities (chat, tools, vision, etc.)
  speed          Fastest latency (fast > medium > slow)
  balanced       40% cost + 35% capability + 25% speed
  efficiency     Capability-to-cost ratio + open-source bonus (1.15x)
  custom         Category-to-model rules, falls back to balanced
```

## Quick start

```bash
npm install @577-industries/model-router
```

```typescript
import { createRouter } from "@577-industries/model-router";

// Default: balanced strategy, all 14 models
const router = createRouter();
const result = router.route();
console.log(result.model.displayName); // e.g. "Gemini 2.0 Flash"
console.log(result.score);              // composite score
console.log(result.isSlm);              // true if SLM

// Compare strategies
const cheapest = router.route({ strategy: "cost" });
const fastest = router.route({ strategy: "speed" });
const mostCapable = router.route({ strategy: "capability" });

// Sovereign mode: open-source only
const sovereign = router.route({ sovereignOnly: true });

// Cost ceiling
const budget = router.route({ maxCostPer1MInput: 1.0 });

// Require specific capabilities
const visionModel = router.route({ capabilities: ["vision", "tools"] });

// Cost estimation (cents)
const cost = router.estimateCost("gpt-4o", 100_000, 50_000);
```

## API reference

### `createRouter(config?)`

Factory function. Returns a `ModelRouter` instance.

| Config option           | Type                 | Default            | Description                        |
|-------------------------|----------------------|---------------------|------------------------------------|
| `registry`              | `ModelEntry[]`       | `DEFAUE�_REGISTRY` | Custom model registry              |
| `strategy`              | `RoutingStrategy`    | `"balanced"`        | Default routing strategy           |
| `maxCostPer1MInput`     | `number`             | `undefined`         | Cost ceiling filter                |
| `requiredCapabilities`  | `ModelCapability[]` | `undefined`         | Required model capabilities       |
| `preferredProvider`     | `ModelProvider`     | `undefined`         | Preferred provider (tiebreaker)   |
| `customRules`           | `CustomRoutingRule[]`| `undefined`         | Category-to-model mapping rules   |

### `router.route(request?)`

Route a request to the optimal model. Returns `RouteResult`.

| Request option          | Type                 | Description                        |
|-------------------------|----------------------|-------------------------------------|
| `capabilities`          | `ModelCapability[]` | Required capabilities for this request |
| `category`              | `string`             | Task category (for custom rules)   |
| `strategy`              | `RoutingStrategy`   | Override strategy per-request      |
| `maxCostPer1MInput`     | `number`             | Override cost ceiling per-request |
| `sovereignOnly`         | `boolean`            | Filter to open-source models only  |

### Other methods

| Method                                             | Returns                 |
|----------------------------------------------------|-------------------------|
| `estimateCost(modelId, inputTokens, outputTokens)`| `number` (cents)        |
| `getRegistry()`                                    | `ModelEntry[]`          |
| `getModelById(id)`                                 | `ModelEntry \| undefined`|
| `getModelsByProvider(provider)`                   | `ModelEntry[]`          |
| `getModelsWithCapabilities(caps)`                 | `ModelEntry[]`          |

### Exports

| Export                | Type       | Description                                      |
|-----------------------|------------|--------------------------------------------------|
| `createRouter`        | function   | Factory function - creates a ModelRouter       |
| `ModelRouter`         | class      | The router class                                |
| `DEFAULT_REGISTRY`    | const      | Built-in registry of 14 models                 |
| `estimateCost`        | function   | Standalone cost estimation                      |
| `isSlmModel`          | function   | SLM classification                              |
| `selectCheapest`      | function   | Cost strategy implementation                    |
| `selectMostCapable`   | function   | Capability strategy implementation             |
| `selectFastest`       | function   | Speed strategy implementation                   |
| `selectBalanced`      | function   | Balanced strategy implementation               |
| `selectMostEfficient` | function   | Efficiency strategy implementation             |
| `applyStrategy`       | function   | Dispatch to any strategy by name               |

## Model registry

14 models across 9 providers, included by default:

| Model                  | Provider   | Input $/1M | Output $/1M | Latency | Capabilities                  | Open Source |
|------------------------|------------|------------|--------------|----------|-------------------------------|-------------|
| Claude Sonnet 4        | Anthropic  | $3.00      | $15.00       | medium  | chat, tools, vision, analysis|             |
| Claude Haiku 4         | Anthropic  | $0.80      | $4.00        | fast    | chat, tools                   |             |
| Claude Opus 4          | Anthropic  | $15.00     | $75.00       | slow    | chat, tools, vision, analysis, code |    |
| GPT-4o                 | OpenAI     | $2.50      | $10.00       | medium  | chat, tools, vision, code    |             |
| GPT-4o Mini            | OpenAI     | $0.15      | $0.60        | fast    | chat, tools                   |             |
| Gemini 2.0 Flash       | Google     | $0.10      | $0.40        | fast    | chat, tools, vision          |             |
| Gemini 2.5 Pro         | Google     | $1.25      | $10.00       | medium  | chat, tools, vision, analysis|             |
| Llama 3.3 70B          | Groq       | $0.59      | $0.79        | fast    | chat, tools                   | Yes         |
| DeepSeek V3            | DeepSeek   | $0.27      | $1.10        | fast    | chat, tools, code            | Yes         |
| Mistral Large          | Mistral    | $2.00      | $6.00        | medium  | chat, tools, code            | Yes         |
| Mistral Small          | Mistral    | $0.10      | $0.30        | fast    | chat, tools, edge            | Yes         |
| Llama 3.1 8B           | Groq       | $0.05      | $0.08        | fast    | chat, tools, edge            | Yes         |
| Llama 3.1 8B (Together)| Together   | $0.18      | $0.18        | fast    | chat, tools, edge            | Yes         |
| Llama 3.1 8B (Fireworks)| Fireworks | $0.20      | $0.20        | fast    | chat, tools, edge            | Yes         |

## Architecture

This library implements the routing algorithms described in the "Adaptive Model Routing" patent (Feb 2026).

Key design decisions:
- Zero runtime dependencies
- No API keys, no provider SDK factories, no database
- Pure routing logic: give it models, get back the best one
- Bring-your-own registry supported
- Dual ESM/CJS build with full TypeScript declarations

---

Extracted from [FORGE OS](https://www.577industries.com/forge) by [577 Industries](https://www.577industries.com).

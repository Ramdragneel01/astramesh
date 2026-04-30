# AstraMesh

One secure mesh for your AI app fleet.

AstraMesh is evolving into an AI runtime control plane, not just a frontend launcher.

## What this project gives you

- Single shell UI to launch and use all integrated projects.
- Monorepo structure with `apps/shell` as the host application.
- Control-plane backend in `apps/api` for module contracts and health intelligence.
- Route-per-project workspace view with status checks and startup commands.
- One command to run shell-only, a core stack, or the full extended stack.

## Integrated projects

1. drift-watch
2. llm-judge
3. ragbench
4. prompt-ops
5. neuralscope
6. config-forge
7. interview-os
8. mlops-sentinel
9. agent-tracer
10. agentic-research-assistant
11. agentic-ui (Storybook)
12. context-watchdog (external docs/runtime)

Integration details are documented in `docs/INTEGRATION-MAP.md`.

## UI Screenshots By Project

### Observability

| Project | UI Screenshot |
| --- | --- |
| drift-watch | ![drift-watch dashboard overview](https://raw.githubusercontent.com/Ramdragneel01/drift-watch/main/docs/assets/dashboard-overview.png) |
| llm-judge | ![llm-judge dashboard overview](https://raw.githubusercontent.com/Ramdragneel01/llm-judge/main/docs/assets/dashboard-overview.png) |
| ragbench | ![ragbench dashboard overview](https://raw.githubusercontent.com/Ramdragneel01/ragbench/main/docs/assets/dashboard-overview.png) |
| neuralscope | ![neuralscope dashboard](https://raw.githubusercontent.com/Ramdragneel01/neuralscope/main/docs/assets/neuralscope-dashboard.png) |
| mlops-sentinel | UI screenshot pending in project README (`## Visual Evidence`). |

### Agentics

| Project | UI Screenshot |
| --- | --- |
| prompt-ops | ![prompt-ops dashboard overview](https://raw.githubusercontent.com/Ramdragneel01/prompt-ops/main/docs/assets/dashboard-overview.png) |
| agent-tracer | UI screenshot pending in project README. |
| agentic-research-assistant | UI screenshot pending in project README. |
| agentic-ui | ![agentic-ui storybook preview](https://raw.githubusercontent.com/Ramdragneel01/agentic-ui/main/docs/assets/storybook-preview.png) |

### Platform

| Project | UI Screenshot |
| --- | --- |
| config-forge | ![config-forge dashboard](https://raw.githubusercontent.com/Ramdragneel01/config-forge/main/docs/assets/config-forge-dashboard.png) |
| interview-os | ![interview-os dashboard](https://raw.githubusercontent.com/Ramdragneel01/interview-os/main/docs/assets/interview-os-dashboard.png) |
| context-watchdog | External docs/runtime integration. UI screenshot pending in project README. |

## Repository Tags And README Subheadings

| Project | Tags | README subheadings |
| --- | --- | --- |
| drift-watch | `observability`, `ml-monitoring`, `drift-detection` | Present (`## UI Preview`, `## Core Capabilities`, `## Quick Start`) |
| llm-judge | `observability`, `llm-evaluation`, `quality-scoring` | Present (`## UI Preview`, `## What It Does`, `## Quick Start`) |
| ragbench | `observability`, `rag-evaluation`, `benchmarking` | Present (`## UI Preview`, `## Stack`, `## Quick Start`) |
| prompt-ops | `agentics`, `prompt-lifecycle`, `governance` | Present (`## UI Preview`, `## Stack`, `## Quick Start`) |
| neuralscope | `observability`, `model-debugging`, `activation-analysis` | Present (`## Dashboard Screenshot`, `## Stack`, `## Quick Start`) |
| config-forge | `platform`, `config-governance`, `release-controls` | Present (`## Dashboard Screenshot`, `## Stack`, `## Quick Start`) |
| interview-os | `platform`, `workflow-orchestration`, `hiring-ops` | Present (`## Dashboard Screenshot`, `## Stack`, `## Quick Start`) |
| mlops-sentinel | `observability`, `telemetry`, `latency-monitoring` | Present (`## Visual Evidence`, `## Architecture Snapshot`, `## Quick Start`) |
| agent-tracer | `agentics`, `trace-visualization`, `execution-debugging` | Present (`## Features`, `## Project Layout`, `## Quick Start`) |
| agentic-research-assistant | `agentics`, `research-orchestration`, `multi-agent` | Present (`## Implemented Scope`, `## Repository Layout`, `## Quick Start`) |
| agentic-ui | `agentics`, `component-library`, `storybook` | Present (`## UI Preview`, `## Core Components`, `## Install`) |
| context-watchdog | `platform`, `policy-enforcement`, `runtime-guardrails` | Present (`## What It Does`, `## Architecture Snapshot`, `## Quick Start`) |

If you want direct image coverage for pending projects, add screenshot assets in those source
repos (for example: `docs/assets/dashboard-overview.png`) and update the links above.

## Monorepo layout

```text
astramesh/
  apps/
    api/
    shell/
      src/
  docs/
  package.json
```

## Run locally

From `c:\github_repos\astramesh`:

```powershell
npm install
npm run dev
```

Shell URL:

- `http://localhost:4300`

Control-plane API URL:

- `http://localhost:4310`

To run shell + control plane together:

```powershell
npm run dev:mesh
```

If workspace health shows `unknown`, ensure `npm run dev:mesh` is running. The shell now uses
control-plane probe API (`/api/health/probe`) to avoid browser CORS failures when checking
module health URLs.

To run shell + core 8 app stack:

```powershell
npm run dev:stack
```

To run shell + full extended stack (adds tracer, research assistant, agentic-ui Storybook):

```powershell
npm run dev:all
```

## Control-plane API (Phase 1)

The backend service in `apps/api` provides:

- `/health` and `/ready` runtime checks.
- Module contract registry (`POST /api/modules/register`).
- Telemetry ingestion (`POST /api/modules/:moduleId/telemetry`).
- Scored module status view (`GET /api/modules/status`).
- Service config introspection (`GET /api/config`).

See `docs/CONTROL-PLANE.md` for endpoint details and payload examples.

## GitHub Pages deployment

Deployment is intentionally paused until backend and module hosting are production-ready.

Pages workflow exists in `.github/workflows/pages.yml`, but it runs only when both are true:

1. You manually trigger `workflow_dispatch`.
2. Repository variable `ENABLE_ASTRAMESH_DEPLOY` is set to `true`.

When ready to re-enable deployment:

1. Set repository variable `ENABLE_ASTRAMESH_DEPLOY=true`.
2. Open repository settings and set Pages source to GitHub Actions.
3. Add repository variables for production module URLs:
  - `ALLOWED_IFRAME_ORIGINS`
  - `DEFAULT_USER_ROLE`
  - `DRIFT_WATCH_URL`
  - `LLM_JUDGE_URL`
  - `RAGBENCH_URL`
  - `PROMPT_OPS_URL`
  - `NEURALSCOPE_URL`
  - `CONFIG_FORGE_URL`
  - `INTERVIEW_OS_URL`
  - `MLOPS_SENTINEL_URL`
  - `AGENT_TRACER_URL`
  - `AGENTIC_RESEARCH_ASSISTANT_URL`
  - `AGENTIC_UI_URL`
  - `CONTEXT_WATCHDOG_URL`
4. Trigger `Deploy Pages (Paused)` manually from Actions.

CI checks run from `.github/workflows/ci.yml` for lint, test, and build gates.

## Security and accessibility defaults

- URL sanitization blocks unsafe iframe protocols.
- Shell only renders `http`/`https` integrations from allowlisted origins.
- Role-based module visibility limits what each operator persona can open.
- Control-plane API has CORS allowlisting, request IDs, and rate limiting.
- Keyboard-first navigation and visible focus styles.
- Skip link provided for screen-reader and keyboard users.

## Build and test

```powershell
npm run build
npm run test
```

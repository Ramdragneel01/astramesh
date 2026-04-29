# AstraMesh

One secure mesh for your AI app fleet.

## What this project gives you

- Single shell UI to launch and use all integrated projects.
- Monorepo structure with `apps/shell` as the host application.
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

## Monorepo layout

```text
astramesh/
  apps/
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

To run shell + core 8 app stack:

```powershell
npm run dev:stack
```

To run shell + full extended stack (adds tracer, research assistant, agentic-ui Storybook):

```powershell
npm run dev:all
```

## GitHub Pages deployment

This repository now includes deploy automation in `.github/workflows/pages.yml`.

1. Push this repo to GitHub.
2. Open repository settings and set Pages source to GitHub Actions.
3. Add repository variables (optional but recommended) for production module URLs:
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
4. Merge to `main` and GitHub Actions will build and publish the shell.

CI checks run from `.github/workflows/ci.yml` for lint, test, and build gates.

## Security and accessibility defaults

- URL sanitization blocks unsafe iframe protocols.
- Shell only renders `http`/`https` integrations from allowlisted origins.
- Role-based module visibility limits what each operator persona can open.
- Keyboard-first navigation and visible focus styles.
- Skip link provided for screen-reader and keyboard users.

## Build and test

```powershell
npm run build
npm run test
```

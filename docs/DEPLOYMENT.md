# AstraMesh Deployment Guide

## GitHub Pages (Shell)

Deployment is currently paused by design.

`Deploy Pages (Paused)` only runs when:

1. Workflow is manually triggered.
2. Repository variable `ENABLE_ASTRAMESH_DEPLOY` is `true`.

When backend and module endpoints are ready:

1. Set `ENABLE_ASTRAMESH_DEPLOY=true`.
2. In repository settings, enable Pages and select GitHub Actions as the source.
3. Ensure branch protection and required checks include `CI / quality-gates`.
4. Set repository variables for production integration URLs.
5. Trigger `Deploy Pages (Paused)` manually.

## Recommended production variables

- `DRIFT_WATCH_URL`
- `ALLOWED_IFRAME_ORIGINS`
- `DEFAULT_USER_ROLE`
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

If a variable is absent, the shell falls back to localhost endpoints for local development.

## Local release verification

```powershell
npm ci
npm run lint
npm run test
npm run build
```

## Security notes

- Integration URLs are sanitized to only allow `http` and `https`.
- If a URL is malformed or uses unsafe protocol, the module view is blocked.
- Keep external module origins in a controlled allowlist process during production onboarding.

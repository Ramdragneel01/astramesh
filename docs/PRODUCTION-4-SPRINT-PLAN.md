# AstraMesh Production Plan (4 Sprints, 2 Projects per Sprint)

Date: 2026-04-30
Execution rule: each sprint hardens two projects end-to-end before moving forward.

## Global Definition of Done (applies to every sprint project)

1. Backend contract parity: `/health`, `/ready`, `/healthz`, `/readyz`.
2. Request traceability: `X-Request-ID` generated or propagated on all responses.
3. Security baseline: `X-Content-Type-Options`, `X-Frame-Options`, CSP, optional HSTS via env.
4. API protection baseline: rate limiting and optional API key enforcement for non-probe endpoints.
5. Test gate: backend contract tests, unit tests, and failure-response tests in CI.
6. Deployment gate: Docker image build, compose validation, and documented production env variables.
7. Operability gate: health probes, structured logs, and runbook in docs.
8. AstraMesh integration gate: fixed port mapping, control-plane registration, and shell route validity.

## Sprint 1 (Week 1) - Observability Foundation

Projects:
1. drift-watch
2. llm-judge

Sprint outcomes:
1. Stabilize backend probe/auth/error contracts for both services.
2. Validate control-plane telemetry ingestion and status scoring.
3. Ensure deterministic startup in AstraMesh (`dev:stack` path for both).

Exit criteria:
1. Phase-0 gate passes for both repos.
2. Backend tests pass in CI and locally.
3. No dynamic port fallback during orchestrated startup.

## Sprint 2 (Week 2) - Evaluation and Prompt Reliability

Projects:
1. ragbench
2. prompt-ops

Sprint outcomes:
1. Enforce backend error contracts and security headers consistently.
2. Validate readiness behavior under dependency degradation.
3. Lock production env schema for deployment safety.

Exit criteria:
1. Phase-0 gate passes for both repos.
2. Contract tests include auth-required and structured-error checks.
3. Compose and release checks pass without manual fixes.

## Sprint 3 (Week 3) - ML Diagnostics and Sentinel Ops

Projects:
1. neuralscope
2. mlops-sentinel

Sprint outcomes:
1. Harden API reliability and failure handling for model diagnostics flows.
2. Add measurable SLO signals (latency, availability, error rate) into telemetry.
3. Validate backend load behavior for sustained API usage.

Exit criteria:
1. Phase-0 gate passes for both repos.
2. Stress/smoke checks show stable readiness and no fatal regressions.
3. Control-plane status remains accurate with live telemetry updates.

## Sprint 4 (Week 4) - Agent Runtime and Research Backend

Projects:
1. agent-tracer
2. agentic-research-assistant

Sprint outcomes:
1. Align backend endpoints to full probe alias contract.
2. Add phase-0 compatible auth/error contract tests.
3. Validate SSE and trace APIs under production-safe defaults.

Exit criteria:
1. Phase-0 gate passes for both repos using their real backend layout (`api/main.py`).
2. Frontend baseline dependencies for accessibility/testing are present.
3. AstraMesh `dev:extended` starts deterministically with fixed-route compatibility.

## Post-Sprint Carryover (same gate template)

Projects integrated in AstraMesh but outside this 4-sprint pair plan:
1. config-forge
2. interview-os
3. agentic-ui
4. context-watchdog

Carryover rule:
1. Apply the same Definition of Done and gate scripts.
2. Do not onboard to production shell routes without passing all required gates for that project type.
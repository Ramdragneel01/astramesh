# AstraMesh Production Roadmap

## Phase 1: Control Plane Foundation

- Introduce `apps/api` backend service as AstraMesh control plane.
- Add module contract registry and telemetry ingestion endpoints.
- Implement scored module status output (healthy/degraded/critical/unknown).
- Enforce CORS allowlist, request IDs, structured logs, and rate limiting.

## Phase 2: Shell and Backend Integration

- Wire shell health views to control-plane status APIs.
- Replace browser-only health checks with server-evaluated health intelligence.
- Add module onboarding flow that validates contract completeness.

## Phase 3: Trust and Access

- Add SSO for operator sign-in (GitHub OIDC or enterprise IdP).
- Enforce role-based module visibility in shell navigation.
- Add audit logging for module launches and backend control actions.

## Phase 4: Reliability and Operability

- Add synthetic checks and anomaly detection in control-plane backend.
- Add shell telemetry and uptime dashboard backed by control-plane events.
- Track module availability SLO and alert routing with escalation policy.

## Phase 5: Federation and Scale

- Move iframe integrations to module-federation or contract-based integration for tighter UX.
- Standardize cross-module event bus contracts.
- Add feature flags and staged rollout controls.

## Definition of production-grade for this portal

- CI must pass on every PR and main merge.
- Control-plane API lint/test/build gates must pass from main.
- GitHub Pages deploy must succeed from main once re-enabled.
- Each integrated module must have a documented health endpoint.
- Each integrated module must have a validated contract in control plane.
- Accessibility checks should be included in CI (axe/lighthouse).
- Security review includes URL allowlisting and CSP verification.

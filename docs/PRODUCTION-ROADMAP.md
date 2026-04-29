# Production Roadmap

## Phase 1: Public Shell Baseline

- Deploy AstraMesh Command Deck shell to GitHub Pages.
- Configure all available module URLs as repository variables.
- Add status badge section in README.

## Phase 2: Trust and Access

- Add SSO for operator sign-in (GitHub OIDC or enterprise IdP).
- Enforce role-based module visibility in shell navigation.
- Add audit logging for module launches.

## Phase 3: Reliability and Operability

- Add synthetic health checks for each integrated module.
- Add shell telemetry and uptime dashboard.
- Track module availability SLO and alert routing.

## Phase 4: Federation and Scale

- Move iframe integrations to module-federation or contract-based integration for tighter UX.
- Standardize cross-module event bus contracts.
- Add feature flags and staged rollout controls.

## Definition of production-grade for this portal

- CI must pass on every PR and main merge.
- GitHub Pages deploy must succeed from main.
- Each integrated module must have a documented health endpoint.
- Accessibility checks should be included in CI (axe/lighthouse).
- Security review includes URL allowlisting and CSP verification.

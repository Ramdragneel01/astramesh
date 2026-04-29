# Control Plane API

AstraMesh Control Plane (`apps/api`) is a backend service for module contracts,
telemetry ingestion, and scored health/status decisions.

Base URL (local): `http://localhost:4310`

## Security and runtime defaults

- CORS allowlist (configurable by env).
- Request ID propagation through `x-request-id`.
- Structured JSON request logging.
- Rate limiting.

## Endpoints

### `GET /health`

Returns liveness and process metadata.

Example response:

```json
{
  "status": "ok",
  "service": "astramesh-control-plane",
  "version": "0.1.0",
  "uptimeSec": 312,
  "time": "2026-04-29T15:33:57.201Z"
}
```

### `GET /ready`

Returns readiness status based on current module status summary.

### `GET /api/config`

Returns non-sensitive runtime configuration and policy values.

### `GET /api/modules`

Returns currently registered module contracts and latest telemetry values.

### `POST /api/modules/register`

Registers or updates a module contract.

Example request body:

```json
{
  "id": "model-hub",
  "name": "Model Hub",
  "category": "platform",
  "baseUrl": "http://localhost:5420",
  "healthUrl": "http://localhost:5420/health",
  "ownerTeam": "platform-core",
  "dependencies": ["config-forge"],
  "slo": {
    "availabilityPct": 99.9,
    "latencyP95Ms": 300,
    "errorRatePct": 0.5
  }
}
```

### `POST /api/modules/:moduleId/telemetry`

Ingests module telemetry snapshot.

Example request body:

```json
{
  "availabilityPct": 99.95,
  "latencyP95Ms": 220,
  "errorRatePct": 0.2,
  "observedAt": "2026-04-29T15:35:00.000Z"
}
```

### `GET /api/modules/status`

Returns scored module status output with per-metric breakdown and summary counts.

### `GET /api/modules/:moduleId/status`

Returns scored status output for a single module.

### `GET /api/health/probe?url=<target>`

Performs server-side health probing for module URLs so browser CORS policy does not block
health checks in the shell.

Example:

```text
GET /api/health/probe?url=http%3A%2F%2Flocalhost%3A5401
```

## Environment variables

- `ASTRA_CONTROL_PLANE_PORT` (default `4310`)
- `ASTRA_ALLOWED_ORIGINS` (comma-separated)
- `ASTRA_ALLOWED_PROBE_ORIGINS` (comma-separated, non-local probe origins)
- `ASTRA_PROBE_TIMEOUT_MS` (default `3500`)
- `ASTRA_REQUESTS_PER_MINUTE` (default `240`)
- `ASTRA_SEED_DEFAULTS` (default `true`)

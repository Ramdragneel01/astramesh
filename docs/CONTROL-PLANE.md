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

### `POST /api/orchestration/plan`

Builds a dependency-aware execution plan for one or more target modules.

The planner resolves transitive dependencies, computes execution stages,
and applies policy gates to block risky runs.

Example request body:

```json
{
  "targets": ["model-hub"],
  "policy": {
    "requireTelemetry": true,
    "blockOnCritical": true,
    "blockOnDegraded": false
  }
}
```

### `POST /api/orchestration/execute`

Creates an orchestration run from a dependency-aware plan and executes it stage by stage.

Execution behavior:

- Returns `202` when a run is accepted and queued.
- Returns `200` with `blocked` run state when policy/dependency constraints prevent execution.
- Returns `200` with `succeeded` run state when `dryRun=true`.

Example request body:

```json
{
  "targets": ["model-hub"],
  "policy": {
    "requireTelemetry": false,
    "blockOnCritical": true,
    "blockOnDegraded": false
  },
  "dryRun": false
}
```

### `GET /api/orchestration/runs?limit=<n>`

Returns recent orchestration runs (default limit `25`, max `100`).

### `GET /api/orchestration/runs/:runId`

Returns a single orchestration run, including per-step stage status and execution details.

Run statuses: `queued`, `running`, `succeeded`, `failed`, `blocked`, `cancelled`.

Example response shape:

```json
{
  "run": {
    "id": "0f13e2fa-a849-4ff2-838d-cd9bcc8a42d2",
    "status": "running",
    "createdAt": "2026-04-30T07:00:00.000Z",
    "startedAt": "2026-04-30T07:00:01.000Z",
    "cancelRequestedAt": "2026-04-30T07:00:10.000Z",
    "retriedFromRunId": "95f985a0-0f6c-4bcf-939c-bf4f45334fd1",
    "request": {
      "targets": ["model-hub"],
      "dryRun": false
    },
    "steps": [
      {
        "moduleId": "config-forge",
        "moduleName": "Config Forge",
        "stage": 1,
        "status": "succeeded",
        "detail": "Health probe succeeded with HTTP 200."
      },
      {
        "moduleId": "model-hub",
        "moduleName": "Model Hub",
        "stage": 2,
        "status": "running"
      }
    ]
  }
}
```

### `POST /api/orchestration/runs/:runId/cancel`

Requests cancellation for a queued or running orchestration run.

Execution behavior:

- Returns `202` when cancellation is accepted for an active `running` run.
- Returns `200` when cancellation is applied immediately to a `queued` run.
- Returns `200` with `accepted=false` when the run is already terminal.
- Returns `404` when the run ID is unknown.

Example response shape:

```json
{
  "run": {
    "id": "0f13e2fa-a849-4ff2-838d-cd9bcc8a42d2",
    "status": "cancelled",
    "cancelRequestedAt": "2026-04-30T07:00:10.000Z",
    "finishedAt": "2026-04-30T07:00:10.000Z"
  },
  "accepted": true
}
```

### `POST /api/orchestration/runs/:runId/retry`

Creates a new orchestration run from a terminal source run (`succeeded`, `failed`, `blocked`, or `cancelled`).

Execution behavior:

- Returns `202` when the retried run is accepted and queued.
- Returns `200` when the retried run is immediately terminal (for example blocked by policy).
- Returns `409` when the source run is still active (`queued` or `running`).
- Returns `404` when the source run ID is unknown.

Retry runs include `retriedFromRunId` to preserve lineage.

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

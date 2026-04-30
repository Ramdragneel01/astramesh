import { randomUUID } from "node:crypto";
import type { ModuleRecord } from "./types.js";
import type { ModuleRegistry } from "./registry.js";
import type { OrchestrationPlanRequest, OrchestrationPlanResult } from "./orchestration.js";

export type OrchestrationRunStatus = "queued" | "running" | "succeeded" | "failed" | "blocked" | "cancelled";

export type OrchestrationRunStepStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped"
  | "blocked"
  | "cancelled";

export interface OrchestrationExecutionRequest extends OrchestrationPlanRequest {
  dryRun: boolean;
}

export interface OrchestrationRunStep {
  moduleId: string;
  moduleName: string;
  stage: number;
  status: OrchestrationRunStepStatus;
  detail?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface OrchestrationRunRecord {
  id: string;
  status: OrchestrationRunStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  cancelRequestedAt?: string;
  retriedFromRunId?: string;
  request: OrchestrationExecutionRequest;
  plan: OrchestrationPlanResult;
  steps: OrchestrationRunStep[];
  error?: string;
}

interface CreateOrchestrationRunOptions {
  retriedFromRunId?: string;
}

interface StepExecutionOutcome {
  ok: boolean;
  detail: string;
}

interface ProbeResult {
  ok: boolean;
  httpStatus: number | null;
  error?: string;
}

function isoNow(): string {
  return new Date().toISOString();
}

function cloneRun(runRecord: OrchestrationRunRecord): OrchestrationRunRecord {
  return structuredClone(runRecord);
}

function updateRunStep(
  runRecord: OrchestrationRunRecord,
  moduleId: string,
  updater: (step: OrchestrationRunStep) => void
): void {
  const step = runRecord.steps.find((item) => item.moduleId === moduleId);
  if (!step) {
    return;
  }

  updater(step);
}

async function probeModuleHealth(targetUrl: string, timeoutMs: number): Promise<ProbeResult> {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      signal: timeoutController.signal
    });

    return {
      ok: response.ok,
      httpStatus: response.status
    };
  } catch (error) {
    return {
      ok: false,
      httpStatus: null,
      error: error instanceof Error ? error.message : "Probe failed"
    };
  } finally {
    clearTimeout(timer);
  }
}

function resolveStepStageMap(plan: OrchestrationPlanResult): Map<string, number> {
  const stageMap = new Map<string, number>();

  for (const stage of plan.stages) {
    for (const moduleId of stage.moduleIds) {
      stageMap.set(moduleId, stage.stage);
    }
  }

  return stageMap;
}

export class OrchestrationRunStore {
  private readonly runs = new Map<string, OrchestrationRunRecord>();

  create(runRecord: OrchestrationRunRecord): OrchestrationRunRecord {
    this.runs.set(runRecord.id, runRecord);
    return cloneRun(runRecord);
  }

  get(runId: string): OrchestrationRunRecord | undefined {
    const record = this.runs.get(runId);
    if (!record) {
      return undefined;
    }

    return cloneRun(record);
  }

  list(limit = 25): OrchestrationRunRecord[] {
    return [...this.runs.values()]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit)
      .map((item) => cloneRun(item));
  }

  update(
    runId: string,
    updater: (runRecord: OrchestrationRunRecord) => void
  ): OrchestrationRunRecord | undefined {
    const existing = this.runs.get(runId);
    if (!existing) {
      return undefined;
    }

    updater(existing);
    return cloneRun(existing);
  }

  requestCancel(runId: string): { run: OrchestrationRunRecord; accepted: boolean } | undefined {
    const existing = this.runs.get(runId);
    if (!existing) {
      return undefined;
    }

    let accepted = false;

    if (existing.status === "queued") {
      accepted = true;
      const now = isoNow();

      existing.cancelRequestedAt = now;
      existing.status = "cancelled";
      existing.finishedAt = now;
      existing.error = "Run cancelled before execution.";

      for (const step of existing.steps) {
        if (step.status === "pending") {
          step.status = "skipped";
          step.finishedAt = now;
          step.detail = "Skipped because run was cancelled before execution.";
        }
      }
    } else if (existing.status === "running") {
      if (!existing.cancelRequestedAt) {
        accepted = true;
        existing.cancelRequestedAt = isoNow();
      }
    }

    return {
      run: cloneRun(existing),
      accepted
    };
  }
}

export function createOrchestrationRun(
  registry: ModuleRegistry,
  plan: OrchestrationPlanResult,
  request: OrchestrationExecutionRequest,
  options: CreateOrchestrationRunOptions = {}
): OrchestrationRunRecord {
  const blockedReasonsByModuleId = new Map(
    plan.blockedModules.map((moduleItem) => [
      moduleItem.id,
      moduleItem.blockingReasons.join(" ")
    ])
  );

  const stageByModuleId = resolveStepStageMap(plan);
  const createdAt = isoNow();

  const runSteps: OrchestrationRunStep[] = plan.executionOrder.map((moduleId) => {
    const moduleRecord = registry.getModule(moduleId);
    const blockedReason = blockedReasonsByModuleId.get(moduleId);

    let stepStatus: OrchestrationRunStepStatus = "pending";
    let detail: string | undefined;

    if (!plan.canExecute) {
      stepStatus = blockedReason ? "blocked" : "skipped";
      detail = blockedReason ?? "Skipped because orchestration plan is not executable.";
    } else if (request.dryRun) {
      stepStatus = "skipped";
      detail = "Dry run mode. Step execution skipped.";
    }

    return {
      moduleId,
      moduleName: moduleRecord?.name ?? moduleId,
      stage: stageByModuleId.get(moduleId) ?? 0,
      status: stepStatus,
      detail,
      startedAt: request.dryRun ? createdAt : undefined,
      finishedAt: request.dryRun ? createdAt : undefined
    };
  });

  const runStatus: OrchestrationRunStatus = !plan.canExecute
    ? "blocked"
    : request.dryRun
      ? "succeeded"
      : "queued";

  return {
    id: randomUUID(),
    status: runStatus,
    createdAt,
    startedAt: request.dryRun ? createdAt : undefined,
    finishedAt: request.dryRun || !plan.canExecute ? createdAt : undefined,
    retriedFromRunId: options.retriedFromRunId,
    request,
    plan,
    steps: runSteps,
    error: !plan.canExecute
      ? "Execution blocked by orchestration policy or dependency constraints."
      : undefined
  };
}

function finalizeRunCancellation(
  runStore: OrchestrationRunStore,
  runId: string,
  reason: string
): void {
  runStore.update(runId, (runRecord) => {
    if (runRecord.status === "cancelled") {
      return;
    }

    const now = isoNow();

    for (const step of runRecord.steps) {
      if (step.status === "pending") {
        step.status = "skipped";
        step.finishedAt = now;
        step.detail = "Skipped because run was cancelled.";
      } else if (step.status === "running") {
        step.status = "cancelled";
        step.finishedAt = now;
        step.detail = "Cancelled while step was running.";
      }
    }

    runRecord.status = "cancelled";
    runRecord.error = reason;
    runRecord.finishedAt = now;
  });
}

async function executeRunStep(
  runStore: OrchestrationRunStore,
  runId: string,
  moduleRecord: ModuleRecord | undefined,
  moduleId: string,
  probeTimeoutMs: number
): Promise<StepExecutionOutcome> {
  runStore.update(runId, (runRecord) => {
    updateRunStep(runRecord, moduleId, (step) => {
      step.status = "running";
      step.startedAt = isoNow();
      step.detail = undefined;
    });
  });

  if (!moduleRecord) {
    const detail = `Module ${moduleId} is no longer registered.`;

    runStore.update(runId, (runRecord) => {
      updateRunStep(runRecord, moduleId, (step) => {
        step.status = "failed";
        step.finishedAt = isoNow();
        step.detail = detail;
      });
    });

    return { ok: false, detail };
  }

  if (!moduleRecord.healthUrl) {
    const detail = "No health URL configured. Step accepted as successful.";

    runStore.update(runId, (runRecord) => {
      updateRunStep(runRecord, moduleId, (step) => {
        step.status = "succeeded";
        step.finishedAt = isoNow();
        step.detail = detail;
      });
    });

    return { ok: true, detail };
  }

  const probe = await probeModuleHealth(moduleRecord.healthUrl, probeTimeoutMs);

  if (!probe.ok) {
    const detail = probe.httpStatus
      ? `Health probe failed with HTTP ${probe.httpStatus}.`
      : `Health probe failed: ${probe.error ?? "Unknown error"}.`;

    runStore.update(runId, (runRecord) => {
      updateRunStep(runRecord, moduleId, (step) => {
        step.status = "failed";
        step.finishedAt = isoNow();
        step.detail = detail;
      });
    });

    return { ok: false, detail };
  }

  const detail = probe.httpStatus
    ? `Health probe succeeded with HTTP ${probe.httpStatus}.`
    : "Health probe succeeded.";

  runStore.update(runId, (runRecord) => {
    updateRunStep(runRecord, moduleId, (step) => {
      step.status = "succeeded";
      step.finishedAt = isoNow();
      step.detail = detail;
    });
  });

  return { ok: true, detail };
}

export async function executeOrchestrationRun(
  runStore: OrchestrationRunStore,
  runId: string,
  registry: ModuleRegistry,
  probeTimeoutMs: number
): Promise<void> {
  const initialRun = runStore.get(runId);
  if (!initialRun || initialRun.status !== "queued") {
    return;
  }

  runStore.update(runId, (runRecord) => {
    runRecord.status = "running";
    runRecord.startedAt = isoNow();
  });

  for (const stage of initialRun.plan.stages) {
    const beforeStageRun = runStore.get(runId);
    if (!beforeStageRun || beforeStageRun.status !== "running") {
      return;
    }

    if (beforeStageRun.cancelRequestedAt) {
      finalizeRunCancellation(runStore, runId, "Run cancelled by operator request.");
      return;
    }

    const outcomes = await Promise.all(
      stage.moduleIds.map(async (moduleId) => {
        const moduleRecord = registry.getModule(moduleId);
        return executeRunStep(runStore, runId, moduleRecord, moduleId, probeTimeoutMs);
      })
    );

    const afterStageRun = runStore.get(runId);
    if (!afterStageRun || afterStageRun.status !== "running") {
      return;
    }

    if (afterStageRun.cancelRequestedAt) {
      finalizeRunCancellation(runStore, runId, "Run cancelled by operator request.");
      return;
    }

    const failedOutcome = outcomes.find((outcome) => !outcome.ok);
    if (failedOutcome) {
      runStore.update(runId, (runRecord) => {
        for (const step of runRecord.steps) {
          if (step.status === "pending") {
            step.status = "skipped";
            step.finishedAt = isoNow();
            step.detail = "Skipped due to previous stage failure.";
          }
        }

        runRecord.status = "failed";
        runRecord.error = failedOutcome.detail;
        runRecord.finishedAt = isoNow();
      });

      return;
    }
  }

  const completedRun = runStore.get(runId);
  if (!completedRun || completedRun.status !== "running") {
    return;
  }

  if (completedRun.cancelRequestedAt) {
    finalizeRunCancellation(runStore, runId, "Run cancelled by operator request.");
    return;
  }

  runStore.update(runId, (runRecord) => {
    runRecord.status = "succeeded";
    runRecord.finishedAt = isoNow();
  });
}
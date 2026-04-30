import type { ModuleRegistry } from "./registry.js";
import { evaluateModuleStatus } from "./scoring.js";

export interface OrchestrationPolicy {
  requireTelemetry: boolean;
  blockOnCritical: boolean;
  blockOnDegraded: boolean;
}

export interface OrchestrationPlanRequest {
  targets?: string[];
  policy: OrchestrationPolicy;
}

export interface OrchestrationStage {
  stage: number;
  moduleIds: string[];
}

export interface BlockedModule {
  id: string;
  name: string;
  state: "healthy" | "degraded" | "critical" | "unknown";
  score: number;
  blockingReasons: string[];
}

export interface ModuleExecutionStatus {
  id: string;
  state: "healthy" | "degraded" | "critical" | "unknown";
  score: number;
}

export interface UnresolvedDependency {
  moduleId: string;
  dependencyId: string;
}

export interface OrchestrationPlanResult {
  targets: string[];
  resolvedTargets: string[];
  executionOrder: string[];
  stages: OrchestrationStage[];
  unknownTargets: string[];
  unresolvedDependencies: UnresolvedDependency[];
  cyclicModules: string[];
  blockedModules: BlockedModule[];
  moduleStatuses: ModuleExecutionStatus[];
  canExecute: boolean;
}

export const DEFAULT_ORCHESTRATION_POLICY: OrchestrationPolicy = {
  requireTelemetry: false,
  blockOnCritical: true,
  blockOnDegraded: false
};

function createDeterministicQueue(items: string[]): string[] {
  return [...items].sort((left, right) => left.localeCompare(right));
}

export function buildOrchestrationPlan(
  registry: ModuleRegistry,
  request: OrchestrationPlanRequest
): OrchestrationPlanResult {
  const allModules = registry.listModules();
  const moduleMap = new Map(allModules.map((moduleRecord) => [moduleRecord.id, moduleRecord]));

  const requestedTargets = request.targets && request.targets.length > 0
    ? createDeterministicQueue([...new Set(request.targets)])
    : createDeterministicQueue(allModules.map((moduleRecord) => moduleRecord.id));

  const unknownTargets = requestedTargets.filter((targetId) => !moduleMap.has(targetId));
  const includedModuleIds = new Set<string>();
  const unresolvedDependencies: UnresolvedDependency[] = [];
  const unresolvedKeys = new Set<string>();

  const visitModule = (moduleId: string) => {
    if (includedModuleIds.has(moduleId)) {
      return;
    }

    const moduleRecord = moduleMap.get(moduleId);
    if (!moduleRecord) {
      return;
    }

    includedModuleIds.add(moduleId);

    for (const dependencyId of moduleRecord.dependencies) {
      const dependencyRecord = moduleMap.get(dependencyId);
      if (!dependencyRecord) {
        const key = `${moduleId}->${dependencyId}`;
        if (!unresolvedKeys.has(key)) {
          unresolvedKeys.add(key);
          unresolvedDependencies.push({
            moduleId,
            dependencyId
          });
        }
        continue;
      }

      visitModule(dependencyRecord.id);
    }
  };

  for (const targetId of requestedTargets) {
    visitModule(targetId);
  }

  const resolvedTargets = createDeterministicQueue([...includedModuleIds]);
  const dependents = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const moduleId of includedModuleIds) {
    dependents.set(moduleId, []);
    indegree.set(moduleId, 0);
  }

  for (const moduleId of includedModuleIds) {
    const moduleRecord = moduleMap.get(moduleId);
    if (!moduleRecord) {
      continue;
    }

    for (const dependencyId of moduleRecord.dependencies) {
      if (!includedModuleIds.has(dependencyId)) {
        continue;
      }

      indegree.set(moduleId, (indegree.get(moduleId) ?? 0) + 1);
      const dependencyDependents = dependents.get(dependencyId);
      if (dependencyDependents) {
        dependencyDependents.push(moduleId);
      }
    }
  }

  const queue = createDeterministicQueue(
    [...includedModuleIds].filter((moduleId) => (indegree.get(moduleId) ?? 0) === 0)
  );

  const executionOrder: string[] = [];
  while (queue.length > 0) {
    const nextModuleId = queue.shift();
    if (!nextModuleId) {
      continue;
    }

    executionOrder.push(nextModuleId);

    for (const dependentId of dependents.get(nextModuleId) ?? []) {
      const nextInDegree = (indegree.get(dependentId) ?? 0) - 1;
      indegree.set(dependentId, nextInDegree);
      if (nextInDegree === 0) {
        queue.push(dependentId);
      }
    }

    queue.sort((left, right) => left.localeCompare(right));
  }

  const orderedSet = new Set(executionOrder);
  const cyclicModules = createDeterministicQueue(
    [...includedModuleIds].filter((moduleId) => !orderedSet.has(moduleId))
  );

  const stageByModuleId = new Map<string, number>();
  for (const moduleId of executionOrder) {
    const moduleRecord = moduleMap.get(moduleId);
    if (!moduleRecord) {
      continue;
    }

    let stage = 1;
    for (const dependencyId of moduleRecord.dependencies) {
      if (!includedModuleIds.has(dependencyId)) {
        continue;
      }

      const dependencyStage = stageByModuleId.get(dependencyId);
      if (dependencyStage !== undefined) {
        stage = Math.max(stage, dependencyStage + 1);
      }
    }

    stageByModuleId.set(moduleId, stage);
  }

  const stageBuckets = new Map<number, string[]>();
  for (const [moduleId, stage] of stageByModuleId.entries()) {
    const existing = stageBuckets.get(stage) ?? [];
    existing.push(moduleId);
    stageBuckets.set(stage, existing);
  }

  const stages: OrchestrationStage[] = [...stageBuckets.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([stage, moduleIds]) => ({
      stage,
      moduleIds: createDeterministicQueue(moduleIds)
    }));

  const blockedModules: BlockedModule[] = [];
  const moduleStatuses: ModuleExecutionStatus[] = [];

  for (const moduleId of resolvedTargets) {
    const moduleRecord = moduleMap.get(moduleId);
    if (!moduleRecord) {
      continue;
    }

    const moduleStatus = evaluateModuleStatus(moduleRecord, registry.missingDependencies(moduleRecord));
    moduleStatuses.push({
      id: moduleStatus.id,
      state: moduleStatus.state,
      score: moduleStatus.score
    });

    const blockingReasons: string[] = [];
    if (moduleStatus.missingDependencies.length > 0) {
      blockingReasons.push(`Missing dependencies: ${moduleStatus.missingDependencies.join(", ")}.`);
    }

    if (request.policy.blockOnCritical && moduleStatus.state === "critical") {
      blockingReasons.push("Module health is critical under current policy.");
    }

    if (request.policy.blockOnDegraded && moduleStatus.state === "degraded") {
      blockingReasons.push("Module health is degraded under current policy.");
    }

    if (request.policy.requireTelemetry && moduleStatus.state === "unknown") {
      blockingReasons.push("Module has no telemetry and policy requires telemetry.");
    }

    if (blockingReasons.length > 0) {
      blockedModules.push({
        id: moduleStatus.id,
        name: moduleRecord.name,
        state: moduleStatus.state,
        score: moduleStatus.score,
        blockingReasons
      });
    }
  }

  const canExecute =
    unknownTargets.length === 0 &&
    unresolvedDependencies.length === 0 &&
    cyclicModules.length === 0 &&
    blockedModules.length === 0;

  return {
    targets: requestedTargets,
    resolvedTargets,
    executionOrder,
    stages,
    unknownTargets,
    unresolvedDependencies,
    cyclicModules,
    blockedModules,
    moduleStatuses: [...moduleStatuses].sort((left, right) => left.id.localeCompare(right.id)),
    canExecute
  };
}
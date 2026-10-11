import type { BuildStep } from "@fsl/shared";
import { buildSteps } from "../content/build-steps/index.js";

const byId = new Map(buildSteps.map((step) => [step.id, step]));
const bySlug = new Map(buildSteps.map((step) => [step.slug, step]));

export function getStep(id: string): BuildStep | undefined {
  return byId.get(id);
}

export function getStepBySlug(slug: string): BuildStep | undefined {
  return bySlug.get(slug);
}

/** All build steps in journey order (by `order`, not registry position). */
export function getOrderedSteps(steps: BuildStep[] = buildSteps): BuildStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

/** The steps just before and after this one, if any. */
export function getAdjacentSteps(
  id: string,
  steps: BuildStep[] = buildSteps,
): { previous?: BuildStep; next?: BuildStep } {
  const ordered = getOrderedSteps(steps);
  const index = ordered.findIndex((step) => step.id === id);
  if (index === -1) return {};
  return { previous: ordered[index - 1], next: ordered[index + 1] };
}

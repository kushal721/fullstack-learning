import type { BuildStep, FileTreeFolder, ProjectFile } from "@fsl/shared";
import { buildSteps } from "../content/build-steps/index.js";
import { projectFiles } from "../content/files.js";
import { getOrderedSteps } from "./build-journey.js";
import { buildFileTree } from "./project-files.js";

/** The Notes App as it is after a build step (spec §8). */
export type ProjectSnapshot = {
  /** 0 is the empty project before step 1. */
  order: number;
  files: ProjectFile[];
  tree: FileTreeFolder;
};

export type SnapshotDiff = {
  added: string[];
  removed: string[];
  /** Files that exist in both snapshots and were changed in between. */
  modified: string[];
};

/** File ids that exist after replaying steps 1..order. */
function fileIdsAt(order: number, steps: BuildStep[]): Set<string> {
  const ids = new Set<string>();
  for (const step of getOrderedSteps(steps)) {
    if (step.order > order) break;
    for (const id of step.filesCreated) ids.add(id);
    for (const id of step.filesRemoved) ids.delete(id);
  }
  return ids;
}

/**
 * The files after a step, derived by replaying each step's created and
 * removed files, so no step has to repeat the whole file list.
 */
export function getSnapshot(
  order: number,
  steps: BuildStep[] = buildSteps,
  files: ProjectFile[] = projectFiles,
): ProjectSnapshot {
  const ids = fileIdsAt(order, steps);
  const snapshotFiles = files.filter((file) => ids.has(file.id));
  return {
    order,
    files: snapshotFiles,
    tree: { ...buildFileTree(snapshotFiles), name: "notes-app" },
  };
}

/** What changed between two steps (from < to). Lists are sorted. */
export function diffSnapshots(
  from: number,
  to: number,
  steps: BuildStep[] = buildSteps,
): SnapshotDiff {
  const before = fileIdsAt(from, steps);
  const after = fileIdsAt(to, steps);
  const changed = new Set(
    getOrderedSteps(steps)
      .filter((step) => step.order > from && step.order <= to)
      .flatMap((step) => step.filesModified),
  );
  const sorted = (ids: Iterable<string>) => [...ids].sort();
  return {
    added: sorted([...after].filter((id) => !before.has(id))),
    removed: sorted([...before].filter((id) => !after.has(id))),
    modified: sorted(
      [...changed].filter((id) => before.has(id) && after.has(id)),
    ),
  };
}

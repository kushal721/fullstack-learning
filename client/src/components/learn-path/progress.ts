import type { Level } from "@fsl/shared";
import { useCallback, useSyncExternalStore } from "react";

/** What a learner has done in one topic's guided path. */
export type PathProgress = {
  /** Ids of the steps they finished. */
  done: string[];
  /** The step they were last on, per level, so switching back resumes it. */
  lastStep: Partial<Record<Level, string>>;
  /** The level they last looked at; Basic on a first visit. */
  level: Level;
  /** Levels whose "continues from …" note they closed. */
  dismissed: Level[];
};

const empty: PathProgress = {
  done: [],
  lastStep: {},
  level: "basic",
  dismissed: [],
};

// Kept for this browser tab only; saving across visits comes with #383.
const progress = new Map<string, PathProgress>();
const listeners = new Set<() => void>();

function update(topicId: string, change: (p: PathProgress) => PathProgress) {
  progress.set(topicId, change(progress.get(topicId) ?? empty));
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Forget all progress (used by tests and "Reset progress"). */
export function resetProgress(topicId?: string) {
  if (topicId) progress.delete(topicId);
  else progress.clear();
  for (const listener of listeners) listener();
}

/** One topic's progress and the ways to change it. */
export function usePathProgress(topicId: string) {
  const state = useSyncExternalStore(
    subscribe,
    () => progress.get(topicId) ?? empty,
  );
  const visit = useCallback(
    (level: Level, stepId?: string) =>
      update(topicId, (p) => ({
        ...p,
        level,
        lastStep: stepId ? { ...p.lastStep, [level]: stepId } : p.lastStep,
      })),
    [topicId],
  );
  const markDone = useCallback(
    (stepId: string) =>
      update(topicId, (p) =>
        p.done.includes(stepId) ? p : { ...p, done: [...p.done, stepId] },
      ),
    [topicId],
  );
  const dismiss = useCallback(
    (level: Level) =>
      update(topicId, (p) => ({ ...p, dismissed: [...p.dismissed, level] })),
    [topicId],
  );
  return { ...state, visit, markDone, dismiss };
}

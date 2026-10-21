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
  /** When they last did anything here (ms), for "continue where you left off". */
  updatedAt: number;
};

/** Saved in this browser only; there are no accounts (spec: M11 is optional). */
export const STORAGE_KEY = "fsl:path-progress:v1";

const LEVELS: Level[] = ["basic", "intermediate", "advanced"];
const empty: PathProgress = {
  done: [],
  lastStep: {},
  level: "basic",
  dismissed: [],
  updatedAt: 0,
};

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
const isLevel = (value: unknown): value is Level =>
  LEVELS.includes(value as Level);

/**
 * Whatever was saved, made safe: unknown fields are dropped and wrong types
 * replaced, so an old or hand-edited value can never break a page. Step ids
 * that no longer exist are harmless: pages only count ids they know.
 */
function clean(saved: unknown): Map<string, PathProgress> {
  const result = new Map<string, PathProgress>();
  if (typeof saved !== "object" || saved === null) return result;
  for (const [topicId, raw] of Object.entries(saved)) {
    if (typeof raw !== "object" || raw === null) continue;
    const value = raw as Record<string, unknown>;
    const lastStep: PathProgress["lastStep"] = {};
    if (typeof value.lastStep === "object" && value.lastStep !== null) {
      for (const [level, stepId] of Object.entries(value.lastStep)) {
        if (isLevel(level) && typeof stepId === "string") {
          lastStep[level] = stepId;
        }
      }
    }
    result.set(topicId, {
      done: [...new Set(strings(value.done))],
      lastStep,
      level: isLevel(value.level) ? value.level : "basic",
      dismissed: strings(value.dismissed).filter(isLevel),
      updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : 0,
    });
  }
  return result;
}

// Storage can be missing, full or blocked (private windows, strict
// settings): progress then simply lasts until the tab is closed.
function load(): Map<string, PathProgress> {
  try {
    return clean(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"));
  } catch {
    return new Map();
  }
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(progress)),
    );
  } catch {
    // Not saved; it still works for this visit.
  }
}

let progress = load();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function update(topicId: string, change: (p: PathProgress) => PathProgress) {
  progress = new Map(progress);
  progress.set(topicId, {
    ...change(progress.get(topicId) ?? empty),
    updatedAt: Date.now(),
  });
  persist();
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab saved progress: pick it up here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    progress = load();
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Forget one topic's progress, or all of it ("Reset progress", tests). */
export function resetProgress(topicId?: string) {
  progress = new Map(progress);
  if (topicId) progress.delete(topicId);
  else progress.clear();
  persist();
  notify();
}

/** Read the saved progress again (tests: as if the page were reloaded). */
export function reloadProgress() {
  progress = load();
  notify();
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

/**
 * The topic the learner worked on most recently, and the step they were
 * last on there, for "Continue where you left off". Undefined until then.
 */
export function useLatestProgress():
  { topicId: string; stepId: string } | undefined {
  // The Map is replaced on every change, so it is a stable snapshot.
  const all = useSyncExternalStore(subscribe, () => progress);
  let latest: [string, PathProgress] | undefined;
  for (const entry of all) {
    if (entry[1].lastStep[entry[1].level] === undefined) continue;
    if (!latest || entry[1].updatedAt > latest[1].updatedAt) latest = entry;
  }
  if (!latest) return undefined;
  const [topicId, p] = latest;
  return { topicId, stepId: p.lastStep[p.level]! };
}

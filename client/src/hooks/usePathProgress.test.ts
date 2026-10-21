import type { LevelSummary } from "@fsl/shared";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { doneIn, resumeStep } from "../components/learn-path/levels.ts";
import {
  STORAGE_KEY,
  reloadProgress,
  resetProgress,
  useLatestProgress,
  usePathProgress,
} from "./usePathProgress.ts";

const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");

describe("usePathProgress", () => {
  beforeEach(() => {
    resetProgress();
    localStorage.clear();
    reloadProgress();
  });
  afterEach(() => vi.restoreAllMocks());

  it("saves done steps and the last step per level, and keeps them across a reload", () => {
    const { result, unmount } = renderHook(() => usePathProgress("web"));
    act(() => {
      result.current.visit("basic", "basic-2");
      result.current.markDone("basic-1");
      result.current.markDone("basic-1");
      result.current.visit("intermediate", "intermediate-1");
    });

    expect(saved().web).toMatchObject({
      done: ["basic-1"],
      lastStep: { basic: "basic-2", intermediate: "intermediate-1" },
      level: "intermediate",
    });

    // As if the page were opened again later.
    unmount();
    reloadProgress();
    const again = renderHook(() => usePathProgress("web")).result.current;
    expect(again.done).toEqual(["basic-1"]);
    expect(again.lastStep.basic).toBe("basic-2");
    expect(again.level).toBe("intermediate");
  });

  it("keeps working after the content changes: a new step is simply not done yet", () => {
    const { result } = renderHook(() => usePathProgress("web"));
    act(() => {
      result.current.markDone("tags");
      result.current.markDone("links");
      result.current.markDone("removed-step");
      result.current.visit("basic", "links");
    });

    // A step was added in the middle, and one was removed.
    const step = (id: string, number: number) => ({
      id,
      number,
      level: "basic" as const,
      kind: "lesson" as const,
      title: id,
      minutes: 3,
    });
    const basic: LevelSummary = {
      level: "basic",
      outcome: "",
      firstNumber: 1,
      lastNumber: 3,
      minutes: 9,
      steps: [step("tags", 1), step("new-step", 2), step("links", 3)],
    };
    expect(doneIn(basic, result.current.done)).toBe(2);
    expect(resumeStep(basic, result.current).id).toBe("links");
    expect(
      resumeStep(basic, { done: result.current.done, lastStep: {} }).id,
    ).toBe("new-step");
  });

  it("ignores saved data that is broken or of the wrong shape", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        web: {
          done: ["a", 7, "a"],
          lastStep: { basic: "a", expert: "b", advanced: 3 },
          level: "expert",
          dismissed: ["intermediate", "nope"],
        },
        css: "nonsense",
      }),
    );
    reloadProgress();
    const web = renderHook(() => usePathProgress("web")).result.current;
    expect(web).toMatchObject({
      done: ["a"],
      lastStep: { basic: "a" },
      level: "basic",
      dismissed: ["intermediate"],
    });

    localStorage.setItem(STORAGE_KEY, "{not json");
    reloadProgress();
    expect(
      renderHook(() => usePathProgress("web")).result.current.done,
    ).toEqual([]);
  });

  it("still works for this visit when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const { result } = renderHook(() => usePathProgress("web"));
    act(() => result.current.markDone("basic-1"));
    expect(result.current.done).toEqual(["basic-1"]);
  });

  it("picks up progress saved in another tab", () => {
    const { result } = renderHook(() => usePathProgress("web"));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        web: { done: ["basic-4"], lastStep: {}, level: "basic" },
      }),
    );
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    });
    expect(result.current.done).toEqual(["basic-4"]);
  });

  it("resets one topic without touching the others", () => {
    const web = renderHook(() => usePathProgress("web"));
    const css = renderHook(() => usePathProgress("css"));
    act(() => {
      web.result.current.markDone("a");
      css.result.current.markDone("b");
    });
    act(() => resetProgress("web"));
    expect(web.result.current.done).toEqual([]);
    expect(css.result.current.done).toEqual(["b"]);
    expect(Object.keys(saved())).toEqual(["css"]);
  });
});

describe("useLatestProgress", () => {
  beforeEach(() => {
    resetProgress();
    localStorage.clear();
    reloadProgress();
  });

  it("is the step last visited in the most recently used topic", () => {
    const now = vi.spyOn(Date, "now");
    const latest = renderHook(() => useLatestProgress());
    expect(latest.result.current).toBeUndefined();

    const web = renderHook(() => usePathProgress("web"));
    const css = renderHook(() => usePathProgress("css"));
    now.mockReturnValue(1000);
    act(() => web.result.current.visit("intermediate", "intermediate-3"));
    now.mockReturnValue(2000);
    act(() => css.result.current.visit("basic", "basic-1"));
    expect(latest.result.current).toEqual({
      topicId: "css",
      stepId: "basic-1",
    });

    now.mockReturnValue(3000);
    act(() => web.result.current.visit("intermediate", "intermediate-4"));
    expect(latest.result.current).toEqual({
      topicId: "web",
      stepId: "intermediate-4",
    });
    now.mockRestore();
  });
});

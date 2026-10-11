import type { BuildStep } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import {
  getAdjacentSteps,
  getOrderedSteps,
  getStep,
  getStepBySlug,
} from "./build-journey.js";

describe("build journey", () => {
  it("has the 14 steps of the journey in order", () => {
    const steps = getOrderedSteps();
    expect(steps).toHaveLength(14);
    expect(steps.map((step) => step.order)).toEqual(
      Array.from({ length: 14 }, (_, index) => index + 1),
    );
    expect(steps[0]!.id).toBe("understand-the-application");
    expect(steps.at(-1)!.id).toBe("deploy");
  });

  it("finds a step by id and by slug", () => {
    expect(getStep("add-state")?.title).toBe("Add state");
    expect(getStepBySlug("add-state")?.id).toBe("add-state");
    expect(getStep("missing")).toBeUndefined();
    expect(getStepBySlug("missing")).toBeUndefined();
  });

  it("returns the previous and next steps", () => {
    const { previous, next } = getAdjacentSteps("add-state");
    expect(previous?.id).toBe("create-page");
    expect(next?.id).toBe("add-api-communication");

    expect(getAdjacentSteps("understand-the-application").previous).toBe(
      undefined,
    );
    expect(getAdjacentSteps("deploy").next).toBeUndefined();
    expect(getAdjacentSteps("missing")).toEqual({});
  });

  it("orders by `order`, not registry position", () => {
    const step = (id: string, order: number) =>
      ({ ...getStep("deploy")!, id, slug: id, order }) as BuildStep;
    const steps = [step("b", 2), step("a", 1)];
    expect(getOrderedSteps(steps).map((s) => s.id)).toEqual(["a", "b"]);
    expect(getAdjacentSteps("a", steps).next?.id).toBe("b");
  });
});

import type { PathResponse, StepResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

// The real How the Web Works path (no fixtures): its shape as the design
// numbers it, and every step answering.
const app = createApp();

describe("How the Web Works path", () => {
  it("has 18 Basic, 12 Intermediate and 10 Advanced steps, numbered 1–40", async () => {
    const res = await request(app).get("/api/paths/how-the-web-works");
    const body = res.body as PathResponse;

    expect(res.status).toBe(200);
    expect(
      body.levels.map((l) => [l.level, l.firstNumber, l.lastNumber]),
    ).toEqual([
      ["basic", 1, 18],
      ["intermediate", 19, 30],
      ["advanced", 31, 40],
    ]);
    expect(body.overviewScene.id).toBe("journey");
    for (const level of body.levels) {
      expect(level.steps.at(-1)!.kind).toBe("check");
    }
  });

  it("serves every step, and every level check has its questions", async () => {
    const path = (await request(app).get("/api/paths/how-the-web-works"))
      .body as PathResponse;
    for (const step of path.levels.flatMap((l) => l.steps)) {
      const res = await request(app).get(
        `/api/paths/how-the-web-works/steps/${step.id}`,
      );
      expect(res.status, step.id).toBe(200);
      const body = res.body as StepResponse;
      if (step.kind === "check") {
        expect(body.questions!.length, step.id).toBeGreaterThanOrEqual(4);
      } else {
        expect(body.blocks.length, step.id).toBeGreaterThan(0);
      }
    }
  });
});

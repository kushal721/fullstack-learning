import type { PathResponse, StepResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

// The real guided paths (no fixtures): their shape as the course map plans
// it, and every step answering.
const app = createApp();

const PLANNED: [
  topic: string,
  basic: number,
  intermediate: number,
  advanced: number,
][] = [
  ["how-the-web-works", 18, 30, 40],
  ["html", 20, 34, 43],
  ["css", 18, 30, 40],
  ["javascript", 18, 30, 39],
];

describe.each(PLANNED)(
  "the %s path",
  (topic, basicEnd, intermediateEnd, end) => {
    it(`is numbered 1–${basicEnd}, ${basicEnd + 1}–${intermediateEnd}, ${intermediateEnd + 1}–${end}`, async () => {
      const res = await request(app).get(`/api/paths/${topic}`);
      const body = res.body as PathResponse;

      expect(res.status).toBe(200);
      expect(
        body.levels.map((l) => [l.level, l.firstNumber, l.lastNumber]),
      ).toEqual([
        ["basic", 1, basicEnd],
        ["intermediate", basicEnd + 1, intermediateEnd],
        ["advanced", intermediateEnd + 1, end],
      ]);
      for (const level of body.levels) {
        expect(level.steps.at(-1)!.kind).toBe("check");
      }
    });

    it("serves every step, and every level check has its questions", async () => {
      const path = (await request(app).get(`/api/paths/${topic}`))
        .body as PathResponse;
      for (const step of path.levels.flatMap((l) => l.steps)) {
        const res = await request(app).get(
          `/api/paths/${topic}/steps/${step.id}`,
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
  },
);

describe("the JavaScript Functions module", () => {
  it("is step 9, in parts that cover all its blocks, with objectives", async () => {
    const path = (await request(app).get("/api/paths/javascript"))
      .body as PathResponse;
    const summary = path.levels[0]!.steps.find((s) => s.id === "functions")!;
    expect(summary.number).toBe(9);

    const body = (
      await request(app).get("/api/paths/javascript/steps/functions")
    ).body as StepResponse;
    expect(summary.parts).toBe(body.sections!.length);
    expect(body.objectives!.length).toBeGreaterThanOrEqual(3);
    expect(body.sections!.reduce((n, s) => n + s.blockCount, 0)).toBe(
      body.blocks.length,
    );
    const types = new Set(body.blocks.map((b) => b.type));
    for (const type of ["anatomy", "trace", "yourTurn", "mistake", "check"]) {
      expect(types, type).toContain(type);
    }
  });
});

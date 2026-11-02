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
  ["javascript", 11, 17, 24],
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

// The JavaScript modules: [step id, its number in Basic].
const JS_MODULES: [id: string, number: number][] = [
  ["getting-started", 1],
  ["variables", 2],
  ["text-and-numbers", 3],
  ["decisions", 4],
  ["loops", 5],
  ["functions", 6],
  ["arrays", 7],
  ["objects", 8],
  ["the-dom", 9],
  ["events", 10],
  ["json", 12],
  ["async", 13],
  ["errors", 14],
  ["modules-and-syntax", 15],
  ["reading-the-notes-api", 16],
  ["closures", 18],
  ["event-loop", 19],
  ["this-and-classes", 20],
  ["references", 21],
  ["typescript", 22],
];

describe.each(JS_MODULES)("the JavaScript %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, async () => {
    const path = (await request(app).get("/api/paths/javascript"))
      .body as PathResponse;
    const summary = path.levels
      .flatMap((level) => level.steps)
      .find((s) => s.id === id)!;
    expect(summary.number).toBe(number);

    const body = (await request(app).get(`/api/paths/javascript/steps/${id}`))
      .body as StepResponse;
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

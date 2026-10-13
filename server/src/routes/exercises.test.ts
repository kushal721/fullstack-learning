import type {
  CheckAnswerResponse,
  ExerciseListResponse,
  ExerciseResponse,
} from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { exercises } from "../content/exercises/index.js";

const app = createApp();

// Fields that hold an answer, or the explanation shown after checking.
const SECRETS = [
  "correctChoiceId",
  "symbolIds",
  "distractorIds",
  "acceptedIds",
  "required",
  "modelAnswer",
  "explanation",
];
const expectNoAnswers = (body: unknown) => {
  const text = JSON.stringify(body);
  for (const secret of SECRETS)
    expect(text, secret).not.toContain(`"${secret}"`);
};

describe("GET /api/exercises", () => {
  it("lists every exercise without answers", async () => {
    const res = await request(app).get("/api/exercises");
    const body = res.body as ExerciseListResponse;
    expect(res.status).toBe(200);
    expect(body.exercises.map((e) => e.id)).toEqual(exercises.map((e) => e.id));
    expectNoAnswers(body);
  });

  it("filters by mode", async () => {
    const res = await request(app).get("/api/exercises?mode=trace");
    const body = res.body as ExerciseListResponse;
    expect(res.status).toBe(200);
    expect(body.exercises.length).toBeGreaterThan(0);
    expect(body.exercises.every((e) => e.mode === "trace")).toBe(true);
    expect(body.exercises[0]).toMatchObject({
      startSymbolId: "fn:handleSave",
      endSymbolId: "table:notes",
    });
  });

  it.each(["quiz", "TRACE", ""])("returns 400 for mode=%s", async (mode) => {
    const res = await request(app).get(`/api/exercises?mode=${mode}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({
      code: "VALIDATION_ERROR",
      message: "mode must be one of: predict, trace, find, fix, build.",
    });
  });
});

describe("GET /api/exercises/:id", () => {
  it.each(exercises.map((e) => e.id))(
    "returns %s without its answer",
    async (id) => {
      const res = await request(app).get(`/api/exercises/${id}`);
      const body = res.body as ExerciseResponse;
      expect(res.status).toBe(200);
      expect(body.exercise.id).toBe(id);
      expectNoAnswers(body);
    },
  );

  it("returns 404 for an unknown exercise and 400 for a malformed id", async () => {
    const missing = await request(app).get("/api/exercises/no-such-thing");
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({
      error: { code: "NOT_FOUND", message: 'No exercise "no-such-thing".' },
    });
    const bad = await request(app).get("/api/exercises/Bad_Id");
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/exercises/:id/check", () => {
  const check = (id: string, body: unknown) =>
    request(app)
      .post(`/api/exercises/${id}/check`)
      .send(body as object);

  it("checks a right and a wrong answer and reveals the expected one", async () => {
    const right = await check("predict-blank-title", {
      answer: { choiceId: "server-400" },
    });
    expect(right.status).toBe(200);
    expect(right.body as CheckAnswerResponse).toEqual({
      correct: true,
      explanation: expect.stringContaining("validateNote"),
      expected: { choiceId: "server-400" },
    });

    const wrong = await check("predict-blank-title", {
      answer: { choiceId: "browser-blocks" },
    });
    expect(wrong.status).toBe(200);
    expect(wrong.body).toMatchObject({
      correct: false,
      expected: { choiceId: "server-400" },
    });
  });

  it("checks every mode", async () => {
    const trace = await check("trace-save-to-database", {
      answer: {
        symbolIds: [
          "fn:handleSave",
          "fn:notesApi.createNote",
          "fn:request",
          "external:fetch",
          "http-request:POST /api/notes",
          "route:POST /api/notes",
          "controller:notesController.createNote",
          "query:insertNote",
          "table:notes",
        ],
      },
    });
    expect(trace.body.correct).toBe(true);
    const find = await check("find-note-validation", {
      answer: { id: "backend/src/validation/noteValidation.js" },
    });
    expect(find.body.correct).toBe(true);
    const fix = await check("fix-delete-any-note", {
      answer: { choiceId: "hide-button" },
    });
    expect(fix.body).toMatchObject({
      correct: false,
      expected: { choiceId: "add-user-filter" },
    });
    const build = await check("build-favorite-notes", {
      answer: { itemIds: ["schema", "routes"] },
    });
    expect(build.body.correct).toBe(false);
    expect(build.body.expected.modelAnswer.length).toBeGreaterThan(0);
  });

  it.each([
    [{}, 'Send a JSON body like { "answer": { … } }.'],
    [{ answer: "server-400" }, 'Send a JSON body like { "answer": { … } }.'],
    [{ answer: [] }, 'Send a JSON body like { "answer": { … } }.'],
    [{ answer: { id: "server-400" } }, "The answer needs a `choiceId` (text)."],
    [{ answer: { choiceId: 4 } }, "The answer needs a `choiceId` (text)."],
  ])("returns 400 for the wrong shape: %j", async (body, message) => {
    const res = await check("predict-blank-title", body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "VALIDATION_ERROR", message } });
  });

  it("returns 400 for a body that isn't JSON at all", async () => {
    const res = await request(app)
      .post("/api/exercises/predict-blank-title/check")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("The request body isn't valid JSON.");
  });

  it("returns 404 for an unknown exercise", async () => {
    const res = await check("no-such-thing", { answer: { choiceId: "a" } });
    expect(res.status).toBe(404);
  });
});

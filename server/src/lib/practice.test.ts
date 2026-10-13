import type { Exercise, ExerciseAnswer, ExpectedAnswer } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import { exercises } from "../content/exercises/index.js";
import { answerError, checkAnswer, toPublic } from "./practice.js";

const base = {
  title: "T",
  prompt: "P",
  conceptIds: [],
  hints: ["h"],
  explanation: "Because.",
};
const predict: Exercise = {
  ...base,
  id: "p",
  mode: "predict",
  choices: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
  ],
  correctChoiceId: "b",
};
const trace: Exercise = {
  ...base,
  id: "t",
  mode: "trace",
  symbolIds: ["fn:z", "fn:a", "fn:m"],
  distractorIds: ["fn:b"],
};
const find: Exercise = {
  ...base,
  id: "f",
  mode: "find",
  target: "file",
  acceptedIds: ["backend/x.js", "backend/y.js"],
};
const fix: Exercise = {
  ...predict,
  id: "x",
  mode: "fix",
  snippet: { language: "js", code: "x" },
};
const build: Exercise = {
  ...base,
  id: "b",
  mode: "build",
  task: "Do it",
  checklist: [
    { id: "one", kind: "file", ref: "a.js", text: "1", required: true },
    { id: "two", kind: "layer", ref: "database", text: "2", required: true },
    { id: "no", kind: "file", ref: "b.js", text: "3", required: false },
  ],
  modelAnswer: ["Step"],
};

/** The answer that the expected answer describes. */
function answerFrom(expected: ExpectedAnswer): ExerciseAnswer {
  if ("ids" in expected) return { id: expected.ids[0]! };
  if ("modelAnswer" in expected) return { itemIds: expected.itemIds };
  return expected;
}

describe("toPublic", () => {
  it.each([predict, trace, find, fix, build])(
    "leaves out the answers and the explanation of $mode",
    (exercise) => {
      const shown = JSON.stringify(toPublic(exercise));
      for (const secret of [
        "correctChoiceId",
        "symbolIds",
        "distractorIds",
        "acceptedIds",
        "required",
        "modelAnswer",
        "explanation",
        "Because.",
      ]) {
        expect(shown, secret).not.toContain(secret);
      }
      expect(toPublic(exercise)).toMatchObject({
        id: exercise.id,
        mode: exercise.mode,
        prompt: "P",
        hints: ["h"],
      });
    },
  );

  it("keeps the choices, the checklist and the target", () => {
    expect(toPublic(predict)).toMatchObject({ choices: predict.choices });
    expect(toPublic(find)).toMatchObject({ target: "file" });
    expect(toPublic(build)).toMatchObject({
      task: "Do it",
      checklist: [
        { id: "one", kind: "file", ref: "a.js", text: "1" },
        { id: "two", kind: "layer", ref: "database", text: "2" },
        { id: "no", kind: "file", ref: "b.js", text: "3" },
      ],
    });
  });

  it("frames a trace by its ends and offers every symbol sorted", () => {
    expect(toPublic(trace)).toMatchObject({
      startSymbolId: "fn:z",
      endSymbolId: "fn:m",
      length: 3,
      candidateIds: ["fn:a", "fn:b", "fn:m", "fn:z"],
    });
  });
});

describe("answerError", () => {
  it.each([
    [predict, { choiceId: "a" }],
    [fix, { choiceId: "a" }],
    [trace, { symbolIds: [] }],
    [find, { id: "x" }],
    [build, { itemIds: ["one"] }],
  ] as const)("accepts the right shape for $mode", (exercise, answer) => {
    expect(answerError(exercise, answer)).toBeUndefined();
  });

  it.each([
    [predict, { choiceId: 1 }, "choiceId"],
    [fix, undefined, "choiceId"],
    [trace, { symbolIds: "fn:a" }, "symbolIds"],
    [trace, { symbolIds: [1] }, "symbolIds"],
    [find, { choiceId: "a" }, "`id`"],
    [build, null, "itemIds"],
  ] as const)("explains a wrong shape: %#", (exercise, answer, field) => {
    expect(answerError(exercise, answer)).toContain(field);
  });
});

describe("checkAnswer", () => {
  it("checks predict and fix by the chosen option", () => {
    for (const exercise of [predict, fix]) {
      expect(checkAnswer(exercise, { choiceId: "b" })).toEqual({
        correct: true,
        explanation: "Because.",
        expected: { choiceId: "b" },
      });
      expect(checkAnswer(exercise, { choiceId: "a" }).correct).toBe(false);
    }
  });

  it("checks a trace by its exact order", () => {
    expect(checkAnswer(trace, { symbolIds: ["fn:z", "fn:a", "fn:m"] })).toEqual(
      {
        correct: true,
        explanation: "Because.",
        expected: { symbolIds: ["fn:z", "fn:a", "fn:m"] },
      },
    );
    for (const symbolIds of [
      ["fn:a", "fn:z", "fn:m"],
      ["fn:z", "fn:a"],
      ["fn:z", "fn:a", "fn:m", "fn:b"],
      [],
    ]) {
      expect(checkAnswer(trace, { symbolIds }).correct, symbolIds.join()).toBe(
        false,
      );
    }
  });

  it("accepts any of a find exercise's accepted ids", () => {
    expect(checkAnswer(find, { id: "backend/y.js" })).toEqual({
      correct: true,
      explanation: "Because.",
      expected: { ids: ["backend/x.js", "backend/y.js"] },
    });
    expect(checkAnswer(find, { id: "backend/z.js" }).correct).toBe(false);
  });

  it("checks a build plan by exactly the required items, in any order", () => {
    expect(checkAnswer(build, { itemIds: ["two", "one"] })).toEqual({
      correct: true,
      explanation: "Because.",
      expected: { itemIds: ["one", "two"], modelAnswer: ["Step"] },
    });
    for (const itemIds of [["one"], ["one", "two", "no"], [], ["one", "one"]]) {
      expect(checkAnswer(build, { itemIds }).correct, itemIds.join()).toBe(
        false,
      );
    }
  });

  it("has at least four fix exercises, each showing the broken code", () => {
    const fixes = exercises.filter((e) => e.mode === "fix");
    expect(fixes.length).toBeGreaterThanOrEqual(4);
    for (const exercise of fixes) {
      expect(exercise.snippet.fileName, exercise.id).toBeTruthy();
      expect(
        exercise.snippet.highlightLines?.length,
        exercise.id,
      ).toBeGreaterThan(0);
    }
  });

  it("has at least six predict exercises, each linked to concepts with a full explanation", () => {
    const predicts = exercises.filter((e) => e.mode === "predict");
    expect(predicts.length).toBeGreaterThanOrEqual(6);
    for (const exercise of predicts) {
      expect(exercise.conceptIds.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.explanation.length, exercise.id).toBeGreaterThan(100);
    }
  });

  it("has at least one exercise of every mode, each solvable by its own answer", () => {
    expect(new Set(exercises.map((e) => e.mode))).toEqual(
      new Set(["predict", "trace", "find", "fix", "build"]),
    );
    for (const exercise of exercises) {
      const { expected } = checkAnswer(exercise, {
        choiceId: "",
        symbolIds: [],
        id: "",
        itemIds: [],
      } as unknown as ExerciseAnswer);
      const answer = answerFrom(expected!);
      expect(answerError(exercise, answer), exercise.id).toBeUndefined();
      expect(checkAnswer(exercise, answer).correct, exercise.id).toBe(true);
    }
  });
});

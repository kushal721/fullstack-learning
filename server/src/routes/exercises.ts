import type {
  CheckAnswerResponse,
  ExerciseAnswer,
  ExerciseListResponse,
  ExerciseMode,
  ExerciseResponse,
} from "@fsl/shared";
import { Router } from "express";
import { notFoundError, validationError } from "../lib/http-error.js";
import {
  answerError,
  checkAnswer,
  EXERCISE_MODES,
  getExercise,
  getExercises,
  toPublic,
} from "../lib/practice.js";
import { isSlug } from "../lib/slug.js";

export const exercisesRouter = Router();

// Answers never leave the server before checking: every exercise is sent
// through toPublic(), and only POST …/check reveals the expected answer.

// GET /api/exercises — every exercise; ?mode=predict|… — only that mode.
exercisesRouter.get("/", (req, res) => {
  const { mode } = req.query;
  if (mode !== undefined && !EXERCISE_MODES.includes(mode as ExerciseMode)) {
    throw validationError(`mode must be one of: ${EXERCISE_MODES.join(", ")}.`);
  }
  const body: ExerciseListResponse = {
    exercises: getExercises(mode as ExerciseMode | undefined).map(toPublic),
  };
  res.json(body);
});

function findExercise(id: string) {
  if (!isSlug(id)) {
    throw validationError(
      "An exercise id may only contain lowercase letters, numbers and hyphens.",
    );
  }
  const exercise = getExercise(id);
  if (!exercise) throw notFoundError(`No exercise "${id}".`);
  return exercise;
}

// GET /api/exercises/:id — one exercise, without its answer.
exercisesRouter.get("/:id", (req, res) => {
  const body: ExerciseResponse = {
    exercise: toPublic(findExercise(req.params.id)),
  };
  res.json(body);
});

// POST /api/exercises/:id/check — body { answer }; the answer's shape
// depends on the exercise's mode.
exercisesRouter.post("/:id/check", (req, res) => {
  const exercise = findExercise(req.params.id);
  const answer: unknown = req.body?.answer;
  if (typeof answer !== "object" || answer === null || Array.isArray(answer)) {
    throw validationError('Send a JSON body like { "answer": { … } }.');
  }
  const error = answerError(exercise, answer);
  if (error) throw validationError(error);
  const body: CheckAnswerResponse = checkAnswer(
    exercise,
    answer as ExerciseAnswer,
  );
  res.json(body);
});

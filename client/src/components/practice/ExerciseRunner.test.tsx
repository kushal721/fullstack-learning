import type { PublicExercise } from "@fsl/shared";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ExerciseRunner } from "./ExerciseRunner.tsx";

// Every mode has an input today; a future mode without one must still be
// readable. Pretend no inputs are registered.
vi.mock("./mode-inputs.ts", () => ({ modeInputs: {} }));

const exercise: PublicExercise = {
  id: "predict-x",
  mode: "predict",
  title: "X",
  prompt: "What happens?",
  conceptIds: [],
  hints: ["Look closely."],
  choices: [],
};

describe("ExerciseRunner without an input for the mode", () => {
  it("shows the question and hints but no way to answer", () => {
    render(
      <MemoryRouter>
        <ExerciseRunner exercise={exercise} />
      </MemoryRouter>,
    );
    expect(screen.getByText("What happens?")).toBeVisible();
    expect(screen.getByText(/isn't available yet/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Show a hint" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Check answer" })).toBeNull();
  });
});

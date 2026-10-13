import type { PublicExercise } from "@fsl/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ExerciseRunner } from "../ExerciseRunner.tsx";

const fix: PublicExercise = {
  id: "fix-x",
  mode: "fix",
  title: "Fix it",
  prompt: "Editing always fails.",
  conceptIds: [],
  hints: [],
  snippet: {
    language: "js",
    code: "request(`/api/note/${id}`)",
    fileName: "frontend/src/services/notesApi.js",
  },
  choices: [
    { id: "path", text: "Fix the path." },
    { id: "post", text: "Use POST." },
  ],
};

describe("ChoiceInput for fix", () => {
  it("shows the broken code with its file and the fixes to choose from", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          correct: true,
          explanation: "The router is at /api/notes.",
          expected: { choiceId: "path" },
        }),
        { status: 200 },
      ),
    );
    render(
      <MemoryRouter>
        <ExerciseRunner exercise={fix} />
      </MemoryRouter>,
    );
    expect(screen.getByText("frontend/src/services/notesApi.js")).toBeVisible();
    expect(document.querySelector("pre code")).toHaveTextContent(
      "request(`/api/note/${id}`)",
    );
    await userEvent.click(screen.getByRole("radio", { name: "Fix the path." }));
    await userEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(
      await screen.findByRole("heading", { name: "Correct!" }),
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/exercises/fix-x/check",
      expect.objectContaining({ body: '{"answer":{"choiceId":"path"}}' }),
    );
  });
});

import type {
  CheckAnswerResponse,
  ExerciseListResponse,
  ExerciseResponse,
} from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearApiCache } from "../hooks/useApi.ts";
import ExercisePage from "./ExercisePage.tsx";

const predict: ExerciseResponse = {
  exercise: {
    id: "predict-save",
    mode: "predict",
    title: "Clicking Save",
    prompt: "What happens when the user clicks `Save`?",
    conceptIds: ["js-event"],
    code: {
      language: "jsx",
      code: "event.preventDefault();",
      fileName: "frontend/src/components/NoteForm.jsx",
    },
    hints: ["Look at `handleSave`.", "Follow the request."],
    choices: [
      { id: "reload", text: "The page reloads." },
      { id: "saved", text: "The note is saved and appears." },
    ],
  },
};
const list: ExerciseListResponse = {
  exercises: [
    predict.exercise,
    {
      id: "build-x",
      mode: "build",
      title: "Plan x",
      prompt: "Plan x.",
      conceptIds: [],
      hints: [],
      task: "Add x.",
      checklist: [],
    },
  ],
};
const checked = (correct: boolean): CheckAnswerResponse => ({
  correct,
  explanation: "`handleSave` stops the reload and sends the note.",
  expected: { choiceId: "saved" },
});

/** GETs by URL; POST …/check answers with `check(body)`. */
function mockApi(check: (body: unknown) => [number, unknown]) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input, init) => {
      const url = String(input);
      if (init?.method === "POST") {
        const [status, body] = check(JSON.parse(String(init.body)));
        return new Response(JSON.stringify(body), { status });
      }
      const routes: Record<string, unknown> = {
        "/api/exercises/predict-save": predict,
        "/api/exercises/build-x": { exercise: list.exercises[1] },
        "/api/exercises": list,
        "/api/concepts": {
          concepts: [
            {
              id: "js-event",
              slug: "js-event",
              title: "Events",
              topicId: "javascript",
              summary: "x",
            },
          ],
        },
      };
      return url in routes
        ? new Response(JSON.stringify(routes[url]), { status: 200 })
        : new Response(
            JSON.stringify({ error: { code: "NOT_FOUND", message: "No" } }),
            { status: 404 },
          );
    });
}

function renderAt(id: string) {
  render(
    <MemoryRouter initialEntries={[`/practice/${id}`]}>
      <Routes>
        <Route path="/practice/:exercise" element={<ExercisePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ExercisePage", () => {
  beforeEach(() => {
    clearApiCache();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("shows the prompt, reveals hints one at a time and checks a right answer", async () => {
    const fetchMock = mockApi(() => [200, checked(true)]);
    renderAt("predict-save");
    await screen.findByRole("heading", { level: 1, name: "Clicking Save" });
    expect(screen.getByText(/What happens when the user clicks/)).toBeVisible();

    const check = screen.getByRole("button", { name: "Check answer" });
    expect(check).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Show a hint" }));
    expect(screen.getByText("handleSave", { selector: "code" })).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Show another hint (2 of 2)" }),
    );
    expect(screen.getByText("Follow the request.")).toBeVisible();
    expect(screen.queryByRole("button", { name: /hint/ })).toBeNull();

    await userEvent.click(
      screen.getByRole("radio", { name: "The note is saved and appears." }),
    );
    await userEvent.click(check);

    expect(
      await screen.findByRole("heading", { name: "Correct!" }),
    ).toBeVisible();
    expect(
      screen.getByText(/stops the reload and sends the note/),
    ).toBeVisible();
    expect(screen.getByText("Right answer")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/exercises/predict-save/check",
      expect.objectContaining({
        method: "POST",
        body: '{"answer":{"choiceId":"saved"}}',
      }),
    );
    const learnMore = screen.getByRole("region", { name: "Learn more" });
    expect(
      within(learnMore).getByRole("link", { name: "Events" }),
    ).toHaveAttribute("href", "/concepts/js-event");
    expect(
      within(learnMore).getByRole("link", {
        name: "See the code in NoteForm.jsx",
      }),
    ).toHaveAttribute(
      "href",
      "/explorer?file=frontend%2Fsrc%2Fcomponents%2FNoteForm.jsx",
    );
    expect(screen.getByRole("link", { name: "Next exercise" })).toHaveAttribute(
      "href",
      "/practice/build-x",
    );
  });

  it("only says 'Not quite' for a wrong answer until the learner asks for the answer", async () => {
    mockApi((body) => [
      200,
      checked(
        (body as { answer: { choiceId: string } }).answer.choiceId === "saved",
      ),
    ]);
    renderAt("predict-save");
    await userEvent.click(
      await screen.findByRole("radio", { name: "The page reloads." }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(await screen.findByText("Not quite.")).toBeVisible();
    expect(screen.queryByText(/stops the reload/)).toBeNull();
    expect(screen.queryByText("Right answer")).toBeNull();
    expect(screen.queryByRole("region", { name: "Learn more" })).toBeNull();
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();

    // Changing the answer allows checking again.
    await userEvent.click(
      screen.getByRole("radio", { name: "The note is saved and appears." }),
    );
    await userEvent.click(
      screen.getByRole("radio", { name: "The page reloads." }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Check answer" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Show the answer" }),
    );

    expect(screen.getByRole("heading", { name: "The answer" })).toBeVisible();
    expect(screen.getByText(/stops the reload/)).toBeVisible();
    expect(screen.getByText("Right answer")).toBeVisible();
    expect(screen.getByText("Your choice")).toBeVisible();
    expect(
      screen.getByRole("radio", { name: /The page reloads/ }),
    ).toBeDisabled();
  });

  it("shows the server's message when checking fails", async () => {
    mockApi(() => [
      400,
      { error: { code: "VALIDATION_ERROR", message: "Pick one answer." } },
    ]);
    renderAt("predict-save");
    await userEvent.click(
      await screen.findByRole("radio", { name: "The page reloads." }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Pick one answer.",
    );
  });

  it("explains a mode that can't be answered yet, and ends at the last exercise", async () => {
    mockApi(() => [200, {}]);
    renderAt("build-x");
    expect(await screen.findByText(/isn't available yet/)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Check answer" })).toBeNull();
  });

  it("shows not found for an unknown exercise", async () => {
    mockApi(() => [200, {}]);
    renderAt("no-such-thing");
    expect(
      await screen.findByRole("heading", { name: "Exercise not found" }),
    ).toBeVisible();
  });
});

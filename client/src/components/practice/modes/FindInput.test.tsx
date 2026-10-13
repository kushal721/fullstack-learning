import type { CheckAnswerResponse, PublicExercise } from "@fsl/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearApiCache } from "../../../hooks/useApi.ts";
import { fileTreeFixture } from "../../../test/fixtures.ts";
import { ExerciseRunner } from "../ExerciseRunner.tsx";

const base = {
  mode: "find" as const,
  title: "Find it",
  prompt: "Where is it?",
  conceptIds: [],
  hints: [],
};
const findFile: PublicExercise = { ...base, id: "find-file", target: "file" };
const findSymbol: PublicExercise = {
  ...base,
  id: "find-symbol",
  target: "symbol",
};

/** File tree and symbols by GET; POST …/check accepts `right`. */
function mockApi(right: string) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input, init) => {
      const url = decodeURIComponent(String(input));
      let body: unknown;
      if (init?.method === "POST") {
        const { answer } = JSON.parse(String(init.body));
        body = {
          correct: answer.id === right,
          explanation: "Because it lives there.",
          expected: { ids: [right] },
        } satisfies CheckAnswerResponse;
      } else if (url === "/api/files") {
        body = { tree: fileTreeFixture };
      } else if (url === "/api/files/frontend/src/App.jsx/symbols") {
        body = {
          file: {
            id: "frontend/src/App.jsx",
            path: "frontend/src/App.jsx",
            layer: "frontend",
            purpose: "",
          },
          defined: [
            { id: "component:App", kind: "component", name: "App", line: 9 },
            {
              id: "fn:handleLoggedIn",
              kind: "function",
              name: "handleLoggedIn",
              line: 22,
            },
          ],
          referenced: [],
          imports: [],
          importedBy: [],
        };
      } else {
        body = { tree: fileTreeFixture };
      }
      return new Response(JSON.stringify(body), { status: 200 });
    });
}

function renderRunner(exercise: PublicExercise) {
  render(
    <MemoryRouter>
      <ExerciseRunner exercise={exercise} />
    </MemoryRouter>,
  );
}

describe("FindInput", () => {
  beforeEach(() => clearApiCache());

  it("answers with the file picked in the tree", async () => {
    const fetchMock = mockApi("frontend/src/App.jsx");
    renderRunner(findFile);
    const check = screen.getByRole("button", { name: "Check answer" });
    await userEvent.click(await screen.findByRole("treeitem", { name: "src" }));
    expect(check).toBeDisabled();
    await userEvent.click(screen.getByRole("treeitem", { name: "App.jsx" }));
    expect(screen.getByText("frontend/src/App.jsx")).toBeVisible();
    await userEvent.click(check);
    expect(
      await screen.findByRole("heading", { name: "Correct!" }),
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/exercises/find-file/check",
      expect.objectContaining({
        body: '{"answer":{"id":"frontend/src/App.jsx"}}',
      }),
    );
  });

  it("lists a file's symbols for a symbol question and reveals the right one", async () => {
    mockApi("component:App");
    renderRunner(findSymbol);
    await userEvent.click(await screen.findByRole("treeitem", { name: "src" }));
    await userEvent.click(screen.getByRole("treeitem", { name: "App.jsx" }));
    const check = screen.getByRole("button", { name: "Check answer" });
    // A file alone isn't an answer to a symbol question.
    expect(check).toBeDisabled();

    await userEvent.click(
      await screen.findByRole("radio", { name: /handleLoggedIn/ }),
    );
    expect(
      screen.getByRole("group", { name: "Defined in App.jsx" }),
    ).toBeVisible();
    await userEvent.click(check);
    expect(await screen.findByText("Not quite.")).toBeVisible();
    expect(screen.queryByText(/Right answer/)).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Show the answer" }),
    );
    expect(screen.getByText(/Right answer/).parentElement).toHaveTextContent(
      "Right answer: component App",
    );
    expect(screen.getByText(/Your choice/)).toHaveTextContent(
      "Your choice: function handleLoggedIn",
    );
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });
});

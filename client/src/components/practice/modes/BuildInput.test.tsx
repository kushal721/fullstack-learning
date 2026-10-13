import type { CheckAnswerResponse, PublicExercise } from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ExerciseRunner } from "../ExerciseRunner.tsx";

const exercise: PublicExercise = {
  id: "build-x",
  mode: "build",
  title: "Favorites",
  prompt: "Plan it.",
  conceptIds: [],
  hints: [],
  task: "Add a `favorite` star.",
  checklist: [
    {
      id: "schema",
      kind: "file",
      ref: "database/schema.sql",
      text: "`schema.sql`: a column",
    },
    {
      id: "card",
      kind: "file",
      ref: "NoteCard.jsx",
      text: "`NoteCard.jsx`: the star",
    },
    {
      id: "login",
      kind: "file",
      ref: "Login.jsx",
      text: "`Login.jsx`: a star",
    },
    { id: "db", kind: "layer", ref: "database", text: "The database layer" },
    {
      id: "auth",
      kind: "relationship",
      ref: "r",
      text: "Behind `requireAuth`",
    },
  ],
};
const REQUIRED = ["schema", "card", "db", "auth"];

function mockCheck() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (_input, init) => {
      const { answer } = JSON.parse(String(init!.body));
      const result: CheckAnswerResponse = {
        correct:
          answer.itemIds.length === REQUIRED.length &&
          REQUIRED.every((id) => answer.itemIds.includes(id)),
        explanation: "A favorite is stored data.",
        expected: {
          itemIds: REQUIRED,
          modelAnswer: ["Add a `favorite` column.", "Add a star button."],
        },
      };
      return new Response(JSON.stringify(result), { status: 200 });
    });
}

function renderRunner() {
  render(
    <MemoryRouter>
      <ExerciseRunner exercise={exercise} />
    </MemoryRouter>,
  );
}

describe("BuildInput", () => {
  it("groups the checklist and sends the ticked items", async () => {
    const fetchMock = mockCheck();
    renderRunner();
    expect(screen.getByText("favorite", { selector: "code" })).toBeVisible();
    expect(
      screen
        .getAllByRole("group")
        .map((g) => g.querySelector("legend")?.textContent),
    ).toEqual(["Files", "Layers", "Connections"]);

    const check = screen.getByRole("button", { name: "Check answer" });
    expect(check).toBeDisabled();
    for (const name of [
      /schema.sql/,
      /NoteCard.jsx/,
      /database layer/,
      /requireAuth/,
    ]) {
      await userEvent.click(screen.getByRole("checkbox", { name }));
    }
    await userEvent.click(check);
    expect(
      await screen.findByRole("heading", { name: "Correct!" }),
    ).toBeVisible();
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))).toEqual({
      answer: { itemIds: ["schema", "card", "db", "auth"] },
    });
    const model = screen.getByRole("region", { name: "One way to build it" });
    expect(within(model).getAllByRole("listitem")).toHaveLength(2);
  });

  it("says which items were needed once the answer is shown", async () => {
    mockCheck();
    renderRunner();
    await userEvent.click(
      screen.getByRole("checkbox", { name: /NoteCard.jsx/ }),
    );
    await userEvent.click(screen.getByRole("checkbox", { name: /Login.jsx/ }));
    await userEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(await screen.findByText("Not quite.")).toBeVisible();
    expect(screen.queryByText(/Needed/)).toBeNull();
    expect(
      screen.queryByRole("region", { name: "One way to build it" }),
    ).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Show the answer" }),
    );
    const verdicts = screen
      .getAllByRole("checkbox")
      .map((box) => box.closest("label")!.textContent);
    expect(verdicts).toEqual([
      "schema.sql: a columnNeeded: you missed it",
      "NoteCard.jsx: the starNeeded: you ticked it",
      "Login.jsx: a starNot needed: you ticked it",
      "The database layerNeeded: you missed it",
      "Behind requireAuthNeeded: you missed it",
    ]);
    for (const box of screen.getAllByRole("checkbox"))
      expect(box).toBeDisabled();
  });

  it("only allows checking once something is ticked", async () => {
    mockCheck();
    renderRunner();
    const box = screen.getByRole("checkbox", { name: /NoteCard.jsx/ });
    await userEvent.click(box);
    expect(screen.getByRole("button", { name: "Check answer" })).toBeEnabled();
    await userEvent.click(box);
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();
  });
});

import type { CheckAnswerResponse, PublicExercise } from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearApiCache } from "../../../hooks/useApi.ts";
import { ExerciseRunner } from "../ExerciseRunner.tsx";
import { symbolLabel } from "./symbol-label.ts";

// React Flow needs a real browser; the graph is checked there. Here it
// lists its nodes as buttons that call onSelect.
vi.mock("../../connection-graph/ConnectionGraph.tsx", () => ({
  default: ({
    nodes,
    centerId,
    onSelect,
  }: {
    nodes: { id: string }[];
    centerId: string;
    onSelect: (s: { id: string }) => void;
  }) => (
    <div data-testid="graph">
      graph of {centerId}
      {nodes.map((n) => (
        <button key={n.id} type="button" onClick={() => onSelect(n)}>
          node {n.id}
        </button>
      ))}
    </div>
  ),
}));

const exercise: PublicExercise = {
  id: "trace-x",
  mode: "trace",
  title: "Trace it",
  prompt: "From A to D.",
  conceptIds: [],
  hints: [],
  startSymbolId: "fn:a",
  endSymbolId: "table:d",
  length: 4,
  candidateIds: ["fn:a", "fn:b", "fn:wrong", "query:c", "table:d"],
};
const RIGHT = ["fn:a", "fn:b", "query:c", "table:d"];

function mockApi() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input, init) => {
      if (init?.method === "POST") {
        const { answer } = JSON.parse(String(init.body));
        const result: CheckAnswerResponse = {
          correct: answer.symbolIds.join() === RIGHT.join(),
          explanation: "A calls B, B runs C, C reads D.",
          expected: { symbolIds: RIGHT },
        };
        return new Response(JSON.stringify(result), { status: 200 });
      }
      // Every graph: the centre plus fn:b and fn:outside.
      const url = decodeURIComponent(String(input));
      const center = url.match(/symbols\/(.+)\/graph/)?.[1] ?? "";
      const node = (id: string) => ({
        id,
        kind: "function",
        name: id,
        summary: "",
        conceptIds: [],
      });
      return new Response(
        JSON.stringify({
          nodes: [node(center), node("fn:b"), node("fn:outside")],
          edges: [],
        }),
        { status: 200 },
      );
    });
}

const pieces = () => screen.getByRole("region", { name: "Add the next step" });
const pathItems = () =>
  within(screen.getByRole("region", { name: /Your path/ }))
    .getAllByRole("listitem")
    .map((li) => li.textContent);
const add = (name: RegExp) =>
  userEvent.click(within(pieces()).getByRole("button", { name }));

function renderRunner() {
  render(
    <MemoryRouter>
      <ExerciseRunner exercise={exercise} />
    </MemoryRouter>,
  );
}

describe("TraceInput", () => {
  beforeEach(() => clearApiCache());

  it("labels symbols by kind", () => {
    expect(symbolLabel("fn:notesApi.createNote")).toEqual({
      kind: "function",
      name: "notesApi.createNote",
    });
    expect(symbolLabel("http-request:POST /api/notes")).toEqual({
      kind: "request",
      name: "POST /api/notes",
    });
    expect(symbolLabel("table:notes")).toEqual({
      kind: "table",
      name: "notes",
    });
  });

  it("builds the path from the start and only allows checking a complete one", async () => {
    mockApi();
    renderRunner();
    expect(pathItems()).toEqual(["1.function a"]);
    const check = screen.getByRole("button", { name: "Check answer" });
    expect(check).toBeDisabled();
    // The start isn't offered again.
    expect(
      within(pieces()).queryByRole("button", { name: /function a$/ }),
    ).toBeNull();

    // The graph shows what the last step connects to; clicking an offered
    // node adds it, other nodes do nothing.
    expect(await screen.findByTestId("graph")).toHaveTextContent(
      "graph of fn:a",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "node fn:outside" }),
    );
    expect(pathItems()).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "node fn:b" }));
    expect(pathItems()).toEqual(["1.function a", "2.function b"]);
    expect(await screen.findByTestId("graph")).toHaveTextContent(
      "graph of fn:b",
    );

    await add(/query c/);
    await add(/function wrong/);
    expect(pathItems()).toHaveLength(4);
    expect(check).toBeEnabled();
    // Full: nothing more can be added.
    expect(
      within(pieces()).getByRole("button", { name: /table d/ }),
    ).toBeDisabled();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove the last step" }),
    );
    expect(check).toBeDisabled();
    await add(/table d/);
    expect(check).toBeEnabled();
    await userEvent.click(check);
    expect(
      await screen.findByRole("heading", { name: "Correct!" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "Add the next step" }),
    ).toBeNull();
  });

  it("marks wrong steps with what they should be once the answer is shown", async () => {
    mockApi();
    renderRunner();
    await add(/function wrong/);
    await add(/function b/);
    await add(/table d/);
    await userEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(await screen.findByText("Not quite.")).toBeVisible();
    expect(screen.queryByText(/Should be/)).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Show the answer" }),
    );
    expect(pathItems()).toEqual([
      "1.function a",
      "2.function wrongShould be: function b",
      "3.function bShould be: query c",
      "4.table d",
    ]);
  });

  it("starts over from the first symbol", async () => {
    mockApi();
    renderRunner();
    await add(/function b/);
    await add(/query c/);
    await userEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(pathItems()).toEqual(["1.function a"]);
    expect(screen.getByRole("button", { name: "Start over" })).toBeDisabled();
  });
});

import type { FlowListResponse, FlowResponse } from "@fsl/shared";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearApiCache } from "../hooks/useApi.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import FlowPage from "./FlowPage.tsx";

// React Flow needs a real browser; the canvas is checked there. Here it
// shows which step is current and lets a test click a step.
vi.mock("../components/flow-tracer/FlowCanvas.tsx", () => ({
  default: ({
    steps,
    current,
    onSelect,
  }: {
    steps: { id: string }[];
    current: number;
    onSelect: (i: number) => void;
  }) => (
    <div data-testid="canvas">
      current: {steps[current]?.id}
      {steps.map((s, i) => (
        <button key={s.id} type="button" onClick={() => onSelect(i)}>
          node {s.id}
        </button>
      ))}
    </div>
  ),
}));

const list: FlowListResponse = {
  flows: [
    {
      id: "create-note",
      title: "Create a note",
      summary: "x",
      group: "request",
      direction: "round-trip",
      stepCount: 3,
    },
    {
      id: "list-notes",
      title: "Load your notes",
      summary: "x",
      group: "request",
      direction: "round-trip",
      stepCount: 1,
    },
  ],
};
const createNote: FlowResponse = {
  flow: {
    id: "create-note",
    title: "Create a note",
    summary: "Follow a new note.",
    group: "request",
    direction: "round-trip",
    steps: [
      {
        id: "click",
        symbolId: "component:Button",
        layer: "user",
        title: "The user clicks Save",
        explanation: "A **submit**.",
      },
      {
        id: "save",
        symbolId: "fn:handleSave",
        layer: "frontend",
        title: "handleSave takes over",
        explanation: "Stops the reload.",
        dataShape: { language: "js", code: "{ isSaving: true }" },
      },
      {
        id: "fetch",
        symbolId: "external:fetch",
        layer: "frontend",
        title: "fetch sends it",
        explanation: "x",
      },
    ],
  },
  symbols: {
    "component:Button": {
      id: "component:Button",
      kind: "component",
      name: "Button",
      summary: "x",
      conceptIds: [],
    },
    "fn:handleSave": {
      id: "fn:handleSave",
      kind: "function",
      name: "handleSave",
      fileId: "frontend/src/components/NoteForm.jsx",
      line: 14,
      summary: "x",
      conceptIds: [],
    },
    "external:fetch": {
      id: "external:fetch",
      kind: "external",
      name: "fetch",
      summary: "x",
      conceptIds: [],
    },
  },
};

function Location() {
  return <output data-testid="location">{useLocation().search}</output>;
}
function renderAt(url: string) {
  mockFetchRoutes({ "/api/flows": list, "/api/flows/create-note": createNote });
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route
          path="/flow"
          element={
            <>
              <FlowPage />
              <Location />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}
const status = () => screen.getByText(/^Step \d+ of \d+:/);

describe("FlowPage", () => {
  beforeEach(() => clearApiCache());
  afterEach(() => vi.useRealTimers());

  it("opens the first flow at step 1 and lists flows by group", async () => {
    renderAt("/flow");
    expect(await screen.findByTestId("canvas")).toHaveTextContent(
      "current: click",
    );
    expect(status()).toHaveTextContent("Step 1 of 3: The user clicks Save");
    const nav = screen.getByRole("navigation", { name: "Flows" });
    expect(
      within(nav).getByRole("heading", { name: "Requests" }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /Create a note/ }),
    ).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByRole("heading", { name: "Security" })).toBeNull();
  });

  it("steps with the buttons and keeps the step in the URL", async () => {
    renderAt("/flow?flow=create-note&step=1");
    await screen.findByTestId("canvas");
    expect(screen.getByRole("button", { name: "← Previous" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next →" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "?flow=create-note&step=2",
    );
    expect(status()).toHaveTextContent("Step 2 of 3: handleSave takes over");
    await userEvent.click(screen.getByRole("button", { name: "node fetch" }));
    expect(screen.getByRole("button", { name: "Next →" })).toBeDisabled();
  });

  it("steps with the arrow keys, Home and End", async () => {
    renderAt("/flow?flow=create-note&step=2");
    await screen.findByTestId("canvas");
    screen.getByRole("group", { name: /arrow keys/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(status()).toHaveTextContent("Step 3 of 3");
    await userEvent.keyboard("{Home}");
    expect(status()).toHaveTextContent("Step 1 of 3");
    await userEvent.keyboard("{End}");
    expect(status()).toHaveTextContent("Step 3 of 3");
    await userEvent.keyboard("{ArrowLeft}");
    expect(status()).toHaveTextContent("Step 2 of 3");
  });

  it("counts quick key presses from the step they asked for", async () => {
    renderAt("/flow?flow=create-note&step=1");
    await screen.findByTestId("canvas");
    screen.getByRole("group", { name: /arrow keys/ }).focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(status()).toHaveTextContent("Step 3 of 3");
    await userEvent.keyboard("{ArrowRight}");
    expect(status()).toHaveTextContent("Step 3 of 3");
  });

  it("plays through the steps and stops at the end", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderAt("/flow?flow=create-note&step=1");
    await screen.findByTestId("canvas");
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await act(() => vi.advanceTimersByTimeAsync(2500));
    expect(status()).toHaveTextContent("Step 2 of 3");
    await act(() => vi.advanceTimersByTimeAsync(2500));
    expect(status()).toHaveTextContent("Step 3 of 3");
    expect(screen.getByRole("button", { name: "Play again" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows the step's explanation, data and links to the code", async () => {
    renderAt("/flow?flow=create-note&step=2");
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "handleSave takes over",
      }),
    ).toBeInTheDocument();
    expect(document.querySelector("pre code")?.textContent).toBe(
      "{ isSaving: true }",
    );
    expect(
      screen.getByRole("link", { name: "Connections of handleSave" }),
    ).toHaveAttribute(
      "href",
      "/explorer?symbol=fn%3AhandleSave&file=frontend%2Fsrc%2Fcomponents%2FNoteForm.jsx&line=14",
    );
    expect(
      screen.getByRole("link", { name: "Open NoteForm.jsx at line 14" }),
    ).toHaveAttribute(
      "href",
      "/explorer?file=frontend%2Fsrc%2Fcomponents%2FNoteForm.jsx&line=14",
    );
  });

  it("falls back to step 1 for a step that doesn't exist", async () => {
    renderAt("/flow?flow=create-note&step=99");
    await screen.findByTestId("canvas");
    expect(status()).toHaveTextContent("Step 1 of 3");
  });
});

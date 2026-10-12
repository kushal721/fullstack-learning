import type { SymbolResponse } from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ConnectionDetails } from "./ConnectionDetails.tsx";

const QUESTIONS = [
  "Where is it defined?",
  "What does it handle?",
  "Who calls or uses it?",
  "What does it call or use?",
  "Which files are involved?",
  "What happens next?",
];

const handleSave: SymbolResponse = {
  symbol: {
    id: "fn:handleSave",
    kind: "function",
    name: "handleSave",
    fileId: "frontend/src/components/NoteForm.jsx",
    line: 14,
    summary: "Saves.",
    dataHandled: "the typed `title` and content",
    conceptIds: [],
  },
  definedIn: {
    id: "frontend/src/components/NoteForm.jsx",
    path: "frontend/src/components/NoteForm.jsx",
    layer: "frontend",
    purpose: "x",
    line: 14,
  },
  calledBy: [],
  calls: [],
  files: [
    {
      id: "frontend/src/components/NoteForm.jsx",
      path: "frontend/src/components/NoteForm.jsx",
      layer: "frontend",
      purpose: "x",
    },
  ],
  usedBy: [],
  uses: [
    {
      id: "fn:handleSave->calls->fn:notesApi.createNote",
      type: "calls",
      direction: "out",
      explanation: "Sends the note.",
      symbol: {
        id: "fn:notesApi.createNote",
        kind: "function",
        name: "createNote",
        fileId: "frontend/src/services/notesApi.js",
        line: 7,
      },
    },
  ],
  next: [
    {
      id: "fn:handleSave->calls->fn:notesApi.createNote",
      type: "calls",
      direction: "out",
      explanation: "Sends the note.",
      symbol: {
        id: "fn:notesApi.createNote",
        kind: "function",
        name: "createNote",
        fileId: "frontend/src/services/notesApi.js",
        line: 7,
      },
    },
  ],
};

const renderDetails = (data: SymbolResponse, props = {}) =>
  render(
    <MemoryRouter>
      <ConnectionDetails data={data} {...props} />
    </MemoryRouter>,
  );
const answer = (question: string) =>
  screen.getByRole("heading", { level: 3, name: question }).parentElement!;

describe("ConnectionDetails", () => {
  it("answers the six questions with links", () => {
    renderDetails(handleSave);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(QUESTIONS);

    expect(
      within(answer("Where is it defined?")).getByRole("link"),
    ).toHaveAttribute(
      "href",
      "/explorer?file=frontend%2Fsrc%2Fcomponents%2FNoteForm.jsx&line=14",
    );
    expect(answer("What does it handle?")).toHaveTextContent(
      "the typed title and content",
    );
    expect(
      within(answer("What does it call or use?")).getByRole("link", {
        name: "function createNote",
      }),
    ).toHaveAttribute(
      "href",
      "/explorer?symbol=fn%3AnotesApi.createNote&file=frontend%2Fsrc%2Fservices%2FnotesApi.js&line=7",
    );
    expect(answer("What does it call or use?")).toHaveTextContent(
      "It calls function createNote",
    );
    expect(
      within(answer("What happens next?")).getByRole("listitem"),
    ).toHaveTextContent("function createNote Sends the note.");
    expect(
      within(answer("Which files are involved?")).getAllByRole("link"),
    ).toHaveLength(1);
  });

  it("explains dead ends by returning control to the caller", () => {
    renderDetails({
      ...handleSave,
      uses: [],
      next: [],
      usedBy: [
        {
          id: "c->calls->v",
          type: "calls",
          direction: "in",
          explanation: "Checks first.",
          symbol: {
            id: "controller:c",
            kind: "controller",
            name: "createNote",
          },
        },
      ],
    });
    expect(answer("What does it call or use?")).toHaveTextContent(
      "Nothing: it does its own work and returns.",
    );
    expect(answer("Who calls or uses it?")).toHaveTextContent(
      "controller createNote calls it",
    );
    expect(answer("What happens next?")).toHaveTextContent(
      "It finishes and control returns to controller createNote.",
    );
    expect(
      within(answer("What happens next?")).getByRole("link", {
        name: "controller createNote",
      }),
    ).toBeInTheDocument();
  });

  it("reads backward relationships from this side: triggers and arrives at", () => {
    renderDetails({
      ...handleSave,
      usedBy: [
        {
          id: "fn:handleSave->handles->event:noteForm.submit",
          type: "handles",
          direction: "out",
          explanation: "React calls it on submit.",
          symbol: {
            id: "event:noteForm.submit",
            kind: "event",
            name: "NoteForm submit",
          },
        },
        {
          id: "route->receives->req",
          type: "receives",
          direction: "out",
          explanation: "Express matches it.",
          symbol: {
            id: "http-request:POST /api/notes",
            kind: "http-request",
            name: "POST /api/notes",
          },
        },
      ],
    });
    expect(answer("Who calls or uses it?")).toHaveTextContent(
      "event NoteForm submit triggers it",
    );
    expect(answer("Who calls or uses it?")).toHaveTextContent(
      "request POST /api/notes arrives at it",
    );
  });

  it("explains symbols outside the project, network requests and events", () => {
    const base = {
      ...handleSave,
      definedIn: undefined,
      files: [],
      usedBy: [],
      uses: [],
      next: [],
    };
    const { unmount } = renderDetails({
      ...base,
      symbol: { ...base.symbol, kind: "external" },
    });
    expect(answer("Where is it defined?")).toHaveTextContent(
      "Outside the Notes App",
    );
    expect(answer("Which files are involved?")).toHaveTextContent(
      "None in the Notes App.",
    );
    unmount();

    renderDetails({
      ...base,
      symbol: { ...base.symbol, kind: "http-request" },
    });
    expect(answer("Where is it defined?")).toHaveTextContent(
      "travels over the network",
    );
  });

  it("is props-only: other pages can choose where links go", () => {
    renderDetails(handleSave, {
      symbolHref: () => "/custom-symbol",
      fileHref: () => "/custom-file",
    });
    expect(
      within(answer("What happens next?")).getByRole("link"),
    ).toHaveAttribute("href", "/custom-symbol");
    expect(
      within(answer("Where is it defined?")).getByRole("link"),
    ).toHaveAttribute("href", "/custom-file");
  });
});

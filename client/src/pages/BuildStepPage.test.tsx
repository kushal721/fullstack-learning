import type {
  BuildStep,
  BuildStepListResponse,
  BuildStepResponse,
  FileTreeFolder,
} from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearApiCache } from "../hooks/useApi.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import BuildPage from "./BuildPage.tsx";
import BuildStepPage from "./BuildStepPage.tsx";

const SECTIONS = [
  "What are we doing?",
  "Why?",
  "What problem does this solve?",
  "How do I create it?",
  "How do I do this from scratch?",
  "What are we creating?",
  "What changed?",
  "Connections created",
  "Code",
  "Concepts introduced",
  "Common mistakes",
  "Where you are now",
];

const skeleton: BuildStep = {
  id: "add-state",
  slug: "add-state",
  order: 2,
  title: "Add state",
  goal: "Keep the notes in state.",
  why: "The screen must change.",
  problemSolved: "A page that cannot change.",
  prerequisites: ["create-page"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: ["frontend/src/hooks/useNotes.js"],
  filesModified: [],
  filesRemoved: [],
  conceptIds: ["react-usestate"],
  codeExamples: [],
  relationshipIds: [],
  enables: "Add notes.",
  commonMistakes: [],
};

const written: BuildStep = {
  ...skeleton,
  explanation: ["State is data React remembers."],
  howToCreate: [
    {
      text: "Create `useNotes.js`.",
      code: { language: "js", code: "export function useNotes() {}" },
    },
  ],
  fromScratch: ["Make a `hooks` folder."],
  codeExamples: [
    {
      language: "jsx",
      code: "const [notes, setNotes] = useState([]);",
      fileName: "frontend/src/hooks/useNotes.js",
    },
  ],
  commonMistakes: ["Changing state directly."],
};

const steps: BuildStepListResponse = {
  buildSteps: [
    {
      id: "create-page",
      slug: "create-page",
      order: 1,
      title: "Create a page",
      goal: "A page.",
    },
    {
      id: "add-state",
      slug: "add-state",
      order: 2,
      title: "Add state",
      goal: "State.",
    },
  ],
};

const tree = (children: FileTreeFolder["children"]): FileTreeFolder => ({
  type: "folder",
  name: "notes-app",
  path: "",
  children,
});

function renderStep(step: BuildStep, flows: BuildStepResponse["flows"] = []) {
  const response: BuildStepResponse = {
    step,
    concepts: [
      {
        id: "react-usestate",
        slug: "react-usestate",
        title: "useState",
        topicId: "react",
        summary: "Remembers a value.",
      },
    ],
    previous: steps.buildSteps[0],
    diff: {
      added: ["frontend/src/hooks/useNotes.js"],
      removed: [],
      modified: [],
    },
    connections: [
      {
        id: "fn:handleSave->calls->fn:useNotes.addNote",
        type: "calls",
        explanation: "The new card appears straight away.",
        source: {
          id: "fn:handleSave",
          kind: "function",
          name: "handleSave",
          fileId: "frontend/src/components/NoteForm.jsx",
          line: 14,
        },
        target: {
          id: "fn:useNotes.addNote",
          kind: "function",
          name: "addNote",
        },
      },
    ],
    flows,
  };
  mockFetchRoutes({
    "/api/build-steps": steps,
    "/api/build-steps/add-state": response,
    "/api/project/snapshots/1": { order: 1, tree: tree([]) },
    "/api/project/snapshots/2": {
      order: 2,
      tree: tree([
        {
          type: "file",
          name: "useNotes.js",
          path: "frontend/src/hooks/useNotes.js",
          layer: "frontend",
          purpose: "Notes state.",
        },
      ]),
    },
  });
  render(
    <MemoryRouter initialEntries={["/build/add-state"]}>
      <Routes>
        <Route path="/build" element={<BuildPage />} />
        <Route path="/build/:step" element={<BuildStepPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const lesson = () => screen.getByRole("article");

describe("BuildStepPage", () => {
  beforeEach(() => {
    clearApiCache();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("renders every section in order, even for a skeleton step", async () => {
    renderStep(skeleton);
    await screen.findByRole("heading", { level: 1, name: "Add state" });

    expect(
      within(lesson())
        .getAllByRole("heading", { level: 2 })
        .map((h) => h.textContent),
    ).toEqual(SECTIONS);
    // Unwritten sections say so instead of being empty.
    expect(
      screen.getAllByText("This part of the lesson is still being written."),
    ).toHaveLength(4);
    expect(screen.getByText("Step 2 of 2", { exact: false })).toBeVisible();
  });

  it("renders the written lesson: numbered steps, code, concepts, changes", async () => {
    renderStep(written);
    await screen.findByRole("heading", { level: 1, name: "Add state" });

    expect(screen.queryByText(/still being written/)).toBeNull();
    expect(screen.getByText("State is data React remembers.")).toBeVisible();
    expect(screen.getByText("Step 1:")).toBeInTheDocument();
    const codes = [...document.querySelectorAll("pre code")].map(
      (code) => code.textContent,
    );
    expect(codes).toEqual([
      "export function useNotes() {}",
      "const [notes, setNotes] = useState([]);",
    ]);
    // Linked from "Concepts introduced" and again from the summary.
    expect(
      screen.getAllByRole("link", { name: /useState/ })[0],
    ).toHaveAttribute("href", "/concepts/react-usestate");
    expect(screen.getByText("Changing state directly.")).toBeVisible();

    // What changed: diff list and BEFORE/AFTER trees with nested headings.
    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: "Files changed in this step",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("treeitem", { name: "useNotes.js, added" }),
    ).toBeVisible();
    expect(
      screen.getAllByRole("link", {
        name: "frontend/src/hooks/useNotes.js",
      })[0],
    ).toHaveAttribute(
      "href",
      "/explorer?file=frontend%2Fsrc%2Fhooks%2FuseNotes.js",
    );
  });

  it("shows the timeline with the current step", async () => {
    renderStep(skeleton);
    const nav = await screen.findByRole("navigation", { name: "Build steps" });
    expect(
      within(nav).getByRole("link", { name: "2. Add state (current step)" }),
    ).toHaveAttribute("aria-current", "step");
    expect(
      within(nav).getByRole("link", {
        name: "1. Create a page (earlier step)",
      }),
    ).toBeVisible();
  });

  it("shows not found for an unknown step", async () => {
    mockFetchRoutes({});
    render(
      <MemoryRouter initialEntries={["/build/cooking"]}>
        <Routes>
          <Route path="/build/:step" element={<BuildStepPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "Build step not found" }),
    ).toBeInTheDocument();
  });
});

describe("BuildPage", () => {
  beforeEach(() => clearApiCache());

  it("lists every step with its goal", async () => {
    mockFetchRoutes({ "/api/build-steps": steps });
    render(
      <MemoryRouter initialEntries={["/build"]}>
        <Routes>
          <Route path="/build" element={<BuildPage />} />
        </Routes>
      </MemoryRouter>,
    );
    const nav = await screen.findByRole("navigation", { name: "Build steps" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    expect(within(nav).getByText("A page.")).toBeVisible();
  });
});

describe("BuildStepPage connections", () => {
  beforeEach(() => {
    clearApiCache();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("shows the connections the step creates and counts them in the diff", async () => {
    renderStep(written);
    await screen.findByRole("heading", { level: 1, name: "Add state" });
    const section = screen.getByRole("heading", {
      level: 2,
      name: "Connections created",
    }).parentElement!;
    expect(section).toHaveTextContent(
      "function handleSave→ calls →function addNote",
    );
    expect(
      within(section).getByRole("link", { name: "function handleSave" }),
    ).toHaveAttribute(
      "href",
      "/explorer?symbol=fn%3AhandleSave&file=frontend%2Fsrc%2Fcomponents%2FNoteForm.jsx&line=14",
    );
    expect(await screen.findByText("1 new concept")).toBeInTheDocument();
    expect(screen.getByText("1 new connection")).toBeInTheDocument();
  });

  it("links to the flows that show the step at work, and only then", async () => {
    renderStep(written, [
      {
        id: "login",
        title: "Log in",
        summary: "Follow a login to the `Set-Cookie`.",
        group: "security",
        direction: "round-trip",
        stepCount: 21,
      },
    ]);
    await screen.findByRole("heading", { level: 1, name: "Add state" });
    const section = screen.getByRole("heading", {
      level: 2,
      name: "See it happen",
    }).parentElement!;
    expect(
      within(section).getByRole("link", { name: "Log in" }),
    ).toHaveAttribute("href", "/flow?flow=login&step=1");
    expect(section).toHaveTextContent(
      "(21 steps): Follow a login to the Set-Cookie.",
    );
  });
});

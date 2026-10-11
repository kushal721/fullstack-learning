import type {
  BuildStepListResponse,
  DiffResponse,
  FileTreeFolder,
  SnapshotResponse,
} from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { clearApiCache } from "../hooks/useApi.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import ProjectPage from "./ProjectPage.tsx";

const steps: BuildStepListResponse = {
  buildSteps: [
    { id: "a", slug: "a", order: 1, title: "Plan", goal: "Plan it." },
    { id: "b", slug: "b", order: 2, title: "Create", goal: "Create it." },
  ],
};

const file = (path: string) => ({
  type: "file" as const,
  name: path.split("/").at(-1)!,
  path,
  layer: "frontend" as const,
  purpose: "A file.",
});
const tree = (...paths: string[]): FileTreeFolder => ({
  type: "folder",
  name: "notes-app",
  path: "",
  children: paths.length
    ? [
        {
          type: "folder",
          name: "frontend",
          path: "frontend",
          children: [
            {
              type: "folder",
              name: "src",
              path: "frontend/src",
              children: paths.map(file),
            },
          ],
        },
      ]
    : [],
});
const snapshot = (order: number, t: FileTreeFolder): SnapshotResponse => ({
  order,
  tree: t,
});
const noChanges: DiffResponse = { added: [], removed: [], modified: [] };

function Location() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

function renderAt(path: string) {
  mockFetchRoutes({
    "/api/build-steps": steps,
    "/api/project/snapshots/0": snapshot(0, tree()),
    "/api/project/snapshots/1": snapshot(1, tree()),
    "/api/project/snapshots/2": snapshot(
      2,
      tree("frontend/src/App.jsx", "frontend/src/main.jsx"),
    ),
    "/api/project/diff?from=0&to=1": noChanges,
    "/api/project/diff?from=1&to=2": {
      added: ["frontend/src/App.jsx", "frontend/src/main.jsx"],
      removed: [],
      modified: [],
    },
  });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/project" element={<ProjectPage />} />
        <Route path="*" element={null} />
      </Routes>
      <Location />
    </MemoryRouter>,
  );
}

describe("ProjectPage", () => {
  beforeEach(() => clearApiCache());

  it("shows the last step by default, with before, after and the changes", async () => {
    renderAt("/project");

    expect(
      await screen.findByRole("heading", { name: "What changed in step 2" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Step")).toHaveValue("2");
    expect(screen.getByText("2 added, 0 modified, 0 removed.")).toBeVisible();

    const after = screen.getByRole("tree", { name: "Files after step 2" });
    // Folders with changes start open; the marker is part of the name.
    expect(
      within(after).getByRole("treeitem", { name: "App.jsx, added" }),
    ).toBeVisible();
    expect(
      screen.getByRole("region", {
        name: "Before: after step 1",
      }),
    ).toHaveTextContent("notes-app/ is empty");
  });

  it("syncs the step with ?step= and moves with the buttons", async () => {
    renderAt("/project?step=1");

    expect(
      await screen.findByText(/No files change in this step/),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Next →" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "← Previous" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/project?step=0");
    expect(
      await screen.findByText("Before step 1 the project is an empty folder."),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "← Previous" })).toBeDisabled();

    await userEvent.selectOptions(screen.getByLabelText("Step"), "2");
    expect(
      await screen.findByRole("heading", { name: "What changed in step 2" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next →" })).toBeDisabled();
  });

  it("falls back to the last step for an invalid ?step=", async () => {
    renderAt("/project?step=99");
    expect(
      await screen.findByRole("heading", { name: "What changed in step 2" }),
    ).toBeInTheDocument();
  });

  it("opens a file in the explorer from the tree and the change list", async () => {
    renderAt("/project?step=2");
    const link = await screen.findByRole("link", {
      name: "frontend/src/App.jsx",
    });
    expect(link).toHaveAttribute(
      "href",
      "/explorer?file=frontend%2Fsrc%2FApp.jsx",
    );

    await userEvent.click(
      screen.getByRole("treeitem", { name: "main.jsx, added" }),
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/explorer?file=frontend%2Fsrc%2Fmain.jsx",
    );
  });
});

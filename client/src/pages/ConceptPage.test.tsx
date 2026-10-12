import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStateConceptFixture } from "../test/fixtures.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import ConceptPage from "./ConceptPage.tsx";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/concepts/:concept" element={<ConceptPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ConceptPage", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("shows every section in the fixed order", async () => {
    mockFetchRoutes({ "/api/concepts/react-usestate": useStateConceptFixture });
    renderAt("/concepts/react-usestate");

    expect(
      await screen.findByRole("heading", { level: 1, name: "useState" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      "Start from the basics",
      "What is it?",
      "Why do we need it?",
      "How does it work?",
      "Basic example",
      "What happens internally?",
      "How do I create it from scratch?",
      "Where is it used?",
      "What does it connect to?",
      "In the Notes App",
      "Where to find it",
      "Common mistakes",
      "Related",
    ]);
  });

  it("renders content, code, steps and links", async () => {
    mockFetchRoutes({ "/api/concepts/react-usestate": useStateConceptFixture });
    renderAt("/concepts/react-usestate");

    await screen.findByRole("heading", { level: 1, name: "useState" });
    expect(screen.getByRole("link", { name: "6. React" })).toHaveAttribute(
      "href",
      "/learn/react",
    );
    const codes = [...document.querySelectorAll("pre code")].map(
      (code) => code.textContent,
    );
    expect(codes).toContain("const [count, setCount] = useState(0);");
    expect(codes).toContain("npm create vite@latest");
    expect(screen.getByText("useNotes").tagName).toBe("CODE");

    expect(screen.getByText("Step 2:", { exact: false })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /HTML <button>/ })).toHaveAttribute(
      "href",
      "/concepts/html-button",
    );
  });

  it("shows not-found for an unknown concept", async () => {
    mockFetchRoutes({});
    renderAt("/concepts/flux-capacitor");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Concept not found",
      }),
    ).toBeInTheDocument();
  });

  it("shows an error with retry when the API is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    renderAt("/concepts/react-usestate");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the server.",
    );
  });

  it("navigates to a related concept", async () => {
    mockFetchRoutes({
      "/api/concepts/react-usestate": useStateConceptFixture,
      "/api/concepts/html-button": {
        ...useStateConceptFixture,
        concept: {
          ...useStateConceptFixture.concept,
          id: "html-button",
          slug: "html-button",
          title: "HTML <button>",
        },
        related: [],
      },
    });
    renderAt("/concepts/react-usestate");

    await userEvent.click(
      await screen.findByRole("link", { name: /HTML <button>/ }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "HTML <button>" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No related concepts yet.")).toBeInTheDocument();
  });

  it("links to the files that use the concept and the steps that introduce it", async () => {
    mockFetchRoutes({ "/api/concepts/react-usestate": useStateConceptFixture });
    renderAt("/concepts/react-usestate");
    await screen.findByRole("heading", { level: 1, name: "useState" });

    expect(
      screen.getByRole("link", { name: "frontend/src/hooks/useNotes.js:6" }),
    ).toHaveAttribute(
      "href",
      "/explorer?file=frontend%2Fsrc%2Fhooks%2FuseNotes.js&line=6",
    );
    // Without a known line the link opens the file.
    expect(
      screen.getByRole("link", {
        name: "frontend/src/components/NoteForm.jsx",
      }),
    ).toHaveAttribute(
      "href",
      "/explorer?file=frontend%2Fsrc%2Fcomponents%2FNoteForm.jsx",
    );
    expect(
      screen.getByRole("link", { name: /Step 6: Add state/ }),
    ).toHaveAttribute("href", "/build/add-state");
  });
});

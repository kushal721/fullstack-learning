import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { fileTreeFixture } from "../test/fixtures.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import ExplorerPage from "./ExplorerPage.tsx";

function ShowLocation() {
  const location = useLocation();
  return <output data-testid="location">{location.search}</output>;
}

function fileBody(path: string) {
  return {
    file: {
      id: path,
      path,
      layer: "frontend",
      language: "html",
      purpose: "The single HTML page.",
      whyItExists: "Every website starts with an HTML document.",
      conceptIds: ["html-document"],
    },
    source: `<!-- ${path} -->\n`,
    concepts: [
      {
        id: "html-document",
        slug: "html-document",
        title: "HTML document",
        topicId: "html",
        summary: "The page.",
      },
    ],
  };
}

function renderAt(url: string) {
  Element.prototype.scrollIntoView = () => {};
  mockFetchRoutes({
    "/api/files": { tree: fileTreeFixture },
    "/api/files/frontend/index.html": fileBody("frontend/index.html"),
    "/api/files/frontend/src/App.jsx": fileBody("frontend/src/App.jsx"),
  });
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route
          path="/explorer"
          element={
            <>
              <ExplorerPage />
              <ShowLocation />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ExplorerPage", () => {
  it("loads the file tree and asks the learner to choose a file", async () => {
    renderAt("/explorer");
    expect(
      await screen.findByRole("tree", { name: "Notes App files" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Choose a file/)).toBeInTheDocument();
  });

  it("puts the selected file in the URL", async () => {
    renderAt("/explorer");
    await userEvent.click(
      await screen.findByRole("treeitem", { name: "index.html" }),
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "?file=frontend%2Findex.html",
    );
    expect(screen.getByText("The single HTML page.")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "frontend/index.html" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("<!-- frontend/index.html -->"),
    ).toBeInTheDocument();
  });

  it("opens the file from the URL, as after a reload", async () => {
    renderAt("/explorer?file=frontend/src/App.jsx");
    expect(
      await screen.findByRole("heading", { name: "frontend/src/App.jsx" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("treeitem", { name: "App.jsx" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("says so when the file in the URL does not exist", async () => {
    renderAt("/explorer?file=frontend/nope.js");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "frontend/nope.js",
    );
  });

  it("shows an error with retry when the API is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    render(
      <MemoryRouter initialEntries={["/explorer"]}>
        <ExplorerPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the server.",
    );
  });

  it("shows why the file exists and links its concepts", async () => {
    renderAt("/explorer?file=frontend/index.html");
    const about = await screen.findByRole("complementary", {
      name: "About this file",
    });
    expect(about).toHaveTextContent(
      "Every website starts with an HTML document.",
    );
    expect(screen.getByRole("link", { name: "HTML document" })).toHaveAttribute(
      "href",
      "/concepts/html-document",
    );
  });
});

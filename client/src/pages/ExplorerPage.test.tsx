import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { fileTreeFixture } from "../test/fixtures.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import ExplorerPage from "./ExplorerPage.tsx";

// React Flow needs a real browser to measure nodes; the graph itself is
// checked in the browser. Here it only shows what it received.
vi.mock("../components/connection-graph/ConnectionGraph.tsx", () => ({
  default: ({
    nodes,
    centerId,
  }: {
    nodes: { id: string }[];
    centerId: string;
  }) => (
    <p data-testid="graph">
      {centerId}: {nodes.map((n) => n.id).join(", ")}
    </p>
  ),
}));

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
    "/api/files/frontend/src/App.jsx/symbols": {
      file: {
        id: "frontend/src/App.jsx",
        path: "frontend/src/App.jsx",
        layer: "frontend",
        purpose: "x",
      },
      defined: [
        {
          id: "component:App",
          kind: "component",
          name: "App",
          fileId: "frontend/src/App.jsx",
          line: 10,
        },
        {
          id: "fn:app.handleLogout",
          kind: "function",
          name: "handleLogout",
          fileId: "frontend/src/App.jsx",
          line: 27,
        },
      ],
      referenced: [],
      imports: [],
      importedBy: [],
    },
    "/api/symbols/fn%3Aapp.handleLogout/graph?depth=1": {
      nodes: [
        {
          id: "fn:app.handleLogout",
          kind: "function",
          name: "handleLogout",
          summary: "x",
          conceptIds: [],
        },
        {
          id: "fn:authApi.logout",
          kind: "function",
          name: "logout",
          summary: "x",
          conceptIds: [],
        },
      ],
      edges: [],
    },
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

  describe("connections", () => {
    it("lists the open file's symbols, each opening its connections", async () => {
      renderAt("/explorer?file=frontend/src/App.jsx");
      const link = await screen.findByRole("link", { name: /handleLogout/ });
      expect(link).toHaveAttribute(
        "href",
        "/explorer?file=frontend%2Fsrc%2FApp.jsx&symbol=fn%3Aapp.handleLogout",
      );
      await userEvent.click(link);
      expect(
        await screen.findByRole("heading", {
          name: "Connections of fn:app.handleLogout",
        }),
      ).toBeInTheDocument();
      expect(await screen.findByTestId("graph")).toHaveTextContent(
        "fn:app.handleLogout: fn:app.handleLogout, fn:authApi.logout",
      );
    });

    it("shows the graph for ?symbol= even without a file, and Close removes it", async () => {
      renderAt("/explorer?symbol=fn:app.handleLogout");
      expect(await screen.findByTestId("graph")).toBeInTheDocument();
      expect(screen.queryByText(/Choose a file/)).toBeNull();
      await userEvent.click(screen.getByRole("link", { name: "Close" }));
      expect(screen.getByTestId("location")).toHaveTextContent(/^$/);
      expect(screen.queryByTestId("graph")).toBeNull();
    });

    it("shows an error for an unknown symbol", async () => {
      renderAt("/explorer?symbol=fn:nope");
      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });
  });
});

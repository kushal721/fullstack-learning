import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { topicTreeFixture } from "../test/fixtures.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import ConceptsPage from "./ConceptsPage.tsx";

const concepts = [
  {
    id: "html-button",
    slug: "html-button",
    title: "HTML <button>",
    topicId: "html",
    summary: "Trigger an action.",
  },
  {
    id: "react-usestate",
    slug: "react-usestate",
    title: "useState",
    topicId: "react",
    summary: "Remember a value.",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ConceptsPage />
    </MemoryRouter>,
  );
}

describe("ConceptsPage", () => {
  it("groups concepts under their topics", async () => {
    mockFetchRoutes({
      "/api/concepts": { concepts },
      "/api/topics": { tree: topicTreeFixture },
    });
    renderPage();

    const html = await screen.findByRole("region", { name: "1. HTML" });
    expect(
      within(html).getByRole("link", { name: /HTML <button>/ }),
    ).toHaveAttribute("href", "/concepts/html-button");
    const react = screen.getByRole("region", { name: "2. React" });
    expect(
      within(react).getByRole("link", { name: /useState/ }),
    ).toHaveAttribute("href", "/concepts/react-usestate");
  });

  it("shows an empty message when there are no concepts", async () => {
    mockFetchRoutes({
      "/api/concepts": { concepts: [] },
      "/api/topics": { tree: topicTreeFixture },
    });
    renderPage();

    expect(await screen.findByText("No concepts yet.")).toBeInTheDocument();
  });

  it("shows an error with retry when the API is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the server.",
    );
  });
});

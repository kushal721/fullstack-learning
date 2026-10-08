import type { TopicResponse } from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactTopicFixture, topicTreeFixture } from "../test/fixtures.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import TopicPage from "./TopicPage.tsx";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learn/:topic" element={<TopicPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockApi(topic: TopicResponse = reactTopicFixture) {
  return mockFetchRoutes({
    "/api/topics": { tree: topicTreeFixture },
    "/api/topics/react": topic,
  });
}

describe("TopicPage", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("shows the topic, its overview and sub-topics", async () => {
    mockApi();
    renderAt("/learn/react");

    expect(
      await screen.findByRole("heading", { level: 1, name: "React" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Topic 2")).toBeInTheDocument();
    expect(
      screen.getByText(
        "React lets you describe the page for the current data.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("setNotes").tagName).toBe("CODE");
    expect(screen.getByRole("link", { name: /Hooks/ })).toHaveAttribute(
      "href",
      "/learn/hooks",
    );
  });

  it("links to the previous topic and has no next link at the end", async () => {
    mockApi();
    renderAt("/learn/react");

    const nav = await screen.findByRole("navigation", { name: "Topics" });
    expect(within(nav).getByRole("link", { name: /HTML/ })).toHaveAttribute(
      "href",
      "/learn/html",
    );
    expect(within(nav).queryByText("Next topic →")).toBeNull();
  });

  it("highlights the current topic in the sidebar tree", async () => {
    mockApi();
    renderAt("/learn/react");

    const sidebar = await screen.findByRole("complementary", {
      name: "All topics",
    });
    const current = await within(sidebar).findByRole("treeitem", {
      name: "React",
    });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("tabindex", "0");
  });

  it("hides concept and build step sections when they are empty", async () => {
    mockApi();
    renderAt("/learn/react");

    await screen.findByRole("heading", { level: 1, name: "React" });
    expect(screen.queryByText("Concepts in this topic")).toBeNull();
    expect(screen.queryByText("Where you build it")).toBeNull();
  });

  it("shows concepts and build steps when there are some", async () => {
    mockApi({
      ...reactTopicFixture,
      concepts: [
        {
          id: "react-usestate",
          slug: "react-usestate",
          title: "useState",
          topicId: "react",
          summary: "Remember a value.",
        },
      ],
      buildSteps: [
        {
          id: "add-state",
          slug: "add-state",
          order: 6,
          title: "Add state",
          goal: "Keep the notes in state.",
        },
      ],
    });
    renderAt("/learn/react");

    expect(
      await screen.findByRole("link", { name: /useState/ }),
    ).toHaveAttribute("href", "/concepts/react-usestate");
    expect(
      screen.getByRole("link", { name: /Step 6: Add state/ }),
    ).toHaveAttribute("href", "/build/add-state");
  });

  it("shows not-found for an unknown topic", async () => {
    mockApi();
    renderAt("/learn/cooking");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Topic not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('There is no topic called "cooking".'),
    ).toBeInTheDocument();
  });

  it("shows an error with retry when the API is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    renderAt("/learn/react");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the server.",
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });
});

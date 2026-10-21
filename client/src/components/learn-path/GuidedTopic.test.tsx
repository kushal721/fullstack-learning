import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TopicPage from "../../pages/TopicPage.tsx";
import {
  htmlPathFixture,
  reactTopicFixture,
  topicTreeFixture,
} from "../../test/fixtures.ts";
import { mockFetchRoutes } from "../../test/mock-fetch.ts";
import { resetProgress } from "./progress.ts";

// The fixture tree, with HTML marked as having a guided path.
const tree = {
  ...topicTreeFixture,
  children: topicTreeFixture.children.map((topic) =>
    topic.id === "html" ? { ...topic, hasPath: true } : topic,
  ),
};

function renderAt(path: string) {
  mockFetchRoutes({
    "/api/topics": { tree },
    "/api/paths/html": htmlPathFixture,
  });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learn/:topic" element={<TopicPage />} />
        <Route path="/learn/:topic/:step" element={<TopicPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const levels = () => screen.getByRole("navigation", { name: "Levels" });
const dots = (level = "Basic") =>
  screen.getByRole("navigation", { name: `${level} steps` });

describe("GuidedTopic", () => {
  beforeEach(() => {
    resetProgress();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("opens on the overview with only Basic's steps, and Basic marked as the start", async () => {
    renderAt("/learn/html");

    expect(
      await screen.findByRole("heading", { level: 1, name: "HTML" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Topic 1 · 7 steps in 3 levels · about 0.5 h"),
    ).toBeInTheDocument();
    expect(screen.getByText("Gives a page its structure.")).toBeInTheDocument();
    expect(screen.getByText("From file to page")).toBeInTheDocument();

    // The dots: Overview (current) and Basic's steps 1–3 only.
    const nav = dots();
    expect(within(nav).getByRole("link", { name: /Overview/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(within(nav).getAllByRole("link")).toHaveLength(4);
    expect(
      within(nav).getByRole("link", {
        name: "Step 3: Basic check (level check)",
      }),
    ).toHaveAttribute("href", "/learn/html/basic-3");

    // The level switcher shows ranges; Basic is current.
    const basic = within(levels()).getByRole("link", { name: /Basic/ });
    expect(basic).toHaveAttribute("aria-current", "true");
    expect(within(levels()).getByText(/Steps 4–5/)).toBeInTheDocument();

    expect(screen.getByText("Start here")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Start Basic: step 1 →" }),
    ).toHaveAttribute("href", "/learn/html/basic-1");
  });

  it("shows a step's number, its place in the level and the current dot", async () => {
    renderAt("/learn/html/basic-2");

    expect(
      await screen.findByRole("heading", { level: 2, name: "Links" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Step 2 · 2 of 3 in Basic · about 3 min/),
    ).toBeInTheDocument();
    expect(
      within(dots()).getByRole("link", { name: "Step 2: Links" }),
    ).toHaveAttribute("aria-current", "step");
    // The sidebar lists the open level's steps.
    const sidebar = screen.getByRole("navigation", {
      name: "HTML: levels and steps",
    });
    expect(
      within(sidebar).getByRole("link", { name: "Step 2: Links" }),
    ).toHaveAttribute("aria-current", "step");
    expect(
      screen.getByRole("link", { name: /Step 3: Basic check →/ }),
    ).toBeInTheDocument();
  });

  it("continues the numbering in Intermediate and says it continues from Basic", async () => {
    const user = userEvent.setup();
    renderAt("/learn/html/basic-1");
    await screen.findByRole("heading", { level: 2, name: "Tags" });

    await user.click(
      within(levels()).getByRole("link", { name: /Intermediate/ }),
    );

    expect(
      await screen.findByRole("heading", { level: 2, name: "Forms" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Step 4 · 1 of 2 in Intermediate/),
    ).toBeInTheDocument();
    expect(within(dots("Intermediate")).getAllByRole("link")).toHaveLength(3);

    const note = screen.getByRole("note");
    expect(note).toHaveTextContent(
      "Intermediate continues from Basic (steps 1–3). You've finished 0 of those 3.",
    );
    expect(
      within(note).getByRole("link", { name: "Back to Basic: step 1" }),
    ).toHaveAttribute("href", "/learn/html/basic-1");

    await user.click(
      within(note).getByRole("button", { name: "Carry on here" }),
    );
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("returns to the step a learner was on when they switch back to a level", async () => {
    const user = userEvent.setup();
    renderAt("/learn/html/basic-2");
    await screen.findByRole("heading", { level: 2, name: "Links" });

    await user.click(within(levels()).getByRole("link", { name: /Advanced/ }));
    await screen.findByRole("heading", { level: 2, name: "ARIA" });

    expect(
      within(levels()).getByRole("link", { name: /Basic/ }),
    ).toHaveAttribute("href", "/learn/html/basic-2");
    await user.click(within(levels()).getByRole("link", { name: /Basic/ }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Links" }),
    ).toBeInTheDocument();
  });

  it("moves between steps with the arrow keys", async () => {
    const user = userEvent.setup();
    renderAt("/learn/html/basic-1");
    await screen.findByRole("heading", { level: 2, name: "Tags" });

    within(dots()).getByRole("link", { name: "Step 1: Tags" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(
      await screen.findByRole("heading", { level: 2, name: "Links" }),
    ).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(
      await screen.findByRole("heading", { level: 2, name: "In short" }),
    ).toBeInTheDocument();
  });

  it("says when a step doesn't exist", async () => {
    renderAt("/learn/html/nope");

    expect(await screen.findByText("Step not found")).toBeInTheDocument();
  });
});

describe("TopicPage without a guided path", () => {
  it("never asks for a path the tree says isn't there", async () => {
    const fetch = mockFetchRoutes({
      "/api/topics": { tree: topicTreeFixture },
      "/api/topics/react": reactTopicFixture,
    });
    render(
      <MemoryRouter initialEntries={["/learn/react"]}>
        <Routes>
          <Route path="/learn/:topic" element={<TopicPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "React" }),
    ).toBeInTheDocument();
    const urls = fetch.mock.calls.map(([input]) => String(input));
    expect(urls.some((url) => url.startsWith("/api/paths"))).toBe(false);
  });

  it("says a step URL doesn't exist", async () => {
    mockFetchRoutes({ "/api/topics": { tree: topicTreeFixture } });
    render(
      <MemoryRouter initialEntries={["/learn/react/basic-1"]}>
        <Routes>
          <Route path="/learn/:topic/:step" element={<TopicPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Step not found")).toBeInTheDocument();
  });
});

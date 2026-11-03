import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TopicPage from "../../pages/TopicPage.tsx";
import {
  htmlPathFixture,
  htmlStep1Fixture,
  htmlStep2Fixture,
  htmlStep3Fixture,
  topicTreeFixture,
} from "../../test/fixtures.ts";
import { mockFetchRoutes } from "../../test/mock-fetch.ts";
import { MODULE_VIEW_KEY } from "../../hooks/useModuleView.ts";
import { resetProgress } from "../../hooks/usePathProgress.ts";

const tree = {
  ...topicTreeFixture,
  children: topicTreeFixture.children.map((topic) =>
    topic.id === "html" ? { ...topic, hasPath: true } : topic,
  ),
};

const routes = {
  "/api/topics": { tree },
  "/api/paths/html": htmlPathFixture,
  "/api/paths/html/steps/basic-1": htmlStep1Fixture,
  "/api/paths/html/steps/basic-2": htmlStep2Fixture,
  "/api/paths/html/steps/basic-3": htmlStep3Fixture,
};

function Where() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learn/:topic" element={<TopicPage />} />
        <Route path="/learn/:topic/:step" element={<TopicPage />} />
      </Routes>
      <Where />
    </MemoryRouter>,
  );
}

describe("StepPlayer", () => {
  beforeEach(() => {
    resetProgress();
    localStorage.clear();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("lists the step's concepts first, then its terms, as links to the glossary", async () => {
    mockFetchRoutes(routes);
    renderAt("/learn/html/basic-1");

    const words = await screen.findByRole("region", {
      name: "Concepts and terms in this step",
    });
    const links = within(words).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "◆HTML element (concept)",
      "HTML document (term)",
    ]);
    expect(links[0]).toHaveAttribute(
      "href",
      "/learn/html/basic-1?term=html-element",
    );
    expect(links[0]).toHaveAttribute("title", "One building block of a page.");
  });

  it("renders every kind of block, with glossary words as links", async () => {
    mockFetchRoutes(routes);
    renderAt("/learn/html/basic-1");

    // explain: a labelled term link, bold and inline code.
    const element = await screen.findByRole("link", { name: "element" });
    expect(element).toHaveAttribute(
      "href",
      "/learn/html/basic-1?term=html-element",
    );
    expect(screen.getByText("one tag").tagName).toBe("STRONG");
    expect(screen.getAllByText("<p>")[0]!.tagName).toBe("CODE");
    // keyPoints: an unlabelled link shows the entry's term.
    expect(
      screen.getByRole("link", { name: "HTML document" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Like the walls of a house/)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Tag (<p>) then Element" }),
    ).toBeInTheDocument();
    expect(screen.getByText("two paragraphs")).toBeInTheDocument();
    expect(screen.getByText("Line 2:")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See it in the Explorer →" }),
    ).toHaveAttribute("href", "/explorer?file=frontend%2Findex.html");
    expect(screen.getByText("From file to page")).toBeInTheDocument();
  });

  it("checks a quick check on the server and explains a right answer", async () => {
    const user = userEvent.setup();
    const fetch = mockFetchRoutes(routes);
    renderAt("/learn/html/basic-1");
    await screen.findByText("Which one is an element?");

    fetch.mockImplementation(async (_input, init) => {
      const { choiceId } = JSON.parse(String(init?.body)) as {
        choiceId: string;
      };
      const correct = choiceId === "element";
      return new Response(
        JSON.stringify({
          correct,
          explanation: "An element is the whole thing, tags and content.",
          expected: { choiceId: "element" },
        }),
        { status: 200 },
      );
    });

    const group = screen.getByRole("group", { name: "Quick check" });
    await user.click(within(group).getByRole("radio", { name: "<p> alone" }));
    expect(
      await within(group).findByText("Not quite, try another one"),
    ).toBeInTheDocument();
    expect(within(group).queryByText(/whole thing/)).toBeNull();
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/paths/html/steps/basic-1/check",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ block: 5, choiceId: "tag" }),
      }),
    );

    await user.click(within(group).getByRole("radio", { name: "<p>Hi</p>" }));
    expect(await within(group).findByText("Correct")).toBeInTheDocument();
    expect(
      within(group).getByText(/whole thing, tags and content/),
    ).toBeInTheDocument();
  });

  it("marks the step done and moves on, with focus on the next title", async () => {
    const user = userEvent.setup();
    mockFetchRoutes(routes);
    renderAt("/learn/html/basic-1");
    await screen.findByText("Which one is an element?");

    expect(screen.getByText("2 · Links")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Done, next step →" }));

    const title = await screen.findByRole("heading", {
      level: 2,
      name: "Links",
    });
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/learn/html/basic-2",
    );
    expect(title).toHaveFocus();
    expect(
      within(screen.getByRole("navigation", { name: "Basic steps" })).getByRole(
        "link",
        { name: "Step 1: Tags (done)" },
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Step 1" })).toHaveAttribute(
      "href",
      "/learn/html/basic-1",
    );
  });

  it("leaves completing a level check to the check itself", async () => {
    mockFetchRoutes(routes);
    renderAt("/learn/html/basic-3");

    expect(await screen.findByText("What wraps content?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Done|Finish/ })).toBeNull();
    expect(screen.getByRole("link", { name: "← Step 2" })).toBeInTheDocument();
  });

  it("shows a module one part at a time, with its objectives first", async () => {
    const user = userEvent.setup();
    mockFetchRoutes({
      ...routes,
      "/api/paths/html/steps/basic-2": {
        ...htmlStep2Fixture,
        step: { ...htmlStep2Fixture.step, parts: 2 },
        objectives: ["Write a link."],
        blocks: [
          { type: "explain", text: "Part one, first block." },
          { type: "explain", text: "Part one, second block." },
          { type: "explain", text: "Part two's block." },
        ],
        sections: [
          { id: "one", title: "The first part", blockCount: 2 },
          { id: "two", title: "The second part", blockCount: 1 },
        ],
      },
    });
    renderAt("/learn/html/basic-2");

    expect(
      await screen.findByRole("heading", { name: "The first part" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "What you'll learn" }),
    ).toHaveTextContent("Write a link.");
    expect(screen.getByText("Part 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Part one, second block.")).toBeInTheDocument();
    expect(screen.queryByText("Part two's block.")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Done, next step/ }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Next: The second part →" }),
    );
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/learn/html/basic-2?part=2",
    );
    const heading = screen.getByRole("heading", { name: "The second part" });
    expect(heading).toHaveFocus();
    expect(screen.getByText("Part two's block.")).toBeInTheDocument();
    expect(
      screen.queryByText("Part one, first block."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "What you'll learn" }),
    ).not.toBeInTheDocument();

    // The last part moves on to the next step; the first link goes back.
    expect(
      screen.getByRole("button", { name: /Done, next step/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Part 1" })).toHaveAttribute(
      "href",
      "/learn/html/basic-2",
    );
  });

  const moduleStep = {
    ...htmlStep2Fixture,
    step: { ...htmlStep2Fixture.step, parts: 2 },
    objectives: ["Write a link."],
    blocks: [
      { type: "explain", text: "Part one, first block." },
      { type: "explain", text: "Part one, second block." },
      { type: "explain", text: "Part two's block." },
    ],
    sections: [
      { id: "one", title: "The first part", blockCount: 2 },
      { id: "two", title: "The second part", blockCount: 1 },
    ],
  };

  it("reads a module on one page when asked, and remembers the choice", async () => {
    const user = userEvent.setup();
    mockFetchRoutes({ ...routes, "/api/paths/html/steps/basic-2": moduleStep });
    const { unmount } = renderAt("/learn/html/basic-2");

    const switcher = await screen.findByRole("group", {
      name: "How to read this module",
    });
    expect(
      within(switcher).getByRole("button", { name: "Part by part" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(
      within(switcher).getByRole("button", { name: "One page" }),
    );

    // Every part, each under its heading, with a list that jumps to each.
    expect(
      screen.getByRole("region", { name: "1. The first part" }),
    ).toHaveTextContent("Part one, second block.");
    expect(
      screen.getByRole("region", { name: "2. The second part" }),
    ).toHaveTextContent("Part two's block.");
    expect(screen.queryByText("Part 1 of 2")).not.toBeInTheDocument();
    const contents = screen.getByRole("navigation", { name: "On this page" });
    await user.click(
      within(contents).getByRole("link", { name: /The second part/ }),
    );
    expect(
      screen.getByRole("heading", { name: "2. The second part" }),
    ).toHaveFocus();
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/learn/html/basic-2",
    );
    expect(
      screen.getByRole("button", { name: /Done, next step/ }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(MODULE_VIEW_KEY)).toBe("page");

    // Next visit: still one page, and a ?part= link goes to that part.
    unmount();
    renderAt("/learn/html/basic-2?part=2");
    expect(
      await screen.findByRole("heading", { name: "2. The second part" }),
    ).toHaveFocus();
    expect(screen.getByText("Part one, first block.")).toBeInTheDocument();
  });
});

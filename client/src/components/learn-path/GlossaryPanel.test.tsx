import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TopicPage from "../../pages/TopicPage.tsx";
import {
  glossaryIndexFixture,
  htmlDocumentEntryFixture,
  htmlElementEntryFixture,
  htmlPathFixture,
  htmlStep1Fixture,
  topicTreeFixture,
} from "../../test/fixtures.ts";
import { mockFetchRoutes } from "../../test/mock-fetch.ts";
import { resetProgress } from "./progress.ts";

const tree = {
  ...topicTreeFixture,
  children: topicTreeFixture.children.map((topic) =>
    topic.id === "html" ? { ...topic, hasPath: true } : topic,
  ),
};

function Where() {
  const { search } = useLocation();
  return <p data-testid="search">{search}</p>;
}

function renderAt(path: string) {
  mockFetchRoutes({
    "/api/topics": { tree },
    "/api/paths/html": htmlPathFixture,
    "/api/paths/html/steps/basic-1": htmlStep1Fixture,
    "/api/glossary": glossaryIndexFixture,
    "/api/glossary/html-element": htmlElementEntryFixture,
    "/api/glossary/html-document": htmlDocumentEntryFixture,
  });
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

const panel = () => screen.getByRole("complementary", { name: "Glossary" });

describe("GlossaryPanel", () => {
  beforeEach(() => {
    resetProgress();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("opens beside the step when a word is clicked and explains it", async () => {
    const user = userEvent.setup();
    renderAt("/learn/html/basic-1");

    await user.click(await screen.findByRole("link", { name: "element" }));

    const heading = await within(panel()).findByRole("heading", {
      level: 3,
      name: "HTML element",
    });
    expect(heading).toHaveFocus();
    const p = within(panel());
    expect(p.getByText("Concept")).toBeInTheDocument();
    expect(p.getByText("Also called: tag")).toBeInTheDocument();
    expect(p.getByText("One building block of a page.")).toBeInTheDocument();
    expect(p.getByText(/A brick in a wall/)).toBeInTheDocument();
    expect(p.getByText("You're on this step")).toBeInTheDocument();
    expect(p.getByRole("link", { name: "step 2" })).toHaveAttribute(
      "href",
      "/learn/html/basic-2?term=html-element",
    );
    expect(
      p.getByRole("link", {
        name: "Read the full concept page: HTML element →",
      }),
    ).toHaveAttribute("href", "/concepts/html-element");
    // The step stays on screen, with the word highlighted.
    expect(screen.getByRole("link", { name: "element" })).toHaveClass(
      "bg-accent/15",
    );
  });

  it("follows a word inside an explanation, with a trail and Back", async () => {
    const user = userEvent.setup();
    renderAt("/learn/html/basic-1?term=html-element");

    const p = within(
      await screen.findByRole("complementary", { name: "Glossary" }),
    );
    await p.findByRole("heading", { level: 3, name: "HTML element" });
    await user.click(p.getAllByRole("link", { name: "HTML document" })[0]!);

    await p.findByRole("heading", { level: 3, name: "HTML document" });
    const trail = p.getByRole("navigation", { name: "Words you looked up" });
    expect(trail).toHaveTextContent("HTML element›HTML document");

    await user.click(p.getByRole("button", { name: "← HTML element" }));
    expect(
      await p.findByRole("heading", { level: 3, name: "HTML element" }),
    ).toBeInTheDocument();
    expect(
      p.queryByRole("navigation", { name: "Words you looked up" }),
    ).toBeNull();
  });

  it("closes with Esc and gives focus back to the word", async () => {
    const user = userEvent.setup();
    renderAt("/learn/html/basic-1");

    const word = await screen.findByRole("link", { name: "element" });
    await user.click(word);
    await within(panel()).findByRole("heading", {
      level: 3,
      name: "HTML element",
    });

    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("complementary", { name: "Glossary" }),
    ).toBeNull();
    expect(screen.getByTestId("search")).toHaveTextContent(/^$/);
    await vi.waitFor(() =>
      expect(screen.getByRole("link", { name: "element" })).toHaveFocus(),
    );
  });

  it("lists the step's words and every entry A to Z from the Glossary button", async () => {
    const user = userEvent.setup();
    renderAt("/learn/html/basic-1");
    await screen.findByRole("link", { name: "element" });

    await user.click(screen.getByRole("link", { name: "Glossary" }));

    const p = within(panel());
    expect(
      p.getByRole("searchbox", { name: "Search terms and concepts" }),
    ).toHaveFocus();
    const inStep = await p.findByRole("region", { name: "In step 1" });
    expect(within(inStep).getAllByRole("listitem")).toHaveLength(2);

    const all = p.getByRole("region", { name: "All terms and concepts" });
    expect(within(all).getAllByRole("listitem")).toHaveLength(3);
    await user.click(p.getByRole("button", { name: "Terms 1" }));
    expect(within(all).getAllByRole("listitem")).toHaveLength(1);
  });

  it("searches by name and alias, opens the first result on Enter, and says when nothing matches", async () => {
    const user = userEvent.setup();
    renderAt("/learn/html/basic-1?find=");

    const box = await within(
      await screen.findByRole("complementary", { name: "Glossary" }),
    ).findByRole("searchbox");
    await user.type(box, "doctype");
    expect(within(panel()).getByRole("status")).toHaveTextContent(
      "1 result for “doctype”",
    );

    await user.keyboard("{Enter}");
    expect(
      await within(panel()).findByRole("heading", {
        level: 3,
        name: "HTML document",
      }),
    ).toBeInTheDocument();

    await user.clear(within(panel()).getByRole("searchbox"));
    await user.type(within(panel()).getByRole("searchbox"), "kitchen");
    expect(within(panel()).getByRole("status")).toHaveTextContent(
      "Nothing called “kitchen” yet.",
    );
  });
});

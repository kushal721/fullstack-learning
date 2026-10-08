import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { topicTreeFixture } from "../../test/fixtures.ts";
import { LearningTree } from "./LearningTree.tsx";

function renderTree() {
  return render(
    <MemoryRouter>
      <LearningTree root={topicTreeFixture} />
    </MemoryRouter>,
  );
}

describe("LearningTree", () => {
  it("renders a labelled tree with every topic from the data", () => {
    renderTree();

    const tree = screen.getByRole("tree", { name: "Full-Stack Development" });
    const items = within(tree).getAllByRole("treeitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "1HTMLThe structure of a web page.",
      "2ReactComponents that update when data changes.",
      "1HooksRemembering values between renders.",
    ]);
  });

  it("names each item by its title and describes it with the summary", () => {
    renderTree();

    const react = screen.getByRole("treeitem", { name: "React" });
    expect(react).toHaveAccessibleDescription(
      "Components that update when data changes.",
    );
    expect(react).toHaveAttribute("href", "/learn/react");
  });

  it("tells screen readers the level and position of each item", () => {
    renderTree();

    const react = screen.getByRole("treeitem", { name: "React" });
    expect(react).toHaveAttribute("aria-level", "1");
    expect(react).toHaveAttribute("aria-posinset", "2");
    expect(react).toHaveAttribute("aria-setsize", "2");

    const hooks = screen.getByRole("treeitem", { name: "Hooks" });
    expect(hooks).toHaveAttribute("aria-level", "2");
    expect(hooks.closest('[role="group"]')).not.toBeNull();
  });
});

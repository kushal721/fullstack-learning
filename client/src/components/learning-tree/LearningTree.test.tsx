import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    // Label in Name (WCAG 2.5.3): the name comes from the item's own text,
    // not a reference that could leave out what's on screen.
    expect(react).not.toHaveAttribute("aria-labelledby");
    expect(react).not.toHaveAttribute("aria-label");
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

describe("LearningTree expand and collapse", () => {
  it("starts with top-level parents expanded", () => {
    renderTree();
    expect(screen.getByRole("treeitem", { name: "React" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("treeitem", { name: "Hooks" })).toBeInTheDocument();
    expect(screen.getByRole("treeitem", { name: "HTML" })).not.toHaveAttribute(
      "aria-expanded",
    );
  });

  it("collapses and expands with the mouse", async () => {
    renderTree();
    await userEvent.click(screen.getByTestId("toggle-react"));
    expect(screen.getByRole("treeitem", { name: "React" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("treeitem", { name: "Hooks" })).toBeNull();

    await userEvent.click(screen.getByTestId("toggle-react"));
    expect(screen.getByRole("treeitem", { name: "Hooks" })).toBeInTheDocument();
  });

  it("has no toggle on leaves", () => {
    renderTree();
    expect(screen.queryByTestId("toggle-html")).toBeNull();
  });
});

describe("LearningTree keyboard", () => {
  const item = (name: string) => screen.getByRole("treeitem", { name });

  it("puts only one item in the Tab order", async () => {
    renderTree();
    expect(item("HTML")).toHaveAttribute("tabindex", "0");
    expect(item("React")).toHaveAttribute("tabindex", "-1");
    expect(item("Hooks")).toHaveAttribute("tabindex", "-1");

    await userEvent.tab();
    expect(item("HTML")).toHaveFocus();
  });

  it("moves with ArrowDown, ArrowUp, Home and End", async () => {
    renderTree();
    await userEvent.tab();

    await userEvent.keyboard("{ArrowDown}");
    expect(item("React")).toHaveFocus();
    expect(item("React")).toHaveAttribute("tabindex", "0");
    expect(item("HTML")).toHaveAttribute("tabindex", "-1");

    await userEvent.keyboard("{ArrowDown}");
    expect(item("Hooks")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(item("Hooks")).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    expect(item("React")).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(item("Hooks")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(item("HTML")).toHaveFocus();
  });

  it("collapses with ArrowLeft and expands with ArrowRight", async () => {
    renderTree();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{ArrowLeft}");
    expect(item("React")).toHaveAttribute("aria-expanded", "false");
    expect(item("React")).toHaveFocus();
    expect(screen.queryByRole("treeitem", { name: "Hooks" })).toBeNull();

    await userEvent.keyboard("{ArrowRight}");
    expect(item("React")).toHaveAttribute("aria-expanded", "true");
    expect(item("React")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(item("Hooks")).toHaveFocus();
  });

  it("moves to the parent with ArrowLeft on a child", async () => {
    renderTree();
    await userEvent.tab();
    await userEvent.keyboard("{End}{ArrowLeft}");
    expect(item("React")).toHaveFocus();
  });

  it("does nothing with ArrowRight on a leaf", async () => {
    renderTree();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(item("HTML")).toHaveFocus();
  });

  it("falls back to the first item when the focused item is hidden", async () => {
    renderTree();
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(item("Hooks")).toHaveFocus();

    await userEvent.click(screen.getByTestId("toggle-react"));
    expect(item("HTML")).toHaveAttribute("tabindex", "0");
  });
});

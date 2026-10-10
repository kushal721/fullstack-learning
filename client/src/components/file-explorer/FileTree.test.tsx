import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { fileTreeFixture } from "../../test/fixtures.ts";
import { FileTree } from "./FileTree.tsx";

const item = (name: string) => screen.getByRole("treeitem", { name });

function renderTree(selectedPath: string | null = null) {
  const onSelect = vi.fn();
  render(
    <FileTree
      tree={fileTreeFixture}
      selectedPath={selectedPath}
      onSelect={onSelect}
    />,
  );
  return { onSelect };
}

describe("FileTree", () => {
  it("shows top-level folders open, with a layer label", () => {
    renderTree();
    expect(item("backend")).toHaveAttribute("aria-expanded", "true");
    expect(item("backend")).toHaveTextContent("backend");
    expect(screen.getByRole("treeitem", { name: "server.js" })).toBeVisible();
    // Deeper folders start closed.
    expect(item("src")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("treeitem", { name: "App.jsx" })).toBeNull();
  });

  it("opens folders and selects files with the mouse", async () => {
    const { onSelect } = renderTree();
    await userEvent.click(item("src"));
    expect(item("src")).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(item("App.jsx"));
    expect(onSelect).toHaveBeenCalledWith("frontend/src/App.jsx");
  });

  it("opens the folders above the selected file and marks it selected", () => {
    renderTree("frontend/src/App.jsx");
    expect(item("App.jsx")).toHaveAttribute("aria-selected", "true");
    expect(item("index.html")).toHaveAttribute("aria-selected", "false");
    // The selected file is the keyboard tab stop.
    expect(item("App.jsx")).toHaveAttribute("tabindex", "0");
  });

  it("works with the keyboard only", async () => {
    const { onSelect } = renderTree();
    await userEvent.tab();
    expect(item("backend")).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}"); // server.js
    await userEvent.keyboard("{ArrowDown}"); // frontend
    await userEvent.keyboard("{ArrowDown}"); // src
    expect(item("src")).toHaveFocus();

    await userEvent.keyboard("{Enter}"); // open src
    expect(item("src")).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{ArrowDown}{Enter}"); // App.jsx
    expect(onSelect).toHaveBeenLastCalledWith("frontend/src/App.jsx");

    await userEvent.keyboard("{ArrowDown} "); // index.html with Space
    expect(onSelect).toHaveBeenLastCalledWith("frontend/index.html");
  });
});

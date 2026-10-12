import type { FileResponse } from "@fsl/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeViewer } from "./CodeViewer.tsx";

function fileResponse(path: string, lineCount: number): FileResponse {
  return {
    file: {
      id: path,
      path,
      layer: "backend",
      language: "js",
      purpose: "A file.",
      whyItExists: "Because.",
      conceptIds: [],
    },
    source:
      Array.from({ length: lineCount }, (_, i) => `line${i + 1}();`).join(
        "\n",
      ) + "\n",
    concepts: [],
  };
}

function renderViewer(
  path: string,
  lineCount: number,
  line: number | null = null,
  scrollToLine?: boolean,
) {
  const { file, source } = fileResponse(path, lineCount);
  const onSelectLine = vi.fn();
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  render(
    <CodeViewer
      file={file}
      source={source}
      line={line}
      onSelectLine={onSelectLine}
      scrollToLine={scrollToLine}
    />,
  );
  return { onSelectLine, scrollIntoView };
}

const lineEl = (n: number) => document.getElementById(`L${n}`);

describe("CodeViewer", () => {
  it("shows the path, line count and numbered lines", async () => {
    renderViewer("backend/src/db.js", 20);
    expect(
      await screen.findByRole("heading", { name: "backend/src/db.js" }),
    ).toBeInTheDocument();
    expect(screen.getByText("20 lines")).toBeInTheDocument();
    expect(lineEl(20)?.textContent).toContain("line20();");
  });

  it("highlights the line from ?line= and scrolls it into view", async () => {
    const { scrollIntoView } = renderViewer("backend/src/db.js", 20, 12);
    await screen.findByRole("heading", { name: "backend/src/db.js" });

    expect(lineEl(12)).toHaveAttribute("data-highlighted", "true");
    expect(lineEl(11)).not.toHaveAttribute("data-highlighted");
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "center" });
    expect(scrollIntoView.mock.contexts[0]).toBe(lineEl(12));
  });

  it("can highlight the line without scrolling to it", async () => {
    const { scrollIntoView } = renderViewer("backend/src/db.js", 20, 12, false);
    await screen.findByRole("heading", { name: "backend/src/db.js" });

    expect(lineEl(12)).toHaveAttribute("data-highlighted", "true");
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("puts a clicked line number in the URL", async () => {
    const { onSelectLine } = renderViewer("backend/src/db.js", 20);
    await screen.findByRole("heading", { name: "backend/src/db.js" });

    await userEvent.click(
      screen.getByRole("link", { hidden: true, name: "7" }),
    );
    expect(onSelectLine).toHaveBeenCalledWith(7);
  });

  it("shortens very long files until asked to show all", async () => {
    renderViewer("frontend/package-lock.json", 1000);
    await screen.findByText("1000 lines");

    expect(lineEl(400)).not.toBeNull();
    expect(lineEl(401)).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Show all 1000 lines" }),
    );
    expect(lineEl(1000)).not.toBeNull();
  });

  it("shows the whole file when the wanted line is past the preview", async () => {
    renderViewer("frontend/package-lock.json", 1000, 900);
    await screen.findByText("1000 lines");
    expect(lineEl(900)).toHaveAttribute("data-highlighted", "true");
    expect(screen.queryByRole("button", { name: /Show all/ })).toBeNull();
  });
});

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

  describe("symbol markers", () => {
    const symbols = [
      {
        id: "component:Db",
        kind: "component" as const,
        name: "Db",
        fileId: "backend/src/db.js",
        line: 3,
      },
      {
        id: "fn:query",
        kind: "function" as const,
        name: "query",
        fileId: "backend/src/db.js",
        line: 7,
      },
      {
        id: "query:select",
        kind: "query" as const,
        name: "SELECT",
        fileId: "backend/src/db.js",
        line: 7,
      },
    ];
    function renderWithSymbols(selected: string | null = null) {
      const { file, source } = fileResponse("backend/src/db.js", 20);
      const onSelectSymbol = vi.fn();
      Element.prototype.scrollIntoView = vi.fn();
      render(
        <CodeViewer
          file={file}
          source={source}
          line={null}
          onSelectLine={vi.fn()}
          symbols={symbols}
          selectedSymbolId={selected}
          onSelectSymbol={onSelectSymbol}
        />,
      );
      return onSelectSymbol;
    }

    it("marks each symbol's line with a button, from the data only", async () => {
      renderWithSymbols("fn:query");
      await screen.findByRole("heading", { name: "backend/src/db.js" });
      const markers = screen.getAllByRole("button", {
        name: /^Show connections of /,
      });
      expect(markers.map((m) => m.getAttribute("aria-label"))).toEqual([
        "Show connections of component Db",
        "Show connections of function query",
        "Show connections of query SELECT",
      ]);
      expect(lineEl(3)).toContainElement(markers[0]!);
      expect(lineEl(7)).toContainElement(markers[1]!);
      expect(markers[1]).toHaveAttribute("aria-pressed", "true");
      expect(markers[0]).toHaveAttribute("aria-pressed", "false");
    });

    it("selects a symbol by mouse or keyboard", async () => {
      const onSelectSymbol = renderWithSymbols();
      await screen.findByRole("heading", { name: "backend/src/db.js" });
      await userEvent.click(
        screen.getByRole("button", {
          name: "Show connections of function query",
        }),
      );
      expect(onSelectSymbol).toHaveBeenLastCalledWith(symbols[1]);

      (document.activeElement as HTMLElement).blur();
      // The scrollable code block is a tab stop of its own; the first marker is next.
      await userEvent.tab();
      await userEvent.tab();
      expect(
        screen.getByRole("button", {
          name: "Show connections of component Db",
        }),
      ).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      expect(onSelectSymbol).toHaveBeenLastCalledWith(symbols[0]);
    });

    it("has no marker column without symbols", async () => {
      renderViewer("backend/src/db.js", 20);
      await screen.findByRole("heading", { name: "backend/src/db.js" });
      expect(
        screen.queryByRole("button", { name: /^Show connections/ }),
      ).toBeNull();
      expect(lineEl(1)!.children).toHaveLength(2);
    });
  });
});

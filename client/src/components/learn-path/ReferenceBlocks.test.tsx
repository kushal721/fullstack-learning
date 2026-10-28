import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlaygroundBlock, ReferenceTable } from "./ReferenceBlocks.tsx";

describe("ReferenceTable", () => {
  it("shows each row's name, what it's for and its example", () => {
    render(
      <MemoryRouter>
        <ReferenceTable
          block={{
            type: "reference",
            caption: "Tags for text",
            rows: [
              { name: "<p>", text: "A paragraph.", example: "<p>Hi</p>" },
              { name: "<br>", text: "A [[void-element|line break]]." },
            ],
          }}
          glossary={[]}
        />
      </MemoryRouter>,
    );

    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("rowheader", { name: "<p>" }),
    ).toBeInTheDocument();
    expect(within(table).getByText("<p>Hi</p>").tagName).toBe("CODE");
    expect(
      within(table).getByRole("link", { name: "line break" }),
    ).toHaveAttribute("href", "/?term=void-element");
    expect(screen.getByText("Tags for text")).toBeInTheDocument();
  });
});

describe("PlaygroundBlock", () => {
  afterEach(() => vi.useRealTimers());

  it("previews the code in a sandboxed frame and updates it after typing", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <PlaygroundBlock
        block={{
          type: "playground",
          caption: "Lists",
          code: "<ul><li>Milk</li></ul>",
        }}
      />,
    );

    const frame = screen.getByTitle("Preview: Lists");
    expect(frame).toHaveAttribute("sandbox", "");
    expect(frame).toHaveAttribute(
      "src",
      `/playground?code=${encodeURIComponent("<ul><li>Milk</li></ul>")}`,
    );

    const editor = screen.getByLabelText("Your code (edit it)");
    await user.clear(editor);
    await user.type(editor, "<h1>Hi</h1>");
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(frame).toHaveAttribute(
      "src",
      `/playground?code=${encodeURIComponent("<h1>Hi</h1>")}`,
    );

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(editor).toHaveValue("<ul><li>Milk</li></ul>");
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  it("runs JavaScript in a script-only sandbox, and Run runs it again", async () => {
    const user = userEvent.setup();
    render(
      <PlaygroundBlock
        block={{
          type: "playground",
          caption: "Logging",
          code: 'console.log("hi");',
          language: "js",
        }}
      />,
    );

    const frame = screen.getByTitle("Output: Logging");
    expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    expect(frame).toHaveAttribute(
      "src",
      `/playground/js?code=${encodeURIComponent('console.log("hi");')}`,
    );

    await user.click(screen.getByRole("button", { name: "▶ Run" }));
    const rerun = screen.getByTitle("Output: Logging");
    expect(rerun).not.toBe(frame);
    expect(rerun).toHaveAttribute("src", frame.getAttribute("src"));
  });

  it("runs a page with its scripts and forms, and shows what its own frame logs", async () => {
    render(
      <PlaygroundBlock
        block={{
          type: "playground",
          caption: "A button",
          code: "<button>Hi</button>",
          language: "page",
        }}
      />,
    );
    const frame = screen.getByTitle("Preview: A button") as HTMLIFrameElement;
    expect(frame).toHaveAttribute("sandbox", "allow-scripts allow-forms");
    expect(frame).toHaveAttribute(
      "src",
      `/playground/page?code=${encodeURIComponent("<button>Hi</button>")}`,
    );
    expect(screen.getByText("(nothing logged)")).toBeInTheDocument();

    const log = (source: MessageEventSource | null, text: string) =>
      act(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            source,
            data: { source: "fsl-page", kind: "log", text },
          }),
        );
      });
    await log(window, "from elsewhere");
    await log(frame.contentWindow, "clicked");
    expect(screen.getByText("clicked")).toBeInTheDocument();
    expect(screen.queryByText("from elsewhere")).toBeNull();
  });
});

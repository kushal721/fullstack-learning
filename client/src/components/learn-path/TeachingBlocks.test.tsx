import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import {
  AnatomyBlock,
  MistakeBlock,
  TraceBlock,
  YourTurnBlock,
} from "./TeachingBlocks.tsx";

const inRouter = (ui: React.ReactNode) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("AnatomyBlock", () => {
  it("numbers each part in the code and explains it in a list", () => {
    inRouter(
      <AnatomyBlock
        block={{
          type: "anatomy",
          caption: "A function",
          code: "function add(a) {}",
          parts: [
            { text: "function", label: "keyword", note: "Starts it." },
            { text: "add", label: "name", note: "What you call." },
          ],
        }}
        glossary={[]}
      />,
    );
    const marks = document.querySelectorAll("mark");
    expect([...marks].map((m) => m.textContent)).toEqual(["function1", "add2"]);
    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveTextContent("add name: What you call.");
  });
});

describe("TraceBlock", () => {
  it("steps through the moves, showing variables, the call stack and output so far", async () => {
    const user = userEvent.setup();
    inRouter(
      <TraceBlock
        block={{
          type: "trace",
          caption: "Calling f",
          code: "function f() {}\nf();\nconsole.log(1);",
          steps: [
            { line: 2, note: "A call.", stack: ["main program"] },
            {
              line: 1,
              note: "Inside f.",
              vars: [["x", "1"]],
              stack: ["main program", "f()"],
            },
            { line: 3, note: "Prints.", output: "1" },
          ],
        }}
        glossary={[]}
      />,
    );
    expect(screen.getByText("Move 1 of 3 · line 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← Back" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next move →" }));
    expect(screen.getByText("Inside f.")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "x" })).toBeInTheDocument();
    const stack = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(stack).toEqual(["f()", "main program"]);

    await user.click(screen.getByRole("button", { name: "Next move →" }));
    expect(screen.getByText("Prints.")).toBeInTheDocument();
    expect(document.querySelector("pre")?.textContent).toContain("1");
    await user.click(screen.getByRole("button", { name: "↺ Start again" }));
    expect(screen.getByText("A call.")).toBeInTheDocument();
  });
});

describe("YourTurnBlock", () => {
  const block = {
    type: "yourTurn" as const,
    title: "Double it",
    task: "Write `double(n)`.",
    starter: "function double(n) {}",
    tests: [
      { call: "double(2)", expect: "4" },
      { call: "double(0)", expect: "0" },
    ],
    hint: "Return `n * 2`.",
    solution: "function double(n) { return n * 2; }",
  };

  it("runs the learner's code with the tests in a script-only sandbox", async () => {
    const user = userEvent.setup();
    inRouter(<YourTurnBlock block={block} glossary={[]} />);
    const region = screen.getByRole("region", { name: "Your turn: Double it" });
    expect(within(region).getByText("double(2) → 4")).toBeInTheDocument();
    expect(screen.queryByTitle("Test results: Double it")).toBeNull();

    await user.clear(screen.getByLabelText("Your code"));
    await user.type(screen.getByLabelText("Your code"), "const double = 1;");
    await user.click(screen.getByRole("button", { name: "▶ Check my code" }));

    const frame = screen.getByTitle("Test results: Double it");
    expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    expect(frame).toHaveAttribute(
      "src",
      `/playground/js?code=${encodeURIComponent("const double = 1;")}&tests=${encodeURIComponent(JSON.stringify(block.tests))}`,
    );
  });

  it("shows the result its own runner reports, and ignores other windows", async () => {
    const user = userEvent.setup();
    inRouter(<YourTurnBlock block={block} glossary={[]} />);
    await user.click(screen.getByRole("button", { name: "▶ Check my code" }));
    const frame = screen.getByTitle(
      "Test results: Double it",
    ) as HTMLIFrameElement;
    const report = (source: MessageEventSource | null, passed: number) =>
      act(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            source,
            data: { source: "fsl-runner", passed, total: 2 },
          }),
        );
      });

    await report(window, 2);
    expect(screen.getByRole("status")).toHaveTextContent("");

    await report(frame.contentWindow, 1);
    expect(screen.getByRole("status")).toHaveTextContent("1 of 2 tests pass.");
    await report(frame.contentWindow, 2);
    expect(screen.getByRole("status")).toHaveTextContent(
      "All 2 tests pass. Well done!",
    );
    expect(screen.getByText("✓ Solved")).toBeInTheDocument();
  });
});

describe("MistakeBlock", () => {
  it("shows the wrong code and its problem, then the fix and why", () => {
    inRouter(
      <MistakeBlock
        block={{
          type: "mistake",
          title: "No brackets",
          wrong: "f;",
          problem: "Nothing runs.",
          right: "f();",
          why: "Brackets call it.",
        }}
        glossary={[]}
      />,
    );
    expect(screen.getByText("✗ Wrong")).toBeInTheDocument();
    expect(screen.getByText("Nothing runs.")).toBeInTheDocument();
    expect(screen.getByText("✓ Right")).toBeInTheDocument();
    expect(screen.getByText("Brackets call it.")).toBeInTheDocument();
  });
});

import type { CodeExample } from "@fsl/shared";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./CodeBlock.tsx";

function renderCode(
  example: Pick<CodeExample, "code" | "language" | "highlightLines">,
  showLineNumbers = false,
) {
  const { container } = render(
    <CodeBlock example={example} showLineNumbers={showLineNumbers} />,
  );
  const tokens = (type: string) =>
    [...container.querySelectorAll(`.token.${type}`)].map((t) => t.textContent);
  const lines = [...container.querySelectorAll("[data-line]")];
  return { container, tokens, lines };
}

describe("CodeBlock", () => {
  it("keeps the code text exactly", () => {
    const code = 'const [notes, setNotes] = useState([]);\nsetNotes(["a"]);';
    const { container } = renderCode({ code, language: "jsx" });
    expect(container.querySelector("code")?.textContent).toBe(
      code.replace("\n", ""),
    );
  });

  it.each([
    ["jsx", "const x = <Button>Save</Button>;", "keyword", "const"],
    ["ts", "let n: number = 1;", "builtin", "number"],
    ["html", '<button type="submit">Save</button>', "attr-name", "type"],
    ["css", "button { color: red; }", "property", "color"],
    ["json", '{ "title": "x" }', "property", '"title"'],
    ["sql", "SELECT * FROM notes;", "keyword", "SELECT"],
    ["bash", "npm install && echo done", "builtin", "echo"],
    ["http", "POST /api/notes HTTP/1.1", "method", "POST"],
  ] as const)("highlights %s", (language, code, tokenType, expected) => {
    const { tokens } = renderCode({ code, language });
    expect(tokens(tokenType)).toContain(expected);
  });

  it("marks highlighted lines", () => {
    const { lines } = renderCode({
      code: "a\nb\nc",
      language: "js",
      highlightLines: [2],
    });
    expect(lines.map((line) => line.hasAttribute("data-highlighted"))).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("shows line numbers only when asked, hidden from screen readers", () => {
    const without = renderCode({ code: "a\nb", language: "js" });
    expect(without.container.querySelector('[aria-hidden="true"]')).toBeNull();

    const withNumbers = renderCode({ code: "a\nb", language: "js" }, true);
    const numbers = withNumbers.container.querySelectorAll(
      '[aria-hidden="true"]',
    );
    expect([...numbers].map((n) => n.textContent)).toEqual(["1", "2"]);
  });

  it("is keyboard focusable so long lines can be scrolled", () => {
    const { container } = renderCode({ code: "x", language: "js" });
    expect(container.querySelector("pre")).toHaveAttribute("tabindex", "0");
  });
});

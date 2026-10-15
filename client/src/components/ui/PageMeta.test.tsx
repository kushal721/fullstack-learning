import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageMeta } from "./PageMeta.tsx";

const head = (selector: string) =>
  [...document.head.querySelectorAll(selector)].map(
    (el) => el.getAttribute("content") ?? el.textContent,
  );

describe("PageMeta", () => {
  it("sets the title with the site name and a plain description", () => {
    render(
      <PageMeta
        title="useState"
        description={"Remembers a `value`\n  between renders."}
      />,
    );
    expect(document.title).toBe("useState · Full-Stack Learning");
    expect(head('meta[name="description"]')).toEqual([
      "Remembers a value between renders.",
    ]);
    expect(head('meta[property="og:title"]')).toEqual([
      "useState · Full-Stack Learning",
    ]);
    expect(head('meta[name="robots"]')).toEqual([]);
  });

  it("uses only the site name on the home page and can ask not to be indexed", () => {
    render(<PageMeta description="x" noIndex />);
    expect(document.title).toBe("Full-Stack Learning");
    expect(head('meta[name="robots"]')).toEqual(["noindex"]);
  });

  it("keeps descriptions short", () => {
    render(<PageMeta title="Long" description={"word ".repeat(80)} />);
    const [text] = head('meta[name="description"]');
    expect(text!.length).toBeLessThanOrEqual(160);
    expect(text!.endsWith("…")).toBe(true);
  });
});

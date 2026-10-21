import { describe, expect, it } from "vitest";
import { termInText } from "./levels.ts";

describe("termInText", () => {
  it("starts an ordinary word lowercase in mid-sentence", () => {
    expect(termInText({ term: "Client" }, false)).toBe("client");
    expect(termInText({ term: "Status code" }, false)).toBe("status code");
  });

  it("keeps the capital at the start of a sentence", () => {
    expect(termInText({ term: "Client" }, true)).toBe("Client");
  });

  it("keeps acronyms, inner capitals, dotted names and proper nouns", () => {
    expect(termInText({ term: "HTML" }, false)).toBe("HTML");
    expect(termInText({ term: "IP address" }, false)).toBe("IP address");
    expect(termInText({ term: "JavaScript" }, false)).toBe("JavaScript");
    expect(termInText({ term: "Node.js" }, false)).toBe("Node.js");
    expect(termInText({ term: "React", properNoun: true }, false)).toBe(
      "React",
    );
  });
});

import { describe, expect, it } from "vitest";
import { partHref, partIndex, playgroundSrc, termInText } from "./levels.ts";

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

describe("module parts in the URL", () => {
  it("reads ?part= as a 0-based index, clamped to the parts there are", () => {
    expect(partIndex("", 5)).toBe(0);
    expect(partIndex("?part=3", 5)).toBe(2);
    expect(partIndex("?part=9", 5)).toBe(4);
    expect(partIndex("?part=nope", 5)).toBe(0);
    expect(partIndex("?part=0", 5)).toBe(0);
  });

  it("keeps the open glossary word when it changes the part", () => {
    expect(partHref("/learn/js/f", "?term=x", 2)).toBe(
      "/learn/js/f?term=x&part=3",
    );
    expect(partHref("/learn/js/f", "?term=x&part=3", 0)).toBe(
      "/learn/js/f?term=x",
    );
    expect(partHref("/learn/js/f", "", 0)).toBe("/learn/js/f");
  });
});

describe("playgroundSrc", () => {
  it("adds a your-turn exercise's tests to the JavaScript runner's URL", () => {
    const tests = [{ call: "f()", expect: "1" }];
    expect(playgroundSrc("x", "js", tests)).toBe(
      `/playground/js?code=x&tests=${encodeURIComponent(JSON.stringify(tests))}`,
    );
  });
});

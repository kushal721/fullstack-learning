import { describe, expect, it } from "vitest";
import { pageKey } from "./page-key.ts";

describe("pageKey", () => {
  it("treats a guided topic's overview and steps as one page", () => {
    expect(pageKey("/learn/how-the-web-works")).toBe(
      "/learn/how-the-web-works",
    );
    expect(pageKey("/learn/how-the-web-works/dns")).toBe(
      "/learn/how-the-web-works",
    );
    expect(pageKey("/learn/how-the-web-works/dns/")).toBe(
      "/learn/how-the-web-works",
    );
  });

  it("keeps every other address its own page", () => {
    expect(pageKey("/learn")).toBe("/learn");
    expect(pageKey("/build/add-state")).toBe("/build/add-state");
    expect(pageKey("/concepts/react-usestate")).toBe(
      "/concepts/react-usestate",
    );
    expect(pageKey("/learn/a/b/c")).toBe("/learn/a/b/c");
  });
});

import type { GlossaryEntrySummary } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import { exactEntry, normalize, searchGlossary } from "./glossary-search.ts";

const entry = (
  id: string,
  term: string,
  short: string,
  aliases?: string[],
): GlossaryEntrySummary => ({
  id,
  topicId: "web",
  term,
  kind: "term",
  short,
  ...(aliases ? { aliases } : {}),
});

const entries = [
  entry("cookie", "Cookie", "Data the browser sends back.", ["set-cookie"]),
  entry("session", "Session", "The server's memory of you, found by a cookie."),
  entry("dns", "DNS", "Turns names into numbers.", ["domain name system"]),
  entry("dns-record", "DNS record", "One entry in a domain's settings."),
];

describe("searchGlossary", () => {
  it("ranks an exact name first, then names starting with it, then mentions", () => {
    expect(searchGlossary(entries, "dns").map((e) => e.id)).toEqual([
      "dns",
      "dns-record",
    ]);
    expect(searchGlossary(entries, "cookie").map((e) => e.id)).toEqual([
      "cookie",
      "session",
    ]);
  });

  it("finds aliases, plurals and text inside a name", () => {
    expect(searchGlossary(entries, "Domain Name System")[0]?.id).toBe("dns");
    expect(searchGlossary(entries, "cookies")[0]?.id).toBe("cookie");
    expect(searchGlossary(entries, "record").map((e) => e.id)).toEqual([
      "dns-record",
    ]);
  });

  it("finds nothing for an empty query or an unknown word", () => {
    expect(searchGlossary(entries, "  ")).toEqual([]);
    expect(searchGlossary(entries, "kitchen")).toEqual([]);
  });
});

describe("exactEntry", () => {
  it("matches a selected word to its entry, ignoring case, punctuation and plurals", () => {
    expect(exactEntry(entries, "Cookies,")?.id).toBe("cookie");
    expect(exactEntry(entries, "set-cookie")?.id).toBe("cookie");
    expect(exactEntry(entries, "the cookie")).toBeUndefined();
  });
});

describe("normalize", () => {
  it("keeps letters, digits and slashes", () => {
    expect(normalize("  HTTP/2 — and  QUIC! ")).toBe("http/2 and quic");
  });
});

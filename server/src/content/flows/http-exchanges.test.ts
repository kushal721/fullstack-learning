import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { config } from "../../config.js";
import { symbols } from "../symbols.js";
import { httpExchanges } from "./http-exchanges.js";

// Everything the Notes App backend can answer, read from its source, so the
// documented exchanges can't drift from the code.
function backendSource(): string {
  const root = path.join(config.exampleProjectDir, "backend/src");
  const read = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return read(full);
      return entry.name.endsWith(".js") && !entry.name.endsWith(".test.js")
        ? [readFileSync(full, "utf8")]
        : [];
    });
  return read(root).join("\n");
}

// Messages like `Title must be at most ${MAX_TITLE_LENGTH} characters` are
// template literals: fill in the constants the source defines, then compare.
function expandTemplates(text: string): string {
  const constants = new Map(
    [...text.matchAll(/const ([A-Z_]+) = (\d+);/g)].map((m) => [m[1]!, m[2]!]),
  );
  return text.replace(
    /`([^`]*)`/g,
    (literal, body: string) =>
      `"${body.replace(/\$\{([A-Z_]+)\}/g, (all, name: string) => constants.get(name) ?? all)}" ${literal}`,
  );
}

const source = expandTemplates(backendSource());
const entries = Object.entries(httpExchanges);

describe("HTTP exchanges", () => {
  it("covers every endpoint the frontend calls", () => {
    const requests = symbols
      .filter((s) => s.kind === "http-request")
      .map((s) => s.id);
    expect(Object.keys(httpExchanges).sort()).toEqual(requests.sort());
    expect(entries).toHaveLength(8);
  });

  it.each(entries)("%s matches the backend source", (_id, exchange) => {
    for (const error of exchange.errorCases) {
      const message = (JSON.parse(error.body) as { error: string }).error;
      expect(source, `"${message}"`).toContain(`"${message}"`);
      expect(source, `status(${error.status})`).toContain(
        `status(${error.status})`,
      );
    }
    if (exchange.status !== 200) {
      expect(source).toContain(`status(${exchange.status})`);
    }
    // A request has a Content-Type header exactly when it has a body.
    expect("Content-Type" in exchange.headers).toBe(
      exchange.body !== undefined,
    );
    expect(exchange.response).toMatch(
      new RegExp(`^HTTP/1\\.1 ${exchange.status} `),
    );
  });

  it("documents the login cookie the way authController sets it", () => {
    const login = httpExchanges["http-request:POST /api/auth/login"]!.response;
    expect(source).toContain("const SESSION_DAYS = 7;");
    expect(login).toContain(`Max-Age=${7 * 24 * 60 * 60}`);
    expect(source).toContain("httpOnly: true");
    expect(source).toContain('sameSite: "lax"');
    expect(login).toMatch(/HttpOnly; SameSite=Lax/);
  });
});

import { describe, expect, it } from "vitest";
import { runTests } from "./run-tests.js";

describe("runTests", () => {
  it("runs plain tests", () => {
    expect(
      runTests("const add = (a, b) => a + b;", [
        { call: "add(1, 2)", expect: "3" },
        { call: "add(1, 1)", expect: "3" },
      ]),
    ).toEqual({ passed: 1, failures: ["✗ add(1, 1) gives 2, expected 3"] });
  });

  it("awaits a test that gives back a promise, timers and all", () => {
    const code = [
      "const wait = (ms) => new Promise((r) => setTimeout(r, ms));",
      "const api = async () => { await wait(10); return [{ title: 'A' }]; };",
      "async function titles() { return (await api()).map((n) => n.title); }",
    ].join("\n");
    expect(
      runTests(code, [
        { call: "titles()", expect: '["A"]' },
        { call: "titles()", expect: '["B"]' },
      ]),
    ).toEqual({
      passed: 1,
      failures: ['✗ titles() gives ["A"], expected ["B"]'],
    });
  });

  it("reports a rejected promise as a failure", () => {
    expect(
      runTests("async function f() { throw new Error('no'); }", [
        { call: "f()", expect: "1" },
      ]),
    ).toEqual({ passed: 0, failures: ["✗ f() failed: Error: no"] });
  });

  it("fails, without crashing, a test that forgets to await a timer", () => {
    const code = [
      "const wait = (ms) => new Promise((r) => setTimeout(r, ms));",
      "async function getNotes() { await wait(10); return [1, 2]; }",
      "function count() { const notes = getNotes(); return notes.length; }",
    ].join("\n");
    expect(runTests(code, [{ call: "count()", expect: "2" }])).toEqual({
      passed: 0,
      failures: ["✗ count() gives undefined, expected 2"],
    });
  });

  it("stops a promise that never settles", () => {
    const result = runTests("const f = () => new Promise(() => {});", [
      { call: "f()", expect: "1" },
    ]);
    expect(result.passed).toBe(0);
    expect(result.failures).toEqual(["still running after 2 seconds"]);
  });
});

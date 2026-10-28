import type { PageCheck } from "@fsl/shared";
import { JSDOM, VirtualConsole } from "jsdom";
import { runInNewContext } from "node:vm";
import {
  playgroundPage,
  type RunnerTest,
  workerSource,
} from "../routes/playground.js";
import { PAGE_CHECK_SOURCE } from "./page-checks.js";

/**
 * Runs code with "your turn" tests the way the browser's runner does (the
 * same worker script), in a fresh Node.js context with a time limit.
 * Content validation uses it to prove each solution passes and each
 * starter doesn't.
 */
export function runTests(
  code: string,
  tests: RunnerTest[],
): { passed: number; failures: string[] } {
  const messages: { kind: string; text?: string }[] = [];
  const failures: string[] = [];
  const self = {
    addEventListener: () => {},
  } as Record<string, unknown>;
  const context = {
    self,
    postMessage: (message: { kind: string; text?: string }) =>
      messages.push(message),
  };
  // The worker's `self.x` globals are plain globals in the browser.
  Object.defineProperty(self, "__test", {
    set: (fn: unknown) => ((context as Record<string, unknown>).__test = fn),
  });
  Object.defineProperty(self, "console", {
    set: (value: unknown) =>
      ((context as Record<string, unknown>).console = value),
  });
  try {
    runInNewContext(workerSource(code, tests), context, { timeout: 1000 });
  } catch (error) {
    failures.push(`it throws: ${String(error)}`);
  }
  for (const message of messages) {
    if (message.kind === "fail") failures.push(message.text ?? "");
  }
  const passed = messages.filter((m) => m.kind === "pass").length;
  if (failures.length === 0 && passed !== tests.length) {
    failures.push(`only ${passed} of ${tests.length} tests ran.`);
  }
  return { passed, failures };
}

/**
 * Builds a "your turn" page in jsdom, runs its inline scripts, then its
 * checks in order with the same check code as the browser's page runner.
 * jsdom doesn't lay pages out, so style checks are left to the browser
 * check and reported here as skipped.
 */
export function runPageChecks(
  code: string,
  checks: PageCheck[],
): { passed: number; failures: string[]; skipped: number } {
  const failures: string[] = [];
  let passed = 0;
  let skipped = 0;
  const errors: string[] = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => {
    // Sending a form isn't something jsdom does; the page runner blocks it too.
    if (!/not implemented/i.test(error.message)) errors.push(error.message);
  });
  const page = playgroundPage(code).replace(
    /<head[^>]*>/i,
    (tag) => `${tag}<script>${PAGE_CHECK_SOURCE}</script>`,
  );
  const dom = new JSDOM(page, { runScripts: "dangerously", virtualConsole });
  const run = (dom.window as unknown as Record<string, unknown>).__fslCheck as (
    check: PageCheck,
  ) => { pass: boolean; detail: string };
  for (const check of checks) {
    if (check.kind === "style") {
      skipped++;
      continue;
    }
    const result = run(check);
    if (result.pass) passed++;
    else failures.push(`${check.label}: ${result.detail}`);
  }
  failures.push(...errors.map((error) => `it throws: ${error}`));
  dom.window.close();
  return { passed, failures, skipped };
}

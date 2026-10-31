import type { PageCheck } from "@fsl/shared";
import { JSDOM, VirtualConsole } from "jsdom";
import { spawnSync } from "node:child_process";
import { runInNewContext } from "node:vm";
import {
  JS_TIME_LIMIT_MS,
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
  const source = workerSource(code, tests);
  let messages: RunnerMessage[] = [];
  const failures: string[] = [];
  const context = workerContext((message) => messages.push(message));
  try {
    runInNewContext(source, context, { timeout: 1000 });
  } catch (error) {
    failures.push(`it throws: ${String(error)}`);
  }
  // A test gave back a promise: run again where it can be awaited.
  if (messages.some((m) => m.kind === "async")) {
    messages = runAsync(source, failures);
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

type RunnerMessage = { kind: string; text?: string };

/** The worker's globals, in a Node.js context. */
function workerContext(post: (message: RunnerMessage) => void) {
  const context: Record<string, unknown> = {
    self: { addEventListener: () => {} },
    postMessage: post,
  };
  // The worker's `self.x` globals are plain globals in the browser.
  for (const name of ["__test", "console"]) {
    Object.defineProperty(context.self, name, {
      set: (value: unknown) => (context[name] = value),
    });
  }
  return context;
}

// Runs a worker script in a child Node.js process with real timers, waits
// for "done" (or the time limit), and prints the messages as JSON. The
// source comes in on stdin. Plain JS, set up like workerContext.
const ASYNC_RUNNER = `
const vm = require("node:vm");
const source = require("node:fs").readFileSync(0, "utf8");
const messages = [];
const finish = () => { process.stdout.write(JSON.stringify(messages)); process.exit(0); };
const context = { self: { addEventListener() {} }, setTimeout, clearTimeout };
context.postMessage = (m) => { messages.push(m); if (m.kind === "done") finish(); };
for (const name of ["__test", "console"]) {
  Object.defineProperty(context.self, name, { set: (value) => (context[name] = value) });
}
process.on("unhandledRejection", (e) => messages.push({ kind: "error", text: String(e) }));
setTimeout(() => { messages.push({ kind: "fail", text: "still running after ${JS_TIME_LIMIT_MS / 1000} seconds" }); finish(); }, ${JS_TIME_LIMIT_MS});
try { vm.runInNewContext(source, context, { timeout: 1000 }); } catch (e) { messages.push({ kind: "fail", text: "it throws: " + e }); finish(); }
`;

function runAsync(source: string, failures: string[]): RunnerMessage[] {
  const child = spawnSync(process.execPath, ["-e", ASYNC_RUNNER], {
    input: source,
    encoding: "utf8",
    timeout: JS_TIME_LIMIT_MS + 3000,
  });
  try {
    return JSON.parse(child.stdout) as RunnerMessage[];
  } catch {
    failures.push(`the async run failed: ${child.stderr || child.error}`);
    return [];
  }
}

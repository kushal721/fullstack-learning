import { runInNewContext } from "node:vm";
import { type RunnerTest, workerSource } from "../routes/playground.js";

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

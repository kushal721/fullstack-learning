// Checks that a commit message follows the conventional commit format
// (spec §33): "<type>(<optional scope>): <description>", e.g.
// "feat: add learning tree" or "fix(api): return 404 for unknown topics".
//
// Used as the commit-msg git hook: `node scripts/check-commit-msg.mjs <file>`.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const TYPES = [
  "feat",
  "fix",
  "refactor",
  "docs",
  "test",
  "chore",
  "ci",
  "build",
  "perf",
  "style",
  "revert",
];

const MAX_LENGTH = 100;
const CONVENTIONAL = new RegExp(
  `^(${TYPES.join("|")})(\\([a-z0-9-]+\\))?!?: \\S`,
);
// Messages git or GitHub create themselves.
const ALWAYS_ALLOWED = [/^Merge /, /^Revert "/, /^(fixup|squash|amend)! /];

/**
 * @param {string} message the full commit message
 * @returns {{ ok: true } | { ok: false, firstLine: string, reason: string }}
 */
export function checkCommitMessage(message) {
  // Git puts comment lines starting with "#" in the editor; they are not saved.
  const firstLine =
    message
      .split("\n")
      .map((line) => line.trimEnd())
      .find((line) => line !== "" && !line.startsWith("#")) ?? "";

  if (ALWAYS_ALLOWED.some((pattern) => pattern.test(firstLine))) {
    return { ok: true };
  }
  if (!CONVENTIONAL.test(firstLine)) {
    return {
      ok: false,
      firstLine,
      reason: `Start with one of: ${TYPES.join(", ")} — then ": " and a short description.`,
    };
  }
  if (firstLine.length > MAX_LENGTH) {
    return {
      ok: false,
      firstLine,
      reason: `Keep the first line under ${MAX_LENGTH} characters (it has ${firstLine.length}).`,
    };
  }
  return { ok: true };
}

// Run as a script (the git hook), not when imported by tests.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/check-commit-msg.mjs <commit-msg-file>");
    process.exit(2);
  }
  const result = checkCommitMessage(readFileSync(file, "utf8"));
  if (!result.ok) {
    console.error(`
✖ Commit message rejected:

    ${result.firstLine || "(empty)"}

  ${result.reason}

  Examples:
    feat: add learning tree page
    fix(api): return 404 for unknown topics

  See CONTRIBUTING.md → Commit messages.
`);
    process.exit(1);
  }
}

import { describe, expect, it } from "vitest";
import { checkCommitMessage } from "./check-commit-msg.mjs";

describe("checkCommitMessage", () => {
  it.each([
    "feat: add learning tree page",
    "fix(api): return 404 for unknown topics",
    "docs: write topic overviews",
    "chore(deps): bump express from 5.2.0 to 5.2.1",
    "feat!: drop the old topics endpoint",
    "refactor(client)!: rename apiPaths",
    "feat: add concepts API endpoints (#259)",
    "feat: add x\n\nLonger explanation of the change.\n\nCloses #1",
    "# Please enter the commit message\nci: add CI workflow",
    "Merge branch 'main' into feature/x",
    'Revert "feat: add x"',
    "fixup! feat: add x",
  ])("accepts %j", (message) => {
    expect(checkCommitMessage(message)).toEqual({ ok: true });
  });

  it.each([
    ["update", "Start with one of"],
    ["fix stuff", "Start with one of"],
    ["Feat: add x", "Start with one of"],
    ["feat add x", "Start with one of"],
    ["feat:add x", "Start with one of"],
    ["feat: ", "Start with one of"],
    ["feature: add x", "Start with one of"],
    ["feat(API): add x", "Start with one of"],
    ["", "Start with one of"],
    [`feat: ${"x".repeat(100)}`, "under 100 characters"],
  ])("rejects %j", (message, reason) => {
    const result = checkCommitMessage(message);
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ reason: expect.stringContaining(reason) });
  });
});

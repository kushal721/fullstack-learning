// Runs on `npm install` (the "prepare" script) and installs the git hooks
// configured under "simple-git-hooks" in package.json.
//
// It skips quietly where hooks can't or shouldn't be installed: outside a git
// checkout (Docker builds copy the code without .git) and when dev
// dependencies were not installed (production installs).
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

if (!existsSync(".git")) {
  console.log("git hooks: skipped (not a git checkout)");
  process.exit(0);
}

let cli;
try {
  cli = createRequire(import.meta.url).resolve("simple-git-hooks/cli.js");
} catch {
  console.log("git hooks: skipped (dev dependencies not installed)");
  process.exit(0);
}

const result = spawnSync(process.execPath, [cli], { stdio: "inherit" });
process.exit(result.status ?? 1);

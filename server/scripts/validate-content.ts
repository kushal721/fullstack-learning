// `npm run validate`: checks the learning content and fails (exit code 1)
// if any id is duplicated or any reference is broken. CI runs it on every PR.
import { validateContent } from "../src/lib/validation.js";

const errors = validateContent();

if (errors.length > 0) {
  console.error(`Content has ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

console.log("Content OK");

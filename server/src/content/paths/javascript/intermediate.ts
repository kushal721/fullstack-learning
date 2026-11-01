import type { LevelPlan } from "@fsl/shared";
import { code, explain, lesson, levelCheck, quickCheck } from "../blocks.js";
import { asyncModule } from "./async.js";
import { errorsModule } from "./errors.js";
import { jsonAndDataModule } from "./json-and-data.js";
import { modernSyntaxModule } from "./modern-syntax.js";

// Intermediate: steps 12–17. Data as JSON, waiting with promises and
// async/await, fetching from an API, handling errors, modules, and the
// modern syntax the Notes App's code uses.
export const intermediate: LevelPlan = {
  outcome:
    "Load data from an API, handle what goes wrong, and read modern JavaScript like the Notes App's.",
  steps: [
    jsonAndDataModule,
    asyncModule,
    errorsModule,
    modernSyntaxModule,
    lesson(
      "reading-the-notes-api",
      "Reading the Notes App's API code",
      4,
      explain(
        "You can now read every line of the Notes App's request code. Step through it with what you know: [[js-async-await|async/await]], [[js-fetch|fetch]], [[json]] and [[optional-chaining]].",
      ),
      code(
        "js",
        "request.js, shortened",
        [
          'export async function request(path, { method = "GET", body } = {}) {',
          "  const response = await fetch(path, {",
          "    method,",
          '    credentials: "include",',
          "    body: body ? JSON.stringify(body) : undefined,",
          "  });",
          "  if (response.status === 204) return null;",
          "  const data = await response.json().catch(() => null);",
          '  if (!response.ok) throw new Error(data?.error ?? "Something went wrong");',
          "  return data;",
          "}",
        ],
        {
          1: "export, async, destructuring with defaults",
          4: "send the login cookie",
          5: "the body as JSON text",
          8: "no JSON? use null",
          9: "turn a failed status into an error",
        },
      ),
      quickCheck(
        "Why does `request()` throw when `response.ok` is false?",
        [
          "So callers can use try/catch for every failure",
          "Because fetch requires it",
          "To retry the request",
        ],
        0,
        "Network failures already throw; throwing on bad statuses too means one `catch` handles both.",
      ),
    ),
    levelCheck("intermediate-check", "Intermediate check", [
      ["js-intermediate-json", "json"],
      ["js-intermediate-async", "async"],
      ["js-intermediate-fetch-ok", "async"],
      ["js-intermediate-spread", "modules-and-syntax"],
      ["js-intermediate-nullish", "modules-and-syntax"],
    ]),
  ],
};

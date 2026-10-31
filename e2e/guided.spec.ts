import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { checkPage } from "./check-page.ts";

// Guided learning (M12): every step of every topic with a path, the
// glossary panel, an accessibility scan of each kind of screen, and the
// keyboard path through levels, steps, words and the panel.

type CourseMap = {
  topics: {
    topic: { slug: string };
    status: "ready" | "planned";
    levels: {
      level: string;
      steps: { id: string; kind: string; parts?: number }[];
    }[];
  }[];
};
type StepResponse = {
  glossary: { id: string }[];
  blocks: { type: string }[];
};

async function get<T>(request: APIRequestContext, path: string): Promise<T> {
  const response = await request.get(path);
  expect(response.ok(), path).toBe(true);
  return (await response.json()) as T;
}

async function readyTopics(request: APIRequestContext) {
  const map = await get<CourseMap>(request, "/api/course-map");
  const ready = map.topics.filter((t) => t.status === "ready");
  expect(ready.length, "at least one topic has a guided path").toBeGreaterThan(
    0,
  );
  return ready;
}

// One test per topic and level, so they run in parallel (and across CI
// shards) and each has its own time budget as modules add parts. A topic
// without a guided path yet is skipped.
const TOPICS = [
  "how-the-web-works",
  "html",
  "css",
  "javascript",
  "git",
  "react",
  "http",
  "backend",
  "databases",
  "authentication",
  "security",
  "testing",
  "deployment",
  "how-everything-connects",
];
const LEVELS = ["basic", "intermediate", "advanced"];

test("every topic in the course map is in the every-step check", async ({
  request,
}) => {
  const map = await get<CourseMap>(request, "/api/course-map");
  expect(map.topics.map((t) => t.topic.slug)).toEqual(TOPICS);
});

for (const slug of TOPICS) {
  for (const levelName of LEVELS) {
    test(`every guided step: ${slug}, ${levelName}`, async ({
      page,
      request,
    }, testInfo) => {
      test.setTimeout(600_000);
      const ready = (await readyTopics(request)).find(
        (t) => t.topic.slug === slug,
      );
      test.skip(!ready, `${slug} has no guided path yet`);
      const level = ready!.levels.find((l) => l.level === levelName)!;
      const paths: string[] = [];
      if (levelName === "basic") paths.push(`/learn/${slug}`);
      for (const step of level.steps) {
        paths.push(`/learn/${slug}/${step.id}`);
        // A module: every one of its parts too.
        for (let part = 2; part <= (step.parts ?? 0); part++)
          paths.push(`/learn/${slug}/${step.id}?part=${part}`);
      }
      const problems: string[] = [];
      for (const path of paths)
        problems.push(...(await checkPage(page, path, testInfo)));
      expect(problems, problems.join("\n")).toEqual([]);
    });
  }
}

test("the glossary panel, on a step of each level", async ({
  page,
  request,
}, testInfo) => {
  const problems: string[] = [];
  for (const { topic, levels } of await readyTopics(request)) {
    for (const level of levels) {
      // The level's first lesson that links a word.
      for (const step of level.steps.filter((s) => s.kind === "lesson")) {
        const { glossary } = await get<StepResponse>(
          request,
          `/api/paths/${topic.slug}/steps/${step.id}`,
        );
        if (glossary.length === 0) continue;
        const path = `/learn/${topic.slug}/${step.id}?term=${glossary[0]!.id}`;
        problems.push(...(await checkPage(page, path, testInfo)));
        await expect(
          page
            .getByRole("complementary", { name: "Glossary" })
            .getByRole("heading", { level: 3 }),
          path,
        ).toBeVisible();
        break;
      }
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

/** Serious and critical WCAG A/AA findings on the page as it is now. */
async function axe(page: Page) {
  // The playground's preview shows the learner's own code, not the app, and
  // its sandbox lets no script (axe included) run inside it.
  const { violations } = await new AxeBuilder({ page })
    .exclude("iframe[sandbox]")
    .options({ iframes: false })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(" "))
          .join("\n  ")}`,
    );
}

test("no serious accessibility problems on guided screens", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const [{ topic, levels }] = await readyTopics(request);
  const lesson = levels[0]!.steps.find((s) => s.kind === "lesson")!;
  const check = levels[0]!.steps.at(-1)!;
  const { glossary } = await get<StepResponse>(
    request,
    `/api/paths/${topic.slug}/steps/${lesson.id}`,
  );
  const screens = [
    `/learn/${topic.slug}`,
    `/learn/${topic.slug}/${lesson.id}`,
    `/learn/${topic.slug}/${check.id}`,
    `/learn/${topic.slug}/${lesson.id}?term=${glossary[0]!.id}`,
    `/learn/${topic.slug}/${lesson.id}?find=`,
    "/course-map",
  ];
  // And, per topic, the first step showing each kind of interactive block.
  for (const { topic: t, levels: ls } of await readyTopics(request)) {
    const wanted = new Set(["reference", "playground", "tryIt", "scene"]);
    for (const step of ls.flatMap((l) => l.steps)) {
      if (wanted.size === 0) break;
      const { blocks } = await get<StepResponse>(
        request,
        `/api/paths/${t.slug}/steps/${step.id}`,
      );
      const found = blocks
        .map((b) => b.type)
        .filter((type) => wanted.has(type));
      if (found.length === 0) continue;
      found.forEach((type) => wanted.delete(type));
      screens.push(`/learn/${t.slug}/${step.id}`);
    }
  }
  const problems: string[] = [];
  for (const path of [...new Set(screens)]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("status").filter({ hasText: /^Loading/ }),
    ).toHaveCount(0, { timeout: 15_000 });
    problems.push(...(await axe(page)).map((p) => `${path}: ${p}`));
  }
  expect(problems, problems.join("\n\n")).toEqual([]);
});

test("keyboard: levels, step dots, a word, the panel and back", async ({
  page,
  request,
}) => {
  const [{ topic, levels }] = await readyTopics(request);
  const [basic, intermediate] = levels;
  await page.goto(`/learn/${topic.slug}`);

  // The level switcher is a list of links: Enter opens Intermediate.
  const levelNav = page.getByRole("navigation", {
    name: "Levels",
    exact: true,
  });
  await levelNav.getByRole("link", { name: /Intermediate/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/${intermediate!.steps[0]!.id}$`));
  await expect(
    page.getByRole("navigation", { name: "Intermediate steps", exact: true }),
  ).toBeVisible();

  // Back to Basic, then ← → move along the dots and keep focus on them.
  await levelNav.getByRole("link", { name: /Basic/ }).focus();
  await page.keyboard.press("Enter");
  const dots = page.getByRole("navigation", {
    name: "Basic steps",
    exact: true,
  });
  const first = basic!.steps[0]!.id;
  const dot1 = dots.getByRole("link", { name: /^Step 1:/ });
  await dot1.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/${first}$`));
  // The address changes a moment before the new step is drawn; wait for
  // the step itself, as a person (who can't press keys that fast) would.
  await expect(dot1).toHaveAttribute("aria-current", "step");
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(new RegExp(`/${basic!.steps[1]!.id}$`));
  await expect(dots.getByRole("link", { name: /^Step 2:/ })).toBeFocused();
  await expect(
    page.getByRole("region", { name: "Concepts and terms in this step" }),
  ).toBeVisible();

  // A word in the step opens the panel; Esc closes it and returns focus.
  const word = page
    .getByRole("region", { name: "Concepts and terms in this step" })
    .getByRole("link")
    .first();
  await word.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("complementary", { name: "Glossary" });
  await expect(panel.getByRole("heading", { level: 3 })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(word).toBeFocused();
});

test("a JavaScript playground runs the code and shows what it logs", async ({
  page,
}) => {
  await page.goto("/learn/javascript/getting-started");
  const output = page.frameLocator('iframe[title^="Output:"]').locator("#out");
  await expect(output).toContainText("Hello!");
  await expect(output).toContainText("2 + 3 is 5");

  // An edit runs after typing stops; an endless loop is stopped.
  await page.getByLabel("Your code (edit it)").fill("while (true) {}");
  await expect(output).toContainText("Stopped", { timeout: 10_000 });
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(output).toContainText("Hello!");
});

test("a module: every part is accessible, and a your-turn exercise checks the learner's code", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const base = "/learn/javascript/functions";
  await page.goto(base);
  await expect(
    page.getByRole("region", { name: "What you'll learn" }),
  ).toBeVisible();
  const parts = Number(
    (await page.getByText(/^Part 1 of \d+$/).textContent())!.match(/\d+$/)![0],
  );
  expect(parts).toBeGreaterThanOrEqual(6);

  // Walk through with the Next button, scanning every part.
  const problems: string[] = [];
  for (let part = 1; part <= parts; part++) {
    await expect(page.getByText(`Part ${part} of ${parts}`)).toBeVisible();
    await page.waitForLoadState("networkidle");
    problems.push(...(await axe(page)).map((p) => `part ${part}: ${p}`));
    if (part < parts) {
      await page.getByRole("button", { name: /^Next: / }).click();
      await expect(page).toHaveURL(`${base}?part=${part + 1}`);
    }
  }
  expect(problems, problems.join("\n\n")).toEqual([]);

  // Step through a trace.
  await page.goto(`${base}?part=4`);
  const trace = page.locator("figure").filter({ hasText: "Step through" });
  await trace.getByRole("button", { name: "Next move →" }).click();
  await expect(trace.getByText(/^Move 2 of/)).toBeVisible();

  // A wrong answer fails, the solution passes.
  await page.goto(`${base}?part=${parts - 1}`);
  const exercise = page.getByRole("region", { name: "Your turn: Is it even?" });
  await exercise.getByRole("button", { name: "▶ Check my code" }).click();
  await expect(exercise.getByRole("status")).toHaveText(/^0 of 3 tests pass/);
  await expect(exercise.frameLocator("iframe").locator("#out")).toContainText(
    "✗ isEven(4) gives undefined, expected true",
  );
  await exercise
    .getByLabel("Your code")
    .fill("function isEven(n) {\n  return n % 2 === 0;\n}");
  await exercise.getByRole("button", { name: "▶ Check my code" }).click();
  await expect(exercise.getByRole("status")).toHaveText(
    "All 3 tests pass. Well done!",
  );
});

type PageCheck = { kind: string; label: string; selector: string };
type RunnerReport = {
  source: string;
  passed: number;
  total: number;
  results?: { label: string; pass: boolean; detail: string }[];
};

/** Opens the page runner on its own and waits for its checks' report. */
async function runPage(page: Page, code: string, checks: PageCheck[]) {
  await page.addInitScript(() => {
    const w = window as unknown as { __reports: unknown[] };
    w.__reports = [];
    // On its own the runner's parent is itself, so it hears its report.
    addEventListener("message", (e) => w.__reports.push(e.data));
  });
  await page.goto(
    `/playground/page?code=${encodeURIComponent(code)}&checks=${encodeURIComponent(JSON.stringify(checks))}`,
  );
  const report = await page.waitForFunction(() =>
    (window as unknown as { __reports: RunnerReport[] }).__reports.find(
      (r) => r?.source === "fsl-runner",
    ),
  );
  return (await report.jsonValue()) as RunnerReport;
}

test("the JS runner awaits tests that give back a promise", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __reports: unknown[] };
    w.__reports = [];
    addEventListener("message", (e) => w.__reports.push(e.data));
  });
  const code = [
    "const wait = (ms) => new Promise((r) => setTimeout(r, ms));",
    "async function titles() { await wait(50); return ['A']; }",
  ].join("\n");
  const tests = [
    { call: "titles()", expect: '["A"]' },
    { call: "titles()", expect: '["B"]' },
  ];
  await page.goto(
    `/playground/js?code=${encodeURIComponent(code)}&tests=${encodeURIComponent(JSON.stringify(tests))}`,
  );
  const report = await page.waitForFunction(() =>
    (window as unknown as { __reports: RunnerReport[] }).__reports.find(
      (r) => r?.source === "fsl-runner",
    ),
  );
  expect(await report.jsonValue()).toMatchObject({ passed: 1, total: 2 });
  await expect(page.locator("#out")).toContainText('✓ titles() gives ["A"]');
  await expect(page.locator("#out")).toContainText(
    '✗ titles() gives ["A"], expected ["B"]',
  );
});

test("the page runner runs scripts and checks the page: styles, clicks, typing and a form", async ({
  page,
}) => {
  const code = [
    "<style>h1 { color: rgb(255, 0, 0); padding: 1rem; }</style>",
    "<h1>Notes</h1><ul id='list'></ul><button id='add'>Add</button>",
    "<form><input id='title'><button>Save</button></form><p id='status'></p>",
    "<script>",
    "document.querySelector('#add').addEventListener('click', () => {",
    "  const li = document.createElement('li'); li.textContent = 'New';",
    "  document.querySelector('#list').append(li);",
    "});",
    "document.querySelector('form').addEventListener('submit', (e) => {",
    "  e.preventDefault();",
    "  document.querySelector('#status').textContent = 'Saved ' + document.querySelector('#title').value;",
    "});",
    "</script>",
  ].join("\n");
  const report = await runPage(page, code, [
    {
      kind: "style",
      label: "red heading",
      selector: "h1",
      property: "color",
      value: "rgb(255, 0, 0)",
    },
    {
      kind: "style",
      label: "1rem is 16px",
      selector: "h1",
      property: "padding-top",
      value: "16px",
    },
    { kind: "count", label: "empty list", selector: "#list li", count: 0 },
    { kind: "click", label: "click Add", selector: "#add" },
    { kind: "count", label: "one item", selector: "#list li", count: 1 },
    { kind: "type", label: "type Tea", selector: "#title", value: "Tea" },
    { kind: "submit", label: "submit", selector: "form" },
    { kind: "text", label: "saved", selector: "#status", text: "Saved Tea" },
  ] as PageCheck[]);
  expect(
    report.results?.filter((r) => !r.pass),
    JSON.stringify(report),
  ).toEqual([]);
  expect(report.passed).toBe(8);
  // The form was handled by the script, not sent: the page is still here.
  await expect(page.locator("#status")).toHaveText("Saved Tea");
});

test("every page exercise: its solution passes every check in a real browser, and its starter doesn't", async ({
  page,
  request,
}) => {
  test.setTimeout(300_000);
  const problems: string[] = [];
  for (const { topic, levels } of await readyTopics(request)) {
    for (const level of levels) {
      for (const step of level.steps.filter((s) => s.kind === "lesson")) {
        const { blocks } = await get<{
          blocks: {
            type: string;
            language?: string;
            title?: string;
            starter?: string;
            solution?: string;
            checks?: PageCheck[];
          }[];
        }>(request, `/api/paths/${topic.slug}/steps/${step.id}`);
        for (const b of blocks) {
          if (b.type !== "yourTurn" || b.language !== "page") continue;
          const where = `${topic.slug}/${step.id} "${b.title}"`;
          const solved = await runPage(page, b.solution!, b.checks!);
          if (solved.passed !== solved.total) {
            problems.push(
              `${where} solution: ${JSON.stringify(solved.results)}`,
            );
          }
          const starter = await runPage(page, b.starter!, b.checks!);
          if (starter.passed === starter.total) {
            problems.push(`${where} starter already passes every check`);
          }
        }
      }
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

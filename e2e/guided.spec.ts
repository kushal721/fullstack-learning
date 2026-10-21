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
    levels: { level: string; steps: { id: string; kind: string }[] }[];
  }[];
};
type StepResponse = { glossary: { id: string }[] };

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

test("every guided step", async ({ page, request }, testInfo) => {
  test.setTimeout(300_000);
  const paths: string[] = [];
  for (const { topic, levels } of await readyTopics(request)) {
    paths.push(`/learn/${topic.slug}`);
    for (const level of levels) {
      for (const step of level.steps)
        paths.push(`/learn/${topic.slug}/${step.id}`);
    }
  }
  const problems: string[] = [];
  for (const path of paths)
    problems.push(...(await checkPage(page, path, testInfo)));
  expect(problems, problems.join("\n")).toEqual([]);
});

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
  const { violations } = await new AxeBuilder({ page })
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
  const problems: string[] = [];
  for (const path of screens) {
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

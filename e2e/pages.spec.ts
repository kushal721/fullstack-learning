import { expect, test, type APIRequestContext } from "@playwright/test";
import { checkPage } from "./check-page.ts";

// Every page of the platform, in each view of playwright.config.ts.

const STATIC = [
  "/",
  "/learn",
  "/course-map",
  "/concepts",
  "/build",
  "/explorer",
  "/explorer?file=backend%2Fsrc%2Fcontrollers%2FnotesController.js&line=45",
  "/explorer?symbol=fn%3AhandleSave",
  "/project",
  "/flow",
  "/flow?flow=login&step=16",
  "/practice",
];
const NOT_FOUND = [
  "/no-such-page",
  "/learn/no-such-topic",
  "/concepts/no-such-concept",
  "/build/no-such-step",
  "/practice/no-such-exercise",
];

async function get<T>(request: APIRequestContext, path: string): Promise<T> {
  const response = await request.get(path);
  expect(response.ok(), path).toBe(true);
  return (await response.json()) as T;
}

/** Checks pages one by one and reports every problem at the end. */
async function checkAll(
  page: Parameters<typeof checkPage>[0],
  paths: string[],
  testInfo: Parameters<typeof checkPage>[2],
  options?: Parameters<typeof checkPage>[3],
) {
  const problems: string[] = [];
  for (const path of paths) {
    problems.push(...(await checkPage(page, path, testInfo, options)));
  }
  expect(problems, problems.join("\n")).toEqual([]);
}

test("static pages", async ({ page }, testInfo) => {
  await checkAll(page, STATIC, testInfo);
});

test("not-found pages", async ({ page }, testInfo) => {
  await checkAll(page, NOT_FOUND, testInfo, { expectNotFound: true });
});

test("every topic", async ({ page, request }, testInfo) => {
  type Node = { slug: string; children: Node[] };
  const { tree } = await get<{ tree: Node }>(request, "/api/topics");
  const slugs: string[] = [];
  const walk = (node: Node) => {
    slugs.push(node.slug);
    node.children.forEach(walk);
  };
  tree.children.forEach(walk);
  expect(slugs.length).toBeGreaterThan(5);
  await checkAll(
    page,
    slugs.map((slug) => `/learn/${slug}`),
    testInfo,
  );
});

test("every concept", async ({ page, request }, testInfo) => {
  test.setTimeout(240_000);
  const { concepts } = await get<{ concepts: { slug: string }[] }>(
    request,
    "/api/concepts",
  );
  expect(concepts.length).toBeGreaterThan(10);
  await checkAll(
    page,
    concepts.map((c) => `/concepts/${c.slug}`),
    testInfo,
  );
});

test("every build step", async ({ page, request }, testInfo) => {
  const { buildSteps } = await get<{ buildSteps: { slug: string }[] }>(
    request,
    "/api/build-steps",
  );
  await checkAll(
    page,
    buildSteps.map((s) => `/build/${s.slug}`),
    testInfo,
  );
});

test("every exercise", async ({ page, request }, testInfo) => {
  const { exercises } = await get<{ exercises: { id: string }[] }>(
    request,
    "/api/exercises",
  );
  await checkAll(
    page,
    exercises.map((e) => `/practice/${e.id}`),
    testInfo,
  );
});

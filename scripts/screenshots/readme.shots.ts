import { expect, test, type Page } from "@playwright/test";

// Each screen in the README, saved to docs/screenshots/<name>.png.
const OUT = "docs/screenshots";

async function shoot(page: Page, name: string) {
  // Let fonts, transitions and data settle before the picture.
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

test("home", async ({ page }) => {
  await page.goto("/");
  await shoot(page, "home");
});

test("learn", async ({ page }) => {
  await page.goto("/learn");
  await shoot(page, "learn");
});

test("guided step with a reference table", async ({ page }) => {
  await page.goto("/learn/html/tags-for-text");
  await shoot(page, "guided-step");
});

test("JavaScript playground", async ({ page }) => {
  await page.goto("/learn/javascript/array-methods");
  // The table above and the playground with its output.
  await page
    .getByRole("table")
    .first()
    .evaluate((el) => el.scrollIntoView());
  await page.mouse.wheel(0, -120);
  await expect(
    page.frameLocator('iframe[title^="Output:"]').locator("#out"),
  ).toContainText("Bread");
  await shoot(page, "js-playground");
});

test("glossary panel", async ({ page }) => {
  await page.goto("/learn/javascript/functions?term=js-function");
  await expect(
    page.getByRole("complementary", { name: "Glossary" }),
  ).toBeVisible();
  await shoot(page, "glossary-panel");
});

test("module step-through", async ({ page }) => {
  await page.goto("/learn/javascript/functions?part=7");
  const trace = page.locator("figure").filter({ hasText: "Step through" });
  for (let i = 0; i < 4; i++)
    await trace.getByRole("button", { name: "Next move →" }).click();
  await trace.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await trace.screenshot({ path: `${OUT}/module-trace.png` });
});

test("your turn", async ({ page }) => {
  await page.goto("/learn/javascript/functions?part=12");
  const exercise = page.getByRole("region", { name: "Your turn: Is it even?" });
  await exercise
    .getByLabel("Your code")
    .fill("function isEven(n) {\n  return n % 2 === 1;\n}");
  await exercise.getByRole("button", { name: "▶ Check my code" }).click();
  await expect(exercise.getByRole("status")).toHaveText(/tests pass/);
  await page.waitForTimeout(300);
  await exercise.screenshot({ path: `${OUT}/your-turn.png` });
});

test("course map", async ({ page }) => {
  await page.goto("/course-map");
  await shoot(page, "course-map");
});

test("flow", async ({ page }) => {
  await page.goto("/flow");
  for (let i = 0; i < 6; i++)
    await page.getByRole("button", { name: /^Next/ }).click();
  await shoot(page, "flow");
});

test("explorer", async ({ page }) => {
  await page.goto("/explorer");
  await shoot(page, "explorer");
});

test("build", async ({ page }) => {
  await page.goto("/build");
  await shoot(page, "build");
});

test.describe("dark mode", () => {
  test.use({ colorScheme: "dark" });
  test("guided step, dark", async ({ page }) => {
    await page.goto("/learn/css/flexbox");
    await shoot(page, "dark-mode");
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  test("guided step on a phone", async ({ page }) => {
    await page.goto("/learn/javascript/functions");
    await shoot(page, "phone");
  });
});

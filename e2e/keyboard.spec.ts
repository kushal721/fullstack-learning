import { expect, test } from "@playwright/test";

// Keyboard-only basics: the skip link and the trees' arrow keys.

test("Tab reaches the skip link first, and it moves focus to the content", async ({
  page,
}) => {
  await page.goto("/learn");
  // Wait for the page's content, so it doesn't re-render after the skip.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("arrow keys move through the learning tree", async ({ page }) => {
  await page.goto("/learn");
  const items = page.getByRole("tree").getByRole("treeitem");
  await expect(items.first()).toBeVisible();
  await items.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(items.first()).toBeFocused();
});

test("arrow keys open folders in the file tree", async ({ page }) => {
  await page.goto("/explorer");
  const tree = page.getByRole("tree", { name: "Notes App files" });
  const src = tree.getByRole("treeitem", { name: "src", exact: true }).first();
  await src.focus();
  await expect(src).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("ArrowRight");
  await expect(src).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(src).toHaveAttribute("aria-expanded", "false");
});

import { expect, type Page, type TestInfo } from "@playwright/test";

/**
 * Loads a page and checks what unit tests can't see: that nothing is wider
 * than the screen, that there is exactly one <h1>, and that no JavaScript
 * error happened. Failures name the page (and the widest element), and a
 * screenshot is attached.
 */
export async function checkPage(
  page: Page,
  path: string,
  testInfo: TestInfo,
  { expectNotFound = false } = {},
) {
  const errors: string[] = [];
  const onError = (error: Error) => errors.push(`page error: ${error.message}`);
  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() !== "error") return;
    // A not-found page is *meant* to get a 404 from the API.
    if (expectNotFound && /status of 404/.test(message.text())) return;
    errors.push(`console error: ${message.text()}`);
  };
  page.on("pageerror", onError);
  page.on("console", onConsole);

  await page.goto(path);
  await page.waitForLoadState("networkidle");
  // Wait until the page has finished loading its data: the app's loading
  // indicators (role="status"), not code that happens to say "Loading".
  await expect(
    page.getByRole("status").filter({ hasText: /^Loading/ }),
  ).toHaveCount(0, { timeout: 15_000 });

  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const h1 = document.querySelectorAll("h1").length;
    // Only look for the culprit when there is a problem: walking every
    // element is slow on long pages.
    if (scrollWidth <= width) return { width, scrollWidth, widest: null, h1 };
    // The widest element that sticks out and isn't inside something that
    // clips or scrolls it (code blocks scroll on purpose).
    let widest: { name: string; right: number } | null = null;
    for (const element of document.querySelectorAll("body *")) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.right <= width + 1) continue;
      let clipped = false;
      for (
        let parent = element.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      ) {
        if (
          /(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflowX)
        ) {
          clipped = parent.getBoundingClientRect().right <= width + 1;
          if (clipped) break;
        }
      }
      if (clipped) continue;
      if (!widest || rect.right > widest.right) {
        const classes = String(element.getAttribute("class") ?? "")
          .split(/\s+/)
          .slice(0, 3)
          .join(".");
        const text = (element.textContent ?? "").trim().slice(0, 40);
        widest = {
          name: `<${element.tagName.toLowerCase()}${classes ? ` class="${classes}…"` : ""}> "${text}"`,
          right: Math.round(rect.right),
        };
      }
    }
    return { width, scrollWidth, widest, h1 };
  });

  page.off("pageerror", onError);
  page.off("console", onConsole);

  const problems: string[] = [];
  if (layout.scrollWidth > layout.width) {
    problems.push(
      `is ${layout.scrollWidth}px wide on a ${layout.width}px screen` +
        (layout.widest
          ? `; widest element ${layout.widest.name} ends at ${layout.widest.right}px`
          : ""),
    );
  }
  if (layout.h1 !== 1) problems.push(`has ${layout.h1} <h1> elements, not 1`);
  problems.push(...errors);

  if (problems.length > 0) {
    await testInfo.attach(`${path} (${testInfo.project.name})`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  }
  return problems.map((problem) => `${path} ${problem}`);
}

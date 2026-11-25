import type { LevelSummary } from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { PathSidebar } from "./PathSidebar.tsx";

const basic: LevelSummary = {
  level: "basic",
  outcome: "Build a page.",
  firstNumber: 1,
  lastNumber: 3,
  minutes: 30,
  steps: [
    {
      id: "tags",
      number: 1,
      level: "basic",
      kind: "lesson",
      title: "Tags",
      minutes: 10,
    },
    {
      id: "links",
      number: 2,
      level: "basic",
      kind: "lesson",
      title: "Links",
      minutes: 10,
    },
    {
      id: "basic-check",
      number: 3,
      level: "basic",
      kind: "check",
      title: "Basic check",
      minutes: 10,
    },
  ],
};

function renderSidebar(done: string[], currentStepId = "links") {
  render(
    <MemoryRouter>
      <PathSidebar
        topicSlug="html"
        topicTitle="HTML"
        levels={[basic]}
        current="basic"
        currentStepId={currentStepId}
        progress={{
          done,
          lastStep: {},
          level: "basic",
          dismissed: [],
          updatedAt: 0,
        }}
      />
    </MemoryRouter>,
  );
  return screen.getByRole("navigation", { name: "HTML: levels and steps" });
}

describe("PathSidebar", () => {
  it("names each step link from its own text: number, title and done", () => {
    const nav = renderSidebar(["tags"]);

    const done = within(nav).getByRole("link", { name: "Step 1: Tags (done)" });
    const current = within(nav).getByRole("link", { name: "Step 2: Links" });
    expect(current).toHaveAttribute("aria-current", "step");
    expect(
      within(nav).getByRole("link", { name: "Step 3: Basic check" }),
    ).toHaveAttribute("href", "/learn/html/basic-check");

    // Label in Name (WCAG 2.5.3): no aria-label replacing the visible text,
    // so the name always contains the title that's on screen.
    for (const link of [done, current]) {
      expect(link).not.toHaveAttribute("aria-label");
    }
  });

  it("shows a tick instead of the number for a finished step", () => {
    const nav = renderSidebar(["tags"]);

    const done = within(nav).getByRole("link", { name: "Step 1: Tags (done)" });
    expect(done).toHaveTextContent("✓");
    expect(done).not.toHaveTextContent(/^1/);
  });
});

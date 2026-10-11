import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { BuildTimeline } from "./BuildTimeline.tsx";

const steps = [1, 2, 3].map((order) => ({
  id: `s${order}`,
  slug: `s${order}`,
  order,
  title: `Step ${order}`,
  goal: `Goal ${order}.`,
}));

describe("BuildTimeline", () => {
  it("marks earlier, current and later steps in words, not only symbols", () => {
    render(
      <MemoryRouter>
        <BuildTimeline steps={steps} currentOrder={2} />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "✓1. Step 1",
      "→2. Step 2",
      "○3. Step 3",
    ]);
    expect(
      screen.getByRole("link", { name: "2. Step 2 (current step)" }),
    ).toHaveAttribute("aria-current", "step");
    expect(
      screen.getByRole("link", { name: "1. Step 1 (earlier step)" }),
    ).toHaveAttribute("href", "/build/s1");
    expect(screen.queryByText("Goal 1.")).toBeNull();
  });

  it("shows goals and no current step on the overview", () => {
    render(
      <MemoryRouter>
        <BuildTimeline steps={steps} currentOrder={null} showGoals />
      </MemoryRouter>,
    );
    expect(screen.getByText("Goal 1.")).toBeVisible();
    expect(
      screen
        .getAllByRole("link")
        .every((link) => !link.hasAttribute("aria-current")),
    ).toBe(true);
  });
});

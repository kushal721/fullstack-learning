import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { courseMapFixture } from "../test/fixtures.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import CourseMapPage from "./CourseMapPage.tsx";

function renderPage() {
  mockFetchRoutes({ "/api/course-map": courseMapFixture });
  return render(
    <MemoryRouter>
      <CourseMapPage />
    </MemoryRouter>,
  );
}

describe("CourseMapPage", () => {
  it("shows every topic, with each level's step range for topics with a path", async () => {
    renderPage();

    expect(
      await screen.findByText(
        "2 topics · 1 with guided steps · 7 steps · about 0.5 h",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Course map" }),
    ).toBeInTheDocument();

    const basic = screen.getByRole("region", { name: "HTML: Basic" });
    expect(within(basic).getByText("Steps 1–3")).toBeInTheDocument();
    expect(within(basic).getByText("3 steps · ~9 min")).toBeInTheDocument();
    // Covers lists the lessons; the level check isn't one.
    const covers = within(basic).getAllByRole("list")[0]!;
    expect(
      within(covers)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Tags", "Links"]);
    const intermediate = screen.getByRole("region", {
      name: "HTML: Intermediate",
    });
    expect(within(intermediate).getByText("Steps 4–5")).toBeInTheDocument();
  });

  it("lists every numbered step, linking into Learn", async () => {
    const user = userEvent.setup();
    renderPage();

    const advanced = await screen.findByRole("region", {
      name: "HTML: Advanced",
    });
    await user.click(within(advanced).getByText("All 2 steps"));
    expect(
      within(advanced).getByRole("link", { name: "Step 7: Advanced check" }),
    ).toHaveAttribute("href", "/learn/html/advanced-2");
  });

  it("marks topics without steps as coming soon, with a link to read them now", async () => {
    renderPage();

    expect(await screen.findByText("Steps coming soon")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Read the topic now →" }),
    ).toHaveAttribute("href", "/learn/react");
  });

  it("filters to one level across the course", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("region", { name: "HTML: Basic" });

    await user.click(screen.getByRole("button", { name: "Advanced" }));

    expect(screen.getByRole("button", { name: "Advanced" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByRole("region", { name: "HTML: Basic" })).toBeNull();
    expect(
      screen.getByRole("region", { name: "HTML: Advanced" }),
    ).toBeInTheDocument();
  });
});

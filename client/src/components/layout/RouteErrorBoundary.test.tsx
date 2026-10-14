import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout.tsx";

let shouldThrow = true;
function Broken() {
  if (shouldThrow) throw new Error("render bug");
  return <h1>Fixed page</h1>;
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="broken" element={<Broken />} />
          <Route path="learn" element={<h1>Learn page</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RouteErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    // React logs caught errors; keep the test output clean.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("keeps the header and offers a way forward when a page crashes", async () => {
    renderAt("/broken");
    expect(
      screen.getByRole("heading", { level: 1, name: "This page broke" }),
    ).toBeVisible();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to the learning tree" }),
    ).toHaveAttribute("href", "/learn");
    expect(screen.queryByText("render bug")).toBeNull();
    expect(console.error).toHaveBeenCalled();

    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Fixed page" }),
    ).toBeVisible();
  });

  it("starts fresh after navigating to another page", async () => {
    renderAt("/broken");
    expect(
      screen.getByRole("heading", { name: "This page broke" }),
    ).toBeVisible();
    // The header still works, and the next page isn't stuck on the error.
    await userEvent.click(
      within(screen.getByRole("banner")).getAllByRole("link", {
        name: "Learn",
      })[0]!,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Learn page" }),
    ).toBeVisible();
    expect(screen.queryByText("This page broke")).toBeNull();
  });
});

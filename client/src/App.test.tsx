import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.tsx";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App routing", () => {
  beforeEach(() => {
    // Pages load data from the API; keep tests offline.
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it.each([
    ["/learn", "Learn"],
    ["/learn/html", "Couldn't load this topic"],
    ["/concepts", "Concepts"],
    ["/concepts/react-usestate", "Couldn't load this concept"],
    ["/build", "Build"],
    ["/build/create-project", "Build step: create-project"],
    ["/explorer", "Explorer"],
    ["/project", "Project"],
    ["/flow", "Flow"],
    ["/no-such-page", "Page not found"],
  ])("renders %s inside the layout", async (path, heading) => {
    renderAt(path);
    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("marks the current section in the navigation", () => {
    renderAt("/concepts/react-usestate");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Concepts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Learn" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("navigates when a header link is clicked", async () => {
    renderAt("/");
    const nav = screen.getByRole("navigation", { name: "Main" });
    await userEvent.click(within(nav).getByRole("link", { name: "Flow" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Flow" }),
    ).toBeInTheDocument();
  });

  it("opens and closes the mobile menu", async () => {
    renderAt("/");
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("navigation", { name: "Main" })).toHaveLength(2);

    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("offers a skip link to the main content", () => {
    renderAt("/learn");
    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).toHaveAttribute("href", "#main");
  });
});

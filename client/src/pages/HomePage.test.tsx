import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { topicTreeFixture } from "../test/fixtures.ts";
import { mockFetchJson } from "../test/mock-fetch.ts";
import HomePage from "./HomePage.tsx";

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

const whereToStart = "Begin with `HTML`, then follow the topics in order.";

describe("HomePage", () => {
  it("shows the philosophy and where to start, from the API", async () => {
    const fetchMock = mockFetchJson({ tree: topicTreeFixture, whereToStart });
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Full-Stack Learning" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Understand what happens when you write it/),
    ).toBeInTheDocument();

    const start = await screen.findByRole("link", { name: "Start with HTML" });
    expect(start).toHaveAttribute("href", "/learn/html");
    expect(screen.getByText("HTML", { selector: "code" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Build the Notes App" }),
    ).toHaveAttribute("href", "/build");
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/topics");
  });

  it("explains each part of the platform", () => {
    mockFetchJson({ tree: topicTreeFixture });
    renderPage();

    const section = screen
      .getByRole("heading", { name: "How this works" })
      .closest("section");
    expect(section).not.toBeNull();
    for (const name of ["Learn", "Concepts", "Build", "Flow"]) {
      expect(
        within(section as HTMLElement).getByRole("link", {
          name: new RegExp(`^${name}`),
        }),
      ).toBeInTheDocument();
    }
  });

  it("lists every topic from the API", async () => {
    mockFetchJson({ tree: topicTreeFixture });
    renderPage();

    const list = (
      await screen.findByRole("heading", { name: "The 2 topics" })
    ).closest("section") as HTMLElement;
    const links = within(list).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/learn/html",
      "/learn/react",
    ]);
  });

  it("shows an error with retry when the API is unreachable", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ tree: topicTreeFixture })),
      );
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the server.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByRole("link", { name: "Start with HTML" }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { topicTreeFixture } from "../test/fixtures.ts";
import { mockFetchJson } from "../test/mock-fetch.ts";
import LearnPage from "./LearnPage.tsx";

function renderPage() {
  return render(
    <MemoryRouter>
      <LearnPage />
    </MemoryRouter>,
  );
}

describe("LearnPage", () => {
  it("loads the learning tree from the API", async () => {
    const fetchMock = mockFetchJson({ tree: topicTreeFixture });
    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading the learning tree…",
    );
    expect(
      await screen.findByRole("treeitem", { name: "HTML" }),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/topics");
    expect(
      screen.getByText("Everything needed to build a web application."),
    ).toBeInTheDocument();
  });

  it("shows an error with a retry when the API fails", async () => {
    vi.spyOn(globalThis, "fetch")
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
      await screen.findByRole("treeitem", { name: "React" }),
    ).toBeInTheDocument();
  });
});

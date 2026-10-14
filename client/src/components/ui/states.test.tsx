import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./ErrorState.tsx";
import { Loading } from "./Loading.tsx";
import { NotFoundState } from "./NotFoundState.tsx";

describe("state components", () => {
  it("Loading is announced as a status", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("ErrorState explains the problem, retries and links back to the tree", async () => {
    const onRetry = vi.fn();
    render(
      <MemoryRouter>
        <ErrorState message="Could not reach the server." onRetry={onRetry} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load thisCould not reach the server. Check your internet connection, then try again.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("link", { name: "Go to the learning tree" }),
    ).toHaveAttribute("href", "/learn");
  });

  it("ErrorState turns the API's generic message into a helpful one", () => {
    render(
      <MemoryRouter>
        <ErrorState message="Something went wrong" homeLink={false} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The server had a problem. It isn't something you did",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "Something went wrong",
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("NotFoundState links back to the learning tree", () => {
    render(
      <MemoryRouter>
        <NotFoundState title="Topic not found" />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Topic not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to the learning tree" }),
    ).toHaveAttribute("href", "/learn");
  });
});

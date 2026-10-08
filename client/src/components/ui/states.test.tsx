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

  it("ErrorState shows the message and retries", async () => {
    const onRetry = vi.fn();
    render(
      <ErrorState message="Could not reach the server." onRetry={onRetry} />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not reach the server.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
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

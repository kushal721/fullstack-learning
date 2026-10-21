import type { Scene } from "@fsl/shared";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScenePlayer } from "./ScenePlayer.tsx";
import { TryIt } from "./TryItWidgets.tsx";

const scene: Scene = {
  id: "journey",
  title: "Opening a website",
  actors: [
    { id: "browser", label: "Browser", sub: "Chrome" },
    { id: "server", label: "Server" },
  ],
  steps: [
    {
      from: "browser",
      to: "server",
      message: "GET /",
      caption: "The browser asks.",
      detail: "A request.",
    },
    {
      from: "server",
      to: "browser",
      message: "200",
      caption: "The server answers.",
    },
    {
      from: "browser",
      to: "browser",
      message: "page",
      caption: "The page appears.",
    },
  ],
};

describe("ScenePlayer", () => {
  afterEach(() => vi.useRealTimers());

  it("starts waiting for Play, with every move listed as text", () => {
    render(<ScenePlayer scene={scene} />);

    expect(screen.getByText("Opening a website")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Opening a website: an animation with 3 steps, also listed below as text.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Press Play to watch it happen."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← Previous" })).toBeDisabled();
    const list = screen.getByText("All 3 steps as text").closest("details")!;
    expect(list).toHaveAttribute("open");
    expect(within(list).getAllByRole("button")).toHaveLength(3);
  });

  it("steps by hand and from the text list, showing each caption", async () => {
    const user = userEvent.setup();
    render(<ScenePlayer scene={scene} compact />);

    expect(
      screen.getByText("All 3 steps as text").closest("details"),
    ).not.toHaveAttribute("open");
    await user.click(screen.getByRole("button", { name: "Next →" }));
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getAllByText("The browser asks.")[0]).toBeInTheDocument();
    expect(
      screen.getByText("A request.", { selector: "p" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /The page appears/ }));
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next →" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "↺ Replay" }),
    ).toBeInTheDocument();
  });

  it("plays every move in turn and stops at the end", async () => {
    vi.useFakeTimers();
    render(<ScenePlayer scene={scene} />);

    act(() => screen.getByRole("button", { name: "▶ Play" }).click());
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "⏸ Pause" })).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(2400));
    await act(() => vi.advanceTimersByTimeAsync(2400));
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "↺ Replay" }),
    ).toBeInTheDocument();
  });

  it("cycles the speed", async () => {
    const user = userEvent.setup();
    render(<ScenePlayer scene={scene} />);

    const speed = screen.getByRole("button", { name: "Speed: 1×" });
    await user.click(speed);
    expect(speed).toHaveAccessibleName("Speed: 1.5×");
    await user.click(speed);
    expect(speed).toHaveAccessibleName("Speed: 0.75×");
  });
});

describe("TryIt", () => {
  it("explains each part of a URL, linking the words to the glossary", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TryIt widget="url-anatomy" glossary={[]} />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Click a part of the address to see what it does."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "notes.app" }));
    expect(screen.getByRole("button", { name: "notes.app" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("link", { name: "Domain" })).toHaveAttribute(
      "href",
      "/?term=domain",
    );
    expect(screen.getByText(/which server to talk to/)).toBeInTheDocument();
  });

  it("answers each situation with its status code", async () => {
    const user = userEvent.setup();
    render(<TryIt widget="status-codes" glossary={[]} />);

    expect(screen.getByText("200")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "The page doesn't exist" }),
    );
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });
});

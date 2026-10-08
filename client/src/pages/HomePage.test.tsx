import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage.tsx";

describe("HomePage", () => {
  it("renders the title and the API status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ status: "ok", uptime: 1, version: "test" }),
      ),
    );

    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Full-Stack Learning" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("API: ok")).toBeInTheDocument();
  });

  it("shows when the API cannot be reached", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    render(<HomePage />);

    expect(await screen.findByText("API: unreachable")).toBeInTheDocument();
  });
});

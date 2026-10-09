import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeExample } from "./CodeExample.tsx";

const example = {
  language: "bash" as const,
  code: "npm install express",
  caption: "Install `express`.",
};

describe("CodeExample", () => {
  it("shows the language or file name and the caption", () => {
    const { rerender } = render(<CodeExample example={example} />);
    expect(screen.getByText("Terminal")).toBeInTheDocument();
    expect(
      screen.getByText("express", { selector: "figcaption code" }),
    ).toBeInTheDocument();

    rerender(<CodeExample example={{ ...example, fileName: "server.js" }} />);
    expect(screen.getByText("server.js")).toBeInTheDocument();
  });

  it("copies the code and announces it", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    render(<CodeExample example={example} />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith("npm install express");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Code copied to clipboard",
    );
  });

  it("announces when copying fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );
    render(<CodeExample example={example} />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Could not copy the code",
    );
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { FileMetadata } from "./FileMetadata.tsx";

const file = {
  id: "backend/src/db.js",
  path: "backend/src/db.js",
  layer: "backend" as const,
  language: "js" as const,
  purpose: "Creates the one shared pool from `DATABASE_URL`.",
  whyItExists: "Opening a database connection is slow.",
  conceptIds: ["db-connection-pool"],
};

describe("FileMetadata", () => {
  it("shows what the file does, why it exists, its layer and concepts", () => {
    render(
      <MemoryRouter>
        <FileMetadata
          file={file}
          source=""
          concepts={[
            {
              id: "db-connection-pool",
              slug: "db-connection-pool",
              title: "Connection pool",
              topicId: "databases",
              summary: "x",
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("DATABASE_URL").tagName).toBe("CODE");
    expect(
      screen.getByText("Opening a database connection is slow."),
    ).toBeInTheDocument();
    expect(screen.getByText("backend")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Connection pool" }),
    ).toHaveAttribute("href", "/concepts/db-connection-pool");
  });

  it("says so when no concepts are linked", () => {
    render(
      <MemoryRouter>
        <FileMetadata
          file={{ ...file, conceptIds: [] }}
          source=""
          concepts={[]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("No concepts linked yet.")).toBeInTheDocument();
  });
});

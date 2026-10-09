import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { RelatedConcepts } from "./RelatedConcepts.tsx";

const related = [
  {
    id: "html-button",
    slug: "html-button",
    title: "HTML <button>",
    topicId: "html",
    summary: "Trigger an action.",
  },
  {
    id: "http-post",
    slug: "http-post",
    title: "HTTP POST",
    topicId: "http",
    summary: "Send new data to a server.",
  },
];

describe("RelatedConcepts", () => {
  it("shows each related concept as a card linking to it", () => {
    render(
      <MemoryRouter>
        <RelatedConcepts concepts={related} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /HTTP POST/ })).toHaveAttribute(
      "href",
      "/concepts/http-post",
    );
    expect(screen.getByText("Send new data to a server.")).toBeInTheDocument();
  });

  it("says so when there are none", () => {
    render(<RelatedConcepts concepts={[]} />);
    expect(screen.getByText("No related concepts yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

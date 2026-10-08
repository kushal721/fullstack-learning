import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { Card } from "./Card.tsx";
import { PageHeader } from "./PageHeader.tsx";
import { RichText } from "./RichText.tsx";

describe("RichText", () => {
  it("turns backtick spans into inline code", () => {
    const { container } = render(
      <RichText text="Call `useState` inside `App` only." />,
    );
    const codes = container.querySelectorAll("code");
    expect([...codes].map((c) => c.textContent)).toEqual(["useState", "App"]);
    expect(container.textContent).toBe("Call useState inside App only.");
  });

  it("leaves text without backticks unchanged", () => {
    const { container } = render(<RichText text="Plain text" />);
    expect(container.querySelector("code")).toBeNull();
    expect(container.textContent).toBe("Plain text");
  });

  it("renders text as text, never as HTML", () => {
    const { container } = render(<RichText text="<b>not bold</b>" />);
    expect(container.querySelector("b")).toBeNull();
  });
});

describe("Card", () => {
  it("is a link when `to` is given", () => {
    render(
      <MemoryRouter>
        <Card title="HTML" to="/learn/html">
          Structure of a page
        </Card>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /HTML/ })).toHaveAttribute(
      "href",
      "/learn/html",
    );
  });

  it("is not a link without `to`", () => {
    render(<Card title="HTML" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("heading", { name: "HTML" })).toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  it("renders one h1 with the description", () => {
    render(<PageHeader title="Learn" description="Start with `HTML`." />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("HTML").tagName).toBe("CODE");
  });
});

import type { HttpExchange } from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { formatBody, parseRawResponse } from "./http.ts";
import { HttpDetails } from "./HttpDetails.tsx";

const login: HttpExchange = {
  method: "POST",
  path: "/api/auth/login",
  purpose: "Log in: check the password and set the login cookie.",
  headers: { "Content-Type": "application/json" },
  body: '{"email":"you@example.com","password":"my-password-123"}',
  status: 200,
  response:
    'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nSet-Cookie: token=abc; HttpOnly; SameSite=Lax\n\n{"id":2,"email":"you@example.com"}',
  errorCases: [
    {
      status: 400,
      when: "The email or password is missing.",
      body: '{"error":"Email and password are required"}',
    },
    {
      status: 401,
      when: "Wrong password, or no such `email`.",
      body: '{"error":"Invalid email or password"}',
    },
  ],
};
const logout: HttpExchange = {
  method: "POST",
  path: "/api/auth/logout",
  purpose: "Log out.",
  headers: { Cookie: "token=abc" },
  status: 204,
  response:
    "HTTP/1.1 204 No Content\nSet-Cookie: token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT\n\n(no body)",
  errorCases: [],
};

const renderDetails = (exchange: HttpExchange) =>
  render(
    <MemoryRouter>
      <HttpDetails exchange={exchange} />
    </MemoryRouter>,
  );
const codeTexts = () =>
  [...document.querySelectorAll("pre code")].map((c) => c.textContent);

describe("http helpers", () => {
  it("splits a raw response into status line, headers and body", () => {
    expect(parseRawResponse(login.response)).toEqual({
      statusLine: "HTTP/1.1 200 OK",
      headers: [
        ["Content-Type", "application/json; charset=utf-8"],
        ["Set-Cookie", "token=abc; HttpOnly; SameSite=Lax"],
      ],
      body: '{"id":2,"email":"you@example.com"}',
    });
  });

  it("pretty-prints JSON and leaves shortened bodies as they are", () => {
    expect(formatBody('{"a":1}')).toEqual({
      text: '{\n  "a": 1\n}',
      isJson: true,
    });
    expect(formatBody('[{"id":7},…]')).toEqual({
      text: '[{"id":7},…]',
      isJson: false,
    });
  });
});

describe("HttpDetails", () => {
  it("labels every part of the request and response, with concept links", () => {
    renderDetails(login);
    expect(
      screen.getByRole("heading", { name: "The HTTP request" }),
    ).toBeInTheDocument();
    expect(screen.getByText("POST /api/auth/login")).toBeInTheDocument();
    for (const [name, slug] of [
      ["What is an HTTP method?", "http-methods"],
      ["What is a status code?", "http-status-codes"],
    ] as const) {
      expect(screen.getByRole("link", { name })).toHaveAttribute(
        "href",
        `/concepts/${slug}`,
      );
    }
    expect(
      screen.getAllByRole("link", { name: "What is a header?" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: "What is JSON?" })[0],
    ).toHaveAttribute("href", "/concepts/json");
    expect(screen.getByText("200 OK")).toBeInTheDocument();
    expect(
      screen.getByText("token=abc; HttpOnly; SameSite=Lax"),
    ).toBeInTheDocument();
    expect(codeTexts().map((t) => t?.replace(/\s+/g, ""))).toEqual([
      '{"email":"you@example.com","password":"my-password-123"}',
      '{"id":2,"email":"you@example.com"}',
    ]);
  });

  it("says when there is no body, and when an endpoint has no errors", async () => {
    renderDetails(logout);
    expect(
      screen.getByText("No body: this request only asks."),
    ).toBeInTheDocument();
    expect(screen.getByText("no body")).toBeInTheDocument();
    expect(screen.getByText("204 No Content")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Error cases (0)" }));
    expect(screen.getByText("This endpoint always succeeds.")).toBeVisible();
  });

  it("lists the error cases in their own tab, reachable with the arrow keys", async () => {
    renderDetails(login);
    const exchangeTab = screen.getByRole("tab", {
      name: "Request and response",
    });
    const errorsTab = screen.getByRole("tab", { name: "Error cases (2)" });
    expect(exchangeTab).toHaveAttribute("aria-selected", "true");
    expect(
      document.getElementById(errorsTab.getAttribute("aria-controls")!),
    ).not.toBeVisible();

    await userEvent.click(exchangeTab);
    await userEvent.keyboard("{ArrowRight}");
    expect(errorsTab).toHaveFocus();
    expect(errorsTab).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: "Error cases (2)" });
    expect(within(panel).getByText("400 Bad Request")).toBeInTheDocument();
    expect(within(panel).getByText("401 Unauthorized")).toBeInTheDocument();
    expect(
      within(panel).getByText('{"error":"Invalid email or password"}'),
    ).toBeInTheDocument();

    await userEvent.keyboard("{ArrowLeft}");
    expect(exchangeTab).toHaveFocus();
  });
});

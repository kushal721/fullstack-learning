import type { ExerciseListResponse } from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { clearApiCache } from "../hooks/useApi.ts";
import { mockFetchRoutes } from "../test/mock-fetch.ts";
import PracticePage from "./PracticePage.tsx";

const base = { conceptIds: [], hints: ["h"] };
const list: ExerciseListResponse = {
  exercises: [
    {
      ...base,
      id: "find-x",
      mode: "find",
      title: "Where is x?",
      prompt: "Find `x`.",
      target: "file",
    },
    {
      ...base,
      id: "predict-save",
      mode: "predict",
      title: "Clicking Save",
      prompt: "What happens?",
      choices: [],
    },
  ],
};

describe("PracticePage", () => {
  beforeEach(() => clearApiCache());

  it("groups exercises by mode in the modes' order and links each one", async () => {
    mockFetchRoutes({ "/api/exercises": list });
    render(
      <MemoryRouter>
        <PracticePage />
      </MemoryRouter>,
    );
    await screen.findByRole("heading", { level: 2, name: "Predict" });
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual(["Predict", "FindComing soon"]);
    expect(screen.getByRole("link", { name: /Clicking Save/ })).toHaveAttribute(
      "href",
      "/practice/predict-save",
    );
    const find = screen.getByRole("heading", {
      level: 2,
      name: /Find/,
    }).parentElement!;
    expect(within(find).getByRole("link")).toHaveTextContent("Find x.");
  });
});

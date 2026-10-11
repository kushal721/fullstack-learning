import type { BuildStep } from "@fsl/shared";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { NextStep } from "./NextStep.tsx";

const step: BuildStep = {
  id: "add-state",
  slug: "add-state",
  order: 6,
  title: "Add state",
  goal: "Keep notes in state.",
  why: "Why.",
  problemSolved: "Problem.",
  prerequisites: [],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: ["frontend/src/hooks/useNotes.js"],
  filesModified: [],
  filesRemoved: [],
  conceptIds: ["react-usestate"],
  codeExamples: [],
  relationshipIds: [],
  enables: "Add notes in the browser.",
  commonMistakes: [],
  nextStepId: "add-api-communication",
  nextWhy: "Notes vanish on reload.",
};
const concepts = [
  {
    id: "react-usestate",
    slug: "react-usestate",
    title: "useState",
    topicId: "react",
    summary: "Remembers a value.",
  },
];
const summary = (id: string, order: number, title: string) => ({
  id,
  slug: id,
  order,
  title,
  goal: "Goal.",
});

function part(title: string) {
  return screen.getByRole("heading", { level: 3, name: title }).parentElement!;
}

describe("NextStep", () => {
  it("summarises the step and links to what comes next, with why", () => {
    render(
      <MemoryRouter>
        <NextStep
          step={step}
          concepts={concepts}
          previous={summary("create-page", 5, "Create a page")}
          next={summary("add-api-communication", 7, "Add API communication")}
        />
      </MemoryRouter>,
    );
    expect(
      within(part("You just learned")).getByRole("link", { name: "useState" }),
    ).toHaveAttribute("href", "/concepts/react-usestate");
    expect(within(part("You just created")).getByRole("link")).toHaveAttribute(
      "href",
      "/explorer?file=frontend%2Fsrc%2Fhooks%2FuseNotes.js",
    );
    expect(part("You are now able to")).toHaveTextContent(
      "Add notes in the browser.",
    );
    expect(within(part("Next")).getByRole("link")).toHaveAttribute(
      "href",
      "/build/add-api-communication",
    );
    expect(part("Why this comes next")).toHaveTextContent(
      "Notes vanish on reload.",
    );

    const nav = screen.getByRole("navigation", {
      name: "Build steps navigation",
    });
    expect(
      within(nav).getByRole("link", {
        name: /Previous step.*5\. Create a page/,
      }),
    ).toHaveAttribute("href", "/build/create-page");
    expect(
      within(nav).getByRole("link", { name: /Next step.*7\. Add API/ }),
    ).toHaveAttribute("rel", "next");
  });

  it("says the journey is finished on the last step", () => {
    render(
      <MemoryRouter>
        <NextStep
          step={{
            ...step,
            filesCreated: [],
            nextStepId: undefined,
            nextWhy: undefined,
          }}
          concepts={[]}
          previous={summary("test", 13, "Test the app")}
        />
      </MemoryRouter>,
    );
    expect(part("Next")).toHaveTextContent(
      "You have built the whole Notes App.",
    );
    expect(
      screen.queryByRole("heading", { name: "Why this comes next" }),
    ).toBeNull();
    expect(part("You just created")).toHaveTextContent("No new files");
    expect(part("You just learned")).toHaveTextContent("No new concepts");
    expect(screen.queryByRole("link", { name: /Next step/ })).toBeNull();
  });
});

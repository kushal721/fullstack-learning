import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TopicPage from "../../pages/TopicPage.tsx";
import {
  htmlPathFixture,
  htmlStep3Fixture,
  topicTreeFixture,
} from "../../test/fixtures.ts";
import { resetProgress } from "./progress.ts";

const tree = {
  ...topicTreeFixture,
  children: topicTreeFixture.children.map((topic) =>
    topic.id === "html" ? { ...topic, hasPath: true } : topic,
  ),
};

/** GETs by URL; POST …/check answers "correct" when the choice is "right". */
function mockApi() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input, init) => {
      const url = String(input);
      const json = (body: unknown) =>
        new Response(JSON.stringify(body), { status: 200 });
      if (init?.method === "POST") {
        const { answer } = JSON.parse(String(init.body)) as {
          answer: { choiceId: string };
        };
        return json({
          correct: answer.choiceId === "right",
          explanation: "Because.",
        });
      }
      const routes: Record<string, unknown> = {
        "/api/topics": { tree },
        "/api/paths/html": htmlPathFixture,
        "/api/paths/html/steps/basic-3": htmlStep3Fixture,
        "/api/topics/html": {
          topic: { ...htmlPathFixture.topic, overview: [], children: [] },
          concepts: [],
          buildSteps: [
            {
              id: "page",
              slug: "create-page",
              order: 4,
              title: "Create a page",
              goal: "A page.",
            },
          ],
        },
      };
      return url in routes
        ? json(routes[url])
        : new Response(
            JSON.stringify({
              error: { code: "NOT_FOUND", message: "Not found" },
            }),
            {
              status: 404,
            },
          );
    });
}

function renderCheck() {
  return render(
    <MemoryRouter initialEntries={["/learn/html/basic-3"]}>
      <Routes>
        <Route path="/learn/:topic/:step" element={<TopicPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function answer(
  user: ReturnType<typeof userEvent.setup>,
  picks: string[],
) {
  const ids = ["q-tags", "q-links", "q-nest"];
  for (const [i, pick] of picks.entries()) {
    const group = screen.getByRole("group", { name: `Question ${i + 1} of 3` });
    await user.click(
      within(group).getByRole("radio", {
        name: new RegExp(`${pick} answer to ${ids[i]}`, "i"),
      }),
    );
  }
}

describe("LevelCheck", () => {
  beforeEach(() => {
    resetProgress();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("asks every question and checks only once all are answered", async () => {
    const user = userEvent.setup();
    mockApi();
    renderCheck();

    expect(await screen.findByText("What wraps content?")).toBeInTheDocument();
    expect(
      screen.getByText(
        /3 questions\. Answer them all, then check: 2 of 3 completes Basic\./,
      ),
    ).toBeInTheDocument();
    const check = screen.getByRole("button", { name: "Check answers" });
    expect(check).toBeDisabled();
    await answer(user, ["right", "right"]);
    expect(check).toBeDisabled();
    await answer(user, ["right", "right", "wrong"]);
    expect(check).toBeEnabled();
  });

  it("completes the level with all but one right, points back for the miss and leads on", async () => {
    const user = userEvent.setup();
    mockApi();
    renderCheck();
    await screen.findByText("What wraps content?");

    await answer(user, ["right", "wrong", "right"]);
    await user.click(screen.getByRole("button", { name: "Check answers" }));

    expect(
      await screen.findByRole("heading", {
        name: "2 of 3 correct · Basic complete",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("After this level: Write a simple page."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "revisit step 2, Links" }),
    ).toHaveAttribute("href", "/learn/html/basic-2");
    expect(
      screen.getByRole("link", {
        name: /Keep going → Intermediate\s*Step 4: Forms/,
      }),
    ).toHaveAttribute("href", "/learn/html/intermediate-1");
    expect(
      await screen.findByRole("link", { name: /Build step 4: Create a page/ }),
    ).toHaveAttribute("href", "/build/create-page");
    // The check is now done in the step dots.
    expect(
      within(screen.getByRole("navigation", { name: "Basic steps" })).getByRole(
        "link",
        {
          name: "Step 3: Basic check (level check) (done)",
        },
      ),
    ).toBeInTheDocument();
  });

  it("says “almost there” below the pass mark, and lets the learner try again", async () => {
    const user = userEvent.setup();
    mockApi();
    renderCheck();
    await screen.findByText("What wraps content?");

    await answer(user, ["wrong", "wrong", "right"]);
    await user.click(screen.getByRole("button", { name: "Check answers" }));

    expect(
      await screen.findByRole("heading", {
        name: "1 of 3 correct · Almost there",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /revisit step 1, Tags/ }),
    ).toHaveLength(1);
    expect(screen.queryByText(/Keep going/)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Check answers" }),
    ).toBeDisabled();

    await answer(user, ["right"]);
    expect(screen.queryByText(/Almost there/)).toBeNull();
    expect(screen.getByRole("button", { name: "Check answers" })).toBeEnabled();
  });
});

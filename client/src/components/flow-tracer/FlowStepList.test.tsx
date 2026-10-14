import type { CodeSymbol, FlowStep } from "@fsl/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { FlowStepList } from "./FlowStepList.tsx";

const steps: FlowStep[] = [
  {
    id: "a",
    symbolId: "component:Button",
    layer: "user",
    title: "The user clicks Save",
    explanation: "x",
  },
  {
    id: "b",
    symbolId: "fn:handleSave",
    layer: "frontend",
    title: "handleSave takes over",
    explanation: "x",
  },
];
const symbols: Record<string, CodeSymbol> = {
  "component:Button": {
    id: "component:Button",
    kind: "component",
    name: "Button",
    summary: "",
    conceptIds: [],
  },
};

describe("FlowStepList", () => {
  it("starts collapsed and lists every step with its lane and symbol", async () => {
    render(
      <MemoryRouter>
        <FlowStepList flowId="create-note" steps={steps} symbols={symbols} />
      </MemoryRouter>,
    );
    const summary = screen.getByText("All 2 steps as a list");
    expect(summary.closest("details")).not.toHaveAttribute("open");
    await userEvent.click(summary);
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "1. User · ButtonThe user clicks Save",
      "2. Frontend · fn:handleSavehandleSave takes over",
    ]);
    expect(links[1]).toHaveAttribute("href", "/flow?flow=create-note&step=2");
  });

  it("jumps to a step on the same page and marks the current one", async () => {
    const onSelect = vi.fn();
    render(
      <MemoryRouter>
        <FlowStepList
          flowId="create-note"
          steps={steps}
          symbols={symbols}
          current={1}
          onSelect={onSelect}
        />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByText("All 2 steps as a list"));
    expect(screen.queryByRole("link")).toBeNull();
    expect(
      screen.getByRole("button", { name: /handleSave takes over/ }),
    ).toHaveAttribute("aria-current", "step");
    await userEvent.click(screen.getByRole("button", { name: /clicks Save/ }));
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});

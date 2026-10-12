import type { FlowStep } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import { layoutFlow, LANES } from "./layout.ts";

const step = (id: string, layer: FlowStep["layer"]): FlowStep => ({
  id,
  symbolId: `fn:${id}`,
  layer,
  title: id,
  explanation: "x",
});
const steps = [
  step("click", "user"),
  step("send", "frontend"),
  step("travel", "network"),
  step("store", "database"),
];

describe("layoutFlow", () => {
  it("draws the five lanes and places steps left to right in their lane", () => {
    const { nodes } = layoutFlow(steps, {}, 1);
    expect(nodes.filter((n) => n.type === "lane").map((n) => n.id)).toEqual(
      LANES.map((l) => `lane:${l.layer}`),
    );
    const pos = (id: string) => nodes.find((n) => n.id === id)!.position;
    expect(pos("click").x).toBeLessThan(pos("send").x);
    expect(pos("send").x).toBeLessThan(pos("travel").x);
    expect(pos("click").y).toBeLessThan(pos("send").y); // user lane above frontend
    expect(pos("travel").y).toBeLessThan(pos("store").y); // network above database
  });

  it("marks past, current and future steps and the edge being travelled", () => {
    const { nodes, edges } = layoutFlow(steps, {}, 2);
    const state = (id: string) =>
      (nodes.find((n) => n.id === id)!.data as { state: string }).state;
    expect(steps.map((s) => state(s.id))).toEqual([
      "past",
      "past",
      "current",
      "future",
    ]);
    expect(edges.map((e) => [e.id, e.data])).toEqual([
      ["click->send", { active: false, done: true }],
      ["send->travel", { active: true, done: false }],
      ["travel->store", { active: false, done: false }],
    ]);
  });
});

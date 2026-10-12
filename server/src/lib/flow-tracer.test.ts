import type { Flow, FlowStep } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import { flowsForSymbol, getFlow, getFlows } from "./flow-tracer.js";

const step = (id: string, symbolId: string): FlowStep => ({
  id,
  symbolId,
  layer: "frontend",
  title: id,
  explanation: "x",
});
const flow = (id: string, group: Flow["group"], steps: FlowStep[]): Flow => ({
  id,
  title: id,
  summary: "x",
  group,
  direction: "request",
  steps,
});
const sample = [
  flow("save", "request", [
    step("a", "fn:handleSave"),
    step("b", "fn:request"),
  ]),
  flow("login", "security", [
    step("a", "fn:login.handleSubmit"),
    step("b", "fn:request"),
  ]),
];

describe("flow tracer", () => {
  it("finds a flow by id", () => {
    expect(getFlow("login", sample)?.group).toBe("security");
    expect(getFlow("nope", sample)).toBeUndefined();
  });

  it("lists flows, optionally by group", () => {
    expect(getFlows(undefined, sample).map((f) => f.id)).toEqual([
      "save",
      "login",
    ]);
    expect(getFlows("security", sample).map((f) => f.id)).toEqual(["login"]);
  });

  it("finds the flows that pass through a symbol", () => {
    expect(flowsForSymbol("fn:request", sample).map((f) => f.id)).toEqual([
      "save",
      "login",
    ]);
    expect(flowsForSymbol("fn:handleSave", sample).map((f) => f.id)).toEqual([
      "save",
    ]);
    expect(flowsForSymbol("fn:nothing", sample)).toEqual([]);
  });

  it("has the create-note flow", () => {
    expect(getFlow("create-note")).toMatchObject({
      group: "request",
      direction: "round-trip",
    });
  });
});

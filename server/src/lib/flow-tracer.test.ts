import type { Flow, FlowStep } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import { flows } from "../content/flows/index.js";
import { relationships } from "../content/relationships.js";
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

  describe.each(flows.map((f) => [f.id, f] as const))("flow %s", (_id, f) => {
    it("is one unbroken chain: each step's relationship joins it to the step before", () => {
      f.steps.forEach((step, i) => {
        if (!step.relationshipId) return;
        const rel = relationships.find((r) => r.id === step.relationshipId)!;
        const previous = f.steps[i - 1];
        expect(
          previous,
          `${step.id} has a relationship but no step before it`,
        ).toBeDefined();
        expect([rel.source, rel.target].sort(), step.id).toEqual(
          [previous!.symbolId, step.symbolId].sort(),
        );
      });
    });

    it("shows the data at every step after the first click", () => {
      expect(f.steps.filter((s) => !s.dataShape).map((s) => s.id)).toEqual([]);
    });
  });

  it("takes create-note from the user to the network in order", () => {
    const steps = getFlow("create-note")!.steps;
    expect(steps.slice(0, 8).map((s) => s.symbolId)).toEqual([
      "component:NoteForm",
      "component:Button",
      "event:noteForm.submit",
      "fn:handleSave",
      "fn:notesApi.createNote",
      "fn:request",
      "external:fetch",
      "http-request:POST /api/notes",
    ]);
    expect(steps.slice(0, 8).map((s) => s.layer)).toEqual([
      "user",
      "user",
      "frontend",
      "frontend",
      "frontend",
      "frontend",
      "frontend",
      "network",
    ]);
  });
});

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
    it("connects every step with a relationship to an earlier step", () => {
      f.steps.forEach((step, i) => {
        if (!step.relationshipId) return;
        const rel = relationships.find((r) => r.id === step.relationshipId)!;
        const other = rel.source === step.symbolId ? rel.target : rel.source;
        expect([rel.source, rel.target], step.id).toContain(step.symbolId);
        expect(
          f.steps.slice(0, i).map((s) => s.symbolId),
          `${step.id}: ${other} is not an earlier step`,
        ).toContain(other);
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

  it("continues create-note through the backend in the order Express runs it", () => {
    const steps = getFlow("create-note")!.steps;
    expect(steps.slice(8, 14).map((s) => s.symbolId)).toEqual([
      "middleware:express.json",
      "middleware:cookieParser",
      "route:POST /api/notes",
      "middleware:requireAuth",
      "controller:notesController.createNote",
      "fn:validateNote",
    ]);
    expect(steps.slice(8, 14).every((s) => s.layer === "backend")).toBe(true);
    // The shapes show req.body, req.user and what a failed validation answers.
    const shapes = steps
      .slice(8, 14)
      .map((s) => s.dataShape!.code)
      .join("\n");
    expect(shapes).toContain("req.body = {");
    expect(shapes).toContain("req.user = { id: 1 }");
    expect(shapes).toContain(
      'res.status(400).json({ error: "Title is required" })',
    );
  });
});

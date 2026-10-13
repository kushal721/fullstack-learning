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

  it("continues create-note into the database with SQL, values and the stored row", () => {
    const steps = getFlow("create-note")!.steps;
    expect(steps.slice(14, 17).map((s) => `${s.layer} ${s.symbolId}`)).toEqual([
      "backend query:insertNote",
      "database table:notes",
      "database query:insertNote",
    ]);
    const [query, row, returned] = steps
      .slice(14, 17)
      .map((s) => s.dataShape!.code);
    expect(query).toContain("VALUES ($1, $2, $3)");
    expect(query).toContain('[1, "Shopping", "Milk, bread"]');
    expect(row).toContain("REFERENCES users (id)");
    expect(returned).toContain("id: 7");
  });

  it("brings create-note back onto the screen", () => {
    const steps = getFlow("create-note")!.steps;
    expect(steps.slice(17).map((s) => `${s.layer} ${s.symbolId}`)).toEqual([
      "backend controller:notesController.createNote",
      "network http-request:POST /api/notes",
      "frontend fn:request",
      "frontend fn:handleSave",
      "frontend fn:useNotes.addNote",
      "frontend hook:useNotes",
      "frontend component:Dashboard",
      "user component:NoteCard",
    ]);
    // It starts and ends with the user.
    expect(steps[0]!.layer).toBe("user");
    expect(steps.at(-1)!.layer).toBe("user");
  });

  it("has a list-notes round trip through every layer and back", () => {
    const steps = getFlow("list-notes")!.steps;
    const layers = steps.map((s) => s.layer);
    expect(layers[0]).toBe("user");
    expect(layers.at(-1)).toBe("user");
    expect(new Set(layers)).toEqual(
      new Set(["user", "frontend", "network", "backend", "database"]),
    );
    expect(steps.map((s) => s.symbolId)).toContain("query:selectNotes");
    expect(flowsForSymbol("query:selectNotes").map((f) => f.id)).toEqual([
      "list-notes",
    ]);
  });
});

describe("security flows", () => {
  it.each(["login", "register"])(
    "%s is a validated security round trip with its exchange",
    (id) => {
      const flow = getFlow(id)!;
      expect(flow.group).toBe("security");
      expect(flow.steps[0]!.layer).toBe("user");
      expect(new Set(flow.steps.map((s) => s.layer))).toEqual(
        new Set(["user", "frontend", "network", "backend", "database"]),
      );
      expect(flow.http?.path).toBe(`/api/auth/${id}`);
    },
  );

  it("explains HTTPS, hashing and the httpOnly cookie on login, with Set-Cookie and a 401", () => {
    const login = getFlow("login")!;
    const text = login.steps.map((s) => s.explanation).join(" ");
    expect(text).toContain("HTTPS");
    expect(text).toMatch(/hash/);
    expect(text).toContain("httpOnly");
    expect(login.http!.response).toContain("Set-Cookie: token=");
    expect(login.http!.errorCases.map((e) => e.status)).toContain(401);
  });

  it("authorizes a note update: who is asking, then owns this note, with 401 and 404 branches", () => {
    const flow = getFlow("update-note-authorized")!;
    expect(flow.group).toBe("security");
    const order = flow.steps.map((s) => s.symbolId);
    const at = (id: string) => order.indexOf(id);
    expect(at("middleware:requireAuth")).toBeLessThan(
      at("external:jsonwebtoken"),
    );
    expect(at("external:jsonwebtoken")).toBeLessThan(
      at("controller:notesController.updateNote"),
    );
    expect(at("controller:notesController.updateNote")).toBeLessThan(
      at("query:updateNote"),
    );
    const owner = flow.steps.find((s) => s.id === "owner-check")!;
    expect(owner.explanation).toContain("`user_id = $4`");
    expect(owner.dataShape!.code).toContain("WHERE id = $3 AND user_id = $4");
    const statuses = flow.http!.errorCases.map((e) => e.status);
    expect(statuses.slice(0, 4)).toEqual([401, 401, 404, 404]);
    expect(flow.http!.errorCases[2]!.when).toContain("403");
    expect(flow.http!.path).toBe("/api/notes/:id");
  });
});

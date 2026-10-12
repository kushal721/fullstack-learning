import type { Relationship, RelationshipType } from "@fsl/shared";

// How the symbols in symbols.ts connect. Each relationship reads as a
// sentence: source <type> target. The id is derived, so it can't drift.
function rel(
  source: string,
  type: RelationshipType,
  target: string,
  explanation: string,
): Relationship {
  return {
    id: `${source}->${type}->${target}`,
    source,
    target,
    type,
    explanation,
  };
}

// M06.1.1 seeds the backbone of "create a note"; M06.1.2–M06.1.4 add more.
export const relationships: Relationship[] = [
  rel(
    "fn:handleSave",
    "handles",
    "event:noteForm.submit",
    "`onSubmit={handleSave}` makes React call `handleSave` with the submit event, so saving starts here.",
  ),
  rel(
    "fn:handleSave",
    "calls",
    "fn:notesApi.createNote",
    "After stopping the page reload, `handleSave` awaits `createNote({ title, content })`, so the note leaves the component through the service file.",
  ),
  rel(
    "fn:notesApi.createNote",
    "calls",
    "fn:request",
    'createNote only knows the URL and method; `request("/api/notes", { method: "POST", body })` does the actual sending.',
  ),
  rel(
    "fn:request",
    "calls",
    "external:fetch",
    '`request` calls `fetch` with the method, JSON body and `credentials: "include"`, so the login cookie goes along.',
  ),
  rel(
    "external:fetch",
    "sends",
    "http-request:POST /api/notes",
    "`fetch` turns the call into a real HTTP request that travels over the network to the backend.",
  ),
  rel(
    "route:POST /api/notes",
    "receives",
    "http-request:POST /api/notes",
    "Express matches the method and path to this route, so the request reaches the notes router.",
  ),
  rel(
    "route:POST /api/notes",
    "uses",
    "middleware:requireAuth",
    "`notesRoutes.use(requireAuth)` runs first, so only a logged-in user's request reaches the controller.",
  ),
  rel(
    "route:POST /api/notes",
    "calls",
    "controller:notesController.createNote",
    "Once the login is checked, the route calls the controller, which does the actual work.",
  ),
  rel(
    "controller:notesController.createNote",
    "calls",
    "fn:validateNote",
    "The controller validates the body first and answers 400 with the message if it is invalid, so bad input never reaches the database.",
  ),
  rel(
    "controller:notesController.createNote",
    "calls",
    "query:insertNote",
    "With a valid note, the controller runs the INSERT with the logged-in user's id and the note's values as parameters.",
  ),
  rel(
    "query:insertNote",
    "queries",
    "table:notes",
    "The INSERT adds one row to `notes` and `RETURNING` sends the saved row back, which the controller returns with 201.",
  ),
];

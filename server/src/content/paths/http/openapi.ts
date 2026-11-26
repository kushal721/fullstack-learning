import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// OpenAPI: a description as a contract, the document's shape, one
// operation, parameters, JSON Schema for bodies, reusing schemas with $ref
// step by step, what tools do with it, design-first or code-first, the
// Notes App, mistakes, practice and a recap.
export const openapiModule = moduleLesson(
  "openapi",
  "OpenAPI: describing an API",
  50,
  [
    "Explain why an API description works as a contract between client and server.",
    "Read an OpenAPI document: info, paths, methods, parameters, bodies and responses.",
    "Describe a request body with JSON Schema and reuse it with $ref.",
    "Name what tools build from it: docs, clients, mocks, validation and contract tests.",
    "Choose between writing the description first and generating it from code.",
  ],

  part(
    "contract",
    "A description is a contract",
    explain(
      "Front end and back end have to agree on every URL, field and status code. Usually that agreement lives in people's heads and in scattered code. [[openapi|OpenAPI]] writes it down in one JSON or YAML file: every path, method, parameter, body and response. Both sides build against the same file.",
    ),
    diagram([
      ["openapi.json", "the contract"],
      ["Docs", "for people"],
      ["Client code", "for the front end"],
      ["Checks", "for the server"],
    ]),
    keyPoints(
      "One file describes the whole API, readable by people and tools.",
      "Front and back end can work at once, against the same promise.",
      "A change to the file shows exactly what changes for clients.",
    ),
  ),

  part(
    "shape",
    "The shape of the document",
    explain(
      "An OpenAPI document is one object with a few top-level fields. `openapi` is the version of the format. `info` names your API. `paths` is the heart: each URL, then each method under it. `components` holds pieces used in many places, such as schemas.",
    ),
    anatomy(
      "An OpenAPI document, folded",
      [
        '{ "openapi": "3.1.0",',
        '  "info": { "title": "Notes", "version": "1.0" },',
        '  "paths": { "/api/notes": { "post": {} } },',
        '  "components": { "schemas": {} } }',
      ],
      [
        [
          '"openapi": "3.1.0"',
          "format version",
          "Which OpenAPI version this follows.",
        ],
        ['"info"', "about the API", "Its title and your API's own version."],
        [
          '"paths"',
          "every URL",
          "Keys are paths, written with {id} for parameters.",
        ],
        ['"/api/notes"', "a path", "Its value lists the methods it accepts."],
        [
          '"post"',
          "an operation",
          "One method on one path: what it takes and returns.",
        ],
        [
          '"schemas"',
          "shared shapes",
          "Named data shapes, such as Note, used by reference.",
        ],
      ],
    ),
  ),

  part(
    "operation",
    "One operation",
    explain(
      "Under a path, each method is an *operation*. `requestBody` says what the client must send, by media type. `responses` lists every [[http-status-codes|status code]] it can answer with, each with a description and, if there is one, a body. Document the errors too: clients need them as much as the 201.",
    ),
    code(
      "json",
      "POST /api/notes, described",
      [
        '"post": {',
        '  "summary": "Create a note",',
        '  "requestBody": {',
        '    "required": true,',
        '    "content": { "application/json": {',
        '      "schema": {',
        '        "$ref": "#/components/schemas/NewNote"',
        "      }",
        "    } }",
        "  },",
        '  "responses": {',
        '    "201": { "description": "The new note" },',
        '    "400": { "description": "Invalid note" }',
        "  }",
        "}",
      ],
      {
        4: "a body must be sent",
        5: "it's JSON",
        7: "its shape is defined once, elsewhere",
        11: "keys are status codes, as strings",
      },
    ),
  ),

  part(
    "parameters",
    "Parameters",
    explain(
      "Paths use `{id}`, not `:id`. Each [[path-parameter]], [[query-parameter]] or header is listed under `parameters` with its `name`, where it is (`in`: path, query, header or cookie), whether it's required, and a schema. A path parameter is always required.",
    ),
    code(
      "json",
      "PUT /api/notes/{id}",
      [
        '"/api/notes/{id}": {',
        '  "put": {',
        '    "parameters": [{',
        '      "name": "id",',
        '      "in": "path",',
        '      "required": true,',
        '      "schema": { "type": "integer" }',
        "    }],",
        '    "requestBody": { … },',
        '    "responses": { … }',
        "  }",
        "}",
      ],
      {
        1: "{id} marks the parameter in the path",
        5: "where to find it: path, query, header or cookie",
        7: "a whole number, though it arrives as text",
      },
    ),
  ),

  part(
    "json-schema",
    "JSON Schema for bodies",
    explain(
      "Bodies are described with [[json-schema|JSON Schema]]: a JSON object that says what valid JSON looks like. `type` gives the kind of value, `required` lists the fields that must be there, and keywords like `maxLength`, `minimum`, `pattern` and `format` narrow it down.",
    ),
    code(
      "json",
      "A new note's schema",
      [
        '"NewNote": {',
        '  "type": "object",',
        '  "required": ["title"],',
        '  "properties": {',
        '    "title": {',
        '      "type": "string",',
        '      "pattern": "\\\\S",',
        '      "maxLength": 100',
        "    },",
        '    "content": {',
        '      "type": "string",',
        '      "maxLength": 10000',
        "    }",
        "  }",
        "}",
      ],
      {
        3: "required sits on the object, not the field",
        7: "at least one character that isn't a space",
        12: "content is optional: not in required",
      },
    ),
    quickCheck(
      'A schema has `"required": ["title"]` and `title` has `"maxLength": 100`. Which body is valid?',
      [
        '`{ "content": "2 litres" }`',
        '`{ "title": "Milk" }`',
        '`{ "title": 42 }`',
      ],
      1,
      "The first has no title, and 42 isn't a string. A title of four characters is present, a string and under 100.",
    ),
  ),

  part(
    "refs",
    "Reusing schemas with $ref",
    explain(
      'Write a shape once under `components/schemas` and point at it with `{ "$ref": "#/components/schemas/Note" }`. The `#` means “this document”; the rest is the path inside it. Tools follow the reference as if the schema were written there. Here is a function that finds the schema for one response.',
    ),
    trace(
      "Finding POST /api/notes' 201 schema",
      [
        "function schemaFor(api, path, method, status) {",
        "  const op = api.paths[path][method];",
        "  const res = op.responses[status];",
        '  const json = res.content["application/json"];',
        "  const ref = json.schema.$ref;",
        "  if (!ref) return json.schema;",
        '  const name = ref.split("/").pop();',
        "  return api.components.schemas[name];",
        "}",
        'schemaFor(api, "/api/notes", "post", "201");',
      ],
      [
        {
          line: 10,
          note: "Ask for the body schema of a 201 from POST /api/notes.",
          vars: [["api", "{ openapi, paths, components }"]],
        },
        {
          line: 2,
          note: "Look up the path, then the method under it.",
          vars: [
            ["api", "{ openapi, paths, components }"],
            ["op", "{ requestBody, responses }"],
          ],
          stack: ["schemaFor"],
        },
        {
          line: 4,
          note: "The 201 response, then its JSON body.",
          vars: [
            ["api", "{ openapi, paths, components }"],
            ["op", "{ requestBody, responses }"],
            ["res", '{ description: "The new note", content }'],
            ["json", "{ schema: { $ref } }"],
          ],
          stack: ["schemaFor"],
        },
        {
          line: 5,
          note: "The schema is only a reference.",
          vars: [
            ["api", "{ openapi, paths, components }"],
            ["op", "{ requestBody, responses }"],
            ["res", '{ description: "The new note", content }'],
            ["json", "{ schema: { $ref } }"],
            ["ref", '"#/components/schemas/Note"'],
          ],
          stack: ["schemaFor"],
        },
        {
          line: 7,
          note: "The last part of the path is the schema's name.",
          vars: [
            ["api", "{ openapi, paths, components }"],
            ["op", "{ requestBody, responses }"],
            ["res", '{ description: "The new note", content }'],
            ["json", "{ schema: { $ref } }"],
            ["ref", '"#/components/schemas/Note"'],
            ["name", '"Note"'],
          ],
          stack: ["schemaFor"],
        },
        {
          line: 8,
          note: "Follow it to the shared Note schema, defined once for every response that returns a note.",
          vars: [
            ["api", "{ openapi, paths, components }"],
            ["name", '"Note"'],
          ],
          stack: ["schemaFor"],
          output: '{ type: "object", properties: {…} }',
        },
      ],
    ),
  ),

  part(
    "tools",
    "What tools do with it",
    explain(
      "Once the API is described, tools do the repetitive work. That's the real payoff: the description stops being a document people forget to update and becomes something the build depends on.",
    ),
    reference("Built from one OpenAPI file", [
      [
        "Docs",
        "Interactive pages to read and try each call.",
        "Swagger UI, Redoc",
      ],
      [
        "Clients",
        "Generated functions or types for the front end.",
        "openapi-typescript, openapi-generator",
      ],
      ["Mock server", "Fake answers before the server exists.", "Prism"],
      [
        "Validation",
        "Reject requests that break the schema with 400.",
        "express-openapi-validator",
      ],
      [
        "Contract tests",
        "Check the real server's answers match the file.",
        "Schemathesis",
      ],
      ["Linting", "Check the file for mistakes and style.", "Spectral"],
    ]),
  ),

  part(
    "design-first",
    "Design-first or code-first",
    explain(
      "Design-first: write the OpenAPI file, agree on it, then build both sides against it. Changes are discussed before they're coded, and [[breaking-change|breaking changes]] are easy to spot in review. Code-first: write the server, then generate the file from annotations or route definitions. Faster to start, but the API's design is whatever the code happened to be.",
    ),
    reference("Two ways to get the file", [
      [
        "Design-first",
        "Write the file, review it, then code.",
        "PR: openapi.json adds GET /notes/{id}",
      ],
      [
        "Code-first",
        "Code, then generate the file from it.",
        "Schemas in code → openapi.json",
      ],
    ]),
    quickCheck(
      "The mobile team wants to start on a new endpoint before the server exists. Which approach helps most?",
      [
        "Code-first: wait for the server, then generate the file",
        "Design-first: agree the file, then they use a mock server",
        "Neither: they should read the server code",
      ],
      1,
      "With the description agreed first, a mock server can answer from it at once, and both teams build against the same contract.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App",
    explain(
      "The Notes App has no OpenAPI file: its contract lives in the code. Read from `createNote`, POST /api/notes needs a title (at most 100 characters after trimming) and optional content (text, at most 10,000). It answers 201 with the note, 400 with `{ error }` from `validateNote`, and 401 when the login cookie is missing.",
    ),
    inTheNotesApp(
      "`validateNote` holds the rules a NewNote schema would describe: title required, lengths capped, content text.",
      { fileId: "backend/src/validation/noteValidation.js" },
    ),
    code(
      "json",
      "Its responses (not in the Notes App)",
      [
        '"responses": {',
        '  "201": { "description": "The note",',
        '    "content": { "application/json": {',
        '      "schema": {',
        '        "$ref": "#/components/schemas/Note"',
        "      } } } },",
        '  "400": { "description": "Invalid note",',
        '    "content": { "application/json": {',
        '      "schema": {',
        '        "$ref": "#/components/schemas/Error"',
        "      } } } },",
        '  "401": { "description": "Please log in" }',
        "}",
      ],
      {
        5: "id, title, content, created_at, updated_at",
        10: '{ "error": "Title is required" }',
        12: "from requireAuth, before createNote runs",
      },
    ),
    keyPoints(
      "JSON Schema can't trim, so `pattern` only approximates the title rule.",
      "The login cookie would be a security scheme: apiKey, in cookie, named token.",
      "A contract test would catch the file and the code drifting apart.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Express-style paths",
      language: "json",
      wrong: ['"/api/notes/:id": { "put": {…} }'],
      problem:
        "OpenAPI doesn't know `:id`, so tools treat it as a fixed path that literally contains “:id”.",
      right: ['"/api/notes/{id}": { "put": {…} }'],
      why: "Path parameters go in curly braces, and need a matching entry in `parameters`.",
    }),
    mistake({
      title: "required on the field",
      language: "json",
      wrong: [
        '"properties": {',
        '  "title": { "type": "string", "required": true }',
        "}",
      ],
      problem:
        "In JSON Schema, `required` is a list on the object. On a property it's ignored, so a missing title passes.",
      right: [
        '"required": ["title"],',
        '"properties": {',
        '  "title": { "type": "string" }',
        "}",
      ],
      why: "List required field names on the object that contains them.",
    }),
    mistake({
      title: "Only the happy path",
      language: "json",
      wrong: ['"responses": {', '  "201": { "description": "Created" }', "}"],
      problem:
        "Clients can't know what a failure looks like, so each one guesses how to read errors.",
      right: [
        '"responses": {',
        '  "201": { "description": "Created" },',
        '  "400": { "description": "Invalid note" },',
        '  "401": { "description": "Please log in" }',
        "}",
      ],
      why: "Every status the endpoint can send belongs in the contract, with its body.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A tiny schema checker",
      task: 'Write `check(schema, value)` returning a list of problems. First, for each name in `schema.required` missing from `value`: `"<name> is required"`. Then, for each entry in `schema.properties` that is present: `"<name> must be a <type>"` if `typeof` differs, else `"<name> is too long"` if it\'s longer than `maxLength`.',
      starter: [
        "function check(schema, value) {",
        "  const errors = [];",
        "",
        "  return errors;",
        "}",
      ],
      tests: [
        [
          'check({ required: ["title"], properties: { title: { type: "string", maxLength: 100 } } }, { title: "Milk" })',
          "[]",
        ],
        [
          'check({ required: ["title"], properties: { title: { type: "string", maxLength: 100 } } }, {})',
          '["title is required"]',
        ],
        [
          'check({ required: ["title"], properties: { title: { type: "string", maxLength: 100 } } }, { title: 5 })',
          '["title must be a string"]',
        ],
        [
          'check({ properties: { title: { type: "string", maxLength: 3 }, content: { type: "string" } } }, { title: "Milk", content: 7 })',
          '["title is too long", "content must be a string"]',
        ],
      ],
      hint: "Two loops: `for (const name of schema.required ?? [])`, then `Object.entries(schema.properties ?? {})`. Skip properties that aren't `in value`.",
      solution: [
        "function check(schema, value) {",
        "  const errors = [];",
        "  for (const name of schema.required ?? [])",
        "    if (!(name in value)) errors.push(`${name} is required`);",
        "  const props = Object.entries(schema.properties ?? {});",
        "  for (const [name, rule] of props) {",
        "    if (!(name in value)) continue;",
        "    if (typeof value[name] !== rule.type) {",
        "      errors.push(`${name} must be a ${rule.type}`);",
        "    } else if (value[name].length > rule.maxLength) {",
        "      errors.push(`${name} is too long`);",
        "    }",
        "  }",
        "  return errors;",
        "}",
      ],
    }),
    yourTurn({
      title: "List the operations",
      task: 'Write `listOperations(api)`: for every path in `api.paths` and every method under it, in order, a string like `"POST /api/notes"` (method in capitals).',
      starter: ["function listOperations(api) {", "  return [];", "}"],
      tests: [
        [
          'listOperations({ paths: { "/api/notes": { get: {}, post: {} }, "/api/notes/{id}": { put: {}, delete: {} } } })',
          '["GET /api/notes", "POST /api/notes", "PUT /api/notes/{id}", "DELETE /api/notes/{id}"]',
        ],
        [
          'listOperations({ paths: { "/api/health": { get: {} } } })',
          '["GET /api/health"]',
        ],
        ["listOperations({ paths: {} })", "[]"],
      ],
      hint: "Loop over `Object.entries(api.paths)`, then over `Object.keys` of each path's object, and use `method.toUpperCase()`.",
      solution: [
        "function listOperations(api) {",
        "  const ops = [];",
        "  for (const [path, item] of Object.entries(api.paths)) {",
        "    for (const method of Object.keys(item)) {",
        "      ops.push(`${method.toUpperCase()} ${path}`);",
        "    }",
        "  }",
        "  return ops;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("OpenAPI cheat sheet", [
      ["openapi", "The format's version.", '"openapi": "3.1.0"'],
      ["info", "Your API's title and version.", '"info": { "title": "Notes" }'],
      [
        "paths",
        "Each URL, then each method.",
        '"/api/notes/{id}": { "put": … }',
      ],
      ["parameters", "name, in, required, schema.", '"in": "path"'],
      [
        "requestBody",
        "What the client sends, by media type.",
        '"application/json"',
      ],
      ["responses", "Every status code, with its body.", '"201", "400", "401"'],
      ["components", "Shared schemas and more.", '"schemas": { "Note": … }'],
      ["$ref", "Point at a shared piece.", '"#/components/schemas/Note"'],
      [
        "JSON Schema",
        "type, required, maxLength, pattern…",
        '"required": ["title"]',
      ],
    ]),
    quickCheck(
      "Why might a team generate its front-end API functions from the OpenAPI file?",
      [
        "Generated code is always faster",
        "The functions match the contract, and change when it changes",
        "OpenAPI files can't be read by people",
      ],
      1,
      "Generated clients and types come from the same file the server is checked against, so a changed field shows up as a type error instead of a bug in production.",
    ),
  ),
);

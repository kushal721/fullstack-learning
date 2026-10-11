import type { BuildStep } from "@fsl/shared";

export const testStep: BuildStep = {
  id: "test",
  slug: "test",
  order: 13,
  title: "Test the app",
  goal: "Add unit, integration and component tests and run them with one command.",
  why: "Every change can break something you aren't looking at. Tests check the important behaviour automatically in seconds, so you find a broken feature — or a reopened security hole — before your users do.",
  problemSolved:
    "Having to click through the whole app by hand after every change, and still missing what broke.",
  prerequisites: ["add-security"],
  explanation: [
    "A **test** is code that runs your code and checks the result. If the result is different from what you expect, the test fails and tells you exactly what was wrong. **Vitest** runs the tests in both the frontend and the backend.",
    "**Unit tests** check one small piece in isolation, such as `validateNote`: give it input, check the output. They are fast and pinpoint the bug.",
    "**Integration tests** check several pieces working together. `notes.test.js` sends real HTTP requests to the real Express app (with **Supertest**, without opening a port) and uses a real PostgreSQL database. It proves the routes, middleware, controllers, SQL and database rules agree — including that Ben can never see or change Ana's notes.",
    "The integration tests use a **separate database**, `notes_test`, because they delete all data before every test so each one starts from the same known state. Never point tests at data you care about.",
    "**Component tests** render a React component in a fake browser (**jsdom**) and use it like a person would with **Testing Library**: type into the field labelled *Title*, click *Save*. The real API is replaced by a **mock** (`vi.mock`), so the test needs no server and can also pretend the API failed.",
    "What to test first: the things that would hurt most if they broke — validation, who may see which notes, saving a note. Don't test the framework itself (that React renders a `<p>`), test *your* behaviour.",
  ],
  howToCreate: [
    {
      text: "Backend first. In the second terminal (in `notes-app/backend` since step 12), install Vitest and Supertest as development dependencies (`-D`: needed for working on the app, not for running it).",
      code: {
        language: "bash",
        code: "npm install -D supertest vitest",
      },
    },
    {
      text: 'Add a `"test": "vitest run"` line to the `scripts` in `package.json` (after `"preview"` in the frontend, after `"start"` in the backend), so `npm test` runs the tests. The backend\'s scripts then look like this:',
      code: {
        language: "json",
        code: '"scripts": {\n    "dev": "node --env-file=.env --watch src/server.js",\n    "start": "node src/server.js",\n    "test": "vitest run"\n  }',
        caption: "Only the `scripts` part of `backend/package.json` is shown.",
      },
    },
    {
      text: "Create a unit test next to the file it tests: `src/validation/noteValidation.test.js`. `it.each` runs the same test for several inputs.",
      code: {
        language: "js",
        code: 'import { describe, expect, it } from "vitest";\nimport { validateNote } from "./noteValidation.js";\n\ndescribe("validateNote", () => {\n  it("accepts a note with a title", () => {\n    expect(\n      validateNote({ title: "Shopping", content: "Milk" }),\n    ).toBeUndefined();\n  });\n\n  it("accepts a note without content", () => {\n    expect(validateNote({ title: "Shopping" })).toBeUndefined();\n  });\n\n  it.each([{}, { title: "" }, { title: "   " }, { title: 42 }, null])(\n    "requires a title: %j",\n    (body) => {\n      expect(validateNote(body)).toBe("Title is required");\n    },\n  );\n\n  it("limits the title to 100 characters", () => {\n    expect(validateNote({ title: "a".repeat(100) })).toBeUndefined();\n    expect(validateNote({ title: "a".repeat(101) })).toBe(\n      "Title must be at most 100 characters",\n    );\n  });\n\n  it("limits the content to 10000 characters", () => {\n    expect(validateNote({ title: "x", content: "a".repeat(10001) })).toBe(\n      "Content must be at most 10000 characters",\n    );\n  });\n});',
        fileName: "backend/src/validation/noteValidation.test.js",
      },
    },
    {
      text: "Create the integration test `src/routes/notes.test.js`. `cookieFor` makes a login cookie the same way the login route does, so each test can act as Ana or Ben.",
      code: {
        language: "js",
        code: '// Integration tests: real Express app, real PostgreSQL. They use a separate\n// database (notes_test) so they can delete everything between tests.\n//\n//   createdb notes_test  (or: docker exec notes-db createdb -U postgres notes_test)\n//   npm test\nimport { readFileSync } from "node:fs";\nimport jwt from "jsonwebtoken";\nimport request from "supertest";\nimport { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";\n\nprocess.env.DATABASE_URL ??=\n  "postgres://postgres:dev@localhost:5432/notes_test";\nprocess.env.JWT_SECRET ??= "test-secret";\n\n// Imported after the variables are set, because db.js reads them on import.\nconst { pool } = await import("../db.js");\nconst { createApp } = await import("../app.js");\nconst app = createApp();\n\nconst schema = readFileSync(\n  new URL("../../../database/schema.sql", import.meta.url),\n  "utf8",\n);\n\n// A login cookie for a user, as the login route would set it.\nfunction cookieFor(userId) {\n  return `token=${jwt.sign({ sub: userId }, process.env.JWT_SECRET)}`;\n}\n\nlet ana;\nlet ben;\n\nbeforeAll(async () => {\n  await pool.query("DROP TABLE IF EXISTS notes, users");\n  await pool.query(schema);\n});\n\nbeforeEach(async () => {\n  await pool.query("TRUNCATE notes, users RESTART IDENTITY");\n  const users = await pool.query(\n    `INSERT INTO users (email, password_hash)\n     VALUES (\'ana@example.com\', \'x\'), (\'ben@example.com\', \'x\')\n     RETURNING id`,\n  );\n  [ana, ben] = users.rows.map((row) => row.id);\n});\n\nafterAll(async () => {\n  await pool.end();\n});\n\ndescribe("notes API", () => {\n  it("rejects requests without a login cookie", async () => {\n    const res = await request(app).get("/api/notes");\n    expect(res.status).toBe(401);\n    expect(res.body).toEqual({ error: "Please log in" });\n  });\n\n  it("creates a note for the logged-in user", async () => {\n    const res = await request(app)\n      .post("/api/notes")\n      .set("Cookie", cookieFor(ana))\n      .send({ title: "Shopping", content: "Milk" });\n\n    expect(res.status).toBe(201);\n    expect(res.body).toMatchObject({ title: "Shopping", content: "Milk" });\n\n    const list = await request(app)\n      .get("/api/notes")\n      .set("Cookie", cookieFor(ana));\n    expect(list.body.map((note) => note.title)).toEqual(["Shopping"]);\n  });\n\n  it("returns 400 for an invalid note", async () => {\n    const res = await request(app)\n      .post("/api/notes")\n      .set("Cookie", cookieFor(ana))\n      .send({ title: "" });\n    expect(res.status).toBe(400);\n    expect(res.body).toEqual({ error: "Title is required" });\n  });\n\n  it("never shows or changes another user\'s notes", async () => {\n    const created = await request(app)\n      .post("/api/notes")\n      .set("Cookie", cookieFor(ana))\n      .send({ title: "Private" });\n    const id = created.body.id;\n\n    const list = await request(app)\n      .get("/api/notes")\n      .set("Cookie", cookieFor(ben));\n    expect(list.body).toEqual([]);\n\n    const update = await request(app)\n      .put(`/api/notes/${id}`)\n      .set("Cookie", cookieFor(ben))\n      .send({ title: "Hacked" });\n    expect(update.status).toBe(404);\n\n    const remove = await request(app)\n      .delete(`/api/notes/${id}`)\n      .set("Cookie", cookieFor(ben));\n    expect(remove.status).toBe(404);\n  });\n\n  it("updates and deletes the user\'s own note", async () => {\n    const created = await request(app)\n      .post("/api/notes")\n      .set("Cookie", cookieFor(ana))\n      .send({ title: "Draft" });\n    const id = created.body.id;\n\n    const update = await request(app)\n      .put(`/api/notes/${id}`)\n      .set("Cookie", cookieFor(ana))\n      .send({ title: "Final", content: "Done" });\n    expect(update.status).toBe(200);\n    expect(update.body).toMatchObject({ id, title: "Final", content: "Done" });\n\n    const remove = await request(app)\n      .delete(`/api/notes/${id}`)\n      .set("Cookie", cookieFor(ana));\n    expect(remove.status).toBe(204);\n  });\n\n  it("treats a malformed id as not found, not a server error", async () => {\n    const res = await request(app)\n      .delete("/api/notes/0%20OR%20true")\n      .set("Cookie", cookieFor(ana));\n    expect(res.status).toBe(404);\n  });\n});\n\ndescribe("auth API", () => {\n  it("registers, logs in with a cookie, and rejects a wrong password", async () => {\n    const register = await request(app)\n      .post("/api/auth/register")\n      .send({ email: "Cara@Example.com", password: "long-password" });\n    expect(register.status).toBe(201);\n    expect(register.body.email).toBe("cara@example.com");\n\n    const duplicate = await request(app)\n      .post("/api/auth/register")\n      .send({ email: "cara@example.com", password: "long-password" });\n    expect(duplicate.status).toBe(409);\n\n    const login = await request(app)\n      .post("/api/auth/login")\n      .send({ email: "cara@example.com", password: "long-password" });\n    expect(login.status).toBe(200);\n    const cookie = login.headers["set-cookie"][0];\n    expect(cookie).toMatch(/^token=.+; .*HttpOnly/);\n    expect(cookie).toMatch(/SameSite=Lax/);\n\n    const me = await request(app)\n      .get("/api/auth/me")\n      .set("Cookie", cookie.split(";")[0]);\n    expect(me.body.email).toBe("cara@example.com");\n\n    const wrong = await request(app)\n      .post("/api/auth/login")\n      .send({ email: "cara@example.com", password: "nope-nope" });\n    expect(wrong.status).toBe(401);\n    expect(wrong.body).toEqual({ error: "Invalid email or password" });\n  });\n});',
        fileName: "backend/src/routes/notes.test.js",
        caption:
          "Read the test names: together they describe what the API promises.",
      },
    },
    {
      text: "Create the test database once, inside the PostgreSQL container from step 10.",
      code: {
        language: "bash",
        code: "docker exec notes-db createdb -U postgres notes_test",
        caption:
          "If the container isn't running, start it first with `docker start notes-db`.",
      },
    },
    {
      text: "Run the backend tests.",
      code: {
        language: "bash",
        code: "npm test",
        caption: "Expected: `Test Files  2 passed` and `Tests  16 passed`.",
      },
    },
    {
      text: "Now the frontend. Go to the frontend folder and install Vitest, jsdom and Testing Library.",
      code: {
        language: "bash",
        code: "cd ../frontend\nnpm install -D @testing-library/jest-dom @testing-library/react @testing-library/user-event jsdom vitest",
      },
    },
    {
      text: 'Add a `"test": "vitest run"` line to the `scripts` in `package.json` (after `"preview"` in the frontend, after `"start"` in the backend), so `npm test` runs the tests. The frontend\'s scripts then look like this:',
      code: {
        language: "json",
        code: '"scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview",\n    "test": "vitest run"\n  }',
        caption: "Only the `scripts` part of `frontend/package.json` is shown.",
      },
    },
    {
      text: "Replace `vite.config.js` to add the test settings: run tests in jsdom and load a setup file first.",
      code: {
        language: "js",
        code: 'import react from "@vitejs/plugin-react";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    // The React app runs on port 5173 and the API on port 3000. Forwarding\n    // /api to the API makes both look like one website to the browser, so\n    // the login cookie is sent with every request.\n    proxy: {\n      "/api": "http://localhost:3000",\n    },\n  },\n  test: {\n    environment: "jsdom",\n    setupFiles: ["./src/test-setup.js"],\n  },\n});',
        fileName: "frontend/vite.config.js",
        caption: "Final version.",
      },
    },
    {
      text: "Create `src/test-setup.js`, which runs before every test file.",
      code: {
        language: "js",
        code: '// Runs before every test file.\nimport "@testing-library/jest-dom/vitest";\nimport { cleanup } from "@testing-library/react";\nimport { afterEach, vi } from "vitest";\n\n// Remove what the previous test rendered and reset mocks, so each test\n// starts from an empty page.\nafterEach(() => {\n  cleanup();\n  vi.clearAllMocks();\n});',
        fileName: "frontend/src/test-setup.js",
        caption: "Final version.",
      },
    },
    {
      text: "Create the component test `src/components/NoteForm.test.jsx`.",
      code: {
        language: "jsx",
        code: 'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport { describe, expect, it, vi } from "vitest";\nimport { createNote } from "../services/notesApi.js";\nimport NoteForm from "./NoteForm.jsx";\n\n// Replace the real API call, so the test needs no server.\nvi.mock("../services/notesApi.js", () => ({ createNote: vi.fn() }));\n\ndescribe("NoteForm", () => {\n  it("saves the note, reports it and clears the form", async () => {\n    const saved = { id: 1, title: "Shopping", content: "Milk" };\n    createNote.mockResolvedValue(saved);\n    const onSaved = vi.fn();\n    render(<NoteForm onSaved={onSaved} />);\n\n    await userEvent.type(screen.getByLabelText("Title"), "Shopping");\n    await userEvent.type(screen.getByLabelText("Note"), "Milk");\n    await userEvent.click(screen.getByRole("button", { name: "Save" }));\n\n    expect(createNote).toHaveBeenCalledWith({\n      title: "Shopping",\n      content: "Milk",\n    });\n    expect(onSaved).toHaveBeenCalledWith(saved);\n    expect(screen.getByLabelText("Title")).toHaveValue("");\n  });\n\n  it("shows the error and keeps the text when saving fails", async () => {\n    createNote.mockRejectedValue(new Error("Title is required"));\n    render(<NoteForm onSaved={vi.fn()} />);\n\n    await userEvent.type(screen.getByLabelText("Title"), "Draft");\n    await userEvent.click(screen.getByRole("button", { name: "Save" }));\n\n    expect(await screen.findByRole("alert")).toHaveTextContent(\n      "Title is required",\n    );\n    expect(screen.getByLabelText("Title")).toHaveValue("Draft");\n  });\n});',
        fileName: "frontend/src/components/NoteForm.test.jsx",
      },
    },
    {
      text: "Run the frontend tests.",
      code: {
        language: "bash",
        code: "npm test",
        caption: "Expected: `Test Files  1 passed` and `Tests  2 passed`.",
      },
    },
    {
      text: "See a test protect you. In `backend/src/controllers/notesController.js`, reopen the step 12 hole in `updateNote`: change `WHERE id = $3 AND user_id = $4` to `WHERE id = $3`, and remove `req.user.id` from the list of values below it (the query now has three values). Run `npm test` in the backend: exactly one test fails — *never shows or changes another user's notes*, with `expected 200 to be 404`. Undo both changes and run the tests again: all 16 pass.",
      code: {
        language: "js",
        code: "// Broken on purpose, only for this check:\n      WHERE id = $3\n      RETURNING id, title, content, created_at, updated_at`,\n    [title.trim(), content, id],",
        caption:
          "If you only delete ` AND user_id = $4` and keep four values, PostgreSQL rejects the query itself and different tests fail with a server error — tests catch that kind of slip too.",
      },
    },
  ],
  fromScratch: [
    'Install Vitest (`npm install -D vitest`) and add `"test": "vitest run"` to `package.json`; put each test file next to the file it tests as `name.test.js`.',
    "Write unit tests for pure logic (validation, calculations) first: they are quick to write and quick to run.",
    "For an API, add integration tests with Supertest against the app from `createApp()`, using a separate test database that is reset before each test.",
    "For React, use jsdom and Testing Library, find elements by label or role like a user would, and mock the API module.",
    "Always write a test for every security rule (\"user B can't change user A's data\"), and run all tests before every commit — later, CI runs them for you.",
  ],
  filesCreated: [
    "backend/src/validation/noteValidation.test.js",
    "backend/src/routes/notes.test.js",
    "frontend/src/components/NoteForm.test.jsx",
    "frontend/src/test-setup.js",
  ],
  filesModified: [
    "backend/package.json",
    "backend/package-lock.json",
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/vite.config.js",
  ],
  filesRemoved: [],
  conceptIds: ["why-test", "unit-test", "integration-test"],
  codeExamples: [
    {
      language: "js",
      code: 'expect(validateNote({ title: "a".repeat(101) })).toBe(\n  "Title must be at most 100 characters",\n);',
      fileName: "backend/src/validation/noteValidation.test.js",
      caption: "A unit test: one input, one expected output.",
    },
    {
      language: "js",
      code: 'const update = await request(app)\n  .put(`/api/notes/${id}`)\n  .set("Cookie", cookieFor(ben))\n  .send({ title: "Hacked" });\nexpect(update.status).toBe(404);',
      fileName: "backend/src/routes/notes.test.js",
      caption:
        "An integration test that keeps the step 12 security fix in place forever.",
    },
    {
      language: "jsx",
      code: 'await userEvent.type(screen.getByLabelText("Title"), "Shopping");\nawait userEvent.click(screen.getByRole("button", { name: "Save" }));',
      fileName: "frontend/src/components/NoteForm.test.jsx",
      caption: "A component test uses the form the way a person does.",
    },
  ],
  relationshipIds: [],
  enables:
    "Change the code with confidence: one command tells you within seconds whether anything important broke.",
  commonMistakes: [
    "Running the integration tests against the development database. They delete all data before each test; always use `notes_test`.",
    'Forgetting to create `notes_test`, so the tests fail with "database \\"notes_test\\" does not exist".',
    "Testing implementation details (class names, internal state) instead of behaviour. The tests then break on every harmless change and nobody trusts them.",
    "Letting component tests call the real API. They become slow and fail whenever the server is down; mock the service module.",
    "Writing tests only for the happy path. The bugs that matter most — invalid input, someone else's data, a failing server — are on the other paths.",
  ],
  nextStepId: "deploy",
  nextWhy:
    "Everything works and is tested on your computer. The last step puts the Notes App on the internet so other people can use it.",
};

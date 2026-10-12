import type { BuildStep } from "@fsl/shared";

export const addApiCommunicationStep: BuildStep = {
  id: "add-api-communication",
  slug: "add-api-communication",
  order: 7,
  title: "Add API communication",
  goal: "Load, create, edit and delete notes through an API with fetch, using one service file.",
  why: "Data that should last — and be private — must live on a server. Putting every request in a service file means components never deal with URLs, HTTP methods or JSON; they just call `getNotes()` or `createNote()`.",
  problemSolved:
    "Notes that disappear on reload, and components that would otherwise be full of fetch calls, URLs and error handling.",
  prerequisites: ["add-state"],
  explanation: [
    "An **API** (here a REST API) is a set of URLs a server answers. The Notes App uses four: `GET /api/notes` (list), `POST /api/notes` (create), `PUT /api/notes/:id` (update) and `DELETE /api/notes/:id` (delete). The HTTP **method** says what to do; the URL says to which thing.",
    "`fetch(url, options)` sends an HTTP request from the browser and returns a **Promise**: a value that arrives later. `await` pauses an `async` function until the Promise is ready, so asynchronous code reads top to bottom. Data travels as **JSON**: `JSON.stringify` turns an object into text for the request, and `response.json()` turns the answer back into an object.",
    '`fetch` only fails when the network fails. A *404* or *500* answer is still a "successful" fetch, so `request.js` checks `response.ok` and throws an error with the server\'s message. Every API call goes through that one function, so this is written once.',
    "`notesApi.js` has one small function per endpoint. Components and hooks import those functions and never see a URL.",
    'Loading data is a **side effect**: something outside React\'s drawing. `useEffect(() => { … }, [])` runs after the component first appears; the empty array means "only once". The cleanup function sets `ignore = true`, so a late answer for a component that has already gone is thrown away.',
    "The frontend runs on port 5173 and the API will run on port 3000. Vite's **proxy** forwards every request starting with `/api` to port 3000, so the browser sees one website. There is no backend yet, so in this step the requests fail — and you'll see the app handle that failure properly.",
  ],
  howToCreate: [
    {
      text: "Replace `vite.config.js` to forward `/api` requests to the backend on port 3000. Stop `npm run dev` (Ctrl+C) and start it again: config changes need a restart.",
      code: {
        language: "js",
        code: 'import react from "@vitejs/plugin-react";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    // The React app runs on port 5173 and the API on port 3000. Forwarding\n    // /api to the API makes both look like one website to the browser, so\n    // the login cookie is sent with every request.\n    proxy: {\n      "/api": "http://localhost:3000",\n    },\n  },\n});',
        fileName: "frontend/vite.config.js",
        caption: "Step 13 adds the test settings to this file.",
      },
    },
    {
      text: "Create the services folder and `src/services/request.js`, the single function every API call goes through.",
      code: {
        language: "bash",
        code: "mkdir src/services",
      },
    },
    {
      text: "Write `request.js`.",
      code: {
        language: "js",
        code: '// Every API call goes through this one function, so sending cookies,\n// reading JSON and turning error responses into errors is written once.\nexport async function request(path, { method = "GET", body } = {}) {\n  const response = await fetch(path, {\n    method,\n    // Send the login cookie with the request.\n    credentials: "include",\n    headers: body ? { "Content-Type": "application/json" } : undefined,\n    body: body ? JSON.stringify(body) : undefined,\n  });\n\n  // 204 No Content: success, but there is no body to read.\n  if (response.status === 204) return null;\n\n  const data = await response.json().catch(() => null);\n\n  // fetch() only fails when the network does; a 400 or 500 still "succeeds",\n  // so check the status and throw the server\'s message ourselves.\n  if (!response.ok) {\n    throw new Error(data?.error ?? "Something went wrong");\n  }\n  return data;\n}',
        fileName: "frontend/src/services/request.js",
        caption:
          'Final version. `credentials: "include"` sends the login cookie, which matters from step 11.',
      },
    },
    {
      text: "Create `src/services/notesApi.js` with one function per endpoint.",
      code: {
        language: "js",
        code: 'import { request } from "./request.js";\n\nexport function getNotes() {\n  return request("/api/notes");\n}\n\nexport function createNote({ title, content }) {\n  return request("/api/notes", { method: "POST", body: { title, content } });\n}\n\nexport function updateNote(id, { title, content }) {\n  return request(`/api/notes/${id}`, {\n    method: "PUT",\n    body: { title, content },\n  });\n}\n\nexport function deleteNote(id) {\n  return request(`/api/notes/${id}`, { method: "DELETE" });\n}',
        fileName: "frontend/src/services/notesApi.js",
        caption: "Final version.",
      },
    },
    {
      text: "Replace `src/hooks/useNotes.js`. The sample data is gone: the hook loads notes with `getNotes()` in a `useEffect`, tracks loading and errors, and deletes through the API before updating the list.",
      code: {
        language: "js",
        code: 'import { useEffect, useState } from "react";\nimport { deleteNote, getNotes } from "../services/notesApi.js";\n\n// Owns the list of notes so components only decide what to show.\nexport function useNotes() {\n  const [notes, setNotes] = useState([]);\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  // Load the notes once, when the component using this hook appears.\n  useEffect(() => {\n    let ignore = false;\n    getNotes()\n      .then((loaded) => {\n        if (!ignore) setNotes(loaded);\n      })\n      .catch((err) => {\n        if (!ignore) setError(err.message);\n      })\n      .finally(() => {\n        if (!ignore) setIsLoading(false);\n      });\n    // If the component disappears first, ignore the late response.\n    return () => {\n      ignore = true;\n    };\n  }, []);\n\n  // New arrays every time: React only re-renders when state is a new value.\n  function addNote(note) {\n    setNotes((current) => [note, ...current]);\n  }\n\n  function replaceNote(updated) {\n    setNotes((current) =>\n      current.map((note) => (note.id === updated.id ? updated : note)),\n    );\n  }\n\n  async function removeNote(id) {\n    await deleteNote(id);\n    setNotes((current) => current.filter((note) => note.id !== id));\n  }\n\n  return { notes, isLoading, error, addNote, replaceNote, removeNote };\n}',
        fileName: "frontend/src/hooks/useNotes.js",
        caption: "Final version.",
      },
    },
    {
      text: "Replace `src/components/NoteForm.jsx` so saving sends the note to the API with `createNote`, shows *Saving…* while waiting and shows the server's error message if it fails.",
      code: {
        language: "jsx",
        code: 'import { useState } from "react";\nimport { createNote } from "../services/notesApi.js";\nimport Button from "./Button.jsx";\nimport Input from "./Input.jsx";\n\nexport default function NoteForm({ onSaved }) {\n  // Controlled inputs: the text lives in state, so we can read it on save\n  // and clear it afterwards.\n  const [title, setTitle] = useState("");\n  const [content, setContent] = useState("");\n  const [isSaving, setIsSaving] = useState(false);\n  const [error, setError] = useState(null);\n\n  async function handleSave(event) {\n    // Stop the browser from reloading the page; we send the data ourselves.\n    event.preventDefault();\n    setIsSaving(true);\n    setError(null);\n    try {\n      const note = await createNote({ title, content });\n      onSaved(note);\n      setTitle("");\n      setContent("");\n    } catch (err) {\n      setError(err.message);\n    } finally {\n      setIsSaving(false);\n    }\n  }\n\n  return (\n    <form className="note-form" onSubmit={handleSave}>\n      <Input\n        id="note-title"\n        label="Title"\n        value={title}\n        onChange={(event) => setTitle(event.target.value)}\n        maxLength={100}\n        required\n      />\n      <Input\n        id="note-content"\n        label="Note"\n        multiline\n        rows={4}\n        value={content}\n        onChange={(event) => setContent(event.target.value)}\n      />\n      {error && (\n        <p className="form-error" role="alert">\n          {error}\n        </p>\n      )}\n      <Button type="submit" disabled={isSaving}>\n        {isSaving ? "Saving…" : "Save"}\n      </Button>\n    </form>\n  );\n}',
        fileName: "frontend/src/components/NoteForm.jsx",
        caption: "Final version.",
      },
    },
    {
      text: "Replace `src/components/NoteCard.jsx` to add editing: *Edit* switches the card into a small form, and *Save* sends the change with `updateNote`.",
      code: {
        language: "jsx",
        code: 'import { useState } from "react";\nimport { updateNote } from "../services/notesApi.js";\nimport Button from "./Button.jsx";\nimport Input from "./Input.jsx";\n\nexport default function NoteCard({ note, onUpdated, onDelete }) {\n  const [isEditing, setIsEditing] = useState(false);\n  const [title, setTitle] = useState(note.title);\n  const [content, setContent] = useState(note.content);\n  const [error, setError] = useState(null);\n\n  function startEditing() {\n    // Start from the saved values, not from an earlier unsaved edit.\n    setTitle(note.title);\n    setContent(note.content);\n    setError(null);\n    setIsEditing(true);\n  }\n\n  async function handleUpdate(event) {\n    event.preventDefault();\n    try {\n      const updated = await updateNote(note.id, { title, content });\n      onUpdated(updated);\n      setIsEditing(false);\n    } catch (err) {\n      setError(err.message);\n    }\n  }\n\n  if (isEditing) {\n    return (\n      <article className="note-card">\n        <form onSubmit={handleUpdate}>\n          <Input\n            id={`title-${note.id}`}\n            label="Title"\n            value={title}\n            onChange={(event) => setTitle(event.target.value)}\n            maxLength={100}\n            required\n          />\n          <Input\n            id={`content-${note.id}`}\n            label="Note"\n            multiline\n            rows={4}\n            value={content}\n            onChange={(event) => setContent(event.target.value)}\n          />\n          {error && (\n            <p className="form-error" role="alert">\n              {error}\n            </p>\n          )}\n          <div className="note-actions">\n            <Button type="submit">Save</Button>\n            <Button\n              type="button"\n              variant="secondary"\n              onClick={() => setIsEditing(false)}\n            >\n              Cancel\n            </Button>\n          </div>\n        </form>\n      </article>\n    );\n  }\n\n  return (\n    <article className="note-card">\n      <h2>{note.title}</h2>\n      {/* React escapes this text, so a note containing HTML is shown as\n          text and can never run as code (no XSS). */}\n      <p>{note.content}</p>\n      <div className="note-actions">\n        <Button type="button" variant="secondary" onClick={startEditing}>\n          Edit\n        </Button>\n        <Button\n          type="button"\n          variant="danger"\n          onClick={() => onDelete(note.id)}\n        >\n          Delete\n        </Button>\n      </div>\n    </article>\n  );\n}',
        fileName: "frontend/src/components/NoteCard.jsx",
        caption: "Final version.",
      },
    },
    {
      text: "Replace `src/pages/Dashboard.jsx` to show loading and error messages and to pass `replaceNote` to each card for edits.",
      code: {
        language: "jsx",
        code: 'import NoteCard from "../components/NoteCard.jsx";\nimport NoteForm from "../components/NoteForm.jsx";\nimport { useNotes } from "../hooks/useNotes.js";\n\n// The closest common parent of the form and the cards: it holds the shared\n// notes (through useNotes) and passes data down and callbacks down to them.\nexport default function Dashboard() {\n  const { notes, isLoading, error, addNote, replaceNote, removeNote } =\n    useNotes();\n\n  return (\n    <main className="dashboard">\n      <h1>Your notes</h1>\n      <NoteForm onSaved={addNote} />\n      {isLoading && <p>Loading notes…</p>}\n      {error && (\n        <p className="form-error" role="alert">\n          {error}\n        </p>\n      )}\n      {!isLoading && !error && notes.length === 0 && (\n        <p>No notes yet. Write your first one above.</p>\n      )}\n      <section className="notes-grid" aria-label="Notes">\n        {notes.map((note) => (\n          <NoteCard\n            key={note.id}\n            note={note}\n            onUpdated={replaceNote}\n            onDelete={removeNote}\n          />\n        ))}\n      </section>\n    </main>\n  );\n}',
        fileName: "frontend/src/pages/Dashboard.jsx",
        caption: "Final version.",
      },
    },
    {
      text: "Check it worked: reload the page. Open the browser's developer tools → **Network** tab and you'll see a request to `/api/notes`. It fails, because nothing is listening on port 3000 yet: the page shows *Your notes*, the form and a red error message, and the `npm run dev` terminal reports a proxy error (`ECONNREFUSED`). That is the correct behaviour — the frontend is ready and waiting for a backend. Seeing the request twice is normal in development: React's `StrictMode` runs effects twice on purpose to reveal missing cleanups; a production build sends it once.",
    },
  ],
  fromScratch: [
    "Write one `request(path, options)` helper around `fetch` that sets JSON headers, sends cookies, parses the response and throws on `!response.ok`.",
    "Add a service file per resource (`notesApi.js`, `authApi.js`) with one function per endpoint, so URLs live in one place.",
    "Load data in a custom hook with `useEffect(…, [])`, keeping `isLoading` and `error` in state and ignoring late responses in the cleanup.",
    "In development, use the dev server's proxy (Vite: `server.proxy`) so the frontend and API share one origin; in production serve them from the same domain.",
    'Always show the three states of remote data: loading, error and the data itself (including "nothing yet").',
  ],
  filesCreated: [
    "frontend/src/services/request.js",
    "frontend/src/services/notesApi.js",
  ],
  filesModified: [
    "frontend/vite.config.js",
    "frontend/src/hooks/useNotes.js",
    "frontend/src/components/NoteForm.jsx",
    "frontend/src/components/NoteCard.jsx",
    "frontend/src/pages/Dashboard.jsx",
  ],
  filesRemoved: [],
  conceptIds: [
    "js-fetch",
    "js-async-await",
    "json",
    "http-methods",
    "react-useeffect",
  ],
  codeExamples: [
    {
      language: "js",
      code: 'export function createNote({ title, content }) {\n  return request("/api/notes", { method: "POST", body: { title, content } });\n}',
      fileName: "frontend/src/services/notesApi.js",
      caption:
        "A component calls `createNote(…)`; only this file knows the URL and method.",
    },
    {
      language: "js",
      code: 'if (!response.ok) {\n  throw new Error(data?.error ?? "Something went wrong");\n}',
      fileName: "frontend/src/services/request.js",
      caption:
        "`fetch` doesn't throw for 400 or 500 answers, so we do — and the form or page shows the message.",
    },
    {
      language: "js",
      code: "useEffect(() => {\n  let ignore = false;\n  getNotes().then((loaded) => {\n    if (!ignore) setNotes(loaded);\n  });\n  return () => {\n    ignore = true;\n  };\n}, []);",
      fileName: "frontend/src/hooks/useNotes.js",
      caption:
        "Load once when the page appears; ignore the answer if the page has already gone (shortened).",
    },
  ],
  relationshipIds: [
    "fn:handleSave->calls->fn:notesApi.createNote",
    "fn:notesApi.createNote->calls->fn:request",
    "fn:request->calls->external:fetch",
    "external:fetch->sends->http-request:POST /api/notes",
    "fn:noteCard.handleUpdate->handles->event:noteCard.submit",
    "fn:noteCard.handleUpdate->calls->fn:notesApi.updateNote",
    "fn:useNotes.removeNote->calls->fn:notesApi.deleteNote",
    "fn:notesApi.getNotes->calls->fn:request",
    "fn:notesApi.updateNote->calls->fn:request",
    "fn:notesApi.deleteNote->calls->fn:request",
    "external:fetch->sends->http-request:GET /api/notes",
    "external:fetch->sends->http-request:PUT /api/notes/:id",
    "external:fetch->sends->http-request:DELETE /api/notes/:id",
    "component:NoteCard->renders->component:Input",
    "hook:useNotes->uses->external:useEffect",
    "hook:useNotes->calls->fn:notesApi.getNotes",
    "hook:useNotes->returns->fn:useNotes.replaceNote",
    "fn:noteCard.handleUpdate->calls->fn:useNotes.replaceNote",
    "component:NoteCard->uses->external:useState",
  ],
  enables:
    "Talk to an API from the frontend: load, create, edit and delete notes, with loading and error messages.",
  commonMistakes: [
    "Assuming `fetch` throws on a 404 or 500 answer. It doesn't; check `response.ok` yourself or errors look like success.",
    'Forgetting `await` (or `return`) before a request. You get a Promise instead of the data, and `notes.map` fails with "map is not a function".',
    "Calling `getNotes()` directly in the component body instead of in `useEffect`. Each answer updates state, which renders again, which requests again — an endless loop.",
    "Sending an object as `body` without `JSON.stringify` and the `Content-Type: application/json` header. The server receives `[object Object]`.",
    "Changing `vite.config.js` without restarting `npm run dev`, so the proxy isn't active and requests go to port 5173 and fail with 404.",
    "Having another program already using port 3000 (for example another project's server). The proxy then reaches that program instead, and you see its error instead of *Something went wrong*. Stop the other program, or change the port in `vite.config.js` and later in the backend.",
  ],
  nextStepId: "create-backend",
  nextWhy:
    "The frontend sends requests to `/api`, but nothing answers yet. Next we create the backend: an Express server on port 3000.",
};

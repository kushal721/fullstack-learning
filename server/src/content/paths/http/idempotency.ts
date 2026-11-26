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

// Idempotency: requests that fail halfway, which methods are safe to repeat,
// why POST isn't, the Idempotency-Key header, the server's side, a retried
// save step by step, retrying with backoff, what to retry, the Notes App,
// mistakes, practice and a recap.
export const idempotencyModule = moduleLesson(
  "idempotency",
  "Idempotency: safe to retry",
  50,
  [
    "Explain why a request that timed out may still have done its work.",
    "Tell which methods are safe to repeat, and why POST isn't.",
    "Make a POST safe to retry with an Idempotency-Key the server remembers.",
    "Retry with exponential backoff and jitter, only for errors that can pass.",
    "Decide which failures to retry and which to show to the user.",
  ],

  part(
    "halfway",
    "Requests fail halfway",
    explain(
      "You press Save. The request reaches the server, the note is saved, and then the Wi-Fi drops before the answer arrives. Your `fetch` rejects with a network error, or times out. From the browser's side it failed. On the server it worked. The client can't tell which happened.",
    ),
    diagram([
      ["Client", "POST /api/notes"],
      ["Server", "saves note 7"],
      ["Answer lost", "201 never arrives"],
      ["Client", "“it failed?”"],
    ]),
    keyPoints(
      "A timeout says “no answer”, not “nothing happened”.",
      "The server may have finished, be halfway, or never seen it.",
      "So the question is: what happens if you send it again?",
    ),
  ),

  part(
    "which-retry",
    "Which requests are safe to repeat",
    explain(
      "A request is [[idempotent]] when sending it twice ends the same as sending it once. A [[safe-method|safe method]] like GET changes nothing, so repeating it is always fine. PUT and DELETE change things, but in a way that repeats cleanly: the note ends up with the same title, or stays deleted.",
    ),
    reference("Repeat it?", [
      ["GET, HEAD", "Safe: reads only. Repeat freely.", "GET /api/notes"],
      [
        "PUT",
        "Idempotent: the same full version again.",
        'PUT /api/notes/7 { "title": "Milk" }',
      ],
      [
        "DELETE",
        "Idempotent: still deleted (maybe 404 the 2nd time).",
        "DELETE /api/notes/7",
      ],
      ["POST", "Not idempotent: each one creates another.", "POST /api/notes"],
      [
        "PATCH",
        "Depends: “set title” repeats; “add 1” doesn't.",
        'PATCH { "likes": "+1" }',
      ],
    ]),
  ),

  part(
    "why-not-post",
    "Why POST isn't",
    explain(
      "A [[http-post|POST]] means “make a new one”. The server has no way to know a second POST with the same body is a retry: maybe you really do want two notes called Milk. So a blind retry after a timeout can leave you with two notes, two orders or two payments.",
    ),
    code(
      "http",
      "The same POST twice",
      [
        "POST /api/notes HTTP/1.1",
        '{ "title": "Milk" }',
        "",
        "HTTP/1.1 201 Created   (lost)",
        "",
        "POST /api/notes HTTP/1.1",
        '{ "title": "Milk" }',
        "",
        "HTTP/1.1 201 Created",
        '{ "id": 8, "title": "Milk" }',
      ],
      {
        4: "note 7 was saved, but the answer never arrived",
        6: "the client retries",
        10: "note 8: now there are two",
      },
    ),
    quickCheck(
      "`DELETE /api/notes/7` times out. Is it safe to send it again?",
      [
        "No: it might delete two notes",
        "Yes: DELETE is idempotent, note 7 ends up deleted either way",
        "Only if the first one returned 404",
      ],
      1,
      "Deleting the same note twice leaves the same result: note 7 is gone. The second answer may be 404, which the client can treat as done.",
    ),
  ),

  part(
    "the-key",
    "The Idempotency-Key header",
    explain(
      "An [[idempotency-key]] makes a POST safe to retry. The client makes one unique id per action, such as one click of Save, with `crypto.randomUUID()`, and sends it in an `Idempotency-Key` header. Every retry of that action sends the same key. A new action gets a new key.",
    ),
    anatomy(
      "A create with a key",
      [
        "POST /api/notes HTTP/1.1",
        "Content-Type: application/json",
        "Idempotency-Key: 5b1e0c9a-77d2-4f",
        '{ "title": "Milk" }',
      ],
      [
        ["POST", "not idempotent", "On its own, a retry would create twice."],
        [
          "Idempotency-Key",
          "the header",
          "A draft IETF standard; Stripe and others use it.",
        ],
        [
          "5b1e0c9a-77d2-4f",
          "the key",
          "From crypto.randomUUID(), made once per action (shortened here).",
        ],
        [
          '{ "title": "Milk" }',
          "the body",
          "Retries must send the same body with the same key.",
        ],
      ],
    ),
  ),

  part(
    "server-side",
    "The server remembers",
    explain(
      "The server keeps a table of key → response. The first request with a key does the work and stores the answer. A request with a key it has seen gets the stored answer back, so nothing is created twice. The same key with a *different* body is a client bug: refuse it.",
    ),
    code(
      "js",
      "Replaying a stored response",
      [
        "const done = new Map(); // key → result",
        "",
        "async function createOnce(req) {",
        "  const key = `${req.userId}:${req.key}`;",
        "  const body = JSON.stringify(req.body);",
        "  const old = done.get(key);",
        "  if (old && old.body !== body) {",
        "    return { status: 422 };",
        "  }",
        "  if (old) return old.response;",
        "  const response = await save(req.body);",
        "  done.set(key, { body, response });",
        "  return response;",
        "}",
      ],
      {
        4: "keys belong to one user",
        8: "same key, different body: refuse",
        10: "seen it: send the same answer again",
        12: "first time: do the work, remember it",
      },
    ),
    keyPoints(
      "Store keys per user, so two users can't collide.",
      "Keep them for a while (often 24 hours), then delete them.",
      "In a real app the store is a database table, not a Map.",
      "A retry while the first is still running gets 409 Conflict.",
    ),
  ),

  part(
    "step-by-step",
    "A retried save, step by step",
    explain(
      "Follow one click of Save whose answer gets lost. The client retries with the same key, and the server replays what it said the first time.",
    ),
    trace(
      "One action, two attempts",
      [
        "function handle(key, body) {",
        "  const old = done.get(key);",
        "  if (old) return old.response;",
        "  const response = save(body);",
        "  done.set(key, { body, response });",
        "  return response;",
        "}",
        'handle("k7", { title: "Milk" });',
        "// the answer is lost; retry:",
        'handle("k7", { title: "Milk" });',
      ],
      [
        {
          line: 8,
          note: "The first attempt arrives with key k7. Nothing is stored yet.",
          vars: [["done", "Map {}"]],
        },
        {
          line: 2,
          note: "No entry for k7, so this is new work.",
          vars: [
            ["done", "Map {}"],
            ["key", '"k7"'],
            ["body", '{ title: "Milk" }'],
            ["old", "undefined"],
          ],
          stack: ["handle"],
        },
        {
          line: 4,
          note: "The note is saved as note 7.",
          vars: [
            ["done", "Map {}"],
            ["key", '"k7"'],
            ["body", '{ title: "Milk" }'],
            ["old", "undefined"],
            ["response", "{ status: 201, id: 7 }"],
          ],
          stack: ["handle"],
        },
        {
          line: 5,
          note: "The key and its answer are remembered before replying.",
          vars: [
            ["done", 'Map { "k7" => {…} }'],
            ["key", '"k7"'],
            ["body", '{ title: "Milk" }'],
            ["old", "undefined"],
            ["response", "{ status: 201, id: 7 }"],
          ],
          stack: ["handle"],
        },
        {
          line: 9,
          note: "The 201 is sent, but the connection drops. The client sees a network error and retries with the same key.",
          vars: [["done", 'Map { "k7" => {…} }']],
        },
        {
          line: 2,
          note: "This time k7 is found.",
          vars: [
            ["done", 'Map { "k7" => {…} }'],
            ["key", '"k7"'],
            ["body", '{ title: "Milk" }'],
            ["old", "{ body, response }"],
          ],
          stack: ["handle"],
        },
        {
          line: 3,
          note: "The stored answer goes back: still note 7, and `save` never runs again.",
          vars: [
            ["done", 'Map { "k7" => {…} }'],
            ["key", '"k7"'],
            ["body", '{ title: "Milk" }'],
            ["old", "{ body, response }"],
          ],
          stack: ["handle"],
          output: "{ status: 201, id: 7 }",
        },
      ],
    ),
  ),

  part(
    "backoff",
    "Retry with backoff and jitter",
    explain(
      "Retrying at once, in a tight loop, hammers a server that is already struggling. [[retry-backoff|Retry with backoff]]: wait longer before each try (0.5s, 1s, 2s, 4s), up to a cap, and give up after a few. Add jitter, a random part of the wait, so a thousand clients that failed together don't all retry in the same millisecond.",
    ),
    code(
      "js",
      "Exponential backoff with full jitter",
      [
        "async function withRetry(send, tries = 4) {",
        "  for (let i = 1; ; i++) {",
        "    try {",
        "      const res = await send();",
        "      const last = i === tries;",
        "      if (last || !shouldRetry(res.status))",
        "        return res;",
        "    } catch (err) {",
        "      if (i === tries) throw err;",
        "    }",
        "    const cap = Math.min(250 * 2 ** i, 8000);",
        "    await sleep(Math.random() * cap);",
        "  }",
        "}",
      ],
      {
        4: "send() reuses the same Idempotency-Key",
        6: "a 400 or 404 is returned at once",
        8: "a network error: try again unless out of tries",
        11: "500ms, 1s, 2s… never more than 8s",
        12: "jitter: anywhere between 0 and the cap",
      },
    ),
  ),

  part(
    "what-to-retry",
    "What to retry, and what not to",
    explain(
      "Retry only failures that might pass on their own: the network, an overloaded server, a rate limit. A 4xx means the request itself is wrong, so sending it again gets the same answer. Show it to the user instead. And only retry a POST automatically if it carries an idempotency key.",
    ),
    reference("Retry it?", [
      ["Network error", "Yes: the request may not have arrived.", "TypeError"],
      ["429", "Yes, after Retry-After if it's given.", "Too Many Requests"],
      [
        "500, 502, 503, 504",
        "Yes, with backoff: the server may recover.",
        "503 Service Unavailable",
      ],
      [
        "400, 422",
        "No: the data is wrong. Show the error.",
        "Title is required",
      ],
      ["401, 403, 404", "No: log in, or it isn't there.", "Please log in"],
      ["2xx", "No: it worked.", "201 Created"],
    ]),
    quickCheck(
      "A save returns `400 Title is required`. What should the client do?",
      [
        "Retry with backoff",
        "Retry once, immediately",
        "Not retry: show the message so the user can fix the title",
      ],
      2,
      "A 4xx is the client's mistake. The same request gets the same 400 every time, so retrying only wastes requests.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App",
    explain(
      "The Notes App has no idempotency key. `createNote` inserts a row on every POST. The form's Save button is disabled while saving, which stops most double clicks, and `request.js` never retries. But a POST that times out and is sent again would still make two notes. Here is how a key could be added.",
    ),
    inTheNotesApp(
      "`createNote` inserts a new note for every POST it receives; nothing recognises a repeat.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    code(
      "js",
      "Adding a key (not in the Notes App)",
      [
        "// notesApi.js: one key per Save click",
        "export function createNote(note, key) {",
        '  return request("/api/notes", {',
        '    method: "POST",',
        "    body: note,",
        '    headers: { "Idempotency-Key": key },',
        "  });",
        "}",
        "",
        "// NoteForm: make the key once, reuse it",
        "const key = crypto.randomUUID();",
        "await withRetry(() => createNote(note, key));",
      ],
      {
        6: "request() would need to accept extra headers",
        11: "outside the retry: every attempt shares it",
      },
    ),
    keyPoints(
      "The server would store (user, key) → response, e.g. in a table.",
      "createNote would check it first and replay a stored answer.",
      "Old keys would be deleted after a day.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A new key on every attempt",
      wrong: [
        "await withRetry(() =>",
        "  createNote(note, crypto.randomUUID()),",
        ");",
      ],
      problem:
        "Each retry has a different key, so the server sees three new actions and can create three notes.",
      right: [
        "const key = crypto.randomUUID();",
        "await withRetry(() => createNote(note, key));",
      ],
      why: "The key names the action, not the attempt: make it once, outside the retry.",
    }),
    mistake({
      title: "Retrying every failure",
      wrong: ["if (!res.ok) return retry();"],
      problem:
        "A 400 or 403 never changes, so the client sends the same bad request again and again.",
      right: ["if (shouldRetry(res.status)) return retry();"],
      why: "Retry network errors, 429 and 5xx only; show 4xx errors to the user.",
    }),
    mistake({
      title: "Retrying without waiting",
      wrong: ["while (!(await trySave())) {}"],
      problem:
        "A tight loop floods a server that is already failing, and never gives up.",
      right: [
        "for (let i = 1; i <= 4; i++) {",
        "  if (await trySave()) break;",
        "  await sleep(Math.random() * 250 * 2 ** i);",
        "}",
      ],
      why: "Back off, add jitter and stop after a few tries.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Should we retry?",
      task: 'Write `shouldRetry(result)`. `result` is either `{ error: "network" }` or `{ status }`. Return `true` for a network error, 429, or any status from 500 to 599; `false` for everything else.',
      starter: ["function shouldRetry(result) {", "  return false;", "}"],
      tests: [
        ['shouldRetry({ error: "network" })', "true"],
        ["shouldRetry({ status: 503 })", "true"],
        ["shouldRetry({ status: 429 })", "true"],
        ["shouldRetry({ status: 400 })", "false"],
        ["shouldRetry({ status: 201 })", "false"],
      ],
      hint: "Check `result.error` first, then `status === 429 || status >= 500`.",
      solution: [
        "function shouldRetry(result) {",
        "  if (result.error) return true;",
        "  const { status } = result;",
        "  return status === 429 ||",
        "    (status >= 500 && status <= 599);",
        "}",
      ],
    }),
    yourTurn({
      title: "Backoff delays",
      task: "Write `backoffDelays(base, cap, tries)`: the wait before each of `tries` retries. The first is `base`, each one doubles, and none is more than `cap`.",
      starter: [
        "function backoffDelays(base, cap, tries) {",
        "  return [];",
        "}",
      ],
      tests: [
        ["backoffDelays(1000, 8000, 5)", "[1000, 2000, 4000, 8000, 8000]"],
        ["backoffDelays(100, 1000, 3)", "[100, 200, 400]"],
        ["backoffDelays(500, 500, 2)", "[500, 500]"],
      ],
      hint: "Loop `i` from 0 to `tries - 1` and push `Math.min(base * 2 ** i, cap)`.",
      solution: [
        "function backoffDelays(base, cap, tries) {",
        "  const delays = [];",
        "  for (let i = 0; i < tries; i++) {",
        "    delays.push(Math.min(base * 2 ** i, cap));",
        "  }",
        "  return delays;",
        "}",
      ],
    }),
    yourTurn({
      title: "Do it once",
      task: "Write `handle(store, key, body, work)`. `store` is a Map. New key: call `work(body)`, store the body and its result, and return the result. Seen key with the same body: return the stored result without calling `work`. Same key, different body: return `{ status: 422 }`.",
      starter: [
        "function handle(store, key, body, work) {",
        "  return work(body);",
        "}",
      ],
      tests: [
        [
          '(() => { const s = new Map(); let n = 0; const w = () => ({ status: 201, id: ++n }); handle(s, "k1", { title: "Milk" }, w); return handle(s, "k1", { title: "Milk" }, w); })()',
          "{ status: 201, id: 1 }",
        ],
        [
          '(() => { const s = new Map(); let n = 0; const w = () => ({ status: 201, id: ++n }); handle(s, "k1", { title: "Milk" }, w); return handle(s, "k2", { title: "Milk" }, w); })()',
          "{ status: 201, id: 2 }",
        ],
        [
          '(() => { const s = new Map(); const w = () => ({ status: 201 }); handle(s, "k1", { title: "Milk" }, w); return handle(s, "k1", { title: "Tea" }, w); })()',
          "{ status: 422 }",
        ],
      ],
      hint: "Compare bodies with `JSON.stringify`. Store `{ body, result }` under the key.",
      solution: [
        "function handle(store, key, body, work) {",
        "  const text = JSON.stringify(body);",
        "  const old = store.get(key);",
        "  if (old && old.text !== text) {",
        "    return { status: 422 };",
        "  }",
        "  if (old) return old.result;",
        "  const result = work(body);",
        "  store.set(key, { text, result });",
        "  return result;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Idempotency cheat sheet", [
      ["Idempotent", "Twice ends the same as once.", "PUT, DELETE, GET"],
      ["Not idempotent", "Each one does it again.", "POST /api/notes"],
      [
        "Idempotency-Key",
        "One id per action, same on every retry.",
        "crypto.randomUUID()",
      ],
      [
        "Server store",
        "(user, key) → body and response; replay it.",
        "Same key, other body: 422",
      ],
      ["Backoff", "Wait longer each try, up to a cap.", "0.5s, 1s, 2s, 4s"],
      ["Jitter", "A random part of the wait.", "Math.random() * cap"],
      ["Retry", "Network errors, 429, 5xx.", "503 Service Unavailable"],
      ["Don't retry", "4xx: fix the request instead.", "400, 401, 404"],
    ]),
    quickCheck(
      "Where should a client make its idempotency key?",
      [
        "Inside the retry loop, a fresh one per attempt",
        "Once per user action, before the first attempt",
        "Once when the app starts, shared by every request",
      ],
      1,
      "One key per action: every retry of that save shares it, so the server can spot the repeat, while the next save gets its own.",
    ),
  ),
);

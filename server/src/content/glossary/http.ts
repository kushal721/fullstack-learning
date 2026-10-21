import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "HTTP & APIs" topic.
export const httpGlossary: GlossaryEntry[] = [
  {
    id: "http-request-response",
    topicId: "http",
    term: "HTTP request and response",
    aliases: ["http", "request", "response", "request line", "status line"],
    kind: "concept",
    short:
      "The pair of messages every web conversation is made of: a request goes out, one response comes back.",
    body: "A request starts with a line like `GET /api/notes HTTP/1.1`, then [[http-headers|headers]] and an optional body. The response starts with a status line like `HTTP/1.1 200 OK` ([[http-status-codes|status code]]), then headers and the body: data, an error message or nothing.",
    conceptPageId: "http-request-response",
  },
  {
    id: "http-methods",
    topicId: "http",
    term: "HTTP methods",
    aliases: ["method", "verb", "safe", "idempotent"],
    kind: "concept",
    short:
      "The verb at the start of every request, such as GET or DELETE, saying what the client wants done.",
    body: "[[http-get|GET]] reads, [[http-post|POST]] creates, PUT replaces, PATCH changes part of something and DELETE removes ([[http-put-delete|PUT, PATCH and DELETE]]). A safe method never changes anything; an idempotent one has the same effect sent once or ten times.",
    conceptPageId: "http-methods",
  },
  {
    id: "http-get",
    topicId: "http",
    term: "GET",
    aliases: ["http get", "query string", "get request"],
    kind: "concept",
    short:
      "The method for reading data, such as loading the list of notes, without changing anything.",
    body: "`GET /api/notes` asks for the notes; the server answers with data, usually [[json]]. A GET has no body: extra details go in the query string after `?`, like `/api/notes?topic=react`. Compare [[http-post|POST]].",
    conceptPageId: "http-get",
  },
  {
    id: "http-post",
    topicId: "http",
    term: "POST",
    aliases: ["http post", "post request"],
    kind: "concept",
    short:
      "The method for sending new data to a server, such as a note to be saved.",
    body: "`POST /api/notes` means “here is a new note, please store it”. Unlike [[http-get|GET]], it carries data in its [[request-body|body]], usually as [[json]], and it changes something on the server. A successful create usually answers `201 Created`.",
    conceptPageId: "http-post",
  },
  {
    id: "http-put-delete",
    topicId: "http",
    term: "PUT, PATCH and DELETE",
    aliases: ["put", "patch", "delete", "update request"],
    kind: "concept",
    short:
      "The methods for changing or removing something that already exists, such as editing or deleting a note.",
    body: "`PUT /api/notes/42` replaces note 42 with the version in the body; `PATCH` changes only the fields you send; `DELETE /api/notes/42` removes it and needs no body. They are the U and D of [[crud|CRUD]].",
    conceptPageId: "http-put-delete",
  },
  {
    id: "http-status-codes",
    topicId: "http",
    term: "HTTP status codes",
    aliases: ["status code", "200", "201", "404", "500", "401", "403"],
    kind: "concept",
    short:
      "The three-digit number in every response that says whether the request worked, and if not, why.",
    body: "2xx success (`200 OK`, `201 Created`), 3xx look elsewhere, 4xx the client made a mistake (`400`, `401` not logged in, `403` not allowed, `404` not found), 5xx the server failed (`500`). [[js-fetch|fetch]] reads it from `response.status`.",
    conceptPageId: "http-status-codes",
  },
  {
    id: "http-headers",
    topicId: "http",
    term: "HTTP headers",
    aliases: ["header", "headers", "content-type", "authorization"],
    kind: "concept",
    short:
      "The name-value lines at the top of a request or response that describe the message.",
    body: "`Content-Type: application/json` says the body is [[json]]. Clients send headers like `Accept` and `Cookie`; servers send `Set-Cookie` and `Cache-Control`. Names ignore case. They travel in every [[http-request-response|request and response]].",
    conceptPageId: "http-headers",
  },
  {
    id: "rest-endpoint",
    topicId: "http",
    term: "REST endpoint",
    aliases: ["rest", "endpoint", "api", "resource", "rest api"],
    kind: "concept",
    short:
      "A predictable API design: URLs name the things (resources), HTTP methods say what to do with them.",
    body: "`/api/notes` is the collection, `/api/notes/42` one note. The [[http-methods|method]] is the verb: `GET` reads, `POST` creates, `DELETE` removes. So `DELETE /api/notes/42`, never `POST /api/deleteNote?id=42`. In Express each endpoint is a [[express-route|route]].",
    conceptPageId: "rest-endpoint",
  },
];

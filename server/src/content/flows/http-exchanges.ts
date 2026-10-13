import type { HttpExchange } from "@fsl/shared";

// The real HTTP exchange of every Notes App endpoint, keyed by its
// http-request symbol: request headers and body, the success response
// (raw, with its headers) and every error answer the backend can give.
// Messages and status codes are checked against the backend source in tests.
export const httpExchanges: Record<string, HttpExchange> = {
  "http-request:GET /api/notes": {
    method: "GET",
    path: "/api/notes",
    purpose: "List the logged-in user's notes, newest first.",
    headers: {
      Cookie: "token=eyJhbGciOiJIUzI1NiIs…",
    },
    status: 200,
    response:
      'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n\n[{"id":7,"title":"Shopping","content":"Milk, bread","created_at":"2026-10-12T09:30:00.000Z","updated_at":"2026-10-12T09:30:00.000Z"},…]',
    errorCases: [
      {
        status: 401,
        when: "The `token` cookie is missing, forged or expired (`requireAuth`).",
        body: '{"error":"Please log in"}',
      },
      {
        status: 500,
        when: "Something unexpected fails, e.g. the database is down. Details go to the server log only.",
        body: '{"error":"Something went wrong"}',
      },
    ],
  },
  "http-request:POST /api/notes": {
    method: "POST",
    path: "/api/notes",
    purpose: "Create a note for the logged-in user.",
    headers: {
      "Content-Type": "application/json",
      Cookie: "token=eyJhbGciOiJIUzI1NiIs…",
    },
    body: '{"title":"Shopping","content":"Milk, bread"}',
    status: 201,
    response:
      'HTTP/1.1 201 Created\nContent-Type: application/json; charset=utf-8\n\n{"id":7,"title":"Shopping","content":"Milk, bread","created_at":"2026-10-12T09:30:00.000Z","updated_at":"2026-10-12T09:30:00.000Z"}',
    errorCases: [
      {
        status: 400,
        when: "The title is missing or only spaces (`validateNote`).",
        body: '{"error":"Title is required"}',
      },
      {
        status: 400,
        when: "The title is longer than 100 characters.",
        body: '{"error":"Title must be at most 100 characters"}',
      },
      {
        status: 400,
        when: "`content` is not text, e.g. a number.",
        body: '{"error":"Content must be text"}',
      },
      {
        status: 400,
        when: "The content is longer than 10,000 characters.",
        body: '{"error":"Content must be at most 10000 characters"}',
      },
      {
        status: 400,
        when: "The body isn't valid JSON (`express.json` fails; the error handler answers).",
        body: '{"error":"Invalid JSON"}',
      },
      {
        status: 401,
        when: "The `token` cookie is missing, forged or expired (`requireAuth`).",
        body: '{"error":"Please log in"}',
      },
      {
        status: 500,
        when: "Something unexpected fails, e.g. the database is down. Details go to the server log only.",
        body: '{"error":"Something went wrong"}',
      },
    ],
  },
  "http-request:PUT /api/notes/:id": {
    method: "PUT",
    path: "/api/notes/:id",
    purpose: "Replace one of the user's notes' title and content.",
    headers: {
      "Content-Type": "application/json",
      Cookie: "token=eyJhbGciOiJIUzI1NiIs…",
    },
    body: '{"title":"Shopping","content":"Milk, bread, eggs"}',
    status: 200,
    response:
      'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n\n{"id":7,"title":"Shopping","content":"Milk, bread, eggs","created_at":"2026-10-12T09:30:00.000Z","updated_at":"2026-10-12T10:05:00.000Z"}',
    errorCases: [
      {
        status: 401,
        when: "There is no `token` cookie: the user never logged in or logged out (`requireAuth`).",
        body: '{"error":"Please log in"}',
      },
      {
        status: 401,
        when: "The token's signature doesn't match `JWT_SECRET` (it was edited or forged) or it has expired (`jwt.verify`).",
        body: '{"error":"Please log in"}',
      },
      {
        status: 404,
        when: "The note belongs to another user: `WHERE id = $3 AND user_id = $4` matches no row. Many APIs answer `403 Forbidden` here; this one answers 404 so nobody can find out which note ids exist.",
        body: '{"error":"Note not found"}',
      },
      {
        status: 404,
        when: "No note has this id, or the id isn't a positive whole number (`noteId`).",
        body: '{"error":"Note not found"}',
      },
      {
        status: 400,
        when: "The title is missing or only spaces (`validateNote`).",
        body: '{"error":"Title is required"}',
      },
      {
        status: 400,
        when: "The title is longer than 100 characters.",
        body: '{"error":"Title must be at most 100 characters"}',
      },
      {
        status: 400,
        when: "`content` is not text, e.g. a number.",
        body: '{"error":"Content must be text"}',
      },
      {
        status: 400,
        when: "The content is longer than 10,000 characters.",
        body: '{"error":"Content must be at most 10000 characters"}',
      },
      {
        status: 400,
        when: "The body isn't valid JSON (`express.json` fails; the error handler answers).",
        body: '{"error":"Invalid JSON"}',
      },
      {
        status: 500,
        when: "Something unexpected fails, e.g. the database is down. Details go to the server log only.",
        body: '{"error":"Something went wrong"}',
      },
    ],
  },
  "http-request:DELETE /api/notes/:id": {
    method: "DELETE",
    path: "/api/notes/:id",
    purpose: "Delete one of the user's notes.",
    headers: {
      Cookie: "token=eyJhbGciOiJIUzI1NiIs…",
    },
    status: 204,
    response:
      "HTTP/1.1 204 No Content\n\n(no body: there is nothing left to send)",
    errorCases: [
      {
        status: 404,
        when: "The id isn't a positive whole number, the note doesn't exist, or it belongs to someone else (the same answer, so ids can't be probed).",
        body: '{"error":"Note not found"}',
      },
      {
        status: 401,
        when: "The `token` cookie is missing, forged or expired (`requireAuth`).",
        body: '{"error":"Please log in"}',
      },
      {
        status: 500,
        when: "Something unexpected fails, e.g. the database is down. Details go to the server log only.",
        body: '{"error":"Something went wrong"}',
      },
    ],
  },
  "http-request:POST /api/auth/register": {
    method: "POST",
    path: "/api/auth/register",
    purpose: "Create an account. The password is stored only as a bcrypt hash.",
    headers: {
      "Content-Type": "application/json",
    },
    body: '{"email":"you@example.com","password":"my-password-123"}',
    status: 201,
    response:
      'HTTP/1.1 201 Created\nContent-Type: application/json; charset=utf-8\n\n{"id":2,"email":"you@example.com"}',
    errorCases: [
      {
        status: 400,
        when: "The email has no `@`.",
        body: '{"error":"Please enter a valid email address"}',
      },
      {
        status: 400,
        when: "The password is shorter than 8 characters.",
        body: '{"error":"Password must be at least 8 characters"}',
      },
      {
        status: 409,
        when: "An account with this email already exists (the database's UNIQUE rule).",
        body: '{"error":"Email already registered"}',
      },
      {
        status: 400,
        when: "The body isn't valid JSON (`express.json` fails; the error handler answers).",
        body: '{"error":"Invalid JSON"}',
      },
      {
        status: 500,
        when: "Something unexpected fails, e.g. the database is down. Details go to the server log only.",
        body: '{"error":"Something went wrong"}',
      },
    ],
  },
  "http-request:POST /api/auth/login": {
    method: "POST",
    path: "/api/auth/login",
    purpose: "Log in: check the password and set the login cookie.",
    headers: {
      "Content-Type": "application/json",
    },
    body: '{"email":"you@example.com","password":"my-password-123"}',
    status: 200,
    response:
      'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nSet-Cookie: token=eyJhbGciOiJIUzI1NiIs…; Max-Age=604800; Path=/; Expires=Mon, 19 Oct 2026 09:30:00 GMT; HttpOnly; SameSite=Lax\n\n{"id":2,"email":"you@example.com"}',
    errorCases: [
      {
        status: 400,
        when: "The email or password is missing.",
        body: '{"error":"Email and password are required"}',
      },
      {
        status: 401,
        when: "No account has this email, or the password is wrong: one answer for both, so nobody can find out which emails are registered.",
        body: '{"error":"Invalid email or password"}',
      },
      {
        status: 400,
        when: "The body isn't valid JSON (`express.json` fails; the error handler answers).",
        body: '{"error":"Invalid JSON"}',
      },
      {
        status: 500,
        when: "Something unexpected fails, e.g. the database is down. Details go to the server log only.",
        body: '{"error":"Something went wrong"}',
      },
    ],
  },
  "http-request:POST /api/auth/logout": {
    method: "POST",
    path: "/api/auth/logout",
    purpose: "Log out: tell the browser to delete the login cookie.",
    headers: {
      Cookie: "token=eyJhbGciOiJIUzI1NiIs…",
    },
    status: 204,
    response:
      "HTTP/1.1 204 No Content\nSet-Cookie: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax\n\n(no body)",
    errorCases: [],
  },
  "http-request:GET /api/auth/me": {
    method: "GET",
    path: "/api/auth/me",
    purpose:
      "Ask who is logged in. The frontend can't read the httpOnly cookie itself.",
    headers: {
      Cookie: "token=eyJhbGciOiJIUzI1NiIs…",
    },
    status: 200,
    response:
      'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n\n{"id":2,"email":"you@example.com"}',
    errorCases: [
      {
        status: 401,
        when: 'Nobody is logged in, or the account no longer exists. The frontend treats this as "show the login page".',
        body: '{"error":"Please log in"}',
      },
      {
        status: 500,
        when: "Something unexpected fails, e.g. the database is down. Details go to the server log only.",
        body: '{"error":"Something went wrong"}',
      },
    ],
  },
};

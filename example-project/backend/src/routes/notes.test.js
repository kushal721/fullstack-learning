// Integration tests: real Express app, real PostgreSQL. They use a separate
// database (notes_test) so they can delete everything between tests.
//
//   createdb notes_test  (or: docker exec notes-db createdb -U postgres notes_test)
//   npm test
import { readFileSync } from "node:fs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

process.env.DATABASE_URL ??=
  "postgres://postgres:dev@localhost:5432/notes_test";
process.env.JWT_SECRET ??= "test-secret";

// Imported after the variables are set, because db.js reads them on import.
const { pool } = await import("../db.js");
const { createApp } = await import("../app.js");
const app = createApp();

const schema = readFileSync(
  new URL("../../../database/schema.sql", import.meta.url),
  "utf8",
);

// A login cookie for a user, as the login route would set it.
function cookieFor(userId) {
  return `token=${jwt.sign({ sub: userId }, process.env.JWT_SECRET)}`;
}

let ana;
let ben;

beforeAll(async () => {
  await pool.query("DROP TABLE IF EXISTS notes, users");
  await pool.query(schema);
});

beforeEach(async () => {
  await pool.query("TRUNCATE notes, users RESTART IDENTITY");
  const users = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ('ana@example.com', 'x'), ('ben@example.com', 'x')
     RETURNING id`,
  );
  [ana, ben] = users.rows.map((row) => row.id);
});

afterAll(async () => {
  await pool.end();
});

describe("notes API", () => {
  it("rejects requests without a login cookie", async () => {
    const res = await request(app).get("/api/notes");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Please log in" });
  });

  it("creates a note for the logged-in user", async () => {
    const res = await request(app)
      .post("/api/notes")
      .set("Cookie", cookieFor(ana))
      .send({ title: "Shopping", content: "Milk" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Shopping", content: "Milk" });

    const list = await request(app)
      .get("/api/notes")
      .set("Cookie", cookieFor(ana));
    expect(list.body.map((note) => note.title)).toEqual(["Shopping"]);
  });

  it("returns 400 for an invalid note", async () => {
    const res = await request(app)
      .post("/api/notes")
      .set("Cookie", cookieFor(ana))
      .send({ title: "" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title is required" });
  });

  it("never shows or changes another user's notes", async () => {
    const created = await request(app)
      .post("/api/notes")
      .set("Cookie", cookieFor(ana))
      .send({ title: "Private" });
    const id = created.body.id;

    const list = await request(app)
      .get("/api/notes")
      .set("Cookie", cookieFor(ben));
    expect(list.body).toEqual([]);

    const update = await request(app)
      .put(`/api/notes/${id}`)
      .set("Cookie", cookieFor(ben))
      .send({ title: "Hacked" });
    expect(update.status).toBe(404);

    const remove = await request(app)
      .delete(`/api/notes/${id}`)
      .set("Cookie", cookieFor(ben));
    expect(remove.status).toBe(404);
  });

  it("updates and deletes the user's own note", async () => {
    const created = await request(app)
      .post("/api/notes")
      .set("Cookie", cookieFor(ana))
      .send({ title: "Draft" });
    const id = created.body.id;

    const update = await request(app)
      .put(`/api/notes/${id}`)
      .set("Cookie", cookieFor(ana))
      .send({ title: "Final", content: "Done" });
    expect(update.status).toBe(200);
    expect(update.body).toMatchObject({ id, title: "Final", content: "Done" });

    const remove = await request(app)
      .delete(`/api/notes/${id}`)
      .set("Cookie", cookieFor(ana));
    expect(remove.status).toBe(204);
  });

  it("treats a malformed id as not found, not a server error", async () => {
    const res = await request(app)
      .delete("/api/notes/0%20OR%20true")
      .set("Cookie", cookieFor(ana));
    expect(res.status).toBe(404);
  });
});

describe("auth API", () => {
  it("registers, logs in with a cookie, and rejects a wrong password", async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "Cara@Example.com", password: "long-password" });
    expect(register.status).toBe(201);
    expect(register.body.email).toBe("cara@example.com");

    const duplicate = await request(app)
      .post("/api/auth/register")
      .send({ email: "cara@example.com", password: "long-password" });
    expect(duplicate.status).toBe(409);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "cara@example.com", password: "long-password" });
    expect(login.status).toBe(200);
    const cookie = login.headers["set-cookie"][0];
    expect(cookie).toMatch(/^token=.+; .*HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);

    const me = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookie.split(";")[0]);
    expect(me.body.email).toBe("cara@example.com");

    const wrong = await request(app)
      .post("/api/auth/login")
      .send({ email: "cara@example.com", password: "nope-nope" });
    expect(wrong.status).toBe(401);
    expect(wrong.body).toEqual({ error: "Invalid email or password" });
  });
});

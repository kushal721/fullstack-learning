-- Notes App database schema (PostgreSQL 16).
-- Run once on an empty database:
--   psql "$DATABASE_URL" -f database/schema.sql

-- One row per account.
CREATE TABLE users (
  -- PRIMARY KEY: every user has a unique id the database creates
  -- (SERIAL counts up: 1, 2, 3…). Other tables refer to users by this id.
  id SERIAL PRIMARY KEY,

  -- UNIQUE: two accounts can never share an email. The backend relies on
  -- this rule (error 23505 → 409) instead of checking first, so two
  -- sign-ups at the same moment can't both succeed.
  email TEXT NOT NULL UNIQUE,

  -- Never the password itself: a bcrypt hash that can't be turned back.
  password_hash TEXT NOT NULL,

  -- DEFAULT now(): the database fills in the time; the app doesn't send it.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per note. Each note belongs to exactly one user (one-to-many).
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,

  -- FOREIGN KEY: user_id must be the id of an existing user, so a note can
  -- never point at nobody. ON DELETE CASCADE: deleting a user also deletes
  -- their notes.
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

  -- NOT NULL: every note needs a title (the backend also checks it is not
  -- empty and at most 100 characters).
  title TEXT NOT NULL,

  -- Content is optional, so it defaults to an empty string instead of NULL.
  content TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Set again by the UPDATE query whenever a note is edited.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every notes query filters by user_id. This index lets PostgreSQL find one
-- user's notes directly instead of reading the whole table.
CREATE INDEX notes_user_id_idx ON notes (user_id);

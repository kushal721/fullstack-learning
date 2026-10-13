import type { Concept } from "@fsl/shared";

export const leastPrivilege: Concept = {
  id: "least-privilege",
  slug: "least-privilege",
  title: "Least privilege",
  topicId: "security",
  summary:
    "Give every user, program and piece of code only the access it needs for its job, so that when something goes wrong, the damage is as small as possible.",
  basics: [
    "Every part of an app has some power: a user can change notes, the backend can query the database, the server process can read files, a script in the page can send requests.",
    "Sooner or later something will go wrong: a bug, a stolen password, a vulnerable package. The question is then how much the thing that went wrong is able to do.",
    "Think of a hotel key card: it opens your room and the front door, not every room in the building. If you lose it, only your room is at risk.",
  ],
  what: [
    'The principle of least privilege says: give each person and each component the smallest set of permissions it needs to do its job, and nothing "just in case".',
    "It isn't a single feature but a habit applied everywhere: which data a user can reach, which columns a query returns, which database operations the app's account may run, which operating-system user the server runs as.",
  ],
  why: [
    "It limits the blast radius. A bug in one part, or an attacker who takes over one part, can only do what that part was allowed to do.",
    "It turns many mistakes into harmless ones. A query that returns only `id` and `email` can't leak password hashes, however the response is used later.",
    "Permissions that are never granted can never be abused, forgotten or misconfigured.",
  ],
  howItWorks: [
    "Users: each user can only reach their own notes, because every notes query includes `user_id = req.user.id`.",
    "Data: queries ask for the columns they need. Login needs `password_hash` to check the password, but the response sends back only `id` and `email`; listing notes never selects `user_id`.",
    "Browser: the login cookie is `httpOnly`, because page JavaScript never needs to read it, so it isn't allowed to.",
    "Server: the Docker image switches to the unprivileged `node` user with `USER node`, so a takeover of the app can't change the system inside the container. It installs only production packages (`npm ci --omit=dev`), so less code is present to go wrong.",
    "Database: in production, the app's database account should only be able to read and write the app's tables, not create databases or manage other users. In local development the Notes App connects as the `postgres` administrator for simplicity; managed database hosts give the app an ordinary account rather than full administrator rights, and you can create a narrower one as shown below.",
  ],
  basicExample: {
    language: "js",
    code: `// TOO MUCH: returns every column, including the password hash
const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
res.json(result.rows[0]); // { id, email, password_hash, created_at }

// LEAST PRIVILEGE (the Notes App): read what's needed, send even less
const result = await pool.query(
  "SELECT id, email, password_hash FROM users WHERE email = $1",
  [email],
);
// …check the password…
res.json({ id: user.id, email: user.email });`,
    caption:
      "The first version works, until the password hash ends up in every login response.",
    highlightLines: [3, 7, 11],
  },
  internals: [
    "Containers run as `root` by default. `root` inside a container is limited, but it can still change any file in the container and is more dangerous if a container-escape bug is ever found. One `USER` line removes that risk.",
    "In PostgreSQL, a dedicated account for the app might get only `SELECT, INSERT, UPDATE, DELETE` on `users` and `notes`. Then even an SQL injection bug couldn't drop tables or read other databases.",
    "Least privilege also applies to people and tools: a CI job that only builds doesn't need deploy keys, and a teammate who only reads logs doesn't need database access.",
    "It works together with defence in depth: several independent layers, each limited, so one failure isn't enough.",
  ],
  howToCreate: [
    {
      text: "See the difference the container user makes. With Docker installed, run the same command in a default Node image and with the unprivileged `node` user that the Notes App's Dockerfile switches to.",
      code: {
        language: "bash",
        code: `docker run --rm node:22-alpine sh -c "whoami && touch /usr/bin/x && echo 'could write system files'"
docker run --rm --user node node:22-alpine sh -c "whoami && touch /usr/bin/x || echo 'not allowed to write system files'"`,
      },
    },
    {
      text: "The first prints `root` and `could write system files`. The second prints `node`, a permission error and `not allowed to write system files`. The app itself works the same either way: it never needed that power.",
    },
    {
      text: "In `psql`, create an account that can only work with the notes tables, as you might for production (here with the Notes App's schema loaded).",
      code: {
        language: "sql",
        code: `CREATE ROLE notes_app LOGIN PASSWORD 'a-long-random-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON users, notes TO notes_app;
GRANT USAGE ON SEQUENCE users_id_seq, notes_id_seq TO notes_app;
-- notes_app can use the app normally, but DROP TABLE notes fails:
-- ERROR: must be owner of table notes`,
      },
    },
  ],
  whereUsed: [
    "User permissions: users see their own data, admins get extra rights only where needed.",
    "Database accounts, cloud access keys and API tokens with limited scopes.",
    "Containers and servers that run as unprivileged users.",
    "Frontend code that never gets access it doesn't need, such as httpOnly cookies.",
  ],
  connectsTo: [
    "Authentication vs authorization: authorization is least privilege for users.",
    "Secure cookies: `httpOnly` withholds a permission the page doesn't need.",
    "Dockerfiles: `USER node` and production-only installs.",
    "SQL injection: a limited database account limits what an injection could do.",
  ],
  projectUsage: [
    {
      explanation:
        "The production image drops root rights with `USER node`, with a comment saying why.",
      fileId: "backend/Dockerfile",
      match: "USER node",
    },
    {
      explanation:
        "Only production dependencies are installed in the image, so test and build tools aren't there to be misused.",
      fileId: "backend/Dockerfile",
      match: "RUN npm ci --omit=dev",
    },
    {
      explanation:
        "Login reads the password hash because it must check it, but answers with only the id and email.",
      fileId: "backend/src/controllers/authController.js",
      match: "res.json({ id: user.id, email: user.email });",
    },
    {
      explanation:
        "Listing notes selects only the columns the frontend shows, and only the logged-in user's rows.",
      fileId: "backend/src/controllers/notesController.js",
      match: "`SELECT id, title, content, created_at, updated_at",
    },
    {
      explanation:
        "In development the app connects as the `postgres` administrator, which is convenient locally. Production should use an account limited to the app's tables.",
      fileId: "backend/.env.example",
      match: "DATABASE_URL=postgres://postgres:dev@localhost:5432/notes",
    },
  ],
  commonMistakes: [
    "Running the app as a database administrator in production because it was easiest during development.",
    "`SELECT *` and sending whole rows to the client. New columns, such as a password hash, then leak automatically.",
    'Giving every teammate or CI job full access "to save time".',
    "Running containers as root because the Dockerfile never says otherwise.",
  ],
  relatedConcepts: [
    "authentication-vs-authorization",
    "secure-cookies",
    "dockerfile",
    "sql-select",
    "sql-injection",
  ],
  relatedFiles: [],
  relatedBuildSteps: ["deploy"],
};

import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "Security" topic.
export const securityGlossary: GlossaryEntry[] = [
  {
    id: "https",
    topicId: "security",
    term: "HTTPS",
    aliases: ["tls", "ssl", "padlock", "encryption", "certificate"],
    kind: "concept",
    short:
      "HTTP through an encrypted connection: nobody in between can read or change it, and the site is who it says.",
    body: "The messages are the same [[http-request-response|HTTP]], wrapped in TLS. It keeps data private, stops it being changed, and a certificate proves the browser reached the real site. The padlock means all three hold. [[secure-cookies|Secure cookies]] are only sent over it.",
    conceptPageId: "https",
  },
  {
    id: "input-validation",
    topicId: "security",
    term: "Input validation",
    aliases: ["validation", "validate", "server-side validation"],
    kind: "concept",
    short:
      "Checking incoming data has the expected shape and size before using it: in the browser to help, on the server to protect.",
    body: "Is it there, the right type, within limits? If not, refuse it with a helpful message and a `400`. Browser checks like `required` give quick feedback but are easy to skip, so the server must check every [[request-body|request body]] again.",
    conceptPageId: "input-validation",
  },
  {
    id: "sql-injection",
    topicId: "security",
    term: "SQL injection",
    aliases: ["sqli", "injection"],
    kind: "concept",
    short:
      "An attack where text sent to the app is pasted into SQL and runs as part of the query.",
    body: "If user input is glued into SQL text, input like `' OR 1=1 --` stops being a value and becomes part of the command, reading or deleting data. It is fully preventable: always use [[parameterized-query|parameterized queries]].",
    conceptPageId: "sql-injection",
  },
  {
    id: "xss",
    topicId: "security",
    term: "XSS",
    aliases: ["cross-site scripting", "script injection"],
    kind: "concept",
    short:
      "An attack where saved text is shown as HTML, so a hidden script runs in another person's browser.",
    body: "If a note containing `<img src=x onerror=…>` is put into the page as HTML, its script runs as if it were the app. The fix: always insert user text as text. React does this whenever you write `{value}` in [[jsx|JSX]]. [[secure-cookies|HttpOnly cookies]] limit the damage.",
    conceptPageId: "xss",
  },
  {
    id: "csrf",
    topicId: "security",
    term: "CSRF",
    aliases: ["cross-site request forgery", "sea-surf"],
    kind: "concept",
    short:
      "An attack where another site makes your browser send a request to an app you're logged in to, with your cookie.",
    body: "A page you visit quietly submits a form to your notes app, and your browser adds your login cookie, so the app thinks you asked. `SameSite` [[secure-cookies|cookies]] stop most of it; never changing data on a GET keeps plain links harmless too.",
    conceptPageId: "csrf",
  },
  {
    id: "cors",
    topicId: "security",
    term: "CORS",
    aliases: [
      "same-origin policy",
      "origin",
      "cross-origin",
      "access-control-allow-origin",
    ],
    kind: "concept",
    short:
      "The browser lets a page read responses only from its own origin; CORS headers let a server allow others.",
    body: "An origin is protocol + domain + port. A server adds `Access-Control-Allow-Origin` [[http-headers|headers]] to let named origins read its responses. CORS only relaxes the browser's protection; it doesn't protect your server, so open as little as possible.",
    conceptPageId: "cors",
  },
  {
    id: "secrets-env-vars",
    topicId: "security",
    term: "Keeping secrets out of the code",
    aliases: ["secrets", "api key", "secret key", ".env.example"],
    kind: "concept",
    short:
      "Passwords and keys reach the app through environment variables, never written in code, committed or sent to the browser.",
    body: "Secrets live only in the running app's environment: a `.env` file that [[gitignore|.gitignore]] keeps out of Git, or the host's settings. The code reads `process.env.JWT_SECRET`. A committed `.env.example` lists the names with fake values. See [[environment-variables|environment variables]].",
    conceptPageId: "secrets-env-vars",
  },
  {
    id: "least-privilege",
    topicId: "security",
    term: "Least privilege",
    aliases: ["principle of least privilege", "permissions"],
    kind: "concept",
    short:
      "Give every user, program and part of the code only the access its job needs, so mistakes do little damage.",
    body: "Users reach only their own data, queries return only the columns needed, the database account can only do what the app does, and the server doesn't run as an admin. It is a habit, not a feature, and it builds on [[authentication-vs-authorization|authorization]].",
    conceptPageId: "least-privilege",
  },
  {
    id: "safe-error-messages",
    topicId: "security",
    term: "Safe error messages",
    aliases: ["error messages", "stack trace", "information leak"],
    kind: "concept",
    short:
      "Tell users what they can fix, keep technical details in the server's logs, and never reveal what helps an attacker.",
    body: "Show “Something went wrong” and log the stack trace. Give the same answer for “wrong password” and “no such email”, so attackers can't find out who has an account. One error [[express-middleware|middleware]] can enforce this everywhere.",
    conceptPageId: "safe-error-messages",
  },
];

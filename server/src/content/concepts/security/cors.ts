import type { Concept } from "@fsl/shared";

export const cors: Concept = {
  id: "cors",
  slug: "cors",
  title: "CORS and the same-origin policy",
  topicId: "security",
  summary:
    "The browser's rule that a page may only read responses from its own origin, and the headers (CORS) a server can send to allow specific other origins.",
  basics: [
    "An origin is the scheme, host and port of a URL together: `https://notes.example:443`. `http://localhost:5173` and `http://localhost:3000` are different origins because the ports differ.",
    "Pages run JavaScript, and that JavaScript can make requests with `fetch`. If any page could read any response, a page on `evil.example` could fetch your email or your notes from other sites you're logged in to, and send them home.",
    "So browsers enforce the same-origin policy: JavaScript on a page can freely read responses from its own origin, but not from other origins, unless those servers say it's allowed.",
  ],
  what: [
    "CORS, Cross-Origin Resource Sharing, is the way a server says it's allowed. It adds response headers such as `Access-Control-Allow-Origin: https://app.example`, and the browser lets that origin's pages read the response.",
    "CORS only ever relaxes the same-origin policy. It isn't a protection you add to your server; it is a controlled hole you open in the browser's protection, and the safest amount is none.",
  ],
  why: [
    "The same-origin policy is what stops any website you visit from reading your data on other sites through your browser, with your cookies.",
    "CORS exists for the cases where a different origin really should read your API, such as a frontend hosted on another domain. Configuring it too loosely, for example allowing every origin with cookies, gives exactly the access the policy was meant to prevent.",
    "The Notes App avoids CORS entirely: the browser only ever talks to one origin, so there is nothing to allow and nothing to get wrong.",
  ],
  howItWorks: [
    "Simple requests (`GET`, or a `POST` with form data or plain text) are sent straight away. The browser then looks for `Access-Control-Allow-Origin` in the response and, if this page's origin isn't allowed, hides the response from the JavaScript, which sees a network error.",
    "Other requests, such as `PUT`, `DELETE` or a `POST` with `Content-Type: application/json`, first trigger a preflight: the browser sends an `OPTIONS` request asking whether the real request is allowed, and only sends it if the server answers yes.",
    "For cookies to be included across origins, the server must also send `Access-Control-Allow-Credentials: true` and name the exact origin; a `*` wildcard isn't allowed together with credentials.",
    "The Notes App sidesteps all of this. In development, Vite on port 5173 forwards `/api` to port 3000, so the page only ever fetches `http://localhost:5173/api/…`. In production, the static site rewrites `/api/*` to the API. The browser sees one origin either way.",
  ],
  basicExample: {
    language: "js",
    code: `import cors from "cors";

// DANGEROUS: reflects any origin and allows cookies, so any website can
// read a logged-in user's notes through their browser
app.use(cors({ origin: true, credentials: true }));

// If another origin really needs access: allow exactly that one
app.use(cors({ origin: "https://notes-frontend.example", credentials: true }));

// The Notes App: no cors() at all. Frontend and API share one origin
// through the Vite proxy (development) and a rewrite (production).`,
    caption:
      "Allowing every origin with credentials undoes the browser's protection. The Notes App needs no CORS headers.",
    highlightLines: [5, 8],
  },
  internals: [
    "CORS is enforced by the browser, not the server. `curl`, a script or another server ignores it completely. It protects users' browsers, not your API: your API still needs authentication and authorization.",
    "Because simple requests are sent before the browser checks the headers, CORS doesn't stop a forged request from having an effect (see CSRF). It stops the attacker from reading the answer.",
    "The proxy works because the forwarding happens on the server side: Vite's development server makes the request to port 3000 itself, where no same-origin policy applies, and passes the answer back to the page as if it came from port 5173.",
    'The browser\'s console shows a clear message when CORS blocks something, such as "has been blocked by CORS policy". The fix is to change the server or the setup, never to install a browser extension that turns the check off.',
  ],
  howToCreate: [
    {
      text: "Create an API on one origin and a page on another, to see the browser block a cross-origin read.",
      code: {
        language: "bash",
        code: `mkdir cors-demo && cd cors-demo
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `servers.js`. The API on port 3001 has two routes, one without CORS headers and one that allows the page's origin. The page on port 3002 fetches both.",
      code: {
        language: "js",
        fileName: "servers.js",
        code: `import express from "express";

const api = express();
api.get("/private", (req, res) => res.json({ notes: ["secret"] }));
api.get("/shared", (req, res) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3002");
  res.json({ notes: ["allowed for localhost:3002"] });
});
api.listen(3001);

const page = express();
page.get("/", (req, res) =>
  res.send(\`<pre id="out"></pre><script>
    const out = document.getElementById("out");
    for (const path of ["/private", "/shared"]) {
      fetch("http://localhost:3001" + path)
        .then((r) => r.json())
        .then((data) => (out.textContent += path + ": " + JSON.stringify(data) + "\\\\n"))
        .catch((err) => (out.textContent += path + ": blocked (" + err.message + ")\\\\n"));
    }
  </script>\`),
);
page.listen(3002, () => console.log("open http://localhost:3002"));`,
      },
    },
    {
      text: "Run `node servers.js` and open http://localhost:3002. `/shared` shows its data; `/private` shows `blocked (Failed to fetch)` and the console explains the CORS error. Now run `curl localhost:3001/private`: the data comes back, because CORS only applies inside browsers.",
      code: { language: "bash", code: "node servers.js" },
    },
  ],
  whereUsed: [
    "Public APIs that any website may call, which send `Access-Control-Allow-Origin: *` and don't use cookies.",
    "Apps whose frontend and API live on different domains, which allow exactly the frontend's origin.",
    "Fonts and other files loaded from a CDN by `fetch` or by some HTML features.",
  ],
  connectsTo: [
    "HTTP headers: CORS is a set of response headers plus the `Origin` request header.",
    "CSRF, which CORS doesn't prevent, and SameSite cookies, which do.",
    "The Vite proxy and the production rewrite, which make frontend and API one origin.",
    "`fetch`, whose cross-origin requests the browser checks.",
  ],
  projectUsage: [
    {
      explanation:
        "The Vite proxy forwards `/api` from the frontend's origin to the API, so the browser never makes a cross-origin request. The comment explains it is also what keeps the login cookie working.",
      fileId: "frontend/vite.config.js",
      match: '"/api": "http://localhost:3000",',
    },
    {
      explanation:
        "The frontend only uses relative paths such as `/api/notes`, so every request goes to the page's own origin.",
      fileId: "frontend/src/services/notesApi.js",
      match: 'return request("/api/notes");',
    },
    {
      explanation:
        "The Express app sets up only `express.json()` and `cookieParser()`; there is no `cors()` middleware, so the API grants no other origin access to its responses.",
      fileId: "backend/src/app.js",
      match: "// Middleware runs in this order for every request.",
    },
  ],
  commonMistakes: [
    "Adding `app.use(cors())` with no options because of a console error. That allows every origin; fix the setup (proxy, rewrite, the right origin) instead.",
    "Reflecting the request's `Origin` header back with credentials allowed, which lets any site read users' data.",
    "Thinking CORS protects the API from scripts or other servers. It only applies in browsers.",
    "Debugging a CORS error from the server's side only. The browser's console and Network tab show which header was missing.",
  ],
  relatedConcepts: [
    "csrf",
    "http-headers",
    "js-fetch",
    "secure-cookies",
    "vite",
  ],
  relatedFiles: [],
  relatedBuildSteps: ["deploy"],
};

import type { Concept } from "@fsl/shared";

export const secureCookies: Concept = {
  id: "secure-cookies",
  slug: "secure-cookies",
  title: "Secure cookies: httpOnly, Secure and SameSite",
  topicId: "authentication",
  summary:
    "The settings that decide who can read a login cookie and when the browser sends it, so the cookie proves who you are without being easy to steal or misuse.",
  basics: [
    "A cookie is a small named value that a server asks the browser to store, with a `Set-Cookie` header in a response. From then on the browser adds it to every request to that site, in a `Cookie` header, by itself.",
    "That automatic sending is what makes cookies good for logins: the server sets the login token once, and every later request carries it without the frontend doing anything.",
    "It also makes the login cookie valuable to attackers. Whoever has its value is logged in as you, and anything that makes your browser send a request to the site also sends the cookie.",
  ],
  what: [
    "Every cookie can carry attributes, extra settings sent along in `Set-Cookie`. Three of them protect a login cookie:",
    "`HttpOnly`: JavaScript in the page can't read the cookie (`document.cookie` doesn't show it). `Secure`: the browser only sends it over HTTPS. `SameSite`: the browser doesn't send it with requests that other websites start (`Lax` still sends it when the user follows a link to the site; `Strict` never does).",
    "Two more set its lifetime and reach: `Max-Age` (how long it is kept) and `Path` (which URLs it is sent to; `/` means the whole site).",
  ],
  why: [
    "Without `HttpOnly`, one cross-site scripting (XSS) bug lets an attacker's script read the token and send it to their own server. With it, the script can't see the token at all.",
    "Without `Secure`, the cookie would also be sent over plain HTTP, for example if someone typed `http://` or followed an old link, where anyone on the same network can read it.",
    "Without `SameSite`, a page on any other website could make your browser send a request to the Notes App with your login cookie attached. That attack is called cross-site request forgery (CSRF).",
  ],
  howItWorks: [
    'At login, the server calls `res.cookie("token", token, cookieOptions)`. In production Express turns this into the header `Set-Cookie: token=eyJ…; Max-Age=604800; Path=/; Expires=…; HttpOnly; Secure; SameSite=Lax` (in development, without `Secure`).',
    "The browser stores the cookie together with its attributes and, for every request, checks them: is this the right site and path, is it HTTPS if `Secure`, did this site start the request if `SameSite`? Only then does it add `Cookie: token=eyJ…`.",
    "On the server, `cookie-parser` reads the `Cookie` header into `req.cookies`, and `requireAuth` verifies `req.cookies.token`.",
    "To log out, the server sends the same cookie with an expiry in the past (`res.clearCookie`), and the browser deletes it. The attributes must match the ones used to set it, or the browser treats it as a different cookie.",
  ],
  basicExample: {
    language: "js",
    code: `// UNSAFE: readable by scripts, sent over HTTP and from other sites
res.cookie("token", token);

// SAFE (the Notes App)
res.cookie("token", token, {
  httpOnly: true, // page JavaScript can't read it
  sameSite: "lax", // other websites can't make the browser send it
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
});`,
    caption:
      "The token is the same; only the attributes change who can read it and when it travels.",
    highlightLines: [6, 7, 8],
  },
  internals: [
    "`Secure` is turned off in development because `http://localhost` isn't HTTPS. Browsers treat `localhost` as a secure context, so many would accept a `Secure` cookie there anyway, but the Notes App doesn't rely on that.",
    "\"Site\" in SameSite means the registrable domain, roughly the part you buy, such as `example.com`. `app.example.com` and `api.example.com` are the same site; `example.com` and `evil.com` aren't. Ports don't matter for sites, which is why `localhost:5173` and `localhost:3000` count as the same site.",
    "`SameSite=Lax` sends the cookie when the user clicks a normal link to the site from elsewhere, so they arrive logged in, but not on form POSTs, `fetch` calls or images from other sites. Some browsers, such as Chrome, treat cookies without a `SameSite` attribute as `Lax`, but others don't, so set it explicitly.",
    "`HttpOnly` doesn't make XSS harmless: a script running in the page can still send requests, and the browser will add the cookie to them. It only stops the token from being stolen and used elsewhere, later.",
  ],
  howToCreate: [
    {
      text: "Create a tiny Express app that sets two cookies, one with no protection and one with the Notes App's settings.",
      code: {
        language: "bash",
        code: `mkdir cookie-demo && cd cookie-demo
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js`. The page it serves tries to read both cookies with JavaScript.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.get("/", (req, res) => {
  res.cookie("plain", "anyone-can-read-me");
  res.cookie("token", "secret-login-token", { httpOnly: true, sameSite: "lax" });
  res.send(\`<p>Cookies your JavaScript can see:</p>
    <pre id="out"></pre>
    <script>document.getElementById("out").textContent = document.cookie;</script>\`);
});
app.listen(3001, () => console.log("http://localhost:3001"));`,
      },
    },
    {
      text: "Run it and open http://localhost:3001 in the browser. The page shows only `plain=anyone-can-read-me`: the httpOnly `token` is hidden from scripts. In the developer tools, Application (Chrome) or Storage (Firefox) → Cookies lists both, with a tick under HttpOnly for `token`, and the Network tab shows the browser sending both back on reload.",
      code: { language: "bash", code: "node server.js" },
    },
  ],
  whereUsed: [
    "Login sessions on almost every website, whether the cookie holds a JWT or a random session id.",
    'Any cookie that grants access: "remember me" cookies, shopping-cart ids tied to an account.',
  ],
  connectsTo: [
    "JWTs: the Notes App's cookie carries one.",
    "HTTPS, which `Secure` depends on.",
    "XSS, which `HttpOnly` limits, and CSRF, which `SameSite` blocks.",
    "HTTP headers: `Set-Cookie` in responses, `Cookie` in requests.",
  ],
  projectUsage: [
    {
      explanation:
        "`cookieOptions` in the auth controller sets all three protections, each with a comment saying what it stops.",
      fileId: "backend/src/controllers/authController.js",
      match: "const cookieOptions = {",
    },
    {
      explanation:
        "`secure` is only on in production, because local development runs on plain `http://localhost`.",
      fileId: "backend/src/controllers/authController.js",
      match: 'secure: process.env.NODE_ENV === "production",',
    },
    {
      explanation:
        "`logout` clears the cookie with the same options, so the browser recognises it as the same cookie and deletes it.",
      fileId: "backend/src/controllers/authController.js",
      match:
        'res.clearCookie("token", { ...cookieOptions, maxAge: undefined });',
    },
    {
      explanation:
        "`cookieParser()` turns the `Cookie` header into `req.cookies` for every request.",
      fileId: "backend/src/app.js",
      match: "app.use(cookieParser()); // Cookie header → req.cookies",
    },
    {
      explanation:
        "The frontend asks `fetch` to include cookies, but never touches the token itself: it can't, because it is httpOnly.",
      fileId: "frontend/src/services/request.js",
      match: 'credentials: "include",',
    },
  ],
  commonMistakes: [
    "Storing the login token in `localStorage` because it is easy to read from JavaScript. That is exactly what makes it easy to steal.",
    "Forgetting `secure` in production, or setting it in development and wondering why the cookie never appears over `http://`.",
    "Clearing the cookie with different options than it was set with, so logout seems to work but the cookie stays.",
    "Using `SameSite=None` to make cross-site requests work. It switches off the CSRF protection and requires `Secure`; prefer serving frontend and API from one site.",
  ],
  relatedConcepts: ["jwt", "https", "csrf", "xss", "http-headers"],
  relatedFiles: [],
  relatedBuildSteps: [],
};

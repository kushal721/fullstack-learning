import {
  analogy,
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

// OAuth: "Log in with Google" explained, the three roles and OpenID
// Connect, the authorize URL taken apart, state and PKCE, the code flow
// step by step, the callback, checking the ID token, linking accounts,
// scopes and the client secret, libraries and the Notes App, mistakes,
// practice and a recap.
export const oauthModule = moduleLesson(
  "oauth",
  "OAuth: “Log in with …”",
  50,
  [
    "Explain what happens when someone clicks “Log in with Google”, and who plays which role.",
    "Tell OAuth (permission) from OpenID Connect (identity).",
    "Walk through the authorization code flow, protected by state and PKCE.",
    "Check an ID token and link the provider's account to your own users table.",
    "Ask for the fewest scopes, keep the client secret on the server and know when to use a library.",
  ],

  part(
    "what",
    "“Log in with Google”, explained",
    explain(
      "Instead of making a password for your app, the user proves who they are to Google (or GitHub). Google then tells your app: this is Google user 1093…, with this email. Your app never sees their Google password. The standard behind it is [[oauth|OAuth 2.0]], plus a layer for identity on top.",
    ),
    diagram([
      ["Your app", "Log in with Google"],
      ["Google", "user signs in, agrees"],
      ["Your app", "gets a code, swaps it"],
      ["Logged in", "your own cookie"],
    ]),
    analogy(
      "A valet key: the car owner hands the valet a key that only starts the car, not one that opens the boot. You get limited access without the owner's own key.",
    ),
  ),

  part(
    "roles",
    "Three roles, and OpenID Connect",
    reference("Who's who in OAuth", [
      ["The user", "Owns the account at the provider and says yes or no."],
      [
        "Your app (the client)",
        "Asks for permission, gets tokens, logs the user in.",
        "the Notes App",
      ],
      [
        "The provider",
        "Signs the user in and issues codes and tokens.",
        "Google, GitHub",
      ],
    ]),
    explain(
      "Plain OAuth is about permission: \"this app may read your calendar\". It doesn't say who the user is. [[openid-connect|OpenID Connect]] (OIDC) adds that: ask for the `openid` scope and the provider also returns an ID token, a signed JWT whose `sub` is the user's id at that provider. Login with Google uses OIDC. GitHub uses plain OAuth: you call its API to ask who the user is.",
    ),
    quickCheck(
      "Which part tells your app who the user is?",
      [
        "The access token",
        "The ID token from OpenID Connect",
        "The client secret",
      ],
      1,
      "OAuth's access token says what your app may do at the provider. OpenID Connect's ID token is a signed statement of who the user is, which is what login needs.",
    ),
  ),

  part(
    "authorize",
    "Step 1: send the user to the provider",
    explain(
      "The [[authorization-code-flow|authorization code flow]] starts with a redirect. Your server builds a URL at the provider with a few query parameters and sends the browser there. Each parameter has a job.",
    ),
    anatomy(
      "The authorize URL's query (wrapped)",
      [
        "?response_type=code&client_id=notes-app",
        "&redirect_uri=https://notes.example/cb",
        "&scope=openid%20email&state=s9Kq",
        "&code_challenge=E9Mr&code_challenge_method=S256",
      ],
      [
        [
          "response_type=code",
          "want a code",
          "The provider sends back a one-time code, not tokens.",
        ],
        [
          "client_id",
          "who's asking",
          "Your app's public id, from the provider's dashboard.",
        ],
        [
          "redirect_uri",
          "come back here",
          "Must exactly match one you registered.",
        ],
        [
          "scope",
          "what you want",
          "openid for identity, email for the address. Nothing more.",
        ],
        [
          "state",
          "anti-forgery",
          "A random value you saved; it must come back unchanged.",
        ],
        [
          "code_challenge=",
          "PKCE",
          "The hash of a secret only your server knows.",
        ],
      ],
    ),
  ),

  part(
    "state-pkce",
    "state and PKCE",
    explain(
      "Before redirecting, the server makes two random values and saves them in a short-lived httpOnly cookie. The [[oauth-state|state]] comes back on the callback; if it doesn't match, someone is trying to slip their own login into the user's browser. With [[pkce|PKCE]], the server sends the hash of a secret now and the secret itself later, so a stolen code is useless.",
    ),
    code(
      "js",
      "Starting the login",
      [
        "const rand = () => crypto.randomBytes(32)",
        '  .toString("base64url");',
        "const state = rand();",
        "const verifier = rand();",
        "const challenge = crypto",
        '  .createHash("sha256").update(verifier)',
        '  .digest("base64url");',
        'res.cookie("oauth", { state, verifier }, {',
        "  httpOnly: true, signed: true,",
        "  maxAge: 10 * 60 * 1000,",
        "});",
        "res.redirect(authorizeUrl(state, challenge));",
      ],
      {
        4: "the PKCE secret: stays on the server side",
        5: "only this hash goes in the URL",
        8: "saved for the callback, for 10 minutes",
      },
    ),
  ),

  part(
    "flow",
    "The whole flow, step by step",
    explain(
      "Follow one login from the click to your own cookie. The browser carries the user to the provider and back, but the tokens are fetched server-to-server, so they never sit in a URL.",
    ),
    trace(
      "Log in with Google, from start to end",
      [
        'const saved = { state: "s9", verifier: "v7" };',
        "// 1. redirect to the provider",
        'go(authorizeUrl("s9", sha256("v7")));',
        "// 2. the user signs in and says yes",
        "// 3. the provider redirects back",
        'const query = { code: "c1", state: "s9" };',
        "if (query.state !== saved.state) {",
        '  throw new Error("bad state");',
        "}",
        "const tokens = exchange(query.code,",
        "  saved.verifier); // server to server",
        "const claims = checkIdToken(tokens.id_token);",
        "const user = findOrCreate(claims.sub);",
        "setLoginCookie(user.id);",
      ],
      [
        {
          line: 1,
          note: "Your server makes a random state and PKCE verifier and saves them in a cookie.",
          vars: [["saved", '{ state: "s9", verifier: "v7" }']],
        },
        {
          line: 3,
          note: "The browser is redirected to Google with the state and the hash of the verifier.",
          vars: [["saved", '{ state: "s9", verifier: "v7" }']],
        },
        {
          line: 6,
          note: "The user approved. Google redirects to your callback with a one-time code and the same state.",
          vars: [
            ["saved", '{ state: "s9", verifier: "v7" }'],
            ["query", '{ code: "c1", state: "s9" }'],
          ],
        },
        {
          line: 7,
          note: "s9 matches what you saved, so this is the login you started.",
          vars: [
            ["saved", '{ state: "s9", verifier: "v7" }'],
            ["query", '{ code: "c1", state: "s9" }'],
          ],
        },
        {
          line: 10,
          note: "Your server swaps the code plus the verifier (and client secret) for tokens. Google checks the verifier against the hash.",
          vars: [
            ["saved", "{ state, verifier }"],
            ["query", "{ code, state }"],
            ["tokens", '{ id_token: "eyJ…" }'],
          ],
        },
        {
          line: 12,
          note: "The ID token is checked: signature, issuer, audience, expiry.",
          vars: [
            ["saved", "{ state, verifier }"],
            ["query", "{ code, state }"],
            ["tokens", "{ id_token }"],
            ["claims", '{ sub: "1093", email: "ada@x.com" }'],
          ],
        },
        {
          line: 13,
          note: "Find the user linked to Google's id 1093, or create one.",
          vars: [
            ["saved", "{ state, verifier }"],
            ["query", "{ code, state }"],
            ["tokens", "{ id_token }"],
            ["claims", '{ sub: "1093", email: "ada@x.com" }'],
            ["user", "{ id: 7 }"],
          ],
        },
        {
          line: 14,
          note: "From here it's your normal login: your own token in your own cookie.",
          vars: [
            ["saved", "{ state, verifier }"],
            ["query", "{ code, state }"],
            ["tokens", "{ id_token }"],
            ["claims", "{ sub, email }"],
            ["user", "{ id: 7 }"],
          ],
        },
      ],
    ),
  ),

  part(
    "callback",
    "Step 2: the callback swaps the code",
    explain(
      'Your callback route checks state, then makes a server-to-server POST to the provider\'s token endpoint with the code, the PKCE verifier and your client secret. The code works once and only for a minute or so. If the user clicked "Cancel", the callback gets `?error=access_denied` instead of a code.',
    ),
    code(
      "http",
      "The token request, from your server",
      [
        "POST /token HTTP/1.1",
        "Host: oauth2.googleapis.com",
        "Content-Type: application/x-www-form-urlencoded",
        "",
        "grant_type=authorization_code&code=c1",
        "&redirect_uri=https://notes.example/cb",
        "&client_id=notes-app&client_secret=…",
        "&code_verifier=v7…",
      ],
      {
        7: "the secret: only ever sent from your server",
        8: "PKCE: proves you started this login",
      },
    ),
  ),

  part(
    "id-token",
    "Checking the ID token",
    explain(
      "The ID token is a JWT signed by the provider with its private key. Before trusting it, check four things: the signature (with the provider's published public keys), the issuer (`iss` is really Google), the audience (`aud` is your client id, not some other app's) and the expiry (`exp`). A library does all four: don't write it yourself.",
    ),
    code(
      "js",
      "With Google's library, google-auth-library",
      [
        "const google = new OAuth2Client(CLIENT_ID);",
        "const ticket = await google.verifyIdToken({",
        "  idToken: tokens.id_token,",
        "  audience: CLIENT_ID,",
        "});",
        "const claims = ticket.getPayload();",
        "// claims.sub, claims.email,",
        "// claims.email_verified",
      ],
      {
        3: "checks signature, iss and exp",
        5: "checks aud is your app",
        7: "only read claims after verifying",
      },
    ),
    keyPoints(
      "Signature: made with the provider's key.",
      "iss: the provider you expect.",
      "aud: your client id.",
      "exp: still in the future.",
    ),
  ),

  part(
    "linking",
    "Linking to your users table",
    explain(
      "Link the provider's account by provider plus its user id (`sub`), never by email alone. An email can change, may be unverified, and if you match on it, anyone who makes a provider account with your user's email could log in as them. If the email is already registered with a password, ask the user to log in with the password first, then link.",
    ),
    code(
      "sql",
      "One row per linked provider account",
      [
        "CREATE TABLE user_identities (",
        "  user_id INTEGER NOT NULL",
        "    REFERENCES users(id) ON DELETE CASCADE,",
        "  provider TEXT NOT NULL,",
        "  provider_user_id TEXT NOT NULL,",
        "  UNIQUE (provider, provider_user_id)",
        ");",
      ],
      {
        4: "'google' or 'github'",
        5: "the ID token's sub",
        6: "one provider account, one user",
      },
    ),
    keyPoints(
      "Look up by (provider, sub); create a user if there's none.",
      "Email alone is not proof of who someone is.",
      "OAuth-only users have no password: password_hash can be NULL.",
    ),
  ),

  part(
    "scopes-secret",
    "Scopes and the client secret",
    explain(
      "Scopes are what you ask permission for. For login, `openid email` is enough. Each extra scope makes the consent screen scarier and makes a leaked token more harmful, so ask for the least. The client secret proves to the provider that a request comes from your server: it belongs in a server environment variable, never in React code.",
    ),
    keyPoints(
      "Login only needs openid and email (maybe profile).",
      "Ask for more scopes later, when a feature needs them.",
      "Client secret: server only, never in the bundle.",
      "Register exact redirect URIs, no wildcards.",
    ),
  ),

  part(
    "libraries",
    "Libraries, hosted auth and the Notes App",
    explain(
      "You rarely write all this by hand. Passport (with a strategy per provider) and Auth.js handle the redirects, state, PKCE and token checks; openid-client is a lower-level choice. Hosted auth services such as Auth0, Clerk or Supabase Auth run the whole login for you, at the price of a dependency and a bill. Knowing the flow lets you configure them safely.",
    ),
    inTheNotesApp(
      "The Notes App has no OAuth: the auth routes are register, login, logout and me, all email and password. Adding Google would mean a start route, a callback route and a user_identities table.",
      { fileId: "backend/src/routes/auth.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Not checking state",
      wrong: [
        "const { code } = req.query;",
        "const tokens = await exchange(code);",
      ],
      problem:
        "An attacker can send the user to your callback with the attacker's own code, logging them into the attacker's account.",
      right: [
        "const { code, state } = req.query;",
        "if (!saved || state !== saved.state)",
        '  return res.status(400).send("Bad state");',
      ],
      why: "state ties the callback to a login this browser really started.",
    }),
    mistake({
      title: "Linking accounts by email",
      wrong: ["const user = await findUserByEmail(", "  claims.email);"],
      problem:
        "Someone who controls a provider account with that email address takes over your user's account.",
      right: ["const user = await findIdentity(", '  "google", claims.sub);'],
      why: "The provider's sub never changes and belongs to exactly one account there.",
    }),
    mistake({
      title: "Decoding the ID token without checking it",
      wrong: ["const claims = JSON.parse(atob(", '  idToken.split(".")[1]));'],
      problem:
        "Anyone can write a JWT payload. Without the signature, issuer and audience checks, it proves nothing.",
      right: [
        "const ticket = await google.verifyIdToken(",
        "  { idToken, audience: CLIENT_ID });",
      ],
      why: "Verify first, then read the claims.",
    }),
    mistake({
      title: "The client secret in the front end",
      language: "jsx",
      wrong: ['const SECRET = "gOcSpX-4f…"; // App.jsx'],
      problem:
        "Everything in the React bundle is public. Anyone can now pretend to be your app.",
      right: ["// server only", "const SECRET = process.env.GOOGLE_SECRET;"],
      why: "The code swap happens on the server, so only the server needs the secret.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Build the authorize parameters",
      task: 'Write `authorizeParams({ clientId, redirectUri, state, challenge })` that returns an object with `response_type: "code"`, `client_id`, `redirect_uri`, `scope: "openid email"`, `state`, `code_challenge` and `code_challenge_method: "S256"`.',
      starter: [
        "function authorizeParams(o) {",
        "  return {",
        "    client_id: o.clientId,",
        "    redirect_uri: o.redirectUri,",
        "  };",
        "}",
      ],
      tests: [
        [
          'authorizeParams({ clientId: "notes-app", redirectUri: "https://n.x/cb", state: "s9", challenge: "E9" })',
          '{ response_type: "code", client_id: "notes-app", redirect_uri: "https://n.x/cb", scope: "openid email", state: "s9", code_challenge: "E9", code_challenge_method: "S256" }',
        ],
        [
          'authorizeParams({ clientId: "a", redirectUri: "b", state: "c", challenge: "d" }).code_challenge_method',
          '"S256"',
        ],
      ],
      hint: "Seven keys. Two are fixed text, one is the scope, the other four come from the argument.",
      solution: [
        "function authorizeParams(o) {",
        "  return {",
        '    response_type: "code",',
        "    client_id: o.clientId,",
        "    redirect_uri: o.redirectUri,",
        '    scope: "openid email",',
        "    state: o.state,",
        "    code_challenge: o.challenge,",
        '    code_challenge_method: "S256",',
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Check the callback",
      task: 'Write `checkCallback(query, savedState)`. If `query.error` is set return `{ error: "denied" }`. If there\'s no savedState or `query.state` differs, return `{ error: "state" }`. If there\'s no `query.code`, return `{ error: "code" }`. Otherwise return `{ code: query.code }`.',
      starter: [
        "function checkCallback(query, savedState) {",
        "  return { code: query.code };",
        "}",
      ],
      tests: [
        ['checkCallback({ code: "c1", state: "s9" }, "s9")', '{ code: "c1" }'],
        [
          'checkCallback({ code: "c1", state: "evil" }, "s9")',
          '{ error: "state" }',
        ],
        [
          'checkCallback({ error: "access_denied", state: "s9" }, "s9")',
          '{ error: "denied" }',
        ],
        [
          'checkCallback({ code: "c1", state: undefined }, undefined)',
          '{ error: "state" }',
        ],
        ['checkCallback({ state: "s9" }, "s9")', '{ error: "code" }'],
      ],
      hint: "Check in order: error, then `!savedState || query.state !== savedState`, then `!query.code`.",
      solution: [
        "function checkCallback(query, savedState) {",
        '  if (query.error) return { error: "denied" };',
        "  if (!savedState || query.state !== savedState) {",
        '    return { error: "state" };',
        "  }",
        '  if (!query.code) return { error: "code" };',
        "  return { code: query.code };",
        "}",
      ],
    }),
    yourTurn({
      title: "Check the ID token's claims",
      task: 'The signature is already checked. Write `checkIdToken(claims, { issuer, audience, now })` returning `"issuer"`, `"audience"` or `"expired"` for the first problem found, or `"ok"`. `aud` may be a string or an array. `exp` and `now` are seconds; expired means `exp <= now`.',
      starter: [
        "function checkIdToken(claims, { issuer, audience, now }) {",
        '  if (claims.exp <= now) return "expired";',
        '  return "ok";',
        "}",
      ],
      tests: [
        [
          'checkIdToken({ iss: "https://accounts.google.com", aud: "notes", exp: 200 }, { issuer: "https://accounts.google.com", audience: "notes", now: 100 })',
          '"ok"',
        ],
        [
          'checkIdToken({ iss: "https://evil.example", aud: "notes", exp: 200 }, { issuer: "https://accounts.google.com", audience: "notes", now: 100 })',
          '"issuer"',
        ],
        [
          'checkIdToken({ iss: "g", aud: "other-app", exp: 200 }, { issuer: "g", audience: "notes", now: 100 })',
          '"audience"',
        ],
        [
          'checkIdToken({ iss: "g", aud: ["x", "notes"], exp: 200 }, { issuer: "g", audience: "notes", now: 100 })',
          '"ok"',
        ],
        [
          'checkIdToken({ iss: "g", aud: "notes", exp: 100 }, { issuer: "g", audience: "notes", now: 100 })',
          '"expired"',
        ],
      ],
      hint: "`[].concat(claims.aud)` turns a string or an array into an array; then use `.includes(audience)`.",
      solution: [
        "function checkIdToken(claims, { issuer, audience, now }) {",
        '  if (claims.iss !== issuer) return "issuer";',
        "  const aud = [].concat(claims.aud);",
        '  if (!aud.includes(audience)) return "audience";',
        '  if (claims.exp <= now) return "expired";',
        '  return "ok";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("OAuth cheat sheet", [
      ["OAuth 2.0", "Lets an app act for a user at a provider, by scopes."],
      [
        "OpenID Connect",
        "Adds an ID token saying who the user is.",
        "scope=openid email",
      ],
      [
        "Code flow",
        "Redirect, user agrees, code back, server swaps it.",
        "response_type=code",
      ],
      ["state", "Random, saved, must match on the callback.", "state=s9Kq"],
      [
        "PKCE",
        "Hash now, secret at the swap: stolen codes are useless.",
        "code_challenge_method=S256",
      ],
      [
        "ID token checks",
        "Signature, iss, aud, exp: use a library.",
        "verifyIdToken({ idToken,\n  audience })",
      ],
      [
        "Linking",
        "By provider + sub, never email alone.",
        "UNIQUE (provider,\n  provider_user_id)",
      ],
      ["Scopes", "Ask for the least you need."],
      ["Client secret", "Server environment only; never in the front end."],
      [
        "Don't hand-roll",
        "Passport, Auth.js, or hosted auth like Auth0 or Clerk.",
      ],
    ]),
    quickCheck(
      "The callback arrives with a valid code but a state that doesn't match the saved one. What do you do?",
      [
        "Swap the code anyway: it came from Google",
        "Refuse the login",
        "Use the state from the URL instead",
      ],
      1,
      "A state that doesn't match means this browser didn't start this login. Someone may be trying to log the user into the attacker's account, so refuse.",
    ),
  ),
);

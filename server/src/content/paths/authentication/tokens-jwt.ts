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

// Tokens (JWT): what a JWT is, a token taken apart, claims, a payload anyone
// can read, the signature, jwt.sign and jwt.verify, checking a token step by
// step, algorithm confusion and alg: none, where the browser keeps it, JWTs
// or sessions, mistakes, practice and a recap.
export const tokensJwtModule = moduleLesson(
  "tokens-jwt",
  "Tokens: JSON Web Tokens (JWT)",
  50,
  [
    "Take a JWT apart into its header, payload and signature, and read its claims.",
    "Explain why anyone can read a payload but nobody can change it without the secret.",
    "Sign a token with jwt.sign and check it with jwt.verify, pinning the algorithm.",
    "Choose where the browser keeps a token: an httpOnly cookie, not localStorage.",
    "Weigh JWTs against server-side sessions.",
  ],

  part(
    "what-it-is",
    "A signed note about who you are",
    explain(
      "After a good login, the server has to remember who you are on every later request. A [[jwt]] is one way: the server writes a short note, “this is user 3, valid for 7 days”, signs it with a secret only it knows, and hands it to the browser. Each request brings the note back, and the server checks the signature instead of looking anything up.",
    ),
    analogy(
      "A festival wristband: staff glance at it and let you in. They can't take it back, but nobody can make one without the official stamp.",
    ),
    diagram([
      ["Login", "password OK"],
      ["jwt.sign", "{ sub: 3 }"],
      ["Cookie", "token=eyJ…"],
      ["requireAuth", "jwt.verify"],
      ["req.user", "{ id: 3 }"],
    ]),
    inTheNotesApp(
      "`login` in authController.js signs a token with `jwt.sign` and sends it in the `token` cookie; `requireAuth` checks it with `jwt.verify` on every notes request.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "anatomy",
    "A token, taken apart",
    explain(
      "A JWT is three pieces of text joined by dots: `header.payload.signature`. The header and payload are JSON, written in base64url: a way to turn any bytes into letters, digits, `-` and `_`, so the token is safe in a cookie or URL. That is an *encoding*, not a lock: anyone can turn it back.",
    ),
    anatomy(
      "A Notes App token on three lines (the payload shortened)",
      [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        ".eyJzdWIiOjMsImlhdCI6MTc2NDAwMDAwMCwi…",
        ".oD6ViKQ323mir-Q5n5ofVL0-r7mv46loH9XuDDuH-fw",
      ],
      [
        [
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
          "header",
          'Decodes to {"alg":"HS256","typ":"JWT"}: how it was signed.',
        ],
        [".", "a dot", "Separates the parts. A token has exactly two."],
        [
          "eyJzdWIiOjMsImlhdCI6MTc2NDAwMDAwMCwi…",
          "payload",
          'The claims: who the token is about and when it expires. Every token whose payload starts with {"sub" begins eyJzdWIi.',
        ],
        [
          "oD6ViKQ323mir-Q5n5ofVL0-r7mv46loH9XuDDuH-fw",
          "signature",
          "Made from the header, the payload and the server's secret. Change one character above and it no longer matches.",
        ],
      ],
    ),
    code(
      "js",
      "The same token, decoded",
      [
        "// header",
        '{ "alg": "HS256", "typ": "JWT" }',
        "// payload",
        '{ "sub": 3, "iat": 1764000000,',
        '  "exp": 1764604800 }',
        "// signature: 32 bytes, not JSON",
      ],
      { 2: "HS256: HMAC with SHA-256", 4: "user 3, issued at…" },
    ),
  ),

  part(
    "claims",
    "Claims: sub, iat and exp",
    explain(
      "The fields in the payload are [[jwt-claims|claims]]. Three are standard and short on purpose: `sub` (subject: who it's about), `iat` (issued at) and `exp` (expires). Times are seconds since 1 January 1970, not milliseconds like `Date.now()`. `exp` gives every token a [[token-expiry|built-in expiry]], so a stolen one stops working eventually.",
    ),
    code(
      "js",
      "The Notes App's payload",
      ["{", '  "sub": 3,', '  "iat": 1764000000,', '  "exp": 1764604800', "}"],
      {
        2: "the user's id: requireAuth reads this",
        3: "added by jwt.sign: 24 Nov 2025, 16:00 UTC",
        4: "iat + 7 days (604800 seconds)",
      },
    ),
    quickCheck(
      "`Date.now()` is `1764604800000`. The token's `exp` is `1764604800`. Has it expired?",
      [
        "No: exp is a much smaller number",
        "Yes: in seconds, now has reached exp",
        "Only once the cookie has expired too",
      ],
      1,
      "exp is in seconds and Date.now() in milliseconds. Divide by 1000 first: now is 1764604800, equal to exp, and jsonwebtoken treats a token as expired once now reaches exp.",
    ),
  ),

  part(
    "readable",
    "Anyone can read the payload",
    explain(
      "Copy a token into any JWT decoder website and the payload appears. No secret is needed to *read* it, only to *make* one. So treat a payload as public: an id is fine, because it's useless without a valid signature. A password, a password hash, an API key or private details are not: the token sits in browsers, logs and proxies.",
    ),
    keyPoints(
      "Base64url is an encoding: anyone can decode it.",
      "The signature stops changes, not reading.",
      "Put ids in the payload, never secrets or personal data.",
      "Keep it small: the cookie travels with every request.",
    ),
    quickCheck(
      "Which payload is safe to put in a token?",
      [
        '{ "sub": 3, "email": "ana@…", "passwordHash": "$2b$…" }',
        '{ "sub": 3 }',
        '{ "sub": 3, "apiKey": "sk_live_…" }',
      ],
      1,
      "Anyone holding the token can decode its payload. The user id is all requireAuth needs; the hash and the API key would leak to anyone who sees the cookie.",
    ),
  ),

  part(
    "signature",
    "The signature: HS256 and JWT_SECRET",
    explain(
      "The [[jwt-signature|signature]] is HMAC-SHA256 (HS256) of `header.payload`, computed with the server's secret. Only someone with the secret can produce the right signature for a payload. If an attacker changes `sub` from 3 to 4, the old signature no longer matches and the server refuses the token. The secret lives in `JWT_SECRET`, an environment variable, never in the code.",
    ),
    diagram([
      ["header.payload", "the text"],
      ["+ JWT_SECRET", "only the server"],
      ["HMAC-SHA256", "HS256"],
      ["signature", "oD6ViKQ…"],
    ]),
    keyPoints(
      "Same text + same secret = same signature, every time.",
      "Change one character of the payload: a different signature.",
      "Use a long random secret, 32 bytes or more.",
      "A leaked secret lets anyone forge any user's token.",
    ),
  ),

  part(
    "sign-verify",
    "jwt.sign and jwt.verify",
    explain(
      "The `jsonwebtoken` package does both halves. `jwt.sign(payload, secret, options)` adds `iat`, turns `expiresIn` into `exp`, and returns the token. `jwt.verify(token, secret)` returns the payload if the token is good, and throws if it isn't. It is the only safe way to read a token: `jwt.decode` reads it without checking anything.",
    ),
    code(
      "js",
      "Login signs; requireAuth verifies",
      [
        "// login, in authController.js",
        "const token = jwt.sign(",
        "  { sub: user.id },",
        "  process.env.JWT_SECRET,",
        '  { expiresIn: "7d" },',
        ");",
        "",
        "// requireAuth, in authMiddleware.js",
        "const payload = jwt.verify(",
        "  token,",
        "  process.env.JWT_SECRET,",
        ");",
        "req.user = { id: payload.sub };",
      ],
      {
        3: "the claims you choose; iat is added",
        5: "becomes exp: iat + 7 days",
        9: "throws if anything is wrong",
        13: "only reached with a good token",
      },
    ),
    reference("What jwt.verify checks", [
      ["Shape", "Three parts with two dots.", "jwt malformed"],
      ["Algorithm", "The header's alg is one it accepts.", "invalid algorithm"],
      [
        "Signature",
        "Recomputed with the secret; must match.",
        "invalid signature",
      ],
      ["exp", "Now is before exp, if exp is set.", "jwt expired"],
      ["nbf", "Now is after “not before”, if set.", "jwt not active"],
    ]),
  ),

  part(
    "step-by-step",
    "Checking a token, step by step",
    explain(
      "Here is the idea behind `jwt.verify`, with the details simplified: the payload is shown already decoded, and `sign()` stands in for HMAC-SHA256 with the secret. Follow a good token through it.",
    ),
    trace(
      "A simplified verify",
      [
        "function check(token, now) {",
        '  const [h, body, sig] = token.split(".");',
        '  if (sig !== sign(h + "." + body)) {',
        '    return "bad signature";',
        "  }",
        "  const claims = JSON.parse(body);",
        '  if (now >= claims.exp) return "expired";',
        '  return "user " + claims.sub;',
        "}",
        "const token =",
        '  \'h.{"sub":3,"exp":100}.Xy7\';',
        "console.log(check(token, 50));",
      ],
      [
        {
          line: 10,
          note: "A token: header, payload (decoded, to keep it readable) and signature. sign() is given: it plays the secret HMAC.",
          vars: [
            ["sign", "ƒ sign(text)"],
            ["token", '\'h.{"sub":3,"exp":100}.Xy7\''],
          ],
        },
        {
          line: 12,
          note: "Check it at time 50.",
          vars: [
            ["sign", "ƒ sign(text)"],
            ["token", "'h.{…}.Xy7'"],
          ],
        },
        {
          line: 2,
          note: "Split at the dots into the three parts.",
          vars: [
            ["sign", "ƒ sign(text)"],
            ["token", "'h.{…}.Xy7'"],
            ["now", "50"],
            ["h", '"h"'],
            ["body", '\'{"sub":3,"exp":100}\''],
            ["sig", '"Xy7"'],
          ],
          stack: ["check"],
        },
        {
          line: 3,
          note: 'Sign header.payload again: sign gives "Xy7", the same as sig. Nobody changed the token.',
          vars: [
            ["sign", "ƒ sign(text)"],
            ["token", "'h.{…}.Xy7'"],
            ["now", "50"],
            ["h", '"h"'],
            ["body", '\'{"sub":3,"exp":100}\''],
            ["sig", '"Xy7"'],
          ],
          stack: ["check"],
        },
        {
          line: 6,
          note: "Only now is the payload trusted and parsed.",
          vars: [
            ["sign", "ƒ sign(text)"],
            ["token", "'h.{…}.Xy7'"],
            ["now", "50"],
            ["h", '"h"'],
            ["body", '\'{"sub":3,"exp":100}\''],
            ["sig", '"Xy7"'],
            ["claims", "{ sub: 3, exp: 100 }"],
          ],
          stack: ["check"],
        },
        {
          line: 7,
          note: "50 >= 100 is false: not expired yet.",
          vars: [
            ["sign", "ƒ sign(text)"],
            ["token", "'h.{…}.Xy7'"],
            ["now", "50"],
            ["h", '"h"'],
            ["body", '\'{"sub":3,"exp":100}\''],
            ["sig", '"Xy7"'],
            ["claims", "{ sub: 3, exp: 100 }"],
          ],
          stack: ["check"],
        },
        {
          line: 8,
          note: "A good token: the request belongs to user 3.",
          vars: [
            ["sign", "ƒ sign(text)"],
            ["token", "'h.{…}.Xy7'"],
            ["now", "50"],
            ["h", '"h"'],
            ["body", '\'{"sub":3,"exp":100}\''],
            ["sig", '"Xy7"'],
            ["claims", "{ sub: 3, exp: 100 }"],
          ],
          stack: ["check"],
        },
        {
          line: 12,
          note: 'Had someone changed "sub":3 to 4, sign() would give a different value and check would stop at line 4.',
          vars: [
            ["sign", "ƒ sign(text)"],
            ["token", "'h.{…}.Xy7'"],
          ],
          output: "user 3",
        },
      ],
    ),
  ),

  part(
    "algorithms",
    "Algorithm confusion and alg: none",
    explain(
      "The header names its own algorithm, and the attacker writes the header. Old libraries trusted it: `alg: none` meant “no signature, accept it”, and a token claiming HS256 could trick a server that expects RS256 into using its *public* key as the HMAC secret. The fix is to tell verify which algorithm you use, and accept nothing else.",
    ),
    code(
      "js",
      "Pin the algorithm on both sides",
      [
        "jwt.sign({ sub: user.id }, secret, {",
        '  algorithm: "HS256",',
        '  expiresIn: "7d",',
        "});",
        "",
        "jwt.verify(token, secret, {",
        '  algorithms: ["HS256"],',
        "});",
      ],
      {
        2: "HS256 is also sign's default",
        7: "a list: only these are accepted",
      },
    ),
    keyPoints(
      "The Notes App's verify call doesn't pass algorithms.",
      "jsonwebtoken 9 then allows only HS256/384/512 for a text secret.",
      "It also refuses unsigned tokens when given a secret.",
      "Older versions and other libraries were laxer: pin it anyway.",
    ),
  ),

  part(
    "storage",
    "Where the browser keeps the token",
    explain(
      "A token in `localStorage` can be read by any script on the page, so one XSS bug (an attacker's script running on your site) can copy it and use it elsewhere. An httpOnly cookie can't be read by scripts at all, and the browser attaches it by itself. The price: a cookie is sent automatically, so its `SameSite` setting must stop other sites from using it. See [[secure-cookies|secure cookies]].",
    ),
    reference("Three places to keep a token", [
      [
        "httpOnly cookie",
        "Scripts can't read it; sent automatically. Needs SameSite and Secure.",
        "Set-Cookie: token=…; HttpOnly",
      ],
      [
        "localStorage",
        "Survives reloads, but any script on the page can read it.",
        'localStorage.getItem("token")',
      ],
      [
        "A JS variable",
        "Gone on reload; still readable by scripts running in the page.",
        "let token = data.token;",
      ],
    ]),
    inTheNotesApp(
      "The Notes App uses an httpOnly, SameSite=Lax cookie. Because the front end can't read it, `getCurrentUser()` asks `GET /api/auth/me` who is logged in.",
      { fileId: "frontend/src/services/authApi.js" },
    ),
  ),

  part(
    "vs-sessions",
    "JWTs or sessions?",
    explain(
      "With a [[server-session|server-side session]], the cookie holds a random id and the server looks it up on each request. With a JWT, the cookie holds the facts themselves, signed. No lookup is fast and needs no shared store, but it has a cost: the server can't easily take a token back before `exp`. The logging out module deals with that.",
    ),
    reference("Side by side", [
      ["Cookie holds", "Session: a random id. JWT: signed claims."],
      ["Each request", "Session: a lookup. JWT: check a signature."],
      ["Logging out", "Session: delete the row. JWT: valid until exp."],
      ["Several servers", "Session: a shared store. JWT: a shared secret."],
      ["Good fit", "Session: most websites. JWT: APIs, many services."],
    ]),
    quickCheck(
      "A user's laptop is stolen and they want the thief logged out now. Which setup makes that easiest?",
      [
        "JWTs that last 7 days",
        "Server-side sessions",
        "JWTs stored in localStorage",
      ],
      1,
      "Deleting the session rows ends every login at once. A 7-day JWT keeps working until exp unless you add a way to revoke it.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Reading the token without verifying it",
      wrong: [
        "const payload = jwt.decode(token);",
        "req.user = { id: payload.sub };",
      ],
      problem:
        "decode checks nothing. Anyone can write a payload saying sub: 1 and be user 1.",
      right: [
        "const payload = jwt.verify(token, secret, {",
        '  algorithms: ["HS256"],',
        "});",
      ],
      why: "verify checks the signature and the expiry before you trust a single claim.",
    }),
    mistake({
      title: "Milliseconds in expiresIn",
      wrong: [
        "jwt.sign({ sub: id }, secret, {",
        "  expiresIn: 7 * 24 * 60 * 60 * 1000,",
        "});",
      ],
      problem:
        "A number in expiresIn means seconds, so this token lasts about 19 years, not 7 days.",
      right: ["jwt.sign({ sub: id }, secret, {", '  expiresIn: "7d",', "});"],
      why: 'A string like "7d" or "15m" is clear. Cookie maxAge is in ms; JWT times are in seconds.',
    }),
    mistake({
      title: "A weak or committed secret",
      wrong: ['const SECRET = "secret";'],
      problem:
        "Short secrets can be guessed offline from one token, and a secret in the code ends up in Git for everyone.",
      right: ["const SECRET = process.env.JWT_SECRET;"],
      why: "A long random secret, kept in an environment variable, can't be guessed or read from the repository.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Split a JWT",
      task: "Write `splitJwt(token)`. Return `{ header, payload, signature }` if the token has exactly three parts separated by dots and none of them is empty. Otherwise return `null`.",
      starter: [
        "function splitJwt(token) {",
        '  return token.split(".");',
        "}",
      ],
      tests: [
        [
          'splitJwt("aaa.bbb.ccc")',
          '{ header: "aaa", payload: "bbb", signature: "ccc" }',
        ],
        ['splitJwt("aaa.bbb")', "null"],
        ['splitJwt("aaa.bbb.ccc.ddd")', "null"],
        ['splitJwt("aaa..ccc")', "null"],
      ],
      hint: "Split, then check `parts.length === 3` and that every part is non-empty with `parts.every((p) => p)`.",
      solution: [
        "function splitJwt(token) {",
        '  const parts = token.split(".");',
        "  if (parts.length !== 3) return null;",
        "  if (!parts.every((p) => p)) return null;",
        "  const [header, payload, signature] = parts;",
        "  return { header, payload, signature };",
        "}",
      ],
    }),
    yourTurn({
      title: "Valid or expired?",
      task: 'Write `readClaims(payload, now)`. `payload` is already decoded; `now` is in milliseconds, like `Date.now()`. Return `"invalid"` if `sub` or `exp` is missing, `"expired"` once now (in seconds) has reached `exp`, and `"valid"` otherwise.',
      starter: [
        "function readClaims(payload, now) {",
        '  return now < payload.exp ? "valid" : "expired";',
        "}",
      ],
      tests: [
        ["readClaims({ sub: 3, iat: 1000, exp: 2000 }, 1500000)", '"valid"'],
        ["readClaims({ sub: 3, exp: 2000 }, 2000000)", '"expired"'],
        ["readClaims({ sub: 3, exp: 2000 }, 1999999)", '"valid"'],
        ["readClaims({ sub: 3 }, 0)", '"invalid"'],
        ["readClaims({ exp: 2000 }, 0)", '"invalid"'],
      ],
      hint: "exp is in seconds: compare it with `now / 1000`. Check for missing claims with `=== undefined` first.",
      solution: [
        "function readClaims(payload, now) {",
        "  const { sub, exp } = payload;",
        "  if (sub === undefined || exp === undefined) {",
        '    return "invalid";',
        "  }",
        '  if (now / 1000 >= exp) return "expired";',
        '  return "valid";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("JWT cheat sheet", [
      [
        "JWT",
        "header.payload.signature, in base64url.",
        "eyJhbGci….eyJzdWIi….oD6V…",
      ],
      [
        "Claims",
        "sub = who, iat = issued, exp = expires.",
        '{ "sub": 3, "exp": 1764604800 }',
      ],
      ["Times", "Seconds since 1970, not milliseconds.", "Date.now() / 1000"],
      [
        "Payload",
        "Readable by anyone: ids only, no secrets.",
        "{ sub: user.id }",
      ],
      [
        "Signature",
        "HMAC-SHA256 of header.payload with the secret.",
        "JWT_SECRET",
      ],
      [
        "jwt.sign",
        "Makes a token; adds iat and exp.",
        'jwt.sign(p, s, { expiresIn: "7d" })',
      ],
      [
        "jwt.verify",
        "Checks signature and expiry, or throws.",
        "jwt.verify(token, secret, opts)",
      ],
      [
        "Pin the algorithm",
        "Accept only what you sign with.",
        'algorithms: ["HS256"]',
      ],
      [
        "Browser storage",
        "httpOnly cookie, not localStorage.",
        'res.cookie("token", t, opts)',
      ],
      ["Trade-off", "No lookup, but hard to revoke early.", "valid until exp"],
    ]),
    quickCheck(
      'An attacker edits a Notes App token\'s payload from `"sub":3` to `"sub":4`. What happens?',
      [
        "They're logged in as user 4",
        "jwt.verify throws and requireAuth answers 401",
        "The server decodes it and asks the database",
      ],
      1,
      "The signature was made for the old payload. verify recomputes it with JWT_SECRET, it no longer matches, and requireAuth's catch answers 401.",
    ),
  ),
);

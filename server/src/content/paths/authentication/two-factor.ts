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

// Two-factor login: three kinds of factor, TOTP codes, setting up an
// authenticator app (the QR code taken apart), checking a code step by
// step, SMS and its weak spots, passkeys, recovery codes, login with a
// second step, remembering a device, the Notes App, mistakes, practice and
// a recap.
export const twoFactorModule = moduleLesson(
  "two-factor",
  "Two-factor login",
  50,
  [
    "Name the three kinds of factor and why a second one stops stolen passwords.",
    "Explain how TOTP codes work and check one with a window for drift and no reuse.",
    "Compare SMS codes, authenticator apps and passkeys.",
    "Store recovery codes hashed and let each one work only once.",
    'Build a login with a "2FA pending" step between the password and the full session.',
  ],

  part(
    "factors",
    "A stolen password isn't enough",
    explain(
      "Passwords leak, get reused and get phished. [[two-factor-auth|Two-factor login]] asks for a second proof of a different kind, so a password alone doesn't get in. The kinds are called factors: something you know, something you have, something you are. Two passwords are still one factor.",
    ),
    reference("The three kinds of factor", [
      ["Something you know", "A password or PIN.", "correct horse battery"],
      [
        "Something you have",
        "A phone with an app, a security key, a passkey.",
        "a 6-digit code",
      ],
      ["Something you are", "A fingerprint or face, used on your device."],
    ]),
    analogy(
      "A cash machine wants your card and your PIN. A thief who saw your PIN still needs the card, and one who stole the card still needs the PIN.",
    ),
  ),

  part(
    "totp",
    "TOTP: codes from a shared secret",
    explain(
      "[[totp|TOTP]] is what authenticator apps do. At setup, your server and the user's app share a random secret. After that, both take the current time, count which 30-second window it falls in, and mix the window number with the secret (an HMAC) into a 6-digit code. Same secret, same window, same code: nothing is sent between them.",
    ),
    diagram([
      ["secret", "shared once"],
      ["time ÷ 30", "window number"],
      ["HMAC", "mix them"],
      ["6 digits", "e.g. 481023"],
    ]),
    keyPoints(
      "The secret is shared once, at setup, then never travels again.",
      "A new code every 30 seconds.",
      "The server works out the same code and compares.",
      "Phone offline? Still works: it only needs the clock.",
    ),
  ),

  part(
    "setup",
    "Setting up an authenticator app",
    explain(
      "The server makes a secret and shows it as a QR code. The QR code holds one `otpauth://` URI, which the app scans. Before turning 2FA on, ask for one code from the app, to prove the scan worked. The server needs the secret itself to compute codes, so it can't be hashed: store it encrypted.",
    ),
    anatomy(
      "What the QR code holds (one URI, wrapped)",
      [
        "otpauth://totp/",
        "Notes%20App:ada@example.com",
        "?secret=JBSWY3DPEHPK3PXP",
        "&issuer=Notes%20App&digits=6&period=30",
      ],
      [
        ["totp", "the kind", "Time-based codes."],
        [
          "ada@example.com",
          "the label",
          "Shown in the app so the user knows which account it is.",
        ],
        [
          "secret=",
          "the secret",
          "Random bytes in base32. Whoever has it can make codes.",
        ],
        ["issuer=", "your app", "The name shown above the code."],
        ["digits=6", "length", "Six digits per code."],
        ["period=30", "window", "A new code every 30 seconds."],
      ],
    ),
    code(
      "js",
      "With a library such as otplib",
      [
        'import { authenticator } from "otplib";',
        "const secret = authenticator.generateSecret();",
        "const uri = authenticator.keyuri(",
        '  user.email, "Notes App", secret);',
        "// turn uri into a QR code image",
        "authenticator.verify({ token, secret });",
      ],
      {
        2: "store it encrypted, not hashed",
        6: "true if token is the code for now",
      },
    ),
  ),

  part(
    "verify",
    "Checking a code, step by step",
    explain(
      "Clocks drift and people type slowly, so accept the window before and after the current one too. And refuse a code that was already used: whoever watched it being typed must not get in with it. Remember the last window each user used.",
    ),
    trace(
      "One window either side, and no reuse",
      [
        'const codes = { 99: "481023",',
        '  100: "907114", 101: "335260" };',
        "const used = new Set();",
        "function verify(code, now) {",
        "  const w = Math.floor(now / 30);",
        "  for (const d of [-1, 0, 1]) {",
        "    if (codes[w + d] !== code) continue;",
        "    if (used.has(w + d)) return false;",
        "    used.add(w + d);",
        "    return true;",
        "  }",
        "  return false;",
        "}",
        'console.log(verify("481023", 3005));',
        'console.log(verify("481023", 3010));',
      ],
      [
        {
          line: 3,
          note: "codes stands in for the real calculation: the code for windows 99, 100 and 101.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(0) {}"],
          ],
        },
        {
          line: 14,
          note: "The user typed the code they saw a few seconds ago. It's now 3005 seconds.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(0) {}"],
          ],
        },
        {
          line: 5,
          note: "3005 ÷ 30 rounded down: window 100.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(0) {}"],
            ["code", '"481023"'],
            ["now", "3005"],
            ["w", "100"],
          ],
          stack: ["verify"],
        },
        {
          line: 7,
          note: "Try the window before first (d = -1): window 99's code is 481023. A match.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(0) {}"],
            ["code", '"481023"'],
            ["now", "3005"],
            ["w", "100"],
            ["d", "-1"],
          ],
          stack: ["verify"],
        },
        {
          line: 8,
          note: "Window 99 hasn't been used yet.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(0) {}"],
            ["code", '"481023"'],
            ["now", "3005"],
            ["w", "100"],
            ["d", "-1"],
          ],
          stack: ["verify"],
        },
        {
          line: 9,
          note: "Remember it, so this code can't be used again.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(1) { 99 }"],
            ["code", '"481023"'],
            ["now", "3005"],
            ["w", "100"],
            ["d", "-1"],
          ],
          stack: ["verify"],
        },
        {
          line: 10,
          note: "Accepted.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(1) { 99 }"],
            ["code", '"481023"'],
            ["now", "3005"],
            ["w", "100"],
            ["d", "-1"],
          ],
          stack: ["verify"],
          output: "true",
        },
        {
          line: 15,
          note: "Five seconds later, someone who watched sends the same code.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(1) { 99 }"],
          ],
        },
        {
          line: 7,
          note: "Still window 100, and window 99's code matches again.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(1) { 99 }"],
            ["code", '"481023"'],
            ["now", "3010"],
            ["w", "100"],
            ["d", "-1"],
          ],
          stack: ["verify"],
        },
        {
          line: 8,
          note: "But window 99 was already used: refused.",
          vars: [
            ["codes", "{ 99, 100, 101 }"],
            ["used", "Set(1) { 99 }"],
            ["code", '"481023"'],
            ["now", "3010"],
            ["w", "100"],
            ["d", "-1"],
          ],
          stack: ["verify"],
          output: "false",
        },
      ],
    ),
  ),

  part(
    "sms",
    "SMS codes and their weak spots",
    explain(
      "Texting a code is easy for users and much better than no second factor. But attackers can talk a phone company into moving your number to their SIM (a SIM swap), some networks can be snooped on, and a fake login page can simply ask for the code and use it at once. Offer an authenticator app or a passkey as the stronger choice.",
    ),
    keyPoints(
      "SMS: better than nothing, weakest of the second factors.",
      "SIM swaps move your number, and your codes, to a thief.",
      "Any typed code can be phished by a fake site in real time.",
      "Texts cost money and sometimes don't arrive.",
    ),
  ),

  part(
    "passkeys",
    "Passkeys and WebAuthn",
    explain(
      "A [[passkey|passkey]] replaces codes with a key pair, through the browser's WebAuthn API. The device keeps the private key, unlocked by fingerprint, face or PIN. Your server stores only the public key. At login it sends a random challenge; the device signs it; the server checks the signature. The browser only uses a passkey on the domain it was made for, so a fake site gets nothing.",
    ),
    diagram([
      ["server", "random challenge"],
      ["device", "signs, after fingerprint"],
      ["server", "checks with public key"],
    ]),
    keyPoints(
      "Phishing-resistant: tied to your real domain.",
      "Server keeps a public key: nothing worth stealing.",
      "Nothing to type, nothing to reuse.",
      "Use a library such as SimpleWebAuthn for the server checks.",
    ),
  ),

  part(
    "recovery",
    "Recovery codes",
    explain(
      "Phones get lost. At setup, show about ten [[recovery-codes|recovery codes]] once and ask the user to keep them somewhere safe. Each works one time, instead of a 2FA code. Store them like passwords, hashed, and delete each one when it's used. Without them, a lost phone means a support process that attackers will try to talk their way through.",
    ),
    code(
      "js",
      "Making and checking recovery codes",
      [
        "const codes = Array.from({ length: 10 },",
        '  () => crypto.randomBytes(5).toString("hex"));',
        "const hashes = await Promise.all(",
        "  codes.map((c) => bcrypt.hash(c, 12)));",
        "// save hashes; show codes once",
        "",
        "for (const row of await recoveryRows(id)) {",
        "  if (await bcrypt.compare(typed, row.hash)) {",
        "    await deleteRecoveryRow(row.id);",
        "    return true; // single use",
        "  }",
        "}",
      ],
      {
        2: "10 random hex characters each",
        5: "the user sees them now and never again",
        9: "used: gone for good",
      },
    ),
  ),

  part(
    "login-flow",
    "Login with a second step",
    explain(
      'After the password checks out, don\'t log the user in yet. Give them a short-lived "2FA pending" cookie that only the code route accepts. When the code is right, swap it for the normal login cookie. requireAuth must reject a pending token, or the second factor is decoration. Limit code attempts too: there are only a million 6-digit codes.',
    ),
    diagram([
      ["POST /login", "password ok"],
      ["2FA pending", "5 minutes"],
      ["POST /login/2fa", "code ok"],
      ["full session", "login cookie"],
    ]),
    code(
      "js",
      "The password step, when 2FA is on",
      [
        "if (user.totp_enabled) {",
        "  const pending = jwt.sign(",
        '    { sub: user.id, stage: "2fa" },',
        '    JWT_SECRET, { expiresIn: "5m" });',
        '  res.cookie("pending", pending, opts);',
        "  return res.json({ twoFactor: true });",
        "}",
        "// no 2FA: sign the normal token as today",
      ],
      {
        3: "requireAuth refuses any token with a stage",
        6: "the page now shows the code box",
      },
    ),
  ),

  part(
    "remember",
    "Remembering a device",
    explain(
      'Asking for a code at every login is tiresome, so many sites offer "Trust this device for 30 days". After a good code, set a long random cookie, store its hash with the user id and an expiry, and skip the code step while it matches. Only the second factor is skipped, never the password. A password change deletes all trusted devices.',
    ),
    quickCheck(
      'A user ticked "Trust this device" yesterday. What does today\'s login on that device ask for?',
      ["Nothing at all", "The password only", "The password and a code"],
      1,
      "Trusting a device skips only the second step. The password is still checked, and changing it removes every trusted device.",
    ),
  ),

  part(
    "notes-app",
    "In the Notes App",
    explain(
      "The Notes App has no two-factor login. `login` checks the password and signs the 7-day token straight away. Adding TOTP would mean a few columns on users (the encrypted secret, totp_enabled, the last used window), a recovery_codes table, a setup route and a `/login/2fa` route, and a code box on the login page.",
    ),
    inTheNotesApp(
      "In `login`, a matching password goes straight to `jwt.sign` and `res.cookie`. That's where a 2FA check would split the flow in two.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A pending token that works everywhere",
      wrong: [
        "const payload = jwt.verify(token, SECRET);",
        "req.user = { id: payload.sub };",
      ],
      problem:
        "A token from the password step passes requireAuth, so the code step can be skipped entirely.",
      right: [
        "const payload = jwt.verify(token, SECRET);",
        "if (payload.stage) throw new Error();",
        "req.user = { id: payload.sub };",
      ],
      why: "Only a full login token may reach the notes routes.",
    }),
    mistake({
      title: "Recovery codes in plain text",
      language: "sql",
      wrong: ["INSERT INTO recovery_codes (user_id, code)", "VALUES ($1, $2);"],
      problem:
        "Anyone who reads the table can skip every user's second factor.",
      right: [
        "INSERT INTO recovery_codes",
        "  (user_id, code_hash) VALUES ($1, $2);",
      ],
      why: "Hash them like passwords and delete each one after use.",
    }),
    mistake({
      title: "Unlimited code attempts",
      wrong: [
        "if (!verify(code, secret)) {",
        "  return res.status(401).end();",
        "}",
      ],
      problem:
        "With a valid password, an attacker can try all million codes. A few hundred tries a second gets through within hours.",
      right: [
        "if (await tooManyTries(userId)) {",
        "  return res.status(429).end();",
        "}",
      ],
      why: "Allow about five wrong codes, then make them start the login again.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Verify a TOTP code",
      task: "Write `verifyTotp(code, codeAt, now, used)`. `codeAt(w)` gives the code for window `w`; `now` is seconds; `used` is a Set of windows. Accept the current window or one either side, unless that window is in `used`. On success add the window to `used` and return `true`; otherwise `false`.",
      starter: [
        "function verifyTotp(code, codeAt, now, used) {",
        "  const w = Math.floor(now / 30);",
        "  return codeAt(w) === code;",
        "}",
      ],
      tests: [
        ['verifyTotp("c100", (w) => "c" + w, 3000, new Set())', "true"],
        ['verifyTotp("c99", (w) => "c" + w, 3005, new Set())', "true"],
        ['verifyTotp("c98", (w) => "c" + w, 3005, new Set())', "false"],
        [
          '(() => { const used = new Set(); const f = (w) => "c" + w; return [verifyTotp("c101", f, 3005, used), verifyTotp("c101", f, 3020, used), [...used]]; })()',
          "[true, false, [101]]",
        ],
      ],
      hint: "Loop `for (const d of [-1, 0, 1])`, compare `codeAt(w + d)`, and check `used.has(w + d)` before accepting.",
      solution: [
        "function verifyTotp(code, codeAt, now, used) {",
        "  const w = Math.floor(now / 30);",
        "  for (const d of [-1, 0, 1]) {",
        "    if (codeAt(w + d) !== code) continue;",
        "    if (used.has(w + d)) return false;",
        "    used.add(w + d);",
        "    return true;",
        "  }",
        "  return false;",
        "}",
      ],
    }),
    yourTurn({
      title: "Single-use recovery codes",
      task: "`stored` holds hashes made with `toyHash`. Write `useRecoveryCode(stored, code)`: ignore spaces, dashes and case in what was typed, and if its hash is in `stored`, remove that hash and return `true`. Otherwise return `false`.",
      starter: [
        'const toyHash = (s) => "h:" + [...s].reverse().join("");',
        "function useRecoveryCode(stored, code) {",
        "  return stored.includes(toyHash(code));",
        "}",
      ],
      tests: [
        [
          '(() => { const s = [toyHash("ab12cd34"), toyHash("ef56gh78")]; return [useRecoveryCode(s, "ab12cd34"), s.length]; })()',
          "[true, 1]",
        ],
        [
          '(() => { const s = [toyHash("ab12cd34")]; useRecoveryCode(s, "ab12cd34"); return useRecoveryCode(s, "ab12cd34"); })()',
          "false",
        ],
        ['useRecoveryCode([toyHash("ab12cd34")], " AB12-CD34 ")', "true"],
        ['useRecoveryCode([toyHash("ab12cd34")], "zz99zz99")', "false"],
      ],
      hint: '`code.replace(/[\\s-]/g, "").toLowerCase()` cleans it up. Then `indexOf` and `splice(i, 1)`.',
      solution: [
        'const toyHash = (s) => "h:" + [...s].reverse().join("");',
        "function useRecoveryCode(stored, code) {",
        '  const clean = code.replace(/[\\s-]/g, "").toLowerCase();',
        "  const i = stored.indexOf(toyHash(clean));",
        "  if (i === -1) return false;",
        "  stored.splice(i, 1);",
        "  return true;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Two-factor cheat sheet", [
      ["Factors", "Know (password), have (phone, key), are (fingerprint)."],
      [
        "TOTP",
        "6 digits from a shared secret and the 30-second window.",
        "otpauth://totp/…?secret=…",
      ],
      ["Drift and reuse", "Accept ±1 window; refuse a window already used."],
      ["TOTP secret", "Store it encrypted: the server needs it back."],
      ["SMS", "Better than nothing; SIM swaps and phishing beat it."],
      [
        "Passkey",
        "Device signs a challenge; server keeps a public key.",
        "WebAuthn",
      ],
      ["Recovery codes", "Shown once, stored hashed, each works once."],
      [
        "Two-step login",
        "Password → 2FA pending → code → full session.",
        '{ sub: 7, stage: "2fa" }',
      ],
      ["Trusted device", "Skips the code, never the password."],
      ["Attempts", "Limit wrong codes, about five, then restart."],
    ]),
    quickCheck(
      "Why does a passkey stop phishing when a TOTP code doesn't?",
      [
        "Passkeys are longer",
        "The browser only uses a passkey on the real site's domain",
        "Passkeys expire faster",
      ],
      1,
      "A typed code can be copied from a fake page to the real one in seconds. A passkey is tied to the domain it was made for, so a fake site can't get a signature from it.",
    ),
  ),
);

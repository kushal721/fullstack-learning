import type { Concept } from "@fsl/shared";

export const https: Concept = {
  id: "https",
  slug: "https",
  title: "HTTPS",
  topicId: "security",
  summary:
    "HTTP sent through an encrypted connection, so nobody between the browser and the server can read or change what is sent, and the browser can check it is really talking to the right site.",
  basics: [
    "A request from your browser to a server doesn't travel directly. It passes through your Wi-Fi router, your internet provider and several other networks on the way.",
    "Plain HTTP sends everything as readable text. Anyone who controls one of those points, such as whoever runs a café's Wi-Fi, could read the passwords and cookies inside, or even change the page on its way back.",
    "Encryption scrambles data with a key so that only someone with the matching key can unscramble it. Done right, the scrambled data is useless to anyone in between.",
  ],
  what: [
    "HTTPS is HTTP inside an encrypted connection made with TLS (Transport Layer Security). The requests and responses are exactly the same HTTP messages; they are just encrypted on the way.",
    "It gives three guarantees: confidentiality (nobody in between can read the data), integrity (nobody can change it without being noticed) and authentication of the server (the browser checks a certificate proving it reached the real site, not an impostor). The padlock in the address bar means all three hold.",
  ],
  why: [
    "Logins send passwords and login cookies. Over plain HTTP, anyone on the same network could copy the cookie and be logged in as you, without even knowing your password.",
    "Without a certificate check, an attacker could pretend to be the site and collect everything you type. The certificate is what makes `https://your-notes.onrender.com` really mean that site.",
    'Browsers now treat plain HTTP as unsafe: they label it "Not secure", and many features, such as `Secure` cookies, only work over HTTPS.',
  ],
  howItWorks: [
    "When the browser connects, the server sends its certificate: a document that names the site's domain and is signed by a certificate authority (CA), a company the browser already trusts.",
    "The browser checks the signature, the domain name and the dates. Then both sides agree on fresh encryption keys for this connection only (the TLS handshake).",
    "From then on every HTTP message, including the URL path, headers, cookies and body, travels encrypted. Only the server's name and address stay visible to the network.",
    "Hosts such as Render get and renew certificates automatically, using the free CA Let's Encrypt or similar, so deploying with HTTPS takes no extra code.",
  ],
  basicExample: {
    language: "http",
    code: `# What someone on the network sees over plain HTTP:
POST /api/auth/login HTTP/1.1
Host: notes.example.com
Content-Type: application/json

{"email":"you@example.com","password":"my-password-123"}

# What they see over HTTPS: the server name and encrypted bytes
notes.example.com  17 03 03 00 5a 8f 2c e1 9b 44 0d …`,
    caption:
      "The same login request. Over HTTPS, the password, the path and the cookies are all hidden.",
    highlightLines: [6, 9],
  },
  internals: [
    "TLS uses two kinds of encryption. The handshake uses public-key cryptography, which lets two strangers agree on a secret over a public network. The rest of the connection uses that secret with fast symmetric encryption.",
    "A certificate only proves who owns a domain, not that the site is honest. A scam site can have a padlock too.",
    "HTTPS protects data while it travels. It does nothing for data once it arrives: the server still has to hash passwords and protect its database.",
    "Sites can send a `Strict-Transport-Security` header (HSTS) telling the browser to use only HTTPS for them from now on, so a mistyped `http://` link can't send a cookie in the clear.",
    "In development the Notes App uses plain `http://localhost`. That is acceptable because the traffic never leaves your own computer.",
  ],
  howToCreate: [
    {
      text: "Look at a real HTTPS connection with `curl`. The `-v` option prints the TLS handshake and the certificate details before the HTTP response.",
      code: {
        language: "bash",
        code: "curl -v https://example.com -o /dev/null 2>&1 | grep -E 'SSL connection|subject:|issuer:|expire date'",
      },
    },
    {
      text: "You'll see the TLS version and cipher, the domain the certificate was issued for (`subject`), the certificate authority that signed it (`issuer`) and when it expires. In the browser, click the padlock (or the icon left of the address) to see the same information.",
    },
    {
      text: "When you deploy the Notes App (build step 14), open your site with `https://`. In the developer tools under Application → Cookies, the `token` cookie is marked Secure: the browser will only ever send it over this encrypted connection.",
    },
  ],
  whereUsed: [
    "Every website and API today, not only those with logins: browsers warn on plain HTTP.",
    "Calls from the backend to other services, such as a payment provider or a hosted database, which should also use TLS.",
  ],
  connectsTo: [
    "HTTP requests and responses, which HTTPS carries unchanged.",
    'Secure cookies: the `Secure` attribute means "only over HTTPS".',
    "Hosting and domains: the host provides the certificate for your domain.",
    "Password hashing, which protects passwords once stored, while HTTPS protects them on the way.",
  ],
  projectUsage: [
    {
      explanation:
        "The login cookie is marked `secure` in production, so the browser never sends it over plain HTTP. The comment notes that local development uses http.",
      fileId: "backend/src/controllers/authController.js",
      match:
        "// Only sent over HTTPS in production (local development uses http).",
    },
    {
      explanation:
        "The production image sets `NODE_ENV=production`, which is what switches `secure` on.",
      fileId: "backend/Dockerfile",
      match: "ENV NODE_ENV=production",
    },
    {
      explanation:
        "In development, the Vite proxy forwards `/api` over plain HTTP inside your own computer, which never touches a network.",
      fileId: "frontend/vite.config.js",
      match: '"/api": "http://localhost:3000",',
    },
  ],
  commonMistakes: [
    "Thinking HTTPS is only for payment pages. Any page with a login or a cookie needs it, and browsers expect it everywhere.",
    "Loading some resources over `http://` from an HTTPS page (mixed content). Browsers block or warn about them.",
    "Turning off certificate checks in code (`rejectUnauthorized: false`) to get rid of an error. That removes the protection against impostors.",
    "Thinking the padlock means a site is trustworthy. It only means the connection is private and the domain is right.",
  ],
  relatedConcepts: [
    "secure-cookies",
    "http-request-response",
    "hosting",
    "domain-dns",
    "password-hashing",
  ],
  relatedFiles: [],
  relatedBuildSteps: ["deploy"],
};

import type { LevelPlan } from "@fsl/shared";
import {
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
} from "../blocks.js";
import { advancedNetworkingModule } from "./advanced-networking.js";

// Advanced: steps 15–19. The details professionals need: security, speed
// and scale, ending with the Notes App's real path in production.
export const advanced: LevelPlan = {
  outcome:
    "Reason about TLS, DNS records, CORS, CDNs, load balancers and where the time goes.",
  steps: [
    lesson(
      "dns-records",
      "DNS records",
      4,
      explain(
        "A domain's DNS settings are a list of [[dns-record|records]]. Each has a type and a [[ttl]]: how long resolvers may keep it.",
      ),
      code(
        "bash",
        "dig notes.app",
        [
          "notes.app.      300  IN  A      76.76.21.21",
          "www.notes.app.  300  IN  CNAME  notes.app.",
          "notes.app.      3600 IN  MX     10 mail.notes.app.",
        ],
        {
          1: "A: name → IPv4 address",
          2: "CNAME: an alias",
          3: "MX: where email goes",
        },
      ),
      quickCheck(
        "You're moving to a new server tomorrow. What helps the change spread fast?",
        ["Lowering the TTL today", "Changing the port", "Turning off HTTPS"],
        0,
        "With a short [[ttl]], resolvers drop their cached copy quickly and pick up the new address.",
      ),
    ),
    advancedNetworkingModule,
    lesson(
      "latency",
      "Where the time goes",
      3,
      explain(
        "[[latency]] is the waiting before data arrives. Each round trip adds some: the DNS lookup, the TCP connection, the TLS handshake, then the request itself.",
      ),
      keyPoints(
        "DNS lookup: about 20 ms (none if cached).",
        "TCP + TLS: one or two round trips.",
        "Request and response: one more, plus the server's work.",
        "CDNs, caching and HTTP/2 each remove some of these.",
      ),
      quickCheck(
        "Which change removes round trips for a visitor far away?",
        [
          "Serving files from a CDN near them",
          "Making the HTML longer",
          "Using a bigger font",
        ],
        0,
        "A CDN is close to the visitor, so each round trip is short: less [[latency]].",
      ),
    ),
    lesson(
      "notes-app-in-production",
      "The Notes App in production",
      4,
      explain(
        "Put it together: in production, a request to the Notes App passes through several pieces from this level before it reaches your code.",
      ),
      diagram([
        ["Browser", "HTTPS"],
        ["CDN / proxy", "TLS, static files"],
        ["Load balancer", "picks a copy"],
        ["Express API", "your code"],
        ["Database", "your notes"],
      ]),
      inTheNotesApp(
        "The backend ships as a Docker image built from this file; the Deployment topic builds the whole chain, one piece at a time.",
        { fileId: "backend/Dockerfile" },
      ),
    ),
    levelCheck("advanced-check", "Advanced check", [
      ["web-advanced-certificate", "advanced-networking"],
      ["web-advanced-cname", "dns-records"],
      ["web-advanced-cors", "advanced-networking"],
      ["web-advanced-load-balancer", "advanced-networking"],
    ]),
  ],
};

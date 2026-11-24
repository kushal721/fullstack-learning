import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { clientsAndServersModule } from "./clients-and-servers.js";
import { dnsModule } from "./dns.js";
import { httpModule } from "./http.js";
import { httpsModule } from "./https.js";
import { theBrowserModule } from "./the-browser.js";
import { urlsModule } from "./urls.js";

// Basic: steps 1–7. From two computers talking to the whole journey of a
// page, no experience needed.
export const basic: LevelPlan = {
  outcome:
    "Explain everything that happens between typing an address and seeing the page.",
  steps: [
    clientsAndServersModule,
    urlsModule,
    dnsModule,
    httpModule,
    httpsModule,
    theBrowserModule,
    levelCheck("basic-check", "Basic check", [
      ["web-basic-client", "clients-and-servers"],
      ["web-basic-query", "urls"],
      ["web-basic-dns-down", "dns"],
      ["web-basic-status-ok", "http"],
      ["web-basic-no-styles", "the-browser"],
      ["web-basic-first-step", "the-browser"],
    ]),
  ],
};

import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { apisModule } from "./apis.js";
import { headersModule } from "./headers.js";
import { jsonBodiesModule } from "./json-bodies.js";
import { methodsModule } from "./methods.js";
import { restUrlsModule } from "./rest-urls.js";
import { statusCodesModule } from "./status-codes.js";

// Basic: steps 1–7. From what an API is to a complete request and response: methods, status codes, headers, JSON bodies and REST URLs.
export const basic: LevelPlan = {
  outcome:
    "Call an API and build one's endpoints: the right method, URL, headers, JSON body and status code.",
  steps: [
    apisModule,
    methodsModule,
    statusCodesModule,
    headersModule,
    jsonBodiesModule,
    restUrlsModule,
    levelCheck("basic-check", "Basic check", [
      ["http-basic-contract", "apis"],
      ["http-basic-put-patch", "methods"],
      ["http-basic-fetch-ok", "status-codes"],
      ["http-basic-content-type", "headers"],
      ["http-basic-json-undefined", "json-bodies"],
      ["http-basic-query-vs-path", "rest-urls"],
    ]),
  ],
};

import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { expressServerModule } from "./express-server.js";
import { middlewareModule } from "./middleware.js";
import { nodejsAndNpmModule } from "./nodejs-and-npm.js";
import { routesModule } from "./routes.js";
import { whatABackendDoesModule } from "./what-a-backend-does.js";

// Basic: steps 1–6. Why a backend exists, Node.js and npm, an Express server, routes and middleware.
export const basic: LevelPlan = {
  outcome:
    "Run a Node.js server with Express that answers routes and runs middleware, and explain why rules belong on the server.",
  steps: [
    whatABackendDoesModule,
    nodejsAndNpmModule,
    expressServerModule,
    routesModule,
    middlewareModule,
    levelCheck("basic-check", "Basic check", [
      ["backend-basic-trust", "what-a-backend-does"],
      ["backend-basic-caret", "nodejs-and-npm"],
      ["backend-basic-env-string", "nodejs-and-npm"],
      ["backend-basic-create-app", "express-server"],
      ["backend-basic-route-order", "routes"],
      ["backend-basic-params-strings", "routes"],
      ["backend-basic-forgot-next", "middleware"],
      ["backend-basic-json-body", "middleware"],
    ]),
  ],
};

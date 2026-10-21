import type { GlossaryEntry } from "@fsl/shared";
import { authenticationGlossary } from "./authentication.js";
import { backendGlossary } from "./backend.js";
import { cssGlossary } from "./css.js";
import { databasesGlossary } from "./databases.js";
import { deploymentGlossary } from "./deployment.js";
import { gitGlossary } from "./git.js";
import { howTheWebWorksGlossary } from "./how-the-web-works.js";
import { htmlGlossary } from "./html.js";
import { httpGlossary } from "./http.js";
import { javascriptGlossary } from "./javascript.js";
import { reactGlossary } from "./react.js";
import { securityGlossary } from "./security.js";
import { testingGlossary } from "./testing.js";

// Terms and concepts the glossary panel explains, one file per topic (the
// topic whose steps introduce them). Steps link them with `[[id]]`. Every
// concept page has a concept entry with the same id.
export const glossary: GlossaryEntry[] = [
  ...howTheWebWorksGlossary,
  ...htmlGlossary,
  ...cssGlossary,
  ...javascriptGlossary,
  ...gitGlossary,
  ...reactGlossary,
  ...httpGlossary,
  ...backendGlossary,
  ...databasesGlossary,
  ...authenticationGlossary,
  ...securityGlossary,
  ...testingGlossary,
  ...deploymentGlossary,
];

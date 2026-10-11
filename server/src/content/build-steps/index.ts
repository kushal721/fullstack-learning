import type { BuildStep } from "@fsl/shared";
import { understandTheApplicationStep } from "./01-understand-the-application.js";
import { createProjectStep } from "./02-create-project.js";
import { createFrontendStructureStep } from "./03-create-frontend-structure.js";
import { createFirstComponentStep } from "./04-create-first-component.js";
import { createPageStep } from "./05-create-page.js";
import { addStateStep } from "./06-add-state.js";
import { addApiCommunicationStep } from "./07-add-api-communication.js";
import { createBackendStep } from "./08-create-backend.js";
import { createApiRoutesStep } from "./09-create-api-routes.js";
import { addDatabaseStep } from "./10-add-database.js";
import { addAuthenticationStep } from "./11-add-authentication.js";
import { addSecurityStep } from "./12-add-security.js";
import { testStep } from "./13-test.js";
import { deployStep } from "./14-deploy.js";

// The Build Journey in order. One file per step: NN-slug.ts.
// `npm run validate` checks files, concepts, prerequisites and order.
export const buildSteps: BuildStep[] = [
  understandTheApplicationStep,
  createProjectStep,
  createFrontendStructureStep,
  createFirstComponentStep,
  createPageStep,
  addStateStep,
  addApiCommunicationStep,
  createBackendStep,
  createApiRoutesStep,
  addDatabaseStep,
  addAuthenticationStep,
  addSecurityStep,
  testStep,
  deployStep,
];

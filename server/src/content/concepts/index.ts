import type { Concept } from "@fsl/shared";
import { cssBoxModel } from "./css/css-box-model.js";
import { cssFlexbox } from "./css/css-flexbox.js";
import { cssResponsive } from "./css/css-responsive.js";
import { cssSelector } from "./css/css-selector.js";
import { gitRepository } from "./git/git-repository.js";
import { gitCommit } from "./git/git-commit.js";
import { database } from "./databases/database.js";
import { sql } from "./databases/sql.js";
import { sqlTable } from "./databases/sql-table.js";
import { rowColumn } from "./databases/row-column.js";
import { primaryKey } from "./databases/primary-key.js";
import { foreignKey } from "./databases/foreign-key.js";
import { oneToManyRelationship } from "./databases/one-to-many-relationship.js";
import { crud } from "./databases/crud.js";
import { sqlSelect } from "./databases/sql-select.js";
import { sqlInsert } from "./databases/sql-insert.js";
import { sqlUpdateDelete } from "./databases/sql-update-delete.js";
import { parameterizedQuery } from "./databases/parameterized-query.js";
import { whyNeverStorePlainPasswords } from "./authentication/why-never-store-plain-passwords.js";
import { passwordHashing } from "./authentication/password-hashing.js";
import { salting } from "./authentication/salting.js";
import { bcrypt } from "./authentication/bcrypt.js";
import { inputValidation } from "./security/input-validation.js";
import { sqlInjection } from "./security/sql-injection.js";
import { xss } from "./security/xss.js";
import { dbTransaction } from "./databases/db-transaction.js";
import { dbConnectionPool } from "./databases/db-connection-pool.js";
import { whyTest } from "./testing/why-test.js";
import { unitTest } from "./testing/unit-test.js";
import { integrationTest } from "./testing/integration-test.js";
import { e2eTest } from "./testing/e2e-test.js";
import { productionBuild } from "./deployment/production-build.js";
import { environmentConfig } from "./deployment/environment-config.js";
import { dockerImageContainer } from "./deployment/docker-image-container.js";
import { dockerfile } from "./deployment/dockerfile.js";
import { dockerCompose } from "./deployment/docker-compose.js";
import { ciCd } from "./deployment/ci-cd.js";
import { hosting } from "./deployment/hosting.js";
import { domainDns } from "./deployment/domain-dns.js";
import { deployingAFullStackApp } from "./deployment/deploying-a-full-stack-app.js";
import { gitBranch } from "./git/git-branch.js";
import { gitignore } from "./git/gitignore.js";
import { githubRemotePush } from "./git/github-remote-push.js";
import { pullRequest } from "./git/pull-request.js";
import { merge } from "./git/merge.js";
import { conventionalCommit } from "./git/conventional-commit.js";
import { howTheWebWorks } from "./how-the-web-works/how-the-web-works.js";
import { htmlButton } from "./html/html-button.js";
import { htmlDocument } from "./html/html-document.js";
import { htmlElement } from "./html/html-element.js";
import { htmlForm } from "./html/html-form.js";
import { htmlInput } from "./html/html-input.js";
import { htmlSemanticStructure } from "./html/html-semantic-structure.js";
import { jsVariable } from "./javascript/js-variable.js";
import { jsFunction } from "./javascript/js-function.js";
import { jsArrowFunction } from "./javascript/js-arrow-function.js";
import { jsObjectArray } from "./javascript/js-object-array.js";
import { jsEvent } from "./javascript/js-event.js";
import { jsEventListener } from "./javascript/js-event-listener.js";
import { jsModuleImportExport } from "./javascript/js-module-import-export.js";
import { jsPromise } from "./javascript/js-promise.js";
import { jsAsyncAwait } from "./javascript/js-async-await.js";
import { jsFetch } from "./javascript/js-fetch.js";
import { json } from "./javascript/json.js";
import { jsErrorHandling } from "./javascript/js-error-handling.js";
import { typescriptWhy } from "./javascript/typescript-why.js";
import { typescriptTypes } from "./javascript/typescript-types.js";
import { httpPost } from "./http/http-post.js";
import { httpRequestResponse } from "./http/http-request-response.js";
import { httpMethods } from "./http/http-methods.js";
import { httpGet } from "./http/http-get.js";
import { httpPutDelete } from "./http/http-put-delete.js";
import { httpStatusCodes } from "./http/http-status-codes.js";
import { httpHeaders } from "./http/http-headers.js";
import { restEndpoint } from "./http/rest-endpoint.js";
import { nodejs } from "./backend/nodejs.js";
import { npmPackages } from "./backend/npm-packages.js";
import { express } from "./backend/express.js";
import { expressRoute } from "./backend/express-route.js";
import { expressMiddleware } from "./backend/express-middleware.js";
import { controller } from "./backend/controller.js";
import { requestBody } from "./backend/request-body.js";
import { environmentVariables } from "./backend/environment-variables.js";
import { reactUseState } from "./react/react-usestate.js";
import { reactWhy } from "./react/react-why.js";
import { reactComponent } from "./react/react-component.js";
import { jsx } from "./react/jsx.js";
import { reactProps } from "./react/react-props.js";
import { reactEventHandling } from "./react/react-event-handling.js";
import { reactState } from "./react/react-state.js";
import { reactUseEffect } from "./react/react-useeffect.js";
import { reactHowHooksWork } from "./react/react-how-hooks-work.js";
import { reactCustomHook } from "./react/react-custom-hook.js";
import { reactListsKeys } from "./react/react-lists-keys.js";
import { reactControlledForm } from "./react/react-controlled-form.js";
import { reactComponentCommunication } from "./react/react-component-communication.js";
import { reactReusableComponent } from "./react/react-reusable-component.js";
import { vite } from "./react/vite.js";

// Every concept, one file each under concepts/<topic-id>/<concept-id>.ts.
// To add a concept: create its file, add it here, and add its id to the
// topic's `conceptIds` in learning-tree.ts (that list sets the reading
// order within the topic). `npm run validate` checks both.
export const concepts: Concept[] = [
  howTheWebWorks,
  htmlDocument,
  htmlElement,
  htmlSemanticStructure,
  htmlForm,
  htmlInput,
  htmlButton,
  cssSelector,
  cssBoxModel,
  cssFlexbox,
  cssResponsive,
  jsVariable,
  jsFunction,
  jsArrowFunction,
  jsObjectArray,
  jsEvent,
  jsEventListener,
  jsModuleImportExport,
  jsPromise,
  jsAsyncAwait,
  jsFetch,
  json,
  jsErrorHandling,
  typescriptWhy,
  typescriptTypes,
  gitRepository,
  gitCommit,
  gitBranch,
  gitignore,
  githubRemotePush,
  pullRequest,
  merge,
  conventionalCommit,
  reactWhy,
  reactComponent,
  jsx,
  reactProps,
  reactEventHandling,
  reactState,
  reactUseState,
  reactUseEffect,
  reactHowHooksWork,
  reactCustomHook,
  reactListsKeys,
  reactControlledForm,
  reactComponentCommunication,
  reactReusableComponent,
  vite,
  httpRequestResponse,
  httpMethods,
  httpGet,
  httpPost,
  httpPutDelete,
  httpStatusCodes,
  httpHeaders,
  restEndpoint,
  nodejs,
  npmPackages,
  express,
  expressRoute,
  expressMiddleware,
  controller,
  requestBody,
  environmentVariables,
  database,
  sql,
  sqlTable,
  rowColumn,
  primaryKey,
  foreignKey,
  oneToManyRelationship,
  crud,
  sqlSelect,
  sqlInsert,
  sqlUpdateDelete,
  parameterizedQuery,
  dbTransaction,
  dbConnectionPool,
  whyNeverStorePlainPasswords,
  passwordHashing,
  salting,
  bcrypt,
  inputValidation,
  sqlInjection,
  xss,
  whyTest,
  unitTest,
  integrationTest,
  e2eTest,
  productionBuild,
  environmentConfig,
  dockerImageContainer,
  dockerfile,
  dockerCompose,
  ciCd,
  hosting,
  domainDns,
  deployingAFullStackApp,
];

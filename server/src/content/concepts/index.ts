import type { Concept } from "@fsl/shared";
import { cssBoxModel } from "./css/css-box-model.js";
import { cssFlexbox } from "./css/css-flexbox.js";
import { cssResponsive } from "./css/css-responsive.js";
import { cssSelector } from "./css/css-selector.js";
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
import { reactUseState } from "./react/react-usestate.js";

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
  reactUseState,
  httpPost,
];

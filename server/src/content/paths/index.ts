import type { TopicPath } from "@fsl/shared";
import { backendPath } from "./backend/path.js";
import { howTheWebWorksPath } from "./how-the-web-works/path.js";
import { cssPath } from "./css/path.js";
import { gitPath } from "./git/path.js";
import { htmlPath } from "./html/path.js";
import { httpPath } from "./http/path.js";
import { javascriptPath } from "./javascript/path.js";
import { reactPath } from "./react/path.js";

// Every topic's guided path, in reading order (one folder per topic:
// path.ts, scenes.ts, basic/, intermediate/, advanced/). Topics without a
// path keep their classic topic page. `npm run validate` checks them.
export const topicPaths: TopicPath[] = [
  howTheWebWorksPath,
  htmlPath,
  cssPath,
  javascriptPath,
  gitPath,
  reactPath,
  httpPath,
  backendPath,
];

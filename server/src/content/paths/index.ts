import type { TopicPath } from "@fsl/shared";

// Every topic's guided path, in reading order (one folder per topic:
// path.ts, scenes.ts, basic/, intermediate/, advanced/). Topics without a
// path keep their classic topic page. `npm run validate` checks them.
export const topicPaths: TopicPath[] = [];

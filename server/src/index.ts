import { createApp } from "./app.js";
import { config } from "./config.js";
import { getSearchIndex } from "./lib/search.js";

// Build the search index now, so the first search is as fast as any other.
getSearchIndex();

createApp().listen(config.port, () => {
  console.log(
    `API listening on http://localhost:${config.port} (${config.nodeEnv})`,
  );
});

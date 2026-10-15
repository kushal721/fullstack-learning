import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";

// The server's copy of the page's title and meta tags is only for the first
// load (link previews, crawlers); from now on each page renders its own.
for (const element of document.querySelectorAll("[data-server-meta]")) {
  element.remove();
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element in index.html");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

import type { PrismTheme } from "prism-react-renderer";

// Colours are CSS variables (index.css), so code follows light/dark mode.
export const codeTheme: PrismTheme = {
  plain: { color: "var(--code-fg)", backgroundColor: "var(--code-bg)" },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--code-comment)", fontStyle: "italic" },
    },
    { types: ["punctuation"], style: { color: "var(--code-punctuation)" } },
    {
      types: ["keyword", "boolean", "important", "atrule", "request-line"],
      style: { color: "var(--code-keyword)" },
    },
    {
      types: ["string", "char", "attr-value", "inserted", "url"],
      style: { color: "var(--code-string)" },
    },
    {
      types: ["number", "constant", "symbol", "variable", "status-code"],
      style: { color: "var(--code-number)" },
    },
    {
      types: ["function", "class-name", "selector", "builtin"],
      style: { color: "var(--code-function)" },
    },
    {
      types: ["tag", "attr-name", "property", "header-name", "parameter"],
      style: { color: "var(--code-tag)" },
    },
    { types: ["operator", "entity"], style: { color: "var(--code-operator)" } },
    { types: ["deleted"], style: { color: "var(--code-deleted)" } },
  ],
};

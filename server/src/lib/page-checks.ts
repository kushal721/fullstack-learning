import type { PageCheck } from "@fsl/shared";

/**
 * The script that runs one "your turn" page check. It is plain browser
 * JavaScript, kept as text so the same code runs in the page runner (in the
 * learner's browser) and in jsdom (when content is validated). It defines
 * `__fslCheck(check)`, which returns `{ pass, detail }`.
 */
export const PAGE_CHECK_SOURCE = `
window.__fslCheck = (c) => {
  const el = document.querySelector(c.selector);
  const quote = (v) => JSON.stringify(v);
  switch (c.kind) {
    case "exists":
      return { pass: !!el, detail: el ? "found" : "not found" };
    case "missing":
      return { pass: !el, detail: el ? "still there" : "not there" };
    case "count": {
      const n = document.querySelectorAll(c.selector).length;
      return { pass: n === c.count, detail: n + " found" };
    }
    case "text": {
      if (!el) return { pass: false, detail: "not found" };
      const text = el.textContent.trim().replace(/\\s+/g, " ");
      return { pass: text === c.text, detail: quote(text) };
    }
    case "attr": {
      if (!el) return { pass: false, detail: "not found" };
      const v = el.getAttribute(c.name);
      if (v === null) return { pass: false, detail: "no " + c.name };
      return { pass: c.value === undefined || v === c.value, detail: quote(v) };
    }
    case "style": {
      if (!el) return { pass: false, detail: "not found" };
      const v = getComputedStyle(el).getPropertyValue(c.property).trim();
      return { pass: v === c.value, detail: v || "not set" };
    }
    case "click":
      if (!el) return { pass: false, detail: "not found" };
      el.click();
      return { pass: true, detail: "clicked" };
    case "type":
      if (!el) return { pass: false, detail: "not found" };
      el.value = c.value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return { pass: true, detail: "typed " + quote(c.value) };
    case "submit": {
      const form = el && (el.closest("form") || el);
      if (!form || form.tagName !== "FORM") return { pass: false, detail: "no form" };
      form.requestSubmit();
      return { pass: true, detail: "submitted" };
    }
    default:
      return { pass: false, detail: "unknown check" };
  }
};
`;

const SELECTOR_KINDS = new Set([
  "exists",
  "missing",
  "count",
  "text",
  "attr",
  "style",
  "click",
  "type",
  "submit",
]);

/** A list of page checks from untrusted JSON, or undefined if it isn't. */
export function parseChecks(value: unknown): PageCheck[] | undefined {
  if (!Array.isArray(value)) return;
  const checks: PageCheck[] = [];
  for (const raw of value as Record<string, unknown>[]) {
    if (
      typeof raw !== "object" ||
      raw === null ||
      typeof raw.label !== "string" ||
      typeof raw.selector !== "string" ||
      !SELECTOR_KINDS.has(raw.kind as string)
    ) {
      return;
    }
    const { kind, label, selector } = raw as {
      kind: PageCheck["kind"];
      label: string;
      selector: string;
    };
    const str = (key: string) =>
      typeof raw[key] === "string" ? (raw[key] as string) : undefined;
    switch (kind) {
      case "count":
        if (typeof raw.count !== "number") return;
        checks.push({ kind, label, selector, count: raw.count });
        break;
      case "text":
        if (str("text") === undefined) return;
        checks.push({ kind, label, selector, text: str("text")! });
        break;
      case "attr":
        if (str("name") === undefined) return;
        checks.push({
          kind,
          label,
          selector,
          name: str("name")!,
          ...(str("value") !== undefined ? { value: str("value") } : {}),
        });
        break;
      case "style":
        if (str("property") === undefined || str("value") === undefined) return;
        checks.push({
          kind,
          label,
          selector,
          property: str("property")!,
          value: str("value")!,
        });
        break;
      case "type":
        if (str("value") === undefined) return;
        checks.push({ kind, label, selector, value: str("value")! });
        break;
      default:
        checks.push({ kind, label, selector } as PageCheck);
    }
  }
  return checks;
}

/**
 * Which page an address belongs to. A new page is built from scratch; the
 * overview and steps of one guided topic are one page, so moving between
 * steps keeps keyboard focus (on the step dots, for instance).
 */
export function pageKey(pathname: string) {
  return /^\/learn\/[^/]+(\/[^/]+)?\/?$/.test(pathname)
    ? pathname.split("/").slice(0, 3).join("/")
    : pathname;
}

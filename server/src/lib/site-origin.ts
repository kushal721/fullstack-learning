import type { Request } from "express";
import { config } from "../config.js";

/**
 * The site's address for absolute links: PUBLIC_URL when set, otherwise
 * the address this request came to (behind a proxy, TRUST_PROXY makes the
 * protocol right).
 */
export function siteOrigin(req: Request): string {
  return config.publicUrl ?? `${req.protocol}://${req.get("host")}`;
}

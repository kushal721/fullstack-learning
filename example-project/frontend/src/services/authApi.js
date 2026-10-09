import { request } from "./request.js";

export function register({ email, password }) {
  return request("/api/auth/register", {
    method: "POST",
    body: { email, password },
  });
}

export function login({ email, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

// The login cookie is httpOnly, so JavaScript cannot read it. Instead we ask
// the API who is logged in. A 401 means nobody is, so return null.
export async function getCurrentUser() {
  try {
    return await request("/api/auth/me");
  } catch {
    return null;
  }
}

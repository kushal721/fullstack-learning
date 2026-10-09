import { request } from "./request.js";

export function getNotes() {
  return request("/api/notes");
}

export function createNote({ title, content }) {
  return request("/api/notes", { method: "POST", body: { title, content } });
}

export function updateNote(id, { title, content }) {
  return request(`/api/notes/${id}`, {
    method: "PUT",
    body: { title, content },
  });
}

export function deleteNote(id) {
  return request(`/api/notes/${id}`, { method: "DELETE" });
}

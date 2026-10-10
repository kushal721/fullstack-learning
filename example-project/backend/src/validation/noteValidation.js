export const MAX_TITLE_LENGTH = 100;
export const MAX_CONTENT_LENGTH = 10000;

// Returns an error message, or nothing when the note is valid. The browser
// checks too, but anyone can send a request without the browser, so the
// server must always check again.
export function validateNote(body) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = body?.content ?? "";

  if (!title) return "Title is required";
  if (title.length > MAX_TITLE_LENGTH) {
    return `Title must be at most ${MAX_TITLE_LENGTH} characters`;
  }
  if (typeof content !== "string") return "Content must be text";
  if (content.length > MAX_CONTENT_LENGTH) {
    return `Content must be at most ${MAX_CONTENT_LENGTH} characters`;
  }
}

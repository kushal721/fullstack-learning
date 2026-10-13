// Symbol ids start with their kind ("fn:handleSave"); show it in words.
const KIND: Record<string, string> = {
  fn: "function",
  "http-request": "request",
};

/** "fn:notesApi.createNote" → { kind: "function", name: "notesApi.createNote" } */
export function symbolLabel(id: string) {
  const colon = id.indexOf(":");
  const prefix = id.slice(0, colon);
  return { kind: KIND[prefix] ?? prefix, name: id.slice(colon + 1) };
}

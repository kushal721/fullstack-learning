import { describe, expect, it } from "vitest";
import { validateNote } from "./noteValidation.js";

describe("validateNote", () => {
  it("accepts a note with a title", () => {
    expect(
      validateNote({ title: "Shopping", content: "Milk" }),
    ).toBeUndefined();
  });

  it("accepts a note without content", () => {
    expect(validateNote({ title: "Shopping" })).toBeUndefined();
  });

  it.each([{}, { title: "" }, { title: "   " }, { title: 42 }, null])(
    "requires a title: %j",
    (body) => {
      expect(validateNote(body)).toBe("Title is required");
    },
  );

  it("limits the title to 100 characters", () => {
    expect(validateNote({ title: "a".repeat(100) })).toBeUndefined();
    expect(validateNote({ title: "a".repeat(101) })).toBe(
      "Title must be at most 100 characters",
    );
  });

  it("limits the content to 10000 characters", () => {
    expect(validateNote({ title: "x", content: "a".repeat(10001) })).toBe(
      "Content must be at most 10000 characters",
    );
  });
});

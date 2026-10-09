// Runs before every test file.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Remove what the previous test rendered and reset mocks, so each test
// starts from an empty page.
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

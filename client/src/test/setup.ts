import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { clearApiCache } from "../hooks/useApi.ts";

afterEach(() => {
  cleanup();
  clearApiCache();
  vi.restoreAllMocks();
});

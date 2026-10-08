import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "./errorHandler.js";

describe("errorHandler", () => {
  it("returns a generic 500 without leaking the real error", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const app = express();
    app.get("/boom", () => {
      throw new Error("secret database detail");
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { code: "INTERNAL", message: "Something went wrong" },
    });
    expect(JSON.stringify(res.body)).not.toContain("secret");
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

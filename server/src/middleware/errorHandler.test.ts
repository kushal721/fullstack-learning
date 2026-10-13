import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { HttpError } from "../lib/http-error.js";
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

  it("turns an HttpError into its status and message", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const app = express();
    app.get("/missing", () => {
      throw new HttpError(404, "NOT_FOUND", "No such thing");
    });
    app.use(errorHandler);

    const res = await request(app).get("/missing");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: "No such thing" },
    });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("answers 400 for invalid JSON and 413 for a body that is too large", async () => {
    const app = express();
    app.use(express.json({ limit: "10b" }));
    app.post("/echo", (req, res) => res.json(req.body));
    app.use(errorHandler);

    const bad = await request(app)
      .post("/echo")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(bad.status).toBe(400);
    expect(bad.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "The request body isn't valid JSON.",
      },
    });

    const big = await request(app)
      .post("/echo")
      .send({ text: "far more than ten bytes" });
    expect(big.status).toBe(413);
    expect(big.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });
});

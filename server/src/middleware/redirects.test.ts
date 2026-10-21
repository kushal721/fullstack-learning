import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { movedTo } from "./redirects.js";

const app = createApp();

describe("legacyRedirects", () => {
  it.each([
    ["/concepts", "/course-map"],
    ["/concepts/", "/course-map"],
    ["/practice", "/course-map"],
    ["/practice/predict-click-save", "/course-map"],
    ["/project", "/explorer"],
    ["/project?step=4", "/explorer?step=4"],
  ])("answers %s with a 301 to %s", async (from, to) => {
    const res = await request(app).get(from);
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(to);
  });

  it("leaves pages that didn't move alone", () => {
    expect(movedTo("/concepts/react-usestate")).toBeUndefined();
    expect(movedTo("/course-map")).toBeUndefined();
    expect(movedTo("/practice/a/b")).toBeUndefined();
  });

  it("doesn't touch the API", async () => {
    const res = await request(app).get("/api/concepts");
    expect(res.status).toBe(200);
  });
});

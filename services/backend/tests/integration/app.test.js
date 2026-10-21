process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../src/index");

describe("unknown routes", () => {
  test("return a json 404 in the standard error shape", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

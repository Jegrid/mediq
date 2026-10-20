process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret_key_for_integration_tests";

const request = require("supertest");
const app = require("../../src/index");
const db = require("../../src/db");

beforeAll(async () => {
  await db.migrate.latest();
  await db("audit_log").del();
  await db("journal_entries").del();
  await db("cases").del();
  await db("predictions").del();
  await db("submissions").del();
  await db("red_flag_rules").del();
  await db("conditions").del();
  await db("symptoms").del();
  await db("clinician_profiles").del();
  await db("patient_profiles").del();
  await db("users").del();
});

afterAll(async () => {
  await db.destroy();
});

describe("POST /api/v1/auth/register", () => {
  test("registers a new patient and returns a token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "newpatient@test.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("patient");
    expect(res.body.user.email).toBe("newpatient@test.com");
  });

  test("rejects duplicate email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "newpatient@test.com", password: "password123" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  test("rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "notanemail", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("rejects short password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "another@test.com", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/auth/login", () => {
  test("returns a token with valid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "newpatient@test.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("patient");
  });

  test("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "newpatient@test.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORISED");
  });

  test("rejects non-existent email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@test.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORISED");
  });
});

describe("GET /api/v1/auth/me", () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "newpatient@test.com", password: "password123" });
    token = res.body.token;
  });

  test("returns current user with valid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("newpatient@test.com");
    expect(res.body.user.role).toBe("patient");
  });

  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
  });

  test("returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
  });
});

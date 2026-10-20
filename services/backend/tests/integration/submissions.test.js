process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "supersecrettest";

const request = require("supertest");
const app = require("../../src/index");
const db = require("../../src/db");

let patientToken;
let clinicianToken;
let submissionId;

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

  //seed a red flag rlue
  await db("red_flag_rules").insert({
    symptom_keyword: "chest pain",
    message: "Call 999 immediately.",
    severity: "emergency",
    is_active: true,
  });

  //seed a condition
  await db("conditions").insert({
    name: "Migraine",
    description: "A neurological condition.",
    severity_tier: "moderate",
  });

  //create a patient
  await request(app)
    .post("/api/v1/auth/register")
    .send({ email: "patient@test.com", password: "password123" });

  const patientLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "patient@test.com", password: "password123" });

  patientToken = patientLogin.body.token;

  //create a clinician
  const bcrypt = require("bcryptjs");
  const [clinician] = await db("users")
    .insert({
      email: "clinician@test.com",
      password_hash: await bcrypt.hash("password123", 10),
      role: "clinician",
    })
    .returning("*");

  await db("clinician_profiles").insert({
    user_id: clinician.id,
    first_name: "Test",
    last_name: "Clinician",
  });

  const clinicianLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "clinician@test.com", password: "password123" });

  clinicianToken = clinicianLogin.body.token;
});

afterAll(async () => {
  await db.destroy();
});

describe("POST /api/v1/submissions", () => {
  test("creates a submission with free text and returns predictions", async () => {
    const res = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ free_text: "I have a headache and feel nauseous" });

    expect(res.status).toBe(201);
    expect(res.body.submission).toBeDefined();
    expect(res.body.predictions).toBeDefined();
    expect(res.body.red_flags).toBeDefined();
    expect(Array.isArray(res.body.predictions)).toBe(true);

    submissionId = res.body.submission.id;
  });

  test("triggers red flag for emergency keyword", async () => {
    const res = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ free_text: "I have chest pain and feel dizzy" });

    expect(res.status).toBe(201);
    expect(res.body.red_flags.length).toBeGreaterThan(0);
    expect(res.body.red_flags[0].severity).toBe("emergency");
  });

  test("triggers red flag for a symptom selected from the list", async () => {
    const res = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ free_text: "", structured_symptoms: ["chest_pain"] });

    expect(res.status).toBe(201);
    expect(res.body.red_flags.length).toBe(1);
    expect(res.body.red_flags[0].keyword).toBe("chest pain");
  });

  test("rejects submission with no symptoms", async () => {
    const res = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ free_text: "", structured_symptoms: [] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("rejects submission without token", async () => {
    const res = await request(app)
      .post("/api/v1/submissions")
      .send({ free_text: "I have a headache" });

    expect(res.status).toBe(401);
  });

  test("rejects submission from clinician", async () => {
    const res = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${clinicianToken}`)
      .send({ free_text: "I have a headache" });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/submissions", () => {
  test("returns list of submissions for patient", async () => {
    const res = await request(app)
      .get("/api/v1/submissions")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.submissions)).toBe(true);
    expect(res.body.submissions.length).toBeGreaterThan(0);
  });

  test("rejects request without token", async () => {
    const res = await request(app).get("/api/v1/submissions");

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/submissions/:id", () => {
  test("returns a single submission with predictions", async () => {
    const res = await request(app)
      .get(`/api/v1/submissions/${submissionId}`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.submission.id).toBe(submissionId);
    expect(Array.isArray(res.body.predictions)).toBe(true);
  });

  test("returns 404 for non-existent submission", async () => {
    const res = await request(app)
      .get("/api/v1/submissions/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(404);
  });
});

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "supersecrettest";

const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../../src/index");
const db = require("../../src/db");

let assignedToken;
let otherToken;
let caseId;

//create a clinician and return their login token
async function createClinician(email) {
  const [clinician] = await db("users")
    .insert({
      email,
      password_hash: await bcrypt.hash("password123", 10),
      role: "clinician",
    })
    .returning("*");

  await db("clinician_profiles").insert({
    user_id: clinician.id,
    first_name: "Test",
    last_name: "Clinician",
  });

  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });

  return { id: clinician.id, token: login.body.token };
}

beforeAll(async () => {
  await db.migrate.latest();
  await db("audit_log").del();
  await db("journal_entries").del();
  await db("cases").del();
  await db("predictions").del();
  await db("submissions").del();
  await db("clinician_profiles").del();
  await db("patient_profiles").del();
  await db("users").del();

  //patient with a submission
  await request(app)
    .post("/api/v1/auth/register")
    .send({ email: "patient@test.com", password: "password123" });
  const patient = await db("users")
    .where({ email: "patient@test.com" })
    .first();
  const [submission] = await db("submissions")
    .insert({ patient_id: patient.id, free_text: "headache" })
    .returning("*");

  //two clinicians, case assigned to the first one only
  const assigned = await createClinician("assigned@test.com");
  const other = await createClinician("other@test.com");
  assignedToken = assigned.token;
  otherToken = other.token;

  const [caseRecord] = await db("cases")
    .insert({
      submission_id: submission.id,
      assigned_clinician_id: assigned.id,
    })
    .returning("*");
  caseId = caseRecord.id;
});

afterAll(async () => {
  await db.destroy();
});

describe("GET /api/v1/cases/:id", () => {
  test("assigned clinician can view the case", async () => {
    const res = await request(app)
      .get(`/api/v1/cases/${caseId}`)
      .set("Authorization", `Bearer ${assignedToken}`);

    expect(res.status).toBe(200);
    expect(res.body.case.id).toBe(caseId);
  });

  test("other clinician gets 404", async () => {
    const res = await request(app)
      .get(`/api/v1/cases/${caseId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/v1/cases/:id", () => {
  test("other clinician cannot update the case", async () => {
    const res = await request(app)
      .put(`/api/v1/cases/${caseId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ status: "resolved", clinician_decision: "inconclusive" });

    expect(res.status).toBe(404);
    const caseRecord = await db("cases").where({ id: caseId }).first();
    expect(caseRecord.status).toBe("open");
  });

  test("returns 404 for a case that doesn't exist", async () => {
    const res = await request(app)
      .put("/api/v1/cases/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${assignedToken}`)
      .send({ status: "resolved" });

    expect(res.status).toBe(404);
  });

  test("assigned clinician can update the case", async () => {
    const res = await request(app)
      .put(`/api/v1/cases/${caseId}`)
      .set("Authorization", `Bearer ${assignedToken}`)
      .send({ status: "resolved", clinician_decision: "inconclusive" });

    expect(res.status).toBe(200);
    expect(res.body.case.status).toBe("resolved");
  });
});

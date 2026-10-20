process.env.NODE_ENV = "test";
const { checkRedFlags } = require("../../src/lib/redFlagChecker");
const db = require("../../src/db");

beforeAll(async () => {
  await db.migrate.latest();
  await db("red_flag_rules").del();
  await db("red_flag_rules").insert([
    {
      symptom_keyword: "chest pain",
      message:
        "Chest pain can indicate a serious cardiac event. Call 999 immediately.",
      severity: "emergency",
      is_active: true,
    },
    {
      symptom_keyword: "suicidal",
      message:
        "If you are having thoughts of suicide please contact the Samaritans.",
      severity: "urgent",
      is_active: true,
    },
    {
      symptom_keyword: "headache",
      message: "This rule is disabled.",
      severity: "urgent",
      is_active: false,
    },
  ]);
});

afterAll(async () => {
  await db.destroy();
});

describe("checkRedFlags", () => {
  test("returns a flag when emergency keyword is detected", async () => {
    const flags = await checkRedFlags("I have chest pain and feel unwell");
    expect(flags.length).toBe(1);
    expect(flags[0].severity).toBe("emergency");
    expect(flags[0].keyword).toBe("chest pain");
  });

  test("returns empty array when no keywords detected", async () => {
    const flags = await checkRedFlags("I have a mild headache");
    expect(flags.length).toBe(0);
  });

  test("is case insensitive", async () => {
    const flags = await checkRedFlags("I feel SUICIDAL");
    expect(flags.length).toBe(1);
    expect(flags[0].severity).toBe("urgent");
  });

  test("returns empty array for empty string", async () => {
    const flags = await checkRedFlags("");
    expect(flags.length).toBe(0);
  });

  test("returns empty array for null input", async () => {
    const flags = await checkRedFlags(null);
    expect(flags.length).toBe(0);
  });

  test("does not trigger inactive rules", async () => {
    const flags = await checkRedFlags("I have a headache");
    expect(flags.length).toBe(0);
  });

  test("returns a flag for a selected symptom with no free text", async () => {
    const flags = await checkRedFlags("", ["chest_pain"]);
    expect(flags.length).toBe(1);
    expect(flags[0].keyword).toBe("chest pain");
  });

  test("checks selected symptoms alongside free text", async () => {
    const flags = await checkRedFlags("I feel suicidal", ["chest_pain"]);
    expect(flags.map((f) => f.keyword).sort()).toEqual([
      "chest pain",
      "suicidal",
    ]);
  });

  test("only flags a rule once when text and symptoms both match", async () => {
    const flags = await checkRedFlags("bad chest pain", ["chest_pain"]);
    expect(flags.length).toBe(1);
  });

  test("does not combine separate symptoms into a match", async () => {
    const flags = await checkRedFlags(null, ["chest", "pain"]);
    expect(flags.length).toBe(0);
  });
});

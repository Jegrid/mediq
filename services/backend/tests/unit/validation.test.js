const { registerSchema, loginSchema } = require("../../src/validation/auth");

describe("registerSchema", () => {
  test("accepts valid email and password", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "notanemail",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  test("rejects missing email", () => {
    const result = registerSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("rejects missing password", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  test("accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "notanemail",
      password: "anypassword",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

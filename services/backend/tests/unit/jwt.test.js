process.env.JWT_SECRET = "test_secret_key_for_unit_tests";
const { signToken, verifyToken } = require("../../src/lib/jwt");

describe("JWT", () => {
  test("signToken creates a valid token", () => {
    const payload = { id: "123", email: "test@test.com", role: "patient" };
    const token = signToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });

  test("verifyToken decodes a valid token correctly", () => {
    const payload = { id: "123", email: "test@test.com", role: "patient" };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe("123");
    expect(decoded.email).toBe("test@test.com");
    expect(decoded.role).toBe("patient");
  });

  test("verifyToken throws on invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });

  test("verifyToken throws on tampered token", () => {
    const token = signToken({ id: "123", role: "patient" });
    const tampered = token.slice(0, -5) + "xxxxx";
    expect(() => verifyToken(tampered)).toThrow();
  });
});

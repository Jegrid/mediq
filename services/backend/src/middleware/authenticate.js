const { verifyToken } = require("../lib/jwt");
const db = require("../db");

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORISED", message: "No token provided" } });
  }

  const token = header.split(" ")[1];
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({
      error: { code: "UNAUTHORISED", message: "Invalid or expired token" },
    });
  }

  //check the account still exists and hasn't been disabled since the token was issued
  try {
    const user = await db("users")
      .where({ id: payload.id })
      .select("is_active")
      .first();
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: { code: "ACCOUNT_DISABLED", message: "Account is disabled" },
      });
    }
  } catch (err) {
    return next(err);
  }

  req.user = payload;
  next();
}

module.exports = authenticate;

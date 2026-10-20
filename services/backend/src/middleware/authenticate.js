const { verifyToken } = require("../lib/jwt");

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORISED", message: "No token provided" } });
  }

  const token = header.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({
      error: { code: "UNAUTHORISED", message: "Invalid or expired token" },
    });
  }
}

module.exports = authenticate;

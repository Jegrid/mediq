const bcrypt = require("bcryptjs");
const db = require("../db");
const { signToken } = require("../lib/jwt");
const { registerSchema, loginSchema } = require("../validation/auth");
const audit = require("../lib/audit");

//registering ana account
//validate users input from registerSchema
async function register(req, res, next) {
  try {
    //zod safeParse to avpid a messy error
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: parsed.error.flatten(),
        },
      });
    }

    const { email, password } = parsed.data;

    //check if info alrteady exists
    const existing = await db("users").where({ email }).first();
    if (existing) {
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "An account with this email already exists",
        },
      });
    }

    //inserting validated patient data into the db
    //brcrypt for encryption //!! (might switch to firebase for auth)
    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db("users")
      .insert({ email, password_hash, role: "patient" })
      .returning(["id", "email", "role"]);

    await db("patient_profiles").insert({
      user_id: user.id,
      first_name: "",
      last_name: "",
    });

    await audit.log(user.id, "USER_REGISTERED", "user", user.id);

    //jwt created once the conditions are satisfied
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

//validate users input from loginSchema
async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Invalid input" },
      });
    }

    //find the user and make sure the supervisor has not disabled their account
    const { email, password } = parsed.data;
    const user = await db("users").where({ email, is_active: true }).first();

    //if the user cant be found or the password is wrong then refuse login
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        error: { code: "UNAUTHORISED", message: "Invalid email or password" },
      });
    }

    await audit.log(user.id, "USER_LOGIN", "user", user.id);

    //create and return jwt
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  const user = await db("users")
    .where({ id: req.user.id })
    .select("id", "email", "role", "is_active")
    .first();
  res.json({ user });
}

module.exports = { register, login, me };

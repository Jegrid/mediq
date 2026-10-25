//resets the live demo database: reloads the seed data then sets private passwords
//reads DATABASE_URL, DEMO_SUPERVISOR_PASSWORD and DEMO_USER_PASSWORD from .env.demo (gitignored)
const path = require("path");
const fs = require("fs");

const envFile = path.resolve(__dirname, "../.env.demo");
if (!fs.existsSync(envFile)) {
  console.error("Missing .env.demo, copy .env.demo.example and fill it in");
  process.exit(1);
}

//load .env.demo before the db so its DATABASE_URL is used, not the local one
require("dotenv").config({ path: envFile });
process.env.NODE_ENV = "production";

const { DATABASE_URL, DEMO_SUPERVISOR_PASSWORD, DEMO_USER_PASSWORD } =
  process.env;
if (!DATABASE_URL || !DEMO_SUPERVISOR_PASSWORD || !DEMO_USER_PASSWORD) {
  console.error(
    "DATABASE_URL, DEMO_SUPERVISOR_PASSWORD and DEMO_USER_PASSWORD must all be set in .env.demo"
  );
  process.exit(1);
}

//an unquoted # in .env starts a comment, so make sure the passwords weren't cut short
const rawLines = fs.readFileSync(envFile, "utf8").split("\n");
for (const key of ["DEMO_SUPERVISOR_PASSWORD", "DEMO_USER_PASSWORD"]) {
  const line = rawLines.find((l) => l.startsWith(`${key}=`)) || "";
  const raw = line.slice(key.length + 1).trim();
  if (raw.includes("#") && !/^["'].*["']$/.test(raw)) {
    console.error(
      `${key} contains a #, wrap the value in double quotes in .env.demo`
    );
    process.exit(1);
  }
}

const bcrypt = require("bcryptjs");
const db = require("../src/db");

async function resetDemo() {
  console.log(`Resetting demo database on ${new URL(DATABASE_URL).host}`);

  await db.migrate.latest();
  await db.seed.run();
  console.log("Seed data reloaded");

  await db("users")
    .where({ role: "supervisor" })
    .update({ password_hash: bcrypt.hashSync(DEMO_SUPERVISOR_PASSWORD, 10) });

  const updated = await db("users")
    .whereIn("role", ["patient", "clinician"])
    .update({ password_hash: bcrypt.hashSync(DEMO_USER_PASSWORD, 10) });

  console.log(`Private passwords set (supervisor + ${updated} demo users)`);
}

resetDemo()
  .catch((err) => {
    console.error("Reset failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const authenticate = require("./middleware/authenticate");
const errorHandler = require("./middleware/errorHandler");
const { wakeMlService } = require("./lib/mlClient");
const authRoutes = require("./routes/auth");
const submissionRoutes = require("./routes/submissions");
const journalRoutes = require("./routes/journal");
const patientRoutes = require("./routes/patients");

const caseRoutes = require("./routes/cases");

const supervisorRoutes = require("./routes/supervisor");

const app = express();
const PORT = process.env.PORT || 4000;

//only allow requests from the frontend, comma separate for multiple origins
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "mediq-backend" });
});

//frontend calls this on load so the database and ml service wake up before they're needed
app.get("/warmup", (req, res) => {
  db.raw("select 1").catch(() => {});
  wakeMlService();
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/journal", journalRoutes);
app.use("/api/v1/patients", patientRoutes);

app.use("/api/v1/cases", caseRoutes);

app.use("/api/v1/supervisor", supervisorRoutes);

app.get("/api/v1/conditions", authenticate, async (req, res, next) => {
  try {
    const conditions = await db("conditions").orderBy("name");
    res.json({ conditions });
  } catch (err) {
    next(err);
  }
});

//any route that doesn't exist gets the same json error shape as the rest of the api
app.use((req, res) => {
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Route not found" } });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

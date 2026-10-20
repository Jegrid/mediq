require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const authenticate = require("./middleware/authenticate");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const submissionRoutes = require("./routes/submissions");
const journalRoutes = require("./routes/journal");
const patientRoutes = require("./routes/patients");

const caseRoutes = require("./routes/cases");

const supervisorRoutes = require("./routes/supervisor");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "mediq-backend" });
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

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

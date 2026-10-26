const fetch = require("node-fetch");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_TOKEN = process.env.ML_SERVICE_TOKEN || "dev-token";

async function getPredictions({ freeText, structuredSymptoms }) {
  console.log("Sending to ML:", { freeText, structuredSymptoms });
  const response = await fetch(`${ML_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ML_TOKEN}`,
    },
    body: JSON.stringify({
      free_text: freeText,
      structured_symptoms: structuredSymptoms,
    }),
  });

  if (!response.ok) {
    const err = new Error("ML service returned an error");
    err.status = 502;
    err.code = "ML_SERVICE_ERROR";
    throw err;
  }

  return response.json();
}

//hit the health route so a sleeping ml service starts up, result doesn't matter
function wakeMlService() {
  fetch(`${ML_URL}/health`).catch(() => {});
}

module.exports = { getPredictions, wakeMlService };

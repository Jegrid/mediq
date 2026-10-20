const db = require("../db");

//selected symptoms are canonical terms (chest_pain) but the rules are phrases (chest pain)
function toPhrase(canonicalTerm) {
  return canonicalTerm.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

async function checkRedFlags(text, structuredSymptoms = []) {
  //check the text and each symptom on its own so 2 symptoms cannot combine into a false match
  const sources = [text, ...(structuredSymptoms || []).map(toPhrase)]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  if (sources.length === 0) return [];

  const rules = await db("red_flag_rules").where({ is_active: true });
  const triggered = [];

  for (const rule of rules) {
    const keyword = rule.symptom_keyword.toLowerCase();
    if (sources.some((source) => source.includes(keyword))) {
      triggered.push({
        keyword: rule.symptom_keyword,
        message: rule.message,
        severity: rule.severity,
      });
    }
  }

  return triggered;
}

module.exports = { checkRedFlags };

const db = require("../db");

async function log(
  userId,
  action,
  entityType = null,
  entityId = null,
  metadata = {}
) {
  try {
    await db("audit_log").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: JSON.stringify(metadata),
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}

module.exports = { log };

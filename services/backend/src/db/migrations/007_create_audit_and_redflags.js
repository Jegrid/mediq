exports.up = function (knex) {
  return knex.schema
    .createTable("audit_log", function (table) {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("user_id").nullable().references("id").inTable("users");
      table.string("action").notNullable();
      table.string("entity_type");
      table.string("entity_id");
      table.jsonb("metadata").defaultTo("{}");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.index("created_at");
    })
    .createTable("red_flag_rules", function (table) {
      table.increments("id").primary();
      table.string("symptom_keyword").notNullable();
      table.text("message").notNullable();
      table.enum("severity", ["urgent", "emergency"]).notNullable();
      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("red_flag_rules").dropTable("audit_log");
};

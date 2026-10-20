exports.up = function (knex) {
  return knex.schema.createTable("cases", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("submission_id")
      .notNullable()
      .references("id")
      .inTable("submissions")
      .onDelete("CASCADE");
    table
      .uuid("assigned_clinician_id")
      .nullable()
      .references("id")
      .inTable("users");
    table
      .enum("status", ["open", "in_review", "resolved", "referred"])
      .defaultTo("open");
    table.text("clinician_notes");
    table
      .enum("clinician_decision", ["confirm_ai", "override", "inconclusive"])
      .nullable();
    table
      .integer("final_condition_id")
      .nullable()
      .references("id")
      .inTable("conditions");
    table.timestamp("opened_at").defaultTo(knex.fn.now());
    table.timestamp("resolved_at").nullable();
    table.index("assigned_clinician_id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("cases");
};

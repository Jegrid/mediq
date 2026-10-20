exports.up = function (knex) {
  return knex.schema
    .createTable("submissions", function (table) {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("patient_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.text("free_text");
      table.jsonb("structured_symptoms").defaultTo("[]");
      table.timestamp("submitted_at").defaultTo(knex.fn.now());
      table
        .enum("status", ["pending", "predicted", "under_review", "resolved"])
        .defaultTo("pending");
      table.index("patient_id");
    })
    .createTable("predictions", function (table) {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("submission_id")
        .notNullable()
        .references("id")
        .inTable("submissions")
        .onDelete("CASCADE");
      table.integer("condition_id").references("id").inTable("conditions");
      table.decimal("confidence", 5, 4);
      table.integer("rank");
      table.jsonb("matched_symptoms").defaultTo("[]");
      table.string("model_version");
      table.string("explanation");
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("predictions").dropTable("submissions");
};

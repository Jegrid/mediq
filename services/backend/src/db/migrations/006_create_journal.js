exports.up = function (knex) {
  return knex.schema.createTable("journal_entries", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("patient_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.date("entry_date").notNullable();
    table.jsonb("symptoms").defaultTo("[]");
    table.text("notes");
    table.integer("mood");
    table.timestamps(true, true);
    table.index(["patient_id", "entry_date"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("journal_entries");
};

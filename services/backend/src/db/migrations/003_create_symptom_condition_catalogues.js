exports.up = function (knex) {
  return knex.schema
    .createTable("symptoms", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("canonical_term").notNullable();
      table.string("category");
      table.timestamps(true, true);
    })
    .createTable("conditions", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.text("description");
      table
        .enum("severity_tier", ["low", "moderate", "high", "critical"])
        .defaultTo("moderate");
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("conditions").dropTable("symptoms");
};

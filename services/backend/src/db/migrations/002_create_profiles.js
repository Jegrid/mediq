exports.up = function (knex) {
  return knex.schema
    .createTable("patient_profiles", function (table) {
      table
        .uuid("user_id")
        .primary()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.date("dob");
      table.string("sex");
      table.text("allergies");
      table.text("existing_conditions");
      table.text("medications");
      table.timestamps(true, true);
    })
    .createTable("clinician_profiles", function (table) {
      table
        .uuid("user_id")
        .primary()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("specialty");
      table.string("license_number");
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("clinician_profiles")
    .dropTable("patient_profiles");
};

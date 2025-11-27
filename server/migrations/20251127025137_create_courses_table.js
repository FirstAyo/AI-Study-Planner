export function up(knex) {
  return knex.schema.createTable("courses", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("name").notNullable(); // e.g. "CPSC 2600"
    table.text("curriculum").notNullable(); // pasted syllabus / topics
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable("courses");
}

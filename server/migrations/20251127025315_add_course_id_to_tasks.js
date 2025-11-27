export function up(knex) {
  return knex.schema.alterTable("tasks", (table) => {
    table
      .integer("course_id")
      .references("id")
      .inTable("courses")
      .onDelete("SET NULL");
  });
}

export function down(knex) {
  return knex.schema.alterTable("tasks", (table) => {
    table.dropColumn("course_id");
  });
}

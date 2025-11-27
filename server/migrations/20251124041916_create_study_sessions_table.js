export function up(knex) {
  return knex.schema.createTable("study_sessions", (table) => {
    table.increments("id").primary();
    table.integer("user_id").references("id").inTable("users");
    table.integer("task_id").references("id").inTable("tasks");
    table.integer("duration_minutes"); // how long did they study
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable("study_sessions");
}

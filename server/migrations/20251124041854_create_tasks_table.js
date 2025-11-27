export function up(knex) {
  return knex.schema.createTable("tasks", (table) => {
    table.increments("id").primary();
    table.integer("user_id").references("id").inTable("users");
    table.string("title").notNullable();
    table.text("description");
    table.timestamp("due_date");
    table.boolean("completed").defaultTo(false);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable("tasks");
}

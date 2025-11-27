// 20251124062956_add_status_to_tasks.js

export function up(knex) {
  return knex.schema.alterTable("tasks", function (table) {
    table.string("status").defaultTo("backlog"); // "today" | "backlog" | "done"
  });
}

export function down(knex) {
  return knex.schema.alterTable("tasks", function (table) {
    table.dropColumn("status");
  });
}

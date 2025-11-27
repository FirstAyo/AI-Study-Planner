import { db } from "../config/db.js";

/* Creates simple tables if they don't exist (for demo). */
export async function ensureSchema() {
  const hasUsers = await db.schema.hasTable("users");
  if (!hasUsers) {
    await db.schema.createTable("users", (t) => {
      t.increments("id").primary();
      t.string("email").unique().notNullable();
      t.string("password").notNullable(); // store hashed in real apps
      t.timestamps(true, true);
    });
  }

  const hasTasks = await db.schema.hasTable("tasks");
  if (!hasTasks) {
    await db.schema.createTable("tasks", (t) => {
      t.increments("id").primary();
      t.integer("user_id").references("users.id");
      t.string("title").notNullable();
      t.string("subject").defaultTo("");
      t.string("type").defaultTo("Study");
      t.integer("estimate").defaultTo(50);
      t.string("priority").defaultTo("Medium");
      t.string("status").defaultTo("backlog"); // today | backlog | done
      t.timestamps(true, true);
    });
  }
}

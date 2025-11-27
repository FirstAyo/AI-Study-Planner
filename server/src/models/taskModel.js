import { db } from "../config/db.js";

export const Task = {
  async create(userId, data) {
    const row = { user_id: userId, ...data };
    const [id] = await db("tasks").insert(row);
    return { id, ...row };
  },
  async listByUser(userId) {
    const rows = await db("tasks")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");
    return rows;
  },
  async move(id, status) {
    return db("tasks").where({ id }).update({ status });
  },
  async complete(id) {
    return db("tasks").where({ id }).update({ status: "done" });
  },
};

import { db } from "../config/db.js";

export const User = {
  async create({ email, password }) {
    // hash in real app
    const [id] = await db("users").insert({ email, password });
    return { id, email };
  },
  async findByEmail(email) {
    return db("users").where({ email }).first();
  },
};

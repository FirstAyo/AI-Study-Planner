import { Task } from "../models/taskModel.js";

export const TaskController = {
  async all(req, res) {
    const userId = 1; // demo user
    const rows = await Task.listByUser(userId);
    const today = rows.filter((r) => r.status === "today");
    const backlog = rows.filter((r) => r.status === "backlog");
    const done = rows.filter((r) => r.status === "done");
    res.json({ today, backlog, done });
  },
  async create(req, res) {
    const userId = 1; // demo user (add auth later)
    const task = await Task.create(userId, req.body);
    res.status(201).json(task);
  },
  async move(req, res) {
    const { id, to } = req.body;
    await Task.move(id, to);
    res.json({ ok: true });
  },
  async complete(req, res) {
    const { id } = req.body;
    await Task.complete(id);
    res.json({ ok: true });
  },
};

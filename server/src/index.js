import express from "express";
import authMiddleware from "./authMiddleware.js";
import OpenAI from "openai";
import cors from "cors";
import "dotenv/config.js";
import db from "./config/db.js";
import {
  createUser,
  findUserByEmail,
  checkPassword,
  createToken,
} from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json());

// Simple DB test route
app.get("/db-test", async (req, res) => {
  try {
    const result = await db.raw("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ------------ AUTH ROUTES ------------

// POST /auth/signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    // Create user
    const newUser = await createUser(name || "", email, password);

    // Create token
    const token = createToken(newUser);

    res.status(201).json({
      message: "User created successfully.",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Check password
    const isValid = await checkPassword(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Create token
    const token = createToken(user);

    // Remove password from response
    const { password: _, ...safeUser } = user;

    res.json({
      message: "Login successful.",
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// -------- TASK ROUTES (PROTECTED) --------

// GET /tasks - get all tasks for the logged-in user
app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await db("tasks")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");

    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

// POST /tasks - create a new task for the logged-in user
app.post("/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, due_date, status, course_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required." });
    }

    const [newTask] = await db("tasks")
      .insert({
        user_id: userId,
        title,
        description: description || "",
        due_date: due_date || null,
        status: status || "backlog",
        course_id: course_id || null,
      })
      .returning([
        "id",
        "user_id",
        "title",
        "description",
        "due_date",
        "status",
        "course_id",
        "completed",
        "created_at",
        "updated_at",
      ]);

    res.status(201).json(newTask);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Failed to create task." });
  }
});

// GET /stats/summary - simple stats for the logged-in user
app.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Total minutes + total sessions
    const totals = await db("study_sessions")
      .where({ user_id: userId })
      .sum("duration_minutes as total_minutes")
      .count("* as total_sessions")
      .first();

    // Task counts
    const totalTasksRow = await db("tasks")
      .where({ user_id: userId })
      .count("* as total_tasks")
      .first();

    const completedTasksRow = await db("tasks")
      .where({ user_id: userId, completed: true })
      .count("* as completed_tasks")
      .first();

    const totalMinutes = Number(totals.total_minutes) || 0;
    const totalSessions = Number(totals.total_sessions) || 0;
    const totalTasks = Number(totalTasksRow.total_tasks) || 0;
    const completedTasks = Number(completedTasksRow.completed_tasks) || 0;

    res.json({
      totalMinutes,
      totalSessions,
      totalTasks,
      completedTasks,
    });
  } catch (err) {
    console.error("Stats summary error:", err);
    res.status(500).json({ error: "Failed to load stats." });
  }
});

// PUT /tasks/:id - update a task (only if it belongs to the logged-in user)
app.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, due_date, completed, status } = req.body;

    const existingTask = await db("tasks")
      .where({ id: taskId, user_id: userId })
      .first();

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    const [updatedTask] = await db("tasks")
      .where({ id: taskId })
      .update({
        title: title ?? existingTask.title,
        description: description ?? existingTask.description,
        due_date: due_date ?? existingTask.due_date,
        completed:
          typeof completed === "boolean" ? completed : existingTask.completed,
        status: status ?? existingTask.status,
        updated_at: db.fn.now(),
      })
      .returning([
        "id",
        "user_id",
        "title",
        "description",
        "due_date",
        "status",
        "completed",
        "created_at",
        "updated_at",
      ]);

    res.json(updatedTask);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Failed to update task." });
  }
});

// DELETE /tasks/:id - delete a task (only if it belongs to the logged-in user)
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    // Check if the task belongs to this user
    const existingTask = await db("tasks")
      .where({ id: taskId, user_id: userId })
      .first();

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    await db("tasks").where({ id: taskId }).del();

    res.json({ message: "Task deleted successfully." });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Failed to delete task." });
  }
});

// =============== COURSES ROUTES =============== //

// GET /courses - list this user's courses (max 3)
app.get("/courses", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await db("courses")
      .where({ user_id: userId })
      .orderBy("created_at", "asc");

    res.json(courses);
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ error: "Failed to load courses." });
  }
});

// POST /courses - create a course (max 3 per user. trying to simulate three full time course for students in Langara)
app.post("/courses", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, curriculum } = req.body;

    if (!name || !curriculum) {
      return res
        .status(400)
        .json({ error: "Name and curriculum are required." });
    }

    const countRow = await db("courses")
      .where({ user_id: userId })
      .count("* as count")
      .first();

    const count = Number(countRow.count) || 0;

    if (count >= 3) {
      return res
        .status(400)
        .json({ error: "You can only have up to 3 courses." });
    }

    const [course] = await db("courses")
      .insert({
        user_id: userId,
        name,
        curriculum,
      })
      .returning(["id", "name", "curriculum", "created_at", "updated_at"]);

    res.status(201).json(course);
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ error: "Failed to create course." });
  }
});

// =============== STUDY SESSIONS ROUTES =============== //

// POST /sessions - log a study session for a task
app.post("/sessions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { task_id, duration_minutes } = req.body;

    if (!task_id || !duration_minutes) {
      return res
        .status(400)
        .json({ error: "task_id and duration_minutes are required." });
    }

    // Make sure the task belongs to this user
    const task = await db("tasks")
      .where({ id: task_id, user_id: userId })
      .first();

    if (!task) {
      return res.status(404).json({ error: "Task not found for this user." });
    }

    const [session] = await db("study_sessions")
      .insert({
        user_id: userId,
        task_id,
        duration_minutes,
      })
      .returning([
        "id",
        "user_id",
        "task_id",
        "duration_minutes",
        "created_at",
      ]);

    res.status(201).json(session);
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ error: "Failed to create study session." });
  }
});

// ================= AI ASSISTANT ROUTE =================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure you set this in .env
});

app.post("/assistant", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    // 1. Load user's tasks + their course names (if any)
    const tasks = await db("tasks")
      .leftJoin("courses", "tasks.course_id", "courses.id")
      .where("tasks.user_id", userId)
      .select(
        "tasks.id",
        "tasks.title",
        "tasks.description",
        "tasks.status",
        "tasks.completed",
        "courses.name as course_name"
      )
      .orderBy("tasks.created_at", "desc");

    // 2. Load user's courses + curriculum
    const courses = await db("courses")
      .where({ user_id: userId })
      .select("id", "name", "curriculum")
      .orderBy("created_at", "asc");

    // 3. Build simple text summaries for the prompt
    const tasksSummary =
      tasks.length === 0
        ? "No tasks yet."
        : tasks
            .map((t) => {
              const course = t.course_name || "General";
              const status = t.completed ? "done" : t.status || "unscheduled";
              return `- [${course}] ${t.title} (${status})`;
            })
            .join("\n");

    const coursesSummary =
      courses.length === 0
        ? "No courses defined yet."
        : courses
            .map(
              (c) =>
                `Course: ${c.name}\nCurriculum:\n${c.curriculum
                  .slice(0, 800)
                  .trim()}`
            )
            .join("\n\n");

    const prompt = `
The user is a college student using a study planner app.

User message:
"${message}"

Here are their courses and curricula:
${coursesSummary}

Here are their current tasks:
${tasksSummary}

Using this information, create a short, practical study plan.
- Use bullet points.
- Break time into small blocks (10–20 minutes each).
- Mention which course and topic to focus on.
- Prefer tasks and topics that match the user's message.
- Keep it under about 10 bullets.
`;

    // 4. Ask OpenAI for a plan
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // small and cheap; adjust if needed
      messages: [
        {
          role: "system",
          content:
            "You are a helpful study assistant. Keep plans clear and encouraging.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 350,
    });

    const aiText = response.choices[0]?.message?.content || "";

    if (!aiText) {
      return res
        .status(500)
        .json({ error: "Assistant did not return a response." });
    }

    res.json({ reply: aiText });
  } catch (err) {
    console.error("AI Assistant error:", err);
    res.status(500).json({ error: "Assistant failed." });
  }
});

// =============== START SERVER =============== //

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

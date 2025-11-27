const API_URL = "http://localhost:3000"; // backend server

function getToken() {
  return localStorage.getItem("token");
}

// ---------- AUTH ----------

export async function apiLogin(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    return data; // { message, user, token } OR { error }
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Network error. Please try again." };
  }
}

export async function apiSignup(name, email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Signup error:", err);
    return { error: "Network error. Please try again." };
  }
}

// ---------- TASKS ----------

export async function getTasks() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Get tasks failed:", res.status);
      return null;
    }

    const tasks = await res.json();

    const today = tasks.filter((t) => t.status === "today" && !t.completed);
    const backlog = tasks.filter(
      (t) => (t.status === "backlog" || !t.status) && !t.completed
    );
    const done = tasks.filter((t) => t.completed || t.status === "done");

    return { today, backlog, done };
  } catch (err) {
    console.error("Get tasks error:", err);
    return null;
  }
}

export async function createTask(task) {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: task.title,
        description: task.subject || task.description || "",
        status: task.status,
        course_id: task.course_id || null,
        due_date: task.due_date || null,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Create task error:", err);
    return null;
  }
}

export async function moveTask(id, newStatus) {
  // For now this is mostly handled in the frontend state.
  // You can later update backend to store a "status" field.
  console.log("moveTask called for id:", id, "to", newStatus);
  return true;
}

export async function completeTask(id) {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        completed: true,
        status: "done",
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Complete task error:", err);
    return null;
  }
}

export async function deleteTask(id) {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return data; // { message: "Task deleted successfully." } or { error }
  } catch (err) {
    console.error("Delete task error:", err);
    return null;
  }
}

export async function logStudySession(taskId, minutes) {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        task_id: taskId,
        duration_minutes: minutes,
      }),
    });

    const data = await res.json();
    return data; // new session or { error }
  } catch (err) {
    console.error("Log study session error:", err);
    return null;
  }
}

export async function getStatsSummary() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/stats/summary`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Stats summary failed:", res.status);
      return null;
    }

    const data = await res.json();
    return data; // { totalMinutes, totalSessions, totalTasks, completedTasks }
  } catch (err) {
    console.error("Get stats summary error:", err);
    return null;
  }
}

export async function askAssistant(message) {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      reply: null,
      error: "You are not logged in.",
    };
  }

  try {
    const res = await fetch("http://localhost:3000/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    // Try to read JSON even if it's an error
    const data = await res.json().catch(() => ({}));

    // If the server responded with an error status (4xx / 5xx)
    if (!res.ok) {
      // Special case: insufficient quota from OpenAI
      if (data.reason === "insufficient_quota") {
        return {
          reply: null,
          error:
            "AI is temporarily unavailable (quota issue). Please try again later.",
          reason: data.reason,
        };
      }

      // Generic API error
      return {
        reply: null,
        error: data.error || "Something went wrong talking to the assistant.",
        reason: data.reason,
      };
    }

    // Success
    return {
      reply: data.reply ?? null,
      error: null,
    };
  } catch (err) {
    console.error("Assistant error:", err);
    return {
      reply: null,
      error: "Network error talking to the assistant.",
    };
  }
}

export async function getCourses() {
  const token = getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_URL}/courses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Get courses failed:", res.status);
      return [];
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Get courses error:", err);
    return [];
  }
}

export async function createCourse(name, curriculum) {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  try {
    const res = await fetch(`${API_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, curriculum }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Create course error:", err);
    return { error: "Network error" };
  }
}

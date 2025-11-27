import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import AddTaskModal from "./components/AddTaskModal.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Schedule from "./pages/Schedule.jsx";
import AIAssistant from "./pages/AIAssistant.jsx";
import Analytics from "./pages/Analytics.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Courses from "./pages/Courses.jsx";

import {
  getTasks,
  createTask,
  moveTask,
  completeTask as apiComplete,
  getCourses,
} from "./services/api.js";

export default function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem("token"));
  const [modalOpen, setModalOpen] = useState(false);

  const [today, setToday] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [done, setDone] = useState([]);

  const [courses, setCourses] = useState([]);

  // Load from backend (falls back to localStorage if backend not running)
  useEffect(() => {
    if (!authed) return; // only load if logged in

    getTasks().then((data) => {
      if (data) {
        setToday(data.today || []);
        setBacklog(data.backlog || []);
        setDone(data.done || []);
      } else {
        // fallback to localStorage if backend fails
        setToday(JSON.parse(localStorage.getItem("tasks_today") || "[]"));
        setBacklog(JSON.parse(localStorage.getItem("tasks_backlog") || "[]"));
        setDone(JSON.parse(localStorage.getItem("tasks_done") || "[]"));
      }
    });
  }, [authed]);

  useEffect(() => {
    if (!authed) return;

    getCourses().then((data) => {
      setCourses(data || []);
    });
  }, [authed]);

  // Save to localStorage for demo (keeps UI working without server)
  useEffect(
    () => localStorage.setItem("tasks_today", JSON.stringify(today)),
    [today]
  );
  useEffect(
    () => localStorage.setItem("tasks_backlog", JSON.stringify(backlog)),
    [backlog]
  );
  useEffect(
    () => localStorage.setItem("tasks_done", JSON.stringify(done)),
    [done]
  );

  const handleAdd = async (taskInput) => {
    // 1. Call backend to create task in DB
    const created = await createTask(taskInput);

    if (!created || created.error) {
      console.error("Failed to create task:", created?.error);
      //  show an alert if creation fails:
      alert(created?.error || "Failed to create task");
      return;
    }

    // 2. Build the task object for the UI using the DB id
    const uiTask = {
      ...taskInput, // title, subject, type, estimate, priority, status
      id: created.id, // real id from database
      completed: created.completed, // usually false
    };

    // 3. Put it into the correct list
    if (taskInput.status === "today") {
      setToday([uiTask, ...today]);
    } else {
      // "backlog"
      setBacklog([uiTask, ...backlog]);
    }
  };

  const moveToToday = async (id) => {
    const t = backlog.find((x) => x.id === id);
    if (!t) return;
    setBacklog(backlog.filter((x) => x.id !== id));
    setToday([t, ...today]);
    moveTask(id, "today");
  };

  const completeTask = async (id) => {
    const t = today.find((x) => x.id === id);
    if (!t) return;
    setToday(today.filter((x) => x.id !== id));
    setDone([t, ...done]);
    apiComplete(id);
  };

  const deleteTask = async (id) => {
    // 1. Update UI state immediately
    setToday(today.filter((t) => t.id !== id));
    setBacklog(backlog.filter((t) => t.id !== id));
    setDone(done.filter((t) => t.id !== id));

    // 2. Tell backend to delete
    const result = await apiDelete(id);
    if (result && result.error) {
      console.error("Failed to delete on server:", result.error);
      // Optional: show an alert or reload tasks from server
    }
  };

  const Shell = ({ children }) => (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto flex">
        <Sidebar />
        <main className="flex-1">
          <Header
            onOpenModal={() => setModalOpen(true)}
            onLogout={() => {
              localStorage.removeItem("token");
              setAuthed(false);
            }}
          />
          {children}
        </main>
      </div>
      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        courses={courses}
      />
    </div>
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login
            onLogin={(data) => {
              // data = { user, token, message }
              localStorage.setItem("token", data.token);
              localStorage.setItem("user", JSON.stringify(data.user));
              setAuthed(true);
            }}
          />
        }
      />

      <Route
        path="/signup"
        element={
          <Signup
            onSignup={(data) => {
              localStorage.setItem("token", data.token);
              localStorage.setItem("user", JSON.stringify(data.user));
              setAuthed(true);
            }}
          />
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute authed={authed}>
            <Shell>
              <Dashboard
                todayCount={today.length}
                backlogCount={backlog.length}
              />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute authed={authed}>
            <Shell>
              <Schedule
                today={today}
                backlog={backlog}
                moveToToday={moveToToday}
                completeTask={completeTask}
                deleteTask={deleteTask}
              />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assistant"
        element={
          <ProtectedRoute authed={authed}>
            <Shell>
              <AIAssistant />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute authed={authed}>
            <Shell>
              <Analytics done={done} />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute authed={authed}>
            <Shell>
              <Courses courses={courses} setCourses={setCourses} />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={authed ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

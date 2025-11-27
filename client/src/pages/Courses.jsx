import { useState } from "react";
import { createCourse } from "../services/api.js";

export default function Courses({ courses, setCourses }) {
  const [name, setName] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const canCreateMore = courses.length < 3;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim() || !curriculum.trim()) {
      setError("Please enter a course name and curriculum.");
      return;
    }

    if (!canCreateMore) {
      setError("You can only have up to 3 courses.");
      return;
    }

    setLoading(true);
    const result = await createCourse(name, curriculum);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // result is the new course from the backend
    setCourses([...courses, result]);
    setName("");
    setCurriculum("");
    setMessage("Course added!");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Courses</h1>
      <p className="text-sm text-zinc-500">
        You can add up to 3 courses and paste each course curriculum. When you
        create tasks, you&apos;ll be able to link them to a course. The AI
        planner can then use this information to build study plans.
      </p>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      {/* Existing courses */}
      <div>
        <h2 className="font-semibold mb-2">Your courses</h2>
        {courses.length === 0 && (
          <p className="text-sm text-zinc-500">
            You don&apos;t have any courses yet. Add one below.
          </p>
        )}

        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-md p-3 bg-white dark:bg-zinc-900 dark:border-zinc-800"
            >
              <p className="font-medium">{course.name}</p>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                {course.curriculum}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add new course */}
      <div className="border rounded-lg p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="font-semibold mb-3">Add a course</h2>

        {!canCreateMore && (
          <p className="text-sm text-zinc-500 mb-2">
            You already have 3 courses. You can&apos;t add more.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Course name</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="e.g. CPSC 2600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canCreateMore || loading}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Course curriculum</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm h-32 dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="Paste syllabus, topics, weekly outline, etc."
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              disabled={!canCreateMore || loading}
            />
          </div>

          <button
            type="submit"
            disabled={!canCreateMore || loading}
            className="px-4 py-2 rounded-md bg-zinc-900 text-white text-sm disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save course"}
          </button>
        </form>
      </div>
    </div>
  );
}

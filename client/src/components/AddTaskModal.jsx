import { useEffect, useState } from "react";
export default function AddTaskModal({ open, onClose, onAdd, courses }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("Study");
  const [estimate, setEstimate] = useState(50);
  const [priority, setPriority] = useState("Medium");
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setSubject("");
      setType("Study");
      setEstimate(50);
      setPriority("Medium");
      setAutoSchedule(true);
      setCourseId("");
      setDueDate("");
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Create Task</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="grid gap-3">
          <input
            className="border rounded-md px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border rounded-md px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <select
            className="border rounded-md px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">No course / General</option>
            {courses &&
              courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
          <div className="">
            <label className="block text-sm mb-1">Due date</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 text-sm w-full"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border rounded-md px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Study</option>
              <option>Assignment</option>
              <option>Revision</option>
              <option>Practice Test</option>
            </select>
            <select
              className="border rounded-md px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="20"
              className="border rounded-md px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
              value={estimate}
              onChange={(e) => setEstimate(Number(e.target.value))}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoSchedule}
                onChange={(e) => setAutoSchedule(e.target.checked)}
              />
              Auto-schedule (demo)
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-2 rounded-md border">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!title.trim()) return;
              onAdd({
                title,
                subject,
                type,
                estimate,
                priority,
                status: autoSchedule ? "today" : "backlog",
                course_id: courseId ? Number(courseId) : null,
                due_date: dueDate || null,
              });
              onClose();
            }}
            className="px-3 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

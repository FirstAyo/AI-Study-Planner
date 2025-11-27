import { useEffect, useState } from "react";
import { getStatsSummary, logStudySession } from "../services/api.js";

export default function Analytics({ done }) {
  const [summary, setSummary] = useState({
    totalMinutes: 0,
    totalSessions: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSummary() {
    setLoading(true);
    setError("");

    const data = await getStatsSummary();

    if (!data || data.error) {
      setError(data?.error || "Could not load stats from server.");
      setLoading(false);
      return;
    }

    setSummary(data);
    setLoading(false);
  }

  useEffect(() => {
    loadSummary();
  }, []);

  async function handleLogMinutes(taskId, minutes) {
    const result = await logStudySession(taskId, minutes);
    if (!result || result.error) {
      console.error("Failed to log session:", result?.error);
      setError(result?.error || "Failed to log study session.");
      return;
    }

    // Refresh summary after logging
    loadSummary();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Analytics</h1>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total study minutes" value={summary.totalMinutes} />
        <StatCard label="Study sessions logged" value={summary.totalSessions} />
        <StatCard label="Total tasks" value={summary.totalTasks} />
        <StatCard label="Completed tasks" value={summary.completedTasks} />
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2 text-lg">
          Completed tasks – log study time
        </h2>
        {done.length === 0 && (
          <p className="text-sm text-zinc-500">
            No completed tasks yet. Finish a task on the Schedule page and it
            will appear here.
          </p>
        )}

        <div className="space-y-2">
          {done.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                {task.subject && (
                  <p className="text-xs text-zinc-500">{task.subject}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 rounded-md border text-xs"
                  onClick={() => handleLogMinutes(task.id, 30)}
                >
                  Log 30 min
                </button>
                <button
                  className="px-2 py-1 rounded-md border text-xs"
                  onClick={() => handleLogMinutes(task.id, 60)}
                >
                  Log 60 min
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border rounded-lg p-3 bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

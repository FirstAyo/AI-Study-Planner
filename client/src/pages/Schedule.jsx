export default function Schedule({
  today = [],
  backlog = [],
  moveToToday,
  completeTask,
  deleteTask,
}) {
  // helper to format dates safely
  function formatDate(value) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Schedule</h2>
          <p className="text-sm text-zinc-500">
            Plan what you&apos;re doing today and what stays in your backlog.
            Due dates and overdue tasks are highlighted.
          </p>
        </div>
        <div className="flex gap-3 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Today: {today.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            Backlog: {backlog.length}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today column */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Today
            </h3>
            <p className="text-xs text-zinc-500">
              Focus tasks for this session.
            </p>
          </div>

          {today.length === 0 ? (
            <div className="text-sm text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-center">
              No tasks today yet. Move something from Backlog to get started.
            </div>
          ) : (
            <ul className="space-y-2">
              {today.map((t) => {
                const formatted = formatDate(t.due_date);
                const isOverdue =
                  formatted &&
                  !t.completed &&
                  new Date(t.due_date) < new Date();

                return (
                  <li
                    key={t.id}
                    className={
                      "p-3 rounded-xl border flex items-start justify-between gap-3 bg-zinc-50 dark:bg-zinc-900" +
                      (isOverdue
                        ? " border-red-400"
                        : " border-zinc-200 dark:border-zinc-700")
                    }
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {t.title}
                        {isOverdue && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {t.subject && <span>{t.subject} • </span>}
                        {t.type && <span>{t.type} • </span>}
                        {typeof t.estimate === "number" && (
                          <span>{t.estimate}m</span>
                        )}
                      </div>
                      {formatted && (
                        <div className="text-xs mt-1">
                          <span
                            className={
                              "font-medium " +
                              (isOverdue ? "text-red-600" : "text-zinc-500")
                            }
                          >
                            Due {formatted}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        className="text-xs px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        onClick={() => completeTask(t.id)}
                      >
                        Mark done
                      </button>
                      <button
                        className="text-[11px] text-red-500 hover:text-red-600"
                        onClick={() => deleteTask(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Backlog column */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Backlog
            </h3>
            <p className="text-xs text-zinc-500">
              Tasks you&apos;ll schedule into Today later.
            </p>
          </div>

          {backlog.length === 0 ? (
            <div className="text-sm text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-center">
              Backlog empty. Add tasks from the + button or AI Assistant.
            </div>
          ) : (
            <ul className="space-y-2">
              {backlog.map((t) => {
                const formatted = formatDate(t.due_date);
                const isOverdue =
                  formatted &&
                  !t.completed &&
                  new Date(t.due_date) < new Date();

                return (
                  <li
                    key={t.id}
                    className={
                      "p-3 rounded-xl border flex items-start justify-between gap-3 bg-zinc-50 dark:bg-zinc-900" +
                      (isOverdue
                        ? " border-red-300"
                        : " border-zinc-200 dark:border-zinc-700")
                    }
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {t.title}
                        {isOverdue && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {t.subject && <span>{t.subject} • </span>}
                        {t.type && <span>{t.type} • </span>}
                        {typeof t.estimate === "number" && (
                          <span>{t.estimate}m</span>
                        )}
                      </div>
                      {formatted && (
                        <div className="text-xs mt-1">
                          <span
                            className={
                              "font-medium " +
                              (isOverdue ? "text-red-600" : "text-zinc-500")
                            }
                          >
                            Due {formatted}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        className="text-xs px-3 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        onClick={() => moveToToday(t.id)}
                      >
                        Move to Today
                      </button>
                      <button
                        className="text-[11px] text-red-500 hover:text-red-600"
                        onClick={() => deleteTask(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
